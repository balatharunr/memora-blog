'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import MainLayout from '../../components/MainLayout';
import Image from 'next/image';
import { messages as initialMessages } from '../../lib/dummyData';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  const [conversations, setConversations] = useState(initialMessages);
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  
  // Handle selecting a conversation
  const selectConversation = (chatId) => {
    const selectedChat = conversations.find(chat => chat.id === chatId);
    
    if (selectedChat) {
      setActiveChat(selectedChat);
      
      // In a real app, we'd fetch messages from the database
      // For now, let's simulate a few messages
      const simulatedMessages = [
        {
          id: 'm1',
          text: `Hey there! How are you doing?`,
          fromMe: false,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'm2',
          text: "I'm good, thanks! Just checking out this new Memora platform.",
          fromMe: true,
          timestamp: new Date(Date.now() - 3000000).toISOString()
        },
        {
          id: 'm3',
          text: selectedChat.lastMessage.text,
          fromMe: selectedChat.lastMessage.fromMe,
          timestamp: selectedChat.lastMessage.timestamp
        }
      ];
      
      setChatMessages(simulatedMessages);
      
      // Mark as read
      if (selectedChat.unread > 0) {
        setConversations(prev => 
          prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c)
        );
      }
    }
  };
  
  // Handle sending a message
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeChat) return;
    
    const newMessage = {
      id: `m${Date.now()}`,
      text: messageText.trim(),
      fromMe: true,
      timestamp: new Date().toISOString()
    };
    
    // Add to chat messages
    setChatMessages(prev => [...prev, newMessage]);
    
    // Update conversation with last message
    setConversations(prev => 
      prev.map(c => c.id === activeChat.id 
        ? { 
            ...c, 
            lastMessage: {
              text: messageText.trim(),
              fromMe: true,
              timestamp: new Date().toISOString()
            } 
          } 
        : c
      )
    );
    
    setMessageText('');
  };
  
  if (!session && !isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <p className="text-gray-400 mb-4">You need to be signed in to access your messages.</p>
          <a href="/auth/signin" className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700">
            Sign In
          </a>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="bg-gray-900 rounded-lg overflow-hidden h-[calc(100vh-160px)]">
        <div className="flex h-full">
          {/* Conversations list */}
          <div className="w-full lg:w-1/3 border-r border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
            
            <div className="h-[calc(100%-60px)] overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => selectConversation(chat.id)}
                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 ${
                      activeChat?.id === chat.id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden relative">
                        <Image 
                          src={chat.with.avatar}
                          alt={chat.with.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {chat.unread > 0 && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{chat.with.name}</h3>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${chat.unread > 0 ? 'font-semibold text-white' : 'text-gray-400'}`}>
                        {chat.lastMessage.fromMe ? 'You: ' : ''}{chat.lastMessage.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  <p>No conversations yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="hidden lg:flex flex-col w-2/3 h-full">
            {activeChat ? (
              <>
                <div className="p-4 border-b border-gray-800 flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    <Image 
                      src={activeChat.with.avatar}
                      alt={activeChat.with.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="ml-3 font-medium">{activeChat.with.name}</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.fromMe 
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : 'bg-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p>{message.text}</p>
                        <div className={`text-xs mt-1 ${message.fromMe ? 'text-purple-200' : 'text-gray-400'}`}>
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-purple-600 text-white p-2 rounded-full disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile view - show either list or chat */}
          <div className="lg:hidden flex flex-col w-full h-full">
            {activeChat ? (
              <>
                <div className="p-4 border-b border-gray-800 flex items-center">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="mr-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    <Image 
                      src={activeChat.with.avatar}
                      alt={activeChat.with.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="ml-3 font-medium">{activeChat.with.name}</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.fromMe 
                            ? 'bg-purple-600 text-white rounded-br-none' 
                            : 'bg-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p>{message.text}</p>
                        <div className={`text-xs mt-1 ${message.fromMe ? 'text-purple-200' : 'text-gray-400'}`}>
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-purple-600 text-white p-2 rounded-full disabled:opacity-50"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-gray-800">
                  <h1 className="text-xl font-bold">Messages</h1>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {conversations.length > 0 ? (
                    conversations.map((chat) => (
                      <div 
                        key={chat.id}
                        onClick={() => selectConversation(chat.id)}
                        className="flex items-center p-4 cursor-pointer hover:bg-gray-800"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden relative">
                            <Image 
                              src={chat.with.avatar}
                              alt={chat.with.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {chat.unread > 0 && (
                            <div className="absolute top-0 right-0 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                              {chat.unread}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{chat.with.name}</h3>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${chat.unread > 0 ? 'font-semibold text-white' : 'text-gray-400'}`}>
                            {chat.lastMessage.fromMe ? 'You: ' : ''}{chat.lastMessage.text}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      <p>No conversations yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
