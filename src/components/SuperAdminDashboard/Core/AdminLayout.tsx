"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminLayoutProps {
  agent: any;
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ agent, children }) => {
  return (
    <main className="min-h-screen w-[99vw] overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          {agent && (
            <Link
              href={`/agent/${agent.name}/dashboard`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                       bg-white text-gray-700 transition-all duration-300 
                       border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05)]
                       hover:shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_20px_rgba(59,130,246,0.1)]
                       hover:border-blue-100 hover:text-blue-600 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">SuperAdmin</span>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
};