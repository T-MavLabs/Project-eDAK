"use client";

import { useSyncExternalStore } from "react";

export type DemoRole = "citizen" | "admin";

const ROLE_KEY = "edak_role";
const ROLE_EVENT = "edak_role_change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ROLE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ROLE_EVENT, callback);
  };
}

function getSnapshot(): DemoRole {
  const v = window.localStorage.getItem(ROLE_KEY);
  return v === "admin" ? "admin" : "citizen";
}

function getServerSnapshot(): DemoRole {
  // Server HTML should never depend on client storage.
  return "citizen";
}

export function useDemoRole(): DemoRole {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setDemoRole(role: DemoRole) {
  window.localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event(ROLE_EVENT));
}
