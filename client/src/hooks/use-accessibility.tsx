import { createContext, useContext, useState, useEffect } from "react";
import { announceToScreenReader } from "@/lib/accessibility";

interface AccessibilityContextType {
  highContrast: boolean;
  fontSize: "normal" | "large";
  toggleHighContrast: () => void;
  toggleFontSize: () => void;
  announceToScreenReader: (message: string) => void;
  shortcuts: {
    isModalOpen: boolean;
    showModal: () => void;
    hideModal: () => void;
  };
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem("highContrast") === "true";
    const savedFontSize = localStorage.getItem("fontSize") as "normal" | "large" || "normal";
    
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
    
    // Apply settings to document
    if (savedHighContrast) {
      document.body.classList.add("high-contrast");
    }
    if (savedFontSize === "large") {
      document.body.classList.add("font-large");
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem("highContrast", String(newValue));
    
    if (newValue) {
      document.body.classList.add("high-contrast");
      announceToScreenReader("High contrast mode enabled");
    } else {
      document.body.classList.remove("high-contrast");
      announceToScreenReader("High contrast mode disabled");
    }
  };

  const toggleFontSize = () => {
    const newValue = fontSize === "normal" ? "large" : "normal";
    setFontSize(newValue);
    localStorage.setItem("fontSize", newValue);
    
    if (newValue === "large") {
      document.body.classList.add("font-large");
      announceToScreenReader("Large font size enabled");
    } else {
      document.body.classList.remove("font-large");
      announceToScreenReader("Normal font size enabled");
    }
  };

  const shortcuts = {
    isModalOpen,
    showModal: () => setIsModalOpen(true),
    hideModal: () => setIsModalOpen(false),
  };

  const value: AccessibilityContextType = {
    highContrast,
    fontSize,
    toggleHighContrast,
    toggleFontSize,
    announceToScreenReader,
    shortcuts,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
