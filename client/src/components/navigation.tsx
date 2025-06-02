import { Dumbbell, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import type { User } from "@shared/schema";

interface NavigationProps {
  user?: User;
}

export function Navigation({ user }: NavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", current: location === "/" || location === "/dashboard" },
    { href: "/clients", label: "Clients", current: location === "/clients" },
    { href: "/workouts", label: "Workouts", current: location === "/workouts" },
    { href: "/goals", label: "Goals", current: location === "/goals" },
    { href: "/analytics", label: "Analytics", current: location === "/analytics" },
  ];

  return (
    <>
      {/* Main Navigation Header */}
      <header className="bg-card shadow-sm border-b border-border" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <Dumbbell className="mr-2 h-6 w-6" aria-hidden="true" />
                  FitTracker Pro
                </h1>
              </div>
              
              <nav className="hidden md:block ml-10" role="navigation" aria-label="Main navigation">
                <div className="flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium focus-ring transition-colors ${
                        item.current
                          ? "bg-primary-50 text-primary-700"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground focus-ring p-2"
                aria-label="Notifications (3 unread)"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">3 unread notifications</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={`Profile picture of ${user?.fullName}`} />
                  <AvatarFallback>
                    {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {user?.fullName || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <nav className="md:hidden bg-card border-b border-border" role="navigation" aria-label="Mobile navigation">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium focus-ring transition-colors ${
                item.current
                  ? "bg-primary-50 text-primary-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
