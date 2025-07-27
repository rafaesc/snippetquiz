import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const auth0 = new Auth0Client({
  // These values should be set in your .env.local file
  // AUTH0_SECRET='your-auth0-secret'
  // AUTH0_BASE_URL='http://localhost:3000'
  // AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
  // AUTH0_CLIENT_ID='your-auth0-client-id'
  // AUTH0_CLIENT_SECRET='your-auth0-client-secret'
  signInReturnToPath: "/dashboard",
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
