import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '../config/config';

let stompClient = null;

export function connectWebSocket(userId, onMessageReceived, onMessageDeleted, onMessageEdited, onConnected, onFriendUpdate) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('STOMP connected');

      stompClient.subscribe(`/queue/messages-${userId}`, (message) => {
        onMessageReceived(JSON.parse(message.body));
      });

      stompClient.subscribe(`/queue/messages-${userId}-deleted`, (message) => {
        onMessageDeleted(JSON.parse(message.body));
      });

      stompClient.subscribe(`/queue/messages-${userId}-edited`, (message) => {
        onMessageEdited(JSON.parse(message.body));
      });

      stompClient.subscribe(`/queue/friend-updates-${userId}`, (message) => {
        if (onFriendUpdate) onFriendUpdate(JSON.parse(message.body));
      });

      if (onConnected) onConnected();
    },
    onStompError: (frame) => console.error('STOMP error:', frame.headers['message']),
  });

  stompClient.activate();
}

export function sendMessage(senderId, receiverId, content, messageType = 'TEXT', audioUrl = null) {
  if (!stompClient || !stompClient.connected) {
    console.warn('Cannot send — not connected');
    return;
  }
  
  stompClient.publish({
    destination: '/app/chat.send',
    body: JSON.stringify({ senderId, receiverId, content, messageType, audioUrl }),
  });
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

