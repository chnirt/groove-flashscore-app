import { User } from "firebase/auth";
import { AuthStatus } from ".";

export type IUser = User & {
  fullName?: string;
  wifi?: string;
  currency?: string;
  logo?: string;
};

export type AuthContextType = {
  user: IUser | null;
  status: AuthStatus;
  isLoggedIn: boolean;
  setStatus: (value: React.SetStateAction<AuthStatus>) => void;
  fetchUser: (fbUser: User) => Promise<void>;
};
