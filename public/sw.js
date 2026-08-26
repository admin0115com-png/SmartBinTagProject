// ============================================================================
// SmartBinTag (SBT) Service Worker - Production Collection Notification Engine
// Supports all 7 Bin Colours, 13 Alarm Tones, Evening Before & Morning Alerts,
// Direct Lock Screen Notification Actions, Sound Triggering, and PWA Background Sync.
// ============================================================================

const CACHE_NAME = 'sbtapp-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Format bin colour badge, emoji, and display details matching registration UI:
 * (Black Bin, Green Bin, Blue Bin, Brown Bin, Purple Bin, Red Bin, Other)
 */
function getBinColourMeta(binColour, serialNumber) {
  const colour = (binColour || 'black').toLowerCase();
  let label = 'Black Bin (General Waste)';
  let emoji = '🗑️';

  switch (colour) {
    case 'green':
    case 'green bin':
      label = 'Green Bin (Recycling)';
      emoji = '♻️';
      break;
    case 'blue':
    case 'blue bin':
      label = 'Blue Bin (Paper & Card)';
      emoji = '📦';
      break;
    case 'brown':
    case 'brown bin':
      label = 'Brown Bin (Garden Waste)';
      emoji = '🍂';
      break;
    case 'purple':
    case 'purple bin':
      label = 'Purple Bin (Glass / Mixed)';
      emoji = '🟣';
      break;
    case 'red':
    case 'red bin':
      label = 'Red Bin (Hazardous / Specialist)';
      emoji = '🔴';
      break;
    case 'other':
    case 'other bin':
    case 'orange':
      label = 'Special Bin (Collection)';
      emoji = '🟠';
      break;
    case 'black':
    case 'black bin':
    default:
      label = 'Black Bin (General Waste)';
      emoji = '🗑️';
      break;
  }

  const serialFormatted = serialNumber ? `[${serialNumber}]` : '';
  return { label, emoji, serialFormatted };
}

/**
 * Maps the 13 Alarm Tones to custom device vibration cadences
 */
function getVibrationPatternForTone(toneName) {
  const tone = (toneName || '').toLowerCase();
  if (tone.includes('siren') || tone.includes('fire') || tone.includes('panic')) {
    // High alert aggressive vibration
    return [400, 100, 400, 100, 400, 100, 400];
  } else if (tone.includes('radar') || tone.includes('whistle') || tone.includes('solar')) {
    // Staccato rhythmic pulse
    return [200, 80, 200, 80, 200, 80, 200];
  } else if (tone.includes('eco') || tone.includes('harmony') || tone.includes('chime')) {
    // Gentle mellow chime cadence
    return [150, 150, 300];
  }
  // Default SmartBinTag notification rhythm
  return [250, 100, 250, 100, 250];
}

// ----------------------------------------------------------------------------
// 1. Background Push Notifications (Lock Screen & Closed Browser)
// ----------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {
    title: 'SmartBinTag Collection Alert',
    body: 'Your bin collection is scheduled now!',
    binColour: 'black',
    serialNumber: '',
    alertType: 'day_of', // 'before' (Evening Before) or 'day_of' (Collection Day Morning)
    alarmTone: 'Chime Classic',
    address: '',
    notes: '',
    repeatInterval: '1 WEEK',
    url: '/?view=my-bins'
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const { label, emoji, serialFormatted } = getBinColourMeta(data.binColour, data.serialNumber);
  const isEveningBefore = data.alertType === 'before' || data.isEveningBefore;

  const headerPrefix = isEveningBefore 
    ? `🌙 EVENING BEFORE ALERT: ${emoji} ${label}`
    : `🔔 COLLECTION MORNING ALERT: ${emoji} ${label}`;

  const addressDetails = data.address ? `\n📍 ${data.address}` : '';
  const noteDetails = data.notes ? `\n📝 "${data.notes}"` : '';

  const mainMessage = data.serialNumber 
    ? `Put out your ${label} ${serialFormatted}.${addressDetails}${noteDetails}`
    : `${data.body}${addressDetails}${noteDetails}`;

  const targetUrl = data.url || (data.serialNumber ? `/?view=my-bins&serial=${data.serialNumber}` : '/?view=my-bins');

  const options = {
    body: mainMessage,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: getVibrationPatternForTone(data.alarmTone),
    tag: `sbt-alert-${data.serialNumber || 'generic'}-${data.alertType || 'notif'}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: targetUrl,
      serialNumber: data.serialNumber,
      binColour: data.binColour,
      alarmTone: data.alarmTone,
      alertType: data.alertType,
      repeatInterval: data.repeatInterval
    },
    actions: [
      { action: 'open', title: '👀 View My Bins' },
      { action: 'snooze', title: '⏰ Snooze 15 Min' },
      { action: 'dismiss', title: '✕ Done' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(headerPrefix, options)
  );
});

// ----------------------------------------------------------------------------
// 2. Notification Click Handler
// ----------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/?view=my-bins';

  // Handle Snooze Action
  if (event.action === 'snooze') {
    targetUrl = `/?view=my-bins&action=snooze&serial=${notifData.serialNumber || ''}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ----------------------------------------------------------------------------
// 3. Client Message Bridge (Trigger In-App / Local Native Alerts)
// ----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { 
      title, 
      body, 
      binColour, 
      serialNumber, 
      alarmTone, 
      alertType, 
      address, 
      notes, 
      url 
    } = event.data;

    const { label, emoji, serialFormatted } = getBinColourMeta(binColour, serialNumber);
    const isEveningBefore = alertType === 'before';

    const displayTitle = title || (isEveningBefore 
      ? `🌙 Evening Before Alert: ${emoji} ${label}`
      : `🔔 Collection Morning Alert: ${emoji} ${label}`);

    const addressText = address ? `\n📍 ${address}` : '';
    const noteText = notes ? `\n📝 ${notes}` : '';
    const displayBody = body || `Time to put out your ${label} ${serialFormatted}.${addressText}${noteText}`;
    const displayUrl = url || `/?view=my-bins${serialNumber ? `&serial=${serialNumber}` : ''}`;

    const options = {
      body: displayBody,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: getVibrationPatternForTone(alarmTone),
      tag: `sbt-manual-${serialNumber || Date.now()}`,
      renotify: true,
      requireInteraction: true,
      data: {
        url: displayUrl,
        serialNumber,
        binColour,
        alarmTone,
        alertType
      },
      actions: [
        { action: 'open', title: '👀 View My Bins' },
        { action: 'snooze', title: '⏰ Snooze 15 Min' },
        { action: 'dismiss', title: '✕ Done' }
      ]
    };

    self.registration.showNotification(displayTitle, options);
  }
});
