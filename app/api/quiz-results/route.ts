import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ======================================================
// GET LOGGED-IN USER FROM COOKIE
// ======================================================

function getUserIdFromCookie(
  request: Request
): number | null {
  const cookieHeader =
    request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const userCookie =
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) =>
        cookie.startsWith(
          "studypilot_user="
        )
      );

  if (!userCookie) {
    return null;
  }

  const userIdValue =
    userCookie.substring(
      "studypilot_user=".length
    );

  const userId =
    Number(userIdValue);

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
}

// ======================================================
// VERIFY USER EXISTS
// ======================================================

async function verifyUser(
  userId: number
): Promise<boolean> {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

  return !!user;
}

// ======================================================
// GET QUIZ HISTORY
// ======================================================

export async function GET(
  request: Request
) {
  try {
    // ----------------------------------------------
    // GET AUTHENTICATED USER
    // ----------------------------------------------

    const userId =
      getUserIdFromCookie(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // VERIFY USER
    // ----------------------------------------------

    const validUser =
      await verifyUser(userId);

    if (!validUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user session.",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "GET QUIZ RESULTS FOR USER:",
      userId
    );

    // ----------------------------------------------
    // GET ONLY THIS USER'S RESULTS
    // ----------------------------------------------

    const results =
      await prisma.quizResult.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ----------------------------------------------
    // CALCULATE PROGRESS
    // ----------------------------------------------

    const totalQuizzes =
      results.length;

    const averageScore =
      totalQuizzes > 0
        ? Math.round(
            results.reduce(
              (sum, result) =>
                sum + result.percentage,
              0
            ) / totalQuizzes
          )
        : 0;

    const bestScore =
      totalQuizzes > 0
        ? Math.max(
            ...results.map(
              (result) =>
                result.percentage
            )
          )
        : 0;

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        results,

        progress: {
          totalQuizzes,
          averageScore,
          bestScore,
        },
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "GET QUIZ RESULTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load quiz history.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST SAVE QUIZ RESULT
// ======================================================

export async function POST(
  request: Request
) {
  try {
    console.log(
      "================================="
    );

    console.log(
      "QUIZ RESULT POST RECEIVED"
    );

    // ----------------------------------------------
    // GET AUTHENTICATED USER
    // ----------------------------------------------

    const userId =
      getUserIdFromCookie(request);

    if (!userId) {
      console.log(
        "NO LOGGED-IN USER FOUND"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // VERIFY USER
    // ----------------------------------------------

    const validUser =
      await verifyUser(userId);

    if (!validUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user session.",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "SAVING RESULT FOR USER:",
      userId
    );

    // ----------------------------------------------
    // READ REQUEST BODY
    // ----------------------------------------------

    const body =
      await request.json();

    console.log(
      "QUIZ RESULT BODY:",
      body
    );

    // IMPORTANT:
    // body.userId is deliberately ignored.
    //
    // The authenticated user always comes
    // from the HTTP-only cookie.

    const subject =
      String(
        body.subject || ""
      ).trim();

    const score =
      Number(body.score);

    const total =
      Number(body.total);

    const percentage =
      Number(body.percentage);

    // ----------------------------------------------
    // VALIDATE SUBJECT
    // ----------------------------------------------

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // VALIDATE NUMBERS
    // ----------------------------------------------

    if (
      !Number.isFinite(score) ||
      !Number.isFinite(total) ||
      !Number.isFinite(percentage)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid quiz score data.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // VALIDATE SCORE
    // ----------------------------------------------

    if (
      !Number.isInteger(score) ||
      !Number.isInteger(total) ||
      score < 0 ||
      total <= 0 ||
      score > total ||
      percentage < 0 ||
      percentage > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid quiz result.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // SAVE RESULT
    // ----------------------------------------------

    const quizResult =
      await prisma.quizResult.create({
        data: {
          // NEVER use body.userId here.
          userId,

          subject,

          score,

          total,

          percentage,
        },
      });

    console.log(
      "QUIZ RESULT SAVED:",
      quizResult.id
    );

    console.log(
      "SAVED FOR USER:",
      quizResult.userId
    );

    console.log(
      "================================="
    );

    // ----------------------------------------------
    // SUCCESS
    // ----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Quiz result saved successfully.",

        result: quizResult,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "SAVE QUIZ RESULT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save quiz result.",
      },
      {
        status: 500,
      }
    );
  }
}