
import React, { useState, useEffect, useRef } from 'react';
import { Send, XCircle, Paperclip, X } from 'lucide-react';
import { useMessages } from '../hooks/useChat';
import { Message } from '../types';

interface ChatWindowProps {
  conversationId: string;
  senderId: string;
  recipientName: string;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, senderId, recipientName, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { messages, isLoadingMessages, sendMessageMutation, isConnected } = useMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToSend(file);
      if (file.type.startsWith('image')) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !fileToSend) || !isConnected) return;

    const formData = new FormData();
    formData.append('conversationId', conversationId);
    if (fileToSend) {
      formData.append('media', fileToSend);
    }
    if (newMessage.trim()) {
      formData.append('text', newMessage);
    }

    sendMessageMutation.mutate(formData);

    setNewMessage('');
    setFileToSend(null);
    setPreviewUrl(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderMessageContent = (msg: Message) => {
    const mediaFullUrl = msg.mediaUrl ? `${API_URL}/${msg.mediaUrl}` : '';
    switch (msg.type) {
      case 'image':
        return (
          <div className="p-2">
            <img src={mediaFullUrl} alt="Image attachment" className="rounded-lg max-w-xs max-h-64 cursor-pointer" onClick={() => window.open(mediaFullUrl, '_blank')} />
            {msg.text && <p className="text-sm mt-1 pt-1 border-t border-white/20">{msg.text}</p>}
          </div>
        );
      case 'video':
        return (
          <div className="p-2">
            <video controls className="rounded-lg max-w-xs">
              <source src={mediaFullUrl} type={fileToSend?.type} />
              Your browser does not support the video tag.
            </video>
            {msg.text && <p className="text-sm mt-1">{msg.text}</p>}
          </div>
        );
      default:
        return <p className="text-sm p-3">{msg.text}</p>;
    }
  };

  if (isLoadingMessages) { /* ... loading spinner ... */ }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col">
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <h3 className="text-lg font-bold">Chat dengan {recipientName}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-blue-700"><XCircle size={20} /></button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages?.map((msg: Message) => (
            <div key={msg.id} className={`flex ${msg.senderId === senderId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg ${msg.senderId === senderId ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                {renderMessageContent(msg)}
                <span className="text-xs opacity-75 mt-1 block px-3 pb-2 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t p-2">
          {previewUrl && (
            <div className="p-2 relative w-24">
              <img src={previewUrl} alt="Preview" className="rounded-lg w-full" />
              <button 
                type="button"
                onClick={() => { setFileToSend(null); setPreviewUrl(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2 p-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-600">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
              disabled={!isConnected || (!newMessage.trim() && !fileToSend)}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
