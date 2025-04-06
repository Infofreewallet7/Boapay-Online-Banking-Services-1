import { useEffect, useState } from 'react';
import { websocket } from '@/lib/websocket';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebSocketNotifications() {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<{ message: string; timestamp: Date }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Handle connection status
    const handleConnect = () => {
      setConnected(true);
      toast({
        title: 'Connected',
        description: 'Real-time notifications enabled',
      });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    // Handle incoming messages
    const handleInfoMessage = (data: any) => {
      if (data.message) {
        setNotifications(prev => [
          { message: data.message, timestamp: new Date() },
          ...prev.slice(0, 9) // Keep only the last 10 notifications
        ]);
        
        toast({
          title: 'New Notification',
          description: data.message,
        });
      }
    };

    const handleEchoMessage = (data: any) => {
      console.log('Echo message received:', data);
    };

    // Register handlers
    websocket.onConnect(handleConnect);
    websocket.onDisconnect(handleDisconnect);
    websocket.on('info', handleInfoMessage);
    websocket.on('echo', handleEchoMessage);

    // If not already connected, try to connect
    if (!connected) {
      websocket.connect();
    }

    // Clean up handlers when component unmounts
    return () => {
      websocket.removeConnectHandler(handleConnect);
      websocket.removeDisconnectHandler(handleDisconnect);
      websocket.off('info', handleInfoMessage);
      websocket.off('echo', handleEchoMessage);
    };
  }, [toast]);

  // Test websocket by sending a ping message
  const sendPing = () => {
    if (connected) {
      websocket.send('ping', { time: new Date().toISOString() });
    } else {
      toast({
        title: 'Not Connected',
        description: 'Waiting for connection to server',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={cn(
          "p-2 rounded-full transition-colors",
          connected ? "text-green-500 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"
        )}
        aria-label={connected ? "Show notifications" : "Notifications disconnected"}
      >
        {connected ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
        
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              )}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-sm">
                <p>No notifications yet</p>
                <button 
                  onClick={sendPing}
                  className="mt-2 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                >
                  Test Connection
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <li key={index} className="px-4 py-3 hover:bg-gray-50">
                    <div className="text-sm">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-right">
            <button 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setNotifications([])}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}