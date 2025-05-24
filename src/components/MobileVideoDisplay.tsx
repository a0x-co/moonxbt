import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay, FaWifi } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuctionData } from "@/hooks/useAuctionData";

// Componente del teléfono móvil para mostrar video
const MobileVideoDisplay = ({
  show,
  videoUrl,
  initialMuted = true,
}: {
  show: boolean;
  videoUrl: string;
  initialMuted?: boolean;
}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(1234);
  const [saved, setSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
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

  const { lastAuctionWinner, lastAuctionAmount, lastAuctionResourceValue } =
    useAuctionData();

  return (
    <div className="relative w-[250px] h-[500px] 2xl:w-[330px] 2xl:h-[650px] rounded-[40px] overflow-hidden shadow-2xl bg-gray-900 border-[8px] border-gray-800">
      {/* Notch del teléfono */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100px] 2xl:w-[140px] h-[24px] bg-gray-900 rounded-b-[16px] z-20"></div>

      {/* Barra de estado */}
      <div className="w-full h-[24px] bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center text-white text-sm px-6 z-10 relative">
        <span className="text-xs 2xl:text-sm">
          {new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <div className="flex space-x-1 items-center">
          <div className="h-2 w-2 2xl:h-2.5 2xl:w-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <FaWifi className="h-3 w-3 2xl:h-4 2xl:w-4" />
        </div>
      </div>

      {/* Banner del ganador */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-2 px-4 flex items-center justify-between">
        <div>
          <p className="text-white text-xs opacity-70">Last winner</p>
          <p className="text-white text-sm font-bold">
            a0x.co {/* {lastAuctionResourceValue} */}
          </p>
        </div>
        <div className="flex space-x-2">
          {/* <a
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
          </a> */}
          <a
            // href={lastAuctionResourceValue}
            href="https://a0x.co"
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
              className="h-full w-full -mt-[75px]"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onPlay={() => setIsPlayingVideo(true)}
              onPause={() => setIsPlayingVideo(false)}
              onClick={handleVideoClick}
              style={{ pointerEvents: "auto" }}
              onError={(e) => {
                // Si hay un error al reproducir con audio, muteamos el video
                if (!isMuted) {
                  setIsMuted(true);
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                  }
                }
              }}
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
                  className={`h-7 w-7 ${liked ? "text-red-500" : "text-white"}`}
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
              <span className="text-white text-xs font-semibold">{likes}</span>
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
              <p className="text-xs opacity-70">
                Auction: {lastAuctionAmount} A0X
              </p>
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
  );
};

export default MobileVideoDisplay;
