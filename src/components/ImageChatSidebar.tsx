'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { sendChatMessage } from '../actions/image-chat';
import { getChatHistory } from '../actions/get-chat-history';
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date | number;
}

interface ImageChatSidebarProps {
    imageId: string;
    onClose: () => void;
}

export function ImageChatSidebar({ imageId, onClose }: ImageChatSidebarProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

    // Load chat history on mount and send initial prompt if empty
    useEffect(() => {
        startTransition(async () => {
            const result = await getChatHistory(imageId);
            if (result.success && result.messages) {
                const msgs = result.messages as Message[];
                setMessages(msgs);

                // If no messages, send initial prompt
                if (msgs.length === 0 && !hasLoadedInitial) {
                    setHasLoadedInitial(true);
                    const initialPrompt = "Provide a brief overview of this medical image in 2-3 sentences.";

                    const initialResult = await sendChatMessage(imageId, initialPrompt);
                    if (initialResult.success && initialResult.message) {
                        setMessages([{
                            id: `ai-initial-${Date.now()}`,
                            role: 'assistant',
                            content: initialResult.message,
                            createdAt: Date.now(),
                        }]);
                    }
                }
            }
        });
    }, [imageId, hasLoadedInitial]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isPending]);

    const handleSend = () => {
        if (!input.trim() || isPending) return;

        const userMessage = input.trim();
        setInput('');

        // Optimistically add user message
        const tempUserMsg: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: userMessage,
            createdAt: Date.now(),
        };
        setMessages(prev => [...prev, tempUserMsg]);

        startTransition(async () => {
            const result = await sendChatMessage(imageId, userMessage);

            if (result.success && result.message) {
                // Add AI response
                const aiMsg: Message = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: result.message,
                    createdAt: Date.now(),
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                toast.error(result.error || 'Failed to send message');
                // Remove optimistic user message on error
                setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
            }
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-[#2B2B2B] border-l border-[#3E3E42] flex flex-col shadow-2xl z-50">
            {/* Header */}
            <div className="p-4 border-b border-[#3E3E42] flex items-center justify-between">
                <h3 className="text-white/90 font-semibold">AI Image Analysis</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white/70 hover:text-white hover:bg-[#3E3E42]"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages - Scrollable area */}
            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.length === 0 && !isPending && (
                        <div className="text-center text-white/50 mt-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Analyzing image...</p>
                        </div>
                    )}
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                    ? 'bg-[#00A9E0] text-white'
                                    : 'bg-[#1E1E1E] text-white/90 border border-[#3E3E42]'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isPending && (
                        <div className="flex justify-start">
                            <div className="bg-[#1E1E1E] text-white/90 border border-[#3E3E42] rounded-lg p-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#3E3E42]">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about this image..."
                        className="bg-[#1E1E1E] border-[#3E3E42] text-white/80"
                        disabled={isPending}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isPending}
                        className="bg-[#00A9E0] hover:bg-[#0090C0] text-white"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
