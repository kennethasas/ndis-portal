import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  signal,
  computed,
  effect,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-slideshow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full overflow-hidden">
      <!-- Shimmer Placeholder -->
      <div
        *ngIf="!isLoaded()"
        class="absolute inset-0 z-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
      ></div>

      <!-- Image -->
      <img
        [src]="currentImage()"
        [alt]="alt"
        (load)="onImageLoad()"
        (error)="onImageError()"
        [ngClass]="{
          'opacity-100': isLoaded(),
          'opacity-0': !isLoaded(),
        }"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out z-0"
        loading="eager"
      />
    </div>
  `,
  styles: [
    `
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      .animate-shimmer {
        animation: shimmer 1.5s infinite;
      }
    `,
  ],
})
export class SlideshowComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() interval: number = 5000;
  @Input() alt: string = 'Slideshow image';

  // Signals for fine-grained reactivity
  isLoaded = signal(false);
  private currentIndex = signal(0);

  // Computed signal for the source
  currentImage = computed(() => this.images[this.currentIndex()] || '');

  private slideshowInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (this.images.length === 0) return;

    if (isPlatformBrowser(this.platformId)) {
      this.preloadImages();
      this.startSlideshow();
    }
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  onImageLoad() {
    this.isLoaded.set(true);
  }

  onImageError() {
    console.error(`Failed to load: ${this.currentImage()}`);
    this.next();
  }

  private next() {
    this.isLoaded.set(false);
    this.currentIndex.update((idx) => (idx + 1) % this.images.length);
  }

  private preloadImages() {
    this.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  private startSlideshow() {
    this.stopSlideshow();
    this.slideshowInterval = setInterval(() => this.next(), this.interval);
  }

  private stopSlideshow() {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }
}
