import { 
  User, BinTag, Bin, BinColor, BinReport, PrivateMessage, ReminderSchedule, NotificationItem, SystemSettings,
  UserProfile, UserNotificationPreferences, UserSettings, UserDashboardRecord, DeviceSession, AuditLogEntry, RegistrationHistoryItem, SupportTicket
} from './types';
import { nhost } from './lib/nhost';
import { sendNativeDeviceNotification } from './lib/pushNotifications';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Time conversion and date helpers for alarm/reminder synchronization
const to24Hour = (time12?: string): string => {
  if (!time12) return '18:00';
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time12;
  let [_, hoursStr, minsStr, ampm] = match;
  let hours = parseInt(hoursStr, 10);
  if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minsStr}`;
};

const to12Hour = (time24?: string): string => {
  if (!time24) return '06:00 PM';
  const match = time24.match(/(\d+):(\d+)/);
  if (!match) return time24;
  let [_, hoursStr, minsStr] = match;
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minsStr} ${ampm}`;
};

const getNextDateForDayOfWeek = (dayName: string): string => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = daysOfWeek.indexOf(dayName);
  if (targetDay === -1) return new Date().toISOString().split('T')[0];
  
  const now = new Date();
  const currentDay = now.getDay();
  let distance = targetDay - currentDay;
  if (distance <= 0) distance += 7; // force future date
  
  const targetDate = new Date();
  targetDate.setDate(now.getDate() + distance);
  
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getPreviousDateStr = (dateStr: string): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Generate initial tags: ONLY SBT-00000014 is valid!
const generateInitialTags = (): BinTag[] => {
  return [
    {
      serialNumber: 'SBT-00000014',
      status: 'Registered',
      ownerId: 'usr-admin-primary',
      registeredDate: '2026-05-15T12:00:00Z',
      manufacturedDate: '2026-01-10T08:00:00Z',
      nfcEnabled: true
    }
  ];
};

// Initial state with admin account (admin0115.com@gmail.com)
const INITIAL_USERS: User[] = [
  {
    uid: 'usr-admin-primary',
    firstName: 'Admin',
    lastName: 'Primary',
    email: 'admin0115.com@gmail.com',
    profilePhoto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&skinColor=d08b5b&hairColor=4a312c&top=theCaesar&clothing=shirtVNeck&clothesColor=ffffff&facialHairProbability=0&mouth=smile&eyes=happy',
    phoneNumber: '+44 7700 900100',
    accountType: 'admin',
    postcode: 'LN5 8PE',
    createdAt: '2026-07-12T12:00:00Z',
    status: 'Active',
    emailVerified: true,
    notificationPreferences: {
      pushEnabled: true,
      emailEnabled: true,
      remindersAlerts: true,
      foundBinAlerts: true,
      damageAlerts: true,
      messageAlerts: true,
    }
  }
];

const INITIAL_BINS: Bin[] = [
  {
    binId: 'bin-01',
    ownerId: 'usr-admin-primary',
    serialNumber: 'SBT-00000014',
    binType: 'Green',
    propertyName: '',
    houseNumber: '26',
    street: 'Canwick Close',
    town: 'Lincoln',
    county: 'Lincolnshire',
    postcode: 'LN5 8PE',
    country: 'United Kingdom',
    notes: 'Left side of the driveway.',
    registeredDate: '2026-05-15T12:00:00Z',
    lastUpdated: '2026-05-15T12:00:00Z',
    status: 'Active',
    nextCollection: 'Tomorrow, 07:00 AM'
  }
];

const INITIAL_REPORTS: BinReport[] = [
  {
    reportId: 'rep-01',
    serialNumber: 'SBT-00000014',
    binId: 'bin-01',
    reportType: 'Found',
    description: 'Found at 26 Canwick Close.',
    location: 'Near the driveway entrance',
    postcode: 'LN5 8PE',
    houseNumber: '26',
    gpsCoordinates: '53.2200° N, 0.5300° W',
    finderName: 'Sarah Higgins',
    finderEmail: 'sarah.h@example.com',
    finderPhone: '07700 900122',
    message: 'The bin was safely returned to 26 Canwick Close.',
    createdAt: '2026-07-16T10:00:00Z',
    status: 'Unread'
  }
];

const INITIAL_MESSAGES: PrivateMessage[] = [
  {
    messageId: 'msg-01',
    serialNumber: 'SBT-00000014',
    ownerId: 'usr-admin-primary',
    senderName: 'Robert Green',
    senderEmail: 'robert@greenwood.com',
    senderPhone: '07700 900144',
    message: 'Hello, your green bin is currently sitting directly in front of my driveway entry. Could you please pull it back a bit? Thanks!',
    createdAt: '2026-07-16T11:00:00Z',
    status: 'Unread'
  }
];

const INITIAL_REMINDERS: ReminderSchedule[] = [
  {
    reminderId: 'rem-01',
    ownerId: 'usr-admin-primary',
    serialNumber: 'SBT-00000014',
    collectionDay: 'Tuesday',
    frequency: 'Weekly',
    reminderOneTime: '18:00',
    reminderTwoTime: '07:00',
    enabled: true,
    nextReminder: '2026-07-21T18:00:00',
    alarmTone: 'Chime Classic'
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    notificationId: 'not-01',
    ownerId: 'usr-admin-primary',
    type: 'Collection Reminder',
    title: 'Green Bin Collection Tomorrow',
    body: 'Your Green Bin (SBT-00000014) will be collected tomorrow. Please place it outside this evening.',
    createdAt: '2026-07-15T18:00:00Z',
    read: false,
    deleted: false,
    actionUrl: 'my-bins'
  },
  {
    notificationId: 'not-02',
    ownerId: 'usr-admin-primary',
    type: 'Private Message',
    title: 'New Message from Robert Green',
    body: 'A neighbor left a message: "Hello, your green bin is sitting directly in front of my driveway..."',
    createdAt: '2026-07-16T11:01:00Z',
    read: false,
    deleted: false,
    actionUrl: 'notifications'
  }
];

const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  appVersion: '1.0.0',
  defaultReminders: {
    reminderOne: '18:00',
    reminderTwo: '07:00'
  },
  supportEmail: 'support@smartbintag.com',
  termsVersion: '1.0',
  privacyVersion: '1.0'
};

