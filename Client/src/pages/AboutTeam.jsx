import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code,
  Users,
  Target,
  Zap,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  ChevronRight,
  Sparkles,
  Rocket,
  Brain,
  Heart,
  Star,
  Trophy,
  Globe,
  Github,
  Linkedin,
  Coffee,
  Lightbulb,
  Database,
  Server,
  TestTube,
  Cloud,
  Monitor,
  Palette,
  ArrowRight,
  Play,
  TrendingUp,
  Shield,
  Layers,
  BarChart3,
  Cpu,
  Workflow,
  User,
  X,
  MessageSquare,
  GitBranch,
  Share2,
  Command,
  Activity,
  ExternalLink,
  Codepen,
  Link,
} from "lucide-react";

const teamMembers = [
  {
    name: "Kethan R Ayatti",
    role: "Project Manager",
    subtitle: "Full-Stack Developer",
    description:
      "Orchestrates project excellence while crafting seamless user experiences with modern development practices.",
    image:
      "https://res.cloudinary.com/datfhmdzv/image/upload/profile-images/6846a64863f03272880b2477.jpg",
    color: "blue",
    details: {
      skills: [
        "Project Management",
        "React-Vite",
        "API Integration",
        "UI/UX Design",
      ],
      experience: "3+ Years",
      location: "Hubballi, Karnataka",
      achievements: [
        "Led 5+ successful projects",
        "Certified Scrum Master",
        "UI/UX Excellence Award",
      ],
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      stats: {
        commits: "380+",
        projects: "8",
        contributions: "95%",
      },
      quote: "Design is not just what it looks like; it's how it works.",
    },
  },
  {
    name: "Rohit J",
    role: "Backend Engineer",
    subtitle: "Database Administrator",
    description:
      "Architects scalable server infrastructure and optimizes database performance for enterprise applications.",
    image:
      "https://res.cloudinary.com/datfhmdzv/image/upload/profile-images/6847ab6263f03272880b25fc.jpg",
    color: "emerald",
    details: {
      skills: ["Node.js", "Express.js", "MongoDB", "Socket.io"],
      experience: "3+ Years",
      location: "Bijapura, Karnataka",
      achievements: [
        "Built 10+ RESTful APIs",
        "Database Performance Expert",
        "Real-time Systems Specialist",
      ],
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      stats: {
        commits: "450+",
        projects: "12",
        contributions: "90%",
      },
      quote: "Great systems are built on solid foundations.",
    },
  },
  {
    name: "Annapurneshwari Mallesh",
    role: "Business Analyst",
    subtitle: "QA Engineer",
    description:
      "Bridges business requirements with technical implementation through comprehensive testing strategies.",
    image:
      "https://res.cloudinary.com/datfhmdzv/image/upload/profile-images/6814e57d70694c83baa5f74b.jpg",
    color: "purple",
    details: {
      skills: [
        "Testing Automation",
        "Business Analysis",
        "QA Strategies",
        "Documentation",
      ],
      experience: "2+ Years",
      location: "Belgavi, Karnataka",
      achievements: [
        "99% Bug Detection Rate",
        "Process Optimization Expert",
        "Agile Testing Certified",
      ],
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      stats: {
        commits: "280+",
        projects: "7",
        contributions: "92%",
      },
      quote: "Quality is not an act, it is a habit.",
    },
  },
  {
    name: "Sangamesh Hugar",
    role: "DevOps Engineer",
    subtitle: "Cloud Architect",
    description:
      "Streamlines deployment pipelines and ensures robust automation for continuous delivery.",
    image:
      "https://res.cloudinary.com/datfhmdzv/image/upload/WhatsApp_Image_2025-08-20_at_18.50.28_844537af_cj3ljq.jpg",
    color: "orange",
    details: {
      skills: ["Render", "Vercel", "CI/CD", "Cloud Services"],
      experience: "2+ Years",
      location: "Hubballi, Karnataka",
      achievements: [
        "Zero-downtime Deployments",
        "Infrastructure as Code Expert",
        "Cloud Cost Optimizer",
      ],
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
      stats: {
        commits: "320+",
        projects: "9",
        contributions: "88%",
      },
      quote: "Automate everything that can be automated.",
    },
  },
];

