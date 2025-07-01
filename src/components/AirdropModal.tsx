import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";

interface AirdropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AirdropModal = ({ isOpen, onClose }: AirdropModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Flat blue background */}
          <div className="fixed inset-0 z-0 bg-[#1a6aff]" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto z-10">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Responsive miniapp-style card */}
              <Dialog.Panel className="w-full max-w-[98vw] sm:max-w-sm mx-auto bg-[#1a6aff] border border-white rounded-md sm:rounded-lg text-white relative px-0 pt-0 pb-4 flex flex-col items-center">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 flex items-center justify-center bg-[#1a6aff] hover:bg-[#1752f0] rounded-full text-2xl font-bold text-white z-10 border border-white"
                  aria-label="Close"
                >
                  ×
                </button>
                {/* Logo */}
                <div className="flex justify-center mt-6 sm:mt-7 mb-2">
                  <div className="rounded-full border border-white p-1 bg-[#1a6aff]">
                    <Image
                      src="/assets/moonxbt.png"
                      alt="MoonXBT"
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </div>
                </div>
                {/* TOKEN_DISTRIBUTION Section */}
                <div className="w-[96%] border border-white rounded-md sm:rounded-lg bg-[#1a6aff] px-2 py-4 sm:px-4 sm:py-6 flex flex-col items-center mb-4 sm:mb-6">
                  <div className="text-white font-mono text-sm sm:text-lg mb-2 sm:mb-3 tracking-widest text-center uppercase break-words">[ TOKEN_DISTRIBUTION ]</div>
                  <div className="font-mono text-3xl sm:text-5xl font-extrabold tracking-widest mb-2 text-center">20%</div>
                  <div className="text-white text-sm sm:text-base text-center font-mono font-light mt-1 sm:mt-2 break-words">of total supply for airdrop</div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-[96%]">
                  <a
                    href="https://farcaster.xyz/miniapps/lUdZ2BEBiJf0/moonxbt-airdrop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 sm:py-3 bg-[#3bb3ff] hover:bg-[#1752f0] text-white font-mono text-base sm:text-lg rounded border border-white text-center font-bold transition-all"
                  >
                    Are you on Farcaster?
                  </a>
                  <a
                    href="https://airdrop.moonxbt.fun/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 sm:py-3 bg-[#1752f0] hover:bg-[#3bb3ff] text-white font-mono text-base sm:text-lg rounded border border-white text-center font-bold transition-all"
                  >
                    Are you on X?
                  </a>
                </div>
                {/* Blinking cursor for style */}
                <div className="flex justify-center mt-6 sm:mt-8">
                  <span className="inline-block w-3 h-5 bg-white animate-blink align-bottom rounded" />
                </div>
                <style jsx global>{`
                  @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap");
                  @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                  }
                  .animate-blink { animation: blink 1s steps(1) infinite; }
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
