"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getLiveNews, type NewsItem } from "@/services/newsService";

export function NewsFeed() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchNews = async () => {
            try {
                const data = await getLiveNews();
                if (mounted) {
                    setNews(data);
                    setLastUpdated(new Date());
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to fetch news", err);
                if (mounted) setLoading(false);
            }
        };

        fetchNews();
        
        // Refresh every 5 minutes (300,000 ms)
        const intervalId = setInterval(fetchNews, 5 * 60 * 1000);
        
        return () => { 
            mounted = false; 
            clearInterval(intervalId);
        };
    }, []);

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return <TrendingUp className="w-3 h-3 text-emerald-400" />;
            case 'negative':
                return <TrendingDown className="w-3 h-3 text-red-500" />;
            default:
                return <Minus className="w-3 h-3 text-muted-foreground" />;
        }
    };

    return (
        <Card className="border-white/5 bg-black/20 backdrop-blur-md mt-6">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                    <Newspaper className="w-4 h-4" />
                    Market Pulse
                </CardTitle>
                {lastUpdated && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                        Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col gap-2">
                                <div className="h-3 bg-white/10 rounded w-full"></div>
                                <div className="h-3 bg-white/10 rounded w-2/3"></div>
                                <div className="h-2 bg-white/5 rounded w-1/4 mt-1"></div>
                            </div>
                        ))
                    ) : (
                        news.map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block group border-l-2 border-transparent hover:border-emerald-500/50 pl-3 transition-colors"
                            >
                                <h4 className="text-xs font-medium text-white/90 group-hover:text-white line-clamp-2 leading-snug">
                                    {item.headline}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                                    <span className="font-semibold text-white/50">{item.source}</span>
                                    <span>•</span>
                                    <span>{item.time}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1" title={`Sentiment: ${item.sentiment}`}>
                                        {getSentimentIcon(item.sentiment)}
                                    </span>
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
