import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import { PageHeader } from '~/components/page-header';
import { useCurrentUser } from '~/lib/use-auth';

/**
 * Dashboard shell with a parallel `@analytics` slot. The main feed renders
 * through <Outlet/>; the analytics panel is matched independently and passed
 * in as the `analytics` prop.
 */
export default function DashboardLayout({ analytics }: { analytics: ReactNode }) {
  const user = useCurrentUser();
  return (
    <div>
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}
        description="Your tasks and projects at a glance."
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0">
          <Outlet />
        </div>
        <aside className="min-w-0">{analytics}</aside>
      </div>
    </div>
  );
}
