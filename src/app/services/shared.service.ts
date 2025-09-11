import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private isFixedTopSubject = new BehaviorSubject<boolean>(false);
  isFixedTop$ = this.isFixedTopSubject.asObservable();

  setFixedTopState(state: boolean): void {
    this.isFixedTopSubject.next(state);
  }
}
