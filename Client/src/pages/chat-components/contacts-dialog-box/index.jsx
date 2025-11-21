import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Mail, Users, ChevronDown, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/apiClient";

const DmDialog = ({ open, onOpenChange, onSelectContact }) => {
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const { dmContacts, setDmContacts } = useStore();

  // Debounced search to prevent excessive API calls
  const searchContact = useCallback(async (searchTerm) => {
    try {
      const response = await apiClient.post(
        "/api/contact/search",
        { searchTerm },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.contacts) {
        const contacts = response.data.contacts.filter(
          (c) => !dmContacts.some((dm) => dm._id === c._id)
        );
        setSearchedContacts(contacts);
      }
    } catch (error) {
      console.error(error);
    }
  }, [dmContacts]);

  // Optimized scroll handler with RAF throttling
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    if ((scrollTop > 10) !== isScrolled) {
      setIsScrolled(scrollTop > 10);
    }
  }, [isScrolled]);

  useEffect(() => {
    if (open) {
      searchContact("");
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      setIsScrolled(false);
      return () => clearTimeout(timer);
    }
  }, [open, searchContact]);

  // Optimized transition settings
  const springTransition = useMemo(() => ({
    type: "spring",
    stiffness: 300,
    damping: 25,
    mass: 1
  }), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-slate-800 border border-slate-600 text-slate-100 sm:max-w-[520px] shadow-2xl rounded-xl overflow-hidden max-h-[85vh] p-0">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 opacity-50" />
        
        {/* Header */}
        <DialogHeader className={`relative z-10 p-6 transition-all duration-200 ${isScrolled ? 'border-b border-slate-600 bg-slate-800/90 backdrop-blur-sm' : 'border-b border-slate-700'}`}>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3 text-slate-100">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 border border-slate-600 shadow-sm"
            >
              <UserPlus size={20} className="text-blue-400" />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-100">
                  Add Contact
                </span>
                <Users size={16} className="text-slate-400" />
              </div>
              <p className="text-sm font-normal text-slate-400 mt-0.5">
                Search and connect with team members
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative z-10 p-6 pt-4">
          {/* Search Input */}
          <motion.div
            className="relative group mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...springTransition }}
          >
            {/* Search icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
              <Search className="text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
            </div>
            
            <Input
              ref={searchInputRef}
              className="pl-12 pr-20 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-700 transition-all duration-200 text-sm hover:bg-slate-700 hover:border-slate-500"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchContact(e.target.value);
              }}
            />
            
            {/* Results indicator */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={springTransition}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20"
                >
                  <Badge className="bg-slate-600 text-slate-200 border border-slate-500 px-3 py-1 text-xs font-medium">
                    {searchedContacts.length}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contact list */}
          <div className="relative">
            {/* Scroll fade effects */}
            <div className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-800 to-transparent z-20 pointer-events-none transition-opacity duration-200 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-800 to-transparent z-20 pointer-events-none" />
            
            <ScrollArea 
              className="h-96 max-h-[60vh] pr-2 overflow-y-auto" 
              ref={scrollAreaRef}
              onScrollCapture={handleScroll}
            >
              <AnimatePresence mode="popLayout">
                {searchedContacts.map((contact, index) => (
                  <motion.div
                    key={contact._id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{
                      delay: index * 0.03,
                      ...springTransition
                    }}
                    whileHover={{ 
                      scale: 1.01,
                      y: -1,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onSelectContact(contact);
                      onOpenChange(false);
                      setSearchedContacts([]);
                      setSearchQuery("");
                    }}
                    className="group relative flex items-center gap-3.5 p-4 mb-2 rounded-lg hover:bg-slate-750 cursor-pointer transition-all duration-200 border border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20"
                  >
                    {/* Subtle accent line */}
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      layoutId={`hover-accent-${contact._id}`}
                    />
                    
                    {/* Avatar */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: index * 0.04 + 0.1, 
                        ...springTransition
                      }}
                      className="relative flex-shrink-0"
                    >
                      <Avatar className="h-11 w-11 ring-2 ring-slate-600 group-hover:ring-blue-500/50 transition-all duration-200 shadow-sm">
                        <AvatarImage
                          src={contact.image}
                          alt={contact.firstName}
                        />
                        <AvatarFallback className="bg-slate-600 text-slate-100 font-medium text-sm border border-slate-500">
                          {contact.firstName?.charAt(0) ||
                            contact.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-slate-800 shadow-sm"
                      />
                    </motion.div>

                    {/* Contact information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <motion.h4 
                          className="font-medium text-slate-100 group-hover:text-blue-300 transition-colors duration-200 truncate text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.04 + 0.15 }}
                        >
                          {contact.firstName && contact.lastName
                            ? `${contact.firstName} ${contact.lastName}`
                            : "Unknown User"}
                        </motion.h4>
                        {contact.role === "admin" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.04 + 0.2 }}
                          >
                            <Badge className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 font-medium">
                              ADMIN
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      <motion.div 
                        className="flex items-center gap-2 text-slate-400 text-xs"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 + 0.25 }}
                      >
                        <Mail size={12} className="text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                        <span className="truncate font-medium">{contact.email}</span>
                      </motion.div>
                    </div>

                    {/* Connect button */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04 + 0.3 }}
                      className="flex-shrink-0"
                    >
                      <motion.div 
                        className="p-2 rounded-lg bg-slate-700 group-hover:bg-blue-600/20 transition-all duration-200 border border-slate-600 group-hover:border-blue-500/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Plus
                          size={14}
                          className="text-slate-400 group-hover:text-blue-400 transition-colors duration-200"
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {searchedContacts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, ...springTransition }}
                  className="text-center py-16 relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, ...springTransition }}
                    className="mb-4"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 border border-slate-600 shadow-sm mb-4">
                      <Search size={28} className="text-slate-400" />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-lg font-medium text-slate-100 mb-2">
                    {searchQuery ? "No contacts found" : "Start searching"}
                  </h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                    {searchQuery
                      ? (
                          <span>
                            No contacts match <span className="text-blue-400 font-medium">"{searchQuery}"</span>
                            <br />
                            <span className="text-xs text-slate-500 mt-1 block">Try a different search term</span>
                          </span>
                        )
                      : "Type to discover colleagues and start conversations"}
                  </p>
                </motion.div>
              )}
            </ScrollArea>

            {/* Scroll indicator */}
            {searchedContacts.length > 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isScrolled ? 0 : 1 }}
                className="absolute bottom-2 right-4 flex items-center gap-1 text-xs text-slate-500 pointer-events-none"
              >
                <span>Scroll for more</span>
                <motion.div
                  animate={{ y: [0, 2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                >
                  <ChevronDown size={12} />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DmDialog;