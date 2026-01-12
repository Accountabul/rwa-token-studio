// ============================================================================
// NOTIFICATION HOOKS
// React hooks for notification state management
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/domain/services/NotificationService";
import { NotificationFilters } from "@/types/notifications";
import { Role } from "@/types/tokenization";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

/**
 * Hook to get the current user's roles
 */
function useUserRoles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .or("expires_at.is.null,expires_at.gt.now()");
      if (error) throw error;
      return data.map((r) => r.role as Role);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      return notificationService.getUnreadCount(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // 10 seconds
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["notifications", "unread-count", user.id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}

/**
 * Hook to get notifications list with filters
 */
export function useNotifications(filters: NotificationFilters = {}) {
  const { user } = useAuth();
  const { data: userRoles = [] } = useUserRoles();

  return useQuery({
    queryKey: ["notifications", "list", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) {
        return { notifications: [], total: 0, hasMore: false, unreadCount: 0 };
      }
      return notificationService.getNotifications(user.id, userRoles, filters);
    },
    enabled: !!user?.id && userRoles.length > 0,
    staleTime: 10000,
  });
}

/**
 * Hook to mark notifications as read
 */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      await notificationService.markAsRead(notificationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await notificationService.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Hook to archive a notification
 */
export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationService.archive(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Hook to subscribe/unsubscribe from an entity
 */
export function useEntitySubscription(entityType: string, entityId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", entityType, entityId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      return notificationService.isSubscribed(user.id, entityType, entityId);
    },
    enabled: !!user?.id,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      await notificationService.subscribe(user.id, entityType, entityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", entityType, entityId],
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      await notificationService.unsubscribe(user.id, entityType, entityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscription", entityType, entityId],
      });
    },
  });

  return {
    isSubscribed: subscriptionQuery.data ?? false,
    isLoading: subscriptionQuery.isLoading,
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    toggle: () => {
      if (subscriptionQuery.data) {
        unsubscribeMutation.mutate();
      } else {
        subscribeMutation.mutate();
      }
    },
  };
}
