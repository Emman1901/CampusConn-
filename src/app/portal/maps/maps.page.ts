import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import * as maplibregl from 'maplibre-gl';

interface CampusLocation {
  name: string;
  description: string;
  lng: number;
  lat: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit, OnDestroy {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;

  map!: maplibregl.Map;
  userMarker!: maplibregl.Marker;
  userLocation: { lat: number; lng: number } | null = null;
  locationAccuracy: number | null = null;

  isTracking = false;
  isLoadingMap = true;
  isPanelExpanded = false;
  locationStatus = 'Locating...';
  errorMessage = '';

  watchId: number | null = null;
  campusMarkers: maplibregl.Marker[] = [];
  accuracyCircle: maplibregl.Marker | null = null;

  // MinSU Campus Center - Victoria, Oriental Mindoro (CORRECTED)
  campusCenter = {
    lat: 13.15384,
    lng: 121.18658
  };

  // Campus locations around MinSU Victoria (CORRECTED - All near campus center)
  campusLocations: CampusLocation[] = [
    {
      name: 'Main Building',
      description: 'Administration Office',
      lng: 121.18658,
      lat: 13.15384,
      icon: 'business',
      color: 'primary',
    },
    {
      name: 'Library',
      description: 'University Library',
      lng: 121.18680,
      lat: 13.15400,
      icon: 'library',
      color: 'secondary',
    },
    {
      name: 'Engineering Building',
      description: 'College of Engineering',
      lng: 121.18640,
      lat: 13.15370,
      icon: 'construct',
      color: 'tertiary',
    },
    {
      name: 'Cafeteria',
      description: 'Student Dining Hall',
      lng: 121.18700,
      lat: 13.15360,
      icon: 'restaurant',
      color: 'success',
    },
    {
      name: 'Gymnasium',
      description: 'Sports Complex',
      lng: 121.18620,
      lat: 13.15410,
      icon: 'fitness',
      color: 'warning',
    },
    {
      name: 'Medical Clinic',
      description: 'Health Services',
      lng: 121.18720,
      lat: 13.15420,
      icon: 'medical',
      color: 'danger',
    },
  ];

  constructor() {
    console.log('🗺️ Maps page loaded');
  }

  ngOnInit() {
    console.log('🗺️ Maps ngOnInit');
  }

  ionViewDidEnter() {
    console.log('🗺️ Maps view entered - Victoria Campus');
    console.log('📍 Campus center:', this.campusCenter);
    
    // Give the view time to render before initializing map
    setTimeout(() => {
      if (this.mapElement && this.mapElement.nativeElement) {
        console.log('✅ Map container found, initializing...');
        this.initializeMap();
      } else {
        console.error('❌ Map container not found!');
        this.errorMessage = 'Map container not ready. Please refresh the page.';
      }
    }, 500); // Increased delay for better reliability
  }

  ngOnDestroy() {
    this.stopTracking();
    if (this.map) {
      this.map.remove();
    }
  }

  ionViewWillLeave() {
    this.stopTracking();
  }

  /**
   * Initialize OpenStreetMap with MapLibre - IMPROVED UX
   */
  initializeMap() {
    try {
      this.isLoadingMap = true;
      this.errorMessage = '';

      console.log('📍 Initializing map at Victoria campus:', this.campusCenter);
      console.log('📦 Map container element:', this.mapElement.nativeElement);

      // Verify container has dimensions
      const rect = this.mapElement.nativeElement.getBoundingClientRect();
      console.log('📏 Container dimensions:', rect.width, 'x', rect.height);

      if (rect.width === 0 || rect.height === 0) {
        console.error('❌ Map container has zero dimensions!');
        this.errorMessage = 'Map container is not visible. Please check the layout.';
        this.isLoadingMap = false;
        return;
      }

      // Create map using OpenStreetMap tiles with better styling
      this.map = new maplibregl.Map({
        container: this.mapElement.nativeElement,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [this.campusCenter.lng, this.campusCenter.lat],
        zoom: 17, // Closer zoom for better campus view
        pitch: 0,
        bearing: 0,
        attributionControl: {
          compact: true,
          customAttribution: '© OpenStreetMap contributors'
        },
      });

      console.log('✅ Map object created, waiting for load event...');

      // Wait for map to load
      this.map.on('load', () => {
        console.log('✅ Map loaded successfully - Victoria Campus');
        this.isLoadingMap = false;

        // Add navigation controls
        this.map.addControl(
          new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true,
          }),
          'top-right'
        );

        // Add scale control
        this.map.addControl(
          new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: 'metric',
          }),
          'bottom-left'
        );

        // Add fullscreen control
        this.map.addControl(new maplibregl.FullscreenControl(), 'top-right');

        // Add campus location markers
        this.addCampusMarkers();

        // Add campus boundary marker (Main campus area)
        this.addCampusBoundary();

        // Start tracking user location
        console.log('🎯 Map fully loaded, starting location tracking...');
        this.startTracking();
      });

      this.map.on('error', (e) => {
        console.error('❌ Map error:', e);
        this.errorMessage =
          'Failed to load map tiles. Please check your internet connection.';
        this.isLoadingMap = false;
      });

      // Add zoom end event for better UX feedback
      this.map.on('zoomend', () => {
        const zoom = this.map.getZoom();
        console.log('🔍 Current zoom level:', zoom.toFixed(2));
      });

    } catch (error) {
      console.error('❌ Error initializing map:', error);
      this.errorMessage = 'Failed to initialize map. Please refresh the page.';
      this.isLoadingMap = false;
    }
  }

  /**
   * Add a visual boundary for the main campus area
   */
  addCampusBoundary() {
    // Create a subtle circle showing the main campus area
    const campusBoundaryEl = document.createElement('div');
    campusBoundaryEl.style.width = '200px';
    campusBoundaryEl.style.height = '200px';
    campusBoundaryEl.style.borderRadius = '50%';
    campusBoundaryEl.style.border = '3px dashed rgba(56, 128, 255, 0.4)';
    campusBoundaryEl.style.backgroundColor = 'rgba(56, 128, 255, 0.05)';
    campusBoundaryEl.style.pointerEvents = 'none';

    new maplibregl.Marker({ element: campusBoundaryEl, anchor: 'center' })
      .setLngLat([this.campusCenter.lng, this.campusCenter.lat])
      .addTo(this.map);
  }

  /**
   * Add markers for campus locations - IMPROVED
   */
  addCampusMarkers() {
    this.campusLocations.forEach((location) => {
      // Create a custom marker element with better styling
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = this.getColorHex(location.color);
      el.style.width = '35px';
      el.style.height = '35px';
      el.style.borderRadius = '50%';
      el.style.border = '4px solid white';
      el.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.3s ease';
      
      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Add icon to marker
      const icon = document.createElement('ion-icon');
      icon.setAttribute('name', location.icon);
      icon.style.fontSize = '18px';
      icon.style.color = 'white';
      icon.style.position = 'absolute';
      icon.style.top = '50%';
      icon.style.left = '50%';
      icon.style.transform = 'translate(-50%, -50%)';
      el.appendChild(icon);

      // Create marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(this.map);

      // Create enhanced popup
      const popup = new maplibregl.Popup({ 
        offset: 35,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
          <div style="padding: 15px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <ion-icon name="${location.icon}" style="font-size: 24px; color: ${this.getColorHex(location.color)}; margin-right: 10px;"></ion-icon>
              <h3 style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${location.name}</h3>
            </div>
            <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.4;">${location.description}</p>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 11px; color: #999;">
                📍 ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}
              </p>
            </div>
          </div>
        `);

      // Attach popup to marker
      marker.setPopup(popup);

      // Add click event for smoother navigation
      el.addEventListener('click', () => {
        this.map.flyTo({
          center: [location.lng, location.lat],
          zoom: 19,
          duration: 1500,
          essential: true,
        });
      });

      this.campusMarkers.push(marker);
    });

    console.log('✅ Added', this.campusMarkers.length, 'campus markers at Victoria');
  }

  /**
   * Start tracking user location in real-time - IMPROVED
   */
  startTracking() {
    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation is not supported by your browser';
      this.locationStatus = 'Not supported';
      console.warn('⚠️ Geolocation not supported');
      return;
    }

    this.locationStatus = 'Requesting location...';
    console.log('📍 Starting location tracking...');

    // First, try to get current position immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Got initial position');
        this.onLocationSuccess(position);
      },
      (error) => {
        console.warn('⚠️ Could not get initial position:', error.message);
        // Continue with watch even if initial position fails
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    // Then start watching position for real-time updates
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.onLocationSuccess(position);
      },
      (error) => {
        this.onLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    console.log('✅ Location watch started with ID:', this.watchId);
  }

  /**
   * Handle successful location retrieval - IMPROVED
   */
  onLocationSuccess(position: GeolocationPosition) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    console.log('📍 Location updated:', lat.toFixed(6), lng.toFixed(6), 'Accuracy:', accuracy.toFixed(0) + 'm');

    this.userLocation = { lat, lng };
    this.locationAccuracy = accuracy;
    this.isTracking = true;
    this.locationStatus = `Tracking (±${accuracy.toFixed(0)}m)`;
    this.errorMessage = '';

    // Create or update user marker
    if (!this.userMarker) {
      // Create custom user marker element with better design
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#4285F4';
      el.style.border = '4px solid white';
      el.style.boxShadow = '0 0 15px rgba(66, 133, 244, 0.6), 0 2px 8px rgba(0,0,0,0.3)';
      el.style.position = 'relative';
      el.style.zIndex = '1000';

      // Add pulse effect
      const pulseEl = document.createElement('div');
      pulseEl.style.position = 'absolute';
      pulseEl.style.width = '100%';
      pulseEl.style.height = '100%';
      pulseEl.style.borderRadius = '50%';
      pulseEl.style.backgroundColor = 'rgba(66, 133, 244, 0.4)';
      pulseEl.style.animation = 'pulse-user-marker 2s ease-out infinite';
      el.appendChild(pulseEl);

      // Add pulse animation styles
      if (!document.getElementById('user-marker-styles')) {
        const style = document.createElement('style');
        style.id = 'user-marker-styles';
        style.textContent = `
          @keyframes pulse-user-marker {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      this.userMarker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat([lng, lat])
        .addTo(this.map);

      // Add accuracy circle
      this.addAccuracyCircle(lng, lat, accuracy);

      // Fly to user location on first fix
      this.map.flyTo({
        center: [lng, lat],
        zoom: 18,
        duration: 2000,
      });

      console.log('✅ User marker created at:', lat.toFixed(6), lng.toFixed(6));
    } else {
      // Smoothly update marker position
      this.userMarker.setLngLat([lng, lat]);
      this.updateAccuracyCircle(lng, lat, accuracy);
    }
  }

  /**
   * Add accuracy circle around user location
   */
  addAccuracyCircle(lng: number, lat: number, accuracy: number) {
    const circleEl = document.createElement('div');
    const size = Math.max(accuracy * 2, 30); // Minimum 30px
    
    circleEl.style.width = `${size}px`;
    circleEl.style.height = `${size}px`;
    circleEl.style.borderRadius = '50%';
    circleEl.style.backgroundColor = 'rgba(66, 133, 244, 0.1)';
    circleEl.style.border = '2px solid rgba(66, 133, 244, 0.3)';
    circleEl.style.pointerEvents = 'none';

    this.accuracyCircle = new maplibregl.Marker({ 
      element: circleEl,
      anchor: 'center'
    })
      .setLngLat([lng, lat])
      .addTo(this.map);
  }

  /**
   * Update accuracy circle
   */
  updateAccuracyCircle(lng: number, lat: number, accuracy: number) {
    if (this.accuracyCircle) {
      this.accuracyCircle.setLngLat([lng, lat]);
      const el = this.accuracyCircle.getElement();
      const size = Math.max(accuracy * 2, 30);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
    }
  }

  /**
   * Handle location errors - IMPROVED
   */
  onLocationError(error: GeolocationPositionError) {
    console.error('❌ Location error:', error);
    this.isTracking = false;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.errorMessage =
          '🔒 Location access denied. Please enable location permissions in your browser settings to see your position on campus.';
        this.locationStatus = 'Permission denied';
        break;
      case error.POSITION_UNAVAILABLE:
        this.errorMessage =
          '📡 Cannot determine your location. Please check your GPS/network connection and try again.';
        this.locationStatus = 'Unavailable';
        break;
      case error.TIMEOUT:
        this.errorMessage =
          '⏱️ Location request timed out. Please ensure GPS is enabled and try again.';
        this.locationStatus = 'Timeout';
        break;
      default:
        this.errorMessage =
          '❓ Unable to get your location. Please check your device settings.';
        this.locationStatus = 'Error';
    }
  }

  /**
   * Stop tracking user location
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      this.locationStatus = 'Tracking stopped';
      console.log('🛑 Location tracking stopped');
    }
  }

  /**
   * Center map on user's current location - IMPROVED
   */
  centerOnUser() {
    if (this.userLocation && this.map) {
      this.map.flyTo({
        center: [this.userLocation.lng, this.userLocation.lat],
        zoom: 19,
        duration: 1500,
        essential: true,
      });
      console.log('🎯 Centered on user location');
      
      // Show a brief toast (you can implement this with Ionic Toast)
      console.log('✅ Centered on your location');
    } else {
      console.warn('⚠️ User location not available yet');
    }
  }

  /**
   * Navigate to a specific campus location - IMPROVED
   */
  navigateToLocation(location: CampusLocation) {
    if (this.map) {
      console.log('📍 Navigating to:', location.name);
      
      this.map.flyTo({
        center: [location.lng, location.lat],
        zoom: 19,
        duration: 2000,
        essential: true,
      });

      // Find and trigger popup for this location
      const marker = this.campusMarkers.find((m) => {
        const lngLat = m.getLngLat();
        return lngLat.lng === location.lng && lngLat.lat === location.lat;
      });

      if (marker) {
        // Open popup after animation completes
        setTimeout(() => {
          marker.togglePopup();
        }, 2100);
      }

      this.isPanelExpanded = false;
    }
  }

  /**
   * Toggle locations panel
   */
  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
    console.log('📋 Panel expanded:', this.isPanelExpanded);
  }

  /**
   * Retry getting location
   */
  retryLocation() {
    console.log('🔄 Retrying location...');
    this.errorMessage = '';
    this.startTracking();
  }

  /**
   * Convert Ionic color names to hex
   */
  getColorHex(color: string): string {
    const colors: { [key: string]: string } = {
      primary: '#3880ff',
      secondary: '#3dc2ff',
      tertiary: '#5260ff',
      success: '#2dd36f',
      warning: '#ffc409',
      danger: '#eb445a',
    };
    return colors[color] || '#3880ff';
  }
}