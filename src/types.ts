export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePhoto?: string;
  accountType: 'user' | 'admin';
  postcode?: string;
  notificationPreferences: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    remindersAlerts: boolean;
    foundBinAlerts: boolean;
    damageAlerts: boolean;
    messageAlerts: boolean;
  };
  createdAt: string;
  lastLogin?: string;
  status: 'Active' | 'Suspended';
  emailVerified?: boolean;
}

export interface BinTag {
  serialNumber: string; // e.g., SBT-00000001
  status: 'Available' | 'Registered' | 'Disabled' | 'Lost' | 'Recovered' | 'Destroyed';
  ownerId: string | null;
  registeredDate: string | null;
  manufacturedDate: string;
  nfcEnabled: boolean;
  notes?: string;
}

export type BinColor = 'Black' | 'Green' | 'Blue' | 'Brown' | 'Purple' | 'Red' | 'Other';

export interface Bin {
  binId: string;
  ownerId: string;
  serialNumber: string;
  binType: BinColor;
  propertyName?: string;
  houseNumber: string;
  street: string;
  town: string;
  county: string;
  postcode: string;
  country: string;
  notes?: string;
  registeredDate: string;
  lastUpdated: string;
  status: 'Active' | 'Lost' | 'Recovered' | 'Damaged' | 'Removed';
  nextCollection?: string;
  lastCollection?: string;
  beforeCollectionDate?: string;
  beforeCollectionTime?: string;
  beforeCollectionEnabled?: boolean;
  collectionDayDate?: string;
  collectionDayTime?: string;
  collectionDayEnabled?: boolean;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  alarmTone?: string;
  repeatIntervalWeeks?: number;
  beforeRepeatIntervalWeeks?: number;
  dayRepeatIntervalWeeks?: number;
}

export interface BinReport {
  reportId: string;
  serialNumber: string;
  binId: string | null;
  reportType: 'Found' | 'Damaged';
  description?: string;
  location: string; // descriptive location
  postcode?: string;
  houseNumber?: string;
  gpsCoordinates?: string;
  photoUrl?: string;
  finderName?: string;
  finderEmail?: string;
  finderPhone?: string;
  message?: string;
  createdAt: string;
  status: 'Unread' | 'Read' | 'Resolved' | 'Archived';
}

export interface PrivateMessage {
  messageId: string;
  serialNumber: string;
  ownerId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  createdAt: string;
  status: 'Unread' | 'Read' | 'Archived';
}

export interface ReminderSchedule {
  reminderId: string;
  ownerId: string;
  serialNumber: string;
  collectionDay: string; // 'Monday' | 'Tuesday' etc.
  frequency: 'Weekly' | 'Fortnightly' | 'Monthly';
  reminderOneTime: string; // "18:00"
  reminderTwoTime: string; // "07:00"
  enabled: boolean;
  lastSent?: string;
  nextReminder?: string;
  alarmTone?: string;
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
}

export interface NotificationItem {
  notificationId: string;
  ownerId: string;
  type: 'Collection Reminder' | 'Found Bin' | 'Damage Report' | 'Private Message' | 'Account' | 'System';
  title: string;
  body: string;
  icon?: string;
  createdAt: string;
  read: boolean;
  deleted: boolean;
  actionUrl?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  appVersion: string;
  defaultReminders: {
    reminderOne: string; // "18:00"
    reminderTwo: string; // "07:00"
  };
  supportEmail: string;
  termsVersion: string;
  privacyVersion: string;
}

// Full User Profile System Types
export interface UserProfile {
  id: string;
  userId: string;
  email?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  postcode?: string;
  avatarUrl?: string;
  updatedAt: string;
}

export interface UserNotificationPreferences {
  id: string;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  remindersAlerts: boolean;
  foundBinAlerts: boolean;
  damageAlerts: boolean;
  messageAlerts: boolean;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'dark' | 'light';
  language: string;
  notificationsFrequency: 'instantly' | 'daily' | 'weekly';
  marketingConsent: boolean;
  updatedAt: string;
}

export interface UserDashboardRecord {
  id: string;
  userId: string;
  foundReportsCount: number;
  damageReportsCount: number;
  unreadMessagesCount: number;
  notificationsCount: number;
  upcomingCollectionsCount: number;
  supportTicketsCount: number;
  lastRefresh: string;
}

export interface DeviceSession {
  id: string;
  userId: string;
  deviceName: string;
  osName: string;
  ipAddress: string;
  loginTime: string;
  lastActive: string;
  isActive: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  status: 'SUCCESS' | 'FAILED' | 'INFO';
}

export interface RegistrationHistoryItem {
  id: string;
  userId: string;
  actionType: 'REGISTRATION' | 'ACTIVATION' | 'DEACTIVATION' | 'UPDATE';
  description: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  email?: string;
  phoneNumber?: string;
  serialNumber?: string;
  category?: string;
  preferredResponse?: 'IN_APP' | 'EMAIL' | 'PHONE';
  attachmentName?: string;
  attachmentData?: string;
  referenceCode?: string;
}

export interface ActiveAlarmData {
  serialNumber: string;
  label: string;
  tone: string;
  time: string;
}
