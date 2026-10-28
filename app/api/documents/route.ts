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
// GET USER DOCUMENTS
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

    console.log(
      "GET DOCUMENTS FOR USER:",
      userId
    );

    // ----------------------------------------------
    // VERIFY USER EXISTS
    // ----------------------------------------------

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
            "Invalid user session.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // GET ONLY USER'S DOCUMENTS
    // ----------------------------------------------

    const documents =
      await prisma.document.findMany({
        where: {
          userId: user.id,
        },

        select: {
          id: true,
          fileName: true,
          createdAt: true,
        },

        orderBy: {
          id: "desc",
        },
      });

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        documents,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "GET DOCUMENTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load documents.",
      },
      {
        status: 500,
      }
    );
  }
}