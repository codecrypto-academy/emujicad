'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole, UserStatus } from '@/contracts/config';
import { useUserInfo } from '@/hooks/useContractReads';
import { useIsPaused } from '@/hooks/usePause';
import { useAccount } from 'wagmi';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Plus, List, ArrowLeftRight, User, Pause } from 'lucide-react';
import { validateUserInfo, validateUserInfoTuple } from '@/lib/validation';
import type { UserInfo } from '@/types';

export function QuickActions() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: rawUserInfo, isLoading } = useUserInfo(address);
  const { data: isPaused } = useIsPaused();
  
  // Validación robusta de userInfo
  const userInfo = rawUserInfo
    ? (Array.isArray(rawUserInfo)
        ? validateUserInfoTuple(rawUserInfo)
        : validateUserInfo(rawUserInfo))
    : undefined;

  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see available actions
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!userInfo || userInfo.id === BigInt(0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Register and get approved to unlock actions
          </p>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push('/profile')}
          >
            <User className="h-4 w-4 mr-2" />
            Request Role
          </Button>
        </CardContent>
      </Card>
    );
  }

  const role = userInfo.role;
  const status = Number(userInfo.status);

  if (status !== UserStatus.Approved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Your account needs to be approved to perform actions
          </p>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push('/tokens')}
          >
            <List className="h-4 w-4 mr-2" />
            View All Tokens
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isPaused === true && (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
              <strong>⚠️ Contrato Pausado:</strong> No puedes crear tokens ni hacer transferencias mientras el contrato esté pausado.
            </AlertDescription>
          </Alert>
        )}
        {Number(role) === UserRole.Producer && (
          <Button
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
            onClick={() => router.push('/tokens/create?type=raw')}
            disabled={isPaused === true}
            aria-label="Create new raw material token"
            aria-disabled={isPaused === true}
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Create Raw Material
          </Button>
        )}
        {Number(role) === UserRole.Factory && (
          <Button
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
            onClick={() => router.push('/tokens/create?type=product')}
            disabled={isPaused === true}
            aria-label="Create new finished product token"
            aria-disabled={isPaused === true}
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Create Product
          </Button>
        )}
        <Button
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
          variant="outline"
          onClick={() => router.push('/tokens')}
          aria-label="View all my tokens"
        >
          <List className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
          My Tokens
        </Button>
        <Button
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
          variant="outline"
          onClick={() => router.push('/transfers')}
          disabled={isPaused === true}
          aria-label="View all transfers"
          aria-disabled={isPaused === true}
        >
          <ArrowLeftRight className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-180" />
          Transfers
        </Button>
      </CardContent>
    </Card>
  );
}
