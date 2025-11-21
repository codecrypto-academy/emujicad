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

export function QuickActions() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: userInfo, isLoading } = useUserInfo(address);
  const { data: isPaused } = useIsPaused();

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

  if (!userInfo || userInfo[0] === 0n) {
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

  const role = userInfo[2];
  const status = userInfo[3];

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
        {isPaused && (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
              <strong>⚠️ Contrato Pausado:</strong> No puedes crear tokens ni hacer transferencias mientras el contrato esté pausado.
            </AlertDescription>
          </Alert>
        )}
        {role === UserRole.Producer && (
          <Button
            className="w-full"
            onClick={() => router.push('/tokens/create?type=raw')}
            disabled={isPaused}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Raw Material
          </Button>
        )}
        {role === UserRole.Factory && (
          <Button
            className="w-full"
            onClick={() => router.push('/tokens/create?type=product')}
            disabled={isPaused}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        )}
        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push('/tokens')}
        >
          <List className="h-4 w-4 mr-2" />
          My Tokens
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push('/transfers')}
          disabled={isPaused}
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Transfers
        </Button>
      </CardContent>
    </Card>
  );
}
