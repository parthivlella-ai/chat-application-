import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ConnectionBanner from '../common/ConnectionBanner';
import SearchModal from './SearchModal';
import MediaModal from './MediaModal';
import EditMessageModal from './EditMessageModal';
import ProfileModal from '../profile/ProfileModal';
import AdminDashboard from '../admin/AdminDashboard';

const ChatLayout = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const { editMessage, deleteMessage } = useChat();

  return (
    <div className="app-container">
      {/* Real-Time Connection Banner */}
      <ConnectionBanner />

      {/* Left Sidebar */}
      <Sidebar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Chat Area */}
      <ChatArea
        onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onImageClick={(url) => setPreviewImageUrl(url)}
        onEditMessage={(msg) => setEditingMessage(msg)}
        onDeleteMessage={(msg, isSentByMe) => deleteMessage(msg._id, isSentByMe)}
      />

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <MediaModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />

      <EditMessageModal
        isOpen={!!editingMessage}
        message={editingMessage}
        onClose={() => setEditingMessage(null)}
        onSave={(msgId, newText) => editMessage(msgId, newText)}
      />
    </div>
  );
};

export default ChatLayout;
