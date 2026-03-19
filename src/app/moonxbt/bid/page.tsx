"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import { toast } from "@/components/shadcn/use-toast";
import { cn } from "@/lib/utils";

const PREVIEW_VIDEO_SRC = "/assets/output.mp4";

function getNextUtcMidnight(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
}

function formatTimeLeft(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export default function MoonXBTBidPage() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets[0]?.address ?? "";
  const [now, setNow] = useState(() => new Date());
  const [bidAmount, setBidAmount] = useState("");

  const auctionConfigured = Boolean(
    process.env.NEXT_PUBLIC_MOONXBT_AUCTION_ADDRESS &&
      process.env.NEXT_PUBLIC_MOONXBT_AUCTION_ABI
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const endTime = useMemo(() => getNextUtcMidnight(now), [now]);
  const timeLeft = useMemo(() => formatTimeLeft(endTime.getTime() - now.getTime()), [endTime, now]);

  const handleBid = () => {
    if (!auctionConfigured) {
      toast({
        title: "Auction contract not configured",
        description: "Set NEXT_PUBLIC_MOONXBT_AUCTION_ADDRESS and ABI to enable bids.",
      });
      return;
    }

    toast({
      title: "Bid flow not wired yet",
      description: "Contract ABI and bid function need to be mapped.",
    });
  };

  return (
    <main className="min-h-screen bg-[#0b0f17] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-violet-500/20 blur-[140px]" />
        <div className="absolute top-1/3 left-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            MoonXBT Daily Auction
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            Bid for the daily Moon slot on X
          </h1>
          <p className="text-sm text-white/50 max-w-2xl">
            Each day, one project wins the headline video post. All bids are in USDC on Base.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <section
            className={cn(
              "glassmorphism rounded-3xl p-6 md:p-8 border border-white/10",
              "bg-white/5"
            )}
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Time left
                  </p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-2xl font-semibold">
                      {timeLeft.hours}
                    </span>
                    <span className="text-white/40">:</span>
                    <span className="text-2xl font-semibold">
                      {timeLeft.minutes}
                    </span>
                    <span className="text-white/40">:</span>
                    <span className="text-2xl font-semibold">
                      {timeLeft.seconds}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">
                    Ends at {endTime.toUTCString().slice(17, 25)} UTC
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Current high bid
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {auctionConfigured ? "--" : "Not configured"}
                  </p>
                  <p className="mt-2 text-[11px] text-white/40">
                    Pulled from the onchain contract
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Bid token
                  </p>
                  <p className="mt-2 text-2xl font-semibold">USDC</p>
                  <p className="mt-2 text-[11px] text-white/40">Base network</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Place your bid
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="250.00"
                    className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <button
                    onClick={handleBid}
                    className={cn(
                      "rounded-xl px-5 py-3 text-sm font-medium transition-all",
                      "bg-white text-black hover:bg-white/80",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    disabled={!ready || !authenticated || !bidAmount}
                  >
                    Place bid
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
                  <span>
                    {authenticated
                      ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                      : "Connect a wallet to bid"}
                  </span>
                  {!authenticated && ready && (
                    <button
                      onClick={login}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      Connect wallet
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white/50">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="uppercase tracking-[0.25em] text-white/40">Rules</p>
                  <p className="mt-2 leading-relaxed">
                    One winner per day. Winning bid receives the featured Moon video post on X.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="uppercase tracking-[0.25em] text-white/40">Visibility</p>
                  <p className="mt-2 leading-relaxed">
                    The winning prompt shapes the script. Keep it short and sharp for max impact.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside
            className={cn(
              "glassmorphism rounded-3xl p-6 md:p-7 border border-white/10",
              "bg-white/5"
            )}
            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                Moon preview
              </p>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                <video
                  className="w-full h-[320px] object-cover"
                  src={PREVIEW_VIDEO_SRC}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                This is a short preview clip. The winner gets a custom mood, prompt, and final voiceover.
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/50">
                <p className="uppercase tracking-[0.25em] text-white/40">
                  Tip
                </p>
                <p className="mt-2 leading-relaxed">
                  Keep the prompt under 300 characters and describe the vibe you want Moon to deliver.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
