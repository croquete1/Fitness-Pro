// Screen reader announcement utility
export function announceToScreenReader(message: string) {
  const liveRegion = document.getElementById("live-region");
  if (liveRegion) {
    liveRegion.textContent = message;
    
    // Clear the message after a short delay to allow for repeated announcements
    setTimeout(() => {
      liveRegion.textContent = "";
    }, 1000);
  }
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Check if user prefers high contrast
export function prefersHighContrast(): boolean {
  return window.matchMedia("(prefers-contrast: high)").matches;
}

// Focus trap utility for modals
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener("keydown", handleTabKey);
  
  // Focus the first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener("keydown", handleTabKey);
  };
}

// Scroll to element with reduced motion consideration
export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = "smooth") {
  const finalBehavior = prefersReducedMotion() ? "auto" : behavior;
  element.scrollIntoView({ behavior: finalBehavior, block: "center" });
}

// Generate unique IDs for accessibility labels
let idCounter = 0;
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${++idCounter}`;
}

// Keyboard navigation helper
export function isNavigationKey(key: string): boolean {
  return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(key);
}

// Check if element is visible to screen readers
export function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.getAttribute("aria-hidden") !== "true"
  );
}

// ARIA live region manager
class LiveRegionManager {
  private static instance: LiveRegionManager;
  private liveRegion: HTMLElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  static getInstance(): LiveRegionManager {
    if (!LiveRegionManager.instance) {
      LiveRegionManager.instance = new LiveRegionManager();
    }
    return LiveRegionManager.instance;
  }

  private createLiveRegion() {
    if (!this.liveRegion) {
      this.liveRegion = document.createElement("div");
      this.liveRegion.id = "live-region";
      this.liveRegion.setAttribute("aria-live", "polite");
      this.liveRegion.setAttribute("aria-atomic", "true");
      this.liveRegion.className = "sr-only";
      document.body.appendChild(this.liveRegion);
    }
  }

  announce(message: string, priority: "polite" | "assertive" = "polite") {
    if (this.liveRegion) {
      this.liveRegion.setAttribute("aria-live", priority);
      this.liveRegion.textContent = message;
      
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = "";
        }
      }, 1000);
    }
  }
}

export const liveRegionManager = LiveRegionManager.getInstance();
