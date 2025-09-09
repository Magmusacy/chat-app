import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoadingUser, user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user && !isLoadingUser) {
      router.push("/AuthScreen");
    } else if (user && !isLoadingUser) {
      router.push("/");
    }
  }, [user, isLoadingUser, router]); // sprawdz w docs po co to dependcy array atkie

  return <>{children}</>;
}
