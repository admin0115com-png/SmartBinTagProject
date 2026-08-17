-- =====================================================================
-- SMART BIN TAG (SBT) - NHOST / POSTGRESQL DATABASE SCHEMA
-- =====================================================================
-- This script contains the direct SQL commands to execute in your Nhost
-- SQL Editor Console to provision all required tables, keys, indexes,
-- and constraint rules for the full user profile system.
--
-- Tables created:
--   1. sbt_profiles (User core identity metadata)
--   2. sbt_notification_preferences (Alert preferences setup)
--   3. sbt_user_settings (Visual/regional personalization)
--   4. sbt_user_dashboards (Live statistics tracking)
--   5. sbt_device_sessions (Active user session security audit)
--   6. sbt_audit_logs (Security and operations history tracking)
--   7. sbt_registration_history (Step-by-step physical tag registration log)
--   8. sbt_support_tickets (Customer support system tickets)
-- =====================================================================

BEGIN;

-- 1. USER PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.sbt_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    postcode VARCHAR(20),
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.sbt_notification_preferences (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    push_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    reminders_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    found_bin_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    damage_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    message_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. USER PERSONALIZATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.sbt_user_settings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'dark' NOT NULL,
    language VARCHAR(10) DEFAULT 'en' NOT NULL,
    notifications_frequency VARCHAR(30) DEFAULT 'instantly' NOT NULL,
    marketing_consent BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. LIVE DASHBOARD CACHE STATS TABLE
CREATE TABLE IF NOT EXISTS public.sbt_user_dashboards (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    found_reports_count INT DEFAULT 0 NOT NULL,
    damage_reports_count INT DEFAULT 0 NOT NULL,
    unread_messages_count INT DEFAULT 0 NOT NULL,
    notifications_count INT DEFAULT 0 NOT NULL,
    upcoming_collections_count INT DEFAULT 0 NOT NULL,
    support_tickets_count INT DEFAULT 0 NOT NULL,
    last_refresh TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. DEVICE SECURITY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sbt_device_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    os_name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 6. AUDIT TELEMETRY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.sbt_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status VARCHAR(20) DEFAULT 'SUCCESS' NOT NULL
);

-- 7. PHYSICAL STICKER REGISTRATION HISTORY
CREATE TABLE IF NOT EXISTS public.sbt_registration_history (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. CUSTOMER SERVICE SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.sbt_support_tickets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- OPTIONAL: INDEXING FOR REAL-TIME NHOST SUBSCRIPTIONS PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.sbt_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sbt_device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.sbt_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.sbt_support_tickets(user_id);

-- =====================================================================
-- SEED INITIAL PRIMARY ADMINISTRATOR DATA TEMPLATES
-- =====================================================================
-- Primary administrator email: admin0115.com@gmail.com
-- Primary admin uid: usr-admin-primary
-- Typo variant administrator email: admin0115.com@gamil.com
-- Typo admin uid: usr-admin-typo
-- =====================================================================

INSERT INTO public.sbt_profiles (id, user_id, first_name, last_name, phone_number, postcode, updated_at)
VALUES 
('prof-admin', 'usr-admin-primary', 'Admin', 'Primary', '+44 7700 900100', 'SW1A 1AA', NOW()),
('prof-admin-typo', 'usr-admin-typo', 'Admin', 'Typo', '+44 7700 900100', 'SW1A 1AA', NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.sbt_notification_preferences (id, user_id, push_enabled, email_enabled, reminders_alerts, found_bin_alerts, damage_alerts, message_alerts, updated_at)
VALUES 
('np-admin', 'usr-admin-primary', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, NOW()),
('np-admin-typo', 'usr-admin-typo', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.sbt_user_settings (id, user_id, theme, language, notifications_frequency, marketing_consent, updated_at)
VALUES 
('set-admin', 'usr-admin-primary', 'dark', 'en', 'instantly', FALSE, NOW()),
('set-admin-typo', 'usr-admin-typo', 'dark', 'en', 'instantly', FALSE, NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.sbt_user_dashboards (id, user_id, found_reports_count, damage_reports_count, unread_messages_count, notifications_count, upcoming_collections_count, support_tickets_count, last_refresh)
VALUES 
('dash-admin', 'usr-admin-primary', 1, 1, 1, 2, 3, 2, NOW()),
('dash-admin-typo', 'usr-admin-typo', 0, 0, 0, 0, 0, 0, NOW())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.sbt_support_tickets (id, user_id, subject, description, priority, status, created_at, updated_at)
VALUES 
('tick-01', 'usr-admin-primary', 'Tag NFC Scanner Not Responding', 'The tag scanner fails on older iOS units with non-Safari integrations.', 'HIGH', 'OPEN', NOW(), NOW()),
('tick-02', 'usr-admin-primary', 'Inquiry regarding tag replacement pricing', 'Do we get discounts when buying standard packs of 10 tags?', 'LOW', 'RESOLVED', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
