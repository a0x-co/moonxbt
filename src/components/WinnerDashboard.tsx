"use client";

import { useAuctionData } from "@/hooks/useAuctionData";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shadcn/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import MobileVideoDisplay from "@/components/MobileVideoDisplay";

interface Video {
  name: string;
  url: string;
  createdAt: string;
  size: number;
  timestamp: number;
  thumbnail?: string;
}

interface VideoResponse {
  success: boolean;
  videos: Video[];
  pagination: {
    limit: number;
    offset: number;
  };
}

interface WinnerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WinnerDashboard = ({ isOpen, onClose }: WinnerDashboardProps) => {
  const { lastAuctionWinner, lastAuctionAmount, lastAuctionResourceValue } =
    useAuctionData();

  const { wallets } = useWallets();
  const wallet = wallets[0];

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState<string>(
    lastAuctionResourceValue || ""
  );
  const [websiteDocUrl, setWebsiteDocUrl] = useState("");

  // Nuevos estados para manejar mensajes y carga
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // Estados para la lista de videos
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  // Estado para el modal de video
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Función para generar thumbnail del video
  const generateThumbnail = async (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = videoUrl;

      video.onloadeddata = () => {
        video.currentTime = 0;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL("image/jpeg");
          resolve(thumbnailUrl);
        } else {
          reject(new Error("No se pudo crear el contexto del canvas"));
        }
      };

