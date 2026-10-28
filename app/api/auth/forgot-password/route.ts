import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const email =
      String(body.email || "")
        .trim()
        .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No account was found with this email.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const token =
      crypto.randomBytes(32).toString(
        "hex"
      );

    const expiresAt =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Password reset request created.",
        token,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}