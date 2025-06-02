import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { GoalWithClient } from "@shared/schema";

export function RecentGoals() {
  const { data: goals, isLoading } = useQuery<GoalWithClient[]>({
    queryKey: ["/api/goals"],
  });

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return "bg-success-100 text-success-800";
    if (progress >= 50) return "bg-warning-100 text-warning-800";
    return "bg-muted text-muted-foreground";
  };

  const getStatusLabel = (progress: number) => {
    if (progress >= 90) return "Almost There";
    if (progress >= 75) return "On Track";
    if (progress >= 50) return "Making Progress";
    return "Needs Focus";
  };

  return (
    <section aria-labelledby="recent-goals-heading">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle id="recent-goals-heading" className="text-lg font-semibold text-foreground">
            Recent Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-2 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))
            ) : goals && goals.length > 0 ? (
              goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={goal.clientAvatar} alt={`Profile picture of ${goal.clientName}`} />
                      <AvatarFallback>
                        {goal.clientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{goal.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{goal.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-20">
                        <Progress 
                          value={goal.progress} 
                          className="h-2"
                          aria-label={`Progress: ${goal.progress}% complete`}
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium text-foreground">
                        {goal.progress}%
                      </span>
                    </div>
                    <Badge 
                      className={getStatusColor(goal.progress)}
                      aria-label={`Status: ${getStatusLabel(goal.progress)}`}
                    >
                      {getStatusLabel(goal.progress)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No goals found</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Button 
              variant="ghost" 
              className="w-full text-center text-sm font-medium text-primary hover:text-primary-700 focus-ring py-2"
            >
              View All Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
