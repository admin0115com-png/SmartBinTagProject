import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Bin, BinColor, BinReport, ReminderSchedule } from '../types';
import { mockDb } from '../mockDb';
import { nhost, toUuid } from '../lib/nhost';
import {
  Eye, Edit2, Trash2, Calendar, AlertCircle, Check, Plus, Save, X, ArrowLeft, Volume2, Home
} from 'lucide-react';
import RegisterBin, { ALARM_SOUNDS } from './RegisterBin';

interface MyBinsProps {
  ownerId: string;
  bins: Bin[];
  reports: BinReport[];
  reminders: ReminderSchedule[];
  onRefresh: () => void;
  setView: (view: string, params?: Record<string, unknown>) => void;
  initialAction?: string;
}

type NotificationMessage = { text: string; type: 'success' | 'error' } | null;

export default function MyBins({
  ownerId,
  bins,
  reports,
  reminders,
  onRefresh,
  setView,
  initialAction
}: MyBinsProps) {
  // ==== State ====
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingReminders, setIsViewingReminders] = useState(false);
  const [deleteConfirmBinId, setDeleteConfirmBinId] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<NotificationMessage>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Bin edit form state
  const [binType, setBinType] = useState<BinColor>('Black');
  const [propertyName, setPropertyName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [town, setTown] = useState('');
  const [county, setCounty] = useState('');
  const [postcode, setPostcode] = useState('');
  const [notes, setNotes] = useState('');
  const [binStatus, setBinStatus] = useState<Bin['status']>('Active');

  // Reminder form state
  const [reminderId, setReminderId] = useState('');
  const [collectionDay, setCollectionDay] = useState('Monday');
  const [frequency, setFrequency] = useState<'Weekly' | 'Fortnightly' | 'Monthly'>('Weekly');
  const [reminderOneTime, setReminderOneTime] = useState('18:00');
  const [reminderTwoTime, setReminderTwoTime] = useState('07:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [alarmTone, setAlarmTone] = useState('Chime Classic');
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [popUpEnabled, setPopUpEnabled] = useState(true);

  // ==== Helpers ====
  const showNotification = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setNotificationMessage({ text, type });
    setTimeout(() => setNotificationMessage(null), 4000);
  }, []);

  const playSyntheticAlert = useCallback((toneName: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      switch (toneName) {
        case 'Chime Classic':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
          break;
        case 'Digital Alert':
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
          break;
        case 'Eco Sweep':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
          break;
        case 'Emerald Ping':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, ctx.currentTime);
          break;
        case 'Bin Alert High':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          break;
        case 'Solar Pulse':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.85, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.2);
          break;
        case 'District Whistle':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1500, ctx.currentTime);
          break;
        case 'Radar Echo':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.setValueAtTime(100, ctx.currentTime + 0.08);
          osc.frequency.setValueAtTime(600, ctx.currentTime + 0.16);
          break;
        case 'Nhost Sync Ping':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
          break;
        case 'Loud Alarm Siren':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.15);
          osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.85, ctx.currentTime);
          break;
        case 'Fire Alarm Sound':
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          osc.frequency.setValueAtTime(0, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15);
          osc.frequency.setValueAtTime(0, ctx.currentTime + 0.25);
          osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.85, ctx.currentTime);
          break;
        case 'Alarm Panic Sound':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(900, ctx.currentTime);
          osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.08);
          osc.frequency.setValueAtTime(900, ctx.currentTime + 0.16);
          osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.24);
          osc.frequency.setValueAtTime(900, ctx.currentTime + 0.32);
          gain.gain.setValueAtTime(0.85, ctx.currentTime);
          break;
        default:
          osc.type = 'sine';
          osc.frequency.setValueAtTime(329.63, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.25);
      }

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (err) {
      console.warn('Audio Context failed to start:', err);
    }
  }, []);

  // ==== Effects ====
  useEffect(() => {
    if (initialAction === 'configure-alerts' && bins.length > 0) {
      const firstBin = bins[0];
      setSelectedBin(firstBin);
      setIsEditing(false);
      setIsViewingReminders(true);

      const matched = reminders.find(r => r.serialNumber === firstBin.serialNumber);
      if (matched) {
        setReminderId(matched.reminderId);
        setCollectionDay(matched.collectionDay);
        setFrequency(matched.frequency);
        setReminderOneTime(matched.reminderOneTime || '18:00');
        setReminderTwoTime(matched.reminderTwoTime || '07:00');
        setReminderEnabled(matched.enabled);
        setAlarmTone(matched.alarmTone || 'Chime Classic');
        setInAppEnabled(matched.inAppEnabled ?? firstBin.inAppEnabled ?? true);
        setEmailEnabled(matched.emailEnabled ?? firstBin.emailEnabled ?? true);
        setPopUpEnabled(matched.pushEnabled ?? firstBin.pushEnabled ?? true);
      } else {
        setReminderId('');
        setCollectionDay('Monday');
        setFrequency('Weekly');
        setReminderOneTime('18:00');
        setReminderTwoTime('07:00');
        setReminderEnabled(true);
        setAlarmTone('Chime Classic');
        setInAppEnabled(firstBin.inAppEnabled ?? true);
        setEmailEnabled(firstBin.emailEnabled ?? true);
        setPopUpEnabled(firstBin.pushEnabled ?? true);
      }
    }
  }, [initialAction, bins, reminders]);

  // ==== Actions ====
  const resetFormState = useCallback(() => {
    setFormError(null);
    setFormSuccess(null);
  }, []);

  const handleOpenView = useCallback((bin: Bin) => {
    setSelectedBin(bin);
    setIsEditing(false);
    setIsViewingReminders(false);
    resetFormState();
  }, [resetFormState]);

  const handleOpenEdit = useCallback((bin: Bin, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBin(bin);
    setIsEditing(true);
    setIsViewingReminders(false);
    setBinType(bin.binType);
    setPropertyName(bin.propertyName || '');
    setHouseNumber(bin.houseNumber);
    setStreet(bin.street);
    setTown(bin.town);
    setCounty(bin.county);
    setPostcode(bin.postcode);
    setNotes(bin.notes || '');
    setBinStatus(bin.status);
    resetFormState();
  }, [resetFormState]);

  const handleOpenReminders = useCallback((bin: Bin, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBin(bin);
    setIsEditing(false);
    setIsViewingReminders(true);

    const matched = reminders.find(r => r.serialNumber === bin.serialNumber);
    if (matched) {
      setReminderId(matched.reminderId);
      setCollectionDay(matched.collectionDay);
      setFrequency(matched.frequency);
      setReminderOneTime(matched.reminderOneTime || '18:00');
      setReminderTwoTime(matched.reminderTwoTime || '07:00');
      setReminderEnabled(matched.enabled);
      setAlarmTone(matched.alarmTone || 'Chime Classic');
      setInAppEnabled(matched.inAppEnabled ?? bin.inAppEnabled ?? true);
      setEmailEnabled(matched.emailEnabled ?? bin.emailEnabled ?? true);
      setPopUpEnabled(matched.pushEnabled ?? bin.pushEnabled ?? true);
    } else {
      setReminderId('');
      setCollectionDay('Monday');
      setFrequency('Weekly');
      setReminderOneTime('18:00');
      setReminderTwoTime('07:00');
      setReminderEnabled(true);
      setAlarmTone('Chime Classic');
      setInAppEnabled(bin.inAppEnabled ?? true);
      setEmailEnabled(bin.emailEnabled ?? true);
      setPopUpEnabled(bin.pushEnabled ?? true);
    }
    resetFormState();
  }, [reminders, resetFormState]);

  const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBin) return;
    setFormError(null);

    if (!houseNumber || !street || !town || !postcode) {
      setFormError('Please fill in all required address fields.');
      return;
    }

    try {
      mockDb.updateBin(selectedBin.binId, {
        binType,
        propertyName: propertyName || undefined,
        houseNumber,
        street,
        town,
        county,
        postcode,
        notes: notes || undefined,
        status: binStatus,
        nextCollection: mockDb.calculateNextCollection(binType)
      });

      // Sync address/bin details update to Nhost
      if (selectedBin.serialNumber) {
        try {
          const addrString = [houseNumber, street, town, county, postcode].filter(Boolean).join(', ');
          await nhost.graphql.request({
            query: `
              mutation UpdateTagDetails($serialNumber: String!, $binType: String!, $address: String!, $notes: String) {
                update_tags(
                  where: { serial_number: { _eq: $serialNumber } },
                  _set: { bin_type: $binType, address_line_1: $address, notes: $notes }
                ) { affected_rows }
              }
            `,
            variables: {
              serialNumber: selectedBin.serialNumber,
              binType,
              address: addrString,
              notes: notes || null
            }
          });
          console.log('[Nhost sync] Tag address & details updated in Nhost.');
        } catch (nhostErr) {
          console.warn('[Nhost warning] Tag details sync warning:', nhostErr);
        }
      }

      setFormSuccess('Bin details updated successfully!');
      onRefresh();

      const updated = mockDb.getBins(ownerId).find(b => b.binId === selectedBin.binId);
      if (updated) setSelectedBin(updated);

      setTimeout(() => setIsEditing(false), 1000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update details.');
    }
  }, [selectedBin, binType, propertyName, houseNumber, street, town, county, postcode, notes, binStatus, onRefresh, ownerId]);

  const handleReminderSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBin) return;
    setFormError(null);

    const activeReminderId = reminderId || `rem-${Math.random().toString(36).slice(2, 11)}`;

    try {
      mockDb.saveReminderSchedule(activeReminderId, {
        ownerId,
        serialNumber: selectedBin.serialNumber,
        collectionDay,
        frequency,
        reminderOneTime,
        reminderTwoTime,
        enabled: reminderEnabled,
        alarmTone,
        inAppEnabled,
        emailEnabled,
        pushEnabled: popUpEnabled
      });

      // Sync to Nhost
      try {
        const tagRes = await nhost.graphql.request<{ tags: { id: string }[] }>({
          query: `
            query GetTagUUIDForAlert($serialNumber: String!) {
              tags(where: { serial_number: { _eq: $serialNumber } }) { id }
            }
          `,
          variables: { serialNumber: selectedBin.serialNumber }
        });

        const tagUuid = tagRes.body.data?.tags?.[0]?.id;
        if (tagUuid) {
          const repeatWeeks = frequency === 'Fortnightly' ? 2 : frequency === 'Monthly' ? 4 : 1;

          const getIsoCollectionDate = (binType: BinColor) => {
            const defaultDays: Record<BinColor, number> = { Black: 4, Green: 2, Blue: 3, Brown: 5, Purple: 1, Red: 6, Other: 0 };
            const targetDayNum = defaultDays[binType] || 1;
            const today = new Date();
            let daysUntil = targetDayNum - today.getDay();
            if (daysUntil <= 0) daysUntil += 7;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysUntil);
            targetDate.setHours(7, 0, 0, 0);
            return targetDate.toISOString();
          };

          const isoScheduledDate = getIsoCollectionDate(selectedBin.binType);

          const alertCheck = await nhost.graphql.request<{ collection_alerts: { id: string }[] }>({
            query: `
              query CheckAlertForTag($tagId: uuid!) {
                collection_alerts(where: { tag_id: { _eq: $tagId } }) { id }
              }
            `,
            variables: { tagId: tagUuid }
          });

          const existingAlert = alertCheck.body.data?.collection_alerts?.[0];
          const mutation = existingAlert
            ? {
                query: `
                  mutation UpdateCollectionAlert(
                    $id: uuid!, $registeredBy: uuid, $scheduledDate: String!,
                    $collectionAlarmTime: String!, $reminderDaysBefore: Int!,
                    $reminderTime: String!, $repeatIntervalWeeks: Int!,
                    $notifyPush: Boolean!, $notifyEmail: Boolean!, $notifyInapp: Boolean!
                  ) {
                    update_collection_alerts_by_pk(
                      pk_columns: { id: $id },
                      _set: {
                        registered_by: $registeredBy, scheduled_date: $scheduledDate,
                        collection_alarm_time: $collectionAlarmTime, reminder_days_before: $reminderDaysBefore,
                        reminder_time: $reminderTime, repeat_interval_weeks: $repeatIntervalWeeks,
                        notify_push: $notifyPush, notify_email: $notifyEmail, notify_inapp: $notifyInapp
                      }
                    ) { id }
                  }
                `,
                variables: {
                  id: existingAlert.id,
                  registeredBy: toUuid(ownerId),
                  scheduledDate: isoScheduledDate,
                  collectionAlarmTime: reminderTwoTime,
                  reminderDaysBefore: 1,
                  reminderTime: reminderOneTime,
                  repeatIntervalWeeks: repeatWeeks,
                  notifyPush: popUpEnabled,
                  notifyEmail: emailEnabled,
                  notifyInapp: inAppEnabled
                }
              }
            : {
                query: `
                  mutation InsertCollectionAlert(
                    $registeredBy: uuid, $tagId: uuid!, $scheduledDate: String!,
                    $collectionAlarmTime: String!, $reminderDaysBefore: Int!,
                    $reminderTime: String!, $repeatIntervalWeeks: Int!,
                    $notifyPush: Boolean!, $notifyEmail: Boolean!, $notifyInapp: Boolean!
                  ) {
                    insert_collection_alerts_one(
                      object: {
                        registered_by: $registeredBy, tag_id: $tagId, scheduled_date: $scheduledDate,
                        collection_alarm_time: $collectionAlarmTime, reminder_days_before: $reminderDaysBefore,
                        reminder_time: $reminderTime, repeat_interval_weeks: $repeatIntervalWeeks,
                        notify_push: $notifyPush, notify_email: $notifyEmail, notify_inapp: $notifyInapp
                      }
                    ) { id }
                  }
                `,
                variables: {
                  registeredBy: toUuid(ownerId),
                  tagId: tagUuid,
                  scheduledDate: isoScheduledDate,
                  collectionAlarmTime: reminderTwoTime,
                  reminderDaysBefore: 1,
                  reminderTime: reminderOneTime,
                  repeatIntervalWeeks: repeatWeeks,
                  notifyPush: popUpEnabled,
                  notifyEmail: emailEnabled,
                  notifyInapp: inAppEnabled
                }
              };

          await nhost.graphql.request(mutation);
          console.log('[Nhost sync] Collection alerts synced successfully with notification preferences.');
        }
      } catch (nhostErr) {
        console.warn('[Nhost warning] Cloud sync failed:', nhostErr);
      }

      setFormSuccess('Reminder schedule & notification channels saved successfully!');
      onRefresh();

      const updated = mockDb.getBins(ownerId).find(b => b.binId === selectedBin.binId);
      if (updated) setSelectedBin(updated);

      setTimeout(() => setIsViewingReminders(false), 1000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save schedule.');
    }
  }, [selectedBin, reminderId, ownerId, collectionDay, frequency, reminderOneTime, reminderTwoTime, reminderEnabled, alarmTone, inAppEnabled, emailEnabled, popUpEnabled, onRefresh]);

  const handleDeleteBin = useCallback((binId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmBinId(binId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmBinId) return;

    const targetBin = bins.find(b => b.binId === deleteConfirmBinId);
    if (targetBin?.serialNumber) {
      try {
        await nhost.graphql.request({
          query: `
            mutation DeleteBinAndReleaseTag($serialNumber: String!) {
              delete_collection_alerts(where: { tag: { serial_number: { _eq: $serialNumber } } }) { affected_rows }
              update_tags(where: { serial_number: { _eq: $serialNumber } }, _set: { status: "Available", registered_by: null }) { affected_rows }
            }
          `,
          variables: { serialNumber: targetBin.serialNumber }
        });
        console.log('[Nhost sync] Bin deleted and tag released.');
      } catch (nhostErr) {
        console.warn('[Nhost warning] Delete sync failed:', nhostErr);
      }
    }

    mockDb.deleteBin(deleteConfirmBinId);
    onRefresh();
    setSelectedBin(null);
    setDeleteConfirmBinId(null);
    showNotification('Bin registration deleted successfully.', 'success');
  }, [deleteConfirmBinId, bins, onRefresh, showNotification]);

  const handleResolveReport = useCallback((reportId: string) => {
    mockDb.resolveReport(reportId);
    onRefresh();
    if (selectedBin) {
      const updated = mockDb.getBins(ownerId).find(b => b.binId === selectedBin.binId);
      if (updated) setSelectedBin(updated);
    }
    showNotification('Report marked as Resolved! Your bin status has returned to Active.', 'success');
  }, [selectedBin, ownerId, onRefresh, showNotification]);

  // ==== Styling Helpers ====
  const getBinBgColor = useCallback((color: BinColor) => {
    const map: Record<BinColor, string> = {
      Black: 'bg-slate-900 text-white',
      Green: 'bg-emerald-600 text-white',
      Blue: 'bg-blue-600 text-white',
      Brown: 'bg-amber-800 text-white',
      Purple: 'bg-purple-600 text-white',
      Red: 'bg-rose-600 text-white',
      Other: 'bg-orange-500 text-white'
    };
    return map[color] || 'bg-gray-100 text-gray-850';
  }, []);

  const getBinThemeClasses = useCallback((color: BinColor) => {
    const borderMap: Record<BinColor, string> = {
      Black: 'border-slate-700',
      Green: 'border-emerald-600',
      Blue: 'border-blue-600',
      Brown: 'border-amber-800',
      Purple: 'border-purple-600',
      Red: 'border-rose-600',
      Other: 'border-orange-500'
    };
    return `bg-[#03211b]/80 border-4 ${borderMap[color] || 'border-[#064e3f]'} shadow-2xl text-white rounded-[24px]`;
  }, []);

  const getStatusBadgeClass = useCallback((status: Bin['status']) => {
    const map: Record<Bin['status'], string> = {
      Active: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
      Lost: 'bg-rose-950/80 text-rose-400 border-rose-500/40 animate-pulse',
      Recovered: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
      Damaged: 'bg-orange-950/80 text-orange-400 border-orange-500/40',
      Removed: 'bg-slate-950/80 text-slate-400 border-slate-500/40'
    };
    return map[status] || 'bg-slate-900/80 text-slate-400 border-slate-500/40';
  }, []);

  // ==== Render ====
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 select-none space-y-5">
      {/* Back & Home Screen Buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => setView('dashboard', {})}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#45D153] bg-[#04352b] border border-[#064e3f] hover:border-[#45D153] hover:bg-[#064e3f] rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-[#45D153]" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => setView('home', {})}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200 bg-[#02241d] border border-[#064e3f] hover:border-[#45D153] hover:bg-[#064e3f] rounded-xl transition-all cursor-pointer shadow-sm"
          title="Return to Public Home Screen"
        >
          <Home className="h-4 w-4 text-[#45D153]" />
          <span>Home Screen</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-[#064e3f] pb-5">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">My Wheelie Bins</h1>
          <p className="text-emerald-300 text-xs sm:text-sm mt-1">Manage tags, edit details, and configure reminder schedules.</p>
        </div>
        <button
          onClick={() => setView('register-bin', {})}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#45D153] text-[#04352b] font-bold shadow-md shadow-emerald-500/10 hover:bg-emerald-400 transition-all text-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Register Tag</span>
        </button>
      </div>

      {/* Collection Alerts Engine Section */}
      <div className="mt-12 bg-[#02241d]/90 border-2 border-[#064e3f] rounded-2xl p-6 text-white space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#064e3f] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#45D153]/15 border border-[#45D153]/30 rounded-xl flex items-center justify-center text-[#45D153]">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">Collection Alerts Engine</h2>
              <p className="text-xs text-emerald-200/70">Real-time synchronized alarm tags & notification triggers for Nhost / Hasura</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-[#45D153]/40 text-[#45D153] text-[10px] font-black uppercase font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#45D153] animate-ping"></span>
              Live Sync Active
            </span>
          </div>
        </div>

        {bins.length === 0 ? (
          <p className="text-xs text-emerald-100/60 italic font-mono">No registered tags found for collection alerts engine.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bins.map((bin) => {
              const beforeDateStr = bin.beforeCollectionDate || '2026-08-01';
              const dayDateStr = bin.collectionDayDate || '2026-08-02';
              const beforeTimeStr = bin.beforeCollectionTime || '06:00 PM';
              const dayTimeStr = bin.collectionDayTime || '07:00 AM';
              const intervalWeeks = bin.repeatIntervalWeeks || 1;

              return (
                <div key={`alert-engine-${bin.binId}`} className="bg-[#011a14] border border-[#064e3f] rounded-2xl p-5 space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-[#064e3f]/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black px-2.5 py-1 bg-[#032c24] border border-[#45D153]/30 text-[#45D153] rounded-lg">
                        {bin.serialNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${getBinBgColor(bin.binType)}`}>
                        {bin.binType} Bin
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleOpenReminders(bin, e)}
                      className="px-3 py-1 bg-[#064e3f] hover:bg-[#04352b] text-[#45D153] border border-[#45D153]/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Configure Alarms
                    </button>
                  </div>

                  <div className="text-xs text-emerald-100/80 font-medium">
                    📍 {bin.houseNumber} {bin.street}, {bin.postcode}
                  </div>

                  {/* Evening Before Collection Alarm Card */}
                  <div className="bg-[#03211b] border border-[#064e3f] rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-[#45D153]" />
                        Evening Before Collection Alarm Tag
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${bin.beforeCollectionEnabled !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400'}`}>
                        {bin.beforeCollectionEnabled !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                      <div className="bg-[#011a14] p-2 rounded-lg border border-[#064e3f]/40">
                        <span className="text-[8px] text-white font-bold uppercase block">Scheduled Date</span>
                        <span className="font-bold text-white">{beforeDateStr}</span>
                      </div>
                      <div className="bg-[#011a14] p-2 rounded-lg border border-[#064e3f]/40">
                        <span className="text-[8px] text-white font-bold uppercase block">Alarm Time</span>
                        <span className="font-bold text-[#45D153]">{beforeTimeStr}</span>
                      </div>
                      <div className="bg-[#011a14] p-2 rounded-lg border border-[#064e3f]/40">
                        <span className="text-[8px] text-white font-bold uppercase block">Repeat Schedule</span>
                        <span className="font-bold text-white">{intervalWeeks} Week{intervalWeeks > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Collection Day Morning Alarm Card */}
                  <div className="bg-[#03211b] border border-[#064e3f] rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-[#45D153]" />
                        Collection Day Morning Alarm Tag
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${bin.collectionDayEnabled !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400'}`}>
                        {bin.collectionDayEnabled !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                      <div className="bg-[#011a14] p-2 rounded-lg border border-[#064e3f]/40">
                        <span className="text-[8px] text-white font-bold uppercase block">Scheduled Date</span>
                        <span className="font-bold text-white">{dayDateStr}</span>
                      </div>
                      <div className="bg-[#011a14] p-2 rounded-lg border border-[#064e3f]/40">
                        <span className="text-[8px] text-white font-bold uppercase block">Alarm Time</span>
                        <span className="font-bold text-[#45D153]">{dayTimeStr}</span>
                      </div>
                      <div className="bg-[#011a14] p-2 rounded-lg border border-[#064e3f]/40">
                        <span className="text-[8px] text-white font-bold uppercase block">Repeat Schedule</span>
                        <span className="font-bold text-white">{intervalWeeks} Week{intervalWeeks > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-between items-center">
                    <span className="text-[10px] text-emerald-200/60 font-mono">Tone: {bin.alarmTone || 'Chime Classic'}</span>
                    <button
                      type="button"
                      onClick={() => playSyntheticAlert(bin.alarmTone || 'Chime Classic')}
                      className="px-3 py-1 bg-[#032c24] hover:bg-[#064e3f] border border-[#45D153]/30 text-[#45D153] rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Test Alarm Tone</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedBin && !isEditing && !isViewingReminders && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={() => setSelectedBin(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative z-10 inline-block align-bottom bg-[#02241d]/98 backdrop-blur-md rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#064e3f] text-white">
              <div className={`p-6 ${getBinBgColor(selectedBin.binType)} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/20"><Trash2 className="h-6 w-6 text-white" /></div>
                  <div>
                    <h3 className="text-lg font-extrabold">{selectedBin.binType} Wheelie Bin</h3>
                    <p className="text-xs text-white/80 font-mono tracking-wider mt-0.5">TAG ID: {selectedBin.serialNumber}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBin(null)} className="text-white hover:opacity-80 p-1 cursor-pointer" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center bg-[#03211b]/80 p-4 rounded-xl border border-[#064e3f]/65">
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedBin.status)}`}>{selectedBin.status}</span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Address</h4>
                  <p className="text-sm font-semibold">
                    {selectedBin.propertyName && `${selectedBin.propertyName}, `}
                    {selectedBin.houseNumber} {selectedBin.street}
                  </p>
                  <p className="text-sm text-emerald-100/70">{selectedBin.town}, {selectedBin.county}, {selectedBin.postcode}</p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-[#064e3f]/65">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Notes</h4>
                  <p className="text-sm text-emerald-100/90 leading-relaxed italic bg-[#03211b]/60 p-3 rounded-lg border border-[#064e3f]/40">
                    {selectedBin.notes || 'No notes added.'}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#064e3f]/65">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Reminders</h4>
                  <div className="bg-[#03211b]/80 border border-[#064e3f]/65 p-4 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="font-bold">{reminders.find(r => r.serialNumber === selectedBin.serialNumber)?.enabled ? 'Active' : 'Paused'}</p>
                        <p className="text-emerald-100/70 mt-0.5">Next: {selectedBin.nextCollection}</p>
                      </div>
                    </div>
                    <button onClick={(e) => handleOpenReminders(selectedBin, e)} className="px-3 py-1.5 bg-[#45D153] text-[#04352b] hover:bg-[#5ce06a] transition-colors rounded-lg font-bold cursor-pointer">
                      Configure
                    </button>
                  </div>
                </div>

                {reports.filter(r => r.serialNumber === selectedBin.serialNumber).length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#064e3f]/65">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest font-mono">Reports</h4>
                    {reports.filter(r => r.serialNumber === selectedBin.serialNumber).map(r => (
                      <div key={r.reportId} className="p-3 bg-rose-950/40 border border-rose-900/40 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />{r.reportType}
                          </span>
                          <span className="text-[10px] text-rose-400 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-emerald-100 leading-relaxed">{r.description || r.message || 'No description.'}</p>
                        <p className="text-[10px] text-emerald-100/60">Location: {r.location}</p>
                        {(r.status === 'Unread' || r.status === 'Read') && (
                          <button onClick={() => handleResolveReport(r.reportId)} className="w-full mt-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
                            <Check className="h-3.5 w-3.5" /> Resolve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-[#03211b]/80 border-t border-[#064e3f]/65 flex justify-between gap-2.5">
                <button onClick={(e) => handleOpenEdit(selectedBin, e)} className="px-4 py-2.5 bg-[#011a14] hover:bg-[#032c24] border border-[#064e3f] text-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  Edit
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleDeleteBin(selectedBin.binId, {} as React.MouseEvent)} className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    Unregister
                  </button>
                  <button onClick={() => setSelectedBin(null)} className="px-4 py-2.5 bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bin Modal */}
      {selectedBin && isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="absolute inset-0 bg-[#04352b]/60 backdrop-blur-xs transition-opacity" onClick={() => setIsEditing(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom w-full max-w-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle">
              <RegisterBin
                ownerId={selectedBin.ownerId}
                editingBin={selectedBin}
                onSuccess={() => { onRefresh(); setTimeout(() => setIsEditing(false), 1200); }}
                setView={(view) => view === 'my-bins' ? setIsEditing(false) : setView(view, {})}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reminders Modal */}
      {selectedBin && isViewingReminders && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={() => setIsViewingReminders(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative z-10 inline-block align-bottom bg-[#02241d]/98 backdrop-blur-md rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-[#064e3f] text-white">
              <form onSubmit={handleReminderSubmit}>
                <div className="px-6 py-5 border-b border-[#064e3f] flex items-center justify-between bg-[#03211b]/95">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#45D153]" />
                    <h3 className="text-lg font-bold">Reminder Settings</h3>
                  </div>
                  <button type="button" onClick={() => setIsViewingReminders(false)} className="text-white/80 hover:text-white p-1 cursor-pointer" aria-label="Close">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {formError && (
                    <div className="p-3.5 bg-rose-950/50 border border-rose-900/50 text-rose-300 rounded-lg text-xs font-medium flex items-start gap-1.5">
                      <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />{formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="p-3.5 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 rounded-lg text-xs font-medium flex items-start gap-1.5">
                      <Check className="h-4 w-4 text-[#45D153] flex-shrink-0" />{formSuccess}
                    </div>
                  )}

                  <div className="flex items-center justify-between bg-[#03211b]/85 p-4 rounded-xl border border-[#064e3f]/65">
                    <div>
                      <h4 className="text-sm font-bold">Enable Reminders</h4>
                      <p className="text-xs text-emerald-100/60 mt-0.5">Push & email alerts for this bin.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-emerald-950/60 border border-[#064e3f] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#45D153]"></div>
                    </label>
                  </div>

                  {reminderEnabled && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Collection Day</label>
                          <select value={collectionDay} onChange={(e) => setCollectionDay(e.target.value)} className="w-full h-[46px] border border-[#064e3f] rounded-lg text-sm bg-[#011a14] text-white focus:outline-hidden focus:ring-2 focus:ring-[#45D153]/20 focus:border-[#45D153]" required>
                            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Frequency</label>
                          <select value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)} className="w-full h-[46px] border border-[#064e3f] rounded-lg text-sm bg-[#011a14] text-white focus:outline-hidden focus:ring-2 focus:ring-[#45D153]/20 focus:border-[#45D153]" required>
                            <option value="Weekly">Weekly</option>
                            <option value="Fortnightly">Fortnightly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-[#03211b]/80 p-4 rounded-xl border border-[#064e3f]/65 space-y-4">
                        <h5 className="text-[11px] font-black tracking-widest text-[#45D153] uppercase">Alert Times</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Reminder 1 (Day Before)', value: reminderOneTime, setter: setReminderOneTime },
                            { label: 'Reminder 2 (Collection Day)', value: reminderTwoTime, setter: setReminderTwoTime }
                          ].map(({ label, value, setter }) => {
                            const [h, m] = value.split(':');
                            return (
                              <div key={label}>
                                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">{label}</label>
                                <div className="flex gap-1.5">
                                  <select value={h} onChange={(e) => setter(`${e.target.value}:${m || '00'}`)} className="flex-1 h-10 border border-[#064e3f] rounded-lg text-xs font-semibold font-mono bg-[#011a14] text-white">
                                    {Array.from({ length: 23 }, (_, i) => {
                                      const hour = i + 2;
                                      const v = hour === 24 ? '00' : String(hour).padStart(2, '0');
                                      const lbl = hour === 24 ? '12:00 AM' : hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`;
                                      return <option key={v} value={v}>{lbl}</option>;
                                    })}
                                  </select>
                                  <select value={m} onChange={(e) => setter(`${h || '00'}:${e.target.value}`)} className="w-20 h-10 border border-[#064e3f] rounded-lg text-xs font-semibold font-mono bg-[#011a14] text-white">
                                    {['00','01','02','03','05','10','15','20','30','40','45','50','55'].map(min => <option key={min} value={min}>.{min}</option>)}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Alarm Tone ({ALARM_SOUNDS.length} options)</label>
                        <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto border border-[#064e3f]/65 p-2.5 rounded-lg bg-[#011a14]">
                          {ALARM_SOUNDS.map(tone => (
                            <button
                              key={tone}
                              type="button"
                              onClick={() => {
                                setAlarmTone(tone);
                                playSyntheticAlert(tone);
                              }}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer text-left ${alarmTone === tone ? 'bg-[#45D153]/20 border-[#45D153] text-[#45D153] shadow-xs' : 'bg-[#03211b] border-[#064e3f]/60 text-emerald-100/70 hover:text-white hover:border-[#45D153]/40'}`}
                            >
                              <span className="truncate flex-1 pr-1">{tone}</span>
                              <span className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 transition-colors ${alarmTone === tone ? 'bg-[#45D153] text-[#03211b]' : 'bg-[#45D153]/10 text-[#45D153]'}`}>
                                <Volume2 className="h-3 w-3" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-[#064e3f]/50">
                        <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Notification Channels</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <label className="flex items-center gap-2.5 bg-[#011a14] p-2.5 rounded-xl border border-[#064e3f] cursor-pointer hover:border-[#45D153]/50 transition-all select-none">
                            <input
                              type="checkbox"
                              checked={inAppEnabled}
                              onChange={(e) => setInAppEnabled(e.target.checked)}
                              className="rounded border-[#064e3f] bg-[#032c24] text-[#45D153] focus:ring-[#45D153] h-4 w-4"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs text-white font-bold">In-App Alert</span>
                              <span className="text-[9px] text-emerald-200/60">Banner & status</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 bg-[#011a14] p-2.5 rounded-xl border border-[#064e3f] cursor-pointer hover:border-[#45D153]/50 transition-all select-none">
                            <input
                              type="checkbox"
                              checked={emailEnabled}
                              onChange={(e) => setEmailEnabled(e.target.checked)}
                              className="rounded border-[#064e3f] bg-[#032c24] text-[#45D153] focus:ring-[#45D153] h-4 w-4"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs text-white font-bold">Email Alert</span>
                              <span className="text-[9px] text-emerald-200/60">Email digest</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 bg-[#011a14] p-2.5 rounded-xl border border-[#064e3f] cursor-pointer hover:border-[#45D153]/50 transition-all select-none">
                            <input
                              type="checkbox"
                              checked={popUpEnabled}
                              onChange={(e) => setPopUpEnabled(e.target.checked)}
                              className="rounded border-[#064e3f] bg-[#032c24] text-[#45D153] focus:ring-[#45D153] h-4 w-4"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs text-white font-bold">Pop-Up Alert</span>
                              <span className="text-[9px] text-emerald-200/60">Live alarm popup</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsViewingReminders(false)} className="px-4 py-2 text-xs font-bold text-white/80 hover:text-white rounded-lg border border-[#064e3f] bg-[#011a14] cursor-pointer">Cancel</button>
                        <button type="button" onClick={handleReminderSubmit} className="px-5 py-2 text-xs font-black uppercase tracking-wider text-[#04352b] bg-[#45D153] hover:bg-[#5ce06a] rounded-lg cursor-pointer transition-all">Save Reminders</button>
                      </div>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}