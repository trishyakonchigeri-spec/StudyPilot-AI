import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export async function POST(request: Request) {
  try {
    // ==========================================
    // 1. CHECK LOGGED-IN USER
    // ==========================================

    const cookieHeader =
      request.headers.get("cookie");

    const userIdCookie =
      cookieHeader
        ?.split(";")
        .find((cookie) =>
          cookie
            .trim()
            .startsWith("studypilot_user=")
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
      userIdCookie
        .trim()
        .split("=")[1]
    );

    if (
      !userId ||
      Number.isNaN(userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. READ REQUEST
    // ==========================================

    const body =
      await request.json();

    const documentId =
      Number(body.documentId);

    const numberOfQuestions =
      Number(
        body.numberOfQuestions || 5
      );

    if (
      !documentId ||
      Number.isNaN(documentId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(
        numberOfQuestions
      ) ||
      numberOfQuestions < 1 ||
      numberOfQuestions > 20
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Number of questions must be between 1 and 20.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. GET DOCUMENT
    //
    // IMPORTANT:
    // USER CAN ONLY ACCESS THEIR OWN DOCUMENT
    // ==========================================

    const document =
      await prisma.document.findFirst({
        where: {
          id: documentId,
          userId: userId,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document not found.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 4. CHECK EXTRACTED TEXT
    // ==========================================

    if (
      !document.content ||
      document.content.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This PDF does not contain readable text.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 5. LIMIT TEXT SENT TO AI
    // ==========================================

    const documentText =
      document.content.slice(
        0,
        50000
      );

    // ==========================================
    // 6. CREATE AI PROMPT
    // ==========================================

    const prompt = `
You are an expert educational quiz generator.

Create exactly ${numberOfQuestions} multiple-choice questions from the study material below.

RULES:

- Use ONLY information from the study material.
- Do not invent information.
- Each question must have exactly 4 options.
- Only one option can be correct.
- "answer" must be a number from 0 to 3.
- 0 means the first option is correct.
- 1 means the second option is correct.
- 2 means the third option is correct.
- 3 means the fourth option is correct.
- Give a short explanation.
- Return ONLY valid JSON.
- Do not use Markdown.
- Do not use code fences.

Return exactly this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0,
      "explanation": "Explanation"
    }
  ]
}

STUDY MATERIAL:

${documentText}
`;

    // ==========================================
    // 7. CALL OLLAMA
    // ==========================================

    const ollamaResponse =
      await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model: "llama3.2",
            prompt: prompt,
            stream: false,
            format: "json",
            options: {
              temperature: 0.2,
            },
          }),
        }
      );

    if (!ollamaResponse.ok) {
      const errorText =
        await ollamaResponse.text();

      console.error(
        "OLLAMA ERROR:",
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not connect to Ollama. Make sure Ollama is running.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 8. GET OLLAMA RESPONSE
    // ==========================================

    const ollamaData =
      await ollamaResponse.json();

    const aiText =
      ollamaData.response;

    if (
      typeof aiText !== "string" ||
      !aiText.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ollama returned an empty response.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 9. PARSE JSON
    // ==========================================

    let parsedData: {
      questions: QuizQuestion[];
    };

    try {
      parsedData =
        JSON.parse(aiText);
    } catch (error) {
      console.error(
        "AI JSON PARSE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI returned invalid quiz data.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 10. VALIDATE QUESTIONS
    // ==========================================

    if (
      !parsedData ||
      !Array.isArray(
        parsedData.questions
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid quiz format returned by AI.",
        },
        { status: 500 }
      );
    }

    const validQuestions =
      parsedData.questions
        .filter(
          (item) =>
            typeof item.question ===
              "string" &&
            Array.isArray(
              item.options
            ) &&
            item.options.length ===
              4 &&
            item.options.every(
              (option) =>
                typeof option ===
                "string"
            ) &&
            Number.isInteger(
              item.answer
            ) &&
            item.answer >= 0 &&
            item.answer <= 3 &&
            typeof item.explanation ===
              "string"
        )
        .slice(
          0,
          numberOfQuestions
        );

    if (
      validQuestions.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid questions were generated.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 11. RETURN QUESTIONS
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        documentId:
          document.id,
        fileName:
          document.fileName,
        questions:
          validQuestions,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(
      "QUIZ GENERATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate quiz.",
      },
      { status: 500 }
    );
  }
}