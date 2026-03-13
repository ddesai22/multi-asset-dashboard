import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(request: Request) {
    try {
        const result = await yahooFinance.search('finance', { newsCount: 10 });
        
        // Map to expected format
        const news = ((result as any).news || []).map((n: any) => ({
            id: n.uuid || Math.random().toString(),
            headline: n.title,
            source: n.publisher || 'Yahoo Finance',
            time: n.providerPublishTime ? new Date(n.providerPublishTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            sentiment: 'neutral', // Yahoo doesn't provide sentiment out of the box
            url: n.link
        }));

        return NextResponse.json(news);
    } catch (error) {
        console.error('Failed to fetch news', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
