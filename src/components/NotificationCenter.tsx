import React, { useMemo, useState, useEffect } from 'react';
import type { NotificationItem } from '../types';
import { 
  Bell, 
  Check, 
  Trash2, 
  X, 
  MessageSquare, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Sparkles, 
  Smartphone, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { 
  getNotificationPermissionState, 
  requestPushNotificationPermission, 
  PushNotificationPermissionState 
} from '../lib/pushNotifications';

// ==== Type Definitions ====
interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  setView?: (view: string, params?: Record<string, unknown>) => void;
  onSelectAction?: (url: string) => void;
}

// ==== Component ====
export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  setView,
  onSelectAction
}: NotificationCenterProps) {
  const [pushState, setPushState] = useState<PushNotificationPermissionState>({
    permission: 'default',
    supported: true
  });

  useEffect(() => {
    if (isOpen) {
      setPushState(getNotificationPermissionState());
    }
  }, [isOpen]);

  const handleEnablePush = async () => {
    const perm = await requestPushNotificationPermission();
    setPushState({
      permission: perm,
      supported: true
    });
  };

  // Filter out any deleted notifications and sort by timestamp
  const activeNotifications = useMemo(() => {
    return notifications
      .filter(item => !item.deleted)
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      });
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return activeNotifications.filter(item => !item.read).length;
  }, [activeNotifications]);

  if (!isOpen) return null;

  const handleNotificationClick = (notification: NotificationItem) => {
    const notifId = notification.id || notification.notificationId || '';
    if (!notification.read && notifId) {
      onMarkRead(notifId);
    }
    const targetUrl = notification.actionUrl;
    if (targetUrl) {
      if (setView) {
        setView(targetUrl, {});
      } else if (onSelectAction) {
        onSelectAction(targetUrl);
      }
    }
    onClose();
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'Collection Reminder':
        return <Calendar className="h-4 w-4 text-emerald-500" />;
      case 'Found Bin':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case 'Damage Report':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'Tag Verification':
        return <CheckCircle className="h-4 w-4 text-[#45D153]" />;
      case 'Council Notice':
        return <ShieldAlert className="h-4 w-4 text-blue-500" />;
      case 'Private Message':
        return <MessageSquare className="h-4 w-4 text-sky-500" />;
      case 'Account':
      case 'System':
      default:
        return <Info className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getColorClasses = (type: NotificationItem['type']) => {
    switch (type) {
      case 'Collection Reminder':
        return 'bg-emerald-50/80 border-emerald-100';
      case 'Found Bin':
        return 'bg-amber-50/80 border-amber-100';
      case 'Damage Report':
        return 'bg-rose-50/80 border-rose-100';
      case 'Tag Verification':
        return 'bg-emerald-50/80 border-emerald-200';
      case 'Council Notice':
        return 'bg-blue-50/80 border-blue-100';
      case 'Private Message':
        return 'bg-sky-50/80 border-sky-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div 
      id="notification-overlay" 
      className="fixed inset-0 z-[1000] overflow-hidden" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="notification-heading"
    >
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel - Mobile Responsive (Fits Phone Screen & Desktop) */}
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-md max-w-full bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-brand-dark text-white">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-primary shrink-0" />
            <h2 id="notification-heading" className="text-base sm:text-lg font-bold">Notification Centre</h2>
            {unreadCount > 0 && (
              <span className="bg-brand-primary text-brand-darker px-2 py-0.5 rounded-full text-xs font-bold font-mono">
                {unreadCount} new
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-gray-200"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile & Tablet Lock Screen Status Card */}
        <div className="mx-3 sm:mx-6 my-3 p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono font-bold text-emerald-800">
              <Smartphone className="h-4 w-4 text-[#45D153] shrink-0" />
              <span>Lock Screen & Device Alerts</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
              pushState.permission === 'granted' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {pushState.permission === 'granted' ? 'Active' : 'Disabled'}
            </span>
          </div>

          <p className="text-[11px] text-gray-600 leading-relaxed">
            Real collection alerts deliver pop-up notifications and sound alarms to your device lock screen when bins are due (Evening Before & Morning).
          </p>

          {pushState.permission !== 'granted' && (
            <div className="pt-1">
              <button
                onClick={handleEnablePush}
                className="w-full py-2 bg-[#45D153] hover:bg-[#38b544] text-[#02241d] font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all text-xs"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Enable Home Screen Push Alerts</span>
              </button>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        {activeNotifications.length > 0 && (
          <div className="px-4 sm:px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button 
              onClick={onMarkAllRead} 
              className="flex items-center gap-1 hover:text-brand-dark font-medium transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 text-brand-primary" />
              <span>Mark all as read</span>
            </button>
            <span>{activeNotifications.length} notification{activeNotifications.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
          {activeNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400 space-y-3">
              <div className="bg-gray-100 p-4 rounded-full">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">All caught up!</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  You don't have any notifications right now.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeNotifications.map((item) => {
                const colorClasses = getColorClasses(item.type);
                const isUnread = !item.read;
                const notifId = item.id || item.notificationId || '';
                const displayBody = item.body || item.message || '';
                const displayDate = item.createdAt || item.timestamp || new Date().toISOString();
                
                return (
                  <div 
                    key={notifId || Math.random().toString()} 
                    className={`relative p-3.5 sm:p-4 rounded-xl border transition-all ${colorClasses} ${
                      isUnread ? 'ring-2 ring-brand-primary/20 bg-white shadow-xs' : 'opacity-85'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Clickable content area */}
                      <div 
                        className="flex gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0"
                        onClick={() => handleNotificationClick(item)}
                      >
                        <div className={`p-2 rounded-lg self-start shrink-0 ${
                          isUnread ? 'bg-white shadow-xs' : 'bg-gray-100/50'
                        }`}>
                          {getIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`text-xs sm:text-sm ${
                              isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                            }`}>
                              {item.title}
                            </h4>
                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                            {displayBody}
                          </p>
                          <span className="text-[10px] text-gray-400 block mt-1.5 font-mono">
                            {new Date(displayDate).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isUnread && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notifId) onMarkRead(notifId);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notifId) onDelete(notifId);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
