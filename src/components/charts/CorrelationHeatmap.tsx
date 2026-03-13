"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type AssetDataPoint, ASSET_UNIVERSE } from '@/services/mockData';
import { calculatePearsonCorrelation } from '@/utils/math';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
    data: Record<string, AssetDataPoint[]>;
    activeAssets: string[];
}

export function CorrelationHeatmap({ data, activeAssets }: Props) {

    const matrix = useMemo(() => {
        const result: number[][] = [];

        // We need to ensure we have aligned arrays of close prices
        const closePricesMaps = new Map<string, Map<string, number>>();

        activeAssets.forEach(asset => {
            const assetData = data[asset] || [];
            const priceMap = new Map<string, number>();
            assetData.forEach(d => priceMap.set(d.date, d.close));
            closePricesMaps.set(asset, priceMap);
        });

        for (let i = 0; i < activeAssets.length; i++) {
            result[i] = [];
            for (let j = 0; j < activeAssets.length; j++) {
                const assetA = activeAssets[i];
                const assetB = activeAssets[j];

                if (i === j) {
                    result[i][j] = 1.0;
                    continue;
                }

                const mapA = closePricesMaps.get(assetA)!;
                const mapB = closePricesMaps.get(assetB)!;

                // Find intersection of dates
                const dates = Array.from(mapA.keys()).filter(date => mapB.has(date));

                const arrA = dates.map(d => mapA.get(d)!);
                const arrB = dates.map(d => mapB.get(d)!);

                result[i][j] = calculatePearsonCorrelation(arrA, arrB);
            }
        }

        return result;
    }, [data, activeAssets]);

    const getColor = (val: number) => {
        if (isNaN(val)) return 'transparent';
        if (val === 1) return 'rgba(255, 255, 255, 0.1)';

        // Positive mapping (green) vs Negative mapping (red)
        if (val > 0) {
            return `rgba(34, 197, 94, ${Math.max(0.2, val)})`; // Emerald
        } else {
            return `rgba(239, 68, 68, ${Math.max(0.2, Math.abs(val))})`; // Red
        }
    };

    const getAssetName = (id: string) => ASSET_UNIVERSE.find(a => a.id === id)?.name || id;

    const getExplanation = (val: number, nameA: string, nameB: string) => {
        if (isNaN(val)) return "Not enough data to calculate correlation.";
        if (val === 1) return `${nameA} is perfectly correlated with itself.`;

        let strength = "";
        const abs = Math.abs(val);
        if (abs >= 0.8) strength = "very strongly";
        else if (abs >= 0.6) strength = "strongly";
        else if (abs >= 0.4) strength = "moderately";
        else if (abs >= 0.2) strength = "weakly";
        else strength = "very weakly or not";

        const direction = val > 0 ? "positively" : "negatively";

        return (
            <div className="space-y-1 max-w-[250px] text-xs">
                <p className="font-semibold text-white border-b border-white/10 pb-1 mb-1">
                    {nameA} vs {nameB}
                </p>
                <p className="text-emerald-400 font-mono text-sm mb-1">
                    r = {val.toFixed(2)}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    These assets are <strong className="text-white">{strength} {direction}</strong> correlated.
                    {val > 0
                        ? ` They tend to move in the same direction ${Math.round(abs * 100)}% of the time during this period.`
                        : ` They tend to move in opposite directions ${Math.round(abs * 100)}% of the time during this period.`}
                </p>
            </div>
        );
    };

    return (
        <Card className="col-span-1 border-white/5 bg-black/20 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Correlation Matrix</CardTitle>
                <CardDescription>Pearson coefficient across selected timeframe</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="grid gap-1" style={{ width: '100%', minWidth: '400px' }}>
                        <div className="flex">
                            <div className="w-24 text-xs font-medium text-muted-foreground"></div>
                            {activeAssets.map(id => (
                                <div key={`header-${id}`} className="flex-1 text-center text-xs font-semibold text-muted-foreground truncate px-1">
                                    {getAssetName(id).substring(0, 8)}
                                </div>
                            ))}
                        </div>

                        {activeAssets.map((rowId, i) => (
                            <div key={`row-${rowId}`} className="flex items-center">
                                <div className="w-24 text-xs font-medium text-muted-foreground truncate pr-2 text-right">
                                    {getAssetName(rowId)}
                                </div>
                                {activeAssets.map((colId, j) => {
                                    const val = matrix[i][j];
                                    const nameA = getAssetName(rowId);
                                    const nameB = getAssetName(colId);

                                    return (
                                        <Tooltip key={`cell-${rowId}-${colId}`}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="flex-1 flex items-center justify-center aspect-square rounded-md m-0.5 text-xs font-medium transition-colors cursor-default hover:border hover:border-white/20"
                                                    style={{ backgroundColor: getColor(val) }}
                                                >
                                                    {val.toFixed(2)}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-neutral-900 border-white/10 text-white shadow-xl shadow-black/50 overflow-hidden leading-snug">
                                                {getExplanation(val, nameA, nameB)}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
