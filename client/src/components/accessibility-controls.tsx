import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/hooks/use-accessibility";
import { Contrast, Type } from "lucide-react";

export function AccessibilityControls() {
  const { highContrast, fontSize, toggleHighContrast, toggleFontSize } = useAccessibility();

  return (
    <div className="bg-muted border-b border-border py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHighContrast}
              className="text-sm text-muted-foreground hover:text-foreground focus-ring"
              aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
              aria-pressed={highContrast}
            >
              <Contrast className="mr-1 h-4 w-4" aria-hidden="true" />
              {highContrast ? 'Normal Contrast' : 'High Contrast'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFontSize}
              className="text-sm text-muted-foreground hover:text-foreground focus-ring"
              aria-label={`${fontSize === 'large' ? 'Use normal' : 'Use larger'} text size`}
              aria-pressed={fontSize === 'large'}
            >
              <Type className="mr-1 h-4 w-4" aria-hidden="true" />
              {fontSize === 'large' ? 'Normal Text' : 'Larger Text'}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Press Alt+? for keyboard shortcuts
          </div>
        </div>
      </div>
    </div>
  );
}
