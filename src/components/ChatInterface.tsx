import React, { useState, useRef, useEffect } from 'react';
import { Message as LucideMessage, Send, MessageSquare, ChevronDown, User, LogOut, Settings, HelpCircle, Crown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/VoiceInput';
import { useAuth } from '@/hooks/useAuth';
import { LoginDialog } from '@/components/ui/LoginDialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  conversation: {
    id: string;
    title: string;
    messages: {
      id: string;
      content: string;
      isUser: boolean;
      timestamp: Date;
    }[];
    createdAt: Date;
  } | undefined;
  onSendMessage: (message: string) => void;
  selectedModel: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-xl px-4 py-2 text-sm max-w-[75%] ${
          message.isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function ChatInterface({ conversation, onSendMessage, selectedModel }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleVoiceTranscription = (text: string, detectedLanguage?: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + text);
    setIsVoiceListening(false);
    
    if (detectedLanguage) {
      console.log('Detected language:', detectedLanguage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const freeCredits = user ? 5 : 2;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
        <h1 className="text-xl font-semibold text-gray-800">
          {conversation?.title || 'New Conversation'}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {!user ? (
            <>
              <Button variant="outline" onClick={() => setLoginDialogOpen(true)}>
                Login
              </Button>
              <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 border border-gray-200 px-2">
                  <User className="h-5 w-5" />
                  <span>{user.user_metadata?.first_name || user.email}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => { /* TODO: Upgrade plan */ }}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade my plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { /* TODO: Open settings */ }}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { /* TODO: Help */ }}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span className="ml-4 text-gray-400 text-xs">Free credits: {freeCredits}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversation?.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Type a message or use voice input to begin</p>
            </div>
          </div>
        ) : (
          conversation?.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={user ? "Type your message..." : "Sign in to chat..."}
              className="min-h-[60px] resize-none"
              rows={3}
              disabled={!user}
            />
          </div>
          <div className="flex flex-col gap-2">
            <VoiceInput
              onTranscription={handleVoiceTranscription}
              isListening={isVoiceListening}
              className="w-full"
              disabled={!user}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || !user}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
