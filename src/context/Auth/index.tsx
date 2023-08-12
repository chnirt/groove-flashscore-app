import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { debounce } from "lodash";
import { User, onAuthStateChanged } from "firebase/auth";
import { DocumentData, DocumentReference } from "firebase/firestore";
import { Toast } from "antd-mobile";
import { AuthContextType, IUser } from "./type";
import { auth } from "../../firebase";
import { getDocRef, getDocument } from "../../firebase/service";
import { Loading } from "../../global";

export enum AuthStatus {
  loading = "loading",
  loaded = "loaded",
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  status: AuthStatus.loading,
  isLoggedIn: false,
  setStatus: () => {
    return;
  },
  fetchUser: async () => {
    return;
  },
});

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.loading);
  const [userDocReference, setUserDocReference] = useState<DocumentReference<
    DocumentData,
    DocumentData
  > | null>(null);
  const isLoggedIn = useMemo(() => !!user, [user]);

  const fetchUser = useCallback(
    async (fbUser: User) => {
      try {
        const userDocRef = getDocRef("users", fbUser.uid);
        const userDocData: any = await getDocument(userDocRef);
        if (userDocReference === null) {
          setUserDocReference(userDocRef);
        }
        // console.log(userDocData)
        setUser({ ...fbUser, ...userDocData });
      } catch (error: any) {
        // console.log(error)
        Toast.show({
          icon: "error",
          content: error.message,
        });
      } finally {
        setStatus(AuthStatus.loaded);
        Loading.get.hide();
      }
    },
    [userDocReference],
  );

  const debounceFetchUser = debounce(fetchUser, 1000);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // const uid = user.uid
        if (user === null) {
          // console.log(fbUser)
          debounceFetchUser(fbUser);
        }
        // ...
      } else {
        // User is signed out
        // ...
        setUserDocReference(null);
        setUser(null);
        setStatus(AuthStatus.loaded);
        Loading.get.hide();
      }
    });
    return unsubscribe;
  }, [debounceFetchUser, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isLoggedIn,
        setStatus,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
