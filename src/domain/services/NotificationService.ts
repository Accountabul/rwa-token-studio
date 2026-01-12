// ============================================================================
// ENTERPRISE NOTIFICATION SERVICE
// Handles notification emission, routing, and retrieval
// ============================================================================

import { supabase } from "@/integrations/supabase/client";
import {
  NotificationEventType,
  NotificationPriority,
  NotificationStatus,
  RoutingReason,
  Notification,
  NotificationFilters,
  NotificationListResult,
  EmitNotificationParams,
} from "@/types/notifications";
import { Role } from "@/types/tokenization";
import { getRoutingRule } from "@/config/notificationRouting";

interface NotificationInsert {
  event_type: NotificationEventType;
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  actor_user_id: string;
  actor_name: string;
  recipient_user_id?: string | null;
  recipient_role?: Role | null;
  routing_reason: RoutingReason;
  channel: string;
  priority: NotificationPriority;
  title: string;
  summary: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
}

export class NotificationService {
  /**
   * Emit a notification based on routing rules
   * Creates notifications for all relevant recipients
   */
  async emit(params: EmitNotificationParams): Promise<void> {
    const rule = getRoutingRule(params.eventType);
    if (!rule) {
      console.warn(`No routing rule found for event type: ${params.eventType}`);
      return;
    }

    const notifications: NotificationInsert[] = [];
    const baseNotification = this.buildBaseNotification(params, rule.priority);

    // 1. Notify assignee if specified
    if (rule.notifyAssignee && params.assigneeUserId) {
      notifications.push({
        ...baseNotification,
        recipient_user_id: params.assigneeUserId,
        recipient_role: null,
        routing_reason: "ASSIGNED",
      });
    }

    // 2. Notify department leads by role
    for (const role of rule.departmentRoles) {
      notifications.push({
        ...baseNotification,
        recipient_user_id: null,
        recipient_role: role,
        routing_reason: "DEPARTMENT_LEAD",
      });
    }

    // 3. Notify watchers (entity subscribers)
    if (rule.notifyWatchers) {
      const watchers = await this.getWatchers(params.entityType, params.entityId);
      for (const watcher of watchers) {
        // Avoid duplicate if watcher is already the assignee
        if (watcher.user_id !== params.assigneeUserId) {
          notifications.push({
            ...baseNotification,
            recipient_user_id: watcher.user_id,
            recipient_role: null,
            routing_reason: "WATCHER",
          });
        }
      }
    }

    // 4. Notify org admins for critical events
    if (rule.notifyOrgAdmins) {
      notifications.push({
        ...baseNotification,
        recipient_user_id: null,
        recipient_role: "SUPER_ADMIN",
        routing_reason: "ORG_ADMIN",
      });
    }

    // Batch insert all notifications
    if (notifications.length > 0) {
      const { error } = await supabase.from("notifications").insert(notifications as any);
      if (error) {
        console.error("Failed to insert notifications:", error);
      }
    }
  }

  /**
   * Get notifications for the current user
   */
  async getNotifications(
    userId: string,
    userRoles: Role[],
    filters: NotificationFilters = {}
  ): Promise<NotificationListResult> {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    // Build query for user's notifications (by user_id or by role)
    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Filter by recipient (user or role)
    // We need to use OR conditions for user_id and roles
    const roleConditions = userRoles.map(r => `recipient_role.eq.${r}`).join(",");
    query = query.or(`recipient_user_id.eq.${userId},${roleConditions}`);

    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.priority && filters.priority !== "all") {
      query = query.eq("priority", filters.priority);
    }
    if (filters.eventType && filters.eventType !== "all") {
      query = query.eq("event_type", filters.eventType);
    }
    if (filters.entityType && filters.entityType !== "all") {
      query = query.eq("entity_type", filters.entityType);
    }
    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Failed to fetch notifications:", error);
      return { notifications: [], total: 0, hasMore: false, unreadCount: 0 };
    }

    // Get unread count
    const { data: unreadData } = await supabase.rpc("get_unread_notification_count", {
      _user_id: userId,
    });

    return {
      notifications: (data as Notification[]) || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
      unreadCount: unreadData || 0,
    };
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc("get_unread_notification_count", {
      _user_id: userId,
    });

    if (error) {
      console.error("Failed to get unread count:", error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Mark specific notifications as read
   */
  async markAsRead(notificationIds: string[]): Promise<void> {
    const { error } = await supabase.rpc("mark_notifications_read", {
      _notification_ids: notificationIds,
    });

    if (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  }

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase.rpc("mark_all_notifications_read");

    if (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }

  /**
   * Archive a notification
   */
  async archive(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      console.error("Failed to archive notification:", error);
    }
  }

  /**
   * Subscribe to an entity (watch)
   */
  async subscribe(userId: string, entityType: string, entityId: string): Promise<void> {
    const { error } = await supabase.from("entity_subscriptions").upsert({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
    });

    if (error) {
      console.error("Failed to subscribe:", error);
    }
  }

  /**
   * Unsubscribe from an entity
   */
  async unsubscribe(userId: string, entityType: string, entityId: string): Promise<void> {
    const { error } = await supabase
      .from("entity_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);

    if (error) {
      console.error("Failed to unsubscribe:", error);
    }
  }

  /**
   * Check if user is subscribed to an entity
   */
  async isSubscribed(userId: string, entityType: string, entityId: string): Promise<boolean> {
    const { data } = await supabase
      .from("entity_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .maybeSingle();

    return !!data;
  }

  // Private helpers

  private buildBaseNotification(
    params: EmitNotificationParams,
    priority: NotificationPriority
  ): Omit<NotificationInsert, "recipient_user_id" | "recipient_role" | "routing_reason"> {
    return {
      event_type: params.eventType,
      entity_type: params.entityType,
      entity_id: params.entityId,
      entity_name: params.entityName || null,
      actor_user_id: params.actorUserId,
      actor_name: params.actorName,
      channel: "in_app",
      priority,
      title: params.title,
      summary: params.summary || null,
      action_url: params.actionUrl || null,
      metadata: params.metadata || {},
    };
  }

  private async getWatchers(
    entityType: string,
    entityId: string
  ): Promise<Array<{ user_id: string }>> {
    const { data, error } = await supabase
      .from("entity_subscriptions")
      .select("user_id")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);

    if (error) {
      console.error("Failed to get watchers:", error);
      return [];
    }

    return data || [];
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
