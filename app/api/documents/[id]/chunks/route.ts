import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { chunkText } from "@/lib/chunk-text";

// ==========================================
// POST
// CREATE DOCUMENT CHUNKS
// ==========================================

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    // ========================================
    // 1. GET DOCUMENT ID
    // ========================================

    const {
      id
    } =
      await context.params;

    const documentId =
      Number(id);

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

    // ========================================
    // 2. FIND DOCUMENT
    // ========================================

    const document =
      await prisma.document.findUnique(
        {
          where: {
            id:
              documentId,
          },
        }
      );

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

    // ========================================
    // 3. CHECK CONTENT
    // ========================================

    if (
      !document.content ||
      document.content.trim().length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Document contains no readable text.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // 4. DELETE OLD CHUNKS
    // ========================================

    await prisma.documentChunk.deleteMany(
      {
        where: {
          documentId,
        },
      }
    );

    // ========================================
    // 5. CREATE NEW CHUNKS
    // ========================================

    const chunks =
      chunkText(
        document.content,
        1200,
        200
      );

    if (
      chunks.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not create document chunks.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================
    // 6. SAVE CHUNKS
    // ========================================

    await prisma.documentChunk.createMany(
      {
        data:
          chunks.map(
            (
              content,
              index
            ) => ({
              documentId,

              chunkIndex:
                index,

              content,
            })
          ),
      }
    );

    // ========================================
    // 7. SUCCESS
    // ========================================

    return NextResponse.json(
      {
        success: true,

        documentId,

        totalChunks:
          chunks.length,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "CHUNK CREATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create document chunks.",
      },
      {
        status: 500,
      }
    );
  }
}