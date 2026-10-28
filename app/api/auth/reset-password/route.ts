import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const token =
      String(body.token || "").trim();

    const password =
      String(body.password || "");

    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Token and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          token,
        },

        include: {
          user: true,
        },
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid password reset link.",
        },
        {
          status: 400,
        }
      );
    }

    if (resetToken.used) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link has already been used.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      resetToken.expiresAt <
      new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link has expired. Please request a new one.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },

        data: {
          password:
            hashedPassword,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },

        data: {
          used: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message:
          "Password reset successfully.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to reset password.",
      },
      {
        status: 500,
      }
    );
  }
}