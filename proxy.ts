import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get logged-in user cookie
  const userId = request.cookies.get(
    "studypilot_user"
  )?.value;

  // ==========================================
  // PROTECTED DASHBOARD ROUTES
  // ==========================================

  if (pathname.startsWith("/dashboard")) {
    if (!userId) {
      const loginUrl = new URL(
        "/login",
        request.url
      );

      return NextResponse.redirect(loginUrl);
    }
  }

  // ==========================================
  // PROTECTED API ROUTES
  // ==========================================

  const protectedApiRoutes = [
    "/api/documents",
    "/api/quiz-results",
    "/api/quiz-from-pdf",
  ];

  const isProtectedApiRoute =
    protectedApiRoutes.some((route) =>
      pathname.startsWith(route)
    );

  if (isProtectedApiRoute && !userId) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized. Please log in.",
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/documents/:path*",
    "/api/quiz-results/:path*",
    "/api/quiz-from-pdf/:path*",
  ],
};