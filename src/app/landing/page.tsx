"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Press_Start_2P } from "next/font/google";
import { formatUnits } from "viem";

import bg from "./png/Background_main_1.jpg";
import logo from "./png/Logotipo_moonXBT_1@2x-8.png";
import iso from "./png/Logo_gatito_1.png";
import bubble from "./png/NEW_globo_text_2@2x-8.png";
import cursor from "./png/Cursor_1@2x-8.png";
import pinkBtn from "./png/Boton rosa@2x-8.png";
import yellowBtn from "./png/Boton Amarillo@2x-8.png";
import moonPfp from "./png/moon_crop.jpeg";
import CustomCursor from "./CustomCursor";
import {
  SiX,
  SiFarcaster,
  SiTiktok,
  SiTelegram,
  SiInstagram,
} from "react-icons/si";
import TerminalSnippet from "@/components/TerminalSnippet";
import { VideoAuctionSheet } from "@/components/VideoAuctionSheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BID_TOKEN_DECIMALS, BID_TOKEN_SYMBOL } from "@/constants/contracts";
import { useAuctionData } from "@/hooks/useAuctionData";
import axios from "axios";

const press = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function LandingPage() {
  const [isWinnersOpen, setIsWinnersOpen] = useState(false);
  const [isAuctionOpen, setIsAuctionOpen] = useState(false);
  const [isTweetsLoading, setIsTweetsLoading] = useState(true);
  const [isTweetsFailed, setIsTweetsFailed] = useState(false);
  const [winnersModalTab, setWinnersModalTab] = useState<"winners" | "tweets">("tweets");
  const tweetsContainerRef = useRef<HTMLDivElement | null>(null);
  const { lastAuctionWinner, lastAuctionAmount, lastAuctionResourceValue, currentAuctionId } =
    useAuctionData();

  const parseAuctionResource = (
    resource: string | undefined,
  ): string | null => {
    if (!resource) return null;

    try {
      const parsed = JSON.parse(resource) as { url?: string };
      return parsed.url ?? resource;
    } catch {
      return resource;
    }
  };

  // Estado para detalles extendidos del ganador
  const [winnerDetails, setWinnerDetails] = useState<any | null>(null);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [loadingWinnerDetails, setLoadingWinnerDetails] = useState(false);
  const [winnerError, setWinnerError] = useState<string | null>(null);

  const formatWinnerBid = (value: unknown): string => {
    if (value == null || value === "") return "";

    if (typeof value === "bigint") {
      return `${formatUnits(value, BID_TOKEN_DECIMALS)} ${BID_TOKEN_SYMBOL}`;
    }

    const raw = String(value).trim();
    if (!raw) return "";

    if (raw.includes(".")) {
      return `${raw} ${BID_TOKEN_SYMBOL}`;
    }

    try {
      return `${formatUnits(BigInt(raw), BID_TOKEN_DECIMALS)} ${BID_TOKEN_SYMBOL}`;
    } catch {
      return `${raw} ${BID_TOKEN_SYMBOL}`;
    }
  };

  const getWinnerVideoUrl = (entry: any): string | null =>
    (entry?.latestVideo?.jobId
      ? `/api/moonxbt/video/${entry.latestVideo.jobId}/stream`
      : null) ||
    entry?.latestVideo?.videoUrl ||
    entry?.latestVideo?.previewPublicUrl ||
    (entry?.latestVideo?.previewBucket && entry?.latestVideo?.previewPath
      ? `https://storage.googleapis.com/${entry.latestVideo.previewBucket}/${entry.latestVideo.previewPath}`
      : null);

  const winnerVideoUrl = getWinnerVideoUrl(winnerDetails);
  const winnersToRender = (
    recentWinners.length > 0
      ? recentWinners
      : winnerDetails
        ? [winnerDetails]
        : []
  )
    .filter((winner) => {
      if (currentAuctionId == null) return true;
      const auctionId = Number(winner?.auctionId ?? NaN);
      const current = Number(currentAuctionId);
      if (!Number.isFinite(auctionId) || !Number.isFinite(current)) return true;
      return auctionId < current;
    })
    .sort((a, b) => Number(b?.auctionId ?? 0) - Number(a?.auctionId ?? 0));

  // El entryId es auction-{auctionId}-{address}
  // El último auction finalizado es currentAuctionId - 1
  const lastAuctionId = (typeof currentAuctionId === 'bigint' ? Number(currentAuctionId) : currentAuctionId) ? Number(currentAuctionId) - 1 : null;
  const winnerEntryId = lastAuctionId !== null && lastAuctionWinner && lastAuctionWinner !== "0x0000000000000000000000000000000000000000"
    ? `auction-${lastAuctionId}-${lastAuctionWinner.toLowerCase()}`
    : null;

  useEffect(() => {
    if (!winnerEntryId) {
      setWinnerDetails(null);
      return;
    }
    setLoadingWinnerDetails(true);
    setWinnerError(null);
    axios.get(`/api/moonxbt/auction/entry/${winnerEntryId}`)
      .then(res => {
        setWinnerDetails(res.data?.entry || res.data || null);
        setLoadingWinnerDetails(false);
      })
      .catch(err => {
        setWinnerError("No se pudo cargar el detalle del ganador");
        setLoadingWinnerDetails(false);
      });
  }, [winnerEntryId]);

  useEffect(() => {
    if (!isWinnersOpen || winnersModalTab !== "winners") return;

    let cancelled = false;
    setLoadingWinnerDetails(true);
    setWinnerError(null);

    axios
      .get("/api/moonxbt/auction/winners?limit=10")
      .then((res) => {
        if (cancelled) return;
        const winners = Array.isArray(res.data?.winners) ? res.data.winners : [];
        setRecentWinners(winners);
        setLoadingWinnerDetails(false);
      })
      .catch(() => {
        if (cancelled) return;
        setWinnerError("No se pudieron cargar los winners recientes");
        setLoadingWinnerDetails(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isWinnersOpen, winnersModalTab]);

  const ensureTwitterScript = async () => {
    if (typeof window === "undefined") {
      throw new Error("Window is not available");
    }

    const twttrWindow = window as Window & {
      twttr?: {
        widgets?: {
          createTimeline?: (
            dataSource: { sourceType: "profile"; screenName: string },
            target: HTMLElement,
            options?: {
              theme?: "dark" | "light";
              chrome?: string;
              height?: number;
              dnt?: boolean;
              tweetLimit?: number;
            },
          ) => Promise<HTMLElement>;
        };
      };
    };

    if (twttrWindow.twttr?.widgets?.createTimeline) {
      return twttrWindow.twttr;
    }

    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://platform.twitter.com/widgets.js"]',
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Twitter script")),
          { once: true },
        );

        const maybeReady = () => {
          if (twttrWindow.twttr?.widgets?.createTimeline) {
            resolve();
          }
        };
        window.setTimeout(maybeReady, 50);
        window.setTimeout(maybeReady, 250);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Twitter script"));
      document.body.appendChild(script);
    });

    if (!twttrWindow.twttr?.widgets?.createTimeline) {
      throw new Error("Twitter widgets API unavailable");
    }

    return twttrWindow.twttr;
  };

  useEffect(() => {
    if (isWinnersOpen) {
      setWinnersModalTab(winnerEntryId ? "winners" : "tweets");
    }
  }, [isWinnersOpen, winnerEntryId]);

  useEffect(() => {
    if (isWinnersOpen && winnersModalTab === "tweets") {
      setIsTweetsLoading(true);
      setIsTweetsFailed(false);
      let cancelled = false;

      const mountTimeline = async () => {
        try {
          const target = tweetsContainerRef.current;
          if (!target) {
            throw new Error("Timeline container not found");
          }

          target.innerHTML = "";

          const twttr = await ensureTwitterScript();
          if (cancelled) return;

          await Promise.race([
            twttr.widgets!.createTimeline!(
              {
                sourceType: "profile",
                screenName: "moonXBT_ai",
              },
              target,
              {
                theme: "dark",
                chrome: "noheader nofooter noborders",
                height: 420,
                dnt: true,
                tweetLimit: 3,
              },
            ),
            new Promise((_, reject) => {
              window.setTimeout(
                () => reject(new Error("Timeline load timeout")),
                7000,
              );
            }),
          ]);

          if (cancelled) return;
          setIsTweetsLoading(false);
          setIsTweetsFailed(false);
        } catch {
          if (cancelled) return;
          setIsTweetsLoading(false);
          setIsTweetsFailed(true);
        }
      };

      mountTimeline();

      return () => {
        cancelled = true;
      };
    }

    setIsTweetsLoading(true);
    setIsTweetsFailed(false);
  }, [isWinnersOpen, winnersModalTab]);

  return (
    <main
      className={`relative min-h-screen w-full overflow-hidden select-none ${
        isWinnersOpen ? "cursor-auto" : "[cursor:none]"
      }`}
      suppressHydrationWarning
    >
      {!isWinnersOpen && <CustomCursor />}

      <div className="absolute inset-0 -z-10">
        <Image
          src={bg}
          alt="MoonXBT background"
          fill
          priority
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* Terminal snippet above dialog */}
      <div className="pointer-events-none absolute xl:right-[calc(2.5%-50px)] 3xl:right-[90px] bottom-[300px] md:bottom-[340px] z-10 hidden 2xl:block">
        <TerminalSnippet />
      </div>

      {/* Dialog + Profile pic (bottom-right) */}
      <div className="pointer-events-none absolute bottom-[152px] md:bottom-[280px] xl:right-[70px]  2xl:bottom-[240px] 2xl:right-[180px] 3xl:right-[240px] z-10 hidden xl:block">
        <div className="relative">
          <Image
            src={bubble}
            alt="Join the airdrop"
            className="relative z-10 transform -translate-x-8 -translate-y-2 2xl:-translate-x-12 3xl:-translate-x-16"
            width={280}
            height={120}
            draggable={false}
          />
          <div className="absolute -right-[50px] top-8 z-0 h-[120px] w-[120px] 2xl:h-[140px] 2xl:w-[140px] 3xl:h-[160px] 3xl:w-[160px] rounded-full ring-1 ring-black overflow-hidden drop-shadow-[5px_12px_4px_rgba(0,0,0,0.4)]">
            <Image
              src={moonPfp}
              alt="Moon profile"
              fill
              className="object-cover"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        <div className="relative mt-6">
          <Image
            src={iso}
            alt="MoonXBT mark"
            className="neon-moon mx-auto mb-4 md:mb-6"
            width={200}
            height={200}
            draggable={false}
          />
          <Image
            src={logo}
            alt="MoonXBT"
            priority
            className="mx-auto w-[110px] md:w-[210px] lg:w-[280px] h-auto"
            draggable={false}
          />
        </div>

        <div className="mb-10 mt-[90px] md:mt-[102px] lg:mt-[112px] flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setIsAuctionOpen(true)}
            className="cursor-none"
          >
            <span className="sr-only">Open bid flow</span>
            <div className="relative h-[56px] w-[160px] md:h-[64px] md:w-[216px] lg:h-[70px] lg:w-[246px] transition hover:brightness-110">
              <Image
                src={pinkBtn}
                alt="Bid for tomorrow's video"
                fill
                className="object-contain"
                priority
                draggable={false}
              />
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsWinnersOpen(true)}
            className="cursor-none"
          >
            <span className="sr-only">See previous winners</span>
            <div className="relative h-[56px] w-[160px] md:h-[64px] md:w-[216px] lg:h-[70px] lg:w-[246px] transition hover:brightness-110">
              <Image
                src={yellowBtn}
                alt="See previous winners"
                fill
                className="object-contain"
                draggable={false}
              />
            </div>
          </button>
        </div>

        <div className="relative">
          <Image
            src={cursor}
            alt="Pointer"
            className="pointer-events-none absolute -right-12 -top-6 hidden rotate-12 md:block"
            width={80}
            height={80}
            draggable={false}
          />
        </div>
      </div>

      <footer className="pointer-events-auto absolute inset-x-0 bottom-10 md:bottom-14 z-10">
        <div className="mx-auto flex items-center justify-center gap-5 md:gap-7 text-white/90">
          <a
            href="https://x.com/moonXBT_ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="cursor-none"
          >
            <SiX
              aria-hidden
              className="text-white opacity-90 hover:opacity-100 transition"
              size={32}
            />
          </a>
          <a
            href="https://warpcast.com/ai420z"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Farcaster"
            className="cursor-none"
          >
            <SiFarcaster
              aria-hidden
              className="text-white opacity-90 hover:opacity-100 transition"
              size={32}
            />
          </a>
          <a
            href="https://www.tiktok.com/@moonxbt.fun"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <SiTiktok aria-hidden className="text-white" size={32} />
          </a>
          <a
            href="https://t.me/A0X_Portal"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <SiTelegram aria-hidden className="text-white" size={32} />
          </a>
          <a
            href="https://www.instagram.com/moonxbt_ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <SiInstagram aria-hidden className="text-white" size={32} />
          </a>
          <a
            href="https://dexscreener.com/base/0xa1a65c284a2e01f0d9c9683edeab30d0835d1362"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dex Screener"
            className="cursor-none mt-1 -ml-3"
          >
            <Image
              src="/assets/dexlogo.png"
              alt="Dex Screener"
              width={42}
              height={42}
              className="opacity-90 hover:opacity-100 transition"
              draggable={false}
            />
          </a>
        </div>
        <p className="mx-auto mt-3 max-w-3xl px-6 text-[9px] md:text-[11px] leading-relaxed text-white/80 text-center">
          MoonXBT is an AI-powered content creator built on A0x and deployed on
          Base. She crafts one unique video daily based on the request of the
          highest auction bidder. All funds raised are used to purchase $A0X
          tokens, which are locked for 4 months. Afterward, 2% of the funds are
          airdropped weekly to the community.
        </p>
      </footer>
      {isWinnersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 cursor-auto">
          <div className="relative w-full max-w-2xl border border-white/25 bg-[#000] rounded-xl p-5 md:p-7 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              onClick={() => setIsWinnersOpen(false)}
              className="absolute right-3 top-3 h-10 w-10 rounded-full border border-white/40 bg-white/10 text-2xl leading-none hover:bg-white/20 cursor-pointer"
              aria-label="Close previous winners"
            >
              ×
            </button>

            <h2 className={`${press.className} text-sm md:text-base uppercase`}>
              Previous Winners
            </h2>
            <p className="mt-2 text-xs md:text-sm text-white/80">
              Check who won recent auctions and what they promoted.
            </p>

            <Tabs
              value={winnersModalTab}
              onValueChange={(value) =>
                setWinnersModalTab(value as "winners" | "tweets")
              }
              className="mt-6"
            >
              <TabsList className="mx-auto mb-5 flex h-auto w-full max-w-xl gap-2 rounded-xl border border-white/25 bg-white/10 p-1">
                <TabsTrigger
                  value="winners"
                  className="flex-1 rounded-lg px-4 py-2 text-xs font-semibold text-white/80 data-[state=active]:bg-[#133db2]/80 data-[state=active]:text-white"
                >
                  Past Winners
                </TabsTrigger>
                <TabsTrigger
                  value="tweets"
                  className="flex-1 rounded-lg px-4 py-2 text-xs font-semibold text-white/80 data-[state=active]:bg-[#133db2]/80 data-[state=active]:text-white"
                >
                  My Previous Tweets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="winners" className="m-0">
                {loadingWinnerDetails ? (
                  <div className="text-center text-white/80">Loading winner details...</div>
                ) : winnersToRender.length > 0 ? (
                  <div className="space-y-3">
                    {winnersToRender.map((winner, index) => {
                      const videoUrl = getWinnerVideoUrl(winner);
                      return (
                        <div
                          key={winner.id || `${winner.auctionId}-${winner.userAddress}-${index}`}
                          className="rounded-lg border border-white/20 bg-[#133db2]/75 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className={`${press.className} text-[10px] uppercase text-white/80`}>
                              {`Auction #${winner.auctionId}`}
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-[#ffd34d]">
                              {formatWinnerBid(winner.maxBid)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm md:text-base break-all">
                            {winner.userAddress
                              ? `${winner.userAddress.slice(0, 6)}...${winner.userAddress.slice(-4)}`
                              : ""}
                          </p>
                          {videoUrl && (
                            <video
                              src={videoUrl}
                              controls
                              className="mt-3 w-full rounded-lg border border-white/10"
                              style={{ maxHeight: 320 }}
                            />
                          )}
                          {!videoUrl && (
                            <div className="mt-3 rounded border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
                              Video unavailable for this auction entry.
                            </div>
                          )}
                          {winner.latestVideo?.createdAt && (
                            <div className="mt-2 text-xs text-white/60">
                              Date: {new Date(winner.latestVideo.createdAt).toLocaleString()}
                            </div>
                          )}
                          {winner.latestScript?.scriptUsed && (
                            <div className="mt-3 rounded border border-white/10 bg-black/30 p-2 text-xs md:text-sm text-white/90">
                              <span className="font-bold text-white/70">Script:</span>
                              <br />
                              {winner.latestScript.scriptUsed}
                            </div>
                          )}
                          {winner.project?.url && (
                            <a
                              href={winner.project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-block text-xs md:text-sm text-white underline underline-offset-2 hover:text-[#ffd34d]"
                            >
                              View promoted link
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : winnerError ? (
                  <div className="text-center text-red-400">{winnerError}</div>
                ) : (
                  <div className="rounded-lg border border-white/20 bg-[#133db2]/75 p-4">
                    <p className={`${press.className} text-[10px] uppercase text-white/80`}>
                      No winners yet
                    </p>
                    <p className="mt-2 text-sm text-white/90">
                      We are still collecting the first completed auction results.
                      Follow MoonXBT on X while the first winner comes in.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tweets" className="m-0 space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-white/25 bg-[#0d121d] min-h-[420px]">
                  <div
                    ref={tweetsContainerRef}
                    className="absolute inset-0 z-0"
                  />

                  {isTweetsLoading && (
                    <div className="absolute inset-0 z-10 bg-[#0d121d] p-4">
                      <div className="h-full w-full rounded-md border border-white/10 bg-[#111827] p-4 animate-pulse">
                        <div className="h-4 w-40 rounded bg-white/15" />
                        <div className="mt-4 h-3 w-full rounded bg-white/10" />
                        <div className="mt-2 h-3 w-[88%] rounded bg-white/10" />
                        <div className="mt-6 h-[290px] w-full rounded bg-white/10" />
                      </div>
                      <p className="mt-3 text-xs text-white/70 text-center">
                        Loading tweets...
                      </p>
                    </div>
                  )}

                  {isTweetsFailed && !isTweetsLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d121d] p-6 text-center">
                      <p className="text-sm text-white/85">
                        Couldn&apos;t load the embedded timeline on this
                        browser.
                      </p>
                      <a
                        href="https://x.com/moonXBT_ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex justify-center rounded-lg border border-white/25 bg-[#133db2]/75 px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3293] cursor-pointer"
                      >
                        Open Timeline on X
                      </a>
                    </div>
                  )}
                </div>
                <a
                  href="https://x.com/moonXBT_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center rounded-lg border border-white/25 bg-[#133db2]/75 px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3293] cursor-pointer"
                >
                  Open Profile on X
                </a>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
      <VideoAuctionSheet
        isOpen={isAuctionOpen}
        onClose={() => setIsAuctionOpen(false)}
      />
    </main>
  );
}
