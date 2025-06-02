import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Target, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useAccessibility } from "@/hooks/use-accessibility";
import { AccessibilityControls } from "@/components/accessibility-controls";
import { Navigation } from "@/components/navigation";
import type { GoalWithClient } from "@shared/schema";

export default function Goals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { announceToScreenReader } = useAccessibility();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: goals, isLoading } = useQuery<GoalWithClient[]>({
    queryKey: ["/api/goals"],
  });

  const filteredGoals = goals?.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || goal.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary-100 text-primary-800";
      case "completed":
        return "bg-success-100 text-success-800";
      case "paused":
        return "bg-warning-100 text-warning-800";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-success-600";
    if (progress >= 75) return "text-primary-600";
    if (progress >= 50) return "text-warning-600";
    return "text-muted-foreground";
  };

  const goalStats = {
    total: goals?.length || 0,
    active: goals?.filter(g => g.status === "active").length || 0,
    completed: goals?.filter(g => g.status === "completed").length || 0,
    avgProgress: goals?.length ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0,
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Goal Management</h1>
          <p className="text-muted-foreground">
            Track and manage client goals to help them achieve their fitness objectives.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Target className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold text-foreground">{goalStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-warning-100 p-3 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                  <p className="text-2xl font-bold text-foreground">{goalStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-success-100 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{goalStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold text-foreground">{goalStats.avgProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search goals or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-ring"
              aria-label="Search goals or clients"
            />
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-700 focus-ring">
            <Plus className="mr-2 h-4 w-4" />
            Create New Goal
          </Button>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGoals.length > 0 ? (
              <div className="space-y-4">
                {filteredGoals.map((goal) => (
                  <Card key={goal.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={goal.clientAvatar} alt={`${goal.clientName} profile picture`} />
                            <AvatarFallback>
                              {goal.clientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{goal.clientName}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(goal.status)} aria-label={`Status: ${goal.status}`}>
                          {goal.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Progress: </span>
                            <span className={`font-medium ${getProgressColor(goal.progress)}`}>
                              {goal.progress}%
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Target: </span>
                            <span className="font-medium text-foreground">
                              {format(new Date(goal.targetDate), "MMM d, yyyy")}
                            </span>
                          </div>
                          {goal.goalType && (
                            <Badge variant="secondary" className="text-xs">
                              {goal.goalType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Progress 
                          value={goal.progress} 
                          className="h-2"
                          aria-label={`Goal progress: ${goal.progress}% complete`}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Update Progress
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Message Client
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No goals found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No goals match your search criteria." : `No ${selectedStatus === "all" ? "" : selectedStatus} goals found.`}
                </p>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Goal
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}