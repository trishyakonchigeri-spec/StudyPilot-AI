import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ======================================================
// TYPES
// ======================================================

type RawQuestion = {
  question?: unknown;
  options?: unknown;
  answer?: unknown;
  explanation?: unknown;
};

type OllamaResponse = {
  response?: string;
};

type ValidQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

// ======================================================
// OLLAMA CONFIG
// ======================================================

const OLLAMA_URL =
  "http://127.0.0.1:11434/api/generate";

const OLLAMA_MODEL =
  "llama3.2:1b";

// ======================================================
// PERFORMANCE CONFIG
// ======================================================

// Keep context reasonably small for llama3.2:1b
const MAX_CONTEXT_LENGTH = 2200;

// Generate fewer questions per batch for better speed
const BATCH_SIZE = 5;

// IMPORTANT:
// 30 seconds was too short and was killing Ollama.
// Give the local model up to 2 minutes.
const OLLAMA_TIMEOUT = 120000;

// Limit output generation
const TOKENS_PER_QUESTION = 90;

// ======================================================
// CLEAN OPTION
// ======================================================

function cleanOption(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/^[A-Da-d][.)]\s*/i, "")
    .replace(/^\([A-Da-d]\)\s*/i, "")
    .replace(/^[1-4][.)]\s*/i, "")
    .trim();
}

// ======================================================
// NORMALIZE ANSWER
// ======================================================

function normalizeAnswer(
  value: unknown,
  options: string[]
): string {
  if (typeof value !== "string") {
    return "";
  }

  const answer = value
    .trim()
    .replace(/^answer\s*:\s*/i, "")
    .replace(/^[A-Da-d][.)]\s*/i, "")
    .replace(/^\([A-Da-d]\)\s*/i, "")
    .trim();

  // ----------------------------------------------
  // A / B / C / D
  // ----------------------------------------------

  const letterMatch =
    answer.match(/^([A-Da-d])$/);

  if (letterMatch) {
    const index =
      letterMatch[1]
        .toUpperCase()
        .charCodeAt(0) -
      "A".charCodeAt(0);

    return options[index] || "";
  }

  // ----------------------------------------------
  // 1 / 2 / 3 / 4
  // ----------------------------------------------

  const numberMatch =
    answer.match(/^([1-4])$/);

  if (numberMatch) {
    return (
      options[
        Number(numberMatch[1]) - 1
      ] || ""
    );
  }

  // ----------------------------------------------
  // EXACT MATCH
  // ----------------------------------------------

  const exact =
    options.find(
      (option) =>
        option.toLowerCase().trim() ===
        answer.toLowerCase().trim()
    );

  if (exact) {
    return exact;
  }

  // ----------------------------------------------
  // PARTIAL MATCH
  // ----------------------------------------------

  const lowerAnswer =
    answer.toLowerCase();

  const partial =
    options.find((option) => {
      const lowerOption =
        option.toLowerCase();

      return (
        lowerOption.includes(lowerAnswer) ||
        lowerAnswer.includes(lowerOption)
      );
    });

  return partial || "";
}

// ======================================================
// VALIDATE QUESTIONS
// ======================================================

function validateQuestions(
  raw: unknown
): ValidQuestion[] {
  if (!raw || typeof raw !== "object") {
    return [];
  }

  const data =
    raw as {
      questions?: unknown;
    };

  if (!Array.isArray(data.questions)) {
    return [];
  }

  const result: ValidQuestion[] = [];

  for (const item of data.questions) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const questionData =
      item as RawQuestion;

    // ----------------------------------------------
    // QUESTION
    // ----------------------------------------------

    if (
      typeof questionData.question !==
      "string"
    ) {
      continue;
    }

    const question =
      questionData.question.trim();

    if (question.length < 8) {
      continue;
    }

    // ----------------------------------------------
    // OPTIONS
    // ----------------------------------------------

    if (
      !Array.isArray(
        questionData.options
      )
    ) {
      continue;
    }

    const options =
      questionData.options
        .map(cleanOption)
        .filter(Boolean)
        .slice(0, 4);

    if (options.length !== 4) {
      console.log(
        "INVALID OPTIONS:",
        questionData.options
      );

      continue;
    }

    // ----------------------------------------------
    // UNIQUE OPTIONS
    // ----------------------------------------------

    const uniqueOptions =
      new Set(
        options.map((option) =>
          option.toLowerCase().trim()
        )
      );

    if (uniqueOptions.size !== 4) {
      console.log(
        "DUPLICATE OPTIONS:",
        options
      );

      continue;
    }

    // ----------------------------------------------
    // ANSWER
    // ----------------------------------------------

    const answer =
      normalizeAnswer(
        questionData.answer,
        options
      );

    if (!answer) {
      console.log(
        "INVALID ANSWER:",
        questionData.answer
      );

      continue;
    }

    // ----------------------------------------------
    // EXPLANATION
    // ----------------------------------------------

    let explanation =
      `The correct answer is ${answer}.`;

    if (
      typeof questionData.explanation ===
      "string" &&
      questionData.explanation.trim()
    ) {
      explanation =
        questionData.explanation.trim();
    }

    // ----------------------------------------------
    // ADD QUESTION
    // ----------------------------------------------

    result.push({
      question,
      options,
      answer,
      explanation,
    });
  }

  return result;
}

