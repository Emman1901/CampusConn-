import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeMode, ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.page.html',
  styleUrls: ['./portal.page.scss'],
  standalone: false,
})
export class PortalPage implements OnInit, OnDestroy {
  themeMode: ThemeMode = 'light';
  resolvedTheme: 'light' | 'dark' = 'light';

  private subs = new Subscription();

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeMode = this.themeService.getMode();
    this.resolvedTheme = this.themeService.getResolved();

    this.subs.add(this.themeService.mode$.subscribe((m) => (this.themeMode = m)));
    this.subs.add(this.themeService.resolved$.subscribe((r) => (this.resolvedTheme = r)));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }
}
