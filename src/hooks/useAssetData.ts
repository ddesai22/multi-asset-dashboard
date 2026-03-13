import { useQueries, useQuery } from '@tanstack/react-query';
import { type AssetDataPoint } from '@/services/mockData';

const fetchLiveAssetData = async (assetId: string, timeframeDays: number): Promise<AssetDataPoint[]> => {
    const res = await fetch(`/api/history?assetId=${assetId}&timeframeDays=${timeframeDays}`);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
};

export function useAssetData(assetId: string, timeframeDays: number) {
    return useQuery<AssetDataPoint[]>({
        queryKey: ['asset', assetId, timeframeDays],
        queryFn: () => fetchLiveAssetData(assetId, timeframeDays),
        staleTime: 5 * 60 * 1000,
    });
}

export function useMultipleAssetData(assetIds: string[], timeframeDays: number) {
    const results = useQueries({
        queries: assetIds.map(id => ({
            queryKey: ['asset', id, timeframeDays],
            queryFn: () => fetchLiveAssetData(id, timeframeDays),
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
