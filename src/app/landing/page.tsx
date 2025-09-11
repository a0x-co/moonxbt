"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Press_Start_2P } from "next/font/google";

import bg from "./png/Background_main_1.jpg";
import logo from "./png/Logotipo_moonXBT_1@2x-8.png";
import iso from "./png/Isotipo_moonXBT_1@2x-8.png";
import bubble from "./png/globo_texto_1@2x-8.png";
import cursor from "./png/Cursor_1@2x-8.png";
import pinkBtn from "./png/Boton rosa@2x-8.png";
import yellowBtn from "./png/Boton Amarillo@2x-8.png";
import coinIcon from "./png/coin_icon_1@2x-8.png";
import giftIcon from "./png/gift_icon_1@2x-8.png";
import moonPfp from "./png/moon.jpeg";
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
      <div className="pointer-events-none absolute xl:right-[10px] 3xl:right-[90px] bottom-[300px] md:bottom-[340px] z-10 hidden xl:block">
        <TerminalSnippet />
      </div>

      {/* Dialog + Profile pic (bottom-right) */}
      <div className="pointer-events-none absolute xl:right-[70px] 2xl:right-[180px] 3xl:right-[240px] bottom-[152px] md:bottom-[184px] z-10 hidden xl:block">
        <div className="relative">
          <Image
            src={bubble}
            alt="Join the airdrop"
            className="relative z-10 transform -translate-x-4 -translate-y-8"
            width={280}
            height={120}
            draggable={false}
          />
          <div className="absolute inset-0 -top-6 z-20 mt-3">
            <span
              className={`${press.className} text-black text-[10px] md:text-xs lg:text-sm leading-tight tracking-wide`}
            >
              Let&apos;s create *.*
            </span>
          </div>
          <div className="absolute -right-[50px] top-8 z-0 h-[116px] w-[116px] rounded-full ring-1 ring-black overflow-hidden drop-shadow-[5px_12px_4px_rgba(0,0,0,0.4)]">
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
            width={72}
            height={72}
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
              size={22}
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
              size={22}
            />
          </a>
          <a
            href="https://www.tiktok.com/@moonxbt.fun"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <SiTiktok aria-hidden className="text-white" size={22} />
          </a>
          <a
            href="https://t.me/A0X_Portal"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <SiTelegram aria-hidden className="text-white" size={22} />
          </a>
          <a
            href="https://www.instagram.com/moonxbt_ai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <SiInstagram aria-hidden className="text-white" size={22} />
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
              width={22}
              height={22}
              className="opacity-90 hover:opacity-100 transition"
              draggable={false}
            />
          </a>
          <a
            href="https://dexscreener.com/base/0xa1a65c284a2e01f0d9c9683edeab30d0835d1362"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dex Screener"
            className="cursor-none"
          >
            <Image
              src="/assets/dexlogo.png"
              alt="Dex Screener"
              width={22}
              height={22}
              className="opacity-90 hover:opacity-100 transition"
              draggable={false}
            />
          </a>
        </div>
        <p className="mx-auto mt-3 max-w-3xl px-6 text-[9px] md:text-[11px] leading-relaxed text-white/80 text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
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
