import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Only allow if token exists and role is 'admin'
      return !!token && token.role === "admin";
    },
  },
});

export const config = {
  // Protect everything inside /admin
  matcher: ["/admin/:path*"],
};