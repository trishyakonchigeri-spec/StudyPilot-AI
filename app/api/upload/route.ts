import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import PDFParser from "pdf2json";
import { createEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // ==========================================
    // 1. CHECK LOGGED-IN USER
    // ==========================================

    const cookieHeader = request.headers.get("cookie");

    const userIdCookie = cookieHeader
      ?.split(";")
      .find((cookie) =>
        cookie.trim().startsWith("studypilot_user=")
      );

    if (!userIdCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const userId = Number(
      userIdCookie.trim().split("=")[1]
    );

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. GET FILE
    // ==========================================

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload a PDF file.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. CHECK PDF
    // ==========================================

    const isPDF =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. CONVERT FILE TO BUFFER
    // ==========================================

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    // ==========================================
    // 5. EXTRACT TEXT USING PDF2JSON
    // ==========================================

    const extractedText = await new Promise<string>(
      (resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on(
          "pdfParser_dataError",
          (error: any) => {
            console.error(
              "PDF PARSER ERROR:",
              error
            );

            reject(
              new Error(
                "Failed to read PDF file."
              )
            );
          }
        );

        pdfParser.on(
          "pdfParser_dataReady",
          (pdfData: any) => {
            try {
              let text = "";

              if (
                pdfData.Pages &&
                Array.isArray(pdfData.Pages)
              ) {
                for (const page of pdfData.Pages) {
                  if (
                    page.Texts &&
                    Array.isArray(page.Texts)
                  ) {
                    for (const textItem of page.Texts) {
                      if (
                        textItem.R &&
                        Array.isArray(
                          textItem.R
                        )
                      ) {
                        for (const run of textItem.R) {
                          if (run.T) {
                            try {
                              text +=
                                decodeURIComponent(
                                  run.T
                                ) + " ";
                            } catch {
                              text +=
                                run.T + " ";
                            }
                          }
                        }
                      }
                    }

                    text += "\n";
                  }
                }
              }

              text = text
                .replace(/\s+/g, " ")
                .trim();

              if (!text) {
                reject(
                  new Error(
                    "Could not extract text from this PDF. The PDF may be scanned or image-based."
                  )
                );

                return;
              }

              resolve(text);

            } catch (error) {
              reject(error);
            }
          }
        );

        pdfParser.parseBuffer(buffer);
      }
    );

    // ==========================================
    // 6. CHECK EXTRACTED TEXT
    // ==========================================

    if (!extractedText.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not extract text from this PDF.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 7. SAVE DOCUMENT TO DATABASE
    // ==========================================

    const document =
      await prisma.document.create({
        data: {
          userId: userId,
          fileName: file.name,
          content: extractedText,
        },
      });
// ==========================================
// 8. CREATE RAG CHUNKS
// ==========================================

const text = extractedText;

const chunkSize = 800;
const overlap = 100;

const chunks: string[] = [];

for (let i = 0; i < text.length; i += chunkSize - overlap) {
  const chunk = text.slice(i, i + chunkSize).trim();

  if (chunk.length > 100) {
    chunks.push(chunk);
  }
}

for (let i = 0; i < chunks.length; i++) {
  const embedding = await createEmbedding(chunks[i]);

  await prisma.documentChunk.create({
    data: {
      documentId: document.id,
      userId: userId,
      fileName: file.name,
      content: chunks[i],
      chunkIndex: i,
      embedding,
    },
  });
}


    // ==========================================
    // 9. SUCCESS RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message:
          "PDF uploaded and text extracted successfully.",
        document: {
          id: document.id,
          fileName: document.fileName,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error(
      "PDF UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to upload PDF.",
      },
      { status: 500 }
    );
  }
  
}
