"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await signUp(email, password, {
        full_name: fullName,
        role: role,
      });

      if (user) {
        const { supabase } = await import("@/supabase/client");
        
        // Wait for the trigger to create the profile (it runs after auth.users insert)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update non-role fields first
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ 
            full_name: fullName,
            email: user.email || email,
          })
          .eq("id", user.id);
        
        if (updateError) {
          console.error("Error updating profile:", updateError);
        }
        
        // Try to set the role using the database function (if it exists)
        // This function allows users to set their own role during initial signup
        if (role !== "buyer") {
          const { error: roleError } = await supabase.rpc('set_initial_user_role', {
            target_user_id: user.id,
            new_role: role
          });
          
          if (roleError) {
            console.warn("Could not set role via RPC, trying direct update:", roleError);
            // Fallback: try direct update (might fail due to trigger, but worth trying)
            const { error: directUpdateError } = await supabase
              .from("user_profiles")
              .update({ role })
              .eq("id", user.id);
            
            if (directUpdateError) {
              console.error("Could not set role:", directUpdateError);
              // Don't block the user - they can contact admin to fix their role
              // The account is created, just with wrong role
            }
          }
        }

        if (role === "seller") {
          router.push("/seller/onboarding");
        } else {
          router.push("/market");
        }
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Join VYAPAR marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
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
                minLength={6}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                I want to
              </label>
              <Select value={role} onValueChange={(v) => setRole(v as "buyer" | "seller")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buy products</SelectItem>
                  <SelectItem value="seller">Sell products (MSME)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
