import { Injectable } from '@angular/core';
// Import corrected for AngularFire Module (compat)
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
// Removed unused Observable import

export interface TourRequest {
  fullName: string;
  emailAddress: string;
  tourDate: string;
  timeSlot: string;
  numberOfGuests: number;
  requestedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  // Use AngularFirestoreCollection
  private tourRequestsCollection: AngularFirestoreCollection<TourRequest>;

  // Inject AngularFirestore
  constructor(private firestore: AngularFirestore) {
    // Initialize the collection reference
    this.tourRequestsCollection = this.firestore.collection<TourRequest>('tourRequests');
  }

  // ... (rest of the addTourRequest method remains the same)
  async addTourRequest(request: TourRequest): Promise<void> {
    try {
      await this.tourRequestsCollection.add({
        ...request,
        requestedAt: new Date(), 
      });
      console.log('Tour Request successfully added to Firestore.');
    } catch (e) {
      console.error('Error adding document: ', e);
      throw new Error('Failed to submit tour request.');
    }
  }
}