import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AnnouncementsService, Announcement } from '../../services/announcements.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.page.html',
  styleUrls: ['./announcements.page.scss'],
  standalone: false,
})
export class AnnouncementsPage implements OnInit {

  announcements: Announcement[] = [];
  totalAnnouncements: number = 0;
  activeAnnouncements: number = 0;
  totalViews: number = 0;

  constructor(
    private announcementsService: AnnouncementsService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    console.log('👨‍💼 Admin Announcements Page loaded');
  }

  ngOnInit() {
    this.loadAnnouncements();
  }

  ionViewWillEnter() {
    this.loadAnnouncements();
  }

  /**
   * Load all announcements
   */
  loadAnnouncements() {
    this.announcementsService.announcements$.subscribe(announcements => {
      this.announcements = announcements;
      this.updateStatistics();
      console.log('📊 Loaded', this.announcements.length, 'announcements');
    });
  }

  /**
   * Update statistics
   */
  updateStatistics() {
    this.totalAnnouncements = this.announcements.length;
    this.activeAnnouncements = this.announcements.filter(a => a.isActive).length;
    this.totalViews = this.announcements.reduce((sum, a) => sum + a.views, 0);
  }

  /**
   * Add new announcement
   */
  async addNewAnnouncement() {
    const alert = await this.alertController.create({
      header: 'Create New Announcement',
      cssClass: 'announcement-form-alert',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Announcement Title',
          attributes: {
            maxlength: 100
          }
        },
        {
          name: 'content',
          type: 'textarea',
          placeholder: 'Announcement Content',
          attributes: {
            rows: 5
          }
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category (general, academic, event, urgent, maintenance)',
          value: 'general'
        },
        {
          name: 'priority',
          type: 'text',
          placeholder: 'Priority (low, normal, high, urgent)',
          value: 'normal'
        },
        {
          name: 'postedBy',
          type: 'text',
          placeholder: 'Posted By',
          value: 'Admin'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: (data) => {
            if (data.title && data.content) {
              const newAnnouncement = {
                title: data.title,
                content: data.content,
                category: data.category as any || 'general',
                priority: data.priority as any || 'normal',
                postedBy: data.postedBy || 'Admin',
                postedDate: new Date(),
                isActive: true
              };

              this.announcementsService.addAnnouncement(newAnnouncement);
              this.showToast('✅ Announcement created successfully!', 'success');
              return true;
            } else {
              this.showToast('❌ Please fill in all required fields', 'danger');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Edit announcement
   */
  async editAnnouncement(announcement: Announcement) {
    const alert = await this.alertController.create({
      header: 'Edit Announcement',
      cssClass: 'announcement-form-alert',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Announcement Title',
          value: announcement.title
        },
        {
          name: 'content',
          type: 'textarea',
          placeholder: 'Announcement Content',
          value: announcement.content,
          attributes: {
            rows: 5
          }
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Category',
          value: announcement.category
        },
        {
          name: 'priority',
          type: 'text',
          placeholder: 'Priority',
          value: announcement.priority
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
            this.announcementsService.updateAnnouncement(announcement.id, {
              title: data.title,
              content: data.content,
              category: data.category as any,
              priority: data.priority as any
            });
            this.showToast('✅ Announcement updated successfully!', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(announcement: Announcement) {
    const alert = await this.alertController.create({
      header: 'Delete Announcement',
      message: `Are you sure you want to delete "${announcement.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.announcementsService.deleteAnnouncement(announcement.id);
            this.showToast('✅ Announcement deleted', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Toggle announcement status
   */
  toggleStatus(id: string) {
    this.announcementsService.toggleAnnouncementStatus(id);
    this.showToast('✅ Status updated', 'success');
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