"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useTickerSearch, type TickerResult } from "@/hooks/useTickerSearch";

interface Props {
    onSelect: (ticker: TickerResult) => void;
}

export function TickerCombobox({ onSelect }: Props) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const { results, isSearching } = useTickerSearch(inputValue);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-8 text-xs bg-black/40 border-white/10 text-muted-foreground hover:text-white hover:bg-black/60"
                >
                    Select an index or ticker...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-neutral-900 border-white/10 text-white">
                <Command shouldFilter={false} className="bg-transparent text-white">
                    <CommandInput
                        placeholder="Search tickers (e.g., TSLA)..."
                        className="text-xs"
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList className="max-h-[200px]">
                        {isSearching ? (
                            <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Searching...
                            </div>
                        ) : (
                            <CommandEmpty className="text-xs py-4 text-center text-muted-foreground">
                                {inputValue.length === 0 ? "Type to search..." : "No tickers found."}
                            </CommandEmpty>
                        )}

                        {!isSearching && results.length > 0 && (
                            <CommandGroup heading="Results" className="text-xs text-muted-foreground">
                                {results.map((ticker) => (
                                    <CommandItem
                                        key={ticker.symbol}
                                        value={ticker.symbol}
                                        onSelect={() => {
                                            onSelect(ticker);
                                            setOpen(false);
                                            setInputValue("");
                                        }}
                                        className="text-xs cursor-pointer aria-selected:bg-emerald-500/20 aria-selected:text-emerald-400"
                                    >
                                        <div className="flex justify-between w-full items-center">
                                            <span className="font-bold">{ticker.symbol}</span>
                                            <span className="text-muted-foreground/70">{ticker.name}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {/* Fallback option to allow arbitrary entry if not found in db */}
                        {!isSearching && inputValue.length > 0 && (
                            <CommandGroup heading="Custom" className="text-xs text-muted-foreground border-t border-white/10 mt-1">
                                <CommandItem
                                    key="custom-add"
                                    value={inputValue}
                                    onSelect={() => {
                                        onSelect({ symbol: inputValue.toUpperCase(), name: inputValue.toUpperCase() });
                                        setOpen(false);
                                        setInputValue("");
                                    }}
                                    className="text-xs cursor-pointer aria-selected:bg-emerald-500/20 aria-selected:text-emerald-400"
                                >
                                    <span className="font-bold text-emerald-400">Add "{inputValue.toUpperCase()}"</span>
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
