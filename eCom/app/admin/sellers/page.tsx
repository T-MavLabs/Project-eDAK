"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, CheckCircle2, XCircle, AlertCircle, Ban, Search } from "lucide-react";
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

type SellerProfile = {
  id: string;
  business_name: string;
  business_type: string | null;
  gstin: string | null;
  pan: string | null;
  business_city: string;
  business_state: string;
  verification_status: "pending" | "under_review" | "verified" | "rejected" | "suspended";
  verification_notes: string | null;
  verified_at: string | null;
  is_active: boolean;
  created_at: string;
  user_profile: {
    email: string | null;
    full_name: string | null;
    phone: string | null;
  } | null;
  is_pending_onboarding?: boolean; // Flag for sellers who haven't completed onboarding
};

function AdminSellersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusFilter);

  // Extract loadSellers function to be reusable
  const loadSellers = async () => {
      try {
        if (!isAdminAuthenticated()) {
          router.push("/auth/admin-login");
          return;
        }

        requireAdminAuth();

        // Build query - get seller_profiles
        let query = supabase
          .from("seller_profiles")
          .select(`
            id,
            business_name,
            business_type,
            gstin,
            pan,
            business_city,
            business_state,
            verification_status,
            verification_notes,
            verified_at,
            is_active,
            created_at
          `)
          .order("created_at", { ascending: false });

        // Apply status filter
        if (filterStatus !== "all") {
          if (filterStatus === "pending") {
            // For pending, show only pending and under_review (not verified/rejected/suspended)
            query = query.in("verification_status", ["pending", "under_review"]);
          } else {
            query = query.eq("verification_status", filterStatus);
          }
        }

        const { data: sellersData, error: sellersError } = await query;

        if (sellersError) throw sellersError;

        // Also get users with seller role who haven't completed onboarding
        // Only show them in "all" or "pending" filters (they're always pending)
        let sellersWithoutProfile: any[] = [];
        if (filterStatus === "all" || filterStatus === "pending") {
          const { data: sellerUsers } = await supabase
            .from("user_profiles")
            .select("id, email, full_name, phone, created_at")
            .eq("role", "seller");
          
          if (sellerUsers) {
            const sellerUserIds = sellerUsers.map((u: any) => u.id);
            const existingSellerIds = (sellersData || []).map((s: any) => s.id);
            const missingIds = sellerUserIds.filter((id: string) => !existingSellerIds.includes(id));
            
            // Create entries for sellers without profiles - use their actual user info
            sellersWithoutProfile = sellerUsers
              .filter((u: any) => missingIds.includes(u.id))
              .map((u: any) => ({
                id: u.id,
                business_name: u.full_name || u.email?.split("@")[0] || "New Seller",
                business_type: null,
                gstin: null,
                pan: null,
                business_city: "Not provided",
                business_state: "Not provided",
                verification_status: "pending" as const,
                verification_notes: "Seller has not completed onboarding form",
                verified_at: null,
                is_active: true,
                created_at: u.created_at,
                user_profile: {
                  email: u.email,
                  full_name: u.full_name,
                  phone: u.phone,
                },
                is_pending_onboarding: true,
              }));
          }
        }

        // Fetch user profiles separately for better reliability
        const sellerIds = (sellersData || []).map((s: any) => s.id);
        let userProfilesMap: Record<string, any> = {};

        if (sellerIds.length > 0) {
          const { data: userProfilesData } = await supabase
            .from("user_profiles")
            .select("id, email, full_name, phone")
            .in("id", sellerIds);

          if (userProfilesData) {
            userProfilesMap = userProfilesData.reduce((acc: any, profile: any) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        }

        // Transform data to include user_profile
        const transformedSellers = (sellersData || []).map((seller: any) => ({
          ...seller,
          user_profile: userProfilesMap[seller.id] || null,
        }));

        // Combine both lists
        setSellers([...transformedSellers, ...sellersWithoutProfile]);
      } catch (err) {
        console.error("Error loading sellers:", err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadSellers();
  }, [router, filterStatus]);

  const handleStatusChange = async (
    sellerId: string,
    newStatus: "verified" | "rejected" | "suspended",
    notes?: string
  ) => {
    try {
      requireAdminAuth();

      // Show loading state
      setLoading(true);

      // Get admin user ID (for verified_by)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get user profile for the seller (needed for creating profile)
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("full_name, email, phone")
        .eq("id", sellerId)
        .single();

      // Check if seller_profiles entry exists
      const { data: existingProfile } = await supabase
        .from("seller_profiles")
        .select("id")
        .eq("id", sellerId)
        .single();

      if (!existingProfile) {
        // Seller hasn't completed onboarding - use API route to create profile
        // Use API route that bypasses RLS with service role
        const response = await fetch("/api/admin/seller-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sellerId,
            newStatus,
            notes,
            userProfile,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || "Failed to create seller profile";
          console.error("API error:", errorData);
          
          // If API fails due to missing service key, show helpful message
          if (errorMessage.includes("SUPABASE_SERVICE_ROLE_KEY")) {
            throw new Error("Server configuration error: Please add SUPABASE_SERVICE_ROLE_KEY to .env.local file. See console for details.");
          }
          throw new Error(errorMessage);
        }
        
        // Verify the profile was created with correct status
        const { data: verifyProfile } = await supabase
          .from("seller_profiles")
          .select("verification_status")
          .eq("id", sellerId)
          .single();
        
        const typedVerifyProfile = verifyProfile as unknown as { verification_status: string } | null;
        if (!typedVerifyProfile || typedVerifyProfile.verification_status !== newStatus) {
          console.warn("Profile status mismatch after creation, retrying...");
          // Wait and reload
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // Seller has profile - try API route first, fallback to direct update
        const response = await fetch("/api/admin/seller-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sellerId,
            newStatus,
            notes,
            userProfile: null,
          }),
        });

        if (!response.ok) {
          // If API fails, try direct update as fallback
          console.warn("API route failed, trying direct update...");
          const updateData: any = {
            verification_status: newStatus,
            verified_at: newStatus === "verified" ? new Date().toISOString() : null,
          };

          if (notes) {
            updateData.verification_notes = notes;
          }

          const { error: updateError } = await supabase
            .from("seller_profiles")
            .update(updateData)
            .eq("id", sellerId);

          if (updateError) {
            console.error("Direct update also failed:", updateError);
            throw updateError;
          }
        }
        
        // Verify the status was updated correctly
        const { data: verifyProfile } = await supabase
          .from("seller_profiles")
          .select("verification_status")
          .eq("id", sellerId)
          .single();
        
        const typedVerifyProfile = verifyProfile as unknown as { verification_status: string } | null;
        if (!typedVerifyProfile || typedVerifyProfile.verification_status !== newStatus) {
          console.warn("Status mismatch after update. Expected:", newStatus, "Got:", typedVerifyProfile?.verification_status);
          // Wait a bit longer and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Log admin action
      try {
        await supabase.from("admin_actions").insert({
          admin_id: user?.id || "00000000-0000-0000-0000-000000000000",
          action_type:
            newStatus === "verified"
              ? "seller_verify"
              : newStatus === "rejected"
                ? "seller_reject"
                : "seller_suspend",
          target_type: "seller",
          target_id: sellerId,
          action_data: { notes },
        });
      } catch (logError) {
        console.error("Failed to log admin action:", logError);
      }

      // Reload sellers data instead of full page reload
      // Wait a bit for the database to update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Force a fresh reload by resetting state first
      setSellers([]);
      setLoading(true);
      
      // Reload the data - this will automatically filter out verified/rejected sellers
      // from the pending list since the query filters by status
      await loadSellers();
      
      // Show success message
      const statusText = newStatus === "verified" ? "verified" : newStatus === "rejected" ? "rejected" : "suspended";
      alert(`Seller ${statusText} successfully!${filterStatus === "pending" && (newStatus === "verified" || newStatus === "rejected") ? " The seller will no longer appear in the pending list." : ""}`);
    } catch (err) {
      console.error("Error updating seller status:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update seller status";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter((seller) => {
    // First apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        seller.business_name.toLowerCase().includes(query) ||
        seller.business_city.toLowerCase().includes(query) ||
        seller.business_state.toLowerCase().includes(query) ||
        seller.gstin?.toLowerCase().includes(query) ||
        seller.user_profile?.email?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }
    
    // Then apply status filter (if not "all")
    // For "pending" filter, only show sellers who are actually pending (not verified/rejected/suspended)
    if (filterStatus === "pending") {
      // Explicitly exclude verified, rejected, and suspended sellers
      const isPending = seller.verification_status === "pending" || seller.verification_status === "under_review";
      const isNotAcceptedOrRejected = seller.verification_status !== "verified" && 
                                      seller.verification_status !== "rejected" && 
                                      seller.verification_status !== "suspended";
      return isPending && isNotAcceptedOrRejected;
    } else if (filterStatus !== "all") {
      return seller.verification_status === filterStatus;
    }
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      verified: "default",
      pending: "secondary",
      under_review: "secondary",
      rejected: "destructive",
      suspended: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div>Loading sellers...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 overflow-x-hidden">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="ux4g-headline">Seller management</h1>
          <p className="ux4g-body text-muted-foreground mt-1">
            Review and manage seller verifications
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin")} className="min-h-[44px] ux4g-label w-full sm:w-auto">
          Back to dashboard
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <Input
                placeholder="Search by business name, city, GSTIN, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md min-w-0"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px] min-h-[44px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sellers</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under review</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="ux4g-title">
            Sellers ({filteredSellers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSellers.length === 0 ? (
            <div className="py-8 text-center ux4g-body text-muted-foreground">
              No sellers found
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="ux4g-label">Business name</TableHead>
                      <TableHead className="ux4g-label">Contact</TableHead>
                      <TableHead className="ux4g-label">Location</TableHead>
                      <TableHead className="ux4g-label">GSTIN/PAN</TableHead>
                      <TableHead className="ux4g-label">Status</TableHead>
                      <TableHead className="ux4g-label">Created</TableHead>
                      <TableHead className="text-right ux4g-label">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSellers.map((seller) => {
                      const isPendingOnboarding = seller.is_pending_onboarding || 
                        (seller.business_city === "Not provided" && seller.business_state === "Not provided");
                      
                      return (
                        <TableRow key={seller.id} className={isPendingOnboarding ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {isPendingOnboarding ? (
                                <div>
                                  <div className="ux4g-label font-medium break-words">
                                    {seller.user_profile?.full_name || seller.user_profile?.email?.split("@")[0] || "New Seller"}
                                  </div>
                                  <Badge variant="outline" className="mt-1 ux4g-body-small">
                                    Awaiting onboarding
                                  </Badge>
                                </div>
                              ) : (
                                <div>
                                  <div className="ux4g-label font-medium break-words">{seller.business_name}</div>
                                  {seller.business_type && (
                                    <div className="ux4g-body-small text-muted-foreground">
                                      {seller.business_type}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="ux4g-body font-medium break-words">
                              {seller.user_profile?.email || "N/A"}
                            </div>
                            {seller.user_profile?.full_name && (
                              <div className="ux4g-body-small text-muted-foreground">
                                {seller.user_profile.full_name}
                              </div>
                            )}
                            {seller.user_profile?.phone && (
                              <div className="ux4g-body-small text-muted-foreground">
                                📞 {seller.user_profile.phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isPendingOnboarding ? (
                              <div className="ux4g-body text-muted-foreground italic">
                                Not provided yet
                              </div>
                            ) : (
                              <div className="ux4g-body">
                                {seller.business_city}, {seller.business_state}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isPendingOnboarding ? (
                              <div className="ux4g-body-small text-muted-foreground italic">
                                Not provided yet
                              </div>
                            ) : (
                              <div className="ux4g-body-small space-y-1">
                                {seller.gstin ? (
                                  <div>GST: {seller.gstin}</div>
                                ) : (
                                  <div className="text-muted-foreground">No GSTIN</div>
                                )}
                                {seller.pan ? (
                                  <div>PAN: {seller.pan}</div>
                                ) : (
                                  <div className="text-muted-foreground">No PAN</div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(seller.verification_status)}
                              {isPendingOnboarding && (
                                <Badge variant="outline" className="ux4g-body-small">
                                  Needs onboarding
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="ux4g-body-small text-muted-foreground">
                            {new Date(seller.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2 flex-wrap">
                              {seller.verification_status === "pending" ||
                              seller.verification_status === "under_review" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleStatusChange(seller.id, "verified")
                                    }
                                    title={isPendingOnboarding ? "Note: Seller hasn't completed onboarding yet" : ""}
                                    className="min-h-[44px] ux4g-label"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden="true" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleStatusChange(seller.id, "rejected")
                                    }
                                    className="min-h-[44px] ux4g-label"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                                    Reject
                                  </Button>
                                </>
                              ) : seller.verification_status === "verified" ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleStatusChange(seller.id, "suspended")
                                  }
                                  className="min-h-[44px] ux4g-label"
                                >
                                  <Ban className="h-4 w-4 mr-1" aria-hidden="true" />
                                  Suspend
                                </Button>
                              ) : seller.verification_status === "suspended" ? (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    handleStatusChange(seller.id, "verified")
                                  }
                                  className="min-h-[44px] ux4g-label"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden="true" />
                                  Unsuspend
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredSellers.map((seller) => {
                  const isPendingOnboarding = seller.is_pending_onboarding || 
                    (seller.business_city === "Not provided" && seller.business_state === "Not provided");
                  
                  return (
                    <Card key={seller.id} className={isPendingOnboarding ? "bg-muted/30" : ""}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {isPendingOnboarding ? (
                                <>
                                  <div className="ux4g-title mb-2 break-words">
                                    {seller.user_profile?.full_name || seller.user_profile?.email?.split("@")[0] || "New Seller"}
                                  </div>
                                  <Badge variant="outline" className="ux4g-body-small">
                                    Awaiting onboarding
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <div className="ux4g-title mb-1 break-words">{seller.business_name}</div>
                                  {seller.business_type && (
                                    <div className="ux4g-body-small text-muted-foreground">
                                      {seller.business_type}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(seller.verification_status)}
                              {isPendingOnboarding && (
                                <Badge variant="outline" className="ux4g-body-small">
                                  Needs onboarding
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <div className="ux4g-label text-muted-foreground mb-1">Contact</div>
                              <div className="ux4g-body break-words">{seller.user_profile?.email || "N/A"}</div>
                              {seller.user_profile?.full_name && (
                                <div className="ux4g-body-small text-muted-foreground mt-1">
                                  {seller.user_profile.full_name}
                                </div>
                              )}
                              {seller.user_profile?.phone && (
                                <div className="ux4g-body-small text-muted-foreground mt-1">
                                  📞 {seller.user_profile.phone}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="ux4g-label text-muted-foreground mb-1">Location</div>
                              {isPendingOnboarding ? (
                                <div className="ux4g-body text-muted-foreground italic">
                                  Not provided yet
                                </div>
                              ) : (
                                <div className="ux4g-body">
                                  {seller.business_city}, {seller.business_state}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="ux4g-label text-muted-foreground mb-1">GSTIN/PAN</div>
                              {isPendingOnboarding ? (
                                <div className="ux4g-body-small text-muted-foreground italic">
                                  Not provided yet
                                </div>
                              ) : (
                                <div className="ux4g-body-small space-y-1">
                                  {seller.gstin ? (
                                    <div>GST: {seller.gstin}</div>
                                  ) : (
                                    <div className="text-muted-foreground">No GSTIN</div>
                                  )}
                                  {seller.pan ? (
                                    <div>PAN: {seller.pan}</div>
                                  ) : (
                                    <div className="text-muted-foreground">No PAN</div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="ux4g-label text-muted-foreground mb-1">Created</div>
                              <div className="ux4g-body-small">{new Date(seller.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 pt-2 border-t">
                            {seller.verification_status === "pending" ||
                            seller.verification_status === "under_review" ? (
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="default"
                                  onClick={() => handleStatusChange(seller.id, "verified")}
                                  title={isPendingOnboarding ? "Note: Seller hasn't completed onboarding yet" : ""}
                                  className="min-h-[44px] ux4g-label"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
                                  Verify
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleStatusChange(seller.id, "rejected")}
                                  className="min-h-[44px] ux4g-label"
                                >
                                  <XCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                                  Reject
                                </Button>
                              </div>
                            ) : seller.verification_status === "verified" ? (
                              <Button
                                variant="destructive"
                                onClick={() => handleStatusChange(seller.id, "suspended")}
                                className="w-full min-h-[44px] ux4g-label"
                              >
                                <Ban className="h-4 w-4 mr-2" aria-hidden="true" />
                                Suspend
                              </Button>
                            ) : seller.verification_status === "suspended" ? (
                              <Button
                                variant="default"
                                onClick={() => handleStatusChange(seller.id, "verified")}
                                className="w-full min-h-[44px] ux4g-label"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
                                Unsuspend
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSellersPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div>Loading...</div>
      </div>
    }>
      <AdminSellersPageContent />
    </Suspense>
  );
}
