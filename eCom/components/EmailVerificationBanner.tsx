"use client";

import { useState, useEffect } from "react";
import { X, Mail, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/supabase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function EmailVerificationBanner() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    checkEmailVerification();
  }, []);

  async function checkEmailVerification() {
    try {
      const user = await getCurrentUser();
      if (user && !user.email_confirmed_at) {
        setShow(true);
        setEmail(user.email || null);
      }
    } catch {
      // Ignore errors
    }
  }

  if (!show) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 relative">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Please verify your email address</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to verify your email.
            </p>
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
          onClick={() => setShow(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
