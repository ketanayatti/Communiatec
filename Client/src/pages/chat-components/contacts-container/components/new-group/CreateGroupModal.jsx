import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/store";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Users, Sparkles, Search, X, Camera, Check, Hash, Globe, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const CreateGroupModal = ({ open, onOpenChange }) => {
  const { dmContacts, addGroup, userInfo } = useStore();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupType, setGroupType] = useState("private");
  const [step, setStep] = useState(1);

  const handleMemberSelect = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Filter contacts based on search query
  const filteredContacts =
    dmContacts?.filter((contact) => {
      const fullName = `${contact.firstName || ""} ${
        contact.lastName || ""
      }`.toLowerCase();
      const email = contact.email?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    }) || [];

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      return toast.error(
        "Please provide a group name and select at least one member."
      );
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/groups/create", {
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: selectedMembers,
      });

      if (response.data.success) {
        const newGroup = response.data.group;
        addGroup(newGroup);
        toast.success(`Group "${newGroup.name}" created successfully!`);
        // Reset form
        setGroupName("");
        setGroupDescription("");
        setSelectedMembers([]);
        setSearchQuery("");
        onOpenChange(false); // Close the modal
        setGroupName("");
        setSelectedMembers([]);
      } else {
        throw new Error(response.data.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create group. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900/98 to-slate-900/98 backdrop-blur-xl border border-gray-700/40 text-white max-w-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-blue-500/5 to-indigo-500/8 rounded-lg pointer-events-none" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(6, 182, 212, 0.2) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          <DialogHeader className="text-center pb-6 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/30 mb-4 shadow-lg shadow-cyan-500/20"
            >
              <Users className="w-8 h-8 text-cyan-300" />
            </motion.div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 text-transparent bg-clip-text">
              Create New Group
            </DialogTitle>
            <DialogDescription className="text-gray-400 flex items-center justify-center gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {step === 1 ? "Group Details" : "Add Team Members"}
            </DialogDescription>
            
            {/* Step Progress */}
            <div className="flex gap-2 justify-center mt-4">
              {[1, 2].map((stepNum) => (
                <motion.div
                  key={stepNum}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    stepNum <= step 
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 w-8 shadow-sm shadow-cyan-400/50" 
                      : "bg-gray-700 w-6"
                  }`}
                  animate={{ width: stepNum <= step ? 32 : 24 }}
                />
              ))}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4 relative z-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Group Avatar */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border-2 border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                        <Users className="w-8 h-8 text-cyan-300" />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute -bottom-1 -right-1 p-2 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Camera className="w-3 h-3" />
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-400">Upload group photo</p>
                  </div>

                  {/* Group Name */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-cyan-400" />
                      Group Name *
                    </label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter a creative group name..."
                      className="bg-gray-800/60 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/30 rounded-xl backdrop-blur-sm transition-all duration-300 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Group Description */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-200">Description (Optional)</label>
                    <Textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="What's this group about? (e.g., Project team, Study group, Gaming squad...)"
                      className="bg-gray-800/60 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-500/50 focus:ring-cyan-500/30 rounded-xl backdrop-blur-sm transition-all duration-300 min-h-[100px] resize-none"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Group Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-200">Group Privacy</label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGroupType("private")}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          groupType === "private"
                            ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20"
                            : "bg-gray-800/30 border-gray-600/30 text-gray-400 hover:border-gray-500/50"
                        }`}
                      >
                        <Shield className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-semibold">Private</p>
                        <p className="text-xs opacity-70">Invite only</p>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGroupType("public")}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          groupType === "public"
                            ? "bg-green-500/20 border-green-400/50 text-green-300 shadow-lg shadow-green-500/20"
                            : "bg-gray-800/30 border-gray-600/30 text-gray-400 hover:border-gray-500/50"
                        }`}
                      >
                        <Globe className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-semibold">Public</p>
                        <p className="text-xs opacity-70">Anyone can join</p>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (

                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Selected Members Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-400" />
                        Add Members
                      </h3>
                      <span className="text-sm font-medium text-gray-400">
                        {selectedMembers.length} selected
                      </span>
                    </div>
                    
                    {selectedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                        {selectedMembers.map((memberId, index) => {
                          const member = dmContacts.find(c => c._id === memberId);
                          return member ? (
                            <motion.div
                              key={memberId}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 px-3 py-1.5 rounded-full text-sm font-medium"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={member.avatar} />
                              </Avatar>
                              <span>{member.firstName} {member.lastName}</span>
                              <button
                                onClick={() => handleMemberSelect(memberId)}
                                className="hover:text-red-400 transition-colors ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Search Bar */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                    <div className="relative bg-gray-800/50 backdrop-blur-md border border-gray-600/50 rounded-xl overflow-hidden">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Search className="w-4 h-4 text-cyan-400" />
                      </div>
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your contacts..."
                        className="bg-transparent border-0 text-white placeholder:text-gray-400 pl-12 pr-12 h-12 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Contacts List */}
                  <ScrollArea className="h-72 rounded-xl border border-gray-700/40 bg-gray-800/30 backdrop-blur-sm shadow-inner">
                    <div className="p-4 space-y-2">
                      {filteredContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-700/30 flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400 font-medium">
                            {searchQuery ? "No contacts found" : "No contacts available"}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {searchQuery ? "Try a different search term" : "Add some friends first!"}
                          </p>
                        </div>
                      ) : (
                        filteredContacts.map((contact, index) => {
                          const isSelected = selectedMembers.includes(contact._id);
                          return (
                            <motion.div
                              key={contact._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleMemberSelect(contact._id)}
                              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group border ${
                                isSelected
                                  ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-cyan-400/50 shadow-lg shadow-cyan-500/20"
                                  : "hover:bg-gray-700/40 border-transparent hover:border-gray-600/40"
                              }`}
                            >
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-gray-600/50 group-hover:ring-gray-500/70 transition-all duration-300">
                                  {contact.image ? (
                                    <AvatarImage src={contact.image} className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                      <UserCircle2 className="w-7 h-7 text-gray-300" />
                                    </div>
                                  )}
                                </Avatar>
                                
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <Check className="w-3 h-3 text-white" />
                                  </motion.div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white group-hover:text-cyan-200 transition-colors">
                                  {contact.firstName} {contact.lastName}
                                </p>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors truncate">
                                  {contact.email}
                                </p>
                              </div>
                              
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-cyan-400 font-medium text-sm"
                                >
                                  Selected
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })
                      )}
                      
                      {(!dmContacts || dmContacts.length === 0) && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-gray-700/30 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-400 font-medium">No contacts available</p>
                          <p className="text-gray-500 text-sm mt-1">Add some friends to create groups!</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="flex gap-3 pt-6 relative z-10">
            {step > 1 && (
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 px-6"
            >
              Cancel
            </Button>
            
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={isLoading || !groupName.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-2 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-300 flex-1"
              >
                Continue
              </Button>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  onClick={handleCreateGroup}
                  disabled={isLoading || !groupName.trim() || selectedMembers.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/25 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                      />
                      Creating Group...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Create Group ({selectedMembers.length + 1} members)
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;