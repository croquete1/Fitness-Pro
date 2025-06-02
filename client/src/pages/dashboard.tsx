import { useQuery } from "@tanstack/react-query";
import { AccessibilityControls } from "@/components/accessibility-controls";
import { Navigation } from "@/components/navigation";
import { QuickActions } from "@/components/quick-actions";
import { StatsOverview } from "@/components/stats-overview";
import { RecentGoals } from "@/components/recent-goals";
import { WorkoutPlans } from "@/components/workout-plans";
import { Schedule } from "@/components/schedule";
import { Messages } from "@/components/messages";
import { GoalForm } from "@/components/goal-form";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useEffect } from "react";

export default function Dashboard() {
  const { announceToScreenReader, shortcuts } = useAccessibility();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts modal
      if (e.altKey && e.key === "?") {
        e.preventDefault();
        shortcuts.showModal();
      }

      // Quick actions
      if (e.altKey && e.key === "g") {
        e.preventDefault();
        document.getElementById("goal-description")?.focus();
        announceToScreenReader("Quick goal creation form focused");
      }

      if (e.altKey && e.key === "s") {
        e.preventDefault();
        announceToScreenReader("Schedule section focused");
        document.querySelector("#schedule-heading")?.scrollIntoView({ behavior: "smooth" });
      }

      if (e.altKey && e.key === "m") {
        e.preventDefault();
        announceToScreenReader("Messages section focused");
        document.querySelector("#messages-heading")?.scrollIntoView({ behavior: "smooth" });
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        announceToScreenReader("Search functionality not implemented yet");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [announceToScreenReader, shortcuts]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md focus-ring"
      >
        Skip to main content
      </a>

      <AccessibilityControls />
      <Navigation user={user} />

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
      >
        <QuickActions />
        
        <StatsOverview stats={stats} isLoading={statsLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Goals and Workout Plans */}
          <div className="lg:col-span-2 space-y-8">
            <RecentGoals />
            <WorkoutPlans />
          </div>

          {/* Right Column - Schedule, Messages, and Goal Form */}
          <div className="space-y-8">
            <Schedule />
            <Messages />
            <GoalForm />
          </div>
        </div>
      </main>

      <KeyboardShortcutsModal />

      {/* Live region for screen reader announcements */}
      <div
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}
