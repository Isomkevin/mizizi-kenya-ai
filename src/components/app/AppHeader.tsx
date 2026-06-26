import { Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Plus,
  Search,
  User,
} from "lucide-react";

import { currentNavLabel } from "@/components/app/nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { quickActions } from "@/lib/mock/dashboard";

interface AppHeaderProps {
  pathname: string;
  onSearchOpen: () => void;
}

export function AppHeader({ pathname, onSearchOpen }: AppHeaderProps) {
  const pageLabel = currentNavLabel(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/app">Platform</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 gap-2 text-muted-foreground md:inline-flex"
            onClick={onSearchOpen}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="pointer-events-none hidden font-mono-data text-[10px] lg:inline">
              ⌘K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 md:hidden"
            onClick={onSearchOpen}
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden h-8 gap-1.5 sm:inline-flex">
                <Plus className="h-3.5 w-3.5" />
                Quick actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.id} asChild>
                  <Link to={action.href} className="flex flex-col items-start gap-0.5">
                    <span>{action.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {action.description}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--amber)]" />
          </Button>

          <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
              <User className="h-3.5 w-3.5" />
            </span>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-medium leading-none">Kevin M.</div>
              <div className="mt-0.5 font-mono-data text-[10px] text-muted-foreground">
                Credit officer
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
