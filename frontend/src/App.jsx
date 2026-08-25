import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ChatScreen from './screens/ChatScreen';
import FriendsList from './screens/FriendsList';
import GroupChatScreen from './screens/GroupChatScreen';
import CurrentUsersScreen from './screens/CurrentUserScreen';
import Register from './components/Register';
import Login from './components/Login';
import SearchUsers from './screens/SearchUsers';
import PendingRequests from './screens/PendingRequests';
import { getFriends } from './services/friendApi';
import MapScreen from './screens/MapScreen';
import { connectLiveLocations, disconnectLiveLocations } from './services/liveLocationService';
import { fetchGroupHistory } from './services/groupApi';
import { updateLocation } from './services/locationApi';
import { getCurrentLocation, watchLocation, clearLocationWatch } from './utils/geoUtils';
import { connectGroupChat, sendGroupMessage as sendGroupMsg, disconnectGroupChat } from './services/groupWebsocketService';



function App() {
  
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentGeohash, setCurrentGeohash] = useState(null);
  const [userPositions, setUserPositions] = useState({});
  const [mapReady, setMapReady] = useState(null);
  const navigate = useNavigate();
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupStatus, setGroupStatus] = useState('Getting your location...');
  const watchIdRef = useRef(null);
  const lastSyncTimeRef = useRef(0);
  const isGroupConnectedRef = useRef(false);
  const currentGeohashRef = useRef(null);
  const [zoneBounds, setZoneBounds] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
  
    async function handleLocationUpdate({ latitude, longitude }) {
      const now = Date.now();
      if (now - lastSyncTimeRef.current < 3000 && currentGeohashRef.current) return;
      lastSyncTimeRef.current = now;
  
      try {
        const response = await updateLocation(currentUser.id, latitude, longitude);
        const newGeohash = response.geohash;
          
        if (newGeohash !== currentGeohashRef.current) {
          currentGeohashRef.current = newGeohash;
          setCurrentGeohash(newGeohash);

          setZoneBounds(response.boundingBox);
          
          setGroupStatus('Loading nearby messages...');
          const history = await fetchGroupHistory(newGeohash);
          setGroupMessages(history);
  
          if (!isGroupConnectedRef.current) {
            connectGroupChat(newGeohash, (newMsg) => {
              setGroupMessages((prev) => [...prev, newMsg]);
            });
            isGroupConnectedRef.current = true;
          }
  
          setGroupStatus(`Connected to zone: ${newGeohash}`);
        }
      } catch (err) {
        setGroupStatus('Location error: ' + err.message);
      }
    }
  
    watchIdRef.current = watchLocation(handleLocationUpdate);
  
    return () => {
      clearLocationWatch(watchIdRef.current);
      disconnectGroupChat();
    };
  }, [currentUser]);
  
  const handleSendGroupMessage = (content) => {
    if (!currentGeohash) return;
    sendGroupMsg(currentGeohash, currentUser.id, content);
  };


  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  useEffect(() => {
    if(!currentGeohash) return;

    connectLiveLocations(currentGeohash, (update) => {
      setUserPositions((prev) => ({...prev, [update.userId] : update}));
      setMapReady(true);
    })

    return () => disconnectLiveLocations();
  }, [currentGeohash]);

  return (
    <div className="relative min-h-screen bg-gray-950">
      <Routes>
      <Route
        path="/map"
        element={
          currentUser ? (
            <MapScreen currentUser={currentUser} currentGeohash={currentGeohash} userPositions={userPositions} zoneBounds={zoneBounds} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
        {/* Home Route = Group Chat (Protected) */}
        <Route
          path="/"
          element={
            currentUser ? (
              <>
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-800 text-red-100 hover:bg-red-700 border border-red-700 transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
                <GroupChatScreen
                    currentUser={currentUser}
                    mapReady={mapReady}
                    messages={groupMessages}
                    status={groupStatus}
                    onSendMessage={handleSendGroupMessage}
                  />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Nearby Users in current zone (NEW) */}
        <Route
          path="/current-users"
          element={
            currentUser ? (
              <CurrentUsersScreen currentUser={currentUser} currentGeohash={currentGeohash} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Friends List (MOVED from "/" to "/friends") */}
        <Route
          path="/friends"
          element={
            currentUser ? (
              <FriendsList currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Chat Route (Protected) */}
        <Route
          path="/chat"
          element={
            currentUser ? (
              <ChatScreenWrapper currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Search Route (Protected) */}
        <Route
          path="/search"
          element={
            currentUser ? (
              <SearchUsers currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Pending Requests Route (Protected) */}
        <Route
          path="/requests"
          element={
            currentUser ? (
              <PendingRequests currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Register Route */}
        <Route
          path="/register"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;

function ChatScreenWrapper({ currentUser }) {
  const params = new URLSearchParams(window.location.search);
  const receiverId = Number(params.get('receiverId'));
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [receiverName, setReceiverName] = useState('');

  useEffect(() => {
    getFriends(currentUser.id)
      .then((friends) => {
        const friend = friends.find(
          (f) => f.senderId === receiverId || f.receiverId === receiverId
        );

        if (!friend) {
          navigate('/');
          return;
        }

        const name =
          friend.senderId === currentUser.id
            ? friend.receiverUsername
            : friend.senderUsername;

        setReceiverName(name);
        setIsFriend(true);
      })
      .catch(() => navigate('/'))
      .finally(() => setChecking(false));
  }, [currentUser.id, receiverId]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Checking...
      </div>
    );
  }

  if (!isFriend) return null;

  return (
    <ChatScreen
      myUserId={currentUser.id}
      receiverId={receiverId}
      receiverName={receiverName}
    />
  );
}