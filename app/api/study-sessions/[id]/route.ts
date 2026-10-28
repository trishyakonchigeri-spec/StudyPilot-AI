import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// =====================================
// DELETE STUDY SESSION
// =====================================

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {

    const cookieStore =
      await cookies();

    const userId =
      cookieStore.get(
        "studypilot_user"
      )?.value;

    if (!userId) {
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

    const { id } =
      await params;

    const sessionId =
      Number(id);

    if (
      Number.isNaN(
        sessionId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid session ID",
        },
        {
          status: 400,
        }
      );
    }

    const session =
      await prisma.studySession.findFirst(
        {
          where: {
            id: sessionId,

            userId:
              Number(userId),
          },
        }
      );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Study session not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.studySession.delete(
      {
        where: {
          id: sessionId,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Study session deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE STUDY SESSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete study session",
      },
      {
        status: 500,
      }
    );
  }
}