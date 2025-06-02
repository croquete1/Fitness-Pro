import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/hooks/use-accessibility";

export function KeyboardShortcutsModal() {
  const { shortcuts } = useAccessibility();

  const shortcutsList = [
    { key: "Alt + G", description: "New Goal" },
    { key: "Alt + S", description: "Schedule Session" },
    { key: "Alt + M", description: "View Messages" },
    { key: "Ctrl + K", description: "Search" },
    { key: "Alt + ?", description: "Show this help" },
    { key: "Tab", description: "Navigate forward" },
    { key: "Shift + Tab", description: "Navigate backward" },
    { key: "Enter/Space", description: "Activate button or link" },
    { key: "Escape", description: "Close dialog" },
  ];

  return (
    <Dialog open={shortcuts.isModalOpen} onOpenChange={shortcuts.hideModal}>
      <DialogContent className="max-w-md" aria-describedby="shortcuts-description">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div id="shortcuts-description" className="space-y-3">
          {shortcutsList.map((shortcut) => (
            <div key={shortcut.key} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs font-mono border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border">
          <Button 
            onClick={shortcuts.hideModal}
            className="w-full bg-muted text-foreground hover:bg-muted/80 focus-ring"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
