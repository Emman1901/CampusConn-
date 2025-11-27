import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

interface AdminSettings {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  profileImage: string;
  emailNotifications: boolean;
  autoApproveRegistrations: boolean;
  showAdminBadge: boolean;
  theme: string;
  itemsPerPage: number;
  twoFactorAuth: boolean;
  lastUpdated: Date;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {

  adminSettings: AdminSettings = {} as AdminSettings;
  originalSettings: AdminSettings = {} as AdminSettings;
  isEditMode: boolean = false;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    console.log('⚙️ Admin Settings Page loaded');
  }

  ngOnInit() {
    this.loadSettings();
  }

  ionViewWillEnter() {
    this.loadSettings();
  }

  /**
   * Load admin settings (Demo data - replace with actual service)
   */
  loadSettings() {
    this.adminSettings = {
      fullName: 'Admin User',
      email: 'admin@minsu.edu.ph',
      phoneNumber: '+63 912 345 6789',
      role: 'System Administrator',
      department: 'IT Department',
      profileImage: 'assets/images/default-admin.png',
      emailNotifications: true,
      autoApproveRegistrations: false,
      showAdminBadge: true,
      theme: 'light',
      itemsPerPage: 25,
      twoFactorAuth: false,
      lastUpdated: new Date()
    };

    this.originalSettings = { ...this.adminSettings };
    console.log('✅ Admin settings loaded');
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.originalSettings = { ...this.adminSettings };
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
            this.adminSettings = { ...this.originalSettings };
            this.isEditMode = false;
            console.log('❌ Changes discarded');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Save settings
   */
  async saveSettings() {
    // Validation
    if (!this.adminSettings.fullName || !this.adminSettings.email) {
      this.showToast('❌ Name and email are required', 'danger');
      return;
    }

    if (!this.validateEmail(this.adminSettings.email)) {
      this.showToast('❌ Valid email is required', 'danger');
      return;
    }

    // Update last updated timestamp
    this.adminSettings.lastUpdated = new Date();

    // Save to storage/database (add your save logic here)
    console.log('💾 Saving settings:', this.adminSettings);

    this.originalSettings = { ...this.adminSettings };
    this.isEditMode = false;
    this.showToast('✅ Settings saved successfully!', 'success');
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
          value: this.adminSettings.profileImage
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
              this.adminSettings.profileImage = data.imageUrl;
              this.showToast('✅ Profile photo updated', 'success');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Change password
   */
  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current Password'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm New Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change',
          handler: (data) => {
            if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
              this.showToast('❌ All fields are required', 'danger');
              return false;
            }

            if (data.newPassword !== data.confirmPassword) {
              this.showToast('❌ Passwords do not match', 'danger');
              return false;
            }

            if (data.newPassword.length < 6) {
              this.showToast('❌ Password must be at least 6 characters', 'danger');
              return false;
            }

            // Add password change logic here
            this.showToast('✅ Password changed successfully!', 'success');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Reset settings to default
   */
  async resetSettings() {
    const alert = await this.alertController.create({
      header: 'Reset Settings',
      message: 'This will reset all settings to default values. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          role: 'destructive',
          handler: () => {
            this.loadSettings(); // Reload default settings
            this.showToast('✅ Settings reset to default', 'success');
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