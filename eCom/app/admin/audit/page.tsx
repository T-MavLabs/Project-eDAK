"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Filter } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAdminAuth, isAdminAuthenticated } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminAction = {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  action_data: any;
  previous_state: any;
  new_state: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_profile: {
    email: string | null;
    full_name: string | null;
  } | null;
};

export default function AdminAuditPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        if (!isAdminAuthenticated()) {
          router.push("/auth/admin-login");
          return;
        }

        requireAdminAuth();

        // Build query - fetch admin actions
        let query = supabase
          .from("admin_actions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500); // Limit to recent 500 actions

        // Apply filters
        if (actionTypeFilter !== "all") {
          query = query.eq("action_type", actionTypeFilter);
        }

        if (targetTypeFilter !== "all") {
          query = query.eq("target_type", targetTypeFilter);
        }

        const { data: actionsData, error: actionsError } = await query;

        if (actionsError) throw actionsError;

        // Fetch admin profiles separately for better reliability
        const adminIds = [...new Set((actionsData || []).map((a: any) => a.admin_id))];
        let adminProfilesMap: Record<string, any> = {};

        if (adminIds.length > 0) {
          const { data: adminProfilesData } = await supabase
            .from("user_profiles")
            .select("id, email, full_name")
            .in("id", adminIds);

          if (adminProfilesData) {
            adminProfilesMap = adminProfilesData.reduce((acc: any, profile: any) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        }

        // Transform data to include admin_profile
        const transformedActions = (actionsData || []).map((action: any) => ({
          ...action,
          admin_profile: adminProfilesMap[action.admin_id] || null,
        }));

        setActions(transformedActions);
      } catch (err) {
        console.error("Error loading audit logs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAuditLogs();
  }, [router, actionTypeFilter, targetTypeFilter]);

  const filteredActions = actions.filter((action) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      action.target_id.toLowerCase().includes(query) ||
      action.admin_profile?.email?.toLowerCase().includes(query) ||
      action.admin_profile?.full_name?.toLowerCase().includes(query) ||
      JSON.stringify(action.action_data || {}).toLowerCase().includes(query)
    );
  });

  const getActionTypeBadge = (actionType: string) => {
    const isPositive = ["product_approve", "seller_verify", "seller_unsuspend"].includes(
      actionType
    );
    const isNegative = [
      "product_reject",
      "product_archive",
      "seller_reject",
      "seller_suspend",
    ].includes(actionType);

    if (isPositive) {
      return (
        <Badge variant="default" className="capitalize">
          {actionType.replace("_", " ")}
        </Badge>
      );
    }
    if (isNegative) {
      return (
        <Badge variant="destructive" className="capitalize">
          {actionType.replace("_", " ")}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="capitalize">
        {actionType.replace("_", " ")}
      </Badge>
    );
  };

  const actionTypes = [
    "all",
    "product_approve",
    "product_reject",
    "product_archive",
    "seller_verify",
    "seller_reject",
    "seller_suspend",
    "seller_unsuspend",
    "order_cancel",
    "order_refund",
    "review_approve",
    "review_reject",
    "review_delete",
    "user_ban",
    "user_unban",
    "user_role_change",
  ];

  const targetTypes = ["all", "product", "seller", "order", "review", "user", "payment", "return"];

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div>Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Complete audit trail of all admin actions
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by target ID, admin email, or action data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-4">
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by action type" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Actions" : type.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by target type" />
                </SelectTrigger>
                <SelectContent>
                  {targetTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Targets" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions ({filteredActions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(action.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {action.admin_profile?.full_name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.admin_profile?.email || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{getActionTypeBadge(action.action_type)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {action.target_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {action.target_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {action.action_data && (
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {JSON.stringify(action.action_data)}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
