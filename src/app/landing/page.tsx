import Image from "next/image";
import Link from "next/link";
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

const press = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function LandingPage() {
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

      {/* Dialog + Profile pic (bottom-right) */}
      <div className="pointer-events-none absolute right-[90px] bottom-[152px] md:bottom-[184px] z-10 hidden md:block">
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
          <Link href="/" className="cursor-none">
            <span className="sr-only">Enter app</span>
            <div className="relative h-[56px] w-[160px] md:h-[64px] md:w-[216px] lg:h-[70px] lg:w-[246px] transition hover:brightness-110">
              <Image
                src={pinkBtn}
                alt="Enter app"
                fill
                className="object-contain"
                priority
                draggable={false}
              />
            </div>
          </Link>
          <Link href="/leaderboard" className="cursor-none">
            <span className="sr-only">View leaderboard</span>
            <div className="relative h-[56px] w-[160px] md:h-[64px] md:w-[216px] lg:h-[70px] lg:w-[246px] transition hover:brightness-110">
              <Image
                src={yellowBtn}
                alt="View leaderboard"
                fill
                className="object-contain"
                draggable={false}
              />
            </div>
          </Link>
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

      <Image
        src={coinIcon}
        alt="Coin"
        className="pointer-events-none absolute left-6 bottom-10 h-auto w-[48px] md:w-[64px] lg:w-[72px] animate-bob opacity-80"
        draggable={false}
      />
      <Image
        src={giftIcon}
        alt="Gift"
        className="pointer-events-none absolute right-6 top-20 h-auto w-[56px] md:w-[72px] lg:w-[84px] animate-bob opacity-90"
        draggable={false}
      />

      <footer className="pointer-events-auto absolute inset-x-0 bottom-10 md:bottom-14 z-10">
        <div className="mx-auto flex items-center justify-center gap-5 md:gap-7 text-white/90">
          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="cursor-none"
          >
            <Image
              src="/x.png"
              alt="X"
              width={22}
              height={22}
              className="opacity-90 hover:opacity-100 transition"
              draggable={false}
            />
          </a>
          <a
            href="https://www.farcaster.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Farcaster"
            className="cursor-none"
          >
            <Image
              src="/farcaster.png"
              alt="Farcaster"
              width={22}
              height={22}
              className="opacity-90 hover:opacity-100 transition"
              draggable={false}
            />
          </a>
          <a
            href="https://www.tiktok.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path d="M13.5 3h3.2c.3 2.2 1.7 3.6 3.8 3.8V10c-1.6-.1-3-.6-4.4-1.5v6.3c0 3.7-2.7 6.2-6.3 6.2-3.3 0-6-2.7-6-6 0-3.2 2.5-5.8 5.7-6 .6 0 1.3.1 1.9.3v3.3c-.5-.2-1-.3-1.6-.3-1.6.1-2.8 1.4-2.8 3 0 1.7 1.4 3.1 3.2 3.1 1.8 0 3.1-1.3 3.1-3.1V3z" />
            </svg>
          </a>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path d="M21.9 4.1c.4.2.5.6.4 1l-3.5 14.8c-.1.5-.6.7-1 .5l-4.1-2.9-2 2c-.2.2-.6.1-.7-.2l-.1-3.4 7.8-7-9.6 6.1-3.3-1.1c-.5-.2-.5-.9.1-1.1L21 4.1c.3-.1.6-.1.9 0z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="opacity-90 hover:opacity-100 transition cursor-none"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path d="M7 2h10c2.8 0 5 2.2 5 5v10c0 2.8-2.2 5-5 5H7c-2.8 0-5-2.2-5-5V7c0-2.8 2.2-5 5-5zm0 2C5.3 4 4 5.3 4 7v10c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3V7c0-1.7-1.3-3-3-3H7zm5 3.5A5.5 5.5 0 1112 20a5.5 5.5 0 010-11zm0 2A3.5 3.5 0 1015.5 13 3.5 3.5 0 0012 9.5zM18 6.5a1 1 0 11-1 1 1 1 0 011-1z" />
            </svg>
          </a>
          <a
            href="https://zora.co/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Zora"
            className="cursor-none"
          >
            <Image
              src="/zora.png"
              alt="Zora"
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
    </main>
  );
}
