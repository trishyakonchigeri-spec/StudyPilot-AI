import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// =====================================
// UPDATE TASK
// =====================================

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const cookieStore = await cookies();

    const userId =
      cookieStore.get("studypilot_user")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const taskId = Number(id);

    if (Number.isNaN(taskId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existingTask =
      await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: Number(userId),
        },
      });

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        { status: 404 }
      );
    }

    const updatedTask =
      await prisma.task.update({
        where: {
          id: taskId,
        },

        data: {
          title:
            body.title ??
            existingTask.title,

          description:
            body.description ??
            existingTask.description,

          dueDate:
            body.dueDate !== undefined
              ? body.dueDate
                ? new Date(body.dueDate)
                : null
              : existingTask.dueDate,

          completed:
            body.completed ??
            existingTask.completed,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (error) {
    console.error(
      "UPDATE TASK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update task",
      },
      { status: 500 }
    );
  }
}

// =====================================
// DELETE TASK
// =====================================

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const cookieStore = await cookies();

    const userId =
      cookieStore.get("studypilot_user")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const taskId = Number(id);

    if (Number.isNaN(taskId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task ID",
        },
        { status: 400 }
      );
    }

    const existingTask =
      await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: Number(userId),
        },
      });

    if (!existingTask) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE TASK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete task",
      },
      { status: 500 }
    );
  }
}