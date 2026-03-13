import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { subDays, startOfDay } from 'date-fns';
import { ASSET_UNIVERSE, getMockData } from '@/services/mockData';

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const timeframeDays = parseInt(searchParams.get('timeframeDays') || '30', 10);

    if (!assetId) {
        return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
    }

    try {
        let symbol = assetId;

        // Determine real Yahoo Finance symbol
        if (assetId.startsWith('custom_')) {
            symbol = assetId.replace('custom_', '').toUpperCase();
        } else {
            const predefined = ASSET_UNIVERSE.find(a => a.id === assetId);
            if (predefined) {
                symbol = predefined.symbol;
            }
        }

        const period2 = new Date();
        const period1 = subDays(startOfDay(period2), timeframeDays + Math.max(10, Math.floor(timeframeDays * 0.5))); // Fetch extra days to account for weekends/holidays

        const result: any = await yahooFinance.chart(symbol, {
            period1,
            period2,
            interval: timeframeDays > 365 ? '1wk' : '1d'
        });

        // Map to expected AssetDataPoint format
        const data = result.quotes.map((day: any) => ({
            date: day.date.toISOString().split('T')[0],
            open: day.open,
            high: day.high,
            low: day.low,
            close: day.close,
            volume: day.volume
        }));

        // Filter exact number of trading days roughly if necessary, or just return all matched
        return NextResponse.json(data);
    } catch (error) {
        console.error("Historical API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
    }
}
