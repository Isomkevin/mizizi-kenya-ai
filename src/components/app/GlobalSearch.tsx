import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  FileText,
  MapPin,
  ShieldAlert,
  Sprout,
  Store,
  User,
  Wallet,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGlobalSearch, searchTypeLabels } from "@/api/hooks/use-search";
import type { SearchEntityType } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";

const typeIcons: Record<SearchEntityType, typeof User> = {
  farmer: User,
  loan: Wallet,
  cooperative: Building2,
  county: MapPin,
  dealer: Store,
  application: FileText,
  risk: ShieldAlert,
  decision: Sprout,
};

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: filtered = [] } = useGlobalSearch(query);

  const grouped = useMemo(() => {
    const groups = new Map<SearchEntityType, typeof filtered>();
    for (const item of filtered) {
      const list = groups.get(item.type) ?? [];
      list.push(item);
      groups.set(item.type, list);
    }
    return groups;
  }, [filtered]);

  const runCommand = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      void navigate({ to: href });
    },
    [navigate, onOpenChange],
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search farmers, loans, counties, decisions…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Array.from(grouped.entries()).map(([type, items], i) => {
          const Icon = typeIcons[type];
          return (
            <div key={type}>
              {i > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={searchTypeLabels[type]}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.subtitle} ${item.location}`}
                    onSelect={() => runCommand(item.href)}
                    className="flex flex-col items-start gap-1 py-3"
                  >
                    <div className="flex w-full items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.title}</span>
                      <RiskBadge level={item.risk} className="ml-auto" />
                    </div>
                    <div className="flex w-full flex-wrap gap-x-3 gap-y-1 pl-6 text-xs text-muted-foreground">
                      <span>{item.subtitle}</span>
                      <span>·</span>
                      <span>{item.location}</span>
                      <span>·</span>
                      <span>{item.status}</span>
                    </div>
                    {item.recentActivity ? (
                      <div className="pl-6 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground/80">
                        {item.recentActivity}
                      </div>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

export function useGlobalSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);
}
