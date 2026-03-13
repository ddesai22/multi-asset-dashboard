"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Timeframe = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'Max';

interface Props {
    value: Timeframe;
    onChange: (value: Timeframe) => void;
}

export function TimeframeSelector({ value, onChange }: Props) {
    return (
        <ToggleGroup
            type="single"
            value={value}
            onValueChange={(val) => {
                if (val) onChange(val as Timeframe);
            }}
            className="bg-muted/40 p-1 rounded-lg justify-start w-fit border border-white/5"
        >
            <ToggleGroupItem value="1D" aria-label="1 Day" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">1D</ToggleGroupItem>
            <ToggleGroupItem value="5D" aria-label="5 Days" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">5D</ToggleGroupItem>
            <ToggleGroupItem value="1M" aria-label="1 Month" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">1M</ToggleGroupItem>
            <ToggleGroupItem value="6M" aria-label="6 Months" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">6M</ToggleGroupItem>
            <ToggleGroupItem value="YTD" aria-label="Year To Date" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">YTD</ToggleGroupItem>
            <ToggleGroupItem value="1Y" aria-label="1 Year" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">1Y</ToggleGroupItem>
            <ToggleGroupItem value="5Y" aria-label="5 Years" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">5Y</ToggleGroupItem>
            <ToggleGroupItem value="Max" aria-label="Max History" className="px-3 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">Max</ToggleGroupItem>
        </ToggleGroup>
    );
}
