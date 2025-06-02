import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { ScheduleEvent } from "@shared/schema";

export function Schedule() {
  const { data: events, isLoading } = useQuery<ScheduleEvent[]>({
    queryKey: ["/api/schedule"],
  });

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "session":
        return "bg-primary-50 border-l-primary-500 text-primary-600";
      case "consultation":
        return "bg-success-50 border-l-success-500 text-success-600";
      case "group_class":
        return "bg-purple-50 border-l-purple-500 text-purple-600";
      default:
        return "bg-muted border-l-muted-foreground text-muted-foreground";
    }
  };

  return (
    <section aria-labelledby="schedule-heading">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle id="schedule-heading" className="text-lg font-semibold text-foreground">
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-muted rounded-lg border-l-4">
                  <div className="flex-shrink-0">
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 ${getEventColor(event.eventType)}`}
                >
                  <div className="flex-shrink-0">
                    <div className={`font-semibold text-sm ${getEventColor(event.eventType).split(' ')[2]}`}>
                      {format(new Date(event.startTime), "h:mm aa")}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No events scheduled for today</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Button 
              variant="ghost" 
              className="w-full text-center text-sm font-medium text-primary hover:text-primary-700 focus-ring py-2"
            >
              View Full Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
