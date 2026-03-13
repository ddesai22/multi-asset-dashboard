"use client";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush
} from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type AssetDataPoint, ASSET_UNIVERSE } from '@/services/mockData';

interface Props {
    data: Record<string, AssetDataPoint[]>;
    activeAssets: string[];
}

export function MultiSeriesLineChart({ data, activeAssets }: Props) {
    // Generate a set of all unique dates across all assets to act as the master timeline
    const allDatesSet = new Set<string>();
    activeAssets.forEach(assetId => {
        data[assetId]?.forEach(p => allDatesSet.add(p.date));
    });

    const sortedUniqueDates = Array.from(allDatesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Map each asset to its starting price for normalization. Find the FIRST available price, rather than just index 0.
    const assetStartPrices: Record<string, number> = {};
    activeAssets.forEach(id => {
        const series = data[id];
        if (series && series.length > 0) {
            // Find the first valid close price
            const firstValid = series.find(p => p.close !== undefined && p.close !== null);
            assetStartPrices[id] = firstValid ? firstValid.close : 1;
        } else {
            assetStartPrices[id] = 1;
        }
    });

    // Track the last known absolute price for forward filling
    const lastKnownPrices: Record<string, number> = {};

    // Build the chart data ensuring every date has a value for every active asset
    const chartData = sortedUniqueDates.map(date => {
        const pointData: Record<string, number | string> = { date };

        activeAssets.forEach(assetId => {
            const assetSeries = data[assetId];
            if (!assetSeries || assetSeries.length === 0) return;

            const matchingPoint = assetSeries.find(p => p.date === date);

            if (matchingPoint && matchingPoint.close !== undefined && matchingPoint.close !== null) {
                // Asset traded today, update the last known tracked price
                lastKnownPrices[assetId] = matchingPoint.close;
            }

            // Now, if we have ANY tracked price for this asset (either today's or a forward-filled past day),
            // calculate the performance percentage against its absolute start price.
            if (lastKnownPrices[assetId] !== undefined) {
                const normalized = ((lastKnownPrices[assetId] - assetStartPrices[assetId]) / assetStartPrices[assetId]) * 100;
                pointData[assetId] = normalized;
            }
        });

        return pointData;
    });

    return (
        <Card className="col-span-1 border-white/5 bg-black/20 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Relative Performance</CardTitle>
                <CardDescription>Normalized % change over selected timeframe</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => {
                                    try {
                                        return format(new Date(val), 'MMM dd');
                                    } catch {
                                        return val;
                                    }
                                }}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(0)}%`}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10,10,10,0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}
                                labelFormatter={(label) => {
                                    try {
                                        return format(new Date(label), 'MMM dd, yyyy');
                                    } catch {
                                        return label; // Fallback
                                    }
                                }}
                                formatter={(value: any, name: any) => {
                                    const assetInfo = ASSET_UNIVERSE.find(a => a.id === name);
                                    const val = value || 0;
                                    return [`${val > 0 ? '+' : ''}${val.toFixed(2)}%`, assetInfo?.name || name];
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            {activeAssets.map(assetId => {
                                const assetOpts = ASSET_UNIVERSE.find(a => a.id === assetId);
                                return (
                                    <Line
                                        key={assetId}
                                        type="monotone"
                                        dataKey={assetId}
                                        name={assetId}
                                        stroke={assetOpts?.color || '#ffffff'}
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                );
                            })}
                            <Brush
                                dataKey="date"
                                height={30}
                                stroke="#10b981"
                                fill="#000000"
                                tickFormatter={(val) => {
                                    try { return format(new Date(val), 'MMM dd'); } catch { return ''; }
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
