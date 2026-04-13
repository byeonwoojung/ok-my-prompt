'use client';

import { ThemeProvider } from 'next-themes';
import { useSessionSync } from '@/hooks/use-session-sync';

function SessionSyncProvider({ children }: { children: React.ReactNode }) {
  useSessionSync();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionSyncProvider>{children}</SessionSyncProvider>
    </ThemeProvider>
  );
}
