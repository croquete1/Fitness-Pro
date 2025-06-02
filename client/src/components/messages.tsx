import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { MessageWithSender } from "@shared/schema";

export function Messages() {
  const queryClient = useQueryClient();
  
  const { data: messages, isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/messages"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => apiRequest("PATCH", `/api/messages/${messageId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const unreadCount = messages?.filter(m => !m.isRead).length || 0;

  const handleMarkAsRead = (messageId: number) => {
    markAsReadMutation.mutate(messageId);
  };

  return (
    <section aria-labelledby="messages-heading">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle id="messages-heading" className="text-lg font-semibold text-foreground">
              Recent Messages
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-primary-100 text-primary-800">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            ) : messages && messages.length > 0 ? (
              messages.slice(0, 4).map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.senderAvatar} alt={`Profile picture of ${message.senderName}`} />
                    <AvatarFallback>
                      {message.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-foreground">{message.senderName}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                      {!message.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="w-2 h-2 bg-primary rounded-full focus-ring"
                          aria-label="Mark as read"
                        />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{message.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages found</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Button 
              variant="ghost" 
              className="w-full text-center text-sm font-medium text-primary hover:text-primary-700 focus-ring py-2"
            >
              View All Messages
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
