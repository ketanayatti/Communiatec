import { useEffect, useState, useRef } from "react";
import {
  Upload,
  File,
  Download,
  Trash2,
  FileText,
  Image,
  Archive,
  Video,
  Music,
  Code,
  Search,
  Grid,
  List,
  Filter,
  Sparkles,
  Shield,
  Database,
  Zap,
  AlertTriangle,
  X,
  Share,
  Bell,
  Users,
  Inbox,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import UserShareDialog from "@/components/vault/UserShareDialog";
import SharedFilesPanel from "@/components/vault/SharedFilesPanel";

// Enhanced Delete Confirmation Dialog
const DeleteDialog = ({ isOpen, onClose, onConfirm, fileName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-3xl rounded-2xl border border-red-500/20 shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-red-500/10 to-pink-500/10 border-b border-slate-700/50">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 border border-red-500/30"
                >
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </motion.div>

                <h2
                  id="delete-dialog-title"
                  className="text-2xl font-bold text-white text-center"
                >
                  Delete Permanently?
                </h2>
                <p
                  id="delete-dialog-desc"
                  className="text-slate-400 text-center text-sm mt-2"
                >
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-5">
              <div className="text-center mb-6">
                <p className="text-slate-300 text-sm mb-4">
                  Are you sure you want to delete this file?
                </p>
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/40 inline-flex items-center gap-3">
                  <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span
                    className="font-medium text-white truncate max-w-[200px]"
                    title={fileName}
                  >
                    {fileName}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-5 py-3.5 bg-slate-800/70 hover:bg-slate-700/60 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 relative overflow-hidden group"
                >
                  <motion.div
                    animate={{ x: [-100, 250] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                  />
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ZoroVault = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    fileId: null,
    fileName: "",
  });
  const [shareDialog, setShareDialog] = useState({
    isOpen: false,
    fileId: null,
    fileName: "",
  });
  const [sharedFilesPanel, setSharedFilesPanel] = useState(false);
  const [sharedFilesCount, setSharedFilesCount] = useState(0);
  const inputRef = useRef();

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/zoro");
      setFiles(res.data.files || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedFilesCount = async () => {
    try {
      const res = await apiClient.get("/api/zoro/shared/received");
      setSharedFilesCount(res.data.sharedFiles?.length || 0);
    } catch (err) {
      console.error("Failed to fetch shared files count:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchSharedFilesCount();

    const handleSharedFileReceived = () => {
      fetchSharedFilesCount();
      toast.info("You've received a new shared file", {
        icon: <Share className="w-4 h-4 text-indigo-400" />,
      });
    };

    const handleOpenSharedFilesPanel = () => {
      setSharedFilesPanel(true);
    };

    window.addEventListener(
      "vaultFileSharedReceived",
      handleSharedFileReceived
    );
    window.addEventListener("openSharedFilesPanel", handleOpenSharedFilesPanel);

    return () => {
      window.removeEventListener(
        "vaultFileSharedReceived",
        handleSharedFileReceived
      );
      window.removeEventListener(
        "openSharedFilesPanel",
        handleOpenSharedFilesPanel
      );
    };
  }, []);

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const formData = new FormData();
    for (const file of fileList) {
      formData.append("files", file);
    }

    try {
      setUploading(true);
      await apiClient.post("/api/zoro/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchFiles();
      toast.success(
        `${fileList.length} file${
          fileList.length > 1 ? "s" : ""
        } uploaded successfully`
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    handleUpload(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const openDeleteDialog = (id, filename) => {
    setDeleteDialog({
      isOpen: true,
      fileId: id,
      fileName: filename,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      fileId: null,
      fileName: "",
    });
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/api/zoro/${deleteDialog.fileId}`);
      setFiles(files.filter((f) => f._id !== deleteDialog.fileId));
      toast.success(`"${deleteDialog.fileName}" deleted successfully`);
      closeDeleteDialog();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
      closeDeleteDialog();
    }
  };

  const handleDownload = async (id) => {
    try {
      const fileInfoResponse = await apiClient.get(`/api/zoro/${id}/download`);
      const originalFilename = fileInfoResponse.data.filename;

      const response = await apiClient.get(`/api/zoro/${id}/download`, {
        params: { stream: "true" },
        responseType: "blob",
        headers: {
          Accept: "application/octet-stream",
        },
      });

      let filename = originalFilename;
      const contentDisposition = response.headers["content-disposition"];
      const xOriginalFilename = response.headers["x-original-filename"];

      if (xOriginalFilename) {
        filename = decodeURIComponent(xOriginalFilename);
      } else if (contentDisposition) {
        const filenameStarMatch = contentDisposition.match(
          /filename\*=UTF-8''([^;]+)/
        );
        const filenameMatch = contentDisposition.match(
          /filename="?([^"\\s;]+)"?/
        );

        if (filenameStarMatch) {
          filename = decodeURIComponent(filenameStarMatch[1]);
        } else if (filenameMatch) {
          filename = filenameMatch[1].replace(/[\"']/g, "");
        }
      }

      const contentType =
        response.headers["content-type"] ||
        fileInfoResponse.data.mimeType ||
        "application/octet-stream";

      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);

      toast.success(`Downloaded ${filename} successfully!`);
    } catch (err) {
      console.error("Download error:", err);

      try {
        const res = await apiClient.get(`/api/zoro/${id}/download`);
        const downloadUrl = res.data.url;
        const filename = res.data.filename;

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Downloaded ${filename} successfully!`);
      } catch (fallbackErr) {
        console.error("Fallback download error:", fallbackErr);
        toast.error("Download failed. Please try again.");
      }
    }
  };

  const openShareDialog = (id, filename) => {
    setShareDialog({
      isOpen: true,
      fileId: id,
      fileName: filename,
    });
  };

  const closeShareDialog = () => {
    setShareDialog({
      isOpen: false,
      fileId: null,
      fileName: "",
    });
  };

  const handleShare = async (recipientEmail, message) => {
    try {
      await apiClient.post(`/api/zoro/${shareDialog.fileId}/share`, {
        recipientEmail,
        message,
      });

      toast.success(`File shared successfully with ${recipientEmail}`);
      closeShareDialog();
    } catch (err) {
      console.error("Share failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to share file";
      toast.error(errorMessage);
      throw err;
    }
  };

  const getFileIcon = (mimeType) => {
    const iconProps = { className: "w-5 h-5" };

    if (mimeType.startsWith("image/"))
      return <Image {...iconProps} className="w-5 h-5 text-cyan-400" />;
    if (mimeType.includes("pdf"))
      return <FileText {...iconProps} className="w-5 h-5 text-red-400" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <Archive {...iconProps} className="w-5 h-5 text-orange-400" />;
    if (mimeType.startsWith("video/"))
      return <Video {...iconProps} className="w-5 h-5 text-purple-400" />;
    if (mimeType.startsWith("audio/"))
      return <Music {...iconProps} className="w-5 h-5 text-pink-400" />;
    if (
      mimeType.includes("code") ||
      mimeType.includes("javascript") ||
      mimeType.includes("html")
    )
      return <Code {...iconProps} className="w-5 h-5 text-green-400" />;
    return <File {...iconProps} className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "images" && file.mimeType.startsWith("image/")) ||
      (filterType === "documents" &&
        (file.mimeType.includes("pdf") ||
          file.mimeType.includes("document") ||
          file.mimeType.includes("presentation") ||
          file.mimeType.includes("sheet"))) ||
      (filterType === "archives" &&
        (file.mimeType.includes("zip") || file.mimeType.includes("rar")));
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center text-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 40, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 5,
            }}
            className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"
          />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10 p-8"
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30 blur-xl"
            />
            <div className="absolute inset-1 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <div
              className="absolute inset-3 rounded-full border-2 border-blue-400/20 border-r-blue-400 animate-spin"
              style={{ animationDuration: "2s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Initializing Vault
          </h2>
          <p className="text-slate-400 text-sm">
            Securing your digital assets...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5,
          }}
          className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"
        />

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[85%] w-1 h-1 bg-cyan-400 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-[35%] left-[7%] w-1.5 h-1.5 bg-blue-400 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[75%] left-[80%] w-1 h-1 bg-indigo-400 rounded-full"
        />
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div className="relative">
              <div className="absolute -top-3 left-0 w-24 h-px bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent opacity-70" />

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
                  ZoRo Vault
                </span>
              </h1>
              <p className="text-slate-400 mt-1.5">
                Advanced{" "}
                <span className="text-cyan-400 font-medium">
                  secure storage
                </span>{" "}
                for your digital assets
              </p>

              <div className="absolute -bottom-2 left-0 w-32 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70" />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl px-5 py-3 border border-slate-700/50 shadow-lg min-w-[140px]"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-xs text-slate-400 block">
                      Total Files
                    </span>
                    <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      {files.length}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl px-5 py-3 border border-slate-700/50 shadow-lg min-w-[140px]"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="text-xs text-slate-400 block">
                      Storage
                    </span>
                    <div className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                      Secure
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSharedFilesPanel(true)}
                className={`relative bg-slate-800/50 backdrop-blur-xl rounded-xl px-5 py-3 border shadow-lg transition-all duration-300 group ${
                  sharedFilesCount > 0
                    ? "border-purple-500/60 hover:border-purple-400 shadow-purple-500/20"
                    : "border-slate-700/50 hover:border-purple-500/50"
                }`}
                aria-label={`Shared files: ${sharedFilesCount} new`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Inbox
                      className={`w-5 h-5 transition-colors duration-300 ${
                        sharedFilesCount > 0
                          ? "text-purple-400"
                          : "text-purple-400/70"
                      }`}
                    />
                    {sharedFilesCount > 0 && (
                      <motion.span
                        key={sharedFilesCount}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg"
                      >
                        {sharedFilesCount > 99 ? "99+" : sharedFilesCount}
                      </motion.span>
                    )}
                    {sharedFilesCount > 0 && (
                      <motion.div
                        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-1 bg-purple-500/30 rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">
                      Shared Files
                    </span>
                    <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                      {sharedFilesCount}
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    sharedFilesCount > 0
                      ? "bg-gradient-to-r from-purple-500/15 to-pink-500/15 opacity-60 group-hover:opacity-80"
                      : "bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-50"
                  }`}
                />
              </motion.button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`relative group overflow-hidden transition-all duration-500 ${
              dragActive ? "scale-[1.03]" : "hover:scale-[1.01]"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-500 backdrop-blur-xl ${
                dragActive
                  ? "border-cyan-400 bg-slate-800/70 shadow-xl shadow-cyan-500/20"
                  : "border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/40 hover:bg-slate-800/60"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl" />

              {/* Corner accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-slate-600/40 group-hover:border-cyan-400/70 transition-colors duration-500" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-slate-600/40 group-hover:border-indigo-400/70 transition-colors duration-500" />

              <div className="text-center relative z-10">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-2xl flex items-center justify-center mb-6 border border-slate-600/40 group-hover:border-cyan-400/50 transition-all duration-500 shadow-lg group-hover:shadow-cyan-500/30 backdrop-blur-sm"
                >
                  <Upload className="w-10 h-10 text-cyan-400" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Upload Files
                </h3>
                <p className="text-slate-300 mb-6 text-sm sm:text-base max-w-md mx-auto">
                  {dragActive
                    ? "Drop files here to upload"
                    : "Drag & drop your files, or click to browse"}
                </p>

                <input
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  ref={inputRef}
                  className="hidden"
                  aria-label="Choose files to upload"
                />

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="group/btn relative inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-600 text-white px-7 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 text-base sm:text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-indigo-400/20 rounded-xl blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                  {/* Shine effect */}
                  <motion.div
                    animate={{ x: uploading ? [0, 0] : [-100, 250] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover/btn:opacity-100"
                  />

                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-cyan-300" />
                      <span>Choose Files</span>
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-center gap-5 mt-6 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full relative">
                      <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
                    </div>
                    <span>Instant Upload</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full relative">
                      <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20 delay-500" />
                    </div>
                    <span>End-to-End Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search your vault..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60 shadow-lg text-white placeholder-slate-400 transition-all duration-300 hover:bg-slate-800/70 focus:bg-slate-800/80"
              aria-label="Search files"
            />
          </div>

          <div className="flex items-center gap-3">
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3.5 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60 shadow-lg text-white cursor-pointer hover:bg-slate-800/70 transition-all duration-300 appearance-none pr-9 min-w-[120px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgb(148 163 184)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
              aria-label="Filter files by type"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
              <option value="archives">Archives</option>
            </motion.select>

            <div className="flex bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("grid")}
                className={`p-3.5 transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                className={`p-3.5 transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {filteredFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg"
            >
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
                className="relative w-24 h-24 mx-auto mb-6"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/40 flex items-center justify-center">
                  <File className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-indigo-400/5 rounded-2xl blur-xl" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Your Vault is Empty
              </h3>
              <p className="text-slate-300 max-w-md mx-auto px-4 mb-6">
                {searchTerm || filterType !== "all"
                  ? "No files match your search criteria."
                  : "Upload your first file to secure your digital assets."}
              </p>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Now
              </motion.button>
            </motion.div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative bg-slate-800/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/50 hover:border-cyan-500/60 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 overflow-hidden"
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="p-3.5 bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl border border-slate-600/40 group-hover:border-cyan-400/50 transition-all duration-300 shadow-md backdrop-blur-sm"
                      >
                        {getFileIcon(file.mimeType)}
                      </motion.div>

                      <div className="flex -space-x-1">
                        {[
                          {
                            icon: <Download className="w-4 h-4" />,
                            onClick: () => handleDownload(file._id),
                            color: "hover:text-cyan-400",
                            label: "Download",
                          },
                          {
                            icon: <Share className="w-4 h-4" />,
                            onClick: () =>
                              openShareDialog(file._id, file.filename),
                            color: "hover:text-indigo-400",
                            label: "Share",
                          },
                          {
                            icon: <Trash2 className="w-4 h-4" />,
                            onClick: () =>
                              openDeleteDialog(file._id, file.filename),
                            color: "hover:text-red-400",
                            label: "Delete",
                          },
                        ].map((btn, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={btn.onClick}
                            className={`p-2.5 text-slate-400 ${btn.color} hover:bg-slate-700/60 rounded-lg transition-all duration-200 group/btn`}
                            aria-label={btn.label}
                          >
                            {btn.icon}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3
                        className="font-semibold text-white truncate text-base group-hover:text-cyan-300 transition-colors"
                        title={file.filename}
                      >
                        {file.filename}
                      </h3>
                      <div className="mt-2 flex justify-between text-xs text-slate-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          delay: index * 0.05 + 0.3,
                          duration: 1,
                          ease: "easeOut",
                        }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/70 backdrop-blur-xl">
                    <tr>
                      <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                        <div className="flex items-center gap-2.5">
                          <File className="w-4 h-4 text-cyan-400" />
                          File
                        </div>
                      </th>
                      <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                        <div className="flex items-center gap-2.5">
                          <Database className="w-4 h-4 text-indigo-400" />
                          Size
                        </div>
                      </th>
                      <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                        <div className="flex items-center gap-2.5">
                          <Zap className="w-4 h-4 text-purple-400" />
                          Uploaded
                        </div>
                      </th>
                      <th className="text-left py-4 px-5 font-semibold text-slate-300 text-sm sm:text-base">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {filteredFiles.map((file, index) => (
                      <motion.tr
                        key={file._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                        className="hover:bg-slate-700/30 transition-colors duration-200 group"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ rotate: 5, scale: 1.05 }}
                              className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-600/40 group-hover:border-cyan-400/40 transition-all duration-300"
                            >
                              {getFileIcon(file.mimeType)}
                            </motion.div>
                            <div>
                              <div
                                className="font-medium text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-none group-hover:text-cyan-300 transition-colors"
                                title={file.filename}
                              >
                                {file.filename}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 capitalize">
                                {file.mimeType.split("/")[1]}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-medium text-cyan-400">
                            {formatFileSize(file.size)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-300 text-sm">
                          {new Date(file.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-slate-500 text-xs">
                            {new Date(file.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-wrap gap-2">
                            {[
                              {
                                label: "Download",
                                icon: <Download className="w-3.5 h-3.5" />,
                                onClick: () => handleDownload(file._id),
                                bg: "from-cyan-500/20 to-blue-500/20",
                                text: "text-cyan-400",
                                border: "border-cyan-500/40",
                                hover: "hover:border-cyan-400",
                              },
                              {
                                label: "Share",
                                icon: <Share className="w-3.5 h-3.5" />,
                                onClick: () =>
                                  openShareDialog(file._id, file.filename),
                                bg: "from-indigo-500/20 to-purple-500/20",
                                text: "text-indigo-400",
                                border: "border-indigo-500/40",
                                hover: "hover:border-indigo-400",
                              },
                              {
                                label: "Delete",
                                icon: <Trash2 className="w-3.5 h-3.5" />,
                                onClick: () =>
                                  openDeleteDialog(file._id, file.filename),
                                bg: "from-red-500/20 to-pink-500/20",
                                text: "text-red-400",
                                border: "border-red-500/40",
                                hover: "hover:border-red-400",
                              },
                            ].map((btn, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={btn.onClick}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-gradient-to-r ${btn.bg} ${btn.text} border ${btn.border} ${btn.hover} rounded-lg transition-all duration-200 backdrop-blur-sm`}
                                aria-label={`${btn.label} ${file.filename}`}
                              >
                                {btn.icon}
                                <span className="hidden sm:inline">
                                  {btn.label}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10 text-xs sm:text-sm px-2"
        >
          {[
            {
              icon: <Shield className="w-3.5 h-3.5" />,
              text: "End-to-End Encrypted",
              color: "text-cyan-400",
              bg: "from-cyan-500/10 to-blue-500/10",
              border: "border-cyan-500/30",
            },
            {
              icon: <Database className="w-3.5 h-3.5" />,
              text: "Secure Cloud Storage",
              color: "text-blue-400",
              bg: "from-blue-500/10 to-indigo-500/10",
              border: "border-blue-500/30",
            },
            {
              icon: <Zap className="w-3.5 h-3.5" />,
              text: "Lightning Fast Access",
              color: "text-indigo-400",
              bg: "from-indigo-500/10 to-purple-500/10",
              border: "border-indigo-500/30",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.08, duration: 0.4 }}
              className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r ${stat.bg} backdrop-blur rounded-lg border ${stat.border}`}
            >
              <div className={stat.color}>{stat.icon}</div>
              <span className="text-slate-300">{stat.text}</span>
            </motion.div>
          ))}

          {process.env.NODE_ENV === "development" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("vaultFileSharedReceived")
                );
                toast.success("Test notification triggered!", {
                  duration: 1500,
                });
              }}
              className="flex items-center gap-1.5 px-3.5 py-3 bg-orange-500/20 backdrop-blur rounded-lg border border-orange-500/40 text-orange-400 hover:text-orange-300 hover:border-orange-500/60 transition-colors text-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Test Notify</span>
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        fileName={deleteDialog.fileName}
      />
      <UserShareDialog
        isOpen={shareDialog.isOpen}
        onClose={closeShareDialog}
        onShare={handleShare}
        fileName={shareDialog.fileName}
      />
      <SharedFilesPanel
        isOpen={sharedFilesPanel}
        onClose={() => {
          setSharedFilesPanel(false);
          setTimeout(fetchSharedFilesCount, 300);
        }}
        onFileProcessed={fetchSharedFilesCount}
      />
    </div>
  );
};

export default ZoroVault;
