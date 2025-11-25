import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  // This property controls the visibility of the emergency hotlines modal.
  // It is 'false' by default, so the modal is hidden on page load.
  isEmergencyModalVisible = false;

  // Track which hotline image is currently displayed (0 = Hotline_A, 1 = Hotline_B)
  currentHotlineIndex = 0;

  // Array of hotline image paths
  hotlineImages = [
    'assets/images/Hotline_A.jpg',
    'assets/images/Hotline_B.jpg'
  ];

  constructor() { 
    console.log('🏠 HomePage constructor called');
  }

  ngOnInit() {
    console.log('🏠 HomePage ngOnInit called');
  }

  /**
   * Test function to verify buttons are working
   */
  testClick(): void {
    console.log('🔥 TEST BUTTON CLICKED!');
    alert('Button is clickable! ✅');
  }

  /**
   * Opens the MinSU student grades portal in the device's default web browser.
   * This function is triggered when the "My Grades" card is clicked.
   */
  openGradesWebsite(): void {
    console.log('📚 Opening grades website...');
    alert('Opening Grades Website!');
    // We use '_system' to ensure the link opens in the main system browser 
    // (like Chrome or Safari) instead of a temporary in-app view.
    // This provides a better and more persistent browsing experience for the user.
    window.open('http://mmc-enrollment.minsu.edu.ph', '_system', 'location=yes');
  }

  /**
   * Shows the emergency hotlines modal overlay.
   * This function is triggered when the "Emergency Contacts" card is clicked.
   */
  showEmergencyHotlines(): void {
    console.log('🚨 Showing emergency hotlines...');
    alert('Opening Emergency Hotlines!');
    this.currentHotlineIndex = 0; // Reset to first image
    this.isEmergencyModalVisible = true;
  }

  /**
   * Hides the emergency hotlines modal overlay.
   * This is triggered by clicking the dark background or the close button on the modal.
   */
  hideEmergencyHotlines(): void {
    this.isEmergencyModalVisible = false;
  }

  /**
   * Navigate to the previous hotline image
   */
  previousHotlineImage(): void {
    if (this.currentHotlineIndex > 0) {
      this.currentHotlineIndex--;
    }
  }

  /**
   * Navigate to the next hotline image
   */
  nextHotlineImage(): void {
    if (this.currentHotlineIndex < this.hotlineImages.length - 1) {
      this.currentHotlineIndex++;
    }
  }

  /**
   * Get the current hotline image path
   */
  getCurrentHotlineImage(): string {
    return this.hotlineImages[this.currentHotlineIndex];
  }

}