import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    // ==========================================
    // 1. GET LOGGED-IN USER FROM COOKIE
    // ==========================================

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

    // ==========================================
    // 2. CHECK LOGIN
    // ==========================================

    if (!userIdCookie) {
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

    // ==========================================
    // 3. GET USER ID
    // ==========================================

    const userId = Number(
      userIdCookie
        .trim()
        .split("=")[1]
    );

    // ==========================================
    // 4. VALIDATE USER ID
    // ==========================================

    if (
      !userId ||
      Number.isNaN(userId)
    ) {
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

    // ==========================================
    // 5. GET DOCUMENT ID FROM URL
    // ==========================================

    const { id } = await context.params;

    const documentId = Number(id);

    // ==========================================
    // 6. VALIDATE DOCUMENT ID
    // ==========================================

    if (
      !documentId ||
      Number.isNaN(documentId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid document ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 7. FIND DOCUMENT
    //
    // IMPORTANT:
    // We check BOTH:
    // document.id
    // AND
    // document.userId
    //
    // This prevents one user from accessing
    // another user's PDF.
    // ==========================================

    const document =
      await prisma.document.findFirst({
        where: {
          id: documentId,
          userId: userId,
        },

        select: {
          id: true,
          fileName: true,
          content: true,
        },
      });

    // ==========================================
    // 8. DOCUMENT NOT FOUND
    // ==========================================

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // 9. RETURN DOCUMENT
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        document,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "GET DOCUMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load document.",
      },
      {
        status: 500,
      }
    );
  }
}