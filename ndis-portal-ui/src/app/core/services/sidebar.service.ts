import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  // Start expanded on desktop, logic in component will handle mobile auto-hide
  private collapsed = new BehaviorSubject<boolean>(false);
  collapsed$ = this.collapsed.asObservable();

  toggle() {
    this.collapsed.next(!this.collapsed.value);
  }

  setCollapsed(state: boolean) {
    this.collapsed.next(state);
  }
}
