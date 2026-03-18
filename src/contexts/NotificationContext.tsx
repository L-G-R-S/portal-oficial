import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Promise<Notification | null>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  playNotificationSound: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationState = useNotifications();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
