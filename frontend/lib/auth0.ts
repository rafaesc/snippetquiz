import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const auth0 = new Auth0Client({
  signInReturnToPath: "/dashboard",
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE,
    audience: process.env.AUTH0_AUDIENCE
  }
});

// Helper function to get user session
export async function getSession() {
  try {
    const session = await auth0.getSession();
    return { user: session?.user || null, error: null };
  } catch (error) {
    console.error("Failed to get user session:", error);
    return { user: null, error };
  }
}
