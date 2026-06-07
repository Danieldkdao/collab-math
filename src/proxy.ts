import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth/auth";
import { db } from "./db/db";
import { eq } from "drizzle-orm";
import { user } from "./db/schema";

const authedRoutes = ["/sign-in", "/sign-up", "/forgot-password"];
const publicRoutes = ["/", "/threads"];

export const proxy = async (request: NextRequest) => {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const session = await auth.api.getSession({ headers: request.headers });
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, session?.user.id ?? ""),
  });

  if (
    !existingUser &&
    !authedRoutes.includes(pathname) &&
    pathname !== "/" &&
    !publicRoutes.some((route) => pathname.includes(route))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.json|manifest.webmanifest|apple-icon.png|.*\\.[^/]+$).*)",
  ],
};
