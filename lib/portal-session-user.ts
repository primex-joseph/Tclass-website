"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";

export type PortalSessionUser = {
  id: number;
  name: string;
  email: string;
  role: string | null;
};

let cachedSessionUser: PortalSessionUser | null | undefined;
let pendingSessionPromise: Promise<PortalSessionUser | null> | null = null;

const normalizeSessionUser = (payload: unknown): PortalSessionUser | null => {
  const user = (payload as { user?: { id?: number; name?: string; email?: string; role?: string | null } })?.user;
  if (!user?.id || !user?.email) return null;
  return {
    id: Number(user.id),
    name: user.name?.trim() || "Account",
    email: user.email,
    role: user.role ?? null,
  };
};

const fetchSessionUser = async (): Promise<PortalSessionUser | null> => {
  try {
    const response = await apiFetch("/auth/me");
    return normalizeSessionUser(response);
  } catch {
    return null;
  }
};

export const clearPortalSessionUserCache = () => {
  cachedSessionUser = undefined;
  pendingSessionPromise = null;
};

export const usePortalSessionUser = () => {
  const [sessionUser, setSessionUser] = useState<PortalSessionUser | null>(
    cachedSessionUser !== undefined ? cachedSessionUser : null
  );
  const [sessionResolved, setSessionResolved] = useState(cachedSessionUser !== undefined);

  useEffect(() => {
    let alive = true;

    if (cachedSessionUser !== undefined) {
      return () => {
        alive = false;
      };
    }

    if (!pendingSessionPromise) {
      pendingSessionPromise = fetchSessionUser().then((user) => {
        cachedSessionUser = user;
        return user;
      });
    }

    pendingSessionPromise
      .then((user) => {
        if (!alive) return;
        setSessionUser(user);
      })
      .finally(() => {
        if (!alive) return;
        setSessionResolved(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  return { sessionUser, sessionResolved };
};
