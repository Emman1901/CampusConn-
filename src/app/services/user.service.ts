import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  course: string;
  yearLevel: string;
  section: string;
  address: string;
  city: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  birthDate: string;
  gender: string;
  profileImage?: string;
  lastUpdated: Date | any; // Can be Date or Firestore Timestamp
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private db: Firestore;
  private currentUser: UserProfile | null = null;
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public user$ = this.userSubject.asObservable();

  // Current logged-in user ID (In production, get from auth service)
  private currentUserId = 'user_001'; // Temporary - replace with actual auth

  constructor() {
    // Initialize Firebase
    const app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
    console.log('🔥 Firebase initialized');
    
    // Load user profile
    this.loadUserProfile();
  }

  /**
   * Get default/demo user profile
   */
  private getDefaultProfile(): UserProfile {
    return {
      uid: this.currentUserId,
      studentId: '2021-00123',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan.delacruz@minsu.edu.ph',
      phoneNumber: '+63 912 345 6789',
      course: 'Bachelor of Science in Information Technology',
      yearLevel: '3rd Year',
      section: 'BSIT 3-A',
      address: 'Minas Road, Barangay 1',
      city: 'Victoria',
      zipCode: '5205',
      emergencyContact: 'Maria Dela Cruz',
      emergencyPhone: '+63 917 654 3210',
      birthDate: '2002-05-15',
      gender: 'Male',
      profileImage: 'assets/images/default-avatar.png',
      lastUpdated: new Date()
    };
  }

  /**
   * Load user profile from Firestore
   */
  async loadUserProfile(): Promise<void> {
    try {
      const userDoc = doc(this.db, 'users', this.currentUserId);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Handle lastUpdated conversion
        let lastUpdated = new Date();
        if (data['lastUpdated']) {
          if (data['lastUpdated'] instanceof Date) {
            lastUpdated = data['lastUpdated'];
          } else if (typeof data['lastUpdated'].toDate === 'function') {
            lastUpdated = data['lastUpdated'].toDate();
          }
        }
        
        this.currentUser = {
          ...data,
          lastUpdated: lastUpdated
        } as UserProfile;
        console.log('✅ Loaded user profile from Firestore');
      } else {
        // Create default profile if doesn't exist
        this.currentUser = this.getDefaultProfile();
        await this.saveUserProfile(this.currentUser);
        console.log('✅ Created default user profile');
      }

      this.userSubject.next(this.currentUser);
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Fallback to default profile if Firebase fails
      this.currentUser = this.getDefaultProfile();
      this.userSubject.next(this.currentUser);
    }
  }

  /**
   * Get current user profile
   */
  getUserProfile(): Observable<UserProfile | null> {
    return this.user$;
  }

  /**
   * Get current user profile (sync)
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * Save user profile to Firestore
   */
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      const userDoc = doc(this.db, 'users', profile.uid);
      const profileData = {
        ...profile,
        lastUpdated: new Date() // Always save as JavaScript Date
      };

      await setDoc(userDoc, profileData);
      
      // Update local copy
      this.currentUser = {
        ...profileData,
        lastUpdated: profileData.lastUpdated // Keep as Date object locally
      };
      this.userSubject.next(this.currentUser);
      console.log('✅ User profile saved to Firestore');
      return true;
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      return false;
    }
  }

  /**
   * Update specific fields of user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const userDoc = doc(this.db, 'users', this.currentUserId);
      const updateData = {
        ...updates,
        lastUpdated: new Date()
      };

      await updateDoc(userDoc, updateData);
      
      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          ...updateData
        };
        this.userSubject.next(this.currentUser);
      }

      console.log('✅ User profile updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return false;
    }
  }

  /**
   * Reset to default profile (for testing)
   */
  async resetProfile(): Promise<boolean> {
    const defaultProfile = this.getDefaultProfile();
    return await this.saveUserProfile(defaultProfile);
  }
}