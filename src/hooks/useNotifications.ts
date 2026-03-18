import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  created_at: string;
  read: boolean;
  action_url?: string;
  action_data?: Record<string, any>;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Load notifications from database
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    if (data) {
      setNotifications(data as Notification[]);
    }
  }, [user]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Load notifications on mount and set up realtime subscription
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev].slice(0, 50));
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        action_url: notification.action_url,
        action_data: notification.action_data,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding notification:', error);
      return null;
    }

    return data as Notification;
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [user]);

  const clearAll = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing notifications:', error);
      return;
    }

    setNotifications([]);
  }, [user]);

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1320, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Sound failed silently
    }
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllAsRead,
    clearAll,
    playNotificationSound,
    refreshNotifications: loadNotifications,
  };
}
