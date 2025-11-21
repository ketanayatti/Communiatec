import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { 
  UserCircle2, 
  Users, 
  Search, 
  X, 
  Check, 
  UserPlus, 
  UserMinus,
  Crown,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/apiClient";
import { useStore } from "@/store/store";
import { toast } from "sonner";

const GroupMemberManagement = ({ group, open, onOpenChange, onMembersUpdate }) => {
  const { dmContacts, userInfo } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("add"); // "add" or "remove"

  const isAdmin = group?.admins?.includes(userInfo?._id) || group?.creator?._id === userInfo?._id;

  // Filter available contacts (not already in group)
  const availableContacts = dmContacts?.filter(contact => 
    !group?.members?.some(member => member._id === contact._id) &&
    contact._id !== userInfo._id
  ) || [];

  // Filter contacts based on search query
  const filteredContacts = (mode === "add" ? availableContacts : group?.members || []).filter(contact => {
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
    const email = contact.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const handleMemberSelect = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;

    setLoading(true);
    try {
      const res = await apiClient.post(`/api/groups/${group._id}/members`, {
        members: selectedMembers
      });

      if (res.data.success) {
        toast.success(`${selectedMembers.length} member(s) added successfully!`);
        onMembersUpdate?.(res.data.group);
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error("Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMembers = async () => {
    if (selectedMembers.length === 0) return;

    setLoading(true);
    try {
      for (const memberId of selectedMembers) {
        await apiClient.delete(`/api/groups/${group._id}/members/${memberId}`);
      }
      
      toast.success(`${selectedMembers.length} member(s) removed successfully!`);
      // Note: You might want to update the group state here
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error removing members:", error);
      toast.error("Failed to remove members");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMembers([]);
    setSearchQuery("");
  };

  const getMemberRole = (member) => {
    if (group?.creator?._id === member._id) return "Creator";
    if (group?.admins?.includes(member._id)) return "Admin";
    return "Member";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Creator": return <Crown className="w-3 h-3 text-yellow-400" />;
      case "Admin": return <Shield className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  const canRemoveMember = (member) => {
    const role = getMemberRole(member);
    return isAdmin && member._id !== userInfo._id && role !== "Creator";
  };

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl border-0 ring-1 ring-slate-700/30 text-white max-w-3xl w-[90vw] shadow-2xl h-[85vh] max-h-[85vh] overflow-hidden p-0 flex flex-col">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/4 to-cyan-500/8 rounded-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-indigo-500/5 rounded-2xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Enhanced Header */}
        <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-slate-900/80 to-slate-800/60 backdrop-blur-md border-b border-slate-700/40 flex-shrink-0">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-2xl blur-lg scale-110 opacity-60" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  Manage Members
                </DialogTitle>
                <p className="text-slate-400 text-sm font-medium">
                  {group?.name}
                </p>
              </div>
            </div>
            
            {/* Enhanced Mode Toggle */}
            <div className="flex items-center justify-center gap-1 p-1 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <Button
                onClick={() => setMode("add")}
                className={`flex-1 h-12 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  mode === "add" 
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25" 
                    : "bg-transparent border-0 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                }`}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add Members
              </Button>
              <Button
                onClick={() => setMode("remove")}
                className={`flex-1 h-12 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  mode === "remove" 
                    ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/25" 
                    : "bg-transparent border-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                }`}
              >
                <UserMinus className="w-5 h-5 mr-2" />
                Remove Members
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="relative z-10 p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Enhanced Selected Members Preview */}
          <AnimatePresence>
            {selectedMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className={`p-5 rounded-2xl border backdrop-blur-sm ${
                  mode === "add"
                    ? "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30"
                    : "bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-sm font-semibold uppercase tracking-wider ${
                      mode === "add" ? "text-emerald-300" : "text-red-300"
                    }`}>
                      Selected Members ({selectedMembers.length})
                    </p>
                    <button
                      onClick={() => setSelectedMembers([])}
                      className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedMembers.map(memberId => {
                      const member = (mode === "add" ? availableContacts : group?.members || [])
                        .find(c => c._id === memberId);
                      return member ? (
                        <motion.div
                          key={memberId}
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 10 }}
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl border font-medium transition-all duration-200 ${
                            mode === "add"
                              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30"
                              : "bg-red-500/20 border-red-400/40 text-red-200 hover:bg-red-500/30"
                          }`}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                          </Avatar>
                          <span className="text-sm">
                            {member.firstName} {member.lastName}
                          </span>
                          <button
                            onClick={() => handleMemberSelect(memberId)}
                            className="hover:scale-110 transition-transform p-0.5 rounded-full hover:bg-white/10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ) : null;
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={mode === "add" ? "Search contacts to add..." : "Search members to remove..."}
              className="bg-slate-800/40 border-slate-600/40 text-white placeholder:text-slate-400 pl-12 pr-12 h-14 rounded-2xl text-base font-medium backdrop-blur-sm focus:bg-slate-800/60 focus:border-slate-500/60 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Enhanced Members/Contacts List */}
          <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/30 overflow-hidden flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {filteredContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6"
                    >
                      <Users className="w-10 h-10 text-slate-500" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">
                      {mode === "add" 
                        ? (searchQuery ? 'No contacts found' : 'All contacts are in the group')
                        : (searchQuery ? 'No members found' : 'No members to manage')
                      }
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {mode === "add" 
                        ? "Try adjusting your search or invite new contacts first"
                        : "All members have appropriate permissions"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredContacts.map((contact, index) => {
                        const isSelected = selectedMembers.includes(contact._id);
                        const role = mode === "remove" ? getMemberRole(contact) : null;
                        const canRemove = mode === "remove" ? canRemoveMember(contact) : true;

                        return (
                          <motion.div
                            key={contact._id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => canRemove && handleMemberSelect(contact._id)}
                            className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                              !canRemove 
                                ? "opacity-40 cursor-not-allowed"
                                : `cursor-pointer ${
                                    isSelected
                                      ? `${mode === "add" 
                                          ? "bg-gradient-to-r from-emerald-500/25 to-green-500/25 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20" 
                                          : "bg-gradient-to-r from-red-500/25 to-pink-500/25 border-2 border-red-500/50 shadow-lg shadow-red-500/20"
                                        }`
                                      : "hover:bg-slate-700/40 border-2 border-transparent hover:border-slate-600/50"
                                  }`
                            }`}
                          >
                            <div className="relative">
                              <Avatar className="h-12 w-12 ring-2 ring-slate-700/50 group-hover:ring-slate-600/70 transition-all duration-300">
                                {contact.avatar ? (
                                  <AvatarImage src={contact.avatar} />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                    <UserCircle2 className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                              </Avatar>
                              {isSelected && canRemove && (
                                <motion.div 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                                    mode === "add" ? "bg-emerald-500" : "bg-red-500"
                                  }`}>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </motion.div>
                              )}
                              {role && role !== "Member" && (
                                <div className="absolute -bottom-1 -left-1 p-1 rounded-full bg-slate-800 border border-slate-600 shadow-lg">
                                  {getRoleIcon(role)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-white truncate">
                                  {contact.firstName} {contact.lastName}
                                </h4>
                                {role && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    role === "Creator" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                    role === "Admin" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                    "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                  }`}>
                                    {role}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-400 truncate">
                                {contact.email}
                              </p>
                            </div>
                            
                            {!canRemove && (
                              <div className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-700/50 rounded-lg">
                                Protected
                              </div>
                            )}

                            {/* Selection indicator */}
                            {canRemove && (
                              <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                isSelected
                                  ? `${mode === "add" ? "border-emerald-500 bg-emerald-500" : "border-red-500 bg-red-500"}`
                                  : "border-slate-600 group-hover:border-slate-500"
                              }`}>
                                {isSelected && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 flex-shrink-0 border-t border-slate-700/30 bg-slate-900/30">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 h-12 border-2 border-slate-600/60 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 rounded-xl transition-all duration-300 font-medium"
              disabled={loading}
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={mode === "add" ? handleAddMembers : handleRemoveMembers}
              disabled={loading || selectedMembers.length === 0}
              className={`flex-1 h-12 font-semibold rounded-xl shadow-lg transition-all duration-300 ${
                mode === "add"
                  ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 shadow-emerald-500/25 hover:shadow-emerald-500/40"
                  : "bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 shadow-red-500/25 hover:shadow-red-500/40"
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                  />
                  {mode === "add" ? "Adding Members..." : "Removing Members..."}
                </>
              ) : (
                <>
                  {mode === "add" ? (
                    <UserPlus className="w-5 h-5 mr-3" />
                  ) : (
                    <UserMinus className="w-5 h-5 mr-3" />
                  )}
                  {selectedMembers.length === 0 
                    ? (mode === "add" ? "Select Members to Add" : "Select Members to Remove")
                    : (mode === "add" 
                        ? `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}` 
                        : `Remove ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`)
                  }
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMemberManagement;