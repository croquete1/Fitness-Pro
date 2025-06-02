import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, CalendarPlus, ClipboardList, TrendingUp } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      title: "New Goal",
      description: "Create client goal",
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
      onClick: () => {
        document.getElementById("goal-description")?.focus();
      },
    },
    {
      icon: CalendarPlus,
      title: "Schedule Session",
      description: "Book appointment",
      bgColor: "bg-success-100",
      iconColor: "text-success-600",
      onClick: () => {
        // TODO: Implement schedule modal
        console.log("Schedule session");
      },
    },
    {
      icon: ClipboardList,
      title: "Create Workout",
      description: "Design routine",
      bgColor: "bg-warning-100",
      iconColor: "text-warning-600",
      onClick: () => {
        // TODO: Implement workout creation
        console.log("Create workout");
      },
    },
    {
      icon: TrendingUp,
      title: "View Progress",
      description: "Check client stats",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => {
        // TODO: Implement progress view
        console.log("View progress");
      },
    },
  ];

  return (
    <section className="mb-8" aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.title}
              variant="ghost"
              className="h-auto p-4 justify-start hover:shadow-md transition-shadow focus-ring"
              onClick={action.onClick}
              asChild
            >
              <Card className="cursor-pointer border-border">
                <div className="flex items-center">
                  <div className={`${action.bgColor} p-3 rounded-lg`}>
                    <IconComponent className={`${action.iconColor} h-5 w-5`} aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Card>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
