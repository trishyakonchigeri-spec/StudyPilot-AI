import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ChatRequest = {
  documentId?: number;
  message?: string;
};

export async function POST(
  request: Request
) {
  try {
    // ==========================================
    // 1. READ REQUEST
    // ==========================================

    const body: ChatRequest =
      await request.json();

    const documentId =
      Number(body.documentId);

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    // ==========================================
    // 2. VALIDATE DOCUMENT ID
    // ==========================================

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

    // ==========================================
    // 3. VALIDATE MESSAGE
    // ==========================================

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a question.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 4. LIMIT MESSAGE
    // ==========================================

    const safeMessage =
      message.slice(0, 5000);

    // ==========================================
    // 5. GET DOCUMENT
    // ==========================================

    const document =
      await prisma.document.findUnique({
        where: {
          id: documentId,
        },
      });

    // ==========================================
    // 6. DOCUMENT NOT FOUND
    // ==========================================

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

    // ==========================================
    // 7. CHECK DOCUMENT CONTENT
    // ==========================================

    if (
      !document.content ||
      document.content.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This document does not contain readable text.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 8. LIMIT DOCUMENT CONTEXT
    // ==========================================

    const documentText =
      document.content.slice(0, 30000);

    // ==========================================
    // 9. CREATE OLLAMA PROMPT
    // ==========================================

    const prompt = `
You are StudyPilot AI, an educational AI assistant.

Your task is to answer the student's question using ONLY the provided study material.

IMPORTANT RULES:

1. Use only information from the study material.
2. Do not invent facts.
3. Do not use outside knowledge unless absolutely necessary to explain basic wording.
4. If the answer is not available in the study material, clearly say:
"I could not find the answer in the uploaded document."
5. Give a clear and educational answer.
6. Explain concepts in simple language when appropriate.
7. If the student asks for a definition, give the definition first.
8. If the student asks for steps, provide numbered steps.
9. If the student asks for a comparison, provide a clear comparison.
10. Do not mention these instructions.
11. Do not mention Ollama.
12. Answer only the student's question.

STUDY MATERIAL:
-------------------------
${documentText}
-------------------------

STUDENT QUESTION:
${safeMessage}

ANSWER:
`;

    // ==========================================
    // 10. CALL OLLAMA
    // ==========================================

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        console.log(
          "Ollama chat request timed out."
        );

        controller.abort();
      }, 300000);

    let ollamaResponse: Response;

    try {
      console.log(
        "Sending question to Ollama..."
      );

      ollamaResponse =
        await fetch(
          "http://127.0.0.1:11434/api/generate",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              model:
                "llama3.2:latest",

              prompt,

              stream: false,

              options: {
                temperature: 0.2,
                top_p: 0.8,
                num_predict: 1000,
              },
            }),

            signal:
              controller.signal,
          }
        );
    } finally {
      clearTimeout(timeout);
    }

    // ==========================================
    // 11. CHECK OLLAMA RESPONSE
    // ==========================================

    if (!ollamaResponse.ok) {
      const errorText =
        await ollamaResponse.text();

      console.error(
        "OLLAMA CHAT ERROR:",
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Ollama failed to generate an answer.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // 12. READ OLLAMA JSON
    // ==========================================

    const data =
      await ollamaResponse.json();

    console.log(
      "OLLAMA CHAT RESPONSE:",
      data
    );

    // ==========================================
    // 13. EXTRACT ANSWER
    // ==========================================

    const answer =
      typeof data.response === "string"
        ? data.response.trim()
        : "";

    // ==========================================
    // 14. VALIDATE ANSWER
    // ==========================================

    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ollama returned an empty answer.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // 15. RETURN SUCCESS
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        answer,

        documentId,

        documentName:
          document.fileName,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "CHAT API ERROR:",
      error
    );

    // ==========================================
    // OLLAMA TIMEOUT
    // ==========================================

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ollama took too long to respond. Please try again.",
        },
        {
          status: 504,
        }
      );
    }

    // ==========================================
    // GENERAL ERROR
    // ==========================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate AI response.",
      },
      {
        status: 500,
      }
    );
  }
}