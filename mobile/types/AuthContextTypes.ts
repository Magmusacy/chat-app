export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    email: string,
    name: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<string | null>;
  logOut: () => Promise<void>;
  isLoadingUser: boolean;
  errorMessage: string | null;
};

export interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}
