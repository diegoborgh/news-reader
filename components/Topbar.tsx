import { RefreshButton } from "@/components/RefreshButton";
import { RegionInput } from "@/components/RegionInput";
import { SearchInput } from "@/components/SearchInput";

export function Topbar({
  label,
  mobileLabel,
  count,
  right,
  onSearch,
  onSearchClear,
  searchActive,
}: {
  label: string;
  mobileLabel?: string;
  count: number | null;
  right?: React.ReactNode;
  onSearch?: (query: string) => void;
  onSearchClear?: () => void;
  searchActive?: boolean;
}) {
  return (
    <div className="flex h-[52px] flex-shrink-0 items-center gap-4 border-b border-rule bg-bg px-8">
      <span className="whitespace-nowrap font-serif text-[18px] font-semibold text-fg">
        {mobileLabel ? (
          <>
            <span className="lining-nums min-[720px]:hidden">{mobileLabel}</span>
            <span className="lining-nums hidden min-[720px]:inline">{label}</span>
          </>
        ) : label}
      </span>
      {count !== null && (
        <span className="rounded-[20px] bg-rule px-2 py-[3px] text-xs text-muted">
          {count} {count === 1 ? "story" : "stories"}
        </span>
      )}
      {right}
      <div className="ml-auto flex items-center gap-4">
        {onSearch && (
          <SearchInput
            onSearch={onSearch}
            onClear={onSearchClear ?? (() => {})}
            active={searchActive ?? false}
          />
        )}
        <RegionInput />
        <RefreshButton />
      </div>
    </div>
  );
}
