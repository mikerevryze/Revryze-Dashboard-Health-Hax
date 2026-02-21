import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
}

export function DateRangePicker({ dateRange, onDateRangeChange, activeDays, onPresetChange }: DateRangePickerProps) {
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <Button key={p.days} variant={activeDays === p.days ? "default" : "outline"} size="sm" onClick={() => onPresetChange(p.days)}>
          {p.label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={activeDays === null ? "default" : "outline"} size="sm" className={cn("min-w-[180px] justify-start text-left font-normal")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar mode="range" selected={dateRange} onSelect={handleCalendarSelect} numberOfMonths={2} disabled={{ after: new Date() }} defaultMonth={dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth() - 1) : new Date(new Date().getFullYear(), new Date().getMonth() - 1)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
