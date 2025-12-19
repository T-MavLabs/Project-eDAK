"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await signIn(email, password);
      
      if (user) {
        // Get user role to redirect appropriately
        const { getUserProfile } = await import("@/supabase/auth");
        const { supabase } = await import("@/supabase/client");
        const profile = await getUserProfile(user.id);
        
        // Small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (profile?.role === "seller") {
          // Check if seller has completed onboarding
          const { data: sellerProfile, error: sellerError } = await supabase
            .from("seller_profiles")
            .select("id")
            .eq("id", user.id)
            .single();
          
          if (sellerProfile) {
            // Seller has completed onboarding - go to dashboard
            router.push("/seller/dashboard");
          } else {
            // Seller hasn't completed onboarding - go to onboarding
            router.push("/seller/onboarding");
          }
        } else if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          // Default to buyer/marketplace
          router.push("/market");
        }
        router.refresh();
      }
    } catch (err) {
      // Provide more detailed error messages
      let errorMessage = "Failed to sign in";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle network errors specifically
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          errorMessage = "Unable to connect to authentication server. Please check your internet connection.";
        } else if (err.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email address before signing in.";
        } else if (err.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        }
      }
      
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your VYAPAR account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <div>
              <Link href="/auth/admin-login" className="text-primary hover:underline">
                Admin Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
