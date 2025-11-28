'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRole, UserStatus } from '@/contracts/config';
import { useUserInfo } from '@/hooks/useContractReads';
import { useAccount } from 'wagmi';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Shield, CheckCircle, Clock, XCircle, Ban } from 'lucide-react';
import { validateUserInfo, validateUserInfoTuple } from '@/lib/validation';
import type { UserInfo } from '@/types';
import { DebugLabel, DEBUG_MODE } from '@/lib/debug';

export function UserProfileCard() {
  const { address, isConnected } = useAccount();
  const { data: rawUserInfo, isLoading } = useUserInfo(address);
  
  // Validación robusta de userInfo
  const userInfo = rawUserInfo
    ? (Array.isArray(rawUserInfo)
        ? validateUserInfoTuple(rawUserInfo)
        : validateUserInfo(rawUserInfo))
    : undefined;

  if (!isConnected || !address) {
    return (
      <Card style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <DebugLabel component="UserProfileCard" section="NotConnectedState" props={{ isConnected, hasAddress: !!address }} position="top-right" offset={4} />
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Please connect your wallet to view your profile
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <DebugLabel component="UserProfileCard" section="LoadingState" props={{ isLoading }} position="top-right" offset={4} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!userInfo || userInfo.id === BigInt(0)) {
    return (
      <Card className="border-yellow-500/50 transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-left-4" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <DebugLabel component="UserProfileCard" section="NotRegisteredState" props={{ hasUserInfo: !!userInfo }} position="top-right" offset={4} />
        <CardContent className="pt-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You are not registered yet. Please request a role to get started.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Address:</span>
              <span className="font-mono text-xs">{address.slice(0, 6) + '...' + address.slice(-4)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleLabel = (roleValue: bigint) => {
    const role = Number(roleValue);
    if (role === UserRole.Producer) return 'Producer';
    if (role === UserRole.Factory) return 'Factory';
    if (role === UserRole.Retailer) return 'Retailer';
    if (role === UserRole.Consumer) return 'Consumer';
    return 'Unknown';
  };

  const getRoleColor = (roleValue: bigint) => {
    const role = Number(roleValue);
    if (role === UserRole.Producer) return 'text-blue-500';
    if (role === UserRole.Factory) return 'text-purple-500';
    if (role === UserRole.Retailer) return 'text-orange-500';
    if (role === UserRole.Consumer) return 'text-green-500';
    return 'text-gray-500';
  };

  const status = Number(userInfo.status);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-left-4" style={DEBUG_MODE ? { border: '3px solid rgba(0, 0, 255, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
      <DebugLabel component="UserProfileCard" section="MainContent" props={{ hasUserInfo: !!userInfo, userStatus: status }} position="top-right" offset={4} />
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">User ID</span>
          <Badge variant="outline">#{userInfo.id.toString()}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Address</span>
          <span className="font-mono text-xs">{userInfo.userAddress.slice(0, 6) + '...' + userInfo.userAddress.slice(-4)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Role
          </span>
          <span className={'font-semibold ' + getRoleColor(userInfo.role)}>{getRoleLabel(userInfo.role)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {status === UserStatus.Approved ? (
            <Badge variant="default" className="bg-green-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Approved
            </Badge>
          ) : status === UserStatus.Pending ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
          ) : status === UserStatus.Rejected ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Rejected
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Ban className="h-3 w-3" />
              Canceled
            </Badge>
          )}
        </div>
        {status === UserStatus.Pending && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Your role request is pending approval by an administrator.
            </p>
          </div>
        )}
        {status === UserStatus.Rejected && (
          <div className="pt-3 border-t">
            <p className="text-xs text-destructive">
              Your role request was rejected. Please contact an administrator.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
