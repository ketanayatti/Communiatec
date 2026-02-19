import React from 'react'
import ChatHeader from './components/chat-header'
import MessageContainer from './components/message-container'
import MessageBar from './components/message-bar'

const ChatContainer = ({ showAIChat, setShowAIChat }) => {
  return (
    <div className="flex-1 h-dvh md:h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* FUTURISTIC BACKGROUND LAYERS */}

      {/* Primary gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-right cyan glow */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />

        {/* Bottom-left indigo glow */}
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />

        {/* Center floating orb */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/8 via-cyan-500/8 to-indigo-500/8 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "1s" }}
        />
      </div>

      {/* Subtle tech grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
          radial-gradient(circle at 25px 25px, rgb(6 182 212) 2px, transparent 0),
          radial-gradient(circle at 75px 75px, rgb(99 102 241) 2px, transparent 0)
        `,
          backgroundSize: "100px 100px",
          backgroundPosition: "0 0, 50px 50px",
        }}
      />

      {/* Subtle scanline effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: `
          linear-gradient(90deg, transparent 98%, rgba(6, 182, 212, 0.3) 100%)
        `,
          backgroundSize: "4px 4px",
          animation: "scan 20s linear infinite",
        }}
      />

      {/* Subtle animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-${i % 3} ${
                8 + Math.random() * 6
              }s linear infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Central vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-slate-950/20 pointer-events-none" />

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-b from-slate-900/5 via-transparent to-slate-950/10" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative flex flex-col h-full z-10">
        {/* Subtle top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        {/* Chat components with enhanced spacing */}
        <div className="flex flex-col h-full">
          <ChatHeader />
          <MessageContainer />
          <MessageBar showAIChat={showAIChat} setShowAIChat={setShowAIChat} />
        </div>

        {/* Subtle bottom border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-100px) translateX(50px) rotate(180deg); opacity: 1; }
          90% { opacity: 1; }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateY(-120px) translateX(-30px) rotate(-180deg); opacity: 1; }
          85% { opacity: 1; }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(-80px) translateX(20px) rotate(90deg); opacity: 1; }
          80% { opacity: 1; }
        }
        
        .bg-radial-gradient {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default ChatContainer;