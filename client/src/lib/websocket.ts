import { useEffect, useState } from 'react';

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

function createWebSocket(): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.addEventListener('open', () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
  });
  
  ws.addEventListener('close', (event) => {
    console.log(`WebSocket disconnected with code: ${event.code}`);
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        reconnectAttempts++;
        console.log(`Reconnecting... attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
        socket = createWebSocket();
      }, RECONNECT_DELAY);
    } else {
      console.error('Max reconnect attempts reached. WebSocket connection failed.');
    }
  });
  
  ws.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  return ws;
}

export function useWebSocket(): WebSocket | null {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(socket);
  
  useEffect(() => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      socket = createWebSocket();
      setWebSocket(socket);
    }
    
    return () => {
      // Only close on component unmount if we don't have any other components using the socket
      // This is usually handled in a multi-component environment with a reference counter
      // For simplicity, we're not closing here to allow other components to use the same socket
    };
  }, []);
  
  return webSocket;
}

export function sendWebSocketMessage(message: string | object): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected');
    return false;
  }
  
  try {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    socket.send(data);
    return true;
  } catch (error) {
    console.error('Failed to send WebSocket message:', error);
    return false;
  }
}