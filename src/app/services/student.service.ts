import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

export interface StudentProfile {
  uid: string; // The Firebase Authentication User ID
  firstName: string;
  lastName: string;
  studentId: string;
  universityEmail: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private studentsCollection: AngularFirestoreCollection<StudentProfile>;

  // Inject AngularFirestore (using compat)
  constructor(private firestore: AngularFirestore) {
    // Reference the 'students' collection
    this.studentsCollection = this.firestore.collection<StudentProfile>('students');
  }

  /**
   * Creates a new student profile document in Firestore.
   * Uses set() instead of add() to set the document ID to the user's UID for easy lookup.
   * @param uid The Firebase Authentication User ID.
   * @param profile The partial StudentProfile data.
   */
  async createStudentProfile(uid: string, profile: Omit<StudentProfile, 'uid' | 'createdAt'>): Promise<void> {
    try {
      // Use set() on a document reference to make the document ID equal to the UID
      await this.studentsCollection.doc(uid).set({
        uid: uid,
        ...profile,
        createdAt: new Date(),
      });
      console.log('Student profile successfully created in Firestore.');
    } catch (e) {
      console.error('Error creating student profile: ', e);
      throw new Error('Failed to create student profile.');
    }
  }
}