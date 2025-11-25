import { Component, OnInit } from '@angular/core';
// Import services for Auth, UI feedback, and Navigation
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  // Form Data
  usernameOrEmail: string = '';
  passwordInput: string = '';
  
  // State variables
  selectedRole: string = 'student'; 
  passwordType: string = 'password'; 
  passwordToggleIcon: string = 'eye-off-outline';

  constructor(
    private authService: AuthService, // Injected Auth Service
    private loadingCtrl: LoadingController, 
    private alertCtrl: AlertController, 
    private navCtrl: NavController // To navigate on successful login
  ) { }

  ngOnInit() { }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    this.passwordToggleIcon = this.passwordToggleIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline';
  }
  
  segmentChanged(event: any) {
    this.selectedRole = event.detail.value;
  }

  /**
   * Handles user login.
   * Checks for hard-coded admin credentials first, then proceeds with Firebase auth.
   */
  async onLogin() {
    // 1. Basic form validation
    if (!this.usernameOrEmail || !this.passwordInput) {
      this.presentAlert('Validation Error', 'Please enter both email and password.');
      return;
    }

    // --- ADMIN CREDENTIALS CHECK ---
    // 2. Check for the hard-coded admin credentials before trying Firebase.
    const isAdmin = this.usernameOrEmail.toLowerCase() === 'cbmaccess@admin.com' && this.passwordInput === 'MMCcbm@2025';

    if (isAdmin) {
      const loading = await this.loadingCtrl.create({ message: 'Logging in as Admin...' });
      await loading.present();
      
      // Navigate directly to the admin dashboard
      this.navCtrl.navigateRoot('/admin'); 
      
      await loading.dismiss();
      return; // IMPORTANT: Exit the function here to prevent Firebase login attempt
    }
    // --- END OF ADMIN CHECK ---


    // 3. If not admin, proceed with the normal Firebase login for students
    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
    });
    await loading.present();

    try {
      // Use the injected AuthService to call Firebase signInWithEmailAndPassword
      await this.authService.login(this.usernameOrEmail, this.passwordInput);

      await loading.dismiss();
      
      // On success, navigate to the student dashboard
      this.navCtrl.navigateRoot('/portal'); 

    } catch (error: any) {
      await loading.dismiss();
      
      let message = 'An unexpected error occurred during login.';
      
      // Map common Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // New error code in Firebase v9+
          message = 'Invalid credentials. Please check your email and password.';
          break;
        case 'auth/too-many-requests':
          message = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
          break;
        default:
          console.error('Firebase Login Error:', error);
          break;
      }
      
      this.presentAlert('Login Failed', message);
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

  onForgotPassword() {
    console.log('Navigate to Forgot Password page.');
    // Example: this.navCtrl.navigateForward('/forgot-password');
  }

  onSignUp() {
    console.log('Navigate to Sign Up page.');
    this.navCtrl.navigateRoot('/register');
  }
}