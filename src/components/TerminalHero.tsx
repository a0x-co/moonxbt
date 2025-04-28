"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useChatSheet } from "@/context/ChatSheetContext";
import { FaTwitter, FaTelegram, FaLinkedin, FaInstagram, FaTiktok } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoAuctionSheet } from "@/components/VideoAuctionSheet";

interface TerminalLine {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

const TypeWriter = ({ 
  text, 
  className,
  onClick 
}: { 
  text: string; 
  className: string;
  onClick?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const char = text[currentIndex];
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCurrentIndex(c => c + 1);
        if (currentIndex === text.length - 1) {
          setIsComplete(true);
        }
      }, 15); // Faster typing speed

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <div className={className} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-white/80 animate-pulse" />
      )}
    </div>
  );
};

const TerminalHero = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const { setTrigger, setIsOpen } = useChatSheet();
  const indexRef = useRef(0);
  const bannerStartedRef = useRef(false);
  const bannerIndexRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isAuctionOpen, setIsAuctionOpen] = useState(false);
  const [currentBid, setCurrentBid] = useState("0.00");

  const bannerLines2 = [
    "  /******   /******  /**   /**",
    " /**__  ** /***_  **| **  / **",
    "| **  \\ **| ****\\ **|  **/ **/",
    "| ********| ** ** ** \\  ****/ ",
    "| **__  **| **\\ ****  >**  ** ",
    "| **  | **| ** \\ *** /**/\\  **",
    "| **  | **|  ******/| **  \\ **",
    "|__/  |__/ \\______/ |__/  |__/",
  ];

  const bannerLines3 = [
"                                        /$$                     /$$   /$$ /$$$$$$$  /$$$$$$$$",
"                                       |__/                    | $$  / $$| $$__  $$|__  $$__/",
"       /$$  /$$$$$$   /$$$$$$$ /$$$$$$$ /$$  /$$$$$$$  /$$$$$$ |  $$/ $$/| $$    $$   | $$",   
"      |__/ /$$__  $$ /$$_____//$$_____/| $$ /$$_____/ |____  $$    $$$$/ | $$$$$$$    | $$",   
"       /$$| $$$$$$$$|  $$$$$$|  $$$$$$ | $$| $$        /$$$$$$$  >$$  $$ | $$__  $$   | $$",   
"      | $$| $$_____/   _____ $$ ____ $$| $$| $$       /$$__  $$ /$$/   $$| $$    $$   | $$",   
"      | $$|  $$$$$$$ /$$$$$$$//$$$$$$$/| $$|  $$$$$$$|  $$$$$$$| $$    $$| $$$$$$$/   | $$",   
"      | $$|  _______/|_______/|_______/|__/  _______/  _______/|__/  |__/|_______/    |__/",   
" /$$  | $$|",                                                                                   
"|   $$$$$$/",                                                                                   
"   ______/",                                                                                                                         
];

const bannerLines = [
"                                             /$$   /$$ /$$$$$$$  /$$$$$$$$",
"                                            | $$  / $$| $$__  $$|__  $$__/",
" /$$$$$$/$$$$   /$$$$$$   /$$$$$$  /$$$$$$$ |  $$/ $$/| $$    $$   | $$   ",
"| $$_  $$_  $$ /$$__  $$ /$$__  $$| $$__  $$    $$$$/ | $$$$$$$    | $$",   
"| $$   $$   $$| $$    $$| $$    $$| $$    $$  >$$  $$ | $$__  $$   | $$",   
"| $$ | $$ | $$| $$  | $$| $$  | $$| $$  | $$ /$$/   $$| $$    $$   | $$ ",  
"| $$ | $$ | $$|  $$$$$$/|  $$$$$$/| $$  | $$| $$    $$| $$$$$$$/   | $$",   
"|__/ |__/ |__/  ______/   ______/ |__/  |__/|__/  |__/|_______/    |__/",                                                                                                                         
];   
                              
                              
                              

  const conversations = [
    {
      username: "builder",
      message:
        "I will create a short video of your product and post it on X, Farcaster, Telegram, Tiktok and Instagram... ",
    },
    {
    username: "agentbot",
    message: "Everyday there's a new auction for tomorrow's video...",
    },
    {
      username: "agentbot",
      message:
        "Training knowledge... Unique personality... Connecting to data sources... ",
    },
    {
    username: "agentbot",
    message: "Deploying..."
  }
  ];

  const conversations2 = [
    {
      username: "builder",
      message:
        "Your custommer service, influencers or fans in your community, powered by Ai-agents that can chat like a human and use natural language to solve questions ",
    },
    {
    username: "agentbot",
    message: "Loading AI agent infrastructure... Monitoring agent Activity...",
    },
    {
      username: "agentbot",
      message:
        "Training knowledge... Unique personalities... Connecting to data sources... ",
    },
    {
      username: "agentbot",
      message: "Connecting to X, Farcaster, Telegram, Website... Setting automations...",
    },
    {
    username: "agentbot",
    message: "Deploying..."
  }
  ];

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false });
  };

  const handleCreateAgent = () => {
    setTrigger("create_agent");
    setIsOpen(true);
  };

  const handleKnowMore = () => {
    router.push('/classic');
  };

  const handleBidVideo = () => {
    console.log('Opening auction sheet...');
    setIsAuctionOpen(true);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isActive = true;

    const addLine = () => {
      if (!isPlaying || !isActive) return;

      if (indexRef.current < conversations.length) {
        const timestamp = getTimestamp();
        const newLine = {
          ...conversations[indexRef.current],
          timestamp,
          id: `${timestamp}-${indexRef.current}`,
        };
        setLines((prev) => {
          if (prev.some((line) => line.id === newLine.id)) return prev;
          return [...prev, newLine];
        });
        indexRef.current++;
        // Shorter delays between lines
        const nextDelay = indexRef.current === 1 ? 1200 : 1600;
        timeout = setTimeout(addLine, nextDelay);
      } else if (!bannerStartedRef.current) {
        bannerStartedRef.current = true;
        timeout = setTimeout(addLine, 400); // Shorter delay before ASCII art
      } else if (bannerIndexRef.current < bannerLines.length) {
        const timestamp = getTimestamp();
        const newBannerLine = {
          username: "",
          message: bannerLines[bannerIndexRef.current],
          timestamp,
          id: `${timestamp}-banner-${bannerIndexRef.current}`,
        };
        setLines((prev) => {
          if (prev.some((line) => line.id === newBannerLine.id)) return prev;
          return [...prev, newBannerLine];
        });
        bannerIndexRef.current++;
        timeout = setTimeout(addLine, 100);
      } else {
        timeout = setTimeout(() => {
          if (!isActive) return;
          setLines([]);
          indexRef.current = 0;
          bannerStartedRef.current = false;
          bannerIndexRef.current = 0;
          setTimeout(addLine, 100);
        }, 15000); // Shorter delay before restart
      }
    };

    addLine();

    return () => {
      isActive = false;
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="h-screen bg-[#1752F0] flex flex-col">
      <div className="relative flex flex-1">
        {/* Terminal Content */}
        <div
          ref={terminalRef}
          className="flex-1 font-mono text-white pt-24 sm:pt-32 md:pt-32 lg:pt-32 xl:pt-36 px-3 sm:px-6 md:px-12 lg:px-16 xl:px-24 pb-16 overflow-y-auto relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            backgroundColor: "#1752F0",
            fontSize: "13px",
            letterSpacing: "0.05em",
          }}
        >
          {/* Scanline effect */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: 'linear-gradient(rgba(255,255,255,0.03) 50%, transparent 50%)',
              backgroundSize: '100% 4px',
              animation: 'scan 8s linear infinite'
            }}
          />

          {/* Terminal content */}
          <div className="relative z-10">
            {lines.map((line, index) => (
              <motion.div 
                key={line.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`${line.username ? 'mb-2 sm:mb-3 leading-relaxed' : 'leading-none'}`}
              >
                {line.username && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                    <span className="text-white/50 font-bold tracking-wider text-xs sm:text-sm">[{line.timestamp}]</span>
                    <span className="text-white font-bold tracking-wider text-xs sm:text-sm">{line.username}:</span>
                  </div>
                )}
                <TypeWriter 
                  text={line.message}
                  className={`${!line.username ? 'font-bold text-white tracking-wider text-[8px] xs:text-[10px] sm:text-xs md:text-sm whitespace-pre cursor-pointer' : 'text-white/90 pl-0 sm:pl-4 text-xs sm:text-sm md:text-base break-words'} flex items-center ${line.message.includes('Current Bid:') ? 'text-blue-300 font-bold' : ''} ${line.message.includes('Click here') ? 'text-blue-200 animate-pulse' : ''}`}
                  onClick={(!line.username && (line.message.includes('BID NOW') || line.message.includes('Current Bid:') || line.message.includes('Click here'))) ? handleBidVideo : undefined}
                />
              </motion.div>
            ))}
            {isPlaying && (
              <motion.span
                className="inline-block h-4 sm:h-5 w-1 sm:w-2 bg-white ml-2 sm:ml-4"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="hidden lg:block w-[400px] h-full relative">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/moonxbt.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1752F0] via-transparent to-transparent" />
        </div>
      </div>

      {/* Modern Footer */}
      <div className="relative z-20 bg-gradient-to-t from-[#00008B] to-[#00008B]/90 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-center py-4">
            {/* Left - Controls with modern styling */}
            <div className="flex justify-center sm:justify-start items-center">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="group flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-2 h-2 bg-white/70 rounded-full group-hover:bg-white group-hover:animate-pulse transition-all duration-300" />
                <span className="text-white/70 group-hover:text-white font-mono text-sm tracking-wider transition-all duration-300">PAUSE</span>
              </button>
            </div>

            {/* Center - Bid Button */}
            <div className="order-first sm:order-none mb-4 sm:mb-0">
              <button
                onClick={handleBidVideo}
                className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="relative flex items-center space-x-3">
                  <span className="font-mono text-white font-bold tracking-wide whitespace-nowrap">BID FOR TOMORROW'S VIDEO</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </button>
            </div>

            {/* R ight - Social Links with modern hover effects */}
            <div className="flex justify-center sm:justify-end items-center space-x-6">
              <Link href="https://x.com/moonXBT_ai" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <Image
                    src="/assets/x.png"
                    alt="X"
                    width={20}
                    height={20}
                    className="opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5"
                  />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link href="https://warpcast.com/ai420z" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <Image
                    src="/assets/farcaster.png"
                    alt="Farcaster"
                    width={20}
                    height={20}
                    className="opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5"
                  />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link href="https://www.tiktok.com/@moonxbt.fun" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <FaTiktok className="w-5 h-5 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link href="https://t.me/A0X_Portal" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <FaTelegram className="w-5 h-5 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link href="https://www.instagram.com/moonxbt_ia" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <FaInstagram className="w-5 h-5 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link href="https://zora.co/@moonxbt" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <Image
                    src="/assets/zora.png"
                    alt="Zora"
                    width={20}
                    height={20}
                    className="opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5"
                  />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link href="https://dexscreener.com/base/0xa1a65c284a2e01f0d9c9683edeab30d0835d1362" target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <Image
                    src="/assets/dexlogo.png"
                    alt="Dex Screener"
                    width={20}
                    height={20}
                    className="opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5"
                  />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <VideoAuctionSheet 
        isOpen={isAuctionOpen} 
        onClose={() => {
          console.log('Closing auction sheet...');
          setIsAuctionOpen(false);
        }} 
      />

      <style jsx global>{`
        @keyframes scan {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }
        @media (max-width: 640px) {
          .whitespace-pre {
            white-space: pre;
            font-size: 8px;
            letter-spacing: 0;
          }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          .whitespace-pre {
            white-space: pre;
            font-size: 10px;
            letter-spacing: 0.02em;
          }
        }

        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 10px;
          background: rgba(23, 82, 240, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: #1752F0;
          border-radius: 4px;
          border: 2px solid #00008B;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #1142c0;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #1752F0 rgba(23, 82, 240, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TerminalHero; 