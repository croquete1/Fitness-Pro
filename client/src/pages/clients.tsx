import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, MessageCircle, Calendar, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useAccessibility } from "@/hooks/use-accessibility";
import { AccessibilityControls } from "@/components/accessibility-controls";
import { Navigation } from "@/components/navigation";
import { apiRequest } from "@/lib/queryClient";
import type { Client, User, Goal, Message } from "@shared/schema";

interface ClientWithUser extends Client {
  user: User;
  goalsCount: number;
  messagesCount: number;
  lastMessageAt?: Date;
}

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithUser | null>(null);
  const { announceToScreenReader } = useAccessibility();
  const queryClient = useQueryClient();

  // For now, we'll get clients from the existing API and enhance the data
  const { data: basicClients, isLoading } = useQuery<Array<{id: number; name: string; avatar?: string}>>({
    queryKey: ["/api/clients"],
  });

  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Transform basic clients into enhanced client data
  const clients: ClientWithUser[] = basicClients?.map(client => {
    const clientGoals = goals?.filter(goal => goal.clientId === client.id) || [];
    const clientMessages = messages?.filter(msg => msg.senderId === client.id) || [];
    const lastMessage = clientMessages.length > 0 ? 
      clientMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : 
      undefined;

    return {
      id: client.id,
      userId: client.id + 1, // Assuming user ID is client ID + 1 based on seed data
      trainerId: 1,
      isActive: true,
      createdAt: new Date(),
      user: {
        id: client.id + 1,
        username: client.name.toLowerCase().replace(' ', '_'),
        password: '',
        email: `${client.name.toLowerCase().replace(' ', '.')}@example.com`,
        fullName: client.name,
        role: 'client' as const,
        avatar: client.avatar,
        createdAt: new Date(),
      },
      goalsCount: clientGoals.length,
      messagesCount: clientMessages.length,
      lastMessageAt: lastMessage ? new Date(lastMessage.createdAt) : undefined,
    };
  }) || [];

  const filteredClients = clients.filter(client =>
    client.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientStatus = (client: ClientWithUser) => {
    if (client.lastMessageAt) {
      const daysSinceLastMessage = Math.floor(
        (Date.now() - client.lastMessageAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastMessage <= 1) return { label: "Active", color: "bg-success-100 text-success-800" };
      if (daysSinceLastMessage <= 7) return { label: "Recent", color: "bg-warning-100 text-warning-800" };
    }
    return { label: "Needs Attention", color: "bg-destructive/10 text-destructive" };
  };

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

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

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your clients, track their progress, and stay connected.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-ring"
              aria-label="Search clients"
            />
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-700 focus-ring">
            <Plus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Clients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Target className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                      <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-success-100 p-3 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active This Week</p>
                      <p className="text-2xl font-bold text-foreground">
                        {clients.filter(c => getClientStatus(c).label === "Active").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-warning-100 p-3 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                      <p className="text-2xl font-bold text-foreground">
                        {messages?.filter(m => !m.isRead).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-24 mb-2" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredClients.length > 0 ? (
                    filteredClients.map((client) => {
                      const status = getClientStatus(client);
                      return (
                        <Dialog key={client.id}>
                          <DialogTrigger asChild>
                            <Card className="border-border cursor-pointer hover:shadow-md transition-shadow focus-ring">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-4 mb-4">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={client.user.avatar} alt={`${client.user.fullName} profile picture`} />
                                    <AvatarFallback>
                                      {client.user.fullName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-foreground">{client.user.fullName}</h3>
                                    <Badge className={status.color}>
                                      {status.label}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <div className="flex items-center justify-between">
                                    <span>Goals</span>
                                    <span className="font-medium">{client.goalsCount}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Messages</span>
                                    <span className="font-medium">{client.messagesCount}</span>
                                  </div>
                                  {client.lastMessageAt && (
                                    <div className="flex items-center justify-between">
                                      <span>Last Contact</span>
                                      <span className="font-medium">
                                        {Math.floor((Date.now() - client.lastMessageAt.getTime()) / (1000 * 60 * 60 * 24))} days ago
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="mt-4 flex gap-2">
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <MessageCircle className="mr-2 h-3 w-3" />
                                    Message
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    <Calendar className="mr-2 h-3 w-3" />
                                    Schedule
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </DialogTrigger>
                          
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={client.user.avatar} alt={`${client.user.fullName} profile picture`} />
                                  <AvatarFallback>
                                    {client.user.fullName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h2 className="text-xl font-bold">{client.user.fullName}</h2>
                                  <p className="text-muted-foreground">{client.user.email}</p>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <p className="text-2xl font-bold text-foreground">{client.goalsCount}</p>
                                  <p className="text-sm text-muted-foreground">Active Goals</p>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                  <p className="text-2xl font-bold text-foreground">{client.messagesCount}</p>
                                  <p className="text-sm text-muted-foreground">Messages</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-4">
                                <Button className="flex-1 bg-primary text-primary-foreground">
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Send Message
                                </Button>
                                <Button variant="outline" className="flex-1">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Schedule Session
                                </Button>
                                <Button variant="outline" className="flex-1">
                                  <Target className="mr-2 h-4 w-4" />
                                  View Goals
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">
                        {searchTerm ? "No clients found matching your search." : "No clients found."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Active clients who have interacted recently will be shown here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Client Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Client engagement metrics and progress analytics will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}