import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  CloudSun,
  FileText,
  LayoutDashboard,
  Network,
  Sprout,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const appNav: AppNavItem[] = [
  { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/app/decisions", label: "Applications", icon: FileText },
  { to: "/app/farmers", label: "Borrowers", icon: Users },
  { to: "/app/portfolio", label: "Portfolio risk", icon: Wallet },
  { to: "/app/climate", label: "Climate exposure", icon: CloudSun },
  { to: "/app/analytics", label: "Reports", icon: BarChart3 },
  { to: "/app/graph", label: "Connections", icon: Network },
];

export function currentNavLabel(pathname: string): string {
  const match = appNav
    .slice()
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => (n.to === "/app" ? pathname === "/app" : pathname.startsWith(n.to)));
  return match?.label ?? "Mizizi";
}

export function MiziziLogo({ className }: { className?: string }) {
  return (
    <Link to="/" className={className}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <Sprout className="h-4 w-4" />
      </span>
      <span className="font-display text-xl leading-none">Mizizi</span>
    </Link>
  );
}
