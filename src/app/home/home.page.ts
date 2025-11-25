import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
// Import the Service and Interface
import { TourService, TourRequest } from '../services/tour.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  // Form Data (pre-filled as in the image)
  fullName: string = 'Juan Dela Cruz';
  emailAddress: string = 'juan.delacruz@example.com'; 
  tourDate: string = ''; // Must be set by date picker
  timeSlot: string = '9:00 AM';
  numberOfGuests: number = 1;

  // Available Time Slots for the dropdown
  timeSlots: string[] = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'];

  constructor(
    // Inject the service and utility components
    private tourService: TourService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  /**
   * Handles the tour request submission, validates data, and sends it to Firestore.
   */
  async requestTour() {
    // Basic validation
    if (!this.fullName || !this.emailAddress || !this.tourDate || !this.timeSlot || this.numberOfGuests < 1) {
      this.presentAlert('Validation Error', 'Please fill in all required fields (especially the preferred date).');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Submitting your tour request...',
    });
    await loading.present();

    // Prepare the data structure
    const requestData: TourRequest = {
      fullName: this.fullName,
      emailAddress: this.emailAddress,
      // Convert ion-datetime format to a simpler date string if needed, 
      // but Firestore can handle the ISO string from tourDate
      tourDate: new Date(this.tourDate).toDateString(), 
      timeSlot: this.timeSlot,
      numberOfGuests: this.numberOfGuests,
      requestedAt: new Date(),
    };

    try {
      // Call the service to save data to Firestore
      await this.tourService.addTourRequest(requestData);
      
      await loading.dismiss();
      this.presentAlert('Success', 'Your campus tour request has been submitted!');
      // Optionally reset the form fields after success
      this.resetForm();

    } catch (error) {
      await loading.dismiss();
      console.error(error);
      this.presentAlert('Submission Failed', 'There was an error submitting your request. Please try again.');
    }
  }

  /**
   * Helper to show an Ionic Alert
   */
  private async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Helper to reset the form (optional)
   */
  private resetForm() {
    this.tourDate = '';
    this.timeSlot = '9:00 AM';
    this.numberOfGuests = 1;
    // Keep name and email pre-filled or reset them too, based on UX preference
    // this.fullName = '';
    // this.emailAddress = '';
  }
}