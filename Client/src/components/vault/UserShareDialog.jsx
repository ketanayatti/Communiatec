import { useState } from 'react';
import { X, Share, Send, User, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserShareDialog = ({ isOpen, onClose, onShare, fileName }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    setLoading(true);
    try {
      await onShare(recipientEmail, message);
      setRecipientEmail('');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRecipientEmail('');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-b border-slate-700/50">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Share icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/30"
              >
                <Share className="w-8 h-8 text-cyan-400" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Share File
              </h2>
              <p className="text-slate-400 text-center">
                Send "{fileName}" to another user's vault
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipient Email */}
                <div>
                  <label htmlFor="recipientEmail" className="block text-sm font-medium text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Recipient Email
                    </div>
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter recipient's email address"
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                  />
                </div>

                {/* Optional Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message for the recipient..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Info */}
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-cyan-200">
                      <p className="font-medium mb-1">File Sharing</p>
                      <p className="text-cyan-300/80">
                        The recipient will receive a notification and can choose to accept the file into their vault.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="flex-1 px-6 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-2xl font-semibold transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !recipientEmail.trim()}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Button shine effect */}
                    <motion.div
                      animate={{ x: [-100, 250] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Share File
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserShareDialog;