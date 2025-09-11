import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../services/local-storage.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.localStorageService.getDataByKey('token');
    const excludedUrls = [
      `${environment.API_BASE_URL}user/signup`,
      `${environment.API_BASE_URL}user/login`
    ];
    const isExcluded = excludedUrls.some(url => request.url.startsWith(url));

    if (isExcluded) {
      // Skip the interceptor logic for excluded URLs
      return next.handle(request);
    }
    // add auth header with access token if account is logged in and request is to the api url
    const isApiUrl = request.url.startsWith(environment.API_BASE_URL);
    if (accessToken && isApiUrl) {
      request = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${accessToken}`)
      });
    }
    return next.handle(request);
  }
}
