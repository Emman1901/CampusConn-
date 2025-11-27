import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { UserService, UserProfile } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {

  userProfile: UserProfile | null = null;
  editProfile: UserProfile = {} as UserProfile; // Initialize as empty object with type
  isEditMode: boolean = false;

  constructor(
    private userService: UserService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    console.log('👤 Profile Page loaded');
  }

  ngOnInit() {
    this.loadProfile();
  }

  ionViewWillEnter() {
    this.loadProfile();
  }

  /**
   * Load user profile
   */
  loadProfile() {
    this.userService.user$.subscribe(profile => {
      if (profile) {
        this.userProfile = profile;
        this.editProfile = { ...profile }; // Create copy for editing
        console.log('✅ Profile loaded:', profile);
      }
    });
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.userProfile) {
      // Create a fresh copy for editing
      this.editProfile = { ...this.userProfile };
      console.log('✏️ Edit mode enabled');
    }
  }

  /**
   * Cancel editing
   */
  async cancelEdit() {
    const alert = await this.alertController.create({
      header: 'Cancel Changes',
      message: 'Are you sure you want to discard your changes?',
      buttons: [
        {
          text: 'Continue Editing',
          role: 'cancel'
        },
        {
          text: 'Discard',
          role: 'destructive',
          handler: () => {
            this.isEditMode = false;
            if (this.userProfile) {
              this.editProfile = { ...this.userProfile };
            }
            console.log('❌ Edit cancelled');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Save profile changes to Firestore
   */
  async saveProfile() {
    // Validation
    if (!this.editProfile.firstName || !this.editProfile.lastName) {
      this.showToast('❌ First name and last name are required', 'danger');
      return;
    }

    if (!this.editProfile.email || !this.validateEmail(this.editProfile.email)) {
      this.showToast('❌ Valid email is required', 'danger');
      return;
    }

    // Show loading
    const loading = await this.loadingController.create({
      message: 'Saving profile...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Save to Firestore
      const success = await this.userService.saveUserProfile(this.editProfile);

      await loading.dismiss();

      if (success) {
        this.userProfile = { ...this.editProfile };
        this.isEditMode = false;
        this.showToast('✅ Profile saved successfully!', 'success');
        console.log('✅ Profile saved to Firestore');
      } else {
        this.showToast('❌ Failed to save profile. Please try again.', 'danger');
      }
    } catch (error) {
      await loading.dismiss();
      console.error('❌ Error saving profile:', error);
      this.showToast('❌ An error occurred. Please try again.', 'danger');
    }
  }

  /**
   * Change profile photo
   */
  async changePhoto() {
    const alert = await this.alertController.create({
      header: 'Change Profile Photo',
      message: 'Enter the URL of your profile image:',
      inputs: [
        {
          name: 'imageUrl',
          type: 'url',
          placeholder: 'https://example.com/image.jpg',
          value: this.editProfile.profileImage || ''
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.imageUrl) {
              this.editProfile.profileImage = data.imageUrl;
              this.showToast('✅ Profile photo updated', 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Reset profile to default
   */
  async resetProfile() {
    const alert = await this.alertController.create({
      header: 'Reset Profile',
      message: 'This will reset your profile to default values. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Resetting profile...',
              spinner: 'crescent'
            });
            await loading.present();

            const success = await this.userService.resetProfile();
            await loading.dismiss();

            if (success) {
              this.showToast('✅ Profile reset to default', 'success');
              this.loadProfile();
            } else {
              this.showToast('❌ Failed to reset profile', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Show toast message
   */
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}