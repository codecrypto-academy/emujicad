'use client'

import { DebugLabel } from '@/lib/debug'

interface RegistrationSubmittedCardProps {
  selectedRole: string
  showRegistrationSuccess: boolean
}

export function RegistrationSubmittedCard({ selectedRole, showRegistrationSuccess }: RegistrationSubmittedCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur-xl border border-green-200 dark:border-green-800 shadow-xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DebugLabel component="HomePage" section="RegistrationSubmittedCard" props={{ selectedRole, showRegistrationSuccess }} />
      <div className="relative">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
          ✅ Registration Submitted!
        </h2>
        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
          Your request for <strong>{selectedRole}</strong> role has been sent to the administrator.
        </p>
        <p className="text-sm text-green-600 dark:text-green-400 mb-6">
          Please wait for the administrator to review your request.
        </p>
      </div>
    </div>
  )
}

