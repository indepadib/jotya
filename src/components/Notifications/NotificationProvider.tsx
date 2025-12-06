'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { usePathname } from 'next/navigation';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (notificationIds: string[]) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
    const toast = useToast();
    const pathname = usePathname();

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                const newNotifications = data.notifications || [];

                // Check for new notifications and show toast
                if (newNotifications.length > 0 && lastNotificationId) {
                    const newOnes = newNotifications.filter(
                        (n: Notification) => !n.read && n.id !== lastNotificationId
                    );

                    if (newOnes.length > 0) {
                        const latest = newOnes[0];
                        toast.info(`${latest.title}: ${latest.message}`);
                    }
                }

                if (newNotifications.length > 0) {
                    setLastNotificationId(newNotifications[0].id);
                }

                setNotifications(newNotifications);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationIds: string[]) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds })
            });

            if (res.ok) {
                await fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllAsRead: true })
            });

            if (res.ok) {
                await fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [lastNotificationId]);

    // Refresh on route change
    useEffect(() => {
        fetchNotifications();
    }, [pathname]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                refreshNotifications: fetchNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
