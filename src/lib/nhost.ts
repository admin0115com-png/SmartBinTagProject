import { createClient } from '@nhost/nhost-js';

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
let baseNhost: any;

try {
  baseNhost = createClient({
    subdomain: 'sjpksyugwmepoxjjvzyq',
    region: 'eu-central-1',
  });
  console.log('✅ Nhost connected successfully');
} catch (error) {
  console.error('❌ Nhost connection failed:', error);
  baseNhost = { auth: {}, storage: {}, graphql: {} } as any;
}

export { baseNhost };

// Implement the custom popup/redirect signInWithProvider method on the auth instance
if (baseNhost && baseNhost.auth) {
  (baseNhost.auth as any).signInWithProvider = async (
    params: { provider: string; options?: { redirectTo?: string } },
    options?: { popup?: boolean }
  ) => {
    const provider = params.provider;
    const redirectTo = params.options?.redirectTo || window.location.origin;

    const providerUrl = baseNhost.auth.signInProviderURL(provider as any, { redirectTo });

    if (options?.popup) {
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

      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          try {
            const session = baseNhost.sessionStorage?.get?.();
            if (session) {
              clearInterval(checkInterval);
              try {
                popupWindow.close();
              } catch (err) {}
              resolve({ session, error: null });
              return;
            }

            if (popupWindow.closed) {
              clearInterval(checkInterval);
              const finalSession = baseNhost.sessionStorage?.get?.();
              if (finalSession) {
                resolve({ session: finalSession, error: null });
              } else {
                resolve({ session: null, error: { message: "Sign-in popup closed by user before completing." } });
              }
              return;
            }

            const currentUrl = popupWindow.location.href;
            if (currentUrl.startsWith(window.location.origin)) {
              clearInterval(checkInterval);
              setTimeout(() => {
                try {
                  popupWindow.close();
                } catch (err) {}
                const finalSession = baseNhost.sessionStorage?.get?.();
                resolve({ session: finalSession, error: null });
              }, 1200);
            }
          } catch (e) {
            // OAuth redirect cross-origin checks
          }
        }, 500);
      });
    } else {
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
      const response = await (baseNhost.auth as any).signUpEmailPassword({
        email: params.email,
        password: params.password,
        options: params.options,
      });
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
      const response = await (baseNhost.auth as any).signInEmailPassword({
        email: params.email,
        password: params.password,
      });
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
}

// Export the nhost client cast with our custom typed auth interface
export const nhost = baseNhost as Omit<typeof baseNhost, 'auth'> & {
  auth: typeof baseNhost.auth & CustomAuth;
};

interface BinData {
  id: string;
  serial_number: string;
  bin_type: string;
  house_number: string;
  street: string;
  status: string;
}

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
    
    if (response.body?.errors) {
      console.error('GraphQL execution errors:', response.body.errors);
      throw new Error(response.body.errors[0]?.message || 'GraphQL error occurred');
    }
    
    return response.body?.data?.tags || [];
  } catch (error) {
    console.error('Error fetching bins from Nhost:', error);
    throw error;
  }
}

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

    if (response.body?.errors) {
      console.error('GraphQL execution errors:', response.body.errors);
      throw new Error(response.body.errors[0]?.message || 'GraphQL mutation error occurred');
    }

    return response.body?.data;
  } catch (error) {
    console.error('Error registering bin in Nhost:', error);
    throw error;
  }
}

export async function signUpUser(email: string, password: string) {
  try {
    const response = await nhost.auth.signUpEmailPassword({
      email,
      password,
    });
    return response.body;
  } catch (error) {
    console.error('Nhost Sign up failed:', error);
    throw error;
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const response = await nhost.auth.signInEmailPassword({
      email,
      password,
    });
    return response.body;
  } catch (error) {
    console.error('Nhost Sign in failed:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    const response = await nhost.auth.signOut({});
    return response.body;
  } catch (error) {
    console.error('Nhost Sign out failed:', error);
    throw error;
  }
}

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
