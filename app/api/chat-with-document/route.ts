import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createEmbedding } from "@/lib/embeddings";
import cosineSimilarity from "compute-cosine-similarity";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { documentId, question } = body;

    if (!documentId || !question) {
      return NextResponse.json(
        { success: false, message: "documentId and question are required" },
        { status: 400 }
      );
    }

    // 1. Create embedding for user question
    const questionEmbedding = await createEmbedding(question);

    // 2. Load document chunks
    const chunks = await prisma.documentChunk.findMany({
      where: {
        documentId: Number(documentId),
      },
    });

    if (chunks.length === 0) {
      return NextResponse.json(
        { success: false, message: "No chunks found for this document" },
        { status: 404 }
      );
    }

    // 3. Score chunks by similarity
    const scoredChunks = chunks
  .filter((chunk) => chunk.embedding)
  .map((chunk) => {
    const score =
      cosineSimilarity(
        questionEmbedding,
        chunk.embedding as number[]
      ) ?? -1;

    return {
      content: chunk.content,
      score,
    };
  })
  .sort((a, b) => b.score - a.score);

    // 4. Take top 3 chunks
    const context = scoredChunks
      .slice(0, 3)
      .map((c) => c.content)
      .join("\n\n---\n\n");

    // 5. Ask Ollama using only relevant context
    const prompt = `
Answer the question using ONLY the context below.

Context:
${context}

Question:
${question}

Answer in simple study-friendly language.
`;

    const ollamaResponse = await fetch(
      "http://127.0.0.1:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:latest",
          prompt,
          stream: false,
          options: {
            temperature: 0,
            num_predict: 250,
            num_ctx: 4096,
          },
        }),
      }
    );

    const ollamaData = await ollamaResponse.json();

    return NextResponse.json({
      success: true,
      answer: ollamaData.response,
      usedChunks: scoredChunks.slice(0, 3),
    });

  } catch (error) {
    console.error("RAG CHAT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to answer question" },
      { status: 500 }
    );
  }
}