const colorVariants = {
  blue: {
    primary: "from-blue-600 to-blue-800",
    secondary: "from-blue-400 to-blue-600",
    accent: "bg-blue-500/20",
    border: "border-blue-400/30",
    text: "text-blue-400",
    glow: "shadow-blue-500/50",
    light: "bg-blue-500/10",
    lightglow: "from-blue-400/5 to-blue-600/20",
    lightText: "text-blue-500",
  },
  emerald: {
    primary: "from-emerald-600 to-emerald-800",
    secondary: "from-emerald-400 to-emerald-600",
    accent: "bg-emerald-500/20",
    border: "border-emerald-400/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/50",
    light: "bg-emerald-500/10",
    lightglow: "from-emerald-400/5 to-emerald-600/20",
    lightText: "text-emerald-500",
  },
  purple: {
    primary: "from-purple-600 to-purple-800",
    secondary: "from-purple-400 to-purple-600",
    accent: "bg-purple-500/20",
    border: "border-purple-400/30",
    text: "text-purple-400",
    glow: "shadow-purple-500/50",
    light: "bg-purple-500/10",
    lightglow: "from-purple-400/5 to-purple-600/20",
    lightText: "text-purple-500",
  },
  orange: {
    primary: "from-orange-600 to-orange-800",
    secondary: "from-orange-400 to-orange-600",
    accent: "bg-orange-500/20",
    border: "border-orange-400/30",
    text: "text-orange-400",
    glow: "shadow-orange-500/50",
    light: "bg-orange-500/10",
    lightglow: "from-orange-400/5 to-orange-600/20",
    lightText: "text-orange-500",
  },
};

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }}
        />
      ))}

      {/* Add some larger glowing particles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`glow-${i}`}
          className="absolute rounded-full blur-md animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${3 + Math.random() * 6}px`,
            height: `${3 + Math.random() * 6}px`,
            background: `rgba(${Math.floor(
              Math.random() * 100 + 155
            )}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(
              Math.random() * 255
            )}, 0.3)`,
            boxShadow: `0 0 10px rgba(${Math.floor(
              Math.random() * 100 + 155
            )}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(
              Math.random() * 255
            )}, 0.5)`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
};

// Code Matrix Animation Background
const CodeMatrixBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={`code-${i}`}
          className="absolute text-green-400 font-mono text-xs whitespace-nowrap animate-float-down"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 20}s`,
            transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
          }}
        >
          {Array(Math.floor(Math.random() * 20 + 10))
            .fill(0)
            .map(() => String.fromCharCode(Math.floor(Math.random() * 55) + 65))
            .join("")}
        </div>
      ))}
    </div>
  );
};

// Cybernetic Circuit Lines
const CyberneticCircuits = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <div
          key={`circuit-${i}`}
          className="absolute bg-gradient-to-r from-blue-500/50 to-blue-500/0"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${100 + Math.random() * 200}px`,
            height: "1px",
            transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
          }}
        >
          <div
            className="absolute h-2 w-2 rounded-full bg-blue-500 animate-ping"
            style={{
              left: `${Math.floor(Math.random() * 80)}%`,
              top: "-2px",
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: "2s",
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Add custom styles for dramatic 3D effects
const customStyles = `
  @keyframes scaleIn {
    0% { 
      transform: scale(0.8) rotateY(-15deg); 
      opacity: 0; 
    }
    100% { 
      transform: scale(1) rotateY(0deg); 
      opacity: 1; 
    }
  }
  
  @keyframes photoZoom {
    0% { 
      transform: scale(0.3) rotate(-5deg); 
      opacity: 0; 
      filter: blur(10px);
    }
    50% {
      transform: scale(1.1) rotate(2deg);
      filter: blur(2px);
    }
    100% { 
      transform: scale(1) rotate(0deg); 
      opacity: 1; 
      filter: blur(0px);
    }
  }
  
  @keyframes slideInBottom {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeInUp {
    0% {
      transform: translateY(50px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes float-down {
    0% {
      transform: translateY(-100px);
      opacity: 0;
    }
    10% {
      opacity: 0.5;
    }
    90% {
      opacity: 0.5;
    }
    100% {
      transform: translateY(1500px);
      opacity: 0;
    }
  }
  
  .animate-scale-in {
    animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation-fill-mode: both;
  }
  
  .animate-photo-zoom {
    animation: photoZoom 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .animate-slide-in-bottom {
    animation: slideInBottom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 1s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation-delay: 0.8s;
    animation-fill-mode: both;
  }
  
  .blur-xs {
    filter: blur(1px);
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-gpu {
    transform: translate3d(0, 0, 0);
  }
  
  @keyframes floatAround {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    25% {
      transform: translateY(-20px) rotate(5deg);
    }
    50% {
      transform: translateY(-10px) rotate(-3deg);
    }
    75% {
      transform: translateY(-25px) rotate(2deg);
    }
  }
  
  @keyframes driftSideways {
    0%, 100% {
      transform: translateX(0px) rotate(0deg);
    }
    33% {
      transform: translateX(15px) rotate(3deg);
    }
    66% {
      transform: translateX(-10px) rotate(-2deg);
    }
  }
  
  .animate-float-around {
    animation: floatAround 8s ease-in-out infinite;
  }
  
  .animate-drift-sideways {
    animation: driftSideways 6s ease-in-out infinite;
  }
  
  @keyframes glowPulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
  
  .animate-glow-pulse {
    animation: glowPulse 3s ease-in-out infinite;
  }
  
  @keyframes borderFlow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .animate-border-flow {
    background-size: 200% 200%;
    animation: borderFlow 3s ease infinite;
  }
  
  /* Cool new technology-inspired grid effect */
  .tech-grid {
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  /* Futuristic glass effect */
  .glass-effect {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  }
  
  /* Radar pulse animation */
  @keyframes radarPulse {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    25% {
      opacity: 0.7;
    }
    100% {
      transform: scale(1.7);
      opacity: 0;
    }
  }
  
  .radar-pulse {
    animation: radarPulse 3s ease-out infinite;
  }
  
  /* Terminal typing animation */
  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }
  
  .terminal-typing {
    overflow: hidden;
    white-space: nowrap;
    animation: typing 3.5s steps(40, end);
  }
  
  /* Advanced 3D card tilt */
  .tilt-card {
    transition: transform 0.5s ease-out;
  }
  .tilt-card:hover {
    transform: perspective(1000px) rotateX(5deg) rotateY(10deg) scale(1.05);
    box-shadow: 
      -5px 5px 20px rgba(0,0,0,0.1),
      -10px 10px 30px rgba(0,0,0,0.1);
  }
`;

const AboutTeam = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState("team");
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeMemberStats, setActiveMemberStats] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    if (heroRef.current) {
      heroRef.current.addEventListener("mousemove", handleMouseMove);
      return () =>
        heroRef.current?.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const handleHoverMemberStats = (member) => {
    setActiveMemberStats(member);
  };

  const handleLeaveMemberStats = () => {
    setActiveMemberStats(null);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-100 overflow-hidden">
      {/* Inject Custom Styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-orange-600/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Advanced Tech Backgrounds */}
      <CodeMatrixBackground />
      <CyberneticCircuits />

      {/* Animated Grid Background */}
      <div
        className="absolute inset-0 tech-grid opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at ${
            mousePosition.x * 100
          }% ${
            mousePosition.y * 100
          }%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Professional Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Geometric Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Professional Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 mb-8 hover:border-white/20 transition-all duration-300">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-200">
              Communiatec Team
            </span>
          </div>

          {/* Main Title with Text Animation */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Building the Future of
            <div className="overflow-hidden h-20 md:h-28 mt-2">
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent terminal-typing">
                Tech Communities
              </span>
            </div>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            We're a passionate team of BCA students transforming how developers
            connect, collaborate, and grow together through{" "}
            <span className="font-semibold text-blue-400">Communiatec</span>.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab("team")}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 transition-all duration-300 shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/30 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Meet Our Team</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab("vision")}
              className="group px-8 py-4 bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-white/30 rounded-xl font-semibold text-white hover:bg-slate-700/80 transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>Our Vision</span>
              </div>
            </button>
          </div>
        </div>

        {/* Floating Tech Icons */}
        <div className="absolute left-10 top-1/3 opacity-20 animate-float-around">
          <Code className="w-12 h-12 text-blue-300" />
        </div>
        <div className="absolute right-10 top-1/2 opacity-20 animate-drift-sideways">
          <Server className="w-10 h-10 text-purple-300" />
        </div>
        <div className="absolute left-1/4 bottom-1/4 opacity-20 animate-pulse">
          <Database className="w-8 h-8 text-emerald-300" />
        </div>
        <div className="absolute right-1/4 bottom-1/3 opacity-20 animate-drift-sideways">
          <Cloud className="w-14 h-14 text-blue-300" />
        </div>
      </section>

      {/* Ultra Modern Navigation */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex bg-white/5 rounded-2xl p-1 m-4 backdrop-blur-xl border border-white/10 shadow-lg">
              {[
                { id: "team", label: "Our Team", icon: Users },
                { id: "journey", label: "Journey", icon: Rocket },
                { id: "vision", label: "Vision", icon: Target },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Professional 3D Team Cards with Real-time Stats Display */}
      {activeTab === "team" && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Team Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Meet the Talent Behind Communiatec
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our diverse team of skilled professionals brings passion and
                expertise to create the perfect platform
              </p>
            </div>

            {/* Live Stats Bar - Shows when hovering over member cards */}
            {activeMemberStats && (
              <div className="fixed bottom-8 left-0 right-0 mx-auto w-full max-w-2xl z-30 animate-fade-in-up">
                <div className="glass-effect rounded-2xl p-4 border border-white/20 shadow-2xl">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">
                        {activeMemberStats.details.stats.commits}
                      </div>
                      <div className="text-sm text-gray-400">Commits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">
                        {activeMemberStats.details.stats.projects}
                      </div>
                      <div className="text-sm text-gray-400">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {activeMemberStats.details.stats.contributions}
                      </div>
                      <div className="text-sm text-gray-400">Contributions</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, idx) => {
                const colors = colorVariants[member.color];

                return (
                  <div
                    key={idx}
                    id={`member-${idx}`}
                    data-animate
                    className={`transform transition-all duration-700 ${
                      isVisible[`member-${idx}`]
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                    style={{ transitionDelay: `${idx * 150}ms` }}
                    onMouseEnter={() => handleHoverMemberStats(member)}
                    onMouseLeave={handleLeaveMemberStats}
                  >
                    {/* 3D Professional Card */}
                    <div
                      className="group relative cursor-pointer perspective-1000 tilt-card"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div
                        className={`relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:shadow-2xl ${colors.glow} hover:border-white/20 transform-gpu hover:-translate-y-2`}
                      >
                        {/* Top Accent Bar with Animation */}
                        <div
                          className={`h-1 bg-gradient-to-r ${colors.primary} relative animate-border-flow`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 relative">
                          {/* Professional Avatar with Advanced Effects */}
                          <div className="relative mb-6 flex justify-center">
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${colors.secondary} rounded-full blur-xl opacity-20 scale-150 group-hover:opacity-40 transition-opacity duration-500 animate-glow-pulse`}
                            ></div>

                            {/* Radar Pulse Effect */}
                            <div
                              className={`absolute inset-0 rounded-full ${colors.accent} opacity-30 radar-pulse`}
                            ></div>

                            <Avatar className="relative h-24 w-24 ring-4 ring-white/10 group-hover:ring-white/20 transition-all duration-300 shadow-xl">
                              <AvatarImage
                                src={member.image}
                                alt={member.name}
                                className="object-cover"
                              />
                              <AvatarFallback
                                className={`text-2xl font-bold ${colors.light} ${colors.text}`}
                              >
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>

                            {/* Status Indicator with Pulse */}
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-slate-800 rounded-full animate-pulse">
                              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-70"></div>
                            </div>
                          </div>

                          {/* Member Information */}
                          <div className="text-center space-y-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">
                              {member.name}
                            </h3>

                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.light} border ${colors.border}`}
                            >
                              <span
                                className={`font-semibold text-sm ${colors.text}`}
                              >
                                {member.role}
                              </span>
                            </div>

                            <p className="text-gray-400 text-sm">
                              {member.subtitle}
                            </p>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {member.description}
                            </p>

                            {/* Tech Stack Icons */}
                            <div className="flex justify-center gap-2 mt-4">
                              {member.details.skills
                                .slice(0, 3)
                                .map((skill, i) => (
                                  <div
                                    key={i}
                                    className={`w-8 h-8 ${colors.light} rounded-lg flex items-center justify-center group-hover:scale-110 transition-all`}
                                  >
                                    {skill.includes("React") ? (
                                      <Code
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : skill.includes("Node") ? (
                                      <Server
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : skill.includes("Mongo") ? (
                                      <Database
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : skill.includes("API") ? (
                                      <Link
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : skill.includes("UI") ? (
                                      <Palette
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : skill.includes("Project") ? (
                                      <Workflow
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : skill.includes("Testing") ? (
                                      <TestTube
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    ) : (
                                      <Zap
                                        className={`w-4 h-4 ${colors.text}`}
                                      />
                                    )}
                                  </div>
                                ))}
                              {member.details.skills.length > 3 && (
                                <div
                                  className={`w-8 h-8 ${colors.light} rounded-lg flex items-center justify-center`}
                                >
                                  <span
                                    className={`text-xs font-bold ${colors.text}`}
                                  >
                                    +{member.details.skills.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Experience & Location */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Briefcase className="w-3 h-3" />
                                <span>{member.details.experience}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span>
                                  {member.details.location.split(",")[0]}
                                </span>
                              </div>
                            </div>

                            {/* View Profile with Improved Effect */}
                            <div
                              className={`flex items-center justify-center gap-2 ${colors.text} group-hover:gap-3 transition-all pt-3`}
                            >
                              <span className="text-sm font-medium">
                                View Details
                              </span>
                              <ChevronRight className="w-4 h-4 group-hover:animate-pulse" />
                            </div>
                          </div>
                        </div>

                        {/* Subtle Hover Glow */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${colors.secondary} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Journey Section with Interactive Timeline - Fixed to be visible without animation dependencies */}
      {activeTab === "journey" && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Our Academic Journey
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From concept to reality, guided by exceptional mentors
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line with Animated Glow */}
              <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 glow-effect"></div>

              {/* Timeline Items - Removed animation dependencies */}
              <div className="space-y-12">
                {[
                  {
                    semester: "4th Semester",
                    title: "Foundation Phase",
                    mentor: "Akash Sir",
                    description:
                      "Minor Project 1 - Established core architecture and fundamental concepts",
                    icon: Rocket,
                    color: "blue",
                    achievements: [
                      "Core API Development",
                      "Database Design",
                      "Authentication System",
                    ],
                    date: "Jan - Apr 2024",
                    stats: {
                      commits: "120+",
                      features: "8",
                      teamSize: "4",
                    },
                  },
                  {
                    semester: "5th Semester",
                    title: "Evolution & Enhancement",
                    mentor: "Hemalata Ma'am",
                    description:
                      "Minor Project 2 - Advanced features and professional implementation",
                    icon: Brain,
                    color: "purple",
                    achievements: [
                      "Real-time Chat",
                      "Community Features",
                      "Advanced UI/UX",
                    ],
                    date: "Aug - Nov 2024",
                    stats: {
                      commits: "250+",
                      features: "12",
                      teamSize: "4",
                    },
                  },
                ].map((phase, idx) => (
                  <div
                    key={idx}
                    className={`relative flex items-center ${
                      idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    } opacity-100`} // Always visible
                  >
                    <div
                      className={`w-full md:w-1/2 ${
                        idx % 2 === 0 ? "md:pr-12" : "md:pl-12"
                      }`}
                    >
                      <div className="ml-16 md:ml-0 bg-slate-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10 hover:shadow-2xl transition-all duration-500 hover:border-white/20 tilt-card">
                        <div className="flex justify-between items-center mb-4">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                              colorVariants[phase.color].light
                            } border ${colorVariants[phase.color].border}`}
                          >
                            <phase.icon
                              className={`w-4 h-4 ${
                                colorVariants[phase.color].text
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                colorVariants[phase.color].text
                              }`}
                            >
                              {phase.semester}
                            </span>
                          </div>

                          <div className="text-xs text-gray-400 bg-gray-800/80 px-3 py-1 rounded-full">
                            {phase.date}
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                          {phase.title}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {phase.description}
                        </p>

                        <div className="flex items-center gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                          <Award className="w-5 h-5 text-amber-500" />
                          <span className="text-sm font-medium text-gray-300">
                            Mentored by {phase.mentor}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {phase.achievements.map((achievement, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  colorVariants[phase.color].accent
                                }`}
                              ></div>
                              <span className="text-sm text-gray-400">
                                {achievement}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Project Stats */}
                        <div className="grid grid-cols-3 gap-2 mt-6 bg-slate-700/30 rounded-xl p-3">
                          <div className="text-center">
                            <div
                              className={`text-sm ${
                                colorVariants[phase.color].text
                              }`}
                            >
                              <GitBranch className="w-4 h-4 mx-auto mb-1" />
                              <div>{phase.stats.commits}</div>
                              <div className="text-xs text-gray-500">
                                Commits
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm ${
                                colorVariants[phase.color].text
                              }`}
                            >
                              <Code className="w-4 h-4 mx-auto mb-1" />
                              <div>{phase.stats.features}</div>
                              <div className="text-xs text-gray-500">
                                Features
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm ${
                                colorVariants[phase.color].text
                              }`}
                            >
                              <Users className="w-4 h-4 mx-auto mb-1" />
                              <div>{phase.stats.teamSize}</div>
                              <div className="text-xs text-gray-500">
                                Team Size
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Dot with Advanced Pulse Effect */}
                    <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-10">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                          colorVariants[phase.color].primary
                        } flex items-center justify-center border-4 border-gray-800`}
                      >
                        <div className="absolute w-full h-full rounded-full animate-ping opacity-30 bg-blue-500"></div>
                        <phase.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vision Section with Holographic Effects */}
      {activeTab === "vision" && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-12 text-white relative overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <CyberneticCircuits />
              </div>

              <div className="relative z-10">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">
                      Our Purpose
                    </span>
                  </div>
                  <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    Vision & Mission
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Building bridges in the tech community through innovation
                    and collaboration
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="glass-effect rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-blue-500/10 hover:shadow-lg tilt-card">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-blue-600/30 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
                    <p className="text-gray-300 leading-relaxed">
                      To create a vibrant platform where tech enthusiasts can
                      connect, learn, and grow together. We're committed to
                      fostering meaningful interactions and knowledge sharing
                      within the developer community.
                    </p>

                    <div className="mt-6 space-y-2">
                      {[
                        "Foster innovation through collaboration",
                        "Create accessible learning opportunities",
                        "Connect passionate developers globally",
                        "Build an inclusive tech ecosystem",
                      ].map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          </div>
                          <span className="text-gray-300 text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-purple-500/10 hover:shadow-lg tilt-card">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-purple-600/30 rounded-xl flex items-center justify-center mb-4">
                      <Rocket className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
                    <p className="text-gray-300 leading-relaxed">
                      To become the go-to platform for tech communities
                      worldwide, enabling seamless collaboration and innovation
                      across borders, technologies, and expertise levels.
                    </p>

                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="text-sm text-gray-400 mb-2">
                        By the numbers, we envision:
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            10K+
                          </div>
                          <div className="text-xs text-gray-500">
                            Active Users
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            500+
                          </div>
                          <div className="text-xs text-gray-500">
                            Communities
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            200+
                          </div>
                          <div className="text-xs text-gray-500">Events</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            50+
                          </div>
                          <div className="text-xs text-gray-500">Partners</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote Section */}
                <div className="my-12 p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border border-white/10 text-center relative overflow-hidden">
                  <div className="absolute -top-4 -left-4 text-6xl text-gray-700 opacity-50">
                    ❝
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-6xl text-gray-700 opacity-50">
                    ❞
                  </div>
                  <p className="text-xl text-gray-200 italic relative z-10">
                    "Technology is best when it brings people together. Our
                    mission with Communiatec is to create a space where
                    technology and community converge."
                  </p>
                  <div className="mt-4 text-gray-400">
                    - The Communiatec Team
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="text-center mt-12">
                  <h3 className="text-2xl font-bold mb-6">
                    Powered By Modern Technology
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[
                      { name: "React", icon: Code },
                      { name: "Node.js", icon: Server },
                      { name: "Express", icon: Workflow },
                      { name: "MongoDB", icon: Database },
                      { name: "Socket.io", icon: Share2 },
                      { name: "Tailwind CSS", icon: Palette },
                      { name: "Vercel", icon: Cloud },
                    ].map((tech) => (
                      <div
                        key={tech.name}
                        className="px-4 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 text-sm font-medium flex items-center gap-2 hover:bg-white/15 transition-all hover:scale-105"
                      >
                        <tech.icon className="w-4 h-4 text-blue-400" />
                        <span>{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Professional Side-by-Side Modal - Removed floating background texts */}
      {selectedMember && (
        <div
          className={`fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50 p-4 bg-gradient-to-br ${
            selectedMember.color === "blue"
              ? "from-blue-900/80 to-slate-900/80"
              : selectedMember.color === "emerald"
              ? "from-emerald-900/80 to-slate-900/80"
              : selectedMember.color === "purple"
              ? "from-purple-900/80 to-slate-900/80"
              : "from-orange-900/80 to-slate-900/80"
          }`}
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side - Photo Section */}
              <div
                className={`w-full md:w-2/5 relative p-12 flex flex-col items-center justify-center bg-gradient-to-br ${
                  selectedMember.color === "blue"
                    ? "from-blue-50 to-blue-100"
                    : selectedMember.color === "emerald"
                    ? "from-emerald-50 to-emerald-100"
                    : selectedMember.color === "purple"
                    ? "from-purple-50 to-purple-100"
                    : "from-orange-50 to-orange-100"
                }`}
              >
                {/* Dynamic Background Pattern Based on Role */}
                <div className="absolute inset-0 opacity-15">
                  <div
                    className={`absolute top-10 left-10 w-20 h-20 rounded-full ${
                      selectedMember.color === "blue"
                        ? "bg-blue-400"
                        : selectedMember.color === "emerald"
                        ? "bg-emerald-400"
                        : selectedMember.color === "purple"
                        ? "bg-purple-400"
                        : "bg-orange-400"
                    } animate-pulse`}
                  ></div>
                  <div
                    className={`absolute bottom-20 right-10 w-16 h-16 rounded-full ${
                      selectedMember.color === "blue"
                        ? "bg-blue-500"
                        : selectedMember.color === "emerald"
                        ? "bg-emerald-500"
                        : selectedMember.color === "purple"
                        ? "bg-purple-500"
                        : "bg-orange-500"
                    } animate-bounce`}
                  ></div>
                  <div
                    className={`absolute top-1/2 right-20 w-12 h-12 rounded-full ${
                      selectedMember.color === "blue"
                        ? "bg-blue-600"
                        : selectedMember.color === "emerald"
                        ? "bg-emerald-600"
                        : selectedMember.color === "purple"
                        ? "bg-purple-600"
                        : "bg-orange-600"
                    } animate-ping`}
                  ></div>

                  {/* Additional floating elements */}
                  <div
                    className={`absolute top-1/4 left-1/3 w-8 h-8 rounded-full ${
                      selectedMember.color === "blue"
                        ? "bg-blue-300"
                        : selectedMember.color === "emerald"
                        ? "bg-emerald-300"
                        : selectedMember.color === "purple"
                        ? "bg-purple-300"
                        : "bg-orange-300"
                    } animate-pulse`}
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className={`absolute bottom-1/4 left-1/4 w-6 h-6 rounded-full ${
                      selectedMember.color === "blue"
                        ? "bg-blue-200"
                        : selectedMember.color === "emerald"
                        ? "bg-emerald-200"
                        : selectedMember.color === "purple"
                        ? "bg-purple-200"
                        : "bg-orange-200"
                    } animate-bounce`}
                    style={{ animationDelay: "2s" }}
                  ></div>
                </div>

                <div className="relative z-10">
                  {/* Main Photo */}
                  <div className="relative">
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="w-80 h-80 object-cover rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-500"
                    />

                    {/* Role Badge */}
                    <div
                      className={`absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border-2 ${
                        selectedMember.color === "blue"
                          ? "border-blue-200"
                          : selectedMember.color === "emerald"
                          ? "border-emerald-200"
                          : selectedMember.color === "purple"
                          ? "border-purple-200"
                          : "border-orange-200"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full animate-pulse ${
                          selectedMember.color === "blue"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : selectedMember.color === "emerald"
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                            : selectedMember.color === "purple"
                            ? "bg-gradient-to-r from-purple-500 to-purple-600"
                            : "bg-gradient-to-r from-orange-500 to-orange-600"
                        }`}
                      ></div>
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Available
                    </div>
                  </div>

                  {/* Name and Title */}
                  <div className="mt-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                      {selectedMember.name}
                    </h2>
                    <p
                      className={`text-xl font-semibold px-6 py-2 rounded-2xl text-white shadow-lg animate-pulse ${
                        selectedMember.color === "blue"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700"
                          : selectedMember.color === "emerald"
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
                          : selectedMember.color === "purple"
                          ? "bg-gradient-to-r from-purple-600 to-purple-700"
                          : "bg-gradient-to-r from-orange-600 to-orange-700"
                      }`}
                    >
                      {selectedMember.role}
                    </p>
                    <p className="text-lg text-gray-600 mt-2 font-medium">
                      {selectedMember.subtitle}
                    </p>
                  </div>

                  {/* Member Quote */}
                  {selectedMember.details.quote && (
                    <div className="mt-8 bg-white/50 rounded-xl p-4 relative">
                      <div className="absolute -top-2 -left-2 text-4xl text-gray-400 opacity-50">
                        ❝
                      </div>
                      <p className="text-sm text-gray-600 italic px-4">
                        {selectedMember.details.quote}
                      </p>
                      <div className="absolute -bottom-2 -right-2 text-4xl text-gray-400 opacity-50">
                        ❞
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="flex justify-center gap-4 mt-6">
                    <a
                      href={selectedMember.details.social?.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full ${
                        selectedMember.color === "blue"
                          ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                          : selectedMember.color === "emerald"
                          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                          : selectedMember.color === "purple"
                          ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                          : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                      } flex items-center justify-center transition-all duration-300 hover:scale-110`}
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href={selectedMember.details.social?.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full ${
                        selectedMember.color === "blue"
                          ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                          : selectedMember.color === "emerald"
                          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                          : selectedMember.color === "purple"
                          ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                          : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                      } flex items-center justify-center transition-all duration-300 hover:scale-110`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Side - Information Section */}
              <div className="w-full md:w-3/5 p-12 flex flex-col justify-center space-y-8 bg-gradient-to-br from-white to-gray-50 overflow-y-auto">
                {/* About Section */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    About
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {selectedMember.description}
                  </p>
                </div>

                {/* Skills Section */}
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                      <Code className="w-6 h-6 text-green-600" />
                    </div>
                    Technical Skills
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMember.details.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {skill}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements Section */}
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mr-3">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    Key Achievements
                  </h4>
                  <div className="space-y-3">
                    {selectedMember.details.achievements.map(
                      (achievement, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">
                            {achievement}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Contribution Stats */}
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    Contribution Stats
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-100 rounded-xl p-4 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-1">
                        <GitBranch className="w-4 h-4" />
                        <span>Commits</span>
                      </div>
                      <div className="text-2xl font-bold text-indigo-700">
                        {selectedMember.details.stats?.commits || "350+"}
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-1">
                        <Layers className="w-4 h-4" />
                        <span>Projects</span>
                      </div>
                      <div className="text-2xl font-bold text-indigo-700">
                        {selectedMember.details.stats?.projects || "8"}
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-1">
                        <Heart className="w-4 h-4" />
                        <span>Contrib.</span>
                      </div>
                      <div className="text-2xl font-bold text-indigo-700">
                        {selectedMember.details.stats?.contributions || "95%"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience & Location */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl p-6 border border-gray-200">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-semibold text-gray-900">
                          {selectedMember.details.experience}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">
                          {selectedMember.details.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className={`absolute top-6 right-6 rounded-full p-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${
                selectedMember.color === "blue"
                  ? "bg-blue-100 hover:bg-blue-200"
                  : selectedMember.color === "emerald"
                  ? "bg-emerald-100 hover:bg-emerald-200"
                  : selectedMember.color === "purple"
                  ? "bg-purple-100 hover:bg-purple-200"
                  : "bg-orange-100 hover:bg-orange-200"
              }`}
            >
              <X
                className={`w-6 h-6 ${
                  selectedMember.color === "blue"
                    ? "text-blue-600"
                    : selectedMember.color === "emerald"
                    ? "text-emerald-600"
                    : selectedMember.color === "purple"
                    ? "text-purple-600"
                    : "text-orange-600"
                }`}
              />
            </button>

            {/* Floating Role Indicator */}
            <div
              className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce ${
                selectedMember.color === "blue"
                  ? "bg-blue-500 text-white"
                  : selectedMember.color === "emerald"
                  ? "bg-emerald-500 text-white"
                  : selectedMember.color === "purple"
                  ? "bg-purple-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              {selectedMember.role}
            </div>
          </div>
        </div>
      )}

      {/* Footer with tech branding */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Communiatec
            </span>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Building connections in the developer community, one conversation at
            a time. Created with passion by BCA students at KLE's BCA
            Department.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            {[Github, Linkedin, Globe, Mail].map((Icon, i) => (
              <a
                href="#"
                key={i}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Communiatec. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutTeam;
