import { useState, useEffect } from 'react';

// For this mock implementation, we'll provide a local dictionary of common tickers
// In a real scenario, this hook would hit the Alpha Vantage SYMBOL_SEARCH endpoint
const MOCK_TICKER_DATABASE = [
    // US Equities
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'CVX', name: 'Chevron Corporation' },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'MA', name: 'Mastercard Incorporated' },
    { symbol: 'HD', name: 'The Home Depot, Inc.' },
    { symbol: 'COST', name: 'Costco Wholesale Corporation' },
    { symbol: 'ABBV', name: 'AbbVie Inc.' },
    { symbol: 'KO', name: 'The Coca-Cola Company' },
    { symbol: 'PEP', name: 'PepsiCo, Inc.' },
    { symbol: 'BAC', name: 'Bank of America Corporation' },

    // International Indices
    { symbol: '^BSESN', name: 'BSE SENSEX (India)' },
    { symbol: 'SENSEX', name: 'BSE SENSEX (India)' },
    { symbol: '^NSEI', name: 'NIFTY 50 (India)' },
    { symbol: 'NIFTY', name: 'NIFTY 50 (India)' },
    { symbol: '^N225', name: 'Nikkei 225 (Japan)' },
    { symbol: '^FTSE', name: 'FTSE 100 (UK)' },
    { symbol: '^HSI', name: 'Hang Seng Index (Hong Kong)' },
    { symbol: '000001.SS', name: 'Shanghai Composite (China)' },
    { symbol: '^AXJO', name: 'S&P/ASX 200 (Australia)' },
    { symbol: '^GDAXI', name: 'DAX Performance-Index (Germany)' },
    { symbol: '^FCHI', name: 'CAC 40 (France)' },
    { symbol: '^STOXX50E', name: 'EURO STOXX 50' },
    { symbol: '^KS11', name: 'KOSPI Composite Index (South Korea)' },
    { symbol: '^TWII', name: 'TSEC weighted index (Taiwan)' },
    { symbol: 'IBOV', name: 'Bovespa Index (Brazil)' },
];

export interface TickerResult {
    symbol: string;
    name: string;
}

export function useTickerSearch(query: string, delay: number = 300) {
    const [results, setResults] = useState<TickerResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const timer = setTimeout(() => {
            // Simulate API call for SYMBOL_SEARCH
            const lowerQuery = query.toLowerCase();
            const matches = MOCK_TICKER_DATABASE.filter(
                (t) =>
                    t.symbol.toLowerCase().includes(lowerQuery) ||
                    t.name.toLowerCase().includes(lowerQuery)
            );

            setResults(matches);
            setIsSearching(false);
        }, delay);

        return () => clearTimeout(timer);
    }, [query, delay]);

    return { results, isSearching };
}
