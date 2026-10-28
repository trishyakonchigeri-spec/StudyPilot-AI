import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// =====================================
// CREATE TASK
// =====================================

export async function POST(request: Request) {
  try {
    // Get logged-in user
    const cookieStore = await cookies();

    const userId = cookieStore.get(
      "studypilot_user"
    )?.value;

    // Check authentication
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

    // Get request data
    const body = await request.json();

    const {
      title,
      description,
      dueDate,
    } = body;

    // Validate title
    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Task title is required",
        },
        {
          status: 400,
        }
      );
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description:
          description || null,

        dueDate: dueDate
          ? new Date(dueDate)
          : null,

        userId: Number(userId),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "CREATE TASK ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================
// GET ALL TASKS
// =====================================

export async function GET() {
  try {
    // Get logged-in user
    const cookieStore = await cookies();

    const userId = cookieStore.get(
      "studypilot_user"
    )?.value;

    // Check authentication
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

    // Get user's tasks
    const tasks =
      await prisma.task.findMany({
        where: {
          userId: Number(userId),
        },

        orderBy: [
          {
            completed: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      tasks,
    });

  } catch (error) {
    console.error(
      "GET TASKS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasks",
      },
      {
        status: 500,
      }
    );
  }
}