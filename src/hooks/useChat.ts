import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, CreateConversationData, SendMessageData } from '../services/chat.service';
import { Conversation, Message } from '../types';
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useConversations = (userId: string) => {
  return useQuery<Conversation[]> ({
    queryKey: ['conversations', userId],
    queryFn: () => chatService.getUserConversations(userId),
    enabled: !!userId,
  });
};

export const useConversationByBookingId = (bookingId: string) => {
  return useQuery<Conversation>({
    queryKey: ['conversation', bookingId],
    queryFn: () => chatService.getConversationByBookingId(bookingId),
    enabled: !!bookingId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConversationData) => chatService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMessages = (conversationId: string) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const messagesQuery = useQuery<Message[]> ({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;

    socketRef.current = io(API_URL);

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      socketRef.current?.emit('join_conversation', conversationId);
    });

    socketRef.current.on('receive_message', (message: Message) => {
      console.log('Received message:', message);
      queryClient.setQueryData<Message[]>(['messages', conversationId], (oldMessages) => {
        if (oldMessages && !oldMessages.some(m => m.id === message.id)) {
          return [...oldMessages, message];
        }
        return oldMessages;
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [conversationId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (data: FormData) => chatService.sendMessage(data),
    // No need to invalidate queries here, as messages are received via socket.io
    // and optimistically updated by setQueryData
  });

  return {
    messages: messagesQuery.data,
    isLoadingMessages: messagesQuery.isLoading,
    errorMessages: messagesQuery.error,
    sendMessageMutation,
    isConnected,
  };
};