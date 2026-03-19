"use client";

import React from "react";
import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { Wallet } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import FarcasterIcon from "@/components/Icons/FarcasterIcon";
import { DotsAnimation } from "@/components/Icons/DotsAnimation";
import Spinner from "@/components/Spinner";
import { useAdminPermissions } from "@/hooks/superadmin/useAdminPermissions";

interface AdminAccessGuardProps {
  agent: any;
  children: React.ReactNode;
}

/**
 * Componente de protección de acceso para SuperAdmin
 * Reutiliza exactamente la misma lógica y UI del dashboard existente
 */
export const AdminAccessGuard: React.FC<AdminAccessGuardProps> = ({ 
  agent, 
  children 
}) => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const { hasAccess, isLoading } = useAdminPermissions(agent);

  const isTwitterAuth = searchParams.get("auth") === "twitter";
  const isFarcasterAuth = searchParams.get("auth") === "farcaster";

  // Loading state - verificando acceso
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
        <div className="flex items-center gap-2 ml-2">
          Verifying admin access
          <DotsAnimation />
        </div>
      </div>
    );
  }

  // Twitter auth pero no user
  if (isTwitterAuth && !user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <FaXTwitter className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-4">
            You need to sign in with Twitter
          </h2>
          <p className="mb-6 text-gray-600">
            To access this agent&apos;s admin dashboard, you need to sign in with
            the Twitter account that created it. Use the &quot;Connect&quot;
            button in the navigation bar.
          </p>
        </div>
      </div>
    );
  }

  // Farcaster auth pero no user
  if (isFarcasterAuth && !user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <FarcasterIcon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold mb-4">
            You need to sign in with Farcaster
          </h2>
          <p className="mb-6 text-gray-600">
            To access this agent&apos;s admin dashboard, you need to sign in with
            the Farcaster account that created it. Use the &quot;Connect&quot;
            button in the navigation bar.
          </p>
        </div>
      </div>
    );
  }

  // Wallet requerido pero no conectado
  if (!isTwitterAuth && 
      !isFarcasterAuth && 
      wallets.length > 0 && 
      !wallets[0].address) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h2 className="text-2xl font-bold mb-4">
            You need to connect your wallet
          </h2>
          <p className="mb-6 text-gray-600">
            To access this agent&apos;s admin dashboard, you need to connect the
            wallet that created it. Use the &quot;Connect&quot; button in the
            navigation bar.
          </p>
        </div>
      </div>
    );
  }

  // Access denied - mismo UI que dashboard existente
  if (!hasAccess) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Admin Access Denied
          </h2>

          <p className="mb-6 text-gray-600">
            You do not have admin permissions for this agent. 
            Only the creator can access administrative functions.
          </p>
          
          <Link
            href={`/agent/${agent?.name || 'unknown'}`}
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-full transition-colors duration-300"
          >
            Go back to agent page
          </Link>
        </div>
      </div>
    );
  }

  // Access granted - renderizar children
  return <>{children}</>;
};