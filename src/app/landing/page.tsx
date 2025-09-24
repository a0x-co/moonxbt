"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Press_Start_2P } from "next/font/google";

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
import AirdropModal from "@/components/AirdropModal";
import { VideoAuctionSheet } from "@/components/VideoAuctionSheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const press = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function LandingPage() {
  const [isAirdropOpen, setIsAirdropOpen] = useState(false);
  const [isAuctionOpen, setIsAuctionOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  useEffect(() => {
    if (!comingSoonOpen) return;
    const t = setTimeout(() => setComingSoonOpen(false), 1800);
    return () => clearTimeout(t);
  }, [comingSoonOpen]);
  return (
    <main
      className="relative min-h-screen w-full overflow-hidden [cursor:none] select-none"
      suppressHydrationWarning
    >
      <CustomCursor />

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
          <TooltipProvider>
            <Tooltip open={comingSoonOpen}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setComingSoonOpen(true)}
                  className="cursor-none"
                >
                  <span className="sr-only">Bid coming soon</span>
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
              </TooltipTrigger>
              <TooltipContent side="top" className="cursor-none">
                <span>This functionality is coming soon</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            type="button"
            onClick={() => setIsAirdropOpen(true)}
            className="cursor-none"
          >
            <span className="sr-only">Open airdrop</span>
            <div className="relative h-[56px] w-[160px] md:h-[64px] md:w-[216px] lg:h-[70px] lg:w-[246px] transition hover:brightness-110">
              <Image
                src={yellowBtn}
                alt="Open airdrop"
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
            href="https://zora.co/@moonxbt"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Zora"
            className="cursor-none"
          >
            <Image
              src="/assets/zora.png"
              alt="Zora"
              width={32}
              height={32}
              className="opacity-90 hover:opacity-100 transition"
              style={{
                filter:
                  "invert(100%) sepia(100%) saturate(100%) hue-rotate(180deg) brightness(400%) contrast(100%)",
              }}
              draggable={false}
            />
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
        MoonXBT is an AI-powered content creator built on A0x and deployed on Base. She crafts one unique video daily based on the request of the highest auction bidder. All funds raised are used to purchase $A0X tokens, which are locked for 4 months. Afterward, 2% of the funds are airdropped weekly to the community.
</p>
      </footer>
      <AirdropModal
        isOpen={isAirdropOpen}
        onClose={() => setIsAirdropOpen(false)}
      />
      <VideoAuctionSheet
        isOpen={isAuctionOpen}
        onClose={() => setIsAuctionOpen(false)}
      />
    </main>
  );
}