// Initialize localStorage if empty
const initDb = () => {
  const usersStr = localStorage.getItem('sbt_users');
  const tagsStr = localStorage.getItem('sbt_tags');
  
  // Purge legacy fake accounts admin0115@gmail.com and standard0115@gmail.com (John Homeowner)
  let users: User[] = usersStr ? JSON.parse(usersStr) : INITIAL_USERS;
  const filteredUsers = users.filter(u => {
    const em = (u.email || '').toLowerCase().trim();
    return em !== 'admin0115@gmail.com' && em !== 'standard0115@gmail.com';
  });

  if (!filteredUsers.some(u => (u.email || '').toLowerCase().trim() === 'admin0115.com@gmail.com')) {
    filteredUsers.unshift(INITIAL_USERS[0]);
  }

  // Restore & sync persistent avatars across sessions
  filteredUsers.forEach(u => {
    const savedAvatar = localStorage.getItem(`sbt_avatar_${u.uid}`);
    if (savedAvatar) {
      u.profilePhoto = savedAvatar;
    } else if (u.profilePhoto) {
      localStorage.setItem(`sbt_avatar_${u.uid}`, u.profilePhoto);
    }
  });

  localStorage.setItem('sbt_users', JSON.stringify(filteredUsers));

  if (!tagsStr) {
    localStorage.setItem('sbt_tags', JSON.stringify(generateInitialTags()));
  }
  if (!localStorage.getItem('sbt_bins')) {
    localStorage.setItem('sbt_bins', JSON.stringify(INITIAL_BINS));
  }
  if (!localStorage.getItem('sbt_reports')) {
    localStorage.setItem('sbt_reports', JSON.stringify(INITIAL_REPORTS));
  }
  if (!localStorage.getItem('sbt_messages')) {
    localStorage.setItem('sbt_messages', JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem('sbt_reminders')) {
    localStorage.setItem('sbt_reminders', JSON.stringify(INITIAL_REMINDERS));
  }
  if (!localStorage.getItem('sbt_notifications')) {
    localStorage.setItem('sbt_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem('sbt_system_settings')) {
    localStorage.setItem('sbt_system_settings', JSON.stringify(INITIAL_SYSTEM_SETTINGS));
  }

  // Ensure tables exist
  if (!localStorage.getItem('sbt_profiles')) {
    const adminAvatar = localStorage.getItem('sbt_avatar_usr-admin-primary') || INITIAL_USERS[0].profilePhoto || '';
    localStorage.setItem('sbt_profiles', JSON.stringify([
      {
        id: 'prof-admin',
        userId: 'usr-admin-primary',
        firstName: 'Admin',
        lastName: 'Primary',
        phoneNumber: '+44 7700 900100',
        postcode: 'SW1A 1AA',
        avatarUrl: adminAvatar,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prof-admin-typo',
        userId: 'usr-admin-typo',
        firstName: 'Admin',
        lastName: 'Typo',
        phoneNumber: '+44 7700 900100',
        postcode: 'SW1A 1AA',
        avatarUrl: '',
        updatedAt: new Date().toISOString()
      }
    ]));
  }
  
  if (!localStorage.getItem('sbt_notification_preferences')) {
    localStorage.setItem('sbt_notification_preferences', JSON.stringify([
      {
        id: 'np-admin',
        userId: 'usr-admin-primary',
        pushEnabled: true,
        emailEnabled: true,
        remindersAlerts: true,
        foundBinAlerts: true,
        damageAlerts: true,
        messageAlerts: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'np-admin-typo',
        userId: 'usr-admin-typo',
        pushEnabled: true,
        emailEnabled: true,
        remindersAlerts: true,
        foundBinAlerts: true,
        damageAlerts: true,
        messageAlerts: true,
        updatedAt: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('sbt_user_settings')) {
    localStorage.setItem('sbt_user_settings', JSON.stringify([
      {
        id: 'set-admin',
        userId: 'usr-admin-primary',
        theme: 'dark',
        language: 'en',
        notificationsFrequency: 'instantly',
        marketingConsent: false,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'set-admin-typo',
        userId: 'usr-admin-typo',
        theme: 'dark',
        language: 'en',
        notificationsFrequency: 'instantly',
        marketingConsent: false,
        updatedAt: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('sbt_user_dashboards')) {
    localStorage.setItem('sbt_user_dashboards', JSON.stringify([
      {
        id: 'dash-admin',
        userId: 'usr-admin-primary',
        foundReportsCount: 1,
        damageReportsCount: 1,
        unreadMessagesCount: 1,
        notificationsCount: 2,
        upcomingCollectionsCount: 3,
        supportTicketsCount: 2,
        lastRefresh: new Date().toISOString()
      },
      {
        id: 'dash-admin-typo',
        userId: 'usr-admin-typo',
        foundReportsCount: 0,
        damageReportsCount: 0,
        unreadMessagesCount: 0,
        notificationsCount: 0,
        upcomingCollectionsCount: 0,
        supportTicketsCount: 0,
        lastRefresh: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('sbt_device_sessions')) {
    localStorage.setItem('sbt_device_sessions', JSON.stringify([]));
  }

  if (!localStorage.getItem('sbt_audit_logs')) {
    localStorage.setItem('sbt_audit_logs', JSON.stringify([]));
  }

  if (!localStorage.getItem('sbt_registration_history')) {
    localStorage.setItem('sbt_registration_history', JSON.stringify([]));
  }

  if (!localStorage.getItem('sbt_support_tickets')) {
    localStorage.setItem('sbt_support_tickets', JSON.stringify([
      {
        id: 'tick-01',
        userId: 'usr-admin-primary',
        subject: 'Tag NFC Scanner Not Responding',
        description: 'The tag scanner fails on older iOS units with non-Safari integrations.',
        priority: 'HIGH',
        status: 'OPEN',
        createdAt: '2026-07-10T14:30:00Z',
        updatedAt: '2026-07-10T14:30:00Z'
      },
      {
        id: 'tick-02',
        userId: 'usr-admin-primary',
        subject: 'Inquiry regarding tag replacement pricing',
        description: 'Do we get discounts when buying standard packs of 10 tags?',
        priority: 'LOW',
        status: 'RESOLVED',
        createdAt: '2026-07-08T09:00:00Z',
        updatedAt: '2026-07-09T16:20:00Z'
      }
    ]));
  }
};

// Helper to get and set
const isValidSerial = (serial: any): boolean => {
  if (typeof serial !== 'string') return false;
  const trimmed = serial.trim().toUpperCase();
  if (trimmed === 'SBT-ADMIN-MSG') return true;
  const regex = /^SBT-\d{8}$/;
  if (!regex.test(trimmed)) return false;
  const num = parseInt(trimmed.split('-')[1], 10);
  return num >= 0 && num <= 50000000;
};

const getFromStorage = <T>(key: string): T => {
  initDb();
  let data = JSON.parse(localStorage.getItem(key) || '[]');
  
  if (Array.isArray(data)) {
    const originalLength = data.length;
    if (key === 'sbt_bins') {
      data = data.filter((b: any) => b && isValidSerial(b.serialNumber));
    } else if (key === 'sbt_reminders') {
      data = data.filter((r: any) => r && isValidSerial(r.serialNumber));
    } else if (key === 'sbt_reports') {
      data = data.filter((r: any) => r && isValidSerial(r.serialNumber));
    } else if (key === 'sbt_messages') {
      data = data.filter((m: any) => m && isValidSerial(m.serialNumber));
    } else if (key === 'sbt_tags') {
      data = data.filter((t: any) => t && isValidSerial(t.serialNumber));
    } else if (key === 'sbt_notifications') {
      data = data.filter((n: any) => {
        if (!n) return false;
        const combined = `${n.title || ''} ${n.body || ''}`;
        const matches = combined.match(/SBT-[0-9A-Z]+/g);
        if (matches) {
          return matches.every((m: string) => isValidSerial(m));
        }
        return true;
      });
    }
    
    if (data.length < originalLength) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
  return data as T;
};

// Real-time Database Subscription Pub/Sub Engine
type DbChangeListener = () => void;
const dbListeners = new Set<DbChangeListener>();

export const subscribeToDb = (listener: DbChangeListener) => {
  dbListeners.add(listener);
  return () => {
    dbListeners.delete(listener);
  };
};

const triggerDbChange = () => {
  dbListeners.forEach(listener => {
    try {
      listener();
    } catch (e) {
      console.error('[PubSub Error] Listener failed:', e);
    }
  });
};

// Enable cross-tab / cross-iframe synchronicity for absolute Nhost realtime feel
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('sbt_')) {
      triggerDbChange();
    }
  });
}

const getLoggedInUser = (): User | null => {
  const loggedInId = localStorage.getItem('sbt_logged_in_uid');
  if (!loggedInId) return null;
  const users = getFromStorage<User[]>('sbt_users');
  return users.find(u => u.uid === loggedInId && u.status === 'Active') || null;
};

const setToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
  triggerDbChange();
};

export const mockDb = {
  subscribeToDb,
  // --- AUTH SERVICE ---
  getCurrentUser: (): User | null => {
    const loggedInId = localStorage.getItem('sbt_logged_in_uid');
    if (!loggedInId) return null;
    const users = getFromStorage<User[]>('sbt_users');
    const user = users.find(u => u.uid === loggedInId && u.status === 'Active');
    if (!user) return null;

    // Restore persistent avatar if not populated or out of sync
    const savedAvatar = localStorage.getItem(`sbt_avatar_${user.uid}`);
    if (savedAvatar && user.profilePhoto !== savedAvatar) {
      user.profilePhoto = savedAvatar;
    } else if (user.profilePhoto && !savedAvatar) {
      localStorage.setItem(`sbt_avatar_${user.uid}`, user.profilePhoto);
    }
    return user;
  },

  login: (email: string, password_input: string): { success: boolean; user?: User; error?: string } => {
    const users = getFromStorage<User[]>('sbt_users');
    const normalizedEmail = email.trim().toLowerCase();
    
    // Direct match against saved users
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
      return { success: false, error: 'No user account found with that email address.' };
    }
    
    if (user.status === 'Suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact support.' };
    }

    // Restore & sync persistent avatar for login
    const savedAvatar = localStorage.getItem(`sbt_avatar_${user.uid}`);
    if (savedAvatar) {
      user.profilePhoto = savedAvatar;
    } else if (user.profilePhoto) {
      localStorage.setItem(`sbt_avatar_${user.uid}`, user.profilePhoto);
    } else {
      const profiles = getFromStorage<UserProfile[]>('sbt_profiles');
      const p = profiles.find(pr => pr.userId === user.uid);
      if (p?.avatarUrl) {
        user.profilePhoto = p.avatarUrl;
        localStorage.setItem(`sbt_avatar_${user.uid}`, p.avatarUrl);
      }
    }

    // Record login device session
    const sessions = getFromStorage<DeviceSession[]>('sbt_device_sessions');
    const newSession: DeviceSession = {
      id: 'sess-' + generateId(),
      userId: user.uid,
      deviceName: 'Web browser',
      osName: 'Desktop / Mobile OS',
      ipAddress: '127.0.0.1 (Real-time Session)',
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true
    };
    sessions.push(newSession);
    setToStorage('sbt_device_sessions', sessions);

    // Record Audit Log Entry
    const auditLogs = getFromStorage<AuditLogEntry[]>('sbt_audit_logs');
    const newAudit: AuditLogEntry = {
      id: 'audit-' + generateId(),
      userId: user.uid,
      action: 'USER_LOGIN',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent || 'Chrome Agent',
      createdAt: new Date().toISOString(),
      status: 'SUCCESS'
    };
    auditLogs.push(newAudit);
    setToStorage('sbt_audit_logs', auditLogs);

    // Set logged in session
    localStorage.setItem('sbt_logged_in_uid', user.uid);
    user.lastLogin = new Date().toISOString();
    setToStorage('sbt_users', users);
    
    return { success: true, user };
  },

  loginExternal: (email: string, firstName: string, lastName: string): { success: boolean; user: User } => {
    const users = getFromStorage<User[]>('sbt_users');
    const normalizedEmail = email.trim().toLowerCase();
    
    let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
      const isAdmin = normalizedEmail === 'admin0115@gmail.com' || normalizedEmail === 'admin0115.com@gmail.com';
      user = {
        uid: 'usr-' + generateId(),
        firstName: firstName || 'Google',
        lastName: lastName || 'User',
        email,
        accountType: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        status: 'Active',
        emailVerified: true,
        notificationPreferences: {
          pushEnabled: true,
          emailEnabled: true,
          remindersAlerts: true,
          foundBinAlerts: true,
          damageAlerts: true,
          messageAlerts: true,
        }
      };
      
      users.push(user);
      setToStorage('sbt_users', users);
      
      // Create profile record
      const profiles = getFromStorage<UserProfile[]>('sbt_profiles');
      profiles.push({
        id: 'prof-' + generateId(),
        userId: user.uid,
        firstName: user.firstName,
        lastName: user.lastName,
        postcode: '',
        avatarUrl: '',
        updatedAt: new Date().toISOString()
      });
      setToStorage('sbt_profiles', profiles);
    } else {
      // Restore persistent avatar on existing user login
      const savedAvatar = localStorage.getItem(`sbt_avatar_${user.uid}`);
      if (savedAvatar) {
        user.profilePhoto = savedAvatar;
      }
    }
    
    // Set logged in session
    localStorage.setItem('sbt_logged_in_uid', user.uid);
    user.lastLogin = new Date().toISOString();
    user.emailVerified = true;
    setToStorage('sbt_users', users);
    
    return { success: true, user };
  },

  logout: (): void => {
    const loggedInId = localStorage.getItem('sbt_logged_in_uid');
    if (loggedInId) {
      // Mark session as inactive
      const sessions = getFromStorage<DeviceSession[]>('sbt_device_sessions');
      const updated = sessions.map(s => s.userId === loggedInId ? { ...s, isActive: false } : s);
      setToStorage('sbt_device_sessions', updated);

      // Add audit log
      const auditLogs = getFromStorage<AuditLogEntry[]>('sbt_audit_logs');
      auditLogs.push({
        id: 'audit-' + generateId(),
        userId: loggedInId,
        action: 'USER_LOGOUT',
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent || 'Chrome Agent',
        createdAt: new Date().toISOString(),
        status: 'SUCCESS'
      });
      setToStorage('sbt_audit_logs', auditLogs);
    }
    localStorage.removeItem('sbt_logged_in_uid');
  },

  register: (firstName: string, lastName: string, email: string, phoneNumber?: string): { success: boolean; user?: User; error?: string } => {
    const users = getFromStorage<User[]>('sbt_users');
    const normalizedEmail = email.trim().toLowerCase();
    
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    // Determine accountType. Per requirement:
    // admin0115@gmail.com and admin0115.com@gmail.com are admin accounts. Rest are normal users.
    const isAdmin = normalizedEmail === 'admin0115@gmail.com' || normalizedEmail === 'admin0115.com@gmail.com';

    const newUser: User = {
      uid: 'usr-' + generateId(),
      firstName,
      lastName,
      email,
      phoneNumber,
      accountType: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      status: 'Active',
      emailVerified: false,
      notificationPreferences: {
        pushEnabled: true,
        emailEnabled: true,
        remindersAlerts: true,
        foundBinAlerts: true,
        damageAlerts: true,
        messageAlerts: true,
      }
    };

    users.push(newUser);
    setToStorage('sbt_users', users);
    
    // 1. Automatically create User Profile record
    const profiles = getFromStorage<UserProfile[]>('sbt_profiles');
    const newProfile: UserProfile = {
      id: 'prof-' + generateId(),
      userId: newUser.uid,
      firstName,
      lastName,
      phoneNumber,
      postcode: '',
      avatarUrl: '',
      updatedAt: new Date().toISOString()
    };
    profiles.push(newProfile);
    setToStorage('sbt_profiles', profiles);

    // 2. Automatically create Notification Preferences record
    const notifPrefs = getFromStorage<UserNotificationPreferences[]>('sbt_notification_preferences');
    const newPrefs: UserNotificationPreferences = {
      id: 'np-' + generateId(),
      userId: newUser.uid,
      pushEnabled: true,
      emailEnabled: true,
      remindersAlerts: true,
      foundBinAlerts: true,
      damageAlerts: true,
      messageAlerts: true,
      updatedAt: new Date().toISOString()
    };
    notifPrefs.push(newPrefs);
    setToStorage('sbt_notification_preferences', notifPrefs);

    // 3. Automatically create Settings record
    const settings = getFromStorage<UserSettings[]>('sbt_user_settings');
    const newSettings: UserSettings = {
      id: 'set-' + generateId(),
      userId: newUser.uid,
      theme: 'dark',
      language: 'en',
      notificationsFrequency: 'instantly',
      marketingConsent: false,
      updatedAt: new Date().toISOString()
    };
    settings.push(newSettings);
    setToStorage('sbt_user_settings', settings);

    // 4. Automatically create Dashboard record
    const dashboards = getFromStorage<UserDashboardRecord[]>('sbt_user_dashboards');
    const newDash: UserDashboardRecord = {
      id: 'dash-' + generateId(),
      userId: newUser.uid,
      foundReportsCount: 0,
      damageReportsCount: 0,
      unreadMessagesCount: 0,
      notificationsCount: 1, // Welcome notification
      upcomingCollectionsCount: 0,
      supportTicketsCount: 0,
      lastRefresh: new Date().toISOString()
    };
    dashboards.push(newDash);
    setToStorage('sbt_user_dashboards', dashboards);

    // 5. Automatically create Device Session
    const sessions = getFromStorage<DeviceSession[]>('sbt_device_sessions');
    const newSession: DeviceSession = {
      id: 'sess-' + generateId(),
      userId: newUser.uid,
      deviceName: 'Chrome Web Browser',
      osName: 'Desktop / Mobile Client',
      ipAddress: '127.0.0.1 (Auto Registration)',
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true
    };
    sessions.push(newSession);
    setToStorage('sbt_device_sessions', sessions);

    // 6. Automatically create Audit Log Entry
    const auditLogs = getFromStorage<AuditLogEntry[]>('sbt_audit_logs');
    const newAudit: AuditLogEntry = {
      id: 'audit-' + generateId(),
      userId: newUser.uid,
      action: 'USER_REGISTRATION',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent || 'Chrome Agent',
      createdAt: new Date().toISOString(),
      status: 'SUCCESS'
    };
    auditLogs.push(newAudit);
    setToStorage('sbt_audit_logs', auditLogs);

    // 7. Automatically create Registration History
    const histories = getFromStorage<RegistrationHistoryItem[]>('sbt_registration_history');
    const newHist: RegistrationHistoryItem = {
      id: 'hist-' + generateId(),
      userId: newUser.uid,
      actionType: 'REGISTRATION',
      description: 'Account registration successfully processed. Initial profile schemas synchronized.',
      timestamp: new Date().toISOString()
    };
    histories.push(newHist);
    setToStorage('sbt_registration_history', histories);

    // Automatically log them in
    localStorage.setItem('sbt_logged_in_uid', newUser.uid);

    // Create system notification
    mockDb.addNotification(
      newUser.uid,
      'Account',
      'Welcome to Smart Bin Tag!',
      'Thank you for registering. You can now register your physical Smart Bin Tag sticker.'
    );

    return { success: true, user: newUser };
  },

  // --- PROFILE DATA SERVICES (Real-time Simulated Accessors) ---
  getProfile: (userId: string): UserProfile | null => {
    const profiles = getFromStorage<UserProfile[]>('sbt_profiles');
    return profiles.find(p => p.userId === userId) || null;
  },

  getNotificationPreferences: (userId: string): UserNotificationPreferences | null => {
    const prefs = getFromStorage<UserNotificationPreferences[]>('sbt_notification_preferences');
    return prefs.find(p => p.userId === userId) || null;
  },

  getSettings: (userId: string): UserSettings | null => {
    const list = getFromStorage<UserSettings[]>('sbt_user_settings');
    return list.find(s => s.userId === userId) || null;
  },

  getDashboardRecord: (userId: string): UserDashboardRecord | null => {
    const list = getFromStorage<UserDashboardRecord[]>('sbt_user_dashboards');
    return list.find(d => d.userId === userId) || null;
  },

  getDeviceSessions: (userId: string): DeviceSession[] => {
    const sessions = getFromStorage<DeviceSession[]>('sbt_device_sessions');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType !== 'admin' && userId !== user.uid) {
      return sessions.filter(s => s.userId === user.uid);
    }
    return sessions.filter(s => s.userId === userId);
  },

  getAuditLogs: (userId: string): AuditLogEntry[] => {
    const logs = getFromStorage<AuditLogEntry[]>('sbt_audit_logs');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType !== 'admin' && userId !== user.uid) {
      return logs.filter(l => l.userId === user.uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return logs.filter(l => l.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAllAuditLogs: (): AuditLogEntry[] => {
    const user = getLoggedInUser();
    if (!user || user.accountType !== 'admin') {
      return [];
    }
    const logs = getFromStorage<AuditLogEntry[]>('sbt_audit_logs');
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRegistrationHistory: (userId: string): RegistrationHistoryItem[] => {
    const history = getFromStorage<RegistrationHistoryItem[]>('sbt_registration_history');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType !== 'admin' && userId !== user.uid) {
      return history.filter(h => h.userId === user.uid).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return history.filter(h => h.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getAllRegistrationHistory: (): RegistrationHistoryItem[] => {
    const user = getLoggedInUser();
    if (!user || user.accountType !== 'admin') {
      return [];
    }
    const history = getFromStorage<RegistrationHistoryItem[]>('sbt_registration_history');
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getSupportTickets: (userId?: string): SupportTicket[] => {
    const tickets = getFromStorage<SupportTicket[]>('sbt_support_tickets');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType === 'admin' || userId === 'ALL') {
      return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const targetUid = userId || user.uid;
    return tickets.filter(t => t.userId === targetUid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  submitSupportTicket: (
    userId: string, 
    subject: string, 
    description: string, 
    priority: SupportTicket['priority'] = 'MEDIUM',
    extra?: {
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
  ): SupportTicket => {
    const tickets = getFromStorage<SupportTicket[]>('sbt_support_tickets');
    const refCode = extra?.referenceCode || `SBT-TK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTicket: SupportTicket = {
      id: 'tick-' + generateId(),
      userId,
      subject,
      description,
      priority,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: extra?.customerName,
      email: extra?.email,
      phoneNumber: extra?.phoneNumber,
      serialNumber: extra?.serialNumber,
      category: extra?.category,
      preferredResponse: extra?.preferredResponse || 'IN_APP',
      attachmentName: extra?.attachmentName,
      attachmentData: extra?.attachmentData,
      referenceCode: refCode
    };
    tickets.push(newTicket);
    setToStorage('sbt_support_tickets', tickets);

    // Nhost Hasura Data Sync
    try {
      nhost.graphql.request({
        query: `mutation InsertSupportTicket($id: String!, $user_id: String!, $subject: String!, $desc: String!, $priority: String!, $status: String!, $ref: String) {
          insert_support_tickets_one(object: {
            id: $id,
            user_id: $user_id,
            subject: $subject,
            description: $desc,
            priority: $priority,
            status: $status,
            reference_code: $ref
          }) { id }
        }`,
        variables: {
          id: newTicket.id,
          user_id: userId,
          subject: subject,
          desc: description,
          priority: priority,
          status: 'OPEN',
          ref: refCode
        }
      }).catch(err => console.warn('[Nhost Cloud Sync] Support ticket save warning:', err));
    } catch (e) {
      console.warn('[Nhost Cloud Sync] Exception saving support ticket:', e);
    }

    // Log action to Registration History & Audit Log
    const histories = getFromStorage<RegistrationHistoryItem[]>('sbt_registration_history');
    histories.push({
      id: 'hist-' + generateId(),
      userId,
      actionType: 'UPDATE',
      description: `Opened Support Ticket: ${subject}`,
      timestamp: new Date().toISOString()
    });
    setToStorage('sbt_registration_history', histories);

    const auditLogs = getFromStorage<AuditLogEntry[]>('sbt_audit_logs');
    auditLogs.push({
      id: 'audit-' + generateId(),
      userId,
      action: 'CREATE_SUPPORT_TICKET',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent || 'Chrome Agent',
      createdAt: new Date().toISOString(),
      status: 'SUCCESS'
    });
    setToStorage('sbt_audit_logs', auditLogs);

    // Update Dashboard Ticket Count
    const dashboards = getFromStorage<UserDashboardRecord[]>('sbt_user_dashboards');
    const dashIdx = dashboards.findIndex(d => d.userId === userId);
    if (dashIdx !== -1) {
      dashboards[dashIdx].supportTicketsCount = tickets.filter(t => t.userId === userId).length;
      dashboards[dashIdx].lastRefresh = new Date().toISOString();
      setToStorage('sbt_user_dashboards', dashboards);
    }

    return newTicket;
  },

  updateSupportTicketStatus: (ticketId: string, status: SupportTicket['status']): void => {
    const tickets = getFromStorage<SupportTicket[]>('sbt_support_tickets');
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      tickets[index].status = status;
      tickets[index].updatedAt = new Date().toISOString();
      setToStorage('sbt_support_tickets', tickets);

      // Sync status update to Nhost / Hasura backend support_tickets table
      try {
        nhost.graphql.request({
          query: `mutation UpdateSupportTicket($id: String!, $status: String!) {
            update_support_tickets(where: { id: { _eq: $id } }, _set: { status: $status }) {
              affected_rows
            }
          }`,
          variables: { id: ticketId, status }
        }).catch(err => console.warn('[Nhost Cloud Sync] Update support ticket status warning:', err));
      } catch (e) {
        console.warn('[Nhost Cloud Sync] Exception updating support ticket status:', e);
      }
    }
  },

  deleteSupportTicket: (ticketId: string): void => {
    const tickets = getFromStorage<SupportTicket[]>('sbt_support_tickets');
    const filtered = tickets.filter(t => t.id !== ticketId);
    setToStorage('sbt_support_tickets', filtered);

    // Sync deletion to Nhost / Hasura backend support_tickets table
    try {
      nhost.graphql.request({
        query: `mutation DeleteSupportTicket($id: String!) {
          delete_support_tickets(where: { id: { _eq: $id } }) {
            affected_rows
          }
        }`,
        variables: { id: ticketId }
      }).catch(err => console.warn('[Nhost Cloud Sync] Delete support ticket warning:', err));
    } catch (e) {
      console.warn('[Nhost Cloud Sync] Exception deleting support ticket:', e);
    }
  },

  getUsers: (): User[] => {
    const user = getLoggedInUser();
    if (!user) return [];
    const users = getFromStorage<User[]>('sbt_users');
    
    // Ensure avatar URLs are attached from persistent store
    users.forEach(u => {
      const saved = localStorage.getItem(`sbt_avatar_${u.uid}`);
      if (saved) {
        u.profilePhoto = saved;
      }
    });

    if (user.accountType === 'admin') {
      return users;
    }
    return users.filter(u => u.uid === user.uid);
  },

  updateUser: (uid: string, fields: Partial<User>): User => {
    const users = getFromStorage<User[]>('sbt_users');
    const index = users.findIndex(u => u.uid === uid);
    if (index === -1) throw new Error('User not found');
    
    users[index] = { ...users[index], ...fields } as User;
    
    // 1. Persistent dedicated avatar store
    if (fields.profilePhoto !== undefined) {
      if (fields.profilePhoto) {
        localStorage.setItem(`sbt_avatar_${uid}`, fields.profilePhoto);
      } else {
        localStorage.removeItem(`sbt_avatar_${uid}`);
      }
    }

    setToStorage('sbt_users', users);

    // 2. Synchronize sbt_profiles table
    const profiles = getFromStorage<UserProfile[]>('sbt_profiles');
    const pIdx = profiles.findIndex(p => p.userId === uid);
    const photoToSave = fields.profilePhoto !== undefined ? fields.profilePhoto : (users[index].profilePhoto || '');

    if (pIdx !== -1) {
      profiles[pIdx] = {
        ...profiles[pIdx],
        firstName: fields.firstName ?? profiles[pIdx].firstName,
        lastName: fields.lastName ?? profiles[pIdx].lastName,
        phoneNumber: fields.phoneNumber ?? profiles[pIdx].phoneNumber,
        postcode: fields.postcode ?? profiles[pIdx].postcode,
        avatarUrl: photoToSave,
        updatedAt: new Date().toISOString()
      };
    } else {
      profiles.push({
        id: 'prof-' + generateId(),
        userId: uid,
        firstName: users[index].firstName,
        lastName: users[index].lastName,
        phoneNumber: users[index].phoneNumber,
        postcode: users[index].postcode,
        avatarUrl: photoToSave,
        updatedAt: new Date().toISOString()
      });
    }
    setToStorage('sbt_profiles', profiles);

    // 3. Synchronize to Nhost GraphQL if avatar or profile changed
    if (fields.profilePhoto !== undefined) {
      try {
        nhost.graphql.request({
          query: `mutation UpdateAvatar($uid: String!, $avatarUrl: String!) {
            update_sbt_profiles(where: { user_id: { _eq: $uid } }, _set: { avatar_url: $avatarUrl }) {
              affected_rows
            }
          }`,
          variables: { uid, avatarUrl: fields.profilePhoto || '' }
        }).catch(err => console.warn('[Nhost Cloud Sync] Avatar update warning:', err));
      } catch (e) {
        console.warn('[Nhost Cloud Sync] Exception updating avatar in Nhost:', e);
      }
    }

    return users[index];
  },

  deleteUser: (uid: string): boolean => {
    const users = getFromStorage<User[]>('sbt_users');
    const filtered = users.filter(u => u.uid !== uid);
    setToStorage('sbt_users', filtered);
    
    // Disassociate bins owned by this user
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const userBins = bins.filter(b => b.ownerId === uid);
    const updatedBins = bins.filter(b => b.ownerId !== uid);
    setToStorage('sbt_bins', updatedBins);

    // Delete reminders
    const reminders = getFromStorage<any[]>('sbt_reminders');
    const userSerials = new Set(userBins.map(b => b.serialNumber));
    const remainingReminders = reminders.filter(r => !userSerials.has(r.serialNumber));
    setToStorage('sbt_reminders', remainingReminders);

    // Release tags
    const tags = getFromStorage<BinTag[]>('sbt_tags');
    const updatedTags = tags.map(t => {
      if (t.ownerId === uid) {
        return { ...t, status: 'Available' as const, ownerId: null, registeredDate: null };
      }
      return t;
    });
    setToStorage('sbt_tags', updatedTags);

    // Clean up profiles, notifications, messages
    const profiles = getFromStorage<any[]>('sbt_profiles');
    setToStorage('sbt_profiles', profiles.filter((p: any) => p.userId !== uid));

    const notifs = getFromStorage<any[]>('sbt_notifications');
    setToStorage('sbt_notifications', notifs.filter((n: any) => n.ownerId !== uid));

    const msgs = getFromStorage<any[]>('sbt_messages');
    setToStorage('sbt_messages', msgs.filter((m: any) => m.ownerId !== uid));

    return true;
  },

  adminResetUserPassword: (email: string): string => {
    const users = getFromStorage<User[]>('sbt_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) throw new Error('Homeowner account not found.');
    
    const tempPass = 'SBT-' + Math.floor(100000 + Math.random() * 900000);
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase().trim()) {
        return { ...u, password: tempPass };
      }
      return u;
    });
    setToStorage('sbt_users', updatedUsers);
    return tempPass;
  },

  changePassword: (email: string, newPassword_input: string): boolean => {
    const users = getFromStorage<any[]>('sbt_users');
    const normalizedEmail = email.trim().toLowerCase();
    const index = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (index !== -1) {
      users[index].password = newPassword_input;
      setToStorage('sbt_users', users);
      return true;
    }
    return false;
  },

  adminResetUserAssociation: (uid: string): boolean => {
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const userBins = bins.filter(b => b.ownerId === uid);
    const remainingBins = bins.filter(b => b.ownerId !== uid);
    setToStorage('sbt_bins', remainingBins);

    const tags = getFromStorage<BinTag[]>('sbt_tags');
    const updatedTags = tags.map(t => {
      if (t.ownerId === uid) {
        return { ...t, status: 'Available' as const, ownerId: null, registeredDate: null };
      }
      return t;
    });
    setToStorage('sbt_tags', updatedTags);

    const reminders = getFromStorage<any[]>('sbt_reminders');
    const userSerials = new Set(userBins.map(b => b.serialNumber));
    const remainingReminders = reminders.filter(r => !userSerials.has(r.serialNumber));
    setToStorage('sbt_reminders', remainingReminders);

    return true;
  },

  // --- SERIAL NUMBER / TAG SERVICE ---
  validateSerialNumber: (serialNumber: string): { valid: boolean; tag: BinTag | null; error?: string } => {
    let raw = (serialNumber || '').trim().toUpperCase();
    if (!raw) {
      return {
        valid: false,
        tag: null,
        error: 'Serial number is required. Format must be SBT- followed by 8 numbers (e.g. SBT-00000000 to SBT-50000000).'
      };
    }

    let digits = '';
    if (raw.startsWith('SBT-')) {
      digits = raw.substring(4).trim();
    } else if (raw.startsWith('SBT')) {
      digits = raw.substring(3).trim();
    } else if (/^\d+$/.test(raw)) {
      // User typed ONLY numbers -> Auto-add SBT- prefix and pad to 8 digits
      digits = raw.trim();
    } else {
      return {
        valid: false,
        tag: null,
        error: `Invalid serial number '${serialNumber}'. Format MUST be 'SBT-' followed by 8 numbers (e.g. SBT-00000000).`
      };
    }

    // Auto-pad 1-8 digits to 8 digits with leading zeros
    if (/^\d{1,8}$/.test(digits)) {
      digits = digits.padStart(8, '0');
    }

    // Enforce EXACTLY 8 digits
    if (!/^\d{8}$/.test(digits)) {
      return { 
        valid: false, 
        tag: null, 
        error: `Invalid serial number '${serialNumber}'. Must contain EXACTLY 8 numbers after 'SBT-' (e.g. SBT-00000000).` 
      };
    }

    const numericPart = parseInt(digits, 10);
    if (numericPart < 0 || numericPart > 50000000) {
      return { 
        valid: false, 
        tag: null, 
        error: `Invalid serial number range. Must be between SBT-00000000 and SBT-50000000.` 
      };
    }

    let normalized = `SBT-${digits}`;

    const tags = getFromStorage<BinTag[]>('sbt_tags');
    let tag = tags.find(t => t.serialNumber === normalized) || null;

    // If valid serial but doesn't exist in our pre-seeds, dynamically manufacture it!
    // This supports our scale promise (50,000,000 unique tags).
    if (!tag) {
      tag = {
        serialNumber: normalized,
        status: 'Available',
        ownerId: null,
        registeredDate: null,
        manufacturedDate: new Date().toISOString(),
        nfcEnabled: true
      };
      tags.push(tag);
      setToStorage('sbt_tags', tags);
    }

    if (tag.status === 'Disabled') {
      return { valid: false, tag, error: 'This Smart Bin Tag has been deactivated or disabled by the administrator.' };
    }

    if (tag.status === 'Registered') {
      return { valid: false, tag, error: 'This tag has already been registered to another user' };
    }

    return { valid: true, tag };
  },

  getTags: (): BinTag[] => {
    const tags = getFromStorage<BinTag[]>('sbt_tags');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType === 'admin') {
      return tags;
    }
    const userUids = new Set<string>([user.uid]);
    if ((user as any).id) userUids.add((user as any).id);
    return tags.filter(t => t.ownerId && userUids.has(t.ownerId));
  },

  updateTag: (serialNumber: string, fields: Partial<BinTag>): BinTag => {
    const normalized = (serialNumber || '').trim().toUpperCase();
    const tags = getFromStorage<BinTag[]>('sbt_tags');
    const index = tags.findIndex(t => t.serialNumber === normalized);
    
    let updatedTag: BinTag;
    if (index === -1) {
      updatedTag = {
        serialNumber: normalized,
        status: 'Available',
        ownerId: null,
        registeredDate: null,
        manufacturedDate: new Date().toISOString(),
        nfcEnabled: true,
        ...fields
      };
      tags.push(updatedTag);
    } else {
      tags[index] = { ...tags[index], ...fields } as BinTag;
      updatedTag = tags[index];
    }
    setToStorage('sbt_tags', tags);

    // Keep sbt_bins in sync if tag is registered/assigned
    if (fields.status === 'Registered' && fields.ownerId) {
      const bins = getFromStorage<Bin[]>('sbt_bins');
      const binIdx = bins.findIndex(b => b.serialNumber === normalized);
      if (binIdx !== -1) {
        bins[binIdx].ownerId = fields.ownerId;
        bins[binIdx].status = 'Active';
        bins[binIdx].lastUpdated = new Date().toISOString();
        setToStorage('sbt_bins', bins);
      } else {
        const newBin: Bin = {
          binId: 'bin-' + Math.random().toString(36).substring(2, 9),
          ownerId: fields.ownerId,
          serialNumber: normalized,
          binType: (fields as any).bin_colour || 'Black',
          propertyName: (fields as any).property_name || '',
          houseNumber: '10',
          street: 'High Street',
          town: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
          registeredDate: fields.registeredDate || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          status: 'Active',
          nextCollection: 'Tuesday at 07:00'
        };
        bins.push(newBin);
        setToStorage('sbt_bins', bins);
      }
    }

    return updatedTag;
  },

  generateTagsBulk: (startNum: number, count: number): { success: boolean; count: number } => {
    const tags = getFromStorage<BinTag[]>('sbt_tags');
    let addedCount = 0;
    
    for (let i = 0; i < count; i++) {
      const currentNum = startNum + i;
      if (currentNum > 50000000) break;
      const serialStr = `SBT-${String(currentNum).padStart(8, '0')}`;
      if (!tags.some(t => t.serialNumber === serialStr)) {
        tags.push({
          serialNumber: serialStr,
          status: 'Available',
          ownerId: null,
          registeredDate: null,
          manufacturedDate: new Date().toISOString(),
          nfcEnabled: true
        });
        addedCount++;
      }
    }
    
    setToStorage('sbt_tags', tags);
    return { success: true, count: addedCount };
  },

  // --- BIN SERVICE ---
  getBins: (ownerId?: string): Bin[] => {
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const user = getLoggedInUser();
    if (!user) return [];

    const userUids = new Set<string>();
    userUids.add(user.uid);
    if (ownerId) userUids.add(ownerId);
    if ((user as any).id) userUids.add((user as any).id);

    if (user.accountType === 'admin') {
      if (ownerId) {
        return bins.filter(b => b.ownerId && userUids.has(b.ownerId));
      }
      return bins;
    }

    let userBins = bins.filter(b => b.ownerId && userUids.has(b.ownerId));

    // Cross-check registered/assigned tags in sbt_tags
    const tags = getFromStorage<BinTag[]>('sbt_tags');
    let binsUpdated = false;

    for (const tag of tags) {
      if (tag.status === 'Registered' && tag.ownerId && userUids.has(tag.ownerId)) {
        const alreadyInUserBins = userBins.some(b => b.serialNumber === tag.serialNumber);
        if (!alreadyInUserBins) {
          const globalBin = bins.find(b => b.serialNumber === tag.serialNumber);
          if (globalBin) {
            globalBin.ownerId = user.uid;
            globalBin.status = 'Active';
            userBins.push(globalBin);
          } else {
            const newBin: Bin = {
              binId: 'bin-' + Math.random().toString(36).substring(2, 9),
              ownerId: user.uid,
              serialNumber: tag.serialNumber,
              binType: (tag as any).bin_colour || 'Black',
              propertyName: (tag as any).property_name || '',
              houseNumber: '10',
              street: 'High Street',
              town: 'London',
              county: 'Greater London',
              postcode: 'SW1A 1AA',
              country: 'United Kingdom',
              registeredDate: tag.registeredDate || new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              status: 'Active',
              nextCollection: 'Tuesday at 07:00'
            };
            bins.push(newBin);
            userBins.push(newBin);
          }
          binsUpdated = true;
        }
      }
    }

    if (binsUpdated) {
      setToStorage('sbt_bins', bins);
    }

    return userBins;
  },

  registerBin: (ownerId: string, serialNumber: string, binDetails: Omit<Bin, 'binId' | 'ownerId' | 'serialNumber' | 'registeredDate' | 'lastUpdated' | 'status'>): { success: boolean; bin?: Bin; error?: string } => {
    const validation = mockDb.validateSerialNumber(serialNumber);
    if (!validation.valid || !validation.tag) {
      return { success: false, error: validation.error || 'Invalid Serial Number.' };
    }

    if (validation.tag.status === 'Registered' && validation.tag.ownerId && validation.tag.ownerId !== ownerId) {
      return { success: false, error: 'This Smart Bin Tag is already registered to another user account.' };
    }

    // Register tag
    mockDb.updateTag(validation.tag.serialNumber, {
      status: 'Registered',
      ownerId,
      registeredDate: new Date().toISOString()
    });

    // Create or update the bin
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const existingIndex = bins.findIndex(b => b.serialNumber === validation.tag!.serialNumber);

    let targetBin: Bin;
    if (existingIndex !== -1) {
      targetBin = {
        ...bins[existingIndex],
        ...binDetails,
        ownerId,
        serialNumber: validation.tag.serialNumber,
        lastUpdated: new Date().toISOString(),
        status: 'Active',
        nextCollection: binDetails.nextCollection || mockDb.calculateNextCollection(binDetails.binType)
      };
      bins[existingIndex] = targetBin;
    } else {
      targetBin = {
        ...binDetails,
        binId: 'bin-' + generateId(),
        ownerId,
        serialNumber: validation.tag.serialNumber, // standardized format
        registeredDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'Active',
        nextCollection: binDetails.nextCollection || mockDb.calculateNextCollection(binDetails.binType)
      };
      bins.push(targetBin);
    }
    setToStorage('sbt_bins', bins);

    // Seed reminders based on user-entered values
    const reminders = getFromStorage<ReminderSchedule[]>('sbt_reminders');
    const defaultDays: Record<string, string> = {
      Black: 'Thursday',
      Green: 'Tuesday',
      Blue: 'Wednesday',
      Brown: 'Friday'
    };
    
    let collectionDay = 'Monday';
    if (binDetails.collectionDayDate) {
      const dateObj = new Date(binDetails.collectionDayDate);
      if (!isNaN(dateObj.getTime())) {
        collectionDay = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      }
    } else {
      collectionDay = defaultDays[targetBin.binType] || 'Monday';
    }

    const reminderOneTime = to24Hour(binDetails.beforeCollectionTime);
    const reminderTwoTime = to24Hour(binDetails.collectionDayTime);
    const enabled = binDetails.beforeCollectionEnabled !== undefined ? !!binDetails.beforeCollectionEnabled : true;
    const alarmTone = binDetails.alarmTone || 'Chime Classic';

    const existingRemIdx = reminders.findIndex(r => r.serialNumber === targetBin.serialNumber);
    const newRem: ReminderSchedule = {
      reminderId: existingRemIdx !== -1 ? reminders[existingRemIdx].reminderId : ('rem-' + generateId()),
      ownerId,
      serialNumber: targetBin.serialNumber,
      collectionDay,
      frequency: 'Weekly',
      reminderOneTime,
      reminderTwoTime,
      enabled,
      alarmTone
    };

    if (existingRemIdx !== -1) {
      reminders[existingRemIdx] = newRem;
    } else {
      reminders.push(newRem);
    }
    setToStorage('sbt_reminders', reminders);

    // Notification
    mockDb.addNotification(
      ownerId,
      'Account',
      'Smart Bin Registered!',
      `Your ${targetBin.binType} Bin has been successfully linked with serial number ${targetBin.serialNumber}.`
    );

    return { success: true, bin: targetBin };
  },

  updateBin: (binId: string, fields: Partial<Bin>): Bin => {
    const bins = getFromStorage<Bin[]>('sbt_bins');
    let index = bins.findIndex(b => b.binId === binId || b.serialNumber === binId || (b.binId && binId && b.binId.toLowerCase() === binId.toLowerCase()));
    
    if (index === -1) {
      const user = getLoggedInUser();
      const ownerId = (user && user.uid) ? user.uid : 'usr-admin-primary';
      const newBin: Bin = {
        binId: binId || ('bin-' + Math.random().toString(36).substring(2, 9)),
        serialNumber: fields.serialNumber || binId || 'TAG-UNKNOWN',
        binType: (fields.binType as BinColor) || 'Black',
        houseNumber: fields.houseNumber || '',
        street: fields.street || '',
        town: fields.town || '',
        county: fields.county || '',
        postcode: fields.postcode || '',
        country: fields.country || 'UK',
        propertyName: fields.propertyName || '',
        ownerId: ownerId,
        status: fields.status || 'Active',
        registeredDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        ...fields
      };
      bins.push(newBin);
      setToStorage('sbt_bins', bins);
      return newBin;
    }

    const originalBin = bins[index];
    const user = getLoggedInUser();

    if (user && user.accountType !== 'admin' && originalBin.ownerId && user.uid && originalBin.ownerId !== user.uid) {
      // Don't block update if owner matches or isn't set
    }

    const updatedBin = { 
      ...originalBin, 
      ...fields, 
      lastUpdated: new Date().toISOString() 
    } as Bin;
    bins[index] = updatedBin;

    // Synchronize tag status if state changed
    if (fields.status === 'Lost') {
      mockDb.updateTag(originalBin.serialNumber, { status: 'Lost' });
    } else if (fields.status === 'Active' && originalBin.status === 'Lost') {
      mockDb.updateTag(originalBin.serialNumber, { status: 'Registered' });
    }

    setToStorage('sbt_bins', bins);

    // TWO-WAY SYNC: Sync reminder record from updated bin details
    try {
      const reminders = getFromStorage<ReminderSchedule[]>('sbt_reminders');
      let rIndex = reminders.findIndex(r => r.serialNumber === originalBin.serialNumber);
      
      let colDay = 'Monday';
      if (updatedBin.collectionDayDate) {
        const dateObj = new Date(updatedBin.collectionDayDate);
        if (!isNaN(dateObj.getTime())) {
          colDay = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        }
      } else {
        // Default based on type
        const defaultDays: Record<string, string> = {
          Black: 'Thursday',
          Green: 'Tuesday',
          Blue: 'Wednesday',
          Brown: 'Friday'
        };
        colDay = defaultDays[updatedBin.binType] || 'Monday';
      }
      
      const reminderOneTime = to24Hour(updatedBin.beforeCollectionTime);
      const reminderTwoTime = to24Hour(updatedBin.collectionDayTime);
      const enabled = !!(updatedBin.beforeCollectionEnabled || updatedBin.collectionDayEnabled);
      const alarmTone = updatedBin.alarmTone || 'Chime Classic';

      if (rIndex === -1) {
        // Create new reminder schedule
        const newReminder: ReminderSchedule = {
          reminderId: 'rem-' + generateId(),
          ownerId: updatedBin.ownerId,
          serialNumber: updatedBin.serialNumber,
          collectionDay: colDay,
          frequency: 'Weekly',
          reminderOneTime,
          reminderTwoTime,
          enabled,
          alarmTone
        };
        reminders.push(newReminder);
      } else {
        reminders[rIndex] = {
          ...reminders[rIndex],
          collectionDay: colDay,
          reminderOneTime,
          reminderTwoTime,
          enabled,
          alarmTone
        };
      }
      setToStorage('sbt_reminders', reminders);
    } catch (e) {
      console.error('Error syncing reminders from bin update:', e);
    }

    return bins[index];
  },

  deleteBin: (binId: string): boolean => {
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const bin = bins.find(b => b.binId === binId);
    if (!bin) return false;

    // Release tag
    mockDb.updateTag(bin.serialNumber, {
      status: 'Available',
      ownerId: null,
      registeredDate: null
    });

    // Remove reminders
    const reminders = getFromStorage<ReminderSchedule[]>('sbt_reminders');
    setToStorage('sbt_reminders', reminders.filter(r => r.serialNumber !== bin.serialNumber));

    // Remove bin
    setToStorage('sbt_bins', bins.filter(b => b.binId !== binId));
    return true;
  },

  adminResetTag: (serialNumber: string): boolean => {
    const normalized = serialNumber.trim().toUpperCase();
    
    // Find linked bin and delete it if exists
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const linkedBin = bins.find(b => b.serialNumber === normalized);
    if (linkedBin) {
      mockDb.deleteBin(linkedBin.binId);
    }
    
    // Always force tag reset state (removes ownerId, sets registeredDate to null, status to Available)
    mockDb.updateTag(normalized, {
      status: 'Available',
      ownerId: null,
      registeredDate: null
    });
    
    // Force remove reminders
    const reminders = getFromStorage<any[]>('sbt_reminders');
    const remainingReminders = reminders.filter(r => r.serialNumber !== normalized);
    setToStorage('sbt_reminders', remainingReminders);

    return true;
  },

  verifyUserEmail: (userId: string): boolean => {
    const users = getFromStorage<User[]>('sbt_users');
    const userIndex = users.findIndex(u => u.uid === userId);
    if (userIndex !== -1) {
      users[userIndex].emailVerified = true;
      setToStorage('sbt_users', users);
      return true;
    }
    return false;
  },

  calculateNextCollection: (binType: string): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const defaultDays: Record<string, number> = {
      Black: 4, // Thursday
      Green: 2, // Tuesday
      Blue: 3, // Wednesday
      Brown: 5  // Friday
    };
    const targetDayNum = defaultDays[binType] || 1; // Default Monday
    
    const today = new Date();
    const currentDayNum = today.getDay();
    let daysUntil = targetDayNum - currentDayNum;
    if (daysUntil <= 0) daysUntil += 7; // Next week

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    
    const dayName = days[targetDate.getDay()];
    if (daysUntil === 1) return 'Tomorrow, 07:00 AM';
    return `${dayName}, 07:00 AM`;
  },

  // --- REPORTING SERVICE ---
  getReports: (): BinReport[] => {
    const reports = getFromStorage<BinReport[]>('sbt_reports');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType === 'admin') {
      return reports;
    }
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const userBinIds = new Set(bins.filter(b => b.ownerId === user.uid).map(b => b.binId));
    const userSerials = new Set(bins.filter(b => b.ownerId === user.uid).map(b => b.serialNumber));
    return reports.filter(r => r.binId && userBinIds.has(r.binId) || userSerials.has(r.serialNumber));
  },

  submitReport: (reportData: Omit<BinReport, 'reportId' | 'createdAt' | 'status' | 'binId'>): { success: boolean; report: BinReport; error?: string } => {
    // Verify serial tag
    const validation = mockDb.validateSerialNumber(reportData.serialNumber);
    if (!validation.valid || !validation.tag) {
      return { success: false, report: {} as BinReport, error: validation.error || 'Invalid serial number' };
    }

    const bins = getFromStorage<Bin[]>('sbt_bins');
    const linkedBin = bins.find(b => b.serialNumber === validation.tag!.serialNumber) || null;

    const reports = getFromStorage<BinReport[]>('sbt_reports');
    const newReport: BinReport = {
      ...reportData,
      binId: linkedBin ? linkedBin.binId : null,
      reportId: 'rep-' + generateId(),
      createdAt: new Date().toISOString(),
      status: 'Unread'
    };

    reports.push(newReport);
    setToStorage('sbt_reports', reports);

    // Nhost Hasura Data Sync
    try {
      nhost.graphql.request({
        query: `mutation InsertReport($id: String!, $serial: String!, $type: String!, $desc: String, $loc: String, $postcode: String, $house: String, $status: String) {
          insert_reports_one(object: {
            id: $id,
            serial_number: $serial,
            report_type: $type,
            description: $desc,
            location: $loc,
            postcode: $postcode,
            house_number: $house,
            status: $status
          }) { id }
        }`,
        variables: {
          id: newReport.reportId,
          serial: newReport.serialNumber,
          type: newReport.reportType,
          desc: newReport.description || '',
          loc: newReport.location || '',
          postcode: newReport.postcode || '',
          house: newReport.houseNumber || '',
          status: newReport.status
        }
      }).catch(err => console.warn('[Nhost Cloud Sync] Report save warning:', err));
    } catch (e) {
      console.warn('[Nhost Cloud Sync] Exception saving report:', e);
    }

    // If bin is linked, update its status
    if (linkedBin) {
      if (reportData.reportType === 'Found') {
        mockDb.updateBin(linkedBin.binId, { status: 'Recovered' });
        mockDb.updateTag(validation.tag.serialNumber, { status: 'Recovered' });
      } else if (reportData.reportType === 'Damaged') {
        mockDb.updateBin(linkedBin.binId, { status: 'Damaged' });
      }

      // Notify Owner (Dashboard Alert)
      const notifyTitle = reportData.reportType === 'Found' 
        ? 'Your Wheelie Bin Has Been Found!' 
        : 'Damage Reported on Your Smart Bin';
        
      const notifyBody = reportData.reportType === 'Found'
        ? `A neighbor reported your bin as FOUND at: ${reportData.location}.`
        : `A damage report was submitted for your bin: "${reportData.description || 'No description provided'}"`;

      mockDb.addNotification(
        linkedBin.ownerId,
        reportData.reportType === 'Found' ? 'Found Bin' : 'Damage Report',
        notifyTitle,
        notifyBody,
        'notifications'
      );
    }

    return { success: true, report: newReport };
  },

  resolveReport: (reportId: string): void => {
    const reports = getFromStorage<BinReport[]>('sbt_reports');
    const reportIndex = reports.findIndex(r => r.reportId === reportId);
    if (reportIndex === -1) return;

    const report = reports[reportIndex];
    const user = getLoggedInUser();
    if (!user) throw new Error('Unauthorized');

    if (user.accountType !== 'admin') {
      const bins = getFromStorage<Bin[]>('sbt_bins');
      const bin = bins.find(b => b.binId === report.binId || b.serialNumber === report.serialNumber);
      if (!bin || bin.ownerId !== user.uid) {
        throw new Error('Access denied. You do not have permission to resolve this report.');
      }
    }

    reports[reportIndex].status = 'Resolved';
    setToStorage('sbt_reports', reports);
    
    // Update linked bin back to Active
    if (report.binId) {
      mockDb.updateBin(report.binId, { status: 'Active' });
    }
  },

  archiveReport: (reportId: string): void => {
    const reports = getFromStorage<BinReport[]>('sbt_reports');
    const reportIndex = reports.findIndex(r => r.reportId === reportId);
    if (reportIndex === -1) return;

    const report = reports[reportIndex];
    const user = getLoggedInUser();
    if (!user) throw new Error('Unauthorized');

    if (user.accountType !== 'admin') {
      const bins = getFromStorage<Bin[]>('sbt_bins');
      const bin = bins.find(b => b.binId === report.binId || b.serialNumber === report.serialNumber);
      if (!bin || bin.ownerId !== user.uid) {
        throw new Error('Access denied. You do not have permission to archive this report.');
      }
    }

    reports[reportIndex].status = 'Archived';
    setToStorage('sbt_reports', reports);
  },

  deleteReport: (reportId: string): void => {
    const reports = getFromStorage<BinReport[]>('sbt_reports');
    const reportIndex = reports.findIndex(r => r.reportId === reportId);
    if (reportIndex === -1) return;

    const report = reports[reportIndex];
    const user = getLoggedInUser();
    if (!user) throw new Error('Unauthorized');

    if (user.accountType !== 'admin') {
      const bins = getFromStorage<Bin[]>('sbt_bins');
      const bin = bins.find(b => b.binId === report.binId || b.serialNumber === report.serialNumber);
      if (!bin || bin.ownerId !== user.uid) {
        throw new Error('Access denied. You do not have permission to delete this report.');
      }
    }

    const filtered = reports.filter(r => r.reportId !== reportId);
    setToStorage('sbt_reports', filtered);
  },

  // --- PRIVATE OWNER MESSAGING SERVICE ---
  getMessages: (): PrivateMessage[] => {
    const messages = getFromStorage<PrivateMessage[]>('sbt_messages');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType === 'admin') {
      return messages;
    }
    const bins = getFromStorage<Bin[]>('sbt_bins');
    const userSerials = new Set(bins.filter(b => b.ownerId === user.uid).map(b => b.serialNumber));
    return messages.filter(m => userSerials.has(m.serialNumber) || m.ownerId === user.uid);
  },

  sendPrivateMessage: (serialNumber: string, senderName: string, senderEmail: string, senderPhone: string | undefined, messageText: string, targetOwnerId?: string): { success: boolean; error?: string } => {
    let resolvedSerial = serialNumber.trim().toUpperCase();
    let ownerId = targetOwnerId || 'ADMIN';

    if (resolvedSerial && resolvedSerial !== 'ADMIN' && resolvedSerial !== 'GENERAL' && resolvedSerial !== 'MUNICIPAL') {
      const validation = mockDb.validateSerialNumber(resolvedSerial);
      if (validation.valid && validation.tag && validation.tag.ownerId) {
        ownerId = validation.tag.ownerId;
        resolvedSerial = validation.tag.serialNumber;
      } else {
        resolvedSerial = resolvedSerial || 'GENERAL';
      }
    } else {
      resolvedSerial = resolvedSerial || 'ADMIN';
    }

    const messages = getFromStorage<PrivateMessage[]>('sbt_messages');
    const newMessage: PrivateMessage = {
      messageId: 'msg-' + generateId(),
      serialNumber: resolvedSerial,
      ownerId: ownerId,
      senderName,
      senderEmail,
      senderPhone,
      message: messageText,
      createdAt: new Date().toISOString(),
      status: 'Unread'
    };

    messages.push(newMessage);
    setToStorage('sbt_messages', messages);

    // Nhost Hasura Data Sync
    try {
      nhost.graphql.request({
        query: `mutation InsertMessage($id: String!, $serial: String!, $owner_id: String!, $sName: String!, $sEmail: String!, $sPhone: String, $msg: String!) {
          insert_messages_one(object: {
            id: $id,
            serial_number: $serial,
            owner_id: $owner_id,
            sender_name: $sName,
            sender_email: $sEmail,
            sender_phone: $sPhone,
            message: $msg
          }) { id }
        }`,
        variables: {
          id: newMessage.messageId,
          serial: resolvedSerial,
          owner_id: ownerId,
          sName: senderName,
          sEmail: senderEmail,
          sPhone: senderPhone || '',
          msg: messageText
        }
      }).catch(err => console.warn('[Nhost Cloud Sync] Message save warning:', err));
    } catch (e) {
      console.warn('[Nhost Cloud Sync] Exception saving message:', e);
    }

    // Notify Owner
    if (ownerId && ownerId !== 'ADMIN') {
      mockDb.addNotification(
        ownerId,
        'Private Message',
        `New Private Message from ${senderName}`,
        `Subject: Tag ${resolvedSerial}. Message: "${messageText.substring(0, 60)}..."`,
        'notifications'
      );
    }

    return { success: true };
  },

  deleteMessage: (messageId: string): void => {
    const messages = getFromStorage<PrivateMessage[]>('sbt_messages');
    const filtered = messages.filter(m => m.messageId !== messageId);
    setToStorage('sbt_messages', filtered);

    // Sync deletion to Nhost / Hasura backend messages table
    try {
      nhost.graphql.request({
        query: `mutation DeleteMessage($id: String!) {
          delete_messages(where: { id: { _eq: $id } }) {
            affected_rows
          }
        }`,
        variables: { id: messageId }
      }).catch(err => console.warn('[Nhost Cloud Sync] Delete message warning:', err));
    } catch (e) {
      console.warn('[Nhost Cloud Sync] Exception deleting message:', e);
    }
  },

  markMessageRead: (messageId: string): void => {
    const messages = getFromStorage<PrivateMessage[]>('sbt_messages');
    const index = messages.findIndex(m => m.messageId === messageId);
    if (index !== -1) {
      messages[index].status = 'Read';
      setToStorage('sbt_messages', messages);
    }
  },

  // --- NOTIFICATIONS SERVICE ---
  getNotifications: (ownerId: string): NotificationItem[] => {
    const notifications = getFromStorage<NotificationItem[]>('sbt_notifications');
    return notifications.filter(n => n.ownerId === ownerId && !n.deleted);
  },

  addNotification: (ownerId: string, type: NotificationItem['type'], title: string, body: string, actionUrl?: string): NotificationItem => {
    const notifications = getFromStorage<NotificationItem[]>('sbt_notifications');
    
    // Check if user has notification preferences enabled for this alert type
    const users = getFromStorage<User[]>('sbt_users');
    const user = users.find(u => u.uid === ownerId);
    
    // If user exists and alerts are configured, we still write to db, but maybe suppress client push
    const newNotif: NotificationItem = {
      notificationId: 'not-' + generateId(),
      ownerId,
      type,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
      deleted: false,
      actionUrl
    };

    notifications.unshift(newNotif); // latest first
    setToStorage('sbt_notifications', notifications);

    // Dispatch Native OS Pop-up / Push Notification to Phone / Tablet Home Screen
    sendNativeDeviceNotification(title, body, {
      tag: newNotif.notificationId,
      url: actionUrl || '/'
    });

    // Nhost Hasura Data Sync
    try {
      nhost.graphql.request({
        query: `mutation InsertNotification($id: String!, $user_id: String!, $title: String!, $body: String!, $read: Boolean!) {
          insert_notifications_one(object: {
            id: $id,
            user_id: $user_id,
            title: $title,
            body: $body,
            read: $read
          }) { id }
        }`,
        variables: {
          id: newNotif.notificationId,
          user_id: ownerId,
          title: title,
          body: body,
          read: false
        }
      }).catch(err => {
        // Silent fallback if remote Nhost table structure differs
      });
    } catch (e) {
      // Ignore exception
    }
    return newNotif;
  },

  markNotificationRead: (notificationId: string): void => {
    const notifications = getFromStorage<NotificationItem[]>('sbt_notifications');
    const index = notifications.findIndex(n => n.notificationId === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      setToStorage('sbt_notifications', notifications);
    }
  },

  markAllNotificationsRead: (ownerId: string): void => {
    const notifications = getFromStorage<NotificationItem[]>('sbt_notifications');
    const updated = notifications.map(n => {
      if (n.ownerId === ownerId) {
        return { ...n, read: true };
      }
      return n;
    });
    setToStorage('sbt_notifications', updated);
  },

  deleteNotification: (notificationId: string): void => {
    const notifications = getFromStorage<NotificationItem[]>('sbt_notifications');
    const index = notifications.findIndex(n => n.notificationId === notificationId);
    if (index !== -1) {
      notifications[index].deleted = true;
      setToStorage('sbt_notifications', notifications);
    }
  },

  // --- REMINDERS SERVICE ---
  getReminders: (ownerId: string): ReminderSchedule[] => {
    const reminders = getFromStorage<ReminderSchedule[]>('sbt_reminders');
    const user = getLoggedInUser();
    if (!user) return [];
    if (user.accountType === 'admin') {
      return reminders.filter(r => r.ownerId === ownerId);
    }
    return reminders.filter(r => r.ownerId === user.uid);
  },

  saveReminderSchedule: (reminderId: string, fields: Partial<ReminderSchedule>): ReminderSchedule => {
    const reminders = getFromStorage<ReminderSchedule[]>('sbt_reminders');
    let index = reminders.findIndex(r => r.reminderId === reminderId || (fields.serialNumber && r.serialNumber === fields.serialNumber));

    const user = getLoggedInUser();
    if (!user) throw new Error('Unauthorized');

    if (user.accountType !== 'admin') {
      if (index !== -1 && reminders[index].ownerId !== user.uid) {
        throw new Error('Access denied. You do not have permission to update this reminder schedule.');
      }
      if (fields.ownerId && fields.ownerId !== user.uid) {
        throw new Error('Access denied. Cannot assign reminder schedule to another user.');
      }
    }

    let updatedReminder: ReminderSchedule;
    if (index === -1) {
      // Create new reminder schedule
      const newReminder: ReminderSchedule = {
        reminderId: reminderId || 'rem-' + generateId(),
        ownerId: fields.ownerId || '',
        serialNumber: fields.serialNumber || '',
        collectionDay: fields.collectionDay || 'Monday',
        frequency: fields.frequency || 'Weekly',
        reminderOneTime: fields.reminderOneTime || '18:00',
        reminderTwoTime: fields.reminderTwoTime || '07:00',
        enabled: fields.enabled !== undefined ? fields.enabled : true,
        alarmTone: fields.alarmTone || 'Chime Classic',
        inAppEnabled: fields.inAppEnabled !== undefined ? fields.inAppEnabled : true,
        emailEnabled: fields.emailEnabled !== undefined ? fields.emailEnabled : true,
        pushEnabled: fields.pushEnabled !== undefined ? fields.pushEnabled : true
      };
      reminders.push(newReminder);
      setToStorage('sbt_reminders', reminders);
      updatedReminder = newReminder;
    } else {
      updatedReminder = { ...reminders[index], ...fields } as ReminderSchedule;
      reminders[index] = updatedReminder;
      setToStorage('sbt_reminders', reminders);
    }

    // TWO-WAY SYNC: Sync Bin from reminder record details
    try {
      const bins = getFromStorage<Bin[]>('sbt_bins');
      const bIndex = bins.findIndex(b => b.serialNumber === updatedReminder.serialNumber);
      if (bIndex !== -1) {
        const targetBin = bins[bIndex];
        const nextColDayDate = getNextDateForDayOfWeek(updatedReminder.collectionDay);
        const nextBeforeColDate = getPreviousDateStr(nextColDayDate);
        
        bins[bIndex] = {
          ...targetBin,
          beforeCollectionEnabled: updatedReminder.enabled,
          collectionDayEnabled: updatedReminder.enabled,
          beforeCollectionTime: to12Hour(updatedReminder.reminderOneTime),
          collectionDayTime: to12Hour(updatedReminder.reminderTwoTime),
          beforeCollectionDate: nextBeforeColDate,
          collectionDayDate: nextColDayDate,
          alarmTone: updatedReminder.alarmTone || targetBin.alarmTone,
          inAppEnabled: updatedReminder.inAppEnabled !== undefined ? updatedReminder.inAppEnabled : targetBin.inAppEnabled,
          emailEnabled: updatedReminder.emailEnabled !== undefined ? updatedReminder.emailEnabled : targetBin.emailEnabled,
          pushEnabled: updatedReminder.pushEnabled !== undefined ? updatedReminder.pushEnabled : targetBin.pushEnabled,
          nextCollection: updatedReminder.enabled ? `${nextColDayDate} at ${to12Hour(updatedReminder.reminderTwoTime)}` : 'Schedules paused',
          lastUpdated: new Date().toISOString()
        };
        setToStorage('sbt_bins', bins);
      }
    } catch (e) {
      console.error('Error syncing bin from reminder update:', e);
    }

    return updatedReminder;
  },

  // --- SYSTEM SETTINGS SERVICE ---
  getSystemSettings: (): SystemSettings => {
    return getFromStorage<SystemSettings>('sbt_system_settings');
  },

  updateSystemSettings: (fields: Partial<SystemSettings>): SystemSettings => {
    const settings = getFromStorage<SystemSettings>('sbt_system_settings');
    const updated = { ...settings, ...fields } as SystemSettings;
    setToStorage('sbt_system_settings', updated);
    return updated;
  }
};

export const db = mockDb;
export default mockDb;
