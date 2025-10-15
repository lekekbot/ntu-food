/**
 * Location Service for handling geolocation operations
 * Uses browser's Geolocation API to get user's current position
 */

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  private currentLocation: UserLocation | null = null;
  private permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';

  /**
   * Request user's current location
   * @returns Promise with user's coordinates
   */
  async getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by your browser'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };
          this.currentLocation = location;
          this.permissionStatus = 'granted';
          resolve(location);
        },
        (error) => {
          this.permissionStatus = 'denied';
          reject({
            code: error.code,
            message: this.getErrorMessage(error.code)
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Watch user's position for real-time updates
   * @param callback Function to call when position changes
   * @returns Watch ID to clear the watch later
   */
  watchPosition(callback: (location: UserLocation) => void): number {
    if (!navigator.geolocation) {
      return -1;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        };
        this.currentLocation = location;
        callback(location);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );
  }

  /**
   * Clear position watch
   * @param watchId ID returned from watchPosition
   */
  clearWatch(watchId: number): void {
    if (watchId >= 0) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Get cached location if available
   * @returns Cached location or null
   */
  getCachedLocation(): UserLocation | null {
    // Check if cached location is still valid (less than 5 minutes old)
    if (this.currentLocation) {
      const age = Date.now() - this.currentLocation.timestamp;
      if (age < 300000) { // 5 minutes
        return this.currentLocation;
      }
    }
    return null;
  }

  /**
   * Check if location permission is granted
   * @returns Permission status
   */
  getPermissionStatus(): 'granted' | 'denied' | 'prompt' | 'unknown' {
    return this.permissionStatus;
  }

  /**
   * Request location permission (prompts user if not already decided)
   * @returns Promise that resolves when permission is handled
   */
  async requestPermission(): Promise<boolean> {
    try {
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert error code to user-friendly message
   * @param code Error code from GeolocationPositionError
   * @returns Error message
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission denied. Please enable location access in your browser settings.';
      case 2: // POSITION_UNAVAILABLE
        return 'Location information is unavailable. Please check your device settings.';
      case 3: // TIMEOUT
        return 'Location request timed out. Please try again.';
      default:
        return 'An unknown error occurred while getting your location.';
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * (Client-side version for reference - server handles actual calculation)
   * @returns Distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
