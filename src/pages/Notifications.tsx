import React from "react";
import { Bell, Check, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { NotificationFilters } from "@/components/notifications/NotificationFilters";
import {
  useNotifications,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { NotificationFilters as Filters } from "@/types/notifications";

const NotificationsPage: React.FC = () => {
  const [filters, setFilters] = React.useState<Filters>({
    status: "all",
    priority: "all",
    entityType: "all",
    limit: 50,
  });
  const [activeTab, setActiveTab] = React.useState("all");

  // Adjust filters based on active tab
  const effectiveFilters = React.useMemo(() => {
    switch (activeTab) {
      case "unread":
        return { ...filters, status: "unread" as const };
      case "archived":
        return { ...filters, status: "archived" as const };
      default:
        return filters;
    }
  }, [filters, activeTab]);

  const { data, isLoading } = useNotifications(effectiveFilters);
  const markAllAsRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Inbox className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <NotificationFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-4 p-4 border rounded-lg">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTab === "unread"
                        ? "You're all caught up!"
                        : activeTab === "archived"
                        ? "No archived notifications"
                        : "We'll notify you when something happens"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-2">
                        <NotificationCard notification={notification} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {data?.hasMore && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      limit: (f.limit || 50) + 50,
                    }))
                  }
                >
                  Load more
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;
