import { useState, useEffect } from "react";
import {
  MessageSquare,
  Server,
  Clock,
  Zap,
  Wifi,
  Globe,
  Database,
} from "lucide-react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const [tip, setTip] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const tips = [
    "Warming up the servers...",
    "Establishing secure connections...",
    "Loading your conversations...",
    "Preparing your workspace...",
    "Almost there...",
    "Just a few more moments...",
  ];

  const stages = [
    {
      icon: Database,
      text: "Connecting to database",
      color: "text-cyan-400",
    },
    { icon: Server, text: "Starting server instances", color: "text-blue-400" },
    { icon: Wifi, text: "Establishing network", color: "text-indigo-400" },
    { icon: Globe, text: "Syncing data", color: "text-purple-400" },
    { icon: MessageSquare, text: "Loading interface", color: "text-cyan-400" },
  ];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    const tipInterval = setInterval(() => {
      setTip((prev) => (prev + 1) % tips.length);
    }, 2500);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 4000);

    // Progress bar that takes 30 seconds to complete
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCycles((c) => c + 1);
          return 0;
        }
        return prev + 0.33;
      });
    }, 100);

    // Add entrance animation
    setIsVisible(true);

    return () => {
      clearInterval(dotInterval);
      clearInterval(tipInterval);
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, []);

  const CurrentStageIcon = stages[currentStage].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridPulse 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Geometric floating elements */}
      {[...Array(20)].map((_, i) => {
        const shapes = ['square', 'circle', 'triangle'];
        const colors = [
          'bg-cyan-400/10',
          'bg-blue-400/10', 
          'bg-indigo-400/10',
          'bg-purple-400/10'
        ];
        const sizes = ['w-2 h-2', 'w-3 h-3', 'w-4 h-4'];
        const shape = shapes[i % shapes.length];
        
        return (
          <div
            key={i}
            className={`absolute ${colors[i % colors.length]} ${sizes[i % sizes.length]} ${
              shape === 'circle' ? 'rounded-full' : 
              shape === 'triangle' ? 'rotate-45' : ''
            } border border-current`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `gentleFloat ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        );
      })}

      {/* Tech scan lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
          style={{
            top: '20%',
            animation: 'scanLine 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
          style={{
            top: '80%',
            animation: 'scanLine 8s ease-in-out infinite',
            animationDelay: '3s'
          }}
        />
      </div>

      {/* Main container with glassmorphism */}
      <div
        className={`max-w-md w-full bg-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 relative shadow-2xl shadow-cyan-500/5 transform transition-all duration-1000 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(148, 163, 184, 0.1)'
        }}
      >
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 p-[1px] animate-borderSpin">
          <div className="h-full w-full rounded-2xl bg-slate-900/60 backdrop-blur-xl" />
        </div>

        {/* Tech corner indicators */}
        <div className="absolute top-3 left-3 w-3 h-3 border-l-2 border-t-2 border-cyan-400/60"></div>
        <div className="absolute top-3 right-3 w-3 h-3 border-r-2 border-t-2 border-blue-400/60"></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 border-l-2 border-b-2 border-indigo-400/60"></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 border-r-2 border-b-2 border-purple-400/60"></div>

        {/* Main content */}
        <div className="relative z-10">
          {/* Central tech logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {/* Hexagonal tech frame */}
              <div className="absolute inset-0 w-20 h-20 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" className="animate-spin" style={{ animationDuration: '6s' }}>
                  <polygon 
                    points="40,5 65,22.5 65,57.5 40,75 15,57.5 15,22.5" 
                    fill="none" 
                    stroke="url(#hexGradient)" 
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                  <defs>
                    <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.6"/>
                      <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Main icon with enhanced glow */}
              <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-600/30">
                <MessageSquare
                  className="w-8 h-8 text-cyan-400"
                  style={{
                    filter: "drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))",
                    animation: "techPulse 2s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Orbiting data points */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transformOrigin: "0 0",
                    animation: `dataOrbit 5s linear infinite`,
                    animationDelay: `${i * 1.67}s`,
                    transform: `translate(-50%, -50%) rotate(${i * 120}deg) translateX(35px)`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Modern title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-3 text-white tracking-wide">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">
                CHAT
              </span>
              <span className="text-slate-300 font-thin"> SYSTEM</span>
            </h2>
            <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm font-mono">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>INITIALIZING{dots}</span>
            </div>
          </div>

          {/* Current stage with modern design */}
          <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-600/30 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="relative p-2 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg border border-slate-600/30">
                <CurrentStageIcon
                  className={`w-5 h-5 ${stages[currentStage].color}`}
                  style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
                />
                <div className="absolute inset-0 animate-ping opacity-20">
                  <CurrentStageIcon
                    className={`w-5 h-5 ${stages[currentStage].color}`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm tracking-wide">
                  {stages[currentStage].text}
                </p>
                <div className="flex space-x-1 mt-2">
                  {stages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                        i <= currentStage 
                          ? "bg-gradient-to-r from-cyan-400 to-blue-400" 
                          : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modern info cards */}
          <div className="space-y-3 mb-8">
            <div className="group cursor-default">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-lg border border-slate-600/30 backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-400/50 group-hover:bg-slate-800/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-1.5 bg-slate-700/50 rounded-md border border-slate-600/30">
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed relative z-10">
                  Our server is currently spinning up from sleep mode. This brief pause helps us optimize resources when the app isn't in use.
                </p>
              </div>
            </div>

            <div className="group cursor-default">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-lg border border-slate-600/30 backdrop-blur-sm transition-all duration-300 group-hover:border-blue-400/50 group-hover:bg-slate-800/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-1.5 bg-slate-700/50 rounded-md border border-slate-600/30">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed relative z-10">
                  {cycles === 0
                    ? "Hang tight for about 30-60 seconds while we prepare your personalized chat environment. We're working our magic!"
                    : "The server is taking longer than expected to start. Please continue waiting, we're doing our best to get you connected."}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced progress section */}
          <div className="space-y-4">
            <div className="relative">
              <div className="flex mb-4 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-slate-700/50 rounded-md border border-slate-600/30">
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 tracking-wide">
                    SYSTEM STATUS
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-light bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">
                    {Math.min(Math.round(progress), 100)}%
                  </span>
                </div>
              </div>

              {/* Professional progress bar */}
              <div className="relative h-2 bg-slate-800/60 rounded-full overflow-hidden border border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800/40 to-slate-700/40" />
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 relative overflow-hidden transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  {/* Data stream effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-dataStream" />
                </div>
                
                {/* Progress highlight */}
                <div
                  className="absolute top-0 h-full bg-gradient-to-r from-cyan-300/40 to-blue-300/40 blur-sm transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Status indicator */}
            <div className="text-center p-4 bg-slate-800/20 rounded-lg border border-slate-700/30 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1s' }}
                    />
                  ))}
                </div>
                <span className="text-slate-300 text-xs font-mono tracking-wider">
                  {tips[tip]}
                </span>
              </div>
              
              {/* Connection strength indicator */}
              <div className="flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-gradient-to-t from-slate-600 to-cyan-400 rounded-sm transition-all duration-500`}
                    style={{ 
                      height: `${8 + i * 2}px`,
                      opacity: progress > i * 20 ? 1 : 0.3,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-15px) translateX(5px);
            opacity: 0.8;
          }
        }

        @keyframes techPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.6));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 25px rgba(6, 182, 212, 0.8));
          }
        }

        @keyframes dataOrbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(35px);
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(35px);
            opacity: 1;
          }
        }

        @keyframes borderSpin {
          0% {
            background: linear-gradient(0deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          }
          33% {
            background: linear-gradient(120deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          }
          66% {
            background: linear-gradient(240deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          }
          100% {
            background: linear-gradient(360deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          }
        }

        @keyframes dataStream {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(200%);
            opacity: 0;
          }
        }

        @keyframes scanLine {
          0%, 100% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            transform: translateX(0%);
            opacity: 1;
          }
        }

        @keyframes gridPulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-dataStream {
          animation: dataStream 2s ease-in-out infinite;
        }

        .animate-borderSpin {
          animation: borderSpin 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;