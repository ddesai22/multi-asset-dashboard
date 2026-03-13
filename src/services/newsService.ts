export interface NewsItem {
    id: string;
    headline: string;
    source: string;
    time: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    url: string;
}

// Simulated recent news feed. In production, this would hit Alpha Vantage Sentiment/News endpoint.
export const MOCK_NEWS_FEED: NewsItem[] = [
    {
        id: "n1",
        headline: "Tech sector rallies as AI infrastructure spending beats expectations",
        source: "Bloomberg",
        time: "10 min ago",
        sentiment: "positive",
        url: "#"
    },
    {
        id: "n2",
        headline: "Federal Reserve signals potential rate pause in upcoming quarter",
        source: "Reuters",
        time: "45 min ago",
        sentiment: "neutral",
        url: "#"
    },
    {
        id: "n3",
        headline: "Oil prices slip amid rising US inventory data",
        source: "WSJ",
        time: "1 hour ago",
        sentiment: "negative",
        url: "#"
    },
    {
        id: "n4",
        headline: "Gold hits new high as investors seek safe-haven assets",
        source: "Financial Times",
        time: "2 hours ago",
        sentiment: "positive",
        url: "#"
    },
    {
        id: "n5",
        headline: "European markets open mixed ahead of ECB meeting",
        source: "CNBC",
        time: "3 hours ago",
        sentiment: "neutral",
        url: "#"
    },
    {
        id: "n6",
        headline: "Electric Vehicle sales show unexpected slowdown in Q3",
        source: "MarketWatch",
        time: "4 hours ago",
        sentiment: "negative",
        url: "#"
    }
];

export async function getLiveNews(): Promise<NewsItem[]> {
    try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data.slice(0, 5) : MOCK_NEWS_FEED.slice(0, 5);
    } catch (err) {
        console.warn('Falling back to mock news', err);
        return MOCK_NEWS_FEED.slice(0, 5);
    }
}
