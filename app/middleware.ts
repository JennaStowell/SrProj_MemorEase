import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login", // Redirect unauthenticated users to the login page
    },
  }
);

// Apply middleware only to specific routes
export const config = {
  matcher: ["/sets"], // Protect the "/sets" route
};

