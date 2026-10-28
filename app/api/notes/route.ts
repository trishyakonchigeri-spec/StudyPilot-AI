import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// ===============================
// CREATE NOTE
// ===============================

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const userId = cookieStore.get(
      "studypilot_user"
    )?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and content are required",
        },
        {
          status: 400,
        }
      );
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: Number(userId),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        note,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error("CREATE NOTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create note",
      },
      {
        status: 500,
      }
    );
  }
}

// ===============================
// GET ALL NOTES
// ===============================

export async function GET() {
  try {
    const cookieStore = await cookies();

    const userId = cookieStore.get(
      "studypilot_user"
    )?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: Number(userId),
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      notes,
    });

  } catch (error) {
    console.error("GET NOTES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notes",
      },
      {
        status: 500,
      }
    );
  }
}