"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Mail, User as UserIcon, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getCurrentUser, getUserProfile, updateUserProfile, type UserProfile } from "@/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserEmail(user.email || null);
      setEmailVerified(user.email_confirmed_at !== null);

      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setFullName(userProfile.full_name || "");
        setPhone(userProfile.phone || "");
      } else {
        // Profile might not exist yet - try to create it
        // This should be handled by the trigger, but just in case
        setFullName("");
        setPhone("");
      }
    } catch (err: any) {
      console.error("Error loading profile:", err);
      const errorMsg = err?.message || err?.code || "Failed to load profile";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Verify profile exists before updating
      const existingProfile = await getUserProfile(user.id);
      if (!existingProfile) {
        setError("Profile not found. Please refresh the page or contact support if this persists.");
        setSaving(false);
        return;
      }
      
      // Validate phone format if provided (10 digits)
      if (phone && phone.trim() !== "") {
        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
          setError("Phone number must be exactly 10 digits.");
          setSaving(false);
          return;
        }
        // Update phone to digits-only format
        const formattedPhone = phoneDigits;
        setPhone(formattedPhone);
      }

      // Prepare updates (normalize phone to digits only)
      const phoneDigits = phone ? phone.replace(/\D/g, "") : null;
      const updates = {
        full_name: fullName.trim() || null,
        phone: phoneDigits && phoneDigits.length === 10 ? phoneDigits : null,
      };

      console.log("Updating profile for user:", user.id);
      console.log("Updates:", updates);

      const updatedProfile = await updateUserProfile(user.id, updates);

      console.log("Profile updated successfully:", updatedProfile);

      setSuccess(true);
      await loadProfile(); // Reload to get updated data
      
      // Show success message briefly
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      
      // Handle Supabase errors
      let errorMessage = "Failed to save profile. Please try again.";
      
      if (err) {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.code) {
          errorMessage = `Error ${err.code}: ${err.hint || err.details || "Unknown error"}`;
        } else if (typeof err === "string") {
          errorMessage = err;
        } else if (err.error) {
          // Supabase error object
          errorMessage = err.error.message || err.error.hint || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/market"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your account information
        </p>
      </div>

      {/* Email Verification Alert */}
      {!emailVerified && (
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Email Not Verified</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Please verify your email address to access all features. Check your inbox for the verification link.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">Profile Updated</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Your profile has been successfully updated.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Manage your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={userEmail || ""}
                disabled
                className="bg-muted"
              />
              <div className="flex items-center gap-2 text-xs">
                {emailVerified ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Not verified
                  </span>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={saving}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                disabled={saving}
              />
            </div>

            {/* Role (Read-only) */}
            {profile && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <Input
                  value={profile.role === "buyer" ? "Buyer" : profile.role === "seller" ? "Seller" : "Admin"}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
