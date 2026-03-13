import { subDays } from 'date-fns';

export type AssetType = 'index' | 'commodity' | 'bond' | 'stock';

export interface AssetDataPoint {
    date: string; // ISO string 
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface Asset {
    id: string;
    name: string;
    symbol: string;
    type: AssetType;
    color: string;
}

export const ASSET_UNIVERSE: Asset[] = [
    // Indices (Blues/Purples)
    { id: 'sp500', name: 'S&P 500', symbol: '^GSPC', type: 'index', color: 'hsl(217, 91%, 60%)' }, // Blue
    { id: 'nasdaq100', name: 'Nasdaq 100', symbol: '^NDX', type: 'index', color: 'hsl(280, 80%, 65%)' }, // Purple
    { id: 'ftse100', name: 'FTSE 100', symbol: '^FTSE', type: 'index', color: 'hsl(180, 85%, 55%)' }, // Cyan
    { id: 'dax', name: 'DAX', symbol: '^GDAXI', type: 'index', color: 'hsl(240, 75%, 65%)' }, // Indigo
    { id: 'sensex', name: 'BSE SENSEX', symbol: '^BSESN', type: 'index', color: 'hsl(200, 80%, 50%)' },
    { id: 'shanghai', name: 'Shanghai Comp', symbol: '000001.SS', type: 'index', color: 'hsl(260, 70%, 60%)' },

    // Commodities (Yellows/Oranges/Greens)
    { id: 'gold', name: 'Gold', symbol: 'GC=F', type: 'commodity', color: 'hsl(45, 93%, 47%)' }, // Gold
    { id: 'silver', name: 'Silver', symbol: 'SI=F', type: 'commodity', color: 'hsl(0, 0%, 75%)' }, // Silver/Gray
    { id: 'oil', name: 'Crude Oil', symbol: 'CL=F', type: 'commodity', color: 'hsl(15, 85%, 55%)' }, // Burnt Orange
    { id: 'gas', name: 'Natural Gas', symbol: 'NG=F', type: 'commodity', color: 'hsl(140, 70%, 50%)' }, // Green

    // Bonds (Pinks/Reds)
    { id: 'us10y', name: 'US 10Y Yield', symbol: '^TNX', type: 'bond', color: 'hsl(340, 80%, 60%)' }, // Pink
    { id: 'us2y', name: 'US 2Y Yield', symbol: '^IRX', type: 'bond', color: 'hsl(0, 85%, 60%)' }, // Red
    { id: 'uk10y', name: 'UK Gilt 10Y', symbol: 'TUKY.L', type: 'bond', color: 'hsl(30, 90%, 60%)' }, // Orange
];

// Helper to generate a random walk pattern
function generateRandomWalk(startPrice: number, volatility: number, days: number, trend: number = 0.0001): AssetDataPoint[] {
    const data: AssetDataPoint[] = [];
    let currentPrice = startPrice;
    const today = new Date();

    for (let i = days; i >= 0; i--) {
        const date = subDays(today, i);
        // Skip weekends for more realistic market data
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const change = currentPrice * (Math.random() * volatility * 2 - volatility + trend);
        const open = currentPrice;
        const close = currentPrice + change;
        const high = Math.max(open, close) + currentPrice * Math.random() * volatility;
        const low = Math.min(open, close) - currentPrice * Math.random() * volatility;

        currentPrice = close;

        data.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume: Math.floor(Math.random() * 10000000)
        });
    }

    return data;
}

// Generate base data map up to 5 years (approx 1250 trading days)
const baseDataMap = new Map<string, AssetDataPoint[]>();

const setStartingPrice = (symbol: string) => {
    if (symbol.includes('^GSPC')) return 5000;
    if (symbol.includes('^NDX')) return 18000;
    if (symbol.includes('^FTSE')) return 7800;
    if (symbol.includes('^GDAXI')) return 17000;
    if (symbol.includes('GC=F')) return 2300;
    if (symbol.includes('SI=F')) return 28;
    if (symbol.includes('CL=F')) return 80;
    if (symbol.includes('NG=F')) return 2.5;
    if (symbol.includes('^TNX')) return 4.2;
    return 100;
};

// Populate the mock cache
ASSET_UNIVERSE.forEach(asset => {
    const vol = asset.type === 'bond' ? 0.01 : asset.type === 'index' ? 0.005 : 0.015;
    baseDataMap.set(asset.id, generateRandomWalk(setStartingPrice(asset.symbol), vol, 1825, 0.0002));
});

export const getMockData = async (assetId: string, timeframeDays: number): Promise<AssetDataPoint[]> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 300));

    if (!baseDataMap.has(assetId) && assetId.startsWith('custom_')) {
        const symbol = assetId.replace('custom_', '').toUpperCase();
        const randomStartPrice = Math.floor(Math.random() * 500) + 50;
        baseDataMap.set(assetId, generateRandomWalk(randomStartPrice, 0.015, 1825, 0.0002));
    }

    const allData = baseDataMap.get(assetId) || [];
    // Approximate trading days for the requested calendar days
    const tradingDays = Math.floor(timeframeDays * (5 / 7));

    return allData.slice(-Math.max(tradingDays, 5)); // Return at least 5 days
};
