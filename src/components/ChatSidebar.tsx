
import { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Settings, 
  Menu,
  ChevronDown,
  User,
  Crown,
  Zap,
  HelpCircle,
  LogOut,
  TrendingUp,
  Search,
  Activity
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conversation } from '@/pages/Index';
import { SettingsDialog } from '@/components/SettingsDialog';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  currentView: 'chat' | 'tracker';
  onViewChange: (view: 'chat' | 'tracker') => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  selectedModel,
  onModelChange,
  currentView,
  onViewChange,
  theme,
  onThemeChange,
  language,
  onLanguageChange
}: ChatSidebarProps) {
  const { state } = useSidebar();
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock user state - in a real app this would come from auth
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' });

  const isCollapsed = state === "collapsed";

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUser({ name: 'John Doe', email: 'john@example.com' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({ name: '', email: '' });
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="offcanvas">
        <SidebarHeader className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <SidebarTrigger className="h-6 w-6" />
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={onNewConversation}
                  size="sm"
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                >
                  <Plus className="h-4 w-4" />
                  New chat
                </Button>
                
                {/* User Profile Dropdown */}
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-blue-600 text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuItem onClick={() => {}}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade my plan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowSettings(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    onClick={handleLogin}
                    size="sm"
                    className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50"
                    variant="ghost"
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {!isCollapsed && currentView === 'chat' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="p-2">
          {currentView === 'chat' && (
            <ScrollArea className="flex-1">
              <SidebarMenu>
                {filteredConversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={conversation.id === activeConversationId}
                      className="group relative"
                      onMouseEnter={() => setHoveredConversation(conversation.id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                    >
                      <div
                        onClick={() => onConversationSelect(conversation.id)}
                        className="flex items-center justify-between w-full cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="truncate text-sm">
                              {conversation.title}
                            </span>
                          )}
                        </div>
                        
                        {!isCollapsed && hoveredConversation === conversation.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          )}
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-gray-200">
          <Button
            onClick={() => onViewChange(currentView === 'chat' ? 'tracker' : 'chat')}
            className={`w-full flex items-center gap-2 ${
              currentView === 'tracker' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Activity className="h-4 w-4" />
            {!isCollapsed && (currentView === 'chat' ? 'My Tracker' : 'Back to Chat')}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        theme={theme}
        onThemeChange={onThemeChange}
        language={language}
        onLanguageChange={onLanguageChange}
      />
    </>
  );
}
