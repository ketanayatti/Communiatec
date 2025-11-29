import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Coffee,
  Timer,
  User,
  Send,
  X,
  Clock,
  Users,
  Zap,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBaseUrl } from "@/lib/apiClient";

const CoffeeBreak = () => {
  const { userInfo } = useStore();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [preferences, setPreferences] = useState({
    duration: 5,
    anonymous: false,
  });

  const socket = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [totalDuration, setTotalDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (userInfo && !socket.current) {
      const SOCKET_URL = getBaseUrl();
      socket.current = io(`${SOCKET_URL}/coffee-break`, {
        query: {
          userId: userInfo._id,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          image: userInfo.image,
        },
      });

      socket.current.on("match-found", (data) => {
        setIsWaiting(false);
        setIsMatched(true);
        setPartner(data.partner);
        setRoomId(data.roomId);
        setTimeLeft(data.duration * 60);
        setTotalDuration(data.duration * 60);
        toast.success("Match found! Starting coffee break chat.");
      });

      socket.current.on("waiting-for-match", () => {
        toast.info("Waiting for a match...");
      });

      socket.current.on("receive-message", (data) => {
        setMessages((prev) => [...prev, { ...data, received: true }]);
      });

      socket.current.on("partner-left", () => {
        toast.error("Your chat partner has left the session");
        handleEndSession();
      });

      socket.current.on("session-ended", () => {
        toast.info("Coffee break session ended");
        handleEndSession();
      });

      // Notify existing users when someone else joins the room
      socket.current.on("new-participant", () => {
        setPartner({ group: true });
        toast.info("A new participant joined the coffee break.");
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [userInfo]);

  useEffect(() => {
    let interval;
    if (isMatched && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMatched, timeLeft]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartCoffeeBreak = () => {
    setIsWaiting(true);
    socket.current.emit("join-waiting-room", { preferences });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && roomId) {
      const messageData = {
        roomId,
        message: inputMessage.trim(),
        timestamp: Date.now(),
      };
      socket.current.emit("send-message", messageData);
      setMessages((prev) => [...prev, { ...messageData, received: false }]);
      setInputMessage("");
    }
  };

  const handleEndSession = () => {
    if (roomId) {
      socket.current.emit("leave-session", { roomId });
    }
    setIsMatched(false);
    setPartner(null);
    setRoomId(null);
    setMessages([]);
    setTimeLeft(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-cyan-400/60 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400/60 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-ping delay-1500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!isWaiting && !isMatched ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
              className="w-full max-w-lg"
            >
              <Card className="bg-gradient-to-br from-slate-900/80 to-blue-900/40 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 rounded-3xl overflow-hidden relative">
                {/* Animated Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-slate-900/95 to-blue-900/50 rounded-3xl m-0.5">
                  <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                      <motion.div
                        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-2xl mb-4 relative"
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(6,182,212,0.3)",
                            "0 0 40px rgba(59,130,246,0.4)",
                            "0 0 20px rgba(6,182,212,0.3)",
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Coffee className="w-12 h-12 text-cyan-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                      </motion.div>
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-transparent bg-clip-text">
                        ConnectCafe
                      </h2>
                      <p className="text-slate-300 text-lg font-medium">
                        AI-Powered Professional Networking
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-cyan-400/80">
                        <Zap className="w-3 h-3" />
                        <span>Intelligent Matching • Real-time Sync</span>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-6">
                      {/* Duration Slider */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-cyan-400" />
                          </div>
                          <label className="text-lg font-semibold text-slate-200">
                            Session Duration
                          </label>
                        </div>
                        <div className="px-4 py-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                          <Slider
                            value={[preferences.duration]}
                            onValueChange={([value]) =>
                              setPreferences((prev) => ({
                                ...prev,
                                duration: value,
                              }))
                            }
                            min={3}
                            max={15}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex items-center justify-between text-sm text-slate-400 mt-3">
                            <span>3 min</span>
                            <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm rounded-full shadow-lg">
                              {preferences.duration} min
                            </div>
                            <span>15 min</span>
                          </div>
                        </div>
                      </div>

                      {/* Anonymous Mode Toggle */}
                      <div className="p-4 bg-gradient-to-r from-slate-800/50 to-blue-900/30 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg">
                              <Shield className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <label className="text-lg font-semibold text-slate-200 block">
                                Privacy Mode
                              </label>
                              <p className="text-sm text-slate-400">
                                Anonymous professional networking
                              </p>
                            </div>
                          </div>
                          <Switch
                            id="anonymous-mode"
                            checked={preferences.anonymous}
                            onCheckedChange={(checked) =>
                              setPreferences((prev) => ({
                                ...prev,
                                anonymous: checked,
                              }))
                            }
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Start Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 shadow-xl shadow-cyan-500/25 transition-all duration-500 hover:shadow-cyan-500/40 rounded-2xl border border-cyan-400/20 relative overflow-hidden group"
                        onClick={handleStartCoffeeBreak}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Coffee className="w-6 h-6 mr-3 relative z-10" />
                        <span className="relative z-10">
                          Initialize Connection
                        </span>
                        <Zap className="w-5 h-5 ml-3 relative z-10" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : isWaiting ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-full max-w-lg"
            >
              <Card className="bg-gradient-to-br from-slate-900/80 to-blue-900/40 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 rounded-3xl">
                <div className="p-8 text-center space-y-8">
                  {/* Animated Loading Icon */}
                  <div className="relative">
                    <motion.div
                      className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl"
                      animate={{
                        boxShadow: [
                          "0 0 30px rgba(6,182,212,0.4)",
                          "0 0 50px rgba(59,130,246,0.6)",
                          "0 0 30px rgba(6,182,212,0.4)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Coffee className="w-14 h-14 text-cyan-400" />
                    </motion.div>

                    {/* Multiple Rotating Rings */}
                    <motion.div
                      className="absolute inset-0 w-28 h-28 mx-auto border-4 border-transparent border-t-cyan-400 border-r-blue-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    ></motion.div>
                    <motion.div
                      className="absolute inset-2 w-24 h-24 mx-auto border-2 border-transparent border-b-indigo-400 border-l-purple-400 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    ></motion.div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
                      Quantum Matching
                    </h3>
                    <p className="text-slate-300 text-lg">
                      AI algorithms finding your perfect conversation partner
                    </p>

                    {/* Enhanced Loading Animation */}
                    <div className="flex items-center justify-center gap-3 py-4">
                      <motion.div
                        className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      ></motion.div>
                      <motion.div
                        className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.3,
                        }}
                      ></motion.div>
                      <motion.div
                        className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.6,
                        }}
                      ></motion.div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-red-400 hover:text-red-300 transition-all duration-300 rounded-xl h-12"
                    onClick={() => {
                      setIsWaiting(false);
                      socket.current.disconnect();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Abort Connection
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
              className="w-full max-w-4xl"
            >
              <Card className="bg-gradient-to-br from-slate-900/90 to-blue-900/50 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 rounded-3xl overflow-hidden relative">
                {/* Animated Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-sm animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-slate-900/95 to-blue-900/60 rounded-3xl m-0.5">
                  {/* Chat Header */}
                  <div className="p-6 border-b border-cyan-500/20 bg-gradient-to-r from-slate-800/80 via-blue-900/60 to-indigo-900/40 relative">
                    {/* Header Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
                    <div className="relative flex items-center justify-between">
                      {/* Partner Info */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {partner?.group ? (
                            <div className="w-14 h-14 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
                              <Users className="w-7 h-7 text-cyan-400" />
                            </div>
                          ) : partner?.anonymous ? (
                            <div className="w-14 h-14 bg-gradient-to-r from-slate-600/30 to-slate-700/30 rounded-2xl flex items-center justify-center border border-slate-500/30">
                              <User className="w-7 h-7 text-slate-400" />
                            </div>
                          ) : (
                            <div className="relative">
                              <img
                                src={partner.image}
                                alt={`${partner.firstName}'s avatar`}
                                className="w-14 h-14 rounded-2xl border-2 border-cyan-400/50 shadow-lg"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl"></div>
                            </div>
                          )}
                          <motion.div
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full border-2 border-slate-800 shadow-lg"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          ></motion.div>
                        </div>
                        <div>
                          <h3 className="font-bold text-2xl bg-gradient-to-r from-white to-slate-200 text-transparent bg-clip-text">
                            {partner?.group
                              ? "Group Session"
                              : partner?.anonymous
                              ? "Anonymous Professional"
                              : `${partner.firstName} ${partner.lastName}`}
                          </h3>
                          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span>Connected • Professional Mode</span>
                          </div>
                        </div>
                      </div>

                      {/* Timer and Controls */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="w-48 h-3 bg-slate-700/50 rounded-full overflow-hidden mb-3 border border-slate-600/50">
                            <motion.div
                              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 h-full rounded-full shadow-lg"
                              initial={{ width: "0%" }}
                              animate={{
                                width: totalDuration
                                  ? `${
                                      ((totalDuration - timeLeft) /
                                        totalDuration) *
                                      100
                                    }%`
                                  : "0%",
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Timer className="w-4 h-4 text-cyan-400" />
                            <span className="font-mono text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleEndSession}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-xl w-10 h-10"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div
                    ref={messageContainerRef}
                    className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/20 to-blue-900/20 relative"
                  >
                    {/* Message Pattern Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(6,182,212,0.05)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>

                    <div className="relative z-10">
                      <AnimatePresence>
                        {messages.map((msg, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className={`flex ${
                              msg.received ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] px-5 py-4 rounded-2xl relative ${
                                msg.received
                                  ? "bg-gradient-to-br from-slate-700/60 to-slate-800/80 text-slate-200 rounded-bl-md border border-slate-600/30 shadow-lg"
                                  : "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white rounded-br-md shadow-xl shadow-cyan-500/20 border border-cyan-400/30"
                              }`}
                            >
                              {!msg.received && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
                              )}
                              <p className="text-lg leading-relaxed relative z-10 font-medium">
                                {msg.message}
                              </p>
                              <span className="text-xs opacity-70 mt-2 block relative z-10">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {messages.length === 0 && (
                        <motion.div
                          className="text-center py-20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6">
                            <Coffee className="w-10 h-10 text-cyan-400" />
                          </div>
                          <p className="text-slate-400 text-xl font-medium">
                            Ready to connect! Start the conversation ☕
                          </p>
                          <p className="text-slate-500 text-sm mt-2">
                            Professional networking made simple
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-cyan-500/20 bg-gradient-to-r from-slate-800/60 to-blue-900/40">
                    <div className="flex gap-4">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-slate-900/60 border-slate-600/50 text-white placeholder:text-slate-400 h-14 rounded-2xl focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300 text-lg px-6 shadow-inner"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage(e)
                        }
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim()}
                          className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-300 border border-cyan-400/20"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoffeeBreak;
