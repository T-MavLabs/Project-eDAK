// eCom/supabase/auth.ts
// Authentication utilities for VYAPAR

import { supabase } from "./client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "buyer" | "seller" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email: string | null;
  is_verified: boolean;
  is_active: boolean;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get user profile with role
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  const targetUserId = userId || (await getCurrentUser())?.id;
  if (!targetUserId) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", targetUserId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    // If profile doesn't exist, return null (don't throw)
    if (error.code === "PGRST116") {
      return null;
    }
    // For other errors, log but still return null
    return null;
  }
  
  if (!data) return null;
  return data as UserProfile;
}

/**
 * Get current user's role
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  return profile?.role || null;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if user is seller
 */
export async function isSeller(): Promise<boolean> {
  return hasRole("seller");
}

/**
 * Check if user is buyer
 */
export async function isBuyer(): Promise<boolean> {
  return hasRole("buyer");
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata || {},
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string) {
  try {
    // Verify Supabase client is initialized
    if (!supabase) {
      throw new Error("Supabase client not initialized. Please check your environment variables.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide more detailed error messages
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error(
          "Network error: Unable to connect to authentication server. Please check your internet connection and ensure Supabase URL is correct."
        );
      }
      throw error;
    }
    
    return data;
  } catch (err) {
    // Re-throw with more context if it's a network error
    if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
      throw new Error(
        "Authentication service unavailable. Please check:\n" +
        "1. Your internet connection\n" +
        "2. Supabase project URL in environment variables\n" +
        "3. Browser console for CORS errors"
      );
    }
    throw err;
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>
) {
  // Only allow updating specific fields (prevent role escalation)
  const allowedUpdates: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">> = {};
  
  if (updates.full_name !== undefined) {
    allowedUpdates.full_name = updates.full_name;
  }
  if (updates.phone !== undefined) {
    allowedUpdates.phone = updates.phone;
  }
  if (updates.avatar_url !== undefined) {
    allowedUpdates.avatar_url = updates.avatar_url;
  }
  
  const { data, error } = await supabase
    .from("user_profiles")
    .update(allowedUpdates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Supabase error updating profile:", error);
    throw new Error(error.message || `Failed to update profile: ${error.code || "Unknown error"}`);
  }
  
  if (!data) {
    throw new Error("Profile update returned no data");
  }
  
  return data as UserProfile;
}

/**
 * Request password reset
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
  return data;
}
