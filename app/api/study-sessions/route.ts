import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// =====================================
// CREATE STUDY SESSION
// =====================================

export async function POST(
  request: Request
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

    const body =
      await request.json();

    const {
      subject,
      title,
      studyDate,
      startTime,
      duration,
    } = body;

    if (
      !subject ||
      !title ||
      !studyDate ||
      !startTime ||
      !duration
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const session =
      await prisma.studySession.create(
        {
          data: {
            subject,
            title,

            studyDate:
              new Date(studyDate),

            startTime,

            duration:
              Number(duration),

            userId:
              Number(userId),
          },
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Study session created successfully",
        session,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "CREATE STUDY SESSION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create study session",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================
// GET ALL STUDY SESSIONS
// =====================================

export async function GET() {
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

    const sessions =
      await prisma.studySession.findMany(
        {
          where: {
            userId:
              Number(userId),
          },

          orderBy: [
            {
              studyDate:
                "asc",
            },

            {
              startTime:
                "asc",
            },
          ],
        }
      );

    return NextResponse.json({
      success: true,
      sessions,
    });

  } catch (error) {

    console.error(
      "GET STUDY SESSIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch study sessions",
      },
      {
        status: 500,
      }
    );
  }
}