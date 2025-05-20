"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useChatSheet } from "@/context/ChatSheetContext";
import {
  FaTwitter,
  FaTelegram,
  FaLinkedin,
  FaInstagram,
  FaTiktok,
  FaWifi,
  FaPlay,
  FaPause,
} from "react-icons/fa";
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
  onClick,
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
        setDisplayedText((prev) => prev + char);
        setCurrentIndex((c) => c + 1);
        if (currentIndex === text.length - 1) {
          setIsComplete(true);
        }
      }, 15); // Faster typing speed

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <div
      className={className}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-white/80 animate-pulse" />
      )}
    </div>
  );
};

// Componente del teléfono móvil para mostrar video
const MobileVideoDisplay = ({
  show,
  videoUrl,
}: {
  show: boolean;
  videoUrl: string;
}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(1234);
  const [saved, setSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [showPlaybackControls, setShowPlaybackControls] = useState(false);
  const controlHideTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      console.log("togglePlayPause - isPlayingVideo:", isPlayingVideo);
      if (isPlayingVideo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setShowPlaybackControls(true);
      resetControlHideTimer();
    }
  };

  const handleVideoClick = () => {
    console.log("handleVideoClick");
    setShowPlaybackControls(true);
    resetControlHideTimer();
    if (isPlayingVideo && videoRef.current) {
      videoRef.current.pause();
    } else if (!isPlayingVideo && videoRef.current) {
      videoRef.current.play();
    }
  };

  const resetControlHideTimer = () => {
    if (controlHideTimer.current) {
      clearTimeout(controlHideTimer.current);
    }
    if (isPlayingVideo) {
      controlHideTimer.current = setTimeout(() => {
        setShowPlaybackControls(false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlHideTimer.current) {
        clearTimeout(controlHideTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (show || !isPlayingVideo) {
      setShowPlaybackControls(true);
      resetControlHideTimer();
    } else {
      setShowPlaybackControls(false);
    }
  }, [show, isPlayingVideo]);

  return (
    <motion.div
      className="fixed inset-0 z-30 items-center justify-end pr-[20%] pointer-events-none hidden md:flex"
      initial={{ opacity: 0 }}
      animate={{
        opacity: show ? 1 : 0,
        transition: {
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
          delay: show ? 0.3 : 0,
        },
      }}
    >
      {/* Contenedor para la animación de entrada desde la derecha */}
      <motion.div
        initial={{ x: 300 }}
        animate={{
          x: show ? 0 : 300,
          transition: {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
            delay: show ? 0.3 : 0,
          },
        }}
      >
        {/* Dispositivo móvil */}
        <div className="relative w-[330px] h-[650px] rounded-[40px] overflow-hidden shadow-2xl bg-gray-900 border-[8px] border-gray-800">
          {/* Notch del teléfono */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[140px] h-[24px] bg-gray-900 rounded-b-[16px] z-20"></div>

          {/* Barra de estado */}
          <div className="w-full h-[24px] bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center text-white text-sm px-6 z-10 relative">
            <span>
              {new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <div className="flex space-x-1 items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <FaWifi className="h-4 w-4" />
            </div>
          </div>

          {/* Banner del ganador */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-2 px-4 flex items-center justify-between">
            <div>
              <p className="text-white text-xs opacity-70">Last winner</p>
              <p className="text-white text-sm font-bold">CryptoProject.eth</p>
            </div>
            <div className="flex space-x-2">
              <a
                href="#"
                className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Video */}
          <div className="h-full w-full bg-black pt-0">
            <div className="relative h-full w-full overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlayingVideo(true)}
                  onPause={() => setIsPlayingVideo(false)}
                  onClick={handleVideoClick}
                  style={{ pointerEvents: "auto" }}
                />

                {showPlaybackControls && (
                  <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 p-4 rounded-full">
                      <div className="flex space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayPause();
                          }}
                        >
                          {isPlayingVideo ? (
                            <FaPause className="text-white text-2xl" />
                          ) : (
                            <FaPlay className="text-white text-2xl" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay para mejorar contraste */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-60 pointer-events-none"></div>

              {/* Información del creador - estilo TikTok */}
              <div className="absolute bottom-20 left-3 right-12 z-20">
                <div className="mb-2">
                  <p className="text-white font-bold text-sm">@moonXBT</p>
                  <p className="text-white text-xs opacity-90">
                    Promote your project on social media 🔥
                  </p>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    M
                  </div>
                  <p className="text-white text-xs">
                    <span className="opacity-70">Music:</span> Crypto Trader
                    Beat
                  </p>
                </div> */}
              </div>

              {/* Botones de interacción vertical - estilo TikTok */}
              <div className="absolute right-2 bottom-24 flex flex-col items-center space-y-5 z-20 pointer-events-auto">
                {/* <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white mb-1">
                    <img
                      src="/assets/logo.png"
                      alt="Perfil"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold -mt-3 border border-black">
                    +
                  </div>
                </div> */}

                {/* Corazón / Like */}
                <div className="flex flex-col items-center">
                  <button
                    className="w-10 h-10 flex items-center justify-center"
                    onClick={handleLike}
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-7 w-7 ${
                        liked ? "text-red-500" : "text-white"
                      }`}
                      fill={liked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      whileTap={{ scale: 1.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </motion.svg>
                  </button>
                  <span className="text-white text-xs font-semibold">
                    {likes}
                  </span>
                </div>

                {/* Comentarios */}
                <div className="flex flex-col items-center">
                  <button className="w-10 h-10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </button>
                  <span className="text-white text-xs font-semibold">421</span>
                </div>

                {/* Compartir */}
                <div className="flex flex-col items-center">
                  <button className="w-10 h-10 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                  <span className="text-white text-xs font-semibold">89</span>
                </div>

                {/* Guardar */}
                <div className="flex flex-col items-center">
                  <button
                    className="w-10 h-10 flex items-center justify-center"
                    onClick={handleSave}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-7 w-7 ${
                        saved ? "text-yellow-400" : "text-white"
                      }`}
                      fill={saved ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                  <span className="text-white text-xs font-semibold">56</span>
                </div>

                {/* Control de volumen */}
                <div className="flex flex-col items-center">
                  <button
                    className="w-10 h-10 flex items-center justify-center"
                    onClick={toggleMute}
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      whileTap={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isMuted ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      ) : (
                        <>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                          />
                        </>
                      )}
                    </motion.svg>
                  </button>
                  <span className="text-white text-xs font-semibold">
                    {isMuted ? "Muted" : "On"}
                  </span>
                </div>
              </div>

              {/* Controles inferiores */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center bg-gradient-to-t from-black/70 to-transparent text-white">
                <div>
                  <span className="text-sm font-medium">Promotional video</span>
                  <p className="text-xs opacity-70">Auction: 3.24 ETH</p>
                </div>
                <div className="flex space-x-3">
                  <button className="bg-white/20 rounded-full p-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button className="bg-white/20 rounded-full p-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botón circular en parte inferior */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[50px] h-[5px] bg-white/30 rounded-full"></div>
        </div>
      </motion.div>
    </motion.div>
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
  const [showMobileVideo, setShowMobileVideo] = useState(false);

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
      message: "Deploying...",
    },
  ];

  const conversations2 = [
    {
      username: "builder",
      message:
        "Your custommer service, influencers or fans in your community, powered by Ai-agents that can chat like a human and use natural language to solve questions ",
    },
    {
      username: "agentbot",
      message:
        "Loading AI agent infrastructure... Monitoring agent Activity...",
    },
    {
      username: "agentbot",
      message:
        "Training knowledge... Unique personalities... Connecting to data sources... ",
    },
    {
      username: "agentbot",
      message:
        "Connecting to X, Farcaster, Telegram, Website... Setting automations...",
    },
    {
      username: "agentbot",
      message: "Deploying...",
    },
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
    router.push("/classic");
  };

  const handleBidVideo = () => {
    console.log("Opening auction sheet...");
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

  // Mostrar teléfono móvil después de unos segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMobileVideo(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen bg-[#1752F0] flex flex-col overflow-hidden">
      <div className="relative flex flex-1">
        {/* Mobile Video Display */}
        <MobileVideoDisplay
          show={showMobileVideo}
          videoUrl="https://storage.googleapis.com/a0x-mirror-storage/agents-videos/2d11e5a1-4dd5-0d31-8d7d-4146c3934f41-1747354228987.mp4"
        />

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
              background:
                "linear-gradient(rgba(255,255,255,0.03) 50%, transparent 50%)",
              backgroundSize: "100% 4px",
              animation: "scan 8s linear infinite",
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
                className={`${
                  line.username
                    ? "mb-2 sm:mb-3 leading-relaxed"
                    : "leading-none"
                }`}
              >
                {line.username && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                    <span className="text-white/50 font-bold tracking-wider text-xs sm:text-sm">
                      [{line.timestamp}]
                    </span>
                    <span className="text-white font-bold tracking-wider text-xs sm:text-sm">
                      {line.username}:
                    </span>
                  </div>
                )}
                <TypeWriter
                  text={line.message}
                  className={`${
                    !line.username
                      ? "font-bold text-white tracking-wider text-[8px] xs:text-[10px] sm:text-xs md:text-sm whitespace-pre cursor-pointer"
                      : "text-white/90 pl-0 sm:pl-4 text-xs sm:text-sm md:text-base break-words"
                  } flex items-center ${
                    line.message.includes("Current Bid:")
                      ? "text-blue-300 font-bold"
                      : ""
                  } ${
                    line.message.includes("Click here")
                      ? "text-blue-200 animate-pulse"
                      : ""
                  }`}
                  onClick={
                    !line.username &&
                    (line.message.includes("BID NOW") ||
                      line.message.includes("Current Bid:") ||
                      line.message.includes("Click here"))
                      ? handleBidVideo
                      : undefined
                  }
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
                <span className="text-white/70 group-hover:text-white font-mono text-sm tracking-wider transition-all duration-300">
                  PAUSE
                </span>
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
                  <span className="font-mono text-white font-bold tracking-wide whitespace-nowrap">
                    BID FOR TOMORROW'S VIDEO
                  </span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </button>
            </div>

            {/* R ight - Social Links with modern hover effects */}
            <div className="flex justify-center sm:justify-end items-center space-x-6">
              <Link
                href="https://x.com/moonXBT_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
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
              <Link
                href="https://warpcast.com/ai420z"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
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
              <Link
                href="https://www.tiktok.com/@moonxbt.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="relative">
                  <FaTiktok className="w-5 h-5 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link
                href="https://t.me/A0X_Portal"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="relative">
                  <FaTelegram className="w-5 h-5 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link
                href="https://www.instagram.com/moonxbt_ia"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="relative">
                  <FaInstagram className="w-5 h-5 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-0.5" />
                  <div className="absolute -bottom-1 left-1/2 w-4 h-0.5 bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </Link>
              <Link
                href="https://zora.co/@moonxbt"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
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
              <Link
                href="https://dexscreener.com/base/0xa1a65c284a2e01f0d9c9683edeab30d0835d1362"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
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
          console.log("Closing auction sheet...");
          setIsAuctionOpen(false);
        }}
      />

      <style jsx global>{`
        @keyframes scan {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(4px);
          }
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
          background: #1752f0;
          border-radius: 4px;
          border: 2px solid #00008b;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #1142c0;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #1752f0 rgba(23, 82, 240, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TerminalHero;
