import { nhostGraphQLRequest } from './nhost';
import { Bin, BinTag } from '../types';

export function calculateNextOccurrence(
  dayOfWeek: string,
  timeStr: string,
  isBeforeDay: boolean = false
): string {
  const dayMap: Record<string, number> = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };
  const targetDayNum = dayMap[dayOfWeek] ?? 2;
  let hours = 7;
  let minutes = 0;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }
  const now = new Date();
  const targetDate = new Date();
  let dayOffset = targetDayNum - now.getDay();
  if (dayOffset < 0 || (dayOffset === 0 && (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)))) {
    dayOffset += 7;
  }
  targetDate.setDate(now.getDate() + dayOffset);
  if (isBeforeDay) targetDate.setDate(targetDate.getDate() - 1);
  targetDate.setHours(hours, minutes, 0, 0);
  return targetDate.toISOString();
}

export async function syncBinRegistrationToNhost(bin: Bin, ownerId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const updateTagMutation = `
      mutation UpdateTagAssignment($serial: String!, $updates: tags_set_input!) {
        update_tags_by_pk(pk_columns: { serial_number: $serial }, _set: $updates) {
          serial_number
          status
        }
      }
    `;
    await nhostGraphQLRequest(updateTagMutation, {
      serial: bin.serialNumber,
      updates: {
        status: 'registered',
        assigned_to: ownerId,
        bin_id: bin.binId,
        house_number: bin.houseNumber,
        street: bin.street,
        postcode: bin.postcode,
        county: bin.county || '',
        assigned_at: now
      }
    });

    const alertMutation = `
      mutation UpsertCollectionAlert($object: collection_alerts_insert_input!) {
        insert_collection_alerts_one(
          object: $object,
          on_conflict: {
            constraint: collection_alerts_pkey,
            update_columns: [
              bin_type, scheduled_at, scheduled_time, scheduled_date, alarm_sound, 
              enabled, status, push_enabled, email_enabled, in_app_enabled, timezone
            ]
          }
        ) {
          id
          status
        }
      }
    `;
    const beforeRem = bin.reminders?.find(r => r.type === 'before');
    const dayRem = bin.reminders?.find(r => r.type === 'day_of');
    const sound = bin.alarmSound || 'bin_alert';

    const beforeId = `${bin.binId}_before`;
    const beforeTime = beforeRem?.time || '06:00 PM';
    const beforeUtc = calculateNextOccurrence(bin.collectionSchedule.dayOfWeek, beforeTime, true);

    await nhostGraphQLRequest(alertMutation, {
      object: {
        id: beforeId,
        user_id: ownerId,
        bin_id: bin.binId,
        serial_number: bin.serialNumber,
        bin_type: bin.type,
        alert_type: 'before',
        scheduled_at: beforeUtc,
        scheduled_time: beforeTime,
        scheduled_date: beforeUtc.split('T')[0],
        timezone: 'Europe/London',
        alarm_sound: sound,
        enabled: beforeRem ? beforeRem.enabled : true,
        status: (beforeRem ? beforeRem.enabled : true) ? 'scheduled' : 'disabled',
        push_enabled: true,
        email_enabled: true,
        in_app_enabled: true
      }
    });

    const dayId = `${bin.binId}_day_of`;
    const dayTime = dayRem?.time || bin.collectionSchedule.time || '07:00 AM';
    const dayUtc = calculateNextOccurrence(bin.collectionSchedule.dayOfWeek, dayTime, false);

    await nhostGraphQLRequest(alertMutation, {
      object: {
        id: dayId,
        user_id: ownerId,
        bin_id: bin.binId,
        serial_number: bin.serialNumber,
        bin_type: bin.type,
        alert_type: 'day_of',
        scheduled_at: dayUtc,
        scheduled_time: dayTime,
        scheduled_date: dayUtc.split('T')[0],
        timezone: 'Europe/London',
        alarm_sound: sound,
        enabled: dayRem ? dayRem.enabled : true,
        status: (dayRem ? dayRem.enabled : true) ? 'scheduled' : 'disabled',
        push_enabled: true,
        email_enabled: true,
        in_app_enabled: true
      }
    });
    return true;
  } catch (error) {
    console.warn('[Nhost Sync] Registration fallback:', error);
    return false;
  }
}

export async function syncDeleteBinFromNhost(binId: string, serialNumber: string): Promise<boolean> {
  try {
    const releaseTagMutation = `
      mutation ReleaseTag($serial: String!) {
        update_tags_by_pk(
          pk_columns: { serial_number: $serial },
          _set: {
            status: "unassigned",
            assigned_to: null,
            bin_id: null,
            house_number: null,
            street: null,
            postcode: null,
            county: null,
            assigned_at: null
          }
        ) {
          serial_number
        }
      }
    `;
    await nhostGraphQLRequest(releaseTagMutation, { serial: serialNumber });

    const deleteAlertsMutation = `
      mutation DeleteAlerts($binId: String!) {
        delete_collection_alerts(where: { bin_id: { _eq: $binId } }) {
          affected_rows
        }
      }
    `;
    await nhostGraphQLRequest(deleteAlertsMutation, { binId });
    return true;
  } catch (error) {
    console.warn('[Nhost Sync] Delete fallback:', error);
    return false;
  }
}

export async function syncBatchTagsToNhost(tags: BinTag[]): Promise<boolean> {
  try {
    const insertTagsMutation = `
      mutation InsertBatchTags($objects: [tags_insert_input!]!) {
        insert_tags(
          objects: $objects,
          on_conflict: {
            constraint: tags_pkey,
            update_columns: [status, batch_number]
          }
        ) {
          affected_rows
        }
      }
    `;
    const formatted = tags.map(t => ({
      serial_number: t.serialNumber,
      status: t.status,
      batch_number: t.batchNumber,
      created_at: t.createdAt || new Date().toISOString()
    }));
    await nhostGraphQLRequest(insertTagsMutation, { objects: formatted });
    return true;
  } catch (error) {
    return false;
  }
}

export async function syncDeleteTagFromNhost(serialNumber: string): Promise<boolean> {
  try {
    const deleteTagMutation = `
      mutation DeleteTag($serial: String!) {
        delete_tags_by_pk(serial_number: $serial) {
          serial_number
        }
      }
    `;
    await nhostGraphQLRequest(deleteTagMutation, { serial: serialNumber });
    return true;
  } catch (error) {
    return false;
  }
}
