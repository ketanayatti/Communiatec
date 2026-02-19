import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserCircle2,
  Users2,
  Mail,
  Crown,
  Shield,
  UserMinus,
  Trash2,
  Edit3,
  Camera,
  Settings,
  Plus,
  X,
  Check,
  AlertTriangle,
  MoreHorizontal,
  Copy,
  Eye,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/apiClient";
import { useStore } from "@/store/store";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import GroupMemberManagement from "../group-member-management";

const GroupProfileView = ({ group, open, onOpenChange }) => {
  const [details, setDetails] = useState(group);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);

  const {
    userInfo,
    dmContacts,
    removeGroup,
    setSelectedChatData,
    setSelectedChatType,
  } = useStore();

  const isAdmin =
    details?.admins?.includes(userInfo?._id) ||
    details?.creator?._id === userInfo?._id;
  const isCreator = details?.creator?._id === userInfo?._id;

  useEffect(() => {
    const fetchDetails = async () => {
      if (open && group && !group.members) {
        try {
          setLoading(true);
          const res = await apiClient.get(`/api/groups/${group._id}`);
          if (res.data.success) {
            setDetails(res.data.group);
            setEditName(res.data.group.name);
            setEditDescription(res.data.group.description || "");
          }
        } catch (err) {
          console.error("Failed to fetch group details", err);
          toast.error("Failed to fetch group details");
        } finally {
          setLoading(false);
        }
      } else if (group) {
        setDetails(group);
        setEditName(group.name);
        setEditDescription(group.description || "");
      }
    };
    fetchDetails();
  }, [open, group]);

  const handleUpdateGroup = async () => {
    if (!editName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.put(`/api/groups/${details._id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      if (res.data.success) {
        setDetails(res.data.group);
        setIsEditing(false);
        toast.success("Group updated successfully!");
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setLoading(true);
      const res = await apiClient.delete(`/api/groups/${details._id}`);

      if (res.data.success) {
        toast.success("Group deleted successfully!");
        removeGroup(details._id);
        onOpenChange(false);
        setSelectedChatData(null);
        setSelectedChatType(undefined);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      const res = await apiClient.delete(
        `/api/groups/${details._id}/members/${memberId}`
      );

      if (res.data.success) {
        setDetails(res.data.group);
        toast.success("Member removed successfully!");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const getMemberRole = (member) => {
    if (details?.creator?._id === member._id) return "Creator";
    if (details?.admins?.includes(member._id)) return "Admin";
    return "Member";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Creator":
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case "Admin":
        return <Shield className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Creator":
        return "text-yellow-400";
      case "Admin":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const handleMembersUpdate = (updatedGroup) => {
    setDetails(updatedGroup);
  };

  if (!details) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl border-0 ring-1 ring-slate-700/30 text-white max-w-4xl w-[90vw] mx-auto shadow-2xl h-[90vh] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-cyan-500/4 to-purple-500/8 rounded-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-indigo-500/5 rounded-2xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34, 197, 94, 0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Header with enhanced styling */}
        <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-slate-900/80 to-slate-800/60 backdrop-blur-md border-b border-slate-700/40 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-2xl blur-lg scale-110 opacity-60" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-lg">
                  <Users2 className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  {isEditing ? "Edit Group Settings" : "Group Profile"}
                </DialogTitle>
                <p className="text-slate-400 text-sm font-medium mt-1">
                  Manage your group settings and members
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="group relative p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-400/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400/40 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                  >
                    <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                )}

                {isCreator && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-400/20 text-red-400 hover:bg-red-500/20 hover:border-red-400/40 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gradient-to-br from-slate-950 to-slate-900 border border-red-500/30 backdrop-blur-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400 flex items-center gap-3 text-xl">
                          <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          Delete Group Permanently
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300 text-base leading-relaxed pt-2">
                          This action cannot be undone. This will permanently
                          delete the group
                          <span className="font-semibold text-white">
                            {" "}
                            "{details.name}"{" "}
                          </span>
                          and all its messages, removing access for all{" "}
                          {details.members?.length || 0} members.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="pt-6 gap-3">
                        <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white transition-colors">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteGroup}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Group
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content with proper scrolling */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6 relative z-10">
              {/* Group Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Group Avatar & Basic Info */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                  {/* Avatar Section */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative group mx-auto lg:mx-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-blue-400/20 rounded-3xl blur-2xl scale-110 opacity-0 group-hover:opacity-80 transition-opacity duration-700" />
                    <div className="relative">
                      <Avatar className="h-28 w-28 ring-4 ring-gradient-to-r from-emerald-500/40 to-cyan-500/40 group-hover:ring-emerald-500/60 shadow-2xl transition-all duration-500 border-4 border-slate-800/50">
                        {details.avatar ? (
                          <AvatarImage
                            src={details.avatar}
                            alt={details.name}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500/30 via-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                            <Users2 className="text-white w-12 h-12" />
                          </div>
                        )}
                      </Avatar>
                      {isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-blue-500/50 transition-all duration-300 border-2 border-slate-800"
                        >
                          <Camera className="w-3 h-3" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>

                  {/* Group Information */}
                  <div className="flex-1 w-full lg:w-auto text-center lg:text-left">
                    {isEditing ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
                              Group Name
                            </label>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-slate-800/60 border-slate-600/60 text-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 rounded-xl h-10 text-base font-medium transition-all duration-300"
                              placeholder="Enter group name"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
                              Description
                            </label>
                            <Input
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              className="bg-slate-800/60 border-slate-600/60 text-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 rounded-xl h-10 transition-all duration-300"
                              placeholder="Enter group description"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            onClick={handleUpdateGroup}
                            disabled={loading}
                            className="flex-1 h-10 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                          >
                            {loading ? (
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
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditing(false);
                              setEditName(details.name);
                              setEditDescription(details.description || "");
                            }}
                            variant="outline"
                            className="flex-1 h-10 border-2 border-slate-600/60 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 rounded-xl transition-all duration-300"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                      >
                        <div>
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent leading-tight">
                            {details.name}
                          </h1>
                          {details.description && (
                            <p className="text-base text-slate-400 mt-2 leading-relaxed max-w-2xl">
                              {details.description}
                            </p>
                          )}
                        </div>

                        {/* Enhanced Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 group">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors duration-300">
                                <Users2 className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-white">
                                  {details.members?.length || 0}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                  Members
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 group">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors duration-300">
                                <Shield className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-white">
                                  {(details.admins?.length || 0) + 1}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                  Admins
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 group">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors duration-300">
                                <Calendar className="w-4 h-4 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">
                                  {new Date(
                                    details.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                  Created
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Members Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between flex-shrink-0">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                      <Users2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    Members
                    <span className="text-base font-medium text-slate-400">
                      ({details.members?.length || 0})
                    </span>
                  </h2>

                  {isAdmin && (
                    <Button
                      onClick={() => setShowMemberManagement(true)}
                      className="h-9 px-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/40 text-blue-300 hover:from-blue-500/30 hover:to-indigo-500/30 hover:border-blue-400/60 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/20 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  )}
                </div>

                {/* Enhanced Member List with proper scrolling */}
                <div className="bg-slate-800/20 backdrop-blur-sm rounded-xl border border-slate-700/30 p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {details.members?.map((member, index) => {
                        const role = getMemberRole(member);
                        const canRemove =
                          isAdmin &&
                          member._id !== userInfo._id &&
                          role !== "Creator";

                        return (
                          <motion.div
                            key={member._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="group bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-3 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10 ring-2 ring-slate-700/50 group-hover:ring-slate-600/70 transition-all duration-300">
                                  {member.avatar ? (
                                    <AvatarImage
                                      src={member.avatar}
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                      <UserCircle2 className="w-5 h-5 text-slate-300" />
                                    </div>
                                  )}
                                </Avatar>
                                {role !== "Member" && (
                                  <div className="absolute -top-1 -right-1 p-1 rounded-full bg-slate-800 border border-slate-600 shadow-lg">
                                    {getRoleIcon(role)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-white truncate">
                                    {member.firstName && member.lastName
                                      ? `${member.firstName} ${member.lastName}`
                                      : member.email}
                                  </h4>
                                  {member._id === userInfo._id && (
                                    <span className="text-xs bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30 font-medium">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-xs font-medium ${getRoleColor(
                                      role
                                    )} flex items-center gap-1`}
                                  >
                                    {getRoleIcon(role)}
                                    {role}
                                  </p>
                                  <span className="text-slate-500 text-xs">
                                    •
                                  </span>
                                  <p className="text-xs text-slate-400 truncate">
                                    {member.email}
                                  </p>
                                </div>
                              </div>

                              {/* Enhanced Member Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-all duration-200"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className="bg-slate-800/90 backdrop-blur-xl border-slate-700/60 shadow-2xl"
                                    align="end"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => setSelectedMember(member)}
                                      className="text-slate-300 hover:bg-slate-700/60 hover:text-white rounded-lg"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>
                                    {canRemove && (
                                      <>
                                        <DropdownMenuSeparator className="bg-slate-700/60" />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleRemoveMember(member._id)
                                          }
                                          className="text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg"
                                        >
                                          <UserMinus className="w-4 h-4 mr-2" />
                                          Remove Member
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Empty State */}
                    {(!details.members || details.members.length === 0) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-8 text-center"
                      >
                        <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center mb-3">
                          <Users2 className="w-6 h-6 text-slate-500" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-300 mb-1">
                          No members yet
                        </h3>
                        <p className="text-slate-400 text-xs">
                          Start by inviting some members to your group
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollArea>
        </div>

        {/* Member Management Modal */}
        <GroupMemberManagement
          group={details}
          open={showMemberManagement}
          onOpenChange={setShowMemberManagement}
          onMembersUpdate={handleMembersUpdate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GroupProfileView;