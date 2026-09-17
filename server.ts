import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");

const DEFAULT_SEED_DB: Record<string, any> = {
  sbt_users: [
    {
      uid: "usr-admin-primary",
      firstName: "Admin",
      lastName: "Primary",
      email: "admin0115.com@gmail.com",
      profilePhoto: "",
      phoneNumber: "+44 7700 900100",
      accountType: "admin",
      postcode: "LN5 8PE",
      createdAt: "2026-07-12T12:00:00Z",
      status: "Active",
      emailVerified: true,
      notificationPreferences: {
        pushEnabled: true,
        emailEnabled: true,
        remindersAlerts: true,
        foundBinAlerts: true,
        damageAlerts: true,
        messageAlerts: true
      }
    },
    {
      uid: "usr-homeowner-primary",
      firstName: "Alex",
      lastName: "Taylor",
      email: "resident@gmail.com",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      phoneNumber: "+44 7700 900222",
      accountType: "user",
      postcode: "LN5 8PE",
      createdAt: "2026-07-15T10:00:00Z",
      status: "Active",
      emailVerified: true,
      notificationPreferences: {
        pushEnabled: true,
        emailEnabled: true,
        remindersAlerts: true,
        foundBinAlerts: true,
        damageAlerts: true,
        messageAlerts: true
      }
    }
  ],
  sbt_bins: [
    {
      binId: "bin-01",
      ownerId: "usr-admin-primary",
      ownerEmail: "admin0115.com@gmail.com",
      serialNumber: "SBT-00000014",
      binType: "Green",
      propertyName: "",
      houseNumber: "26",
      street: "Canwick Close",
      town: "Lincoln",
      county: "Lincolnshire",
      postcode: "LN5 8PE",
      country: "United Kingdom",
      notes: "Left side of the driveway.",
      registeredDate: "2026-05-15T12:00:00Z",
      lastUpdated: "2026-05-15T12:00:00Z",
      status: "Active",
      nextCollection: "Tomorrow, 07:00 AM",
      collectionDayDate: "Tuesday",
      collectionDayTime: "07:00 AM",
      collectionDayEnabled: true,
      beforeCollectionDate: "Monday",
      beforeCollectionTime: "06:00 PM",
      beforeCollectionEnabled: true,
      alarmTone: "Chime Classic",
      repeatIntervalWeeks: 1
    }
  ],
  sbt_tags: [
    {
      serialNumber: "SBT-00000014",
      status: "Registered",
      ownerId: "usr-admin-primary",
      ownerEmail: "admin0115.com@gmail.com",
      bin_colour: "Green",
      property_name: "",
      address: "26 Canwick Close, Lincoln, LN5 8PE",
      notes: "Left side of the driveway.",
      registeredDate: "2026-05-15T12:00:00Z",
      manufacturedDate: "2026-01-10T08:00:00Z",
      nfcEnabled: true
    },
    {
      serialNumber: "SBT-00000001",
      status: "Available",
      ownerId: null,
      registeredDate: null,
      manufacturedDate: "2026-01-10T08:00:00Z",
      nfcEnabled: true
    },
    {
      serialNumber: "SBT-00000002",
      status: "Available",
      ownerId: null,
      registeredDate: null,
      manufacturedDate: "2026-01-10T08:00:00Z",
      nfcEnabled: true
    },
    {
      serialNumber: "SBT-00000003",
      status: "Available",
      ownerId: null,
      registeredDate: null,
      manufacturedDate: "2026-01-10T08:00:00Z",
      nfcEnabled: true
    },
    {
      serialNumber: "SBT-00000006",
      status: "Available",
      ownerId: null,
      registeredDate: null,
      manufacturedDate: "2026-01-10T08:00:00Z",
      nfcEnabled: true
    },
    {
      serialNumber: "SBT-00000008",
      status: "Available",
      ownerId: null,
      registeredDate: null,
      manufacturedDate: "2026-01-10T08:00:00Z",
      nfcEnabled: true
    },
    {
      serialNumber: "SBT-00000010",
      status: "Available",
      ownerId: null,
      registeredDate: null,
      manufacturedDate: "2026-01-10T08:00:00Z",
      nfcEnabled: true
    }
  ],
  sbt_reminders: [
    {
      reminderId: "rem-01",
      ownerId: "usr-admin-primary",
      serialNumber: "SBT-00000014",
      collectionDay: "Tuesday",
      frequency: "Weekly",
      reminderOneTime: "18:00",
      reminderTwoTime: "07:00",
      enabled: true,
      nextReminder: "2026-07-21T18:00:00",
      alarmTone: "Chime Classic"
    }
  ],
  sbt_reports: [
    {
      reportId: "rep-01",
      serialNumber: "SBT-00000014",
      binId: "bin-01",
      reportType: "Found",
      description: "Found at 26 Canwick Close.",
      location: "Near the driveway entrance",
      postcode: "LN5 8PE",
      houseNumber: "26",
      gpsCoordinates: "53.2200° N, 0.5300° W",
      finderName: "Sarah Higgins",
      finderEmail: "sarah.h@example.com",
      finderPhone: "07700 900122",
      message: "The bin was safely returned to 26 Canwick Close.",
      createdAt: "2026-07-16T10:00:00Z",
      status: "Unread"
    }
  ],
  sbt_messages: [
    {
      messageId: "msg-01",
      serialNumber: "SBT-00000014",
      ownerId: "usr-admin-primary",
      senderName: "Robert Green",
      senderEmail: "robert@greenwood.com",
      senderPhone: "07700 900144",
      message: "Hello, your green bin is currently sitting directly in front of my driveway entry. Could you please pull it back a bit? Thanks!",
      createdAt: "2026-07-16T11:00:00Z",
      status: "Unread"
    }
  ],
  sbt_notifications: [
    {
      notificationId: "not-01",
      ownerId: "usr-admin-primary",
      type: "Collection Reminder",
      title: "Green Bin Collection Tomorrow",
      body: "Your Green Bin (SBT-00000014) will be collected tomorrow. Please place it outside this evening.",
      createdAt: "2026-07-15T18:00:00Z",
      read: false,
      deleted: false,
      actionUrl: "my-bins"
    },
    {
      notificationId: "not-02",
      ownerId: "usr-admin-primary",
      type: "Private Message",
      title: "New Message from Robert Green",
      body: "A neighbor left a message: \"Hello, your green bin is sitting directly in front of my driveway...\"",
      createdAt: "2026-07-16T11:01:00Z",
      read: false,
      deleted: false,
      actionUrl: "notifications"
    }
  ],
  sbt_system_settings: {
    maintenanceMode: false,
    appVersion: "1.0.0",
    defaultReminders: {
      reminderOne: "18:00",
      reminderTwo: "07:00"
    },
    supportEmail: "support@smartbintag.com",
    termsVersion: "1.0",
    privacyVersion: "1.0"
  }
};

// Helper to load database from disk, automatically seeding baseline records if new download or fresh instance
function loadDatabase(): Record<string, any> {
  let diskData: Record<string, any> = {};
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
      diskData = JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read database file:", err);
  }

  const merged = mergeCollections(DEFAULT_SEED_DB, diskData);
  if (!fs.existsSync(DB_FILE_PATH) || Object.keys(diskData).length === 0) {
    saveDatabase(merged);
  }
  return merged;
}

// Helper to save database to disk
function saveDatabase(db: Record<string, any>): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database file:", err);
  }
}

// Merge incoming collections with server collections intelligently
function mergeCollections(serverDb: Record<string, any>, incoming: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { ...serverDb };

  for (const [key, items] of Object.entries(incoming)) {
    if (!Array.isArray(items)) {
      if (typeof items === "object" && items !== null) {
        merged[key] = { ...(merged[key] || {}), ...items };
      } else {
        merged[key] = items;
      }
      continue;
    }

    const currentList: any[] = Array.isArray(serverDb[key]) ? [...serverDb[key]] : [];

    if (key === "sbt_bins") {
      // Merge by binId or serialNumber
      items.forEach((newItem) => {
        const idx = currentList.findIndex(
          (b) => (b.binId && b.binId === newItem.binId) || (b.serialNumber && b.serialNumber === newItem.serialNumber)
        );
        if (idx >= 0) {
          currentList[idx] = { ...currentList[idx], ...newItem };
        } else {
          currentList.push(newItem);
        }
      });
      merged[key] = currentList;
    } else if (key === "sbt_tags") {
      // Merge by serialNumber, prioritizing registered tags over available stock
      items.forEach((newTag) => {
        const idx = currentList.findIndex((t) => t.serialNumber === newTag.serialNumber);
        if (idx >= 0) {
          const existing = currentList[idx];
          if (newTag.status === "Registered" && existing.status !== "Registered") {
            currentList[idx] = newTag;
          } else if (newTag.status === "Registered" && existing.status === "Registered") {
            currentList[idx] = { ...existing, ...newTag };
          } else if (existing.status !== "Registered") {
            currentList[idx] = { ...existing, ...newTag };
          }
        } else {
          currentList.push(newTag);
        }
      });
      merged[key] = currentList;
    } else if (key === "sbt_users") {
      // Merge by uid or email
      items.forEach((newUser) => {
        const newEmail = (newUser.email || "").toLowerCase().trim();
        const idx = currentList.findIndex(
          (u) => (u.uid && u.uid === newUser.uid) || (newEmail && (u.email || "").toLowerCase().trim() === newEmail)
        );
        if (idx >= 0) {
          currentList[idx] = { ...currentList[idx], ...newUser };
        } else {
          currentList.push(newUser);
        }
      });
      merged[key] = currentList;
    } else if (key === "sbt_reminders") {
      // Merge by reminderId or binId
      items.forEach((newRem) => {
        const idx = currentList.findIndex(
          (r) => (r.reminderId && r.reminderId === newRem.reminderId) || (r.binId && r.binId === newRem.binId)
        );
        if (idx >= 0) {
          currentList[idx] = { ...currentList[idx], ...newRem };
        } else {
          currentList.push(newRem);
        }
      });
      merged[key] = currentList;
    } else if (key === "sbt_reports") {
      // Merge by reportId
      items.forEach((newRep) => {
        const idx = currentList.findIndex((r) => r.reportId === newRep.reportId);
        if (idx >= 0) {
          currentList[idx] = { ...currentList[idx], ...newRep };
        } else {
          currentList.push(newRep);
        }
      });
      merged[key] = currentList;
    } else if (key === "sbt_messages") {
      // Merge by messageId
      items.forEach((newMsg) => {
        const idx = currentList.findIndex((m) => m.messageId === newMsg.messageId);
        if (idx >= 0) {
          currentList[idx] = { ...currentList[idx], ...newMsg };
        } else {
          currentList.push(newMsg);
        }
      });
      merged[key] = currentList;
    } else {
      // Generic array merge by id if present, else union
      items.forEach((newItem) => {
        if (newItem && typeof newItem === "object" && newItem.id) {
          const idx = currentList.findIndex((x) => x.id === newItem.id);
          if (idx >= 0) {
            currentList[idx] = { ...currentList[idx], ...newItem };
          } else {
            currentList.push(newItem);
          }
        } else {
          if (!currentList.includes(newItem)) {
            currentList.push(newItem);
          }
        }
      });
      merged[key] = currentList;
    }
  }

  return merged;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API Route: Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route: Get Complete Cloud Database State
  app.get("/api/db", (_req, res) => {
    const db = loadDatabase();
    res.json({
      success: true,
      data: db,
      serverTime: new Date().toISOString()
    });
  });

  // API Route: Two-Way Synchronization Endpoint
  app.post("/api/db/sync", (req, res) => {
    try {
      const incomingData = req.body || {};
      const currentDb = loadDatabase();
      const mergedDb = mergeCollections(currentDb, incomingData);
      saveDatabase(mergedDb);

      res.json({
        success: true,
        data: mergedDb,
        syncedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Sync error:", err);
      res.status(500).json({ success: false, error: err?.message || "Sync failed" });
    }
  });

  // API Route: Targeted User Data Sync
  app.get("/api/db/user/:email", (req, res) => {
    const email = (req.params.email || "").toLowerCase().trim();
    const db = loadDatabase();
    const bins = (db["sbt_bins"] || []).filter(
      (b: any) => (b.ownerEmail && b.ownerEmail.toLowerCase().trim() === email)
    );
    const users = (db["sbt_users"] || []).filter(
      (u: any) => (u.email && u.email.toLowerCase().trim() === email)
    );
    res.json({
      success: true,
      bins,
      user: users[0] || null
    });
  });

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Bin Tag full-stack server running on port ${PORT}`);
  });
}

startServer();
