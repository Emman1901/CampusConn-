import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, AlertController } from '@ionic/angular';
import { AnnouncementsService, Announcement } from '../../services/announcements.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.page.html',
  styleUrls: ['./announcements.page.scss'],
  standalone: false,
})
export class AnnouncementsPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  selectedCategory: string = 'all';

  constructor(
    private announcementsService: AnnouncementsService,
    private alertController: AlertController
  ) {
    console.log('📢 Portal Announcements Page loaded');
  }

  ngOnInit() {
    this.loadAnnouncements();
  }

  ionViewWillEnter() {
    this.refreshAnnouncements();
  }

  /**
   * Load announcements from service
   */
  loadAnnouncements() {
    this.announcementsService.announcements$.subscribe(announcements => {
      this.announcements = this.announcementsService.getActiveAnnouncements();
      this.filterByCategory();
      console.log('📢 Loaded', this.announcements.length, 'active announcements');
    });
  }

  /**
   * Refresh announcements
   */
  refreshAnnouncements() {
    console.log('🔄 Refreshing announcements...');
    this.announcements = this.announcementsService.getActiveAnnouncements();
    this.filterByCategory();
  }

  /**
   * Filter announcements by category
   */
  filterByCategory() {
    if (this.selectedCategory === 'all') {
      this.filteredAnnouncements = this.announcements;
    } else {
      this.filteredAnnouncements = this.announcements.filter(
        ann => ann.category === this.selectedCategory
      );
    }
    console.log('🔍 Filtered to', this.filteredAnnouncements.length, 'announcements');
  }

  /**
   * View announcement details
   */
  async viewAnnouncement(announcement: Announcement) {
    // Increment view count
    this.announcementsService.incrementViews(announcement.id);

    const alert = await this.alertController.create({
      header: announcement.title,
      subHeader: `Posted by ${announcement.postedBy} on ${new Date(announcement.postedDate).toLocaleDateString()}`,
      message: announcement.content,
      cssClass: 'announcement-detail-alert',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Scroll to top
   */
  scrollToTop() {
    this.content.scrollToTop(500);
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      general: 'information-circle',
      academic: 'school',
      event: 'calendar',
      urgent: 'warning',
      maintenance: 'construct'
    };
    return icons[category] || 'megaphone';
  }

  /**
   * Get category color
   */
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      general: 'primary',
      academic: 'secondary',
      event: 'success',
      urgent: 'danger',
      maintenance: 'warning'
    };
    return colors[category] || 'medium';
  }

  /**
   * Get priority icon
   */
  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      urgent: 'alert-circle',
      high: 'alert',
      normal: 'information-circle',
      low: 'checkmark-circle'
    };
    return icons[priority] || 'information-circle';
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      urgent: 'danger',
      high: 'warning',
      normal: 'primary',
      low: 'medium'
    };
    return colors[priority] || 'medium';
  }
}