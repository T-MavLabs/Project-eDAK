"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { fetchDigipinByAddress, fetchDigipinByLocation } from "@/lib/digipin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingDigipin, setFetchingDigipin] = useState(false);
  const [digipinError, setDigipinError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    gstin: "",
    pan: "",
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessCity: "",
    businessState: "",
    businessPincode: "",
    businessDigipin: "",
    businessPhone: "",
    businessEmail: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankAccountHolderName: "",
  });

  // Auto-fetch DIGIPIN when address fields are complete
  useEffect(() => {
    if (
      formData.businessAddressLine1 &&
      formData.businessCity &&
      formData.businessState &&
      formData.businessPincode &&
      formData.businessPincode.length === 6
    ) {
      // Debounce: wait 1 second after user stops typing
      const timer = setTimeout(() => {
        handleAutoFetchDigipin();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    formData.businessAddressLine1,
    formData.businessCity,
    formData.businessState,
    formData.businessPincode,
  ]);

  async function handleAutoFetchDigipin() {
    if (
      !formData.businessAddressLine1 ||
      !formData.businessCity ||
      !formData.businessState ||
      !formData.businessPincode ||
      formData.businessPincode.length !== 6
    ) {
      return;
    }

    setFetchingDigipin(true);
    setDigipinError(null);

    try {
      const result = await fetchDigipinByAddress(
        `${formData.businessAddressLine1}${formData.businessAddressLine2 ? `, ${formData.businessAddressLine2}` : ""}`,
        formData.businessCity,
        formData.businessState,
        formData.businessPincode
      );
      
      if (result) {
        setFormData({ ...formData, businessDigipin: result });
      }
    } catch (err) {
      // Silently fail for auto-fetch (user can manually fetch)
      console.warn("Auto-fetch DIGIPIN failed:", err);
    } finally {
      setFetchingDigipin(false);
    }
  }

  async function handleFetchByAddress() {
    if (
      !formData.businessAddressLine1 ||
      !formData.businessCity ||
      !formData.businessState ||
      !formData.businessPincode
    ) {
      setDigipinError("Please fill in address, city, state, and PIN code first");
      return;
    }

    setFetchingDigipin(true);
    setDigipinError(null);

    try {
      const result = await fetchDigipinByAddress(
        `${formData.businessAddressLine1}${formData.businessAddressLine2 ? `, ${formData.businessAddressLine2}` : ""}`,
        formData.businessCity,
        formData.businessState,
        formData.businessPincode
      );
      
      if (result) {
        setFormData({ ...formData, businessDigipin: result });
      } else {
        setDigipinError("Could not fetch DIGIPIN. Please enter manually.");
      }
    } catch (err) {
      setDigipinError(err instanceof Error ? err.message : "Failed to fetch DIGIPIN");
    } finally {
      setFetchingDigipin(false);
    }
  }

  async function handleFetchByLocation() {
    setFetchingDigipin(true);
    setDigipinError(null);

    try {
      const result = await fetchDigipinByLocation();
      
      if (result) {
        setFormData({ ...formData, businessDigipin: result });
      } else {
        setDigipinError("Could not fetch DIGIPIN from location. Please try address or enter manually.");
      }
    } catch (err) {
      setDigipinError(err instanceof Error ? err.message : "Failed to fetch DIGIPIN from location");
    } finally {
      setFetchingDigipin(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userId = await requireAuth();
      
      // Get seller profile ID
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id, role")
        .eq("id", userId)
        .single();

      const typedProfile = profile as unknown as { id: string; role: string } | null;
      if (!typedProfile) throw new Error("User profile not found");

      // Ensure user role is set to 'seller'
      if (typedProfile.role !== "seller") {
        const { error: roleError } = await supabase
          .from("user_profiles")
          .update({ role: "seller" })
          .eq("id", userId);
        
        if (roleError) {
          console.error("Error updating user role:", roleError);
          throw new Error("Failed to set seller role. Please contact support.");
        }
      }

      // Create seller profile
      const { error: sellerError } = await supabase
        .from("seller_profiles")
        .insert({
          id: typedProfile.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          gstin: formData.gstin || null,
          pan: formData.pan || null,
          business_address_line1: formData.businessAddressLine1,
          business_address_line2: formData.businessAddressLine2 || null,
          business_city: formData.businessCity,
          business_state: formData.businessState,
          business_pincode: formData.businessPincode,
          business_digipin: formData.businessDigipin || null,
          business_phone: formData.businessPhone,
          business_email: formData.businessEmail || null,
          bank_account_number: formData.bankAccountNumber || null,
          bank_ifsc: formData.bankIfsc || null,
          bank_account_holder_name: formData.bankAccountHolderName || null,
          verification_status: "pending",
        });

      if (sellerError) throw sellerError;

      router.push("/seller/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Seller Onboarding</CardTitle>
          <CardDescription>
            Complete your MSME seller profile to start selling on VYAPAR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name *</label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Type</label>
                  <Input
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    placeholder="e.g., Sole Proprietorship"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GSTIN</label>
                  <Input
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">PAN</label>
                  <Input
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>
            </div>

            {/* Business Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address Line 1 *</label>
                  <Input
                    value={formData.businessAddressLine1}
                    onChange={(e) =>
                      setFormData({ ...formData, businessAddressLine1: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address Line 2</label>
                  <Input
                    value={formData.businessAddressLine2}
                    onChange={(e) =>
                      setFormData({ ...formData, businessAddressLine2: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City *</label>
                    <Input
                      value={formData.businessCity}
                      onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State *</label>
                    <Input
                      value={formData.businessState}
                      onChange={(e) =>
                        setFormData({ ...formData, businessState: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PIN Code *</label>
                    <Input
                      value={formData.businessPincode}
                      onChange={(e) =>
                        setFormData({ ...formData, businessPincode: e.target.value })
                      }
                      required
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">DIGIPIN (India Post)</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.businessDigipin}
                      onChange={(e) =>
                        setFormData({ ...formData, businessDigipin: e.target.value })
                      }
                      placeholder="e.g., DL-110001-3F2A"
                      className="flex-1"
                      disabled={fetchingDigipin}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleFetchByAddress}
                      disabled={
                        fetchingDigipin ||
                        !formData.businessAddressLine1 ||
                        !formData.businessCity ||
                        !formData.businessState ||
                        !formData.businessPincode
                      }
                      title="Fetch DIGIPIN from address"
                    >
                      {fetchingDigipin ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleFetchByLocation}
                      disabled={fetchingDigipin}
                      title="Fetch DIGIPIN from device location"
                    >
                      {fetchingDigipin ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Navigation className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {digipinError && (
                    <div className="text-xs text-destructive">{digipinError}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Official Address Code used for accurate routing and hub assignment.
                    {fetchingDigipin && " Fetching DIGIPIN..."}
                    {!fetchingDigipin && formData.businessDigipin && " ✓ DIGIPIN fetched automatically"}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Bank Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact & Bank Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Phone *</label>
                  <Input
                    value={formData.businessPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, businessPhone: e.target.value })
                    }
                    required
                    pattern="[0-9]{10}"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Email</label>
                  <Input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, businessEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank Account Number</label>
                  <Input
                    value={formData.bankAccountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, bankAccountNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank IFSC</label>
                  <Input
                    value={formData.bankIfsc}
                    onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                    placeholder="e.g., HDFC0001234"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Account Holder Name</label>
                  <Input
                    value={formData.bankAccountHolderName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankAccountHolderName: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
