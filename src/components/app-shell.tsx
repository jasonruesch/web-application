import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  IconButton,
} from '@jasonruesch/react';
import {
  FolderKanban,
  LayoutDashboard,
  Layers,
  Menu,
  Settings as SettingsIcon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { NavItem } from '~/components/app-link';
import { ThemeToggleButton } from '~/components/appearance';
import { UserMenu } from '~/components/user-menu';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-md bg-accent text-on-accent">
        <Layers size={18} aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight">TaskFlow</span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavItem
          key={to}
          to={to}
          end={to === '/dashboard'}
          icon={<Icon size={18} aria-hidden />}
          onClick={onNavigate}
        >
          {label}
        </NavItem>
      ))}
    </nav>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IconButton variant="ghost" aria-label="Open menu" className="md:hidden">
          <Menu size={20} aria-hidden />
        </IconButton>
      </DialogTrigger>
      {/* Override the centered modal styling into a left edge-anchored,
          full-height sidebar drawer that slides in from the left. */}
      <DialogContent
        className="left-0 top-0 flex h-dvh w-64 max-w-[85vw] translate-x-0 translate-y-0 flex-col items-stretch gap-6 rounded-none border-y-0 border-l-0 border-r p-5 [--tw-enter-scale:1] [--tw-exit-scale:1] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
      >
        <DialogTitle>
          <BrandMark />
        </DialogTitle>
        {/* Close the drawer when a destination is chosen. */}
        <NavList onNavigate={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar (desktop) — fixed; does not scroll with the main content */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-surface px-4 py-5 md:flex">
        <BrandMark />
        <NavList />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <MobileNav />
            <div className="md:hidden">
              <BrandMark />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggleButton />
            <UserMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
