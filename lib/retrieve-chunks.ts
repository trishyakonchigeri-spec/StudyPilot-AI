import prisma from "@/lib/prisma";

// ==========================================
// TYPES
// ==========================================

type RetrievedChunk = {
  id: number;
  documentId: number;
  chunkIndex: number;
  content: string;
};

// ==========================================
// RETRIEVE RELEVANT CHUNKS
// ==========================================

export async function retrieveRelevantChunks(
  documentId: number,
  query: string,
  limit: number = 4
): Promise<RetrievedChunk[]> {

  // ========================================
  // 1. VALIDATE INPUT
  // ========================================

  if (
    !documentId ||
    !query ||
    query.trim().length === 0
  ) {
    return [];
  }

  // ========================================
  // 2. CLEAN QUERY
  // ========================================

  const cleanQuery =
    query
      .trim()
      .toLowerCase();

  // ========================================
  // 3. GET ALL CHUNKS
  // ========================================

  const chunks =
    await prisma.documentChunk.findMany({
      where: {
        documentId,
      },

      orderBy: {
        chunkIndex: "asc",
      },

      select: {
        id: true,
        documentId: true,
        chunkIndex: true,
        content: true,
      },
    });

  if (
    chunks.length === 0
  ) {
    console.log(
      "NO DOCUMENT CHUNKS FOUND"
    );

    return [];
  }

  // ========================================
  // 4. EXTRACT SEARCH WORDS
  // ========================================

  const queryWords =
    cleanQuery
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2
      );

  // ========================================
  // 5. SCORE EACH CHUNK
  // ========================================

  const scoredChunks =
    chunks.map(
      (chunk) => {

        const chunkText =
          chunk.content.toLowerCase();

        let score = 0;

        for (
          const word of queryWords
        ) {

          // Count occurrences
          const occurrences =
            chunkText.split(
              word
            ).length - 1;

          if (
            occurrences > 0
          ) {

            score +=
              occurrences;
          }
        }

        // ==================================
        // BONUS FOR EXACT QUERY
        // ==================================

        if (
          chunkText.includes(
            cleanQuery
          )
        ) {

          score += 10;
        }

        return {
          ...chunk,
          score,
        };
      }
    );

  // ========================================
  // 6. SORT BY RELEVANCE
  // ========================================

  scoredChunks.sort(
    (
      a,
      b
    ) =>
      b.score -
      a.score
  );

  // ========================================
  // 7. SELECT TOP CHUNKS
  // ========================================

  const relevantChunks =
    scoredChunks
      .filter(
        (chunk) =>
          chunk.score > 0
      )
      .slice(
        0,
        limit
      );

  // ========================================
  // 8. FALLBACK
  // ========================================

  // If no keyword matches,
  // return first few chunks.

  if (
    relevantChunks.length === 0
  ) {

    console.log(
      "NO KEYWORD MATCHES. USING FALLBACK CHUNKS."
    );

    return chunks.slice(
      0,
      limit
    );
  }

  // ========================================
  // 9. LOG RESULTS
  // ========================================

  console.log(
    `RETRIEVED ${relevantChunks.length} RELEVANT CHUNKS`
  );

  console.log(
    "CHUNK INDEXES:",
    relevantChunks.map(
      (chunk) =>
        chunk.chunkIndex
    )
  );

  // ========================================
  // 10. RETURN
  // ========================================

  return relevantChunks.map(
    ({
      score,
      ...chunk
    }) =>
      chunk
  );
}