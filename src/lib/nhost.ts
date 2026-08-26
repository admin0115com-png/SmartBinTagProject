import { createClient } from '@nhost/nhost-js';

// Production Nhost configuration for SmartBinTag Project
// Connected to live Hasura instance (sjpksyugwmepoxjjvzyq.hasura.eu-central-1.nhost.run)
export const NHOST_SUBDOMAIN = import.meta.env.VITE_NHOST_SUBDOMAIN || 'sjpksyugwmepoxjjvzyq';
export const NHOST_REGION = import.meta.env.VITE_NHOST_REGION || 'eu-central-1';

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
  [key: string]: any;
}

/**
 * Initialize the Nhost client using createClient from @nhost/nhost-js v4.
 * Subdomain: sjpksyugwmepoxjjvzyq
 * Region: eu-central-1
 */
let baseNhost: any;

try {
  baseNhost = createClient({
    subdomain: NHOST_SUBDOMAIN,
    region: NHOST_REGION,
  });
  console.log('✅ Nhost connected successfully to', NHOST_SUBDOMAIN);
} catch (error) {
  console.error('❌ Nhost connection failed:', error);
  baseNhost = { auth: {}, storage: {}, graphql: {}, functions: {} } as any;
}

export { baseNhost };

// Implement custom popup/redirect signInWithProvider method on the auth instance
if (baseNhost && baseNhost.auth) {
  (baseNhost.auth as any).signInWithProvider = async (
    params: { provider: string; options?: { redirectTo?: string } },
    options?: { popup?: boolean }
  ) => {
    const provider = params.provider;
    const redirectTo = params.options?.redirectTo || window.location.origin;

    const providerUrl = baseNhost.auth.signInProviderURL 
      ? baseNhost.auth.signInProviderURL(provider as any, { redirectTo })
      : `https://${NHOST_SUBDOMAIN}.auth.${NHOST_REGION}.nhost.run/v1/signin/provider/${provider}?redirectTo=${encodeURIComponent(redirectTo)}`;

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
            const session = baseNhost.sessionStorage?.get?.() || baseNhost.auth?.getSession?.();
            if (session) {
              clearInterval(checkInterval);
              try { popupWindow.close(); } catch (err) {}
              resolve({ session, error: null });
              return;
            }

            if (popupWindow.closed) {
              clearInterval(checkInterval);
              const finalSession = baseNhost.sessionStorage?.get?.() || baseNhost.auth?.getSession?.();
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
                try { popupWindow.close(); } catch (err) {}
                const finalSession = baseNhost.sessionStorage?.get?.() || baseNhost.auth?.getSession?.();
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
      const fn = (baseNhost.auth as any).signUpEmailPassword || (baseNhost.auth as any).signUp;
      const response = await fn.call(baseNhost.auth, {
        email: params.email,
        password: params.password,
        options: params.options,
      });
      return {
        session: response?.session || response?.body?.session || null,
        error: response?.error || null,
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
      const fn = (baseNhost.auth as any).signInEmailPassword || (baseNhost.auth as any).signIn;
      const response = await fn.call(baseNhost.auth, {
        email: params.email,
        password: params.password,
      });
      return {
        session: response?.session || response?.body?.session || null,
        error: response?.error || null,
      };
    } catch (error: any) {
      return {
        session: null,
        error: { message: error?.message || 'Credentials sign-in failed.' },
      };
    }
  };
}

// Export the nhost client cast with custom typed auth interface
export const nhost = baseNhost as any;

export interface NhostTagRecord {
  serial_number: string;
  status: string;
  batch_number: string;
  assigned_to?: string;
  bin_id?: string;
  house_number?: string;
  street?: string;
  postcode?: string;
  county?: string;
  bin_colour?: string;
  town_city?: string;
  alarm_tone?: string;
  notes?: string;
  created_at?: string;
  assigned_at?: string;
}

export interface NhostCollectionAlertRecord {
  id: string;
  user_id: string;
  bin_id: string;
  serial_number: string;
  bin_type: string;
  bin_colour?: string;
  alert_type: string;
  scheduled_at?: string;
  scheduled_time?: string;
  scheduled_date?: string;
  repeat_interval?: string;
  timezone?: string;
  alarm_sound?: string;
  alarm_tone?: string;
  notes?: string;
  enabled: boolean;
  status?: string;
  push_enabled?: boolean;
  email_enabled?: boolean;
  in_app_enabled?: boolean;
}

export interface BinData {
  id: string;
  serial_number: string;
  bin_type: string;
  house_number: string;
  street: string;
  status: string;
}

/**
 * Helper to test if Nhost backend is reachable
 */
export async function checkNhostConnection(): Promise<boolean> {
  try {
    const res = await fetch(`https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Generic helper for executing GraphQL queries and mutations on Nhost
 */
export async function nhostGraphQLRequest<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const endpoint = `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'Nhost GraphQL query failed');
  }
  return json.data as T;
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
    const response = await nhost.graphql.request({
      query: GET_BINS_QUERY
    });
    
    if (response?.body?.errors || response?.errors) {
      const err = response?.body?.errors?.[0] || response?.errors?.[0];
      console.error('GraphQL execution errors:', err);
      throw new Error(err?.message || 'GraphQL error occurred');
    }
    
    return response?.body?.data?.tags || response?.data?.tags || [];
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

    if (response?.body?.errors || response?.errors) {
      const err = response?.body?.errors?.[0] || response?.errors?.[0];
      console.error('GraphQL execution errors:', err);
      throw new Error(err?.message || 'GraphQL mutation error occurred');
    }

    return response?.body?.data || response?.data;
  } catch (error) {
    console.error('Error registering bin in Nhost:', error);
    throw error;
  }
}

export async function signUpUser(email: string, password: string) {
  try {
    const response = await (nhost.auth as any).signUpEmailPassword({
      email,
      password,
    });
    return response?.body || response;
  } catch (error) {
    console.error('Nhost Sign up failed:', error);
    throw error;
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const response = await (nhost.auth as any).signInEmailPassword({
      email,
      password,
    });
    return response?.body || response;
  } catch (error) {
    console.error('Nhost Sign in failed:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    const response = await (nhost.auth as any).signOut({});
    return response?.body || response;
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
    return response?.body || response;
  } catch (error) {
    console.error('Failed to trigger custom function on Nhost:', error);
    throw error;
  }
}
