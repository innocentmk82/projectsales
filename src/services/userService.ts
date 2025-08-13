import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const userService = {
  // Check if user is authorized manager
  async isAuthorizedManager(email: string): Promise<boolean> {
    const q = query(
      collection(db, 'authorized_managers'),
      where('email', '==', email.toLowerCase()),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  // Get all attendants
  async getAttendants(): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'attendant'),
      orderBy('email')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
  },

  // Create attendant account
  async createAttendant(email: string, tempPassword: string, adminUid: string) {
    // Create Firebase auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    
    // Create user document
    const userData: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      role: 'attendant',
      isTemporaryPassword: true,
      createdBy: adminUid,
      createdAt: new Date(),
      active: true
    };
    
    await addDoc(collection(db, 'users'), userData);
    return userCredential.user.uid;
  },

  // Update attendant password (when they change from temp)
  async updateAttendantPassword(uid: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isTemporaryPassword: false,
      passwordUpdatedAt: Timestamp.now()
    });
  },

  // Deactivate attendant
  async deactivateAttendant(uid: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      active: false,
      deactivatedAt: Timestamp.now()
    });
  },

  // Reactivate attendant
  async reactivateAttendant(uid: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      active: true,
      reactivatedAt: Timestamp.now()
    });
  }
};