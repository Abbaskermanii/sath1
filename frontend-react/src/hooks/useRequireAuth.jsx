import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useMe from "./useMe";

export default function useRequireAuth(allowedRoles = []) {
  const navigate = useNavigate();
  const { user, loading } = useMe();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, allowedRoles]);

  return { user, loading };
}
