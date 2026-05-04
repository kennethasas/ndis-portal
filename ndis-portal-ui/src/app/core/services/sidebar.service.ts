import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private getInitialState(): boolean {
    const saved = localStorage.getItem('sidebar-collapsed');

    // If mobile → always collapsed
    if (window.innerWidth < 768) return true;

    // If desktop → use saved state
    return saved ? JSON.parse(saved) : false;
  }

  private collapsed = new BehaviorSubject<boolean>(this.getInitialState());
  collapsed$ = this.collapsed.asObservable();

  toggle() {
    const newState = !this.collapsed.value;
    this.collapsed.next(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  }

  setCollapsed(state: boolean) {
    this.collapsed.next(state);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(state));
  }
}
