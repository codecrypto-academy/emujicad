'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccount } from 'wagmi';
import { Shield, User, CheckCircle } from 'lucide-react';
import { DebugLabel } from '@/lib/debug';

export function AdminProfileCard() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <Card>
        <DebugLabel component="AdminProfileCard" section="NotConnectedState" props={{ isConnected, hasAddress: !!address }} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Admin Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please connect your wallet to view your profile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/50 transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-left-4">
      <DebugLabel component="AdminProfileCard" section="MainContent" props={{ isConnected, hasAddress: !!address }} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Administrator Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Wallet Address */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <User className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Wallet Address
              </p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                {address}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </p>
              <Badge className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
                <Shield className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </p>
              <Badge variant="default" className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Full Access
              </Badge>
            </div>
          </div>

          {/* Permissions */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Permissions
            </p>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span>Manage user registrations and approvals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span>Pause/unpause contract operations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span>View all system statistics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span>Full administrative control</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

