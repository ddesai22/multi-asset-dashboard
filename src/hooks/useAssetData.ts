import { useQueries, useQuery } from '@tanstack/react-query';
import { type AssetDataPoint } from '@/services/mockData';
import type { Timeframe } from '@/components/ui/timeframe-selector';

const fetchLiveAssetData = async (assetId: string, timeframe: Timeframe): Promise<AssetDataPoint[]> => {
    const res = await fetch(`/api/history?assetId=${assetId}&timeframe=${timeframe}`);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
};

export function useAssetData(assetId: string, timeframe: Timeframe) {
    return useQuery<AssetDataPoint[]>({
        queryKey: ['asset', assetId, timeframe],
        queryFn: () => fetchLiveAssetData(assetId, timeframe),
        staleTime: 5 * 60 * 1000,
    });
}

export function useMultipleAssetData(assetIds: string[], timeframe: Timeframe) {
    const results = useQueries({
        queries: assetIds.map(id => ({
            queryKey: ['asset', id, timeframe],
            queryFn: () => fetchLiveAssetData(id, timeframe),
            staleTime: 5 * 60 * 1000,
        }))
    });

    const isLoading = results.some(r => r.isLoading);
    const data: Record<string, AssetDataPoint[]> = {};

    results.forEach((r, idx) => {
        if (r.data) {
            data[assetIds[idx]] = r.data;
        }
    });

    const isError = results.some(r => r.isError);

    return { data, isLoading, isError };
}
