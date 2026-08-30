import React, { useState, useEffect, useRef } from 'react';
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../services/websocketService';
import { fetchConversation, deleteMessage, editMessage } from '../services/api';
import { Link } from "react-router-dom";
import { startRecording, stopRecording} from "../utils/audioRecorder";
import { uploadAudio } from "../services/api";
import { API_URL } from '../config/config';

export default function ChatScreen({ myUserId, receiverId, receiverName }) {
  

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const bottomRef = useRef(null);
  const menuRef = useRef(null);


  const handleStartRecording = async () => {
    try {
        await startRecording();
        setIsRecording(true);
    } catch (err) {
      console.error('Microphone acess denied', err);
    }
  }

  

  const handleStopRecording = async () => {

    setIsRecording(false);
    const audioBlob = await stopRecording();

    try {
        const { audioUrl } = await uploadAudio(audioBlob);
        console.log(audioUrl,"audio")
        sendMessage(myUserId, receiverId, '', 'AUDIO', audioUrl);    
    } catch (err) {
      console.error('Failed to send voice message:',err);
    }
  }

  useEffect(() => {
    fetchConversation(myUserId, receiverId)
      .then((history) => setMessages(history))
      .catch((err) => console.error(err));
      console.log(isRecording,"isRecording")
    connectWebSocket(
      myUserId,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      },
      (deletedMessage) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
      },
      (editedMessage) => {  // NEW
        setMessages((prev) =>
          prev.map((msg) => (msg.id === editedMessage.id ? editedMessage : msg))
        );
      },
      () => setConnected(true)
    );

    return () => disconnectWebSocket();
  }, [myUserId, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuMessageId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMenuMessageId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    if (editingMessageId) {
      // EDIT MODE
      editMessage(editingMessageId, myUserId, receiverId, input.trim())
        .then((updated) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updated.id ? updated : msg))
          );
        })
        .catch((err) => console.error('Failed to edit:', err));

      setEditingMessageId(null);
      setInput('');
    } else {
      // NORMAL SEND MODE
      sendMessage(myUserId, receiverId, input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleDelete = async (id) => {
    setActiveMenuMessageId(null);
    const previousMessages = [...messages];
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    try {
      await deleteMessage(id);
    } catch (err) {
      console.error('Failed to delete message:', err);
      setMessages(previousMessages);
    }
  };

  const handleEditClick = (msg) => {
    setActiveMenuMessageId(null);
    setEditingMessageId(msg.id);
    setInput(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInput('');
  };

  const canEdit = (msg) => {
      const messageTime = new Date(msg.timestamp).getTime();
      const now = Date.now();
      const fiveMinutes = 1 * 60 * 1000;
      return (now - messageTime) < fiveMinutes;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="w-full max-w-xl h-[650px] bg-gray-900 border border-gray-800 rounded-2xl flex flex-col shadow-2xl text-gray-100 font-sans overflow-hidden">

        <div className="relative flex items-center justify-between py-3.5 px-5 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md z-10">
          <span className="text-gray-300 text-sm font-medium">{receiverName}</span>
          
          <Link to="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition">
            Exit
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages
            .filter((msg) => !msg.delete && !msg.deleted)
            .map((msg) => {
              const isMe = msg.senderId === myUserId;
              const isMenuOpen = activeMenuMessageId === msg.id;

              return (
                <div key={msg.id} className={`relative group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    onContextMenu={(e) => { e.preventDefault(); if (isMe) setActiveMenuMessageId(msg.id); }}
                    onDoubleClick={() => { if (isMe) setActiveMenuMessageId(msg.id); }}
                    className={`relative px-4 py-2.5 rounded-2xl max-w-[75%] break-words text-sm leading-relaxed transition-all duration-200 select-none cursor-pointer ${
                      isMe ? "bg-blue-600 text-white rounded-tr-xs shadow-md" : "bg-gray-800 text-gray-100 rounded-tl-xs border border-gray-750"
                    }`}
                  >
                    {msg.messageType === 'AUDIO' ? (
                      <audio controls src={`${API_URL.replace('/api', '')}${msg.audioUrl}`} className="max-w-full" />
                      
                    ) : (
                      msg.content
                    )}
                    {/* console.log('Audio src:', `${API_URL.replace('/api', '')}${msg.audioUrl}`); */}
                    {isMe && (
                      <button
                        onClick={() => setActiveMenuMessageId(isMenuOpen ? null : msg.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/20 text-white/80 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isMenuOpen && (
                    <div ref={menuRef} className="absolute z-20 top-full mt-1 right-0 w-36 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-1 overflow-hidden">
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition cursor-pointer"
                      >
                        Delete
                      </button>
                      {isMe && canEdit(msg) && (
                      <button
                        onClick={() => handleEditClick(msg)}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition cursor-pointer"
                      >
                        Edit
                      </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          <div ref={bottomRef} />
        </div>

        {editingMessageId && (
          <div className="px-4 py-1.5 bg-gray-800/60 text-xs text-blue-400 flex justify-between items-center">
            <span>Editing message...</span>
            <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white cursor-pointer">Cancel</button>
          </div>
        )}

        <div className="flex p-3.5 border-t border-gray-800 gap-2.5 bg-gray-900/60 backdrop-blur-md items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-750 bg-gray-800/80 text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition shadow-sm cursor-pointer"
          >
            {editingMessageId ? "Update" : "Send"}
          </button>

          <button onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`pratiktn px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            isRecording ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}>
            {isRecording ? '⏹ Stop' : '🎤'}
          </button>
        </div>

      </div>
    </div>
  );
}