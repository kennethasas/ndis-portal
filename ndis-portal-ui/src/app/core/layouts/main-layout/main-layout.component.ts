// File: src/app/features/layout/main-layout.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
/* Import your chatbot container */
import { ChatbotContainerComponent }
from '../../../../shared/components/chat/chatbot-container/chatbot-container.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component'; // Adjust path as needed

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    ChatbotContainerComponent,
    ToastComponent,
  ],
  templateUrl: './main-layout.component.html',
  // This ensures the layout component itself fills the screen
  host: { class: 'block h-screen w-full' },
})
export class MainLayoutComponent {}