"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | '5Y';

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
            <ToggleGroupItem value="1D" aria-label="1 Day" className="px-3 text-xs">1D</ToggleGroupItem>
            <ToggleGroupItem value="1W" aria-label="1 Week" className="px-3 text-xs">1W</ToggleGroupItem>
            <ToggleGroupItem value="1M" aria-label="1 Month" className="px-3 text-xs">1M</ToggleGroupItem>
            <ToggleGroupItem value="6M" aria-label="6 Months" className="px-3 text-xs">6M</ToggleGroupItem>
            <ToggleGroupItem value="1Y" aria-label="1 Year" className="px-3 text-xs">1Y</ToggleGroupItem>
            <ToggleGroupItem value="5Y" aria-label="5 Years" className="px-3 text-xs">5Y</ToggleGroupItem>
        </ToggleGroup>
    );
}
