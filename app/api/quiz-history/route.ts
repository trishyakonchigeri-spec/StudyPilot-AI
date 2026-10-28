import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ==============================================
// GET LOGGED-IN USER ID
// ==============================================

function getUserIdFromRequest(
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
        cookie.startsWith("studypilot_user=")
      );

  if (!userCookie) {
    return null;
  }

  const userId =
    Number(
      userCookie.substring(
        "studypilot_user=".length
      )
    );

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
}

// ==============================================
// GET QUIZ HISTORY
// ==============================================

export async function GET(
  request: Request
) {
  try {
    // ------------------------------------------
    // 1. GET LOGGED-IN USER
    // ------------------------------------------

    const userId =
      getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Please log in.",
        },
        {
          status: 401,
        }
      );
    }

    // ------------------------------------------
    // 2. VERIFY USER EXISTS
    // ------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user.",
        },
        {
          status: 401,
        }
      );
    }

    // ------------------------------------------
    // 3. GET ONLY THIS USER'S QUIZ RESULTS
    // ------------------------------------------

    const results =
      await prisma.quizResult.findMany({
        where: {
          userId: user.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ------------------------------------------
    // 4. CALCULATE USER'S PROGRESS
    // ------------------------------------------

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
        ? Math.round(
            Math.max(
              ...results.map(
                (result) =>
                  result.percentage
              )
            )
          )
        : 0;

    // ------------------------------------------
    // 5. RETURN ONLY USER DATA
    // ------------------------------------------

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
      "GET QUIZ HISTORY ERROR:",
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