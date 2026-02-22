import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, RefreshCw } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PRESETS = [
  { label: "30d", days: 30 },
  { label: "60d", days: 60 },
  { label: "90d", days: 90 },
  { label: "120d", days: 120 },
  { label: "All", days: 0 },
] as const;

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  activeDays: number | null;
  onPresetChange: (days: number) => void;
  lastUpdated?: Date | null;
}

export function DateRangePicker({ dateRange, onDateRangeChange, activeDays, onPresetChange, lastUpdated }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handleCalendarSelect = (range: DateRange | undefined) => {
    onDateRangeChange(range);
    if (range?.from && range?.to) setOpen(false);
  };

  const label = activeDays !== null
    ? activeDays === 0 ? "All Time" : `Last ${activeDays} days`
    : dateRange?.from
      ? dateRange.to
        ? `${format(dateRange.from, "MMM d, yyyy")} – ${format(dateRange.to, "MMM d, yyyy")}`
        : `${format(dateRange.from, "MMM d, yyyy")} – …`
      : "Pick dates";

  const minutesAgo = lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            onClick={() => onPresetChange(p.days)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
              activeDays === p.days
                ? "bg-[#10E29C] text-black shadow-lg shadow-[#10E29C]/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
            data-testid={`button-preset-${p.label.toLowerCase()}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "min-w-[180px] justify-start border-white/10 bg-white/5 text-left font-normal hover:bg-white/10",
              activeDays === null && "border-[#10E29C]/30 text-[#10E29C]"
            )}
            data-testid="button-calendar-trigger"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-white/10 bg-[#0A0A1A] p-0" align="end">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
            defaultMonth={dateRange?.from
              ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth() - 1)
              : new Date(new Date().getFullYear(), new Date().getMonth() - 1)
            }
          />
        </PopoverContent>
      </Popover>
      {minutesAgo !== null && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="text-last-updated">
          <RefreshCw className="h-3 w-3" />
          <span>{minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`}</span>
        </div>
      )}
    </div>
  );
}
