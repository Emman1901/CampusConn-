import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'campuconn.theme';

/**
 * App theme controller.
 *
 * Light mode is the default. Users can pick:
 *   - 'light'  → always light
 *   - 'dark'   → always dark
 *   - 'auto'   → follow OS preference (and react live to changes)
 *
 * When dark is active we add `cc-dark` (our brand tokens) and `ion-palette-dark`
 * (Ionic's dark palette) to <html>. Both are required because Ionic's class
 * palette is gated on `ion-palette-dark`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly mediaQuery: MediaQueryList | null =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  private readonly modeSubject = new BehaviorSubject<ThemeMode>('light');
  private readonly resolvedSubject = new BehaviorSubject<'light' | 'dark'>('light');

  readonly mode$: Observable<ThemeMode> = this.modeSubject.asObservable();
  readonly resolved$: Observable<'light' | 'dark'> = this.resolvedSubject.asObservable();

  /**
   * Boots the theme on app start. Reads the stored preference (defaulting to
   * 'light' as required), applies it, and starts listening for OS changes
   * when the user picked 'auto'.
   */
  initialize(): void {
    const stored = this.readStoredMode();
    this.applyMode(stored, /* persist */ false);

    if (this.mediaQuery) {
      const handler = () => {
        if (this.modeSubject.value === 'auto') {
          this.applyMode('auto', /* persist */ false);
        }
      };
      // Most modern engines support addEventListener; fall back to old API.
      if (typeof this.mediaQuery.addEventListener === 'function') {
        this.mediaQuery.addEventListener('change', handler);
      } else if (typeof (this.mediaQuery as any).addListener === 'function') {
        (this.mediaQuery as any).addListener(handler);
      }
    }
  }

  getMode(): ThemeMode {
    return this.modeSubject.value;
  }

  getResolved(): 'light' | 'dark' {
    return this.resolvedSubject.value;
  }

  setMode(mode: ThemeMode): void {
    this.applyMode(mode, true);
  }

  /**
   * Quick toggle between light and dark, ignoring 'auto'. If the current
   * resolved theme is dark, switch to light, and vice versa.
   */
  toggle(): void {
    const next: ThemeMode = this.getResolved() === 'dark' ? 'light' : 'dark';
    this.setMode(next);
  }

  // ---------------------------------------------------------------------------

  private readStoredMode(): ThemeMode {
    if (typeof localStorage === 'undefined') return 'light';
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw;
    return 'light';
  }

  private applyMode(mode: ThemeMode, persist: boolean): void {
    const isDark = this.resolveIsDark(mode);
    this.modeSubject.next(mode);
    this.resolvedSubject.next(isDark ? 'dark' : 'light');

    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('cc-dark', isDark);
    root.classList.toggle('ion-palette-dark', isDark);

    this.updateThemeColorMeta(isDark);

    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }

  private resolveIsDark(mode: ThemeMode): boolean {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return this.mediaQuery?.matches ?? false;
  }

  /**
   * Keep the browser chrome (mobile address-bar) in sync with the active theme.
   * Replaces both meta tags so we don't fight the media-query versions defined
   * in index.html.
   */
  private updateThemeColorMeta(isDark: boolean): void {
    const head = document.head;
    if (!head) return;

    const color = isDark ? '#0f1117' : '#5a48a4';
    const tags = head.querySelectorAll('meta[name="theme-color"]');
    if (tags.length === 0) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', color);
      head.appendChild(meta);
    } else {
      tags.forEach((tag) => {
        // Remove media restrictions so this single value always wins.
        tag.removeAttribute('media');
        tag.setAttribute('content', color);
      });
    }
  }
}
