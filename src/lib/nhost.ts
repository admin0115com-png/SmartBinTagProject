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
const baseNhost = createClient({
  subdomain: 'sjpksyugwmepoxjjvzyq',
  region: 'eu-central-1',
});

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
      console.debug('GraphQL execution errors:', response.body.errors);
      throw new Error(response.body.errors[0]?.message || 'GraphQL error occurred');
    }
    
    return response.body.data?.tags || [];
  } catch (error) {
    console.debug('Error fetching bins from Nhost:', error);
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
      console.debug('GraphQL execution errors:', response.body.errors);
      throw new Error(response.body.errors[0]?.message || 'GraphQL mutation error occurred');
    }

    return response.body.data;
  } catch (error) {
    console.debug('Error registering bin in Nhost:', error);
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
    console.debug('Nhost Sign up failed:', error);
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
    console.debug('Nhost Sign in failed:', error);
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
    console.debug('Nhost Sign out failed:', error);
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
    console.debug('Failed to trigger custom function on Nhost:', error);
    throw error;
  }
}

/**
 * 4. TAG & COLLECTION SYNCHRONIZATION HELPERS
 */

let isTagsTableAvailable: boolean | null = null;
let lastTagsTableCheck = 0;
const TAGS_CHECK_COOLDOWN_MS = 60000;

let isAlertsTableAvailable: boolean | null = null;
let lastAlertsTableCheck = 0;

// Permanently release / delete a tag in Nhost: resets to Available stock, clears owner and address, and removes collection alerts
export async function deleteTagInNhost(serialNumber: string): Promise<boolean> {
  const normSerial = serialNumber.trim().toUpperCase();
  try {
    // 1. Fetch tag ID
    const tagRes = await nhost.graphql.request<{ tags: { id: string }[] }>({
      query: `query GetTagIdForDelete($serial: String!) {
        tags(where: { serial_number: { _eq: $serial } }) { id }
      }`,
      variables: { serial: normSerial }
    });

    const tagId = tagRes.body.data?.tags?.[0]?.id;

    // 2. Delete linked collection alerts if tag exists
    if (tagId) {
      try {
        await nhost.graphql.request({
          query: `mutation DeleteAlertsByTag($tagId: uuid!) {
            delete_collection_alerts(where: { tag_id: { _eq: $tagId } }) { affected_rows }
          }`,
          variables: { tagId }
        });
      } catch {}
    }

    // 3. Reset tag back to Available stock in Nhost
    try {
      await nhost.graphql.request({
        query: `mutation ResetTagStock($serial: String!) {
          update_tags(
            where: { serial_number: { _eq: $serial } },
            _set: {
              status: "Available",
              registered_by: null,
              registered_at: null,
              address: null,
              property_name: null,
              bin_colour: null,
              notes: null
            }
          ) {
            affected_rows
          }
        }`,
        variables: { serial: normSerial }
      });
    } catch {}

    // 4. Also clean up from sbt_bins table if it exists in Hasura
    try {
      await nhost.graphql.request({
        query: `mutation DeleteSbtBinEntry($serial: String!) {
          delete_sbt_bins(where: { serial_number: { _eq: $serial } }) { affected_rows }
        }`,
        variables: { serial: normSerial }
      });
    } catch {}

    return true;
  } catch {
    return false;
  }
}

// Update tag address, colour, notes, and property details in Nhost
export async function updateTagInNhost(
  serialNumber: string,
  data: {
    binColour?: string;
    propertyName?: string;
    address?: string;
    notes?: string;
  }
): Promise<boolean> {
  const normSerial = serialNumber.trim().toUpperCase();
  try {
    const res = await nhost.graphql.request({
      query: `mutation UpdateTagDetails(
        $serial: String!,
        $binColour: String,
        $propertyName: String,
        $address: String,
        $notes: String
      ) {
        update_tags(
          where: { serial_number: { _eq: $serial } },
          _set: {
            bin_colour: $binColour,
            property_name: $propertyName,
            address: $address,
            notes: $notes
          }
        ) {
          affected_rows
        }
      }`,
      variables: {
        serial: normSerial,
        binColour: data.binColour || null,
        propertyName: data.propertyName || null,
        address: data.address || null,
        notes: data.notes || null
      }
    });

    if (res.body.errors) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Bench / fetch registered tags directly from Nhost for the authenticated user
export async function fetchUserTagsFromNhost(userUuids: string[]): Promise<Array<{
  id: string;
  serial_number: string;
  status: string;
  registered_at?: string | null;
  bin_colour?: string | null;
  property_name?: string | null;
  address?: string | null;
  notes?: string | null;
  registered_by?: string | null;
}> | null> {
  const validUuids = userUuids.filter(isValidUuid);
  if (validUuids.length === 0) return null;

  // Circuit breaker: skip network calls during cooldown if table was not found
  if (isTagsTableAvailable === false && Date.now() - lastTagsTableCheck < TAGS_CHECK_COOLDOWN_MS) {
    return null;
  }

  try {
    const res = await nhost.graphql.request<{
      tags: Array<{
        id: string;
        serial_number: string;
        status: string;
        registered_at?: string | null;
        bin_colour?: string | null;
        property_name?: string | null;
        address?: string | null;
        notes?: string | null;
        registered_by?: string | null;
      }>;
    }>({
      query: `query FetchUserRegisteredTags($userUuids: [uuid!]!) {
        tags(where: { registered_by: { _in: $userUuids }, status: { _eq: "Registered" } }) {
          id
          serial_number
          status
          registered_at
          bin_colour
          property_name
          address
          notes
          registered_by
        }
      }`,
      variables: { userUuids: validUuids }
    });

    if (res.body.errors) {
      const isMissingTable = res.body.errors.some(e => e.message?.includes('not found in type') || e.message?.includes('query_root'));
      if (isMissingTable) {
        isTagsTableAvailable = false;
        lastTagsTableCheck = Date.now();
      }
      return null;
    }

    isTagsTableAvailable = true;
    return res.body.data?.tags || [];
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('not found in type') || msg.includes('query_root') || msg.includes('no mutations exist')) {
      isTagsTableAvailable = false;
      lastTagsTableCheck = Date.now();
    }
    return null;
  }
}

// Fetch collection alerts from Nhost for specific tag UUIDs
export async function fetchCollectionAlertsForTags(tagIds: string[]): Promise<Array<{
  id: string;
  tag_id: string;
  scheduled_date: string;
  collection_alarm_time: string;
  reminder_days_before: number;
  reminder_time: string;
  repeat_interval_weeks: number;
  notify_push: boolean;
  notify_email: boolean;
  notify_inapp: boolean;
}>> {
  const validIds = tagIds.filter(isValidUuid);
  if (validIds.length === 0) return [];

  // Circuit breaker: skip network calls during cooldown if table was not found
  if (isAlertsTableAvailable === false && Date.now() - lastAlertsTableCheck < TAGS_CHECK_COOLDOWN_MS) {
    return [];
  }

  try {
    const res = await nhost.graphql.request<{
      collection_alerts: Array<{
        id: string;
        tag_id: string;
        scheduled_date: string;
        collection_alarm_time: string;
        reminder_days_before: number;
        reminder_time: string;
        repeat_interval_weeks: number;
        notify_push: boolean;
        notify_email: boolean;
        notify_inapp: boolean;
      }>;
    }>({
      query: `query FetchAlertsForTags($tagIds: [uuid!]!) {
        collection_alerts(where: { tag_id: { _in: $tagIds } }) {
          id
          tag_id
          scheduled_date
          collection_alarm_time
          reminder_days_before
          reminder_time
          repeat_interval_weeks
          notify_push
          notify_email
          notify_inapp
        }
      }`,
      variables: { tagIds: validIds }
    });

    if (res.body.errors) {
      const isMissingTable = res.body.errors.some(e => e.message?.includes('not found in type') || e.message?.includes('query_root'));
      if (isMissingTable) {
        isAlertsTableAvailable = false;
        lastAlertsTableCheck = Date.now();
      }
      return [];
    }

    isAlertsTableAvailable = true;
    return res.body.data?.collection_alerts || [];
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('not found in type') || msg.includes('query_root')) {
      isAlertsTableAvailable = false;
      lastAlertsTableCheck = Date.now();
    }
    return [];
  }
}
