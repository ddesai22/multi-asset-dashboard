"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type AssetDataPoint } from '@/services/mockData';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Brush } from 'recharts';
import { format } from 'date-fns';

interface Props {
    data: AssetDataPoint[];
    assetName?: string;
}

const CandleBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { color } = payload;

    return (
        <g stroke={color} fill={color}>
            <rect x={x} y={y} width={Math.max(width, 2)} height={Math.max(height, 1)} rx={1} />
        </g>
    );
};

export function CandlestickChart({ data, assetName = 'Asset' }: Props) {

    // Transform data for Recharts [bottom, top] for the bar
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.map(d => {
            const isUp = d.close >= d.open;
            return {
                ...d,
                isUp,
                // The body of the candle [min(open, close), max(open, close)]
                candleBody: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
                // For tooltip clarity
                color: isUp ? '#22c55e' : '#ef4444' // Emerald-500 or Red-500
            };
        });
    }, [data]);

    const minPrice = useMemo(() => Math.min(...(data?.map(d => d.low) || [0])) * 0.99, [data]);
    const maxPrice = useMemo(() => Math.max(...(data?.map(d => d.high) || [100])) * 1.01, [data]);

    return (
        <Card className="col-span-1 border-white/5 bg-black/20 backdrop-blur-md">
            <CardHeader>
                <CardTitle>{assetName} Price</CardTitle>
                <CardDescription>OHLC approximation</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => {
                                    try { return format(new Date(val), 'MMM dd'); } catch { return val; }
                                }}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={[minPrice, maxPrice]}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.toFixed(2)}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                formatter={(value: any, name: any, props: any) => {
                                    if (name === 'candleBody') {
                                        const { open, high, low, close } = props.payload;
                                        return [`O: ${open.toFixed(2)} H: ${high.toFixed(2)} L: ${low.toFixed(2)} C: ${close.toFixed(2)}`, 'OHLC'];
                                    }
                                    return [value || '', name];
                                }}
                                labelFormatter={(label) => {
                                    try { return format(new Date(label), 'MMM dd, yyyy'); } catch { return label as string; }
                                }}
                            />
                            <Bar dataKey="candleBody" shape={<CandleBar />} />
                            <Brush
                                dataKey="date"
                                height={30}
                                stroke="#10b981"
                                fill="#000000"
                                tickFormatter={(val) => {
                                    try { return format(new Date(val), 'MMM dd'); } catch { return ''; }
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
