import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'JILAI';
  constructor(private router: Router) {}

     /**
   * loaded on initialization
   */
  ngOnInit(): void {
  }
  shouldShowHeader(): boolean {
    const path = this.router.url.split('?')[0]; // get path without query params
    return !['/login', '/signup', '/verification', '/kyc', '/forgot-password', '/reset-password'].includes(path);
  }

}
