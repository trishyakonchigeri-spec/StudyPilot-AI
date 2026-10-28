import pdfParse from "pdf-parse";

// ==========================================
// EXTRACT TEXT FROM PDF BUFFER
// ==========================================

export async function extractPdfText(
  buffer: Buffer
): Promise<string> {

  try {

    console.log(
      "STARTING PDF TEXT EXTRACTION..."
    );

    // ========================================
    // VALIDATE BUFFER
    // ========================================

    if (
      !buffer ||
      buffer.length === 0
    ) {

      throw new Error(
        "PDF buffer is empty."
      );

    }

    console.log(
      "PDF BUFFER SIZE:",
      buffer.length
    );

    // ========================================
    // PARSE PDF
    // ========================================

    const pdfData =
      await pdfParse(
        buffer
      );

    // ========================================
    // GET TEXT
    // ========================================

    const extractedText =
      typeof pdfData.text ===
      "string"
        ? pdfData.text
        : "";

    const cleanText =
      extractedText
        .replace(
          /\r\n/g,
          "\n"
        )
        .replace(
          /\r/g,
          "\n"
        )
        .trim();

    console.log(
      "PDF TEXT EXTRACTION COMPLETED"
    );

    console.log(
      "TOTAL PAGES:",
      pdfData.numpages
    );

    console.log(
      "EXTRACTED TEXT LENGTH:",
      cleanText.length
    );

    // ========================================
    // CHECK TEXT
    // ========================================

    if (
      cleanText.length === 0
    ) {

      throw new Error(
        "PDF contains no extractable text. The PDF may be scanned or image-based."
      );

    }

    // ========================================
    // RETURN TEXT
    // ========================================

    return cleanText;

  } catch (
    error
  ) {

    console.error(
      "========================================"
    );

    console.error(
      "PDF TEXT EXTRACTION ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );

    throw error;

  }

}