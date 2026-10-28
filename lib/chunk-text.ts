// ==========================================
// TEXT CHUNKING UTILITY FOR RAG
// ==========================================

export function chunkText(
  text: string,
  chunkSize: number = 1200,
  overlap: number = 200
): string[] {
  // ==========================================
  // 1. VALIDATE INPUT
  // ==========================================

  if (
    !text ||
    text.trim().length === 0
  ) {
    return [];
  }

  // ==========================================
  // 2. VALIDATE CHUNK SETTINGS
  // ==========================================

  if (chunkSize <= 0) {
    throw new Error(
      "chunkSize must be greater than 0."
    );
  }

  if (overlap < 0) {
    throw new Error(
      "overlap cannot be negative."
    );
  }

  if (overlap >= chunkSize) {
    throw new Error(
      "overlap must be smaller than chunkSize."
    );
  }

  // ==========================================
  // 3. CLEAN PDF TEXT
  // ==========================================

  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // ==========================================
  // 4. CHECK CLEANED TEXT
  // ==========================================

  if (
    cleanedText.length === 0
  ) {
    return [];
  }

  // ==========================================
  // 5. CREATE CHUNKS
  // ==========================================

  const chunks: string[] = [];

  let start = 0;

  while (
    start < cleanedText.length
  ) {
    // ========================================
    // CALCULATE INITIAL END
    // ========================================

    let end = Math.min(
      start + chunkSize,
      cleanedText.length
    );

    // ========================================
    // FIND NATURAL BREAKPOINT
    // ========================================

    if (
      end < cleanedText.length
    ) {
      const lastPeriod =
        cleanedText.lastIndexOf(
          ".",
          end
        );

      const lastNewLine =
        cleanedText.lastIndexOf(
          "\n",
          end
        );

      const lastQuestionMark =
        cleanedText.lastIndexOf(
          "?",
          end
        );

      const lastExclamationMark =
        cleanedText.lastIndexOf(
          "!",
          end
        );

      const bestBoundary =
        Math.max(
          lastPeriod,
          lastNewLine,
          lastQuestionMark,
          lastExclamationMark
        );

      // ======================================
      // USE NATURAL BREAKPOINT ONLY IF
      // IT IS NOT TOO EARLY
      // ======================================

      const minimumBoundary =
        start +
        Math.floor(
          chunkSize * 0.6
        );

      if (
        bestBoundary >
        minimumBoundary
      ) {
        end =
          bestBoundary + 1;
      }
    }

    // ========================================
    // EXTRACT CHUNK
    // ========================================

    const chunk =
      cleanedText
        .slice(
          start,
          end
        )
        .trim();

    // ========================================
    // ADD VALID CHUNK
    // ========================================

    if (
      chunk.length > 0
    ) {
      chunks.push(
        chunk
      );
    }

    // ========================================
    // STOP WHEN WE REACH THE END
    // ========================================

    if (
      end >=
      cleanedText.length
    ) {
      break;
    }

    // ========================================
    // MOVE START POSITION
    //
    // Example:
    //
    // chunkSize = 1200
    // overlap = 200
    //
    // Next chunk starts 200 characters
    // before the previous chunk ended.
    // ========================================

    const nextStart =
      end - overlap;

    // ========================================
    // SAFETY CHECK
    // ========================================

    if (
      nextStart <= start
    ) {
      start =
        start + 1;
    } else {
      start =
        nextStart;
    }
  }

  // ==========================================
  // 6. RETURN CHUNKS
  // ==========================================

  return chunks;
}