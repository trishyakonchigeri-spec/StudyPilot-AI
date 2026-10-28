import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==========================================
// POST
// Save Quiz Result
// ==========================================

export async function POST(request: Request) {
  try {
    // Get logged-in user ID from cookie
    const cookieHeader =
      request.headers.get("cookie");

    const userIdCookie =
      cookieHeader
        ?.split(";")
        .find((cookie) =>
          cookie
            .trim()
            .startsWith(
              "studypilot_user="
            )
        );

    // Check if user is logged in
    if (!userIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    // Get user ID from cookie
    const userId = Number(
      userIdCookie
        .split("=")[1]
    );

    // Validate user ID
    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user",
        },
        {
          status: 401,
        }
      );
    }

    // Read request body
    const body =
      await request.json();

    const {
      subject,
      score,
      total,
    } = body;

    // Validate quiz data
    if (
      !subject ||
      score === undefined ||
      !total
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject, score and total are required",
        },
        {
          status: 400,
        }
      );
    }

    // Convert values to numbers
    const numericScore =
      Number(score);

    const numericTotal =
      Number(total);

    // Validate numbers
    if (
      Number.isNaN(
        numericScore
      ) ||
      Number.isNaN(
        numericTotal
      ) ||
      numericTotal <= 0 ||
      numericScore < 0 ||
      numericScore > numericTotal
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid score or total",
        },
        {
          status: 400,
        }
      );
    }

    // Calculate percentage
    const percentage =
      (numericScore /
        numericTotal) *
      100;

    // Save quiz result
    const quizResult =
      await prisma.quizResult.create(
        {
          data: {
            userId,

            subject,

            score:
              numericScore,

            total:
              numericTotal,

            percentage,
          },
        }
      );

    // Return success response
    return NextResponse.json(
      {
        success: true,

        message:
          "Quiz result saved successfully",

        result:
          quizResult,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "QUIZ RESULT POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save quiz result",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// GET
// Get Logged-in User's Quiz History
// ==========================================

export async function GET(
  request: Request
) {
  try {
    // Get logged-in user ID from cookie
    const cookieHeader =
      request.headers.get("cookie");

    const userIdCookie =
      cookieHeader
        ?.split(";")
        .find((cookie) =>
          cookie
            .trim()
            .startsWith(
              "studypilot_user="
            )
        );

    // Check if user is logged in
    if (!userIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    // Get user ID from cookie
    const userId = Number(
      userIdCookie
        .split("=")[1]
    );

    // Validate user ID
    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user",
        },
        {
          status: 401,
        }
      );
    }

    // Get quiz results
    // belonging only to this user
    const results =
      await prisma.quizResult.findMany(
        {
          where: {
            userId:
              userId,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        }
      );

    // Return quiz history
    return NextResponse.json(
      {
        success: true,

        results:
          results,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "QUIZ RESULT GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch quiz history",
      },
      {
        status: 500,
      }
    );
  }
}