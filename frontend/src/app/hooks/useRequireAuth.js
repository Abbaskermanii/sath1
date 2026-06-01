"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useMe from "@/app/hooks/useMe";

export default function useRequireAuth(allowedRoles = []) {
  const router = useRouter();
  const { user, loading } = useMe();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading, router, allowedRoles]);

  return { user, loading };
}
