import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  updatePassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  adminSignup: (email: string, password: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const adminSignup = async (email: string, password: string) => {
    // Check if user is authorized manager
    const isAuthorized = await userService.isAuthorizedManager(email);
    if (!isAuthorized) {
      throw new Error('You are not authorized to create an admin account. Please contact the system administrator.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      role: 'admin',
      active: true,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    await updatePassword(auth.currentUser, newPassword);
    
    if (currentUser?.isTemporaryPassword) {
      await userService.updateAttendantPassword(currentUser.uid);
    }
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user account is active
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      if (!userData.active) {
        await signOut(auth);
        throw new Error('Your account has been deactivated. Please contact an administrator.');
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.active !== false) {
            setCurrentUser(userData);
          } else {
            await signOut(auth);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    adminSignup,
    updateUserPassword,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};