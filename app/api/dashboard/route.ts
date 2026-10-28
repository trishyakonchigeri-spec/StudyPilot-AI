import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

    const userIdNumber =
      Number(userId);

    const totalNotes =
      await prisma.note.count({
        where: {
          userId: userIdNumber,
        },
      });

    const totalTasks =
      await prisma.task.count({
        where: {
          userId: userIdNumber,
        },
      });

    const pendingTasks =
      await prisma.task.count({
        where: {
          userId: userIdNumber,
          completed: false,
        },
      });

    const completedTasks =
      await prisma.task.count({
        where: {
          userId: userIdNumber,
          completed: true,
        },
      });

    return NextResponse.json({
      success: true,

      stats: {
        totalNotes,
        totalTasks,
        pendingTasks,
        completedTasks,
      },
    });

  } catch (error) {
    console.error(
      "DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load dashboard statistics",
      },
      {
        status: 500,
      }
    );
  }
}