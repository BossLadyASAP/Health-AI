
import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { HealthTracker } from '@/components/HealthTracker';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState('1');
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [currentView, setCurrentView] = useState<'chat' | 'tracker'>('chat');
  const [theme, setTheme] = useState('System');
  const [language, setLanguage] = useState('Auto-detect');

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          messages: [],
          createdAt: new Date(),
        };
        setActiveConversationId(newConv.id);
        return [newConv];
      }
      if (id === activeConversationId) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            title: conv.messages.length === 0 ? content.slice(0, 30) + '...' : conv.title
          }
        : conv
    ));

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a response to: "${content}"`,
        isUser: false,
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, aiResponse] }
          : conv
      ));
    }, 1000);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Always visible sidebar trigger */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <SidebarTrigger className="h-8 w-8 bg-white shadow-md border" />
        </div>

        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onConversationSelect={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          currentView={currentView}
          onViewChange={setCurrentView}
          theme={theme}
          onThemeChange={setTheme}
          language={language}
          onLanguageChange={setLanguage}
        />
        
        <SidebarInset className="flex-1">
          {/* Desktop sidebar trigger */}
          <div className="hidden md:block fixed top-4 left-4 z-50">
            <SidebarTrigger className="h-8 w-8 bg-white shadow-md border" />
          </div>

          <main className="flex-1 p-4 pt-16 md:pt-4">
            {currentView === 'chat' ? (
              <ChatInterface
                conversation={activeConversation}
                onSendMessage={handleSendMessage}
                selectedModel={selectedModel}
              />
            ) : (
              <HealthTracker />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
