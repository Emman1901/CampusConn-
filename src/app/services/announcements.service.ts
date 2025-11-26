import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'event' | 'urgent' | 'maintenance';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  postedBy: string;
  postedDate: Date;
  expiryDate?: Date;
  imageUrl?: string;
  attachments?: { name: string; url: string }[];
  isActive: boolean;
  views: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementsService {

  private announcements: Announcement[] = [];
  private announcementsSubject = new BehaviorSubject<Announcement[]>([]);
  public announcements$ = this.announcementsSubject.asObservable();

  constructor() {
    console.log('📢 Announcements Service initialized');
    this.loadDemoData();
  }

  /**
   * Load demo announcements (Replace with API calls in production)
   */
  private loadDemoData() {
    this.announcements = [
      {
        id: '1',
        title: 'Welcome to Campus Connect+',
        content: 'We are excited to launch our new campus management system. Stay tuned for updates and announcements!',
        category: 'general',
        priority: 'high',
        postedBy: 'Admin',
        postedDate: new Date('2024-11-20'),
        isActive: true,
        views: 45
      },
      {
        id: '2',
        title: 'Library Hours Extended',
        content: 'The university library will now be open until 10 PM on weekdays to accommodate students during finals week.',
        category: 'academic',
        priority: 'normal',
        postedBy: 'Library Department',
        postedDate: new Date('2024-11-22'),
        expiryDate: new Date('2024-12-15'),
        isActive: true,
        views: 128
      },
      {
        id: '3',
        title: 'Campus Maintenance Notice',
        content: 'The IT department will conduct system maintenance on November 28. Some services may be temporarily unavailable from 2 AM to 6 AM.',
        category: 'maintenance',
        priority: 'urgent',
        postedBy: 'IT Department',
        postedDate: new Date('2024-11-25'),
        expiryDate: new Date('2024-11-28'),
        isActive: true,
        views: 89
      },
      {
        id: '4',
        title: 'Sports Fest 2024',
        content: 'Join us for the annual MinSU Sports Fest! Registration is now open for all students. Various sports competitions will be held from December 5-10.',
        category: 'event',
        priority: 'normal',
        postedBy: 'Sports Committee',
        postedDate: new Date('2024-11-23'),
        expiryDate: new Date('2024-12-10'),
        isActive: true,
        views: 234
      }
    ];
    
    this.announcementsSubject.next(this.announcements);
    console.log('✅ Loaded', this.announcements.length, 'demo announcements');
  }

  /**
   * Get all active announcements
   */
  getAllAnnouncements(): Observable<Announcement[]> {
    return this.announcements$;
  }

  /**
   * Get active announcements (not expired)
   */
  getActiveAnnouncements(): Announcement[] {
    const now = new Date();
    return this.announcements.filter(ann => 
      ann.isActive && 
      (!ann.expiryDate || ann.expiryDate > now)
    ).sort((a, b) => {
      // Sort by priority and date
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.postedDate.getTime() - a.postedDate.getTime();
    });
  }

  /**
   * Get announcement by ID
   */
  getAnnouncementById(id: string): Announcement | undefined {
    return this.announcements.find(ann => ann.id === id);
  }

  /**
   * Add new announcement (Admin only)
   */
  addAnnouncement(announcement: Omit<Announcement, 'id' | 'views'>): void {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: this.generateId(),
      views: 0,
      postedDate: new Date(announcement.postedDate)
    };
    
    this.announcements.unshift(newAnnouncement);
    this.announcementsSubject.next(this.announcements);
    console.log('✅ Added new announcement:', newAnnouncement.title);
  }

  /**
   * Update announcement (Admin only)
   */
  updateAnnouncement(id: string, updates: Partial<Announcement>): void {
    const index = this.announcements.findIndex(ann => ann.id === id);
    if (index !== -1) {
      this.announcements[index] = { 
        ...this.announcements[index], 
        ...updates 
      };
      this.announcementsSubject.next(this.announcements);
      console.log('✅ Updated announcement:', id);
    }
  }

  /**
   * Delete announcement (Admin only)
   */
  deleteAnnouncement(id: string): void {
    this.announcements = this.announcements.filter(ann => ann.id !== id);
    this.announcementsSubject.next(this.announcements);
    console.log('✅ Deleted announcement:', id);
  }

  /**
   * Toggle announcement active status
   */
  toggleAnnouncementStatus(id: string): void {
    const announcement = this.announcements.find(ann => ann.id === id);
    if (announcement) {
      announcement.isActive = !announcement.isActive;
      this.announcementsSubject.next(this.announcements);
      console.log('✅ Toggled announcement status:', id, announcement.isActive);
    }
  }

  /**
   * Increment view count
   */
  incrementViews(id: string): void {
    const announcement = this.announcements.find(ann => ann.id === id);
    if (announcement) {
      announcement.views++;
      this.announcementsSubject.next(this.announcements);
    }
  }

  /**
   * Get announcements by category
   */
  getAnnouncementsByCategory(category: string): Announcement[] {
    return this.announcements.filter(ann => 
      ann.category === category && ann.isActive
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}