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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/store/store";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { 
  UserCircle2, 
  Users, 
  Sparkles, 
  Search, 
  X, 
  Camera, 
  Check, 
  Plus,
  Hash,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EnhancedCreateGroupModal = ({ open, onOpenChange }) => {
  const { dmContacts, addGroup, userInfo } = useStore();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1); // 1: Group Info, 2: Add Members, 3: Review
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [groupType, setGroupType] = useState("private"); // private, public

  // Filter contacts based on search query
  const filteredContacts = dmContacts?.filter(contact => {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
    const email = contact.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  }) || [];

  const handleMemberSelect = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      return toast.error("Please provide a group name.");
    }

    if (selectedMembers.length === 0) {
      return toast.error("Please select at least one member.");
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/groups/create", {
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: selectedMembers,
        type: groupType,
      });

      if (response.data.success) {
        const newGroup = response.data.group;
        addGroup(newGroup);
        toast.success(`Group "${newGroup.name}" created successfully!`);
        
        // Reset form
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
    setStep(1);
    setGroupAvatar(null);
    setGroupType("private");
  };

  const nextStep = () => {
    if (step === 1) {
      if (!groupName.trim()) {
        toast.error("Please enter a group name");
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const getSelectedMemberNames = () => {
    return selectedMembers.map(id => {
      const member = dmContacts.find(c => c._id === id);
      return member ? `${member.firstName} ${member.lastName}`.trim() || member.email : '';
    }).filter(Boolean);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl border-0 ring-1 ring-slate-700/30 text-white w-full max-w-md sm:max-w-2xl lg:max-w-4xl mx-4 sm:mx-auto shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 rounded-2xl">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-purple-500/4 to-cyan-500/8 rounded-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-blue-500/5 rounded-2xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Enhanced Mobile-Responsive Header */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 backdrop-blur-md border-b border-slate-700/40">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-2xl blur-xl scale-110 opacity-60" />
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 shadow-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                </div>
              </motion.div>
              <div className="text-center sm:text-left">
                <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  Create New Group
                </DialogTitle>
                <DialogDescription className="text-slate-400 flex items-center justify-center sm:justify-start gap-2 mt-1 sm:mt-2 text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  Step {step} of 3 -{" "}
                  {step === 1
                    ? "Group Details"
                    : step === 2
                    ? "Add Members"
                    : "Review & Create"}
                </DialogDescription>
              </div>
            </div>

            {/* Enhanced Mobile-Responsive Progress Bar */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              {[1, 2, 3].map((stepNum, index) => (
                <div key={stepNum} className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                      stepNum <= step
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                        : stepNum === step + 1
                        ? "bg-slate-700/50 text-slate-400 border border-slate-600"
                        : "bg-slate-800/50 text-slate-500"
                    }`}
                    animate={{
                      scale: stepNum === step ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {stepNum < step ? (
                      <Check className="w-3 h-3 sm:w-5 sm:h-5" />
                    ) : (
                      stepNum
                    )}
                  </motion.div>
                  {index < 2 && (
                    <motion.div
                      className={`h-0.5 w-6 sm:h-1 sm:w-12 rounded-full transition-all duration-300 ${
                        stepNum < step
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                          : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 p-4 sm:p-6 lg:p-8"
        >
          <ScrollArea className="max-h-[50vh] sm:max-h-[60vh] px-1">
            <AnimatePresence mode="wait">
              {/* Step 1: Group Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Group Avatar */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="relative group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border-2 border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300 overflow-hidden">
                        {groupAvatar ? (
                          <img
                            src={groupAvatar}
                            alt="Group"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300" />
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1.5 sm:p-2 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition-colors opacity-0 group-hover:opacity-100 touch-manipulation"
                      >
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    </div>
                    <p className="text-xs text-slate-400">Upload group photo</p>
                  </div>

                  {/* Group Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Group Name *
                    </label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter a creative group name..."
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-cyan-500/30 rounded-xl backdrop-blur-sm transition-all duration-300 h-12 sm:h-14 text-base touch-manipulation"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Group Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Description (Optional)
                    </label>
                    <Textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="What's this group about? (e.g., Project team, Study group, etc.)"
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-cyan-500/30 rounded-xl backdrop-blur-sm transition-all duration-300 min-h-[80px] sm:min-h-[100px] resize-none text-base touch-manipulation"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Group Type */}
                  {/* <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">
                      Group Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGroupType("private")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 touch-manipulation ${
                          groupType === "private"
                            ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                            : "bg-slate-800/30 border-slate-600/30 text-slate-400 hover:border-slate-500/50"
                        }`}
                      >
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
                        <p className="font-medium text-sm sm:text-base">Private</p>
                        <p className="text-xs opacity-70">Invite only</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGroupType("public")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 touch-manipulation ${
                          groupType === "public"
                            ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                            : "bg-slate-800/30 border-slate-600/30 text-slate-400 hover:border-slate-500/50"
                        }`}
                      >
                        <Globe className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
                        <p className="font-medium text-sm sm:text-base">Public</p>
                        <p className="text-xs opacity-70">Anyone can join</p>
                      </motion.button>
                    </div>
                  </div> */}
                </motion.div>
              )}

              {/* Step 2: Add Members */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Selected Members Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Add Members
                      </h3>
                      <span className="text-sm text-slate-400">
                        {selectedMembers.length} selected
                      </span>
                    </div>

                    {selectedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-800/30 rounded-xl border border-slate-600/30">
                        {selectedMembers.map((memberId) => {
                          const member = dmContacts.find(
                            (c) => c._id === memberId
                          );
                          return member ? (
                            <motion.div
                              key={memberId}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 px-3 py-1.5 rounded-full text-sm touch-manipulation"
                            >
                              <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                                <AvatarImage src={member.avatar} />
                              </Avatar>
                              <span className="text-xs sm:text-sm">
                                {member.firstName} {member.lastName}
                              </span>
                              <button
                                onClick={() => handleMemberSelect(memberId)}
                                className="hover:text-red-400 transition-colors touch-manipulation"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search contacts..."
                      className="bg-slate-800/30 border-slate-600/30 text-white placeholder:text-slate-400 pl-10 pr-10 rounded-xl h-12 sm:h-14 text-base focus:border-cyan-500/50 focus:ring-cyan-500/30 touch-manipulation"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors touch-manipulation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Contacts List */}
                  <ScrollArea className="h-48 sm:h-64 rounded-xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm">
                    <div className="p-3 sm:p-4 space-y-2">
                      {filteredContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Users className="w-12 h-12 text-slate-600 mb-3" />
                          <p className="text-slate-400 text-sm">
                            {searchQuery
                              ? "No contacts found"
                              : "No contacts available"}
                          </p>
                        </div>
                      ) : (
                        filteredContacts.map((contact, index) => {
                          const isSelected = selectedMembers.includes(
                            contact._id
                          );
                          return (
                            <motion.div
                              key={contact._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleMemberSelect(contact._id)}
                              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 group touch-manipulation ${
                                isSelected
                                  ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                                  : "hover:bg-slate-700/30 border border-transparent hover:border-slate-600/30"
                              }`}
                            >
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar} />
                                  ) : (
                                    <UserCircle2 className="w-6 h-6 text-slate-400" />
                                  )}
                                </Avatar>
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <p className="font-medium text-white">
                                  {contact.firstName} {contact.lastName}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {contact.email}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-white text-center mb-6">
                    Review Group Details
                  </h3>

                  <div className="space-y-4 p-4 sm:p-6 bg-slate-800/30 rounded-xl border border-slate-600/30">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center border-2 border-cyan-400/30 flex-shrink-0">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-300" />
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h4 className="text-lg sm:text-xl font-bold text-white">
                          {groupName}
                        </h4>
                        {groupDescription && (
                          <p className="text-sm text-slate-400 mt-1">
                            {groupDescription}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-2">
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              groupType === "private"
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {groupType === "private"
                              ? "Private Group"
                              : "Public Group"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {selectedMembers.length + 1} members
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700/50 pt-4">
                      <h5 className="text-sm font-medium text-slate-300 mb-3">
                        Members ({selectedMembers.length + 1})
                      </h5>
                      <div className="space-y-2">
                        {/* Current user */}
                        <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                          <Avatar className="h-8 w-8">
                            {userInfo.avatar ? (
                              <AvatarImage src={userInfo.avatar} />
                            ) : (
                              <UserCircle2 className="w-5 h-5 text-slate-400" />
                            )}
                          </Avatar>
                          <span className="text-sm text-white">
                            {userInfo.firstName} {userInfo.lastName} (You -
                            Admin)
                          </span>
                        </div>

                        {/* Selected members */}
                        {selectedMembers.map((memberId) => {
                          const member = dmContacts.find(
                            (c) => c._id === memberId
                          );
                          return member ? (
                            <div
                              key={memberId}
                              className="flex items-center gap-3 p-2 rounded-lg"
                            >
                              <Avatar className="h-8 w-8">
                                {member.avatar ? (
                                  <AvatarImage src={member.avatar} />
                                ) : (
                                  <UserCircle2 className="w-5 h-5 text-slate-400" />
                                )}
                              </Avatar>
                              <span className="text-sm text-slate-300">
                                {member.firstName} {member.lastName}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
            {step > 1 && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto h-12 sm:h-10 touch-manipulation"
                disabled={isLoading}
              >
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white flex-1 h-12 sm:h-10 touch-manipulation"
                disabled={isLoading}
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleCreateGroup}
                disabled={
                  isLoading || !groupName.trim() || selectedMembers.length === 0
                }
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-2 rounded-xl font-semibold shadow-lg shadow-cyan-500/20 border-0 transition-all duration-300 flex-1 h-12 sm:h-10 touch-manipulation"
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
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Group
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateGroupModal;