import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Play, Clock, Users, Target } from "lucide-react";
import { useState } from "react";
import { useAccessibility } from "@/hooks/use-accessibility";
import { AccessibilityControls } from "@/components/accessibility-controls";
import { Navigation } from "@/components/navigation";
import type { WorkoutPlanWithAssignments } from "@shared/schema";

export default function Workouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const { announceToScreenReader } = useAccessibility();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: workoutPlans, isLoading } = useQuery<WorkoutPlanWithAssignments[]>({
    queryKey: ["/api/workout-plans"],
  });

  const filteredPlans = workoutPlans?.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-success-100 text-success-800";
      case "intermediate":
        return "bg-warning-100 text-warning-800";
      case "advanced":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md focus-ring"
      >
        Skip to main content
      </a>

      <AccessibilityControls />
      <Navigation user={user} />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Workout Plans</h1>
          <p className="text-muted-foreground">
            Create, manage, and assign workout plans to your clients.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workout plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-ring"
              aria-label="Search workout plans"
            />
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-700 focus-ring">
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Plans</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="cardio">Cardio</TabsTrigger>
            <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <Card key={plan.id} className="border-border hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <Badge className={getCategoryColor(plan.category)} aria-label={`Category: ${plan.category}`}>
                            {plan.category}
                          </Badge>
                        </div>
                        <Badge className={getDifficultyColor(plan.difficulty)} aria-label={`Difficulty: ${plan.difficulty}`}>
                          {plan.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {plan.description || "No description available"}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {plan.duration} min
                        </div>
                        <div className="flex items-center">
                          <Target className="mr-1 h-4 w-4" />
                          {plan.exerciseCount} exercises
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {plan.assignedClientCount} clients
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Play className="mr-2 h-3 w-3" />
                          Start
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No workout plans found matching your search." : "No workout plans found."}
                  </p>
                  <Button className="mt-4 bg-primary text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Plan
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="strength">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.filter(plan => plan.category === "strength").map((plan) => (
                <Card key={plan.id} className="border-border">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cardio">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.filter(plan => plan.category === "cardio").map((plan) => (
                <Card key={plan.id} className="border-border">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flexibility">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.filter(plan => plan.category === "flexibility").map((plan) => (
                <Card key={plan.id} className="border-border">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}