"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/supabase/client";
import { requireAuth } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    shop_name: "",
    business_type: "",
    gstin: "",
    pan: "",
    bank_account_number: "",
    ifsc_code: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const userId = await requireAuth();

      // Load user profile
      const { data: user } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const typedUser = user as unknown as { phone?: string | null; [key: string]: any } | null;
      if (typedUser) setUserProfile(typedUser);

      // Load seller profile
      const { data: seller } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const typedSeller = seller as unknown as {
        shop_name?: string | null;
        business_type?: string | null;
        gstin?: string | null;
        pan?: string | null;
        bank_account_number?: string | null;
        ifsc_code?: string | null;
        address_line1?: string | null;
        address_line2?: string | null;
        city?: string | null;
        state?: string | null;
        pincode?: string | null;
        verification_status?: string | null;
        [key: string]: any;
      } | null;

      if (typedSeller) {
        setSellerProfile(typedSeller);
        setFormData({
          shop_name: typedSeller.shop_name || "",
          business_type: typedSeller.business_type || "",
          gstin: typedSeller.gstin || "",
          pan: typedSeller.pan || "",
          bank_account_number: typedSeller.bank_account_number || "",
          ifsc_code: typedSeller.ifsc_code || "",
          address_line1: typedSeller.address_line1 || "",
          address_line2: typedSeller.address_line2 || "",
          city: typedSeller.city || "",
          state: typedSeller.state || "",
          pincode: typedSeller.pincode || "",
          phone: typedUser?.phone || "",
        });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userId = await requireAuth();

      // Update seller profile
      const { error: sellerError } = await supabase
        .from("seller_profiles")
        .update({
          shop_name: formData.shop_name,
          business_type: formData.business_type,
          gstin: formData.gstin,
          pan: formData.pan,
          bank_account_number: formData.bank_account_number,
          ifsc_code: formData.ifsc_code,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        })
        .eq("id", userId);

      if (sellerError) throw sellerError;

      // Update user profile phone
      if (formData.phone !== userProfile?.phone) {
        const { error: userError } = await supabase
          .from("user_profiles")
          .update({ phone: formData.phone })
          .eq("id", userId);
        if (userError) throw userError;
      }

      alert("Settings saved successfully");
      await loadSettings();
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your seller account and shop information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop Name *</Label>
              <Input
                id="shop_name"
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Input
                id="business_type"
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                placeholder="e.g., Sole Proprietorship, Partnership"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="15-character GSTIN"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="10-character PAN"
                  maxLength={10}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="10-digit phone number"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                  maxLength={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_account_number">Bank Account Number</Label>
              <Input
                id="bank_account_number"
                value={formData.bank_account_number}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                placeholder="Account number for payouts"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc_code">IFSC Code</Label>
              <Input
                id="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                placeholder="11-character IFSC code"
                maxLength={11}
              />
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        {sellerProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <Badge variant={sellerProfile.verification_status === "verified" ? "default" : "secondary"}>
                  {sellerProfile.verification_status || "pending"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your verification status is managed by administrators. Contact support for assistance.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
