import { onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { auth } from "../../lib/firebase";
import {
  resolveSignInMethod,
} from "./accountPresentation";
import {
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from "../../services/auth";
import { cancelAllReminders } from "../../services/reminderScheduler";
import type { AuthUser } from "../../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: (onAccountSelected?: () => void) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  signOut: signOutUser,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: AuthUser | null; loading: boolean }>(
    { user: null, loading: true }
  );

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setState({
        loading: false,
        user: firebaseUser
          ? {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              signInMethod: resolveSignInMethod(
                firebaseUser.providerData.map((provider) => provider.providerId)
              ),
            }
          : null,
      });
    });
  }, []);

  const signOut = async () => {
    await cancelAllReminders();
    await signOutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
