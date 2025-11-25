import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {

  isEmergencyModalVisible = false;
  currentHotlineIndex = 0;
  hotlineImages = [
    'assets/images/Hotline_A.jpg',
    'assets/images/Hotline_B.jpg'
  ];

  constructor() {
    console.log('📊 Dashboard page loaded');
  }

  ngOnInit() {
    console.log('📊 Dashboard ngOnInit');
  }

  testClick(): void {
    console.log('🔥 TEST BUTTON CLICKED!');
    alert('✅ SUCCESS! Button is clickable!');
  }

  openGradesWebsite(): void {
    console.log('📚 Opening grades website...');
    alert('Opening Grades Website!');
    window.open('http://mmc-enrollment.minsu.edu.ph', '_system', 'location=yes');
  }

  showEmergencyHotlines(): void {
    console.log('🚨 Showing emergency hotlines...');
    this.currentHotlineIndex = 0;
    this.isEmergencyModalVisible = true;
  }

  hideEmergencyHotlines(): void {
    console.log('❌ Hiding emergency hotlines...');
    this.isEmergencyModalVisible = false;
  }

  previousHotlineImage(): void {
    if (this.currentHotlineIndex > 0) {
      this.currentHotlineIndex--;
      console.log('⬅️ Previous image:', this.currentHotlineIndex + 1);
    }
  }

  nextHotlineImage(): void {
    if (this.currentHotlineIndex < this.hotlineImages.length - 1) {
      this.currentHotlineIndex++;
      console.log('➡️ Next image:', this.currentHotlineIndex + 1);
    }
  }

  getCurrentHotlineImage(): string {
    return this.hotlineImages[this.currentHotlineIndex];
  }

}