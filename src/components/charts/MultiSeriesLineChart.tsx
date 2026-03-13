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
    // We need to merge data points by Date for Recharts Multi-line
    const mergedDataMap = new Map<string, Record<string, number | string>>();

    activeAssets.forEach(assetId => {
        const assetData = data[assetId];
        if (!assetData || assetData.length === 0) return;

        // Normalize prices to percentage change from start for comparison
        const startPrice = assetData[0]?.close || 1;

        assetData.forEach(point => {
            const existing = mergedDataMap.get(point.date) || { date: point.date };
            existing[assetId] = ((point.close - startPrice) / startPrice) * 100;
            mergedDataMap.set(point.date, existing);
        });
    });

    const chartData = Array.from(mergedDataMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

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
