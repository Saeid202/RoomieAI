
import { ProfileContent } from "@/components/dashboard/ProfileContent";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    console.log("Profile page mounted, user:", user?.email ?? "none", "loading:", loading);
  }, [user, loading]);

  return <ProfileContent />;
}
