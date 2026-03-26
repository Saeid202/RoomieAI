// =====================================================
// Lawyer Notification Bell Component
// =====================================================
// Purpose: Shows unread notifications for lawyers
//          with a dropdown panel of recent alerts
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Scale, X, CheckCheck, FileText, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLawyerNotifications, markNotificationAsRead } from '@/services/dealLawyerService';
import type { LawyerNotification } from '@/types/dealLawyer';
import { useNavigate } from 'react-router-dom';

export function LawyerNotificationBell() {
  const [notifications, setNotifications] = useState<LawyerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lawyerProfileId, setLawyerProfileId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    initLawyer();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initLawyer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('lawyer_profiles' as any)
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) return;
    const profileId = (profile as any).id;
    setLawyerProfileId(profileId);
    await loadNotifications(profileId);

    // Subscribe to real-time new notifications
    const channel = supabase
      .channel('lawyer_notifications_' + profileId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lawyer_notifications',
        filter: `lawyer_id=eq.${profileId}`,
      }, () => {
        loadNotifications(profileId);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const loadNotifications = async (profileId: string) => {
    const data = await getLawyerNotifications(profileId);
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => markNotificationAsRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: LawyerNotification) => {
    if (!notification.read) handleMarkRead(notification.id);
    setIsOpen(false);
    navigate('/dashboard/lawyer-document-reviews');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-purple-100 transition-colors"
        title="Notifications"
      >
        <Bell className="h-6 w-6 text-purple-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 z-50 overflow-hidden">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-white" />
              <h3 className="text-white font-bold text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>All read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="p-4 rounded-full bg-purple-50 mb-3">
                  <Bell className="h-8 w-8 text-purple-300" />
                </div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  You'll be notified when a client assigns you for document review
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-purple-50 transition-colors flex gap-3 ${
                    !notification.read ? 'bg-purple-50/60' : 'bg-white'
                  }`}
                >
                  {/* Icon */}
                  <div className={`shrink-0 p-2.5 rounded-full mt-0.5 ${
                    !notification.read
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                      : 'bg-gray-100'
                  }`}>
                    <Scale className={`h-4 w-4 ${!notification.read ? 'text-white' : 'text-gray-500'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${
                        !notification.read ? 'text-purple-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="shrink-0 h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTime(notification.created_at)}
                      </span>
                      <span className="text-xs text-purple-600 font-medium">
                        View documents →
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { setIsOpen(false); navigate('/dashboard/lawyer-document-reviews'); }}
                className="w-full text-center text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                View all review requests →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
