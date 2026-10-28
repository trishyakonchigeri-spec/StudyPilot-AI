import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ===============================
// GET SINGLE NOTE
// ===============================

export async function GET(
  request: Request,
  { params }: Params
) {
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

    const { id } = await params;

    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });

  } catch (error) {
    console.error("GET NOTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch note",
      },
      {
        status: 500,
      }
    );
  }
}

// ===============================
// UPDATE NOTE
// ===============================

export async function PUT(
  request: Request,
  { params }: Params
) {
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

    const { id } = await params;

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

    const existingNote =
      await prisma.note.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      });

    if (!existingNote) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        {
          status: 404,
        }
      );
    }

    const updatedNote =
      await prisma.note.update({
        where: {
          id: Number(id),
        },

        data: {
          title,
          content,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      note: updatedNote,
    });

  } catch (error) {
    console.error("UPDATE NOTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update note",
      },
      {
        status: 500,
      }
    );
  }
}

// ===============================
// DELETE NOTE
// ===============================

export async function DELETE(
  request: Request,
  { params }: Params
) {
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

    const { id } = await params;

    const existingNote =
      await prisma.note.findFirst({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      });

    if (!existingNote) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.note.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });

  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete note",
      },
      {
        status: 500,
      }
    );
  }
}