import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
// Add Firebase User interface for better typing
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  /**
   * Logs in a user with email and password using Firebase Auth.
   * ... (existing login method)
   */
  async login(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registers a new user with email and password using Firebase Auth.
   * @param email The new user's email.
   * @param password The new user's password.
   * @returns A promise that resolves to the Firebase UserCredential.
   */
  async register(email: string, password: string): Promise<firebase.auth.UserCredential> {
    try {
      // Create the user account
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      return result;
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  }

  /**
   * Returns the currently logged in user as an Observable.
   * ... (existing getUser method)
   */
  getUser(): Observable<any> {
    return this.afAuth.authState;
  }

  /**
   * Logs out the current user.
   * ... (existing logout method)
   */
  async logout(): Promise<void> {
    await this.afAuth.signOut();
  }
}