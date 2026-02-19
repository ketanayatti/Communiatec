import { useState } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus } from "lucide-react";
import DmDialog from "@/pages/chat-components/contacts-dialog-box/index.jsx";
import { useStore } from "@/store/store";

const NewDm = () => {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const { setSelectedChatData, setSelectedChatType } = useStore();

  const handleSelectContact = (contact) => {
    setSelectedChatData(contact);
    setSelectedChatType("dm");
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenNewContactModal(true)}
              className="relative p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-xl blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <UserPlus size={16} className="text-cyan-400 relative z-10" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 text-white">
            <p>New Message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>


      <DmDialog
        open={openNewContactModal}
        onOpenChange={setOpenNewContactModal}
        onSelectContact={handleSelectContact}
      />
     
    </div>
  );
};

export default NewDm;