// ======================================================
// CREATE PROMPT
// ======================================================

function createPrompt(
  context: string,
  count: number
): string {
  return `
Generate exactly ${count} multiple-choice questions from the study material below.

IMPORTANT RULES:
1. Use only facts present in the study material.
2. Return exactly ${count} questions.
3. Every question must have exactly 4 options.
4. Every question must have exactly 1 correct answer.
5. Keep questions short and clear.
6. Keep options short.
7. Do not write A, B, C, or D inside option text.
8. The answer must exactly match one option.
9. Return ONLY valid JSON.
10. Do not use markdown.
11. Do not add text before or after the JSON.

RETURN THIS EXACT JSON STRUCTURE:

{
  "questions": [
    {
      "question": "Question text here",
      "options": [
        "First option",
        "Second option",
        "Third option",
        "Fourth option"
      ],
      "answer": "First option"
    }
  ]
}

STUDY MATERIAL:

${context}
`;
}

// ======================================================
// GENERATE ONE BATCH
// ======================================================

async function generateBatch(
  context: string,
  count: number
): Promise<ValidQuestion[]> {
  const prompt =
    createPrompt(
      context,
      count
    );

  console.log(
    `Generating ${count} questions...`
  );

  console.log(
    `Prompt length: ${prompt.length}`
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      console.log(
        `OLLAMA TIMEOUT AFTER ${
          OLLAMA_TIMEOUT / 1000
        } SECONDS`
      );

      controller.abort();
    }, OLLAMA_TIMEOUT);

  try {
    console.log(
      "Sending request to Ollama..."
    );

    const response =
      await fetch(
        OLLAMA_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model:
              OLLAMA_MODEL,

            prompt,

            stream: false,

            format: "json",

            // Keep model loaded between requests
            keep_alive: "10m",

            options: {
              temperature: 0.1,

              top_p: 0.8,

              num_ctx: 3072,

              num_predict:
                Math.max(
                  450,
                  count *
                    TOKENS_PER_QUESTION
                ),

              repeat_penalty: 1.05,
            },
          }),

          signal:
            controller.signal,
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "OLLAMA HTTP ERROR:",
        errorText
      );

      return [];
    }

    const data =
      (await response.json()) as OllamaResponse;

    if (
      !data.response ||
      typeof data.response !==
      "string"
    ) {
      console.error(
        "EMPTY OLLAMA RESPONSE"
      );

      return [];
    }

    console.log(
      "OLLAMA RESPONSE RECEIVED"
    );

    console.log(
      "OLLAMA RESPONSE LENGTH:",
      data.response.length
    );

    console.log(
      "RAW RESPONSE:",
      data.response
    );

    // ----------------------------------------------
    // PARSE JSON
    // ----------------------------------------------

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(
          data.response
        );
    } catch (error) {
      console.error(
        "JSON PARSE ERROR:",
        error
      );

      console.error(
        "RAW OLLAMA RESPONSE:",
        data.response
      );

      return [];
    }

    // ----------------------------------------------
    // VALIDATE QUESTIONS
    // ----------------------------------------------

    const questions =
      validateQuestions(
        parsed
      );

    console.log(
      `VALID QUESTIONS: ${questions.length}`
    );

    return questions;

  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      console.error(
        "OLLAMA REQUEST TIMED OUT"
      );
    } else {
      console.error(
        "OLLAMA REQUEST ERROR:",
        error
      );
    }

    return [];

  } finally {
    clearTimeout(timeout);
  }
}

// ======================================================
// BUILD DOCUMENT CONTEXT
// ======================================================

async function buildContext(
  documentId: number
): Promise<string> {
  const chunks =
    await prisma.documentChunk.findMany(
      {
        where: {
          documentId,
        },

        orderBy: {
          chunkIndex: "asc",
        },

        take: 4,

        select: {
          content: true,
        },
      }
    );

  console.log(
    `DOCUMENT CHUNKS FOUND: ${chunks.length}`
  );

  if (chunks.length === 0) {
    return "";
  }

  let context = "";

  for (const chunk of chunks) {
    if (
      context.length >=
      MAX_CONTEXT_LENGTH
    ) {
      break;
    }

    const remaining =
      MAX_CONTEXT_LENGTH -
      context.length;

    context +=
      chunk.content.slice(
        0,
        remaining
      ) + "\n\n";
  }

  return context.trim();
}

