import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/store';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  ArrowLeft,
  Filter,
  MoreVertical,
  Crown,
  User,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Users = () => {
  const { userInfo } = useStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/chat");
      return;
    }

    fetchUsers();
  }, [userInfo, navigate, pagination.page, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/admin/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery,
        },
      });

      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    // The useEffect will trigger the API call
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.delete(`/api/admin/users/${selectedUser._id}`);
      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      await apiClient.put("/api/admin/users/update-role", {
        userId: selectedUser._id,
        role: selectedRole,
      });
      toast.success(`User role updated to ${selectedRole}`);
      setShowRoleDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user role"
      );
    }
  };

  const handleAddUser = async () => {
    if (addLoading) return;
    const { email, password, firstName, lastName, role } = newUserData;
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    setAddLoading(true);
    try {
      await apiClient.post("/api/admin/users", {
        email,
        password,
        firstName,
        lastName,
        role,
      });
      toast.success("User created successfully");
      setShowAddDialog(false);
      setNewUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setAddLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30";
      default:
        return "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/8 to-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/3 to-blue-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-cyan-400/60 rounded-full animate-ping"></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-400/40 rounded-full animate-ping delay-500"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-indigo-400/30 rounded-full animate-ping delay-1000"></div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <Settings className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-transparent bg-clip-text tracking-tight">
                    User Management
                  </h1>
                </div>
                <p className="text-slate-400 text-lg ml-16 font-medium">
                  Control your platform's user ecosystem with precision
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="relative bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 px-6 py-3 rounded-2xl font-semibold border border-cyan-400/20 hover:border-cyan-400/40 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Plus className="h-5 w-5 mr-2 relative z-10" />
                  <span className="relative z-10">Add User</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/dashboard")}
                  className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300 px-6 py-3 rounded-2xl font-medium backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-black/20 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-6">
                  <div className="relative flex-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                        className="bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-400 h-14 pl-14 pr-6 rounded-2xl focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 font-medium backdrop-blur-sm shadow-inner"
                      />
                      <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  <Button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-14 px-8 rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 font-semibold border border-cyan-400/20 hover:border-cyan-400/40"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Modern Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-black/20"
          >
            {loading ? (
              <div className="flex flex-col justify-center items-center py-32">
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animate-reverse"></div>
                </div>
                <p className="text-slate-400 font-medium">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur border-b border-slate-600/30">
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-300 tracking-wider uppercase">
                        User Profile
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-300 tracking-wider uppercase">
                        Contact
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-300 tracking-wider uppercase">
                        Role & Status
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-300 tracking-wider uppercase">
                        Joined Date
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-slate-300 tracking-wider uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-700/20 hover:bg-gradient-to-r hover:from-slate-800/30 hover:to-slate-700/30 transition-all duration-300 group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-300 font-bold text-lg shadow-lg shadow-cyan-500/10 border border-cyan-500/20">
                                {user.firstName?.charAt(0) ||
                                  user.email.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-bold text-white text-lg leading-tight">
                                {user.firstName && user.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.email.split("@")[0]}
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                    user.profileSetup
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      user.profileSetup
                                        ? "bg-emerald-400"
                                        : "bg-amber-400"
                                    }`}
                                  ></div>
                                  {user.profileSetup
                                    ? "Complete"
                                    : "Incomplete"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="text-white font-medium">
                              {user.email}
                            </div>
                            <div className="text-slate-400 text-sm">
                              Primary contact
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${getRoleColor(
                                user.role
                              )} shadow-lg`}
                            >
                              {getRoleIcon(user.role)}
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </span>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="text-white font-medium">
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {Math.floor(
                                (Date.now() - new Date(user.createdAt)) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days ago
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 w-10 p-0 rounded-xl border border-slate-600/50 bg-slate-800/50 hover:bg-slate-700/70 hover:border-cyan-500/50 transition-all duration-300 group/btn"
                              >
                                <MoreVertical className="h-4 w-4 text-slate-400 group-hover/btn:text-cyan-300 transition-colors" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800/95 backdrop-blur-xl border-slate-600/50 text-slate-300 shadow-2xl rounded-2xl min-w-[200px] p-2">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedRole(user.role);
                                  setShowRoleDialog(true);
                                }}
                                className="cursor-pointer hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors rounded-xl p-3 font-medium"
                              >
                                <Shield className="mr-3 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              {userInfo._id !== user._id && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="cursor-pointer hover:bg-red-500/10 hover:text-red-300 text-red-400 transition-colors rounded-xl p-3 font-medium"
                                >
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-24">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700/30 to-slate-600/30 flex items-center justify-center mx-auto border border-slate-600/20">
                        <Settings className="h-12 w-12 text-slate-500" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-300 mb-3">
                      No users found
                    </div>
                    <div className="text-slate-500 text-lg">
                      Adjust your search criteria or add new users
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Pagination */}
            {!loading && users.length > 0 && (
              <div className="flex items-center justify-between px-8 py-6 border-t border-slate-700/30 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur">
                <div className="text-sm text-slate-400 font-medium">
                  Showing{" "}
                  <span className="text-cyan-400 font-bold">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-cyan-400 font-bold">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-cyan-400 font-bold">
                    {pagination.total}
                  </span>{" "}
                  users
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 rounded-xl px-4 py-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300 px-4 py-2 bg-gradient-to-r from-slate-700/70 to-slate-600/70 rounded-xl border border-slate-600/30 font-medium">
                      <span className="text-cyan-400 font-bold">
                        {pagination.page}
                      </span>
                      <span className="mx-2 text-slate-500">/</span>
                      <span className="text-slate-300">{pagination.pages}</span>
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="border-slate-600/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 rounded-xl px-4 py-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-700/50 text-white max-w-lg shadow-2xl rounded-3xl">
          <DialogHeader className="space-y-4 pb-6">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Plus className="h-6 w-6 text-cyan-400" />
              </div>
              Add New User
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-lg">
              Create a new user account with specified permissions and access
              levels
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Enhanced Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
                  First Name
                </label>
                <Input
                  placeholder="John"
                  value={newUserData.firstName}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      firstName: e.target.value,
                    })
                  }
                  className="bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 h-12 rounded-xl focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
                  Last Name
                </label>
                <Input
                  placeholder="Doe"
                  value={newUserData.lastName}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, lastName: e.target.value })
                  }
                  className="bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 h-12 rounded-xl focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 font-medium"
                />
              </div>
            </div>

            {/* Enhanced Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Email Address
              </label>
              <Input
                placeholder="john.doe@company.com"
                type="email"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
                className="bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 h-12 rounded-xl focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 font-medium"
              />
            </div>

            {/* Enhanced Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Input
                  placeholder="Create a secure password"
                  type={showPassword ? "text" : "password"}
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, password: e.target.value })
                  }
                  className="bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-500 h-12 rounded-xl focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 pr-12 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Role Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-300">
                User Role & Permissions
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    role: "user",
                    icon: <User className="h-4 w-4" />,
                    desc: "Standard access",
                  },
                  {
                    role: "admin",
                    icon: <Crown className="h-4 w-4" />,
                    desc: "Full control",
                  },
                  // moderator role removed
                ].map((r) => (
                  <Button
                    key={r.role}
                    variant={
                      newUserData.role === r.role ? "default" : "outline"
                    }
                    className={
                      newUserData.role === r.role
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg border-0 h-auto p-4 rounded-xl"
                        : "border-slate-600/50 bg-slate-900/30 text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300 h-auto p-4 rounded-xl"
                    }
                    onClick={() =>
                      setNewUserData({ ...newUserData, role: r.role })
                    }
                  >
                    <div className="flex flex-col items-center gap-2">
                      {r.icon}
                      <div className="text-center">
                        <div className="font-semibold">
                          {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                        </div>
                        <div className="text-xs opacity-70">{r.desc}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              onClick={handleAddUser}
              disabled={addLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 h-12 rounded-xl font-semibold border border-cyan-400/20"
            >
              {addLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating User...</span>
                </div>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Create User Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-700/50 text-white shadow-2xl rounded-3xl max-w-md">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              Delete User Account
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-lg">
              This action is permanent and cannot be undone. All user data will
              be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {selectedUser && (
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/30 to-pink-500/30 flex items-center justify-center text-red-300 font-bold text-lg border border-red-500/30">
                  {selectedUser.firstName?.charAt(0) ||
                    selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-lg text-white">
                    {selectedUser.firstName && selectedUser.lastName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.email.split("@")[0]}
                  </div>
                  <div className="text-slate-400 font-medium">
                    {selectedUser.email}
                  </div>
                  <div className="text-sm text-red-300">
                    Role:{" "}
                    {selectedUser.role.charAt(0).toUpperCase() +
                      selectedUser.role.slice(1)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 border-slate-600/50 bg-slate-900/50 text-slate-300 hover:bg-slate-700/70 hover:border-slate-500/50 transition-all duration-300 h-12 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl shadow-red-500/25 transition-all duration-300 h-12 rounded-xl font-semibold"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-2xl border-slate-700/50 text-white shadow-2xl rounded-3xl max-w-md">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
              Change User Role
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-lg">
              Modify user permissions and access level within the system
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {selectedUser && (
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-700/30 to-slate-600/30 border border-slate-600/30">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-cyan-300 font-bold text-lg border border-cyan-500/30">
                  {selectedUser.firstName?.charAt(0) ||
                    selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-lg text-white">
                    {selectedUser.firstName && selectedUser.lastName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.email.split("@")[0]}
                  </div>
                  <div className="text-slate-400 font-medium">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300">
                Select New Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    role: "user",
                    icon: <UserCheck className="h-5 w-5" />,
                    color: "from-cyan-500 to-blue-500",
                    desc: "Standard user access",
                  },
                  {
                    role: "admin",
                    icon: <Crown className="h-5 w-5" />,
                    color: "from-orange-500 to-red-500",
                    desc: "Full administrative control",
                  },
                ].map((r) => (
                  <Button
                    key={r.role}
                    variant={selectedRole === r.role ? "default" : "outline"}
                    className={
                      selectedRole === r.role
                        ? `bg-gradient-to-r ${r.color} hover:opacity-90 text-white shadow-xl border-0 h-auto p-4 rounded-2xl`
                        : "border-slate-600/50 bg-slate-900/30 text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/50 transition-all duration-300 h-auto p-4 rounded-2xl"
                    }
                    onClick={() => setSelectedRole(r.role)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      {r.icon}
                      <div className="text-center">
                        <div className="font-bold">
                          {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                        </div>
                        <div className="text-xs opacity-70">{r.desc}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              className="flex-1 border-slate-600/50 bg-slate-900/50 text-slate-300 hover:bg-slate-700/70 hover:border-slate-500/50 transition-all duration-300 h-12 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 h-12 rounded-xl font-semibold"
            >
              <Shield className="h-4 w-4 mr-2" />
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;