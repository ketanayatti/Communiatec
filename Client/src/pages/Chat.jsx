import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./chat-components/contacts-container";
import EmptyChatContainer from "./chat-components/empty-chat-container";
import ChatContainer from "./chat-components/chat-container";
import { AIChat } from "@/components/chat/AIChat";

const Chat = () => {
  const { userInfo, selectedChatType } = useStore();
  const navigate = useNavigate();
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast.warning("Please complete profile to continue");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div className="flex w-full min-h-screen bg-dark-primary">
      <div className="flex-none lg:block">
        <ContactsContainer />
      </div>
      <div className="flex-1">
        {showAIChat ? (
          <AIChat onClose={() => setShowAIChat(false)} />
        ) : selectedChatType === undefined ? (
          <EmptyChatContainer />
        ) : (
          <ChatContainer
            showAIChat={showAIChat}
            setShowAIChat={setShowAIChat}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
