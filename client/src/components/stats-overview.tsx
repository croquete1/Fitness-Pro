import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Calendar, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  activeClients: number;
  goalsAchieved: number;
  sessionsToday: number;
  successRate: number;
}

interface StatsOverviewProps {
  stats?: StatsData;
  isLoading: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  const statCards = [
    {
      id: "active-clients",
      label: "Active Clients",
      value: stats?.activeClients,
      icon: Users,
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      id: "goals-achieved",
      label: "Goals Achieved",
      value: stats?.goalsAchieved,
      icon: Trophy,
      bgColor: "bg-success-100",
      iconColor: "text-success-600",
    },
    {
      id: "sessions-today",
      label: "Sessions Today",
      value: stats?.sessionsToday,
      icon: Calendar,
      bgColor: "bg-warning-100",
      iconColor: "text-warning-600",
    },
    {
      id: "success-rate",
      label: "Success Rate",
      value: stats?.successRate,
      suffix: "%",
      icon: Percent,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <section className="mb-8" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="text-lg font-semibold text-foreground mb-4">
        Today's Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <IconComponent className={`${stat.iconColor} h-5 w-5`} aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground" id={`${stat.id}-label`}>
                      {stat.label}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground" aria-labelledby={`${stat.id}-label`}>
                        {stat.value}{stat.suffix || ""}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
