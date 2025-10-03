export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    name: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  logOut: () => Promise<void>;
  isLoadingUser: boolean;
  errorMessage: string | null;
  tokenRef: React.RefObject<string>;
  handleRefreshToken: () => Promise<void>;
  accessToken: string | null;
};

export interface User {
  id: number;
  name: string;
  email: string;
}
