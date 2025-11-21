import { useState, useEffect } from 'react';
import { Share, Check, X, File, User, Clock, Download, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';

const SharedFilesPanel = ({ isOpen, onClose, onFileProcessed }) => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/zoro/shared/received');
      
      // Filter out any malformed shared files that don't have originalFile data
      const allSharedFiles = response.data.sharedFiles || [];
      const validSharedFiles = allSharedFiles.filter(
        sharedFile => 
          sharedFile && 
          sharedFile.originalFile && 
          sharedFile._id &&
          sharedFile.owner
      );
      
      // Log if any files were filtered out for debugging
      const filteredCount = allSharedFiles.length - validSharedFiles.length;
      if (filteredCount > 0) {
        console.warn(`⚠️ Filtered out ${filteredCount} invalid shared files`);
      }
      
      setSharedFiles(validSharedFiles);
    } catch (error) {
      console.error('Error fetching shared files:', error);
      toast.error('Failed to load shared files');
      setSharedFiles([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSharedFiles();
    }
  }, [isOpen]);

  const handleAccept = async (sharedFileId) => {
    try {
      setProcessing(sharedFileId);
      const response = await apiClient.post(`/api/zoro/shared/${sharedFileId}/accept`);
      
      toast.success('File accepted and added to your vault!');
      
      // Remove from shared files list
      setSharedFiles(prev => prev.filter(sf => sf._id !== sharedFileId));
      
      // Notify parent component to update count
      if (onFileProcessed) {
        onFileProcessed();
      }
    } catch (error) {
      console.error('Error accepting file:', error);
      toast.error(error.response?.data?.message || 'Failed to accept file');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (sharedFileId) => {
    try {
      setProcessing(sharedFileId);
      await apiClient.post(`/api/zoro/shared/${sharedFileId}/decline`);
      
      toast.success('File declined');
      
      // Remove from shared files list
      setSharedFiles(prev => prev.filter(sf => sf._id !== sharedFileId));
      
      // Notify parent component to update count
      if (onFileProcessed) {
        onFileProcessed();
      }
    } catch (error) {
      console.error('Error declining file:', error);
      toast.error(error.response?.data?.message || 'Failed to decline file');
    } finally {
      setProcessing(null);
    }
  };

  const getFileIcon = (mimeType) => {
    const iconProps = { className: "w-5 h-5" };
    
    // Handle case where mimeType is null or undefined
    if (!mimeType) return <File {...iconProps} className="w-5 h-5 text-slate-400" />;
    
    if (mimeType.startsWith('image/')) return <File {...iconProps} className="w-5 h-5 text-cyan-400" />;
    if (mimeType.includes('pdf')) return <File {...iconProps} className="w-5 h-5 text-red-400" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <File {...iconProps} className="w-5 h-5 text-orange-400" />;
    if (mimeType.startsWith('video/')) return <File {...iconProps} className="w-5 h-5 text-purple-400" />;
    if (mimeType.startsWith('audio/')) return <File {...iconProps} className="w-5 h-5 text-pink-400" />;
    return <File {...iconProps} className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-b border-slate-700/50 flex-shrink-0">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Share icon */}
              <div className="flex items-center justify-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30"
                >
                  <Share className="w-8 h-8 text-indigo-400" />
                </motion.div>
                
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Shared Files
                  </h2>
                  <p className="text-slate-400 text-lg">
                    Files shared with you by other users
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading shared files...</p>
                  </div>
                </div>
              ) : sharedFiles.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-600/30"
                    >
                      <Share className="w-10 h-10 text-slate-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                      No Shared Files
                    </h3>
                    <p className="text-slate-400">
                      You don't have any pending file shares
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 overflow-y-auto max-h-full">
                  <div className="space-y-4">
                    {sharedFiles.filter(sharedFile => 
                      sharedFile && 
                      sharedFile._id && 
                      sharedFile.originalFile && 
                      sharedFile.owner
                    ).map((sharedFile, index) => (
                      <motion.div
                        key={sharedFile._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-indigo-500/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-6">
                          {/* File Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-600/30">
                              {getFileIcon(sharedFile.originalFile?.mimeType)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-white truncate mb-2">
                                {sharedFile.originalFile?.filename || 'Unknown File'}
                              </h3>
                              
                              <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>
                                    From: {sharedFile.owner?.firstName && sharedFile.owner?.lastName 
                                      ? `${sharedFile.owner.firstName} ${sharedFile.owner.lastName}`
                                      : sharedFile.owner?.email || 'Unknown User'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Download className="w-4 h-4" />
                                  <span>{formatFileSize(sharedFile.originalFile?.size || 0)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(sharedFile.sharedAt)}</span>
                                </div>
                              </div>
                              
                              {sharedFile.message && (
                                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-600/30">
                                  <div className="flex items-start gap-2">
                                    <MessageCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">{sharedFile.message}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAccept(sharedFile._id)}
                              disabled={processing === sharedFile._id}
                              className="inline-flex items-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 hover:border-green-400/50 rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processing === sharedFile._id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full mr-2"
                                />
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Accept
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDecline(sharedFile._id)}
                              disabled={processing === sharedFile._id}
                              className="inline-flex items-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 hover:border-red-400/50 rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {sharedFiles.length > 0 ? (
                    `${sharedFiles.length} file${sharedFiles.length === 1 ? '' : 's'} pending`
                  ) : (
                    'No pending files'
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharedFilesPanel;