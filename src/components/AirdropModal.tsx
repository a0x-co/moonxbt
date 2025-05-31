import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";

interface AirdropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const asciiLogoLines = [
  "                                                /$$   /$$ /$$$$$$$  /$$$$$$$$",
  "                                               | $$  / $$| $$__  $$|__  $$__/",
  " /$$$$$$/$$$$   /$$$$$$   /$$$$$$  /$$$$$$$ |  $$/ $$/| $$    $$   | $$",
  "| $$_  $$_  $$ /$$__  $$ /$$__  $$| $$__  $$    $$$$/ | $$$$$$$    | $$",
  "| $$   $$   $$| $$    $$| $$    $$| $$    $$  >$$  $$ | $$__  $$   | $$",
  "| $$ | $$ | $$| $$  | $$| $$  | $$| $$  | $$ /$$/   $$| $$    $$   | $$",
  "| $$ | $$ | $$|  $$$$$$/|  $$$$$$/| $$  | $$| $$    $$| $$$$$$$/   | $$",
  "|__/ |__/ |__/  ______/   ______/ |__/  |__/|__/  |__/|_______/    |__/",
];

const AirdropModal = ({ isOpen, onClose }: AirdropModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        open={isOpen}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[98vw] sm:max-w-2xl mx-1 sm:mx-2 transform overflow-y-auto overflow-x-hidden max-h-[100dvh] bg-[#1752F0] border-2 border-white/20  text-white relative">
                {/* Scanline overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{
                    background:
                      "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)",
                  }}
                />
                {/* Background video */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <video
                    src="/assets/moonxbt.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-20 blur-sm select-none pointer-events-none"
                  />
                </div>
                {/* Title Bar */}
                <div className="bg-[#1752F0] border-b-2 border-white/20 px-4 py-1 flex justify-between items-center relative z-30">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">_</span>
                    </div>
                    <span className="text-white  text-sm tracking-wide">
                      MOONXBT AIRDROP
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-4 h-4 bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <span className="text-white text-xs">×</span>
                  </button>
                </div>
                <div className="p-6 space-y-6 relative z-10">
                  {/* Animated mascot/logo */}
                  <div className="flex justify-center mb-1 sm:mb-2">
                    <Image
                      src="/assets/moonxbt.png"
                      alt="MoonXBT"
                      width={72}
                      height={72}
                      className="rounded-full border-2 border-white shadow-[0_0_8px_2px_#fff,0_0_24px_4px_#fff8,0_0_40px_8px_#fff4] animate-bob"
                    />
                  </div>
                  {/* ASCII Art Logo */}
                  <pre className="hidden sm:block text-white text-[6px] leading-none select-none text-center drop-shadow-[0_0_2px_white] tracking-widest overflow-x-auto whitespace-pre max-w-full mb-1 sm:mb-2 break-words">
                    {asciiLogoLines.join("\n")}
                  </pre>
                  {/* Token Distribution */}
                  <div className="border-2 border-white/30 bg-[#1752F0]/80 p-1 sm:p-6 mb-1 sm:mb-4">
                    <div className="text-white text-sm sm:text-3xl mb-2 sm:mb-6 text-center break-words font-orbitron">
                      [ TOKEN_DISTRIBUTION ]
                    </div>
                    <div className="font-[\'Orbitron\',_monospace] text-[clamp(24px,18vw,80px)] sm:text-[clamp(48px,14vw,180px)] font-extrabold tracking-widest mb-2 sm:mb-6 special-twenty text-center break-words">
                      20%
                    </div>
                    <div className="text-white/80  text-xs sm:text-2xl text-center break-words">
                      of total supply for airdrop
                    </div>
                  </div>
                  {/* Participation Steps */}
                  <div className="border-2 border-white/30 bg-[#1752F0]/80 p-1 sm:p-6 mb-1 sm:mb-4">
                    <div className="text-white text-sm sm:text-3xl mb-2 sm:mb-6 text-center break-words font-orbitron">
                      [ PARTICIPATION_STEPS ]
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-1 sm:gap-4">
                        <span className="text-[#4ade80] font-orbitron text-xs sm:text-xl">
                          [ 1 ]
                        </span>
                        <span className="text-white font-orbitron text-xs sm:text-2xl">
                          &gt; Visit MoonXBT Mini-app
                        </span>
                      </div>
                      <p className="text-white/60  text-[10px] sm:text-xl ml-2 sm:ml-10 mb-2 sm:mb-6 break-words">
                        Connect wallet & verify socials
                      </p>
                      <div className="flex items-center gap-1 sm:gap-4">
                        <span className="text-[#4ade80] font-orbitron text-xs sm:text-xl">
                          [ 2 ]
                        </span>
                        <span className="text-white font-orbitron text-xs sm:text-2xl">
                          &gt; Follow MoonXBT
                        </span>
                      </div>
                      <p className="text-white/60  text-[10px] sm:text-xl ml-2 sm:ml-10 mb-2 sm:mb-6 break-words">
                        Maximize rewards by following Moon on all her socials
                      </p>
                    </div>
                  </div>
                  {/* Participation Steps */}
                  <div className="border-2 border-white/30 bg-[#1752F0]/80 p-1 sm:p-6 mb-1 sm:mb-4">
                    <div className="text-white text-sm sm:text-3xl mb-2 sm:mb-6 text-center break-words font-orbitron">
                      [ PARTICIPATION_STEPS ]
                    </div>
                    <div className="grid grid-cols-[40px_1fr] grid-rows-2 gap-4 justify-start">
                      <span className="text-[#4ade80] text-center font-orbitron text-xs sm:text-xl">
                        [ 1 ]
                      </span>
                      <div className="flex flex-col items-start gap-1 sm:gap-4">
                        <span className="text-white font-orbitron text-xs sm:text-2xl !leading-none">
                          &gt; Visit MoonXBT Mini-app
                        </span>
                        <p className="text-white/60  text-[10px] sm:text-xl break-words">
                          Connect wallet & verify socials
                        </p>
                      </div>
                      <span className="text-[#4ade80] text-center font-orbitron text-xs sm:text-xl">
                        [ 2 ]
                      </span>
                      <div className="flex flex-col items-start gap-1 sm:gap-4">
                        <span className="text-white font-orbitron text-xs sm:text-2xl !leading-none">
                          &gt; Follow MoonXBT
                        </span>
                        <p className="text-white/60  text-[10px] sm:text-xl break-words">
                          Maximize rewards by following Moon on all her socials
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Why Follow Moon */}
                  <div className="border-2 border-white/30 bg-[#1752F0]/80 p-1 sm:p-6 mb-1 sm:mb-4">
                    <div className="text-white font-orbitron text-sm sm:text-3xl mb-2 sm:mb-6 text-center break-words">
                      [ WHY_FOLLOW_MOON ]
                    </div>
                    <div className="text-white/80 font-orbitron space-y-1 sm:space-y-3 text-[10px] sm:text-2xl text-left break-words">
                      <p>
                        &gt; MoonXBT is an AI influencer creating 1 video per
                        day
                      </p>
                      <p>
                        &gt; Her objective is to help projects grow and succeed
                      </p>
                      <p>&gt; More followers = more exposure = more success</p>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                    <button
                      onClick={onClose}
                      className="px-8 py-2 bg-[#1752F0] hover:bg-[#2563eb] text-white font-orbitron text-sm sm:text-2xl border-2 border-white/30 transition-colors"
                    >
                      [ CLOSE ]
                    </button>
                    <a
                      href="https://farcaster.xyz/miniapps/lUdZ2BEBiJf0/moonxbt-airdrop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-2 bg-[#1752F0] hover:bg-[#2563eb] text-white font-orbitron text-sm sm:text-2xl border-2 border-white/30 transition-colors"
                    >
                      [ VISIT_MINIAPP ]
                    </a>
                  </div>
                  {/* Blinking cursor */}
                  <div className="flex justify-center mt-4">
                    <span className="inline-block w-3 h-5 bg-white animate-blink align-bottom" />
                  </div>
                </div>
                <style jsx global>{`
                  @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap");
                  .special-twenty {
                    background: linear-gradient(
                      90deg,
                      #00fff0 0%,
                      #00bfff 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 2px 8px #00fff088, 0 0px 1px #fff, 0 0 0 #000;
                    letter-spacing: 0.12em;
                    position: relative;
                    font-family: "Orbitron", monospace !important;
                  }
                  .special-twenty::after {
                    content: "";
                    display: block;
                    width: 100%;
                    height: 8px;
                    background: linear-gradient(
                      90deg,
                      #00fff0 0%,
                      #00bfff 100%
                    );
                    opacity: 0.2;
                    filter: blur(6px);
                    position: absolute;
                    left: 0;
                    bottom: -10px;
                    z-index: 0;
                    border-radius: 8px;
                  }
                  @keyframes bob {
                    0% {
                      transform: translateY(0) rotate(0deg);
                    }
                    50% {
                      transform: translateY(-8px) rotate(8deg);
                    }
                    100% {
                      transform: translateY(0) rotate(0deg);
                    }
                  }
                  .animate-bob {
                    animation: bob 2.8s ease-in-out infinite;
                  }
                  @keyframes blink {
                    0%,
                    50% {
                      opacity: 1;
                    }
                    51%,
                    100% {
                      opacity: 0;
                    }
                  }
                  .animate-blink {
                    animation: blink 1s steps(1) infinite;
                  }
                `}</style>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AirdropModal;
