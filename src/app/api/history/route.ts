import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { subDays, subMonths, subYears, startOfYear } from 'date-fns';
import { ASSET_UNIVERSE, getMockData } from '@/services/mockData';

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const timeframe = searchParams.get('timeframe') || '1M';

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
        let period1 = new Date();
        let interval: '1d' | '1wk' | '1mo' = '1d';

        switch (timeframe) {
            case '1D':
                period1 = subDays(period2, 1);
                interval = '1d';
                break;
            case '5D':
                period1 = subDays(period2, 5);
                interval = '1d';
                break;
            case '1M':
                period1 = subMonths(period2, 1);
                interval = '1d';
                break;
            case '6M':
                period1 = subMonths(period2, 6);
                interval = '1d';
                break;
            case 'YTD':
                period1 = startOfYear(period2);
                interval = '1d';
                break;
            case '1Y':
                period1 = subYears(period2, 1);
                interval = '1d';
                break;
            case '5Y':
                period1 = subYears(period2, 5);
                interval = '1wk';
                break;
            case 'Max':
                period1 = new Date('2000-01-01'); // Provide reasonable max
                interval = '1mo';
                break;
            default:
                period1 = subMonths(period2, 1);
        }

        const result: any = await yahooFinance.chart(symbol, {
            period1,
            period2,
            interval: interval
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