      video.onerror = () => {
        reject(new Error("Error al cargar el video"));
      };
    });
  };

  // Función para obtener los videos
  const fetchVideos = async () => {
    setIsLoadingVideos(true);
    setVideosError(null);
    try {
      const response = await fetch(
        "/api/get-videos?influencerId=3e444822-7a6c-0e5d-a36d-7087fb23685b"
      );
      const data: VideoResponse = await response.json();

      if (!response.ok) {
        throw new Error("Error al obtener los videos");
      }

      if (!data.success) {
        throw new Error("Error en la respuesta del servidor");
      }

      // Generar thumbnails para cada video
      const videosWithThumbnails = await Promise.all(
        data.videos.map(async (video) => {
          try {
            const thumbnail = await generateThumbnail(video.url);
            return { ...video, thumbnail };
          } catch (error) {
            console.error("Error al generar thumbnail:", error);
            return video;
          }
        })
      );

      setVideos(videosWithThumbnails);
    } catch (error) {
      setVideosError(
        error instanceof Error ? error.message : "Error al cargar los videos"
      );
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Cargar videos cuando se abre el tab
  useEffect(() => {
    if (isOpen) {
      fetchVideos();
    }
  }, [isOpen]);

  // Función para validar la URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerateVideo = async () => {
    // Resetear mensajes
    setMessage({ type: null, text: "" });

    // Validaciones
    if (!projectName.trim()) {
      setMessage({
        type: "error",
        text: "El nombre del proyecto es requerido",
      });
      return;
    }

    if (!projectDescription.trim()) {
      setMessage({
        type: "error",
        text: "La descripción del proyecto es requerida",
      });
      return;
    }

    if (!projectUrl.trim()) {
      setMessage({ type: "error", text: "La URL del proyecto es requerida" });
      return;
    }

    if (!isValidUrl(projectUrl)) {
      setMessage({ type: "error", text: "La URL del proyecto no es válida" });
      return;
    }

    if (websiteDocUrl && !isValidUrl(websiteDocUrl)) {
      setMessage({
        type: "error",
        text: "La URL de documentación no es válida",
      });
      return;
    }

    const projectData = {
      name: projectName.trim(),
      description: projectDescription.trim(),
      websiteUrl: projectUrl.trim(),
      websiteDocUrl: websiteDocUrl.trim() || undefined,
    };

    try {
      setIsLoading(true);
      const response = await fetch("/api/create-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el video");
      }

      setMessage({
        type: "success",
        text: "¡Video creado exitosamente! Serás redirigido a la lista de videos.",
      });

      // Limpiar el formulario
      setProjectName("");
      setProjectDescription("");
      setProjectUrl(lastAuctionResourceValue || "");
      setWebsiteDocUrl("");

      // Cambiar al tab de videos después de 2 segundos
      setTimeout(() => {
        const videosTab = document.querySelector(
          '[data-value="videos"]'
        ) as HTMLElement;
        if (videosTab) videosTab.click();
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Error al crear el video",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[900px] bg-[#1752F0] border-none p-6 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-white">
            Winner Dashboard
          </SheetTitle>
          <SheetDescription className="text-white/70">
            View your auction details and share your victory
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="w-full bg-[#1a237e]/40 border border-white/10">
              <TabsTrigger
                value="create"
                className="flex-1 data-[state=active]:bg-[#1a237e]/60 data-[state=active]:text-white text-white/70"
              >
                Create Promo
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                className="flex-1 data-[state=active]:bg-[#1a237e]/60 data-[state=active]:text-white text-white/70"
              >
                My Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4">
              <div
                className="rounded-xl p-6"
                style={{
                  background: "rgba(30, 60, 180, 0.25)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                }}
              >
                <h3 className="font-mono text-lg text-white/90 mb-4">
                  Generate Promotional Video
                </h3>

                {/* Mensaje de éxito/error */}
                {message.type && (
                  <div
                    className={`mb-4 p-3 rounded-lg ${
                      message.type === "success"
                        ? "bg-green-500/20 border border-green-500/30"
                        : "bg-red-500/20 border border-red-500/30"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.type === "success"
                          ? "text-green-300"
                          : "text-red-300"
                      }`}
                    >
                      {message.text}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">
                      Project Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">
                      Project Description
                    </label>
                    <Textarea
                      placeholder="Enter project description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Website URL</label>
                    <Input
                      type="text"
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-white/50">
                      This URL comes from your auction resource
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">
                      Documentation URL (Optional)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://your-project.com/docs"
                      value={websiteDocUrl}
                      onChange={(e) => setWebsiteDocUrl(e.target.value)}
                      className="bg-[#1a237e]/30 border-white/10 text-white placeholder:text-white/50"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-white/50">
                      Recommended to include a documentation URL if the website
                      url is not enough to understand the project
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateVideo}
                    disabled={isLoading}
                    className={`w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Generating Video..." : "Generate Video"}
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              {selectedVideoUrl ? (
                <div className="flex items-center justify-center min-h-[400px] relative">
                  <button
                    className="absolute top-0 left-0 px-4 py-2 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white rounded-lg border border-white/10 font-mono text-sm self-center"
                    onClick={() => setSelectedVideoUrl(null)}
                  >
                    ← Back
                  </button>
                  <MobileVideoDisplay
                    show={true}
                    videoUrl={selectedVideoUrl}
                    initialMuted={false}
                  />
                </div>
              ) : (
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: "rgba(30, 60, 180, 0.25)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    backdropFilter: "blur(8px)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-lg text-white/90">
                      Your Promotional Videos
                    </h3>
                    <button
                      onClick={fetchVideos}
                      className="px-3 py-1 text-sm bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white rounded-lg border border-white/10 transition-all duration-300"
                      disabled={isLoadingVideos}
                    >
                      {isLoadingVideos ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>
                  {isLoadingVideos ? (
                    <div className="grid grid-cols-3 gap-4">
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={index}
                          className="bg-[#1a237e]/20 rounded-lg overflow-hidden relative aspect-square animate-pulse"
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <div className="w-3/4 h-4 bg-white/10 rounded mb-2"></div>
                            <div className="w-1/2 h-3 bg-white/10 rounded mb-2"></div>
                            <div className="w-1/3 h-3 bg-white/10 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : videosError ? (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-300 text-sm">{videosError}</p>
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="bg-[#1a237e]/20 rounded-lg p-4">
                      <p className="text-white/70 text-sm">
                        No videos created yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <div
                          key={video.timestamp}
                          className="bg-[#1a237e]/20 rounded-lg overflow-hidden hover:bg-[#1a237e]/30 transition-all duration-300 cursor-pointer group relative aspect-square"
                          onClick={() => setSelectedVideoUrl(video.url)}
                        >
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                              const vid = e.currentTarget;
                              vid.currentTime = 0.1;
                              vid.pause();
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white text-sm font-mono">
                              Ver Video
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Sección de Acciones */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(30, 60, 180, 0.25)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <h3 className="font-mono text-lg text-white/90 mb-4">
              Share Your Victory
            </h3>
            <div className="space-y-3">
              <button
                className="w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
                onClick={() => {
                  window.open(
                    "https://twitter.com/intent/tweet?text=I%20just%20won%20the%20MoonXBT%20auction!",
                    "_blank"
                  );
                }}
              >
                Share on X
              </button>
              <button
                className="w-full py-2.5 px-4 bg-[#1a237e]/40 hover:bg-[#1a237e]/60 text-white font-mono text-sm rounded-lg border border-white/10 transition-all duration-300"
                onClick={() => {
                  window.open(
                    "https://warpcast.com/~/compose?text=I%20just%20won%20the%20MoonXBT%20auction!",
                    "_blank"
                  );
                }}
              >
                Share on Farcaster
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
