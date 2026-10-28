
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const question =
      body.question;

    if (
      !question ||
      typeof question !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Question is required",
        },
        {
          status: 400,
        }
      );
    }

    const lowerQuestion =
      question.toLowerCase();

    let answer =
      "I am your StudyPilot AI assistant. I can help you with basic study questions. Try asking me about DBMS, Java, algorithms, or programming.";

    // =====================================
    // DBMS
    // =====================================

    if (
      lowerQuestion.includes(
        "dbms"
      )
    ) {
      answer =
        "DBMS stands for Database Management System. It is software used to create, store, organize, manage, and retrieve data from databases. Examples include MySQL, PostgreSQL, Oracle, and Microsoft SQL Server.";
    }

    // =====================================
    // JAVA
    // =====================================

    else if (
      lowerQuestion.includes(
        "java"
      )
    ) {
      answer =
        "Java is a high-level, object-oriented programming language. It follows the principle 'Write Once, Run Anywhere' because Java programs run on the Java Virtual Machine (JVM).";
    }

    // =====================================
    // ALGORITHM
    // =====================================

    else if (
      lowerQuestion.includes(
        "algorithm"
      )
    ) {
      answer =
        "An algorithm is a step-by-step procedure used to solve a problem. A good algorithm should be clear, finite, effective, and produce the correct result.";
    }

    // =====================================
    // BINARY SEARCH
    // =====================================

    else if (
      lowerQuestion.includes(
        "binary search"
      )
    ) {
      answer =
        "Binary search is an efficient searching algorithm that works on sorted data. It repeatedly divides the search space into half. Its time complexity is O(log n).";
    }

    // =====================================
    // ARRAY
    // =====================================

    else if (
      lowerQuestion.includes(
        "array"
      )
    ) {
      answer =
        "An array is a data structure that stores multiple elements of the same type in contiguous memory locations. Elements are accessed using an index.";
    }

    // =====================================
    // SQL
    // =====================================

    else if (
      lowerQuestion.includes(
        "sql"
      )
    ) {
      answer =
        "SQL stands for Structured Query Language. It is used to communicate with relational databases. Common SQL commands include SELECT, INSERT, UPDATE, DELETE, CREATE, and DROP.";
    }

    // =====================================
    // NORMALIZATION
    // =====================================

    else if (
      lowerQuestion.includes(
        "normalization"
      )
    ) {
      answer =
        "Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. Common normal forms include 1NF, 2NF, 3NF, and BCNF.";
    }

    // =====================================
    // GREETING
    // =====================================

    else if (
      lowerQuestion.includes(
        "hello"
      ) ||
      lowerQuestion.includes(
        "hi"
      ) ||
      lowerQuestion.includes(
        "hey"
      )
    ) {
      answer =
        "Hello! 👋 I am your StudyPilot AI assistant. Ask me a question about your studies!";
    }

    // =====================================
    // HELP
    // =====================================

    else if (
      lowerQuestion.includes(
        "help"
      )
    ) {
      answer =
        "Sure! 🤖 You can ask me questions about DBMS, SQL, Java, algorithms, arrays, binary search, normalization, and other basic programming topics.";
    }

    return NextResponse.json({
      success: true,
      answer,
    });

  } catch (error) {

    console.error(
      "ASSISTANT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to process question",
      },
      {
        status: 500,
      }
    );
  }
}

