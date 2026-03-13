import { ALPHA_VANTAGE_API_KEY, API_BASE_URL } from '@/config/api';
import type { AssetDataPoint } from './mockData';

/**
 * Live Data Integration Outline (Alpha Vantage)
 * 
 * Once you have injected your API key via the Antigravity Secrets panel,
 * you can switch `useAssetData` to import and use this function instead of `getMockData`.
 */
export async function getLiveAlphaVantageData(symbol: string, timeframeDays: number): Promise<AssetDataPoint[]> {
    const outputSize = timeframeDays > 100 ? 'full' : 'compact';

    // Example for Daily Time Series
    const url = `${API_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data['Error Message'] || data['Information']) {
            console.error("Alpha Vantage API error:", data['Error Message'] || data['Information']);
            throw new Error("API Limit reached or invalid symbol.");
        }

        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) return [];

        const result: AssetDataPoint[] = Object.keys(timeSeries).map(date => {
            const point = timeSeries[date];
            return {
                date,
                open: parseFloat(point['1. open']),
                high: parseFloat(point['2. high']),
                low: parseFloat(point['3. low']),
                close: parseFloat(point['4. close']),
                volume: parseInt(point['5. volume'], 10),
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Approximate days slice
        const tradingDays = Math.floor(timeframeDays * (5 / 7));
        return result.slice(-Math.max(tradingDays, 5));

    } catch (err) {
        console.error("Failed to fetch live data", err);
        return [];
    }
}
