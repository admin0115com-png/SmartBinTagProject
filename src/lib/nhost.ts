export function isValidUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

export function toUuid(idStr?: string | null): string | null {
  if (!idStr) return null;
  const clean = idStr.trim();
  if (isValidUuid(clean)) {
    return clean;
  }
  let hex = '';
  for (let i = 0; i < clean.length; i++) {
    hex += clean.charCodeAt(i).toString(16);
  }
  hex = (hex + '00000000000000000000000000000000').substring(0, 32);
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-a${hex.substring(17, 20)}-${hex.substring(20, 32)}`;
}

import { NhostClient } from '@nhost/nhost-js';

// Define the custom Auth interface to extend the Nhost client typing
export interface CustomAuth {
  signInWithProvider(
    params: { provider: string; options?: { redirectTo?: string } },
    options?: { popup?: boolean }
  ): Promise<{ session: any; error: any }>;
  signUp(params: {
    email: string;
    password: string;
    options?: { displayName?: string };
  }): Promise<{ session: any; error: any }>;
  signIn(params: {
    email: string;
    password: string;
  }): Promise<{ session: any; error: any }>;
}

/**
 * Initialize the Nhost client with the provided project details using the v4 createClient factory.
 * Subdomain: sjpksyugwmepoxjjvzyq
 * Region: eu-central-1
 */
export const baseNhost = new NhostClient({
  subdomain: 'sjpksyugwmepoxjjvzq',
  region: 'eu-central-1'
});

  console.log('✅ Nhost connected successfully')
} catch (error) {
  console.error('❌ Nhost connection failed:', error)
  baseNhost = { auth: {}, storage: {}, graphql: {} } as any
}


// Implement the custom popup/redirect signInWithProvider method on the auth instance
(baseNhost.auth as any).signInWithProvider = async (
  params: { provider: string; options?: { redirectTo?: string } },
  options?: { popup?: boolean }
) => {
  const provider = params.provider;
  const redirectTo = params.options?.redirectTo || window.location.origin;

  // Generate the OAuth Provider URL using Nhost standard client
  const providerUrl = baseNhost.auth.signInProviderURL(provider as any, { redirectTo });

  if (options?.popup) {
    // Open a popup window centered on the screen
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popupWindow = window.open(
      providerUrl,
      'nhost-oauth-popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popupWindow) {
      return {
        session: null,
        error: { message: "Failed to open popup. Please allow popups for this site." }
      };
    }

    // Return a promise that resolves when login succeeds or the popup is closed
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        try {
          // 1. Check if we now have an active Nhost session in the parent window
          const session = baseNhost.sessionStorage.get();
          if (session) {
            clearInterval(checkInterval);
            try {
              popupWindow.close();
            } catch (err) {
              // Ignore potential window close errors
            }
            resolve({ session, error: null });
            return;
          }

          // 2. Check if the popup window has been closed by the user
          if (popupWindow.closed) {
            clearInterval(checkInterval);
            const finalSession = baseNhost.sessionStorage.get();
            if (finalSession) {
              resolve({ session: finalSession, error: null });
            } else {
              resolve({ session: null, error: { message: "Sign-in popup closed by user before completing." } });
            }
            return;
          }

          // 3. Check if popup URL redirected back to our app's origin
          const currentUrl = popupWindow.location.href;
          if (currentUrl.startsWith(window.location.origin)) {
            // Once on our domain, let the popup's instance handle token exchange briefly, then resolve
            clearInterval(checkInterval);
            setTimeout(() => {
              try {
                popupWindow.close();
              } catch (err) {
                // Ignore close errors
              }
              const finalSession = baseNhost.sessionStorage.get();
              resolve({ session: finalSession, error: null });
            }, 1200);
          }
        } catch (e) {
          // Cross-origin errors are expected while the popup is on the Google OAuth domain — safe to ignore
        }
      }, 500);
    });
  } else {
    // Standard direct page redirect flow
    window.location.href = providerUrl;
    return { session: null, error: null };
  }
};

// Implement custom credentials-based signUp method
(baseNhost.auth as any).signUp = async (params: {
  email: string;
  password: string;
  options?: { displayName?: string };
}) => {
  try {
    const response = await baseNhost.auth.signUpEmailPassword({
      email: params.email,
      password: params.password,
      options: params.options,
    }) as any;
    return {
      session: response.session || response.body?.session || null,
      error: response.error,
    };
  } catch (error: any) {
    return {
      session: null,
      error: { message: error?.message || 'Credentials sign-up failed.' },
    };
  }
};

// Implement custom credentials-based signIn method
(baseNhost.auth as any).signIn = async (params: {
  email: string;
  password: string;
}) => {
  try {
    const response = await baseNhost.auth.signInEmailPassword({
      email: params.email,
      password: params.password,
    }) as any;
    return {
      session: response.session || response.body?.session || null,
      error: response.error,
    };
  } catch (error: any) {
    return {
      session: null,
      error: { message: error?.message || 'Credentials sign-in failed.' },
    };
  }
};

// Export the nhost client cast with our custom typed auth interface
export const nhost = baseNhost as Omit<typeof baseNhost, 'auth'> & {
  auth: typeof baseNhost.auth & CustomAuth;
};

// --- EXAMPLES OF HOW TO USE NHOST IN YOUR APPLICATION ---

/**
 * 1. DATABASE EXAMPLES (via GraphQL/Hasura)
 * 
 * To query or mutate data, use `nhost.graphql.request`.
 * Responses are structured inside `.body.data`. Errors throw standard FetchError or can be checked.
 */

interface BinData {
  id: string;
  serial_number: string;
  bin_type: string;
  house_number: string;
  street: string;
  status: string;
}

// Example Query: Get all bins registered to the active user
export async function getMyBinsQuery(): Promise<BinData[]> {
  const GET_BINS_QUERY = `
    query GetMyBins {
      tags {
        id
        serial_number
        status
        registered_by
      }
    }
  `;
  
  try {
    const response = await nhost.graphql.request<{ tags: BinData[] }>({
      query: GET_BINS_QUERY
    });
    
    if (response.body.errors) {
      console.error('GraphQL execution errors:', response.body.errors);
      throw new Error(response.body.errors[0]?.message || 'GraphQL error occurred');
    }
    
    return response.body.data?.tags || [];
  } catch (error) {
    console.error('Error fetching bins from Nhost:', error);
    throw error;
  }
}

// Example Mutation: Register a new smart bin tag
export async function registerBinMutation(variables: {
  serialNumber: string;
  binType: string;
  houseNumber: string;
  street: string;
}) {
  const REGISTER_BIN_MUTATION = `
    mutation RegisterBin($serialNumber: String!) {
      update_tags(
        where: { serial_number: { _eq: $serialNumber } },
        _set: {
          status: "Registered"
        }
      ) {
        affected_rows
      }
    }
  `;

  try {
    const response = await nhost.graphql.request({
      query: REGISTER_BIN_MUTATION,
      variables,
    });

    if (response.body.errors) {
      console.error('GraphQL execution errors:', response.body.errors);
      throw new Error(response.body.errors[0]?.message || 'GraphQL mutation error occurred');
    }

    return response.body.data;
  } catch (error) {
    console.error('Error registering bin in Nhost:', error);
    throw error;
  }
}

/**
 * 2. AUTHENTICATION EXAMPLES
 * 
 * In v4, use explicit credentials-based methods:
 * - signUpEmailPassword
 * - signInEmailPassword
 * - signOut (requires an options object, e.g., `{}`)
 */

// Sign up a new user with email and password
export async function signUpUser(email: string, password: string) {
  try {
    const response = await nhost.auth.signUpEmailPassword({
      email,
      password,
    });
    // Session payload is returned in response.body
    return response.body;
  } catch (error) {
    console.error('Nhost Sign up failed:', error);
    throw error;
  }
}

// Sign in an existing user
export async function signInUser(email: string, password: string) {
  try {
    const response = await nhost.auth.signInEmailPassword({
      email,
      password,
    });
    // Session payload is returned in response.body
    return response.body;
  } catch (error) {
    console.error('Nhost Sign in failed:', error);
    throw error;
  }
}

// Sign out the current user session
export async function signOutUser() {
  try {
    // signOut expects an options body, we pass an empty object
    const response = await nhost.auth.signOut({});
    return response.body;
  } catch (error) {
    console.error('Nhost Sign out failed:', error);
    throw error;
  }
}

/**
 * 3. CUSTOM SERVERLESS FUNCTIONS EXAMPLES
 * 
 * In v4, invoke custom backend endpoints using standard POST/GET calls with `nhost.functions.post`.
 */

// Call a custom webhook or background function (e.g., to trigger a collection notification)
export async function triggerCollectionReminder(binId: string, binType: string) {
  try {
    const response = await nhost.functions.post('/send-collection-reminder', {
      binId,
      binType,
    });
    return response.body;
  } catch (error) {
    console.error('Failed to trigger custom function on Nhost:', error);
    throw error;
  }
}
