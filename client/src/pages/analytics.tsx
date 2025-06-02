import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, TrendingUp, Users, Target, Calendar } from "lucide-react";
import { useAccessibility } from "@/hooks/use-accessibility";
import { AccessibilityControls } from "@/components/accessibility-controls";
import { Navigation } from "@/components/navigation";
import type { GoalWithClient } from "@shared/schema";

export default function Analytics() {
  const { announceToScreenReader } = useAccessibility();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: goals, isLoading: goalsLoading } = useQuery<GoalWithClient[]>({
    queryKey: ["/api/goals"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Calculate analytics data from goals
  const analyticsData = goals ? {
    goalsByType: goals.reduce((acc, goal) => {
      acc[goal.goalType] = (acc[goal.goalType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    avgProgressByType: goals.reduce((acc, goal) => {
      if (!acc[goal.goalType]) {
        acc[goal.goalType] = { total: 0, count: 0 };
      }
      acc[goal.goalType].total += goal.progress;
      acc[goal.goalType].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>),
    completionRate: goals.length > 0 ? Math.round((goals.filter(g => g.status === "completed").length / goals.length) * 100) : 0,
    activeGoalsCount: goals.filter(g => g.status === "active").length,
  } : null;

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into client progress and training effectiveness.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stats?.activeClients || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-success-100 p-3 rounded-lg">
                  <Target className="h-5 w-5 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                  {goalsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{analyticsData?.activeGoalsCount || 0}</p>
                  )}
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
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  {goalsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{analyticsData?.completionRate || 0}%</p>
                  )}
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
                  <p className="text-sm font-medium text-muted-foreground">Sessions Today</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stats?.sessionsToday || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goal Analytics</TabsTrigger>
            <TabsTrigger value="progress">Progress Trends</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5" />
                    Goal Types Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goalsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : analyticsData?.goalsByType ? (
                    <div className="space-y-4">
                      {Object.entries(analyticsData.goalsByType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{type.replace('-', ' ')}</span>
                          <span className="text-sm text-muted-foreground">{count} goals</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No goal data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" />
                    Average Progress by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goalsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : analyticsData?.avgProgressByType ? (
                    <div className="space-y-4">
                      {Object.entries(analyticsData.avgProgressByType).map(([type, data]) => {
                        const avgProgress = Math.round(data.total / data.count);
                        return (
                          <div key={type} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium capitalize">{type.replace('-', ' ')}</span>
                              <span className="text-sm text-muted-foreground">{avgProgress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${avgProgress}%` }}
                                aria-label={`${avgProgress}% average progress`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No progress data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Goal Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Goal Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed goal performance metrics and trends will be displayed here.
                  </p>
                  <Button variant="outline">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Progress Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Progress Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    Client progress trends and improvement patterns will be shown here.
                  </p>
                  <Button variant="outline">
                    View Trends
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Custom Reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate custom reports for client progress, goal achievements, and training effectiveness.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline">
                      Client Report
                    </Button>
                    <Button variant="outline">
                      Goal Report
                    </Button>
                    <Button variant="outline">
                      Progress Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}