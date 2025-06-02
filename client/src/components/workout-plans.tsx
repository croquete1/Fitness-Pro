import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkoutPlanWithAssignments } from "@shared/schema";

export function WorkoutPlans() {
  const { data: plans, isLoading } = useQuery<WorkoutPlanWithAssignments[]>({
    queryKey: ["/api/workout-plans"],
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "strength":
        return "bg-primary-100 text-primary-800";
      case "cardio":
        return "bg-success-100 text-success-800";
      case "flexibility":
        return "bg-purple-100 text-purple-800";
      case "mixed":
        return "bg-warning-100 text-warning-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "strength":
        return "Active";
      case "cardio":
        return "Popular";
      case "flexibility":
        return "New";
      case "mixed":
        return "High Intensity";
      default:
        return "Active";
    }
  };

  return (
    <section aria-labelledby="workout-plans-heading">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle id="workout-plans-heading" className="text-lg font-semibold text-foreground">
              Active Workout Plans
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm font-medium text-primary hover:text-primary-700 focus-ring"
            >
              Create New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-3 w-28 mb-2" />
                  <div className="flex items-center">
                    <div className="flex -space-x-1">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : plans && plans.length > 0 ? (
              plans.map((plan) => (
                <div key={plan.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.exerciseCount} exercises • {plan.duration} min
                      </p>
                    </div>
                    <Badge className={getCategoryColor(plan.category)}>
                      {getCategoryLabel(plan.category)}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">
                      Assigned to {plan.assignedClientCount} clients
                    </p>
                    <div className="mt-2 flex items-center">
                      <div className="flex -space-x-1 overflow-hidden">
                        {plan.assignedClients.slice(0, 3).map((client, index) => (
                          <Avatar key={index} className="h-6 w-6 ring-2 ring-background">
                            <AvatarImage src={client.avatar} alt={`${client.name} avatar`} />
                            <AvatarFallback className="text-xs">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {plan.assignedClientCount > 3 && (
                          <div className="h-6 w-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              +{plan.assignedClientCount - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No workout plans found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
