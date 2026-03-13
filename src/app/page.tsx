"use client";

import { useState } from 'react';
import { TimeframeSelector, type Timeframe } from '@/components/ui/timeframe-selector';
import { MultiSeriesLineChart } from '@/components/charts/MultiSeriesLineChart';
import { CorrelationHeatmap } from '@/components/charts/CorrelationHeatmap';
import { useMultipleAssetData } from '@/hooks/useAssetData';
import { ASSET_UNIVERSE } from '@/services/mockData';
import { Toggle } from '@/components/ui/toggle';
import { Activity, Layers, TrendingUp, X, RotateCw, AlertCircle } from 'lucide-react';
import { TickerCombobox } from '@/components/ui/ticker-combobox';
import type { TickerResult } from '@/hooks/useTickerSearch';
import { NewsFeed } from '@/components/ui/news-feed';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Removed timeframeToDays mapping, date processing moved to backend

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  
  // Track last refreshed time
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Custom assets state to hold dynamically added tickers
  const [customAssets, setCustomAssets] = useState<typeof ASSET_UNIVERSE>([]);
  const allAssets = [...ASSET_UNIVERSE, ...customAssets];

  const [activeAssets, setActiveAssets] = useState<string[]>(['sp500', 'gold', 'us10y', 'oil']);
  const [primaryAsset, setPrimaryAsset] = useState<string>('sp500');

  // Generates a distinct color based on ticker
  const getStringHue = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash % 360);
  };

  const handleAddCustomTicker = (tickerResult: TickerResult) => {
    const id = `custom_${tickerResult.symbol.toLowerCase()}`;

    if (allAssets.some(a => a.id === id || a.symbol === tickerResult.symbol)) {
      return; // Already exists
    }

    const newAsset = {
      id,
      name: tickerResult.name || tickerResult.symbol,
      symbol: tickerResult.symbol,
      type: 'stock' as const, // Default custom additions to stock
      color: `hsl(${getStringHue(tickerResult.symbol)}, 85%, 60%)`
    };

    setCustomAssets([...customAssets, newAsset]);
    setActiveAssets([...activeAssets, id]);
  };

  const removeCustomAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCustomAssets(prev => prev.filter(a => a.id !== id));
    setActiveAssets(prev => {
      const newActive = prev.filter(a => a !== id);
      if (newActive.length === 0) return [ASSET_UNIVERSE[0].id]; // Ensure at least one
      if (primaryAsset === id) setPrimaryAsset(newActive[0]);
      return newActive;
    });
  };

  const { data, isLoading, isError } = useMultipleAssetData(activeAssets, timeframe);

  const toggleAsset = (id: string) => {
    setActiveAssets(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        if (primaryAsset === id) setPrimaryAsset(prev.find(a => a !== id) || prev[0]);
        return prev.filter(a => a !== id);
      }
      return [...prev, id];
    });
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['asset'] });
    setLastRefreshed(new Date());
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <Activity className="w-8 h-8 text-emerald-400" />
              Nexus Intelligence
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Real-time multi-asset correlation and performance analytics</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/5">
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-lg transition-colors flex items-center justify-center border border-white/10 disabled:opacity-50 group relative"
                title="Refresh Data"
                disabled={isLoading}
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <TimeframeSelector value={timeframe} onChange={setTimeframe} />
            </div>
            <span className="text-xs text-muted-foreground pr-2 font-mono">
              Last Refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
        </header>

        {/* Main Grid Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Sidebar - Asset Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Asset Universe
              </h2>

              <div className="space-y-6">
                {/* Group by Type */}
                {(['index', 'stock', 'commodity', 'bond'] as const).map(type => {
                  const items = allAssets.filter(a => a.type === type);
                  if (items.length === 0) return null; // Don't show empty groups

                  return (
                    <div key={type}>
                      <h3 className="text-xs text-muted-foreground uppercase mb-2 ml-1">
                        {type === 'index' ? 'INDICES' : type === 'stock' ? 'STOCKS' : type === 'commodity' ? 'COMMODITIES' : 'BONDS'}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map(asset => {
                          const isActive = activeAssets.includes(asset.id);
                          const isCustom = customAssets.some(c => c.id === asset.id);

                          return (
                            <div key={asset.id} className="relative group">
                              <Toggle
                                pressed={isActive}
                                onPressedChange={() => toggleAsset(asset.id)}
                                className={`w-full justify-start text-xs h-9 pr-6 ${isActive ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                                style={{ borderLeft: isActive ? `3px solid ${asset.color}` : '3px solid transparent' }}
                              >
                                <span className="truncate">{asset.name}</span>
                              </Toggle>

                              {isCustom && (
                                <button
                                  onClick={(e) => removeCustomAsset(asset.id, e)}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  title="Remove asset"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Ticker Input */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex flex-col gap-2">
                  <TickerCombobox onSelect={handleAddCustomTicker} />
                </div>
              </div>

            </div>

            {/* Removed Primary Focus Candlestick UI per request for singular multi line chart */}

            {/* News Feed */}
            <NewsFeed />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">

            {isError ? (
              <Alert variant="destructive" className="bg-red-950/50 border-red-900 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Data API Unavailable</AlertTitle>
                <AlertDescription>
                  There was an error fetching the live market data. The service may be temporarily down or rate-limited. Please try again later.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Charts Row */}
                <div className="relative">
                  {isLoading && (
                    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl border border-white/10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                  )}
                  <div className="w-full">
                    <MultiSeriesLineChart data={data} activeAssets={activeAssets} />
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 gap-6">
                  <CorrelationHeatmap data={data} activeAssets={activeAssets} />
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
