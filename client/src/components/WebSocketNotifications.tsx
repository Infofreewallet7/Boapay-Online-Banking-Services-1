import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/lib/websocket';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function WebSocketNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const socket = useWebSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          const newNotification = {
            id: crypto.randomUUID(),
            message: data.message,
            timestamp: new Date(),
            read: false,
          };
          
          setNotifications(prev => [newNotification, ...prev].slice(0, 10));
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: 'New Notification',
            description: data.message,
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, toast]);
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5" />
              <Badge 
                className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs min-w-[1.25rem] min-h-[1.25rem] flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <DropdownMenuItem 
                key={notification.id} 
                className="cursor-default p-0"
                onSelect={(e) => e.preventDefault()}
              >
                <Card 
                  className={`w-full p-3 my-1 ${notification.read ? '' : 'bg-primary/5 dark:bg-primary/10'}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </Card>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}