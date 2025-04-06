import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function NotificationSender() {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  
  const sendNotificationMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/notifications/send', { message });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Notification sent',
        description: 'Your notification has been sent to all connected users',
      });
      setMessage('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendNotificationMutation.mutate(message);
    }
  };
  
  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <Bell className="h-4 w-4 mr-2" />
        Send Notification
      </h3>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Enter message to broadcast..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={!message.trim() || sendNotificationMutation.isPending}
        >
          Send
        </Button>
      </form>
      
      <p className="text-xs text-gray-500 mt-2">
        This will send a notification to all connected users
      </p>
    </div>
  );
}