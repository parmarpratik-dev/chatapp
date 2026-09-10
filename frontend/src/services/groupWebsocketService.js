import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '../config/config';

let groupStompClient = null;
let currentGroupSubscription = null;

export function connectGroupChat(geohash, onGroupMessageReceived) {
  groupStompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 1000,
    onConnect: () => {
      subscribeToGroup(geohash, onGroupMessageReceived);
    },
    onStompError: (frame) => console.error('Group STOMP error:', frame.headers['message']),
  });

  groupStompClient.activate();
}

export function subscribeToGroup(geohash, onGroupMessageReceived) {
  if (!groupStompClient || !groupStompClient.connected) return;

  if (currentGroupSubscription) {
    currentGroupSubscription.unsubscribe();
  }

  currentGroupSubscription = groupStompClient.subscribe(
    `/topic/group-${geohash}`,
    (message) => {
      onGroupMessageReceived(JSON.parse(message.body));
    }
  );
}

export function sendGroupMessage(geohash, senderId, content) {
    
  if (!groupStompClient || !groupStompClient.connected) {
    console.warn('Cannot send — not connected to group chat');
    return;
  }
  groupStompClient.publish({
    destination: '/app/group.send',
    body: JSON.stringify({ geohash, senderId, content }),
  });
}

export function disconnectGroupChat() {
  if (groupStompClient) {
    groupStompClient.deactivate();
    groupStompClient = null;
    currentGroupSubscription = null;
  }
}