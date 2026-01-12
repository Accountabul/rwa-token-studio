import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserStatus, UserProfile } from "@/types/userManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserListTable } from "./UserListTable";
import { Users, Mail, Pause, XCircle } from "lucide-react";

interface UserListTabsProps {
  onUserSelect: (userId: string) => void;
}

export const UserListTabs: React.FC<UserListTabsProps> = ({ onUserSelect }) => {
  const [activeTab, setActiveTab] = React.useState<UserStatus | "all">("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Count users by status
  const counts = React.useMemo(() => {
    if (!users) return { all: 0, INVITED: 0, ACTIVE: 0, SUSPENDED: 0, TERMINATED: 0, LOCKED: 0 };
    
    const result: Record<string, number> = { all: users.length };
    users.forEach((user) => {
      const status = user.status || "ACTIVE";
      result[status] = (result[status] || 0) + 1;
    });
    return result;
  }, [users]);

  // Filter users by active tab
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    if (activeTab === "all") return users;
    return users.filter((user) => (user.status || "ACTIVE") === activeTab);
  }, [users, activeTab]);

  const tabs = [
    { value: "all", label: "All Users", icon: Users, count: counts.all },
    { value: "ACTIVE", label: "Active", icon: Users, count: counts.ACTIVE || 0 },
    { value: "INVITED", label: "Invited", icon: Mail, count: counts.INVITED || 0 },
    { value: "SUSPENDED", label: "Suspended", icon: Pause, count: counts.SUSPENDED || 0 },
    { value: "TERMINATED", label: "Terminated", icon: XCircle, count: counts.TERMINATED || 0 },
  ];

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UserStatus | "all")}>
      <TabsList className="mb-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <Badge variant="secondary" className="ml-1 text-xs">
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab}>
        <UserListTable 
          users={filteredUsers} 
          isLoading={isLoading}
          onUserSelect={onUserSelect}
        />
      </TabsContent>
    </Tabs>
  );
};