// ======================================================
// REMOVE DUPLICATE QUESTIONS
// ======================================================

function removeDuplicates(
  questions: ValidQuestion[]
): ValidQuestion[] {
  const seen =
    new Set<string>();

  const result:
    ValidQuestion[] = [];

  for (const question of questions) {
    const key =
      question.question
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.push(question);
  }

  return result;
}

// ======================================================
// POST - GENERATE QUIZ
// ======================================================

export async function POST(
  request: Request
) {
  const startTime =
    Date.now();

  try {
    // ==============================================
    // GET REQUEST BODY
    // ==============================================

    const body =
      await request.json();

    const documentId =
      Number(
        body.documentId
      );

    const requestedCount =
      Number(
        body.questionCount || 5
      );

    // ==============================================
    // SAFE QUESTION COUNT
    // ==============================================

    const questionCount =
      Math.min(
        Math.max(
          requestedCount,
          1
        ),
        20
      );

    console.log(
      "================================"
    );

    console.log(
      `REQUESTED QUESTIONS: ${questionCount}`
    );

    console.log(
      `DOCUMENT ID: ${documentId}`
    );

    // ==============================================
    // VALIDATE DOCUMENT ID
    // ==============================================

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

    // ==============================================
    // GET DOCUMENT
    // ==============================================

    const document =
      await prisma.document.findUnique(
        {
          where: {
            id: documentId,
          },

          select: {
            id: true,
            fileName: true,
            content: true,
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

    // ==============================================
    // BUILD CONTEXT
    // ==============================================

    let context =
      await buildContext(
        documentId
      );

    if (!context) {
      console.log(
        "NO CHUNKS FOUND - USING DOCUMENT CONTENT"
      );

      context =
        document.content
          .trim()
          .slice(
            0,
            MAX_CONTEXT_LENGTH
          );
    }

    if (!context) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No readable study material found.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      `DOCUMENT TEXT LENGTH: ${context.length}`
    );

    console.log(
      `OLLAMA MODEL: ${OLLAMA_MODEL}`
    );

    console.log(
      `OLLAMA TIMEOUT: ${
        OLLAMA_TIMEOUT / 1000
      } seconds`
    );

    // ==============================================
    // GENERATE QUESTIONS
    // ==============================================

    const allQuestions:
      ValidQuestion[] = [];

    const totalBatches =
      Math.ceil(
        questionCount /
        BATCH_SIZE
      );

    console.log(
      `TOTAL BATCHES: ${totalBatches}`
    );

    for (
      let batch = 0;
      batch < totalBatches;
      batch++
    ) {
      const remaining =
        questionCount -
        allQuestions.length;

      if (remaining <= 0) {
        break;
      }

      const batchCount =
        Math.min(
          BATCH_SIZE,
          remaining
        );

      console.log(
        `BATCH ${
          batch + 1
        }/${totalBatches}`
      );

      const questions =
        await generateBatch(
          context,
          batchCount
        );

      allQuestions.push(
        ...questions
      );

      console.log(
        `TOTAL QUESTIONS: ${allQuestions.length}`
      );
    }

    // ==============================================
    // FINAL QUESTIONS
    // ==============================================

    const finalQuestions =
      removeDuplicates(
        allQuestions
      ).slice(
        0,
        questionCount
      );

    // ==============================================
    // CALCULATE TIME
    // ==============================================

    const duration =
      (
        Date.now() -
        startTime
      ) / 1000;

    console.log(
      "================================"
    );

    console.log(
      `REQUESTED: ${questionCount}`
    );

    console.log(
      `GENERATED: ${finalQuestions.length}`
    );

    console.log(
      `QUIZ GENERATION TIME: ${duration.toFixed(
        2
      )} seconds`
    );

    console.log(
      "================================"
    );

    // ==============================================
    // FAILURE
    // ==============================================

    if (
      finalQuestions.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ollama could not generate valid MCQs. Please try again.",

          generationTime:
            duration,
        },
        {
          status: 500,
        }
      );
    }

    // ==============================================
    // SUCCESS
    // ==============================================

    return NextResponse.json(
      {
        success: true,

        documentId:
          document.id,

        documentName:
          document.fileName,

        requestedQuestions:
          questionCount,

        generatedQuestions:
          finalQuestions.length,

        generationTime:
          duration,

        questions:
          finalQuestions,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    const duration =
      (
        Date.now() -
        startTime
      ) / 1000;

    console.error(
      "QUIZ GENERATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to generate quiz. Make sure Ollama is running.",

        generationTime:
          duration,
      },
      {
        status: 500,
      }
    );
  }
}