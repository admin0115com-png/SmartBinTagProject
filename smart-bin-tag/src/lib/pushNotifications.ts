import { nhost } from './nhost';

export interface PushNotificationPermissionState {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  serviceWorkerRegistered: boolean;
}

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register Service Worker for mobile/tablet background notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    console.log('[SBT Push] Service Worker registered successfully:', reg.scope);
    return reg;
  } catch (err) {
    console.warn('[SBT Push] Service Worker registration failed:', err);
    return null;
  }
}

/**
 * Get current push notification permission and SW status
 */
export function getNotificationPermissionState(): PushNotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      supported: false,
      permission: 'unsupported',
      serviceWorkerRegistered: false,
    };
  }

  return {
    supported: true,
    permission: Notification.permission,
    serviceWorkerRegistered: !!swRegistration || ('serviceWorker' in navigator && !!navigator.serviceWorker.controller),
  };
}

/**
 * Request Notification Permission from Browser / OS
 */
export async function requestPushNotificationPermission(userId?: string): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[SBT Push] Notification permission result:', permission);

    // Register Service Worker if permission granted
    if (permission === 'granted') {
      await registerServiceWorker();
    }

    // Sync notification status to Nhost / Hasura backend
    if (userId) {
      syncNotificationSettingsToNhost(userId, permission === 'granted');
    }

    return permission;
  } catch (err) {
    console.warn('[SBT Push] Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Dispatch a Native System Pop-up Notification to Phone / Tablet Home Screen
 */
export async function sendNativeDeviceNotification(
  title: string,
  body: string,
  options?: { tag?: string; url?: string; sound?: boolean }
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[SBT Push] Cannot send native notification - permission is:', Notification.permission);
    return false;
  }

  const tag = options?.tag || 'sbt-alert-' + Date.now();
  const url = options?.url || '/';

  try {
    // 1. Try Service Worker showNotification first (best for background/mobile/tablet lockscreen)
    if ('serviceWorker' in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready.catch(() => null));
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [300, 100, 300, 100, 300],
          tag,
          renotify: true,
          data: { url },
        });

        // Send message to SW if active
        if (reg.active) {
          reg.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            body,
            tag,
            url,
          });
        }
        return true;
      }
    }

    // 2. Fallback to standard HTML5 Notification API
    const notifOptions: NotificationOptions & { renotify?: boolean } = {
      body,
      icon: '/favicon.svg',
      tag,
      renotify: true,
      data: { url },
    };
    const notif = new Notification(title, notifOptions as NotificationOptions);

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return true;
  } catch (err) {
    console.warn('[SBT Push] Native notification send failed, falling back to window alert:', err);
    return false;
  }
}

/**
 * Sync Push Notification Preferences & Device Token State to Nhost / Hasura backend
 */
export async function syncNotificationSettingsToNhost(userId: string, pushEnabled: boolean): Promise<void> {
  if (!userId) return;

  try {
    await nhost.graphql.request({
      query: `mutation UpdateNotificationPreferences($userId: String!, $pushEnabled: Boolean!) {
        insert_user_notification_preferences_one(
          object: {
            user_id: $userId,
            push_notifications: $pushEnabled,
            collection_alerts: true,
            updated_at: "now()"
          },
          on_conflict: {
            constraint: user_notification_preferences_pkey,
            update_columns: [push_notifications, collection_alerts, updated_at]
          }
        ) {
          user_id
          push_notifications
        }
      }`,
      variables: {
        userId,
        pushEnabled,
      },
    }).catch(err => {
      // Fallback mutation if table columns vary
      nhost.graphql.request({
        query: `mutation UpdatePushSettings($userId: String!, $pushEnabled: Boolean!) {
          update_users(where: { id: { _eq: $userId } }, _set: { push_notifications_enabled: $pushEnabled }) {
            affected_rows
          }
        }`,
        variables: { userId, pushEnabled }
      }).catch(e => console.warn('[Nhost Push Sync] Fallback error:', e));
    });
  } catch (e) {
    console.warn('[Nhost Push Sync] Exception:', e);
  }
}

/**
 * Sync Dispatched Collection Alert Record to Nhost / Hasura backend
 */
export async function syncCollectionAlertToNhost(
  userId: string,
  binId: string,
  alertType: string,
  title: string,
  body: string
): Promise<void> {
  try {
    await nhost.graphql.request({
      query: `mutation RecordCollectionAlert($id: String!, $userId: String!, $binId: String!, $type: String!, $title: String!, $body: String!) {
        insert_collection_alerts_one(object: {
          id: $id,
          user_id: $userId,
          bin_id: $binId,
          alert_type: $type,
          title: $title,
          body: $body,
          status: "DISPATCHED",
          created_at: "now()"
        }) {
          id
        }
      }`,
      variables: {
        id: 'alt-' + Math.random().toString(36).substring(2, 9),
        userId,
        binId,
        type: alertType,
        title,
        body,
      },
    }).catch(err => {
      console.warn('[Nhost Collection Alert Sync] Warning:', err);
    });
  } catch (e) {
    console.warn('[Nhost Collection Alert Sync] Exception:', e);
  }
}
