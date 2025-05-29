import { AirdropParticipantsTable } from "@/components/AirdropParticipantsTable";

export default function AirdropDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1c3f] to-[#1752F0] flex flex-col items-center py-12">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold font-mono text-white tracking-widest uppercase text-center mb-10 drop-shadow-lg">
          Airdrop Dashboard
        </h1>
        <AirdropParticipantsTable />
      </div>
    </div>
  );
}
