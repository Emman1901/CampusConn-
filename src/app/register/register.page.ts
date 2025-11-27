import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  // Form Data
  firstName: string = '';
  lastName: string = '';
  studentId: string = '';
  universityEmail: string = '';
  password: string = '';
  confirmPassword: string = '';

  // State variables
  passwordType: string = 'password';
  confirmPasswordType: string = 'password';
  passwordToggleIcon: string = 'eye-off-outline';
  passwordsMatch: boolean = true;
  showMismatchError: boolean = false;
  
  // Custom validation suffix
  emailSuffix: string = '@msu.edu.ph';

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) { }

  ngOnInit() { }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    } else {
      this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
    }
    // Update the single icon for both (since they appear at the same time)
    this.passwordToggleIcon = this.passwordType === 'password' ? 'eye-off-outline' : 'eye-outline';
  }

  // Simple client-side check for password matching
  checkPasswordMatch() {
    const match = this.password === this.confirmPassword;
    this.passwordsMatch = match;
    this.showMismatchError = !match && this.confirmPassword.length > 0;
  }

  // Basic client-side validation check
  isFormValid(): boolean {
    if (!this.firstName || !this.lastName || !this.studentId || !this.universityEmail || !this.password || !this.confirmPassword) {
      return false;
    }
    if (this.password.length < 6) { // Firebase minimum password length
      this.presentAlert('Validation Error', 'Password must be at least 6 characters long.');
      return false;
    }
    if (!this.universityEmail.endsWith(this.emailSuffix)) {
        this.presentAlert('Validation Error', `Email must end with ${this.emailSuffix}.`);
        return false;
    }
    if (!this.passwordsMatch) {
      this.presentAlert('Validation Error', 'Passwords do not match.');
      return false;
    }
    return true;
  }

  /**
   * Handles the registration process: Firebase Auth and Firestore Profile Creation.
   */
  async onRegister() {
    if (!this.isFormValid()) {
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Creating your account...' });
    await loading.present();

    const fullEmail = this.universityEmail.trim();

    try {
      // 1. Firebase Authentication: Create User
      const authResult = await this.authService.register(fullEmail, this.password);
      const uid = authResult.user?.uid;

      if (!uid) {
        throw new Error('User creation failed.');
      }
      
      // 2. Firestore: Create Student Profile
      const studentProfileData = {
        firstName: this.firstName,
        lastName: this.lastName,
        studentId: this.studentId,
        universityEmail: fullEmail,
      };

      await this.studentService.createStudentProfile(uid, studentProfileData);

      await loading.dismiss();
      this.presentAlert('Success!', 'Your account has been successfully created. You can now sign in.');
      
      // Navigate to the Login page after successful registration
      this.navCtrl.navigateRoot('/login'); 

    } catch (error: any) {
      await loading.dismiss();
      
      // let message = 'An unexpected error occurred during registration.';
      let message = 'Your account has been successfully created. You can now sign in.';
      
      // Map common Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          message = 'The email address is invalid.';
          break;
        default:
          console.error('Firebase Registration Error:', error);
          break;
      }
      
      this.presentAlert('Registration Failed', message);
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  onSignIn() {
    this.navCtrl.navigateRoot('/login');
  }
}