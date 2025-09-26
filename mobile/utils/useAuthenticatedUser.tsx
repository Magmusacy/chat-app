import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/AuthContextTypes";

export default function useAuthenticatedUser(): User {
  const { user } = useAuth();

  if (!user) {
    throw new Error("User must be authenticated to use this component");
  }

  return user;
}
