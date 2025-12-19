"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Hardcoded admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check hardcoded credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Store admin session in localStorage
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_username", username);
        
        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Admin Login</CardTitle>
          </div>
          <CardDescription>Access the VYAPAR admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter admin username"
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
                placeholder="Enter admin password"
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In as Admin"}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium">Default credentials:</span>
              <div className="mt-1 text-xs">
                Username: <code className="rounded bg-muted px-1">admin</code>
              </div>
              <div className="text-xs">
                Password: <code className="rounded bg-muted px-1">admin123</code>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/auth/login" className="text-primary hover:underline">
                User/Seller Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
