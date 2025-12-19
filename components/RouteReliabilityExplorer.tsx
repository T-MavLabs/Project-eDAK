"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ux4g/Panel";
import type { RouteResult, RouteSearchParams } from "@/lib/analyticsApi";
import { searchRoutes } from "@/lib/analyticsApi";
import { cn } from "@/lib/utils";

type SortField = "route" | "avgTransitDays" | "reliabilityStdDev" | "mode" | "nature";
type SortDirection = "asc" | "desc" | null;

/**
 * Simple UX4G-compliant Tooltip component
 */
function Tooltip({ children, content, "aria-label": ariaLabel }: { children: React.ReactNode; content: string; "aria-label"?: string }) {
  return (
    <div className="ux4g-tooltip inline-block">
      <div className="inline-block" aria-label={ariaLabel || content} title={content}>
        {children}
      </div>
      <div 
        className="ux4g-tooltip-content"
        role="tooltip"
        aria-hidden="true"
      >
        {content}
      </div>
    </div>
  );
}

export function RouteReliabilityExplorer() {
  const [searchParams, setSearchParams] = useState<RouteSearchParams>({});
  const [results, setResults] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchRoutes(searchParams);
      setResults(data);
      // Reset sorting when new search results arrive
      setSortField(null);
      setSortDirection(null);
    } catch (error) {
      console.error("Route search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSortKeyDown = (e: React.KeyboardEvent, field: SortField) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSort(field);
    }
  };

  const sortedResults = useMemo(() => {
    if (!sortField || !sortDirection) return results;

    return [...results].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "route":
          aValue = a.route;
          bValue = b.route;
          break;
        case "avgTransitDays":
          aValue = a.avgTransitDays;
          bValue = b.avgTransitDays;
          break;
        case "reliabilityStdDev":
          aValue = a.reliabilityStdDev;
          bValue = b.reliabilityStdDev;
          break;
        case "mode":
          aValue = a.mode;
          bValue = b.mode;
          break;
        case "nature":
          aValue = a.nature;
          bValue = b.nature;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
  }, [results, sortField, sortDirection]);

  return (
    <Panel
      title="Route Reliability Explorer"
      description="Search and analyze route performance metrics. High variance routes indicate reliability risks requiring operational attention."
      elevated
    >
      {/* Search Filters - UX4G form fields */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <div>
          <label htmlFor="origin-input" className="sr-only">
            Origin
          </label>
          <Input
            id="origin-input"
            placeholder="Origin (e.g., Delhi)"
            value={searchParams.origin || ""}
            onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full"
            aria-label="Origin city or location"
          />
        </div>
        <div>
          <label htmlFor="destination-input" className="sr-only">
            Destination
          </label>
          <Input
            id="destination-input"
            placeholder="Destination (e.g., Bengaluru)"
            value={searchParams.destination || ""}
            onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full"
            aria-label="Destination city or location"
          />
        </div>
        <div>
          <label htmlFor="mode-select" className="sr-only">
            Delivery Mode
          </label>
          <Select
            value={searchParams.mode || ""}
            onValueChange={(value: "Surface" | "Air" | "Express" | "") =>
              setSearchParams({ ...searchParams, mode: value || undefined })
            }
          >
            <SelectTrigger id="mode-select" className="w-full" aria-label="Select delivery mode">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Modes</SelectItem>
              <SelectItem value="Surface">Surface</SelectItem>
              <SelectItem value="Air">Air</SelectItem>
              <SelectItem value="Express">Express</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="nature-select" className="sr-only">
            Parcel Nature
          </label>
          <Select
            value={searchParams.nature || ""}
            onValueChange={(value: "Dox" | "Non-Dox" | "") =>
              setSearchParams({ ...searchParams, nature: value || undefined })
            }
          >
            <SelectTrigger id="nature-select" className="w-full" aria-label="Select parcel nature">
              <SelectValue placeholder="Nature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="Dox">Dox</SelectItem>
              <SelectItem value="Non-Dox">Non-Dox</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#E74C3C] hover:bg-[#C0392B] text-white"
          aria-label={loading ? "Searching routes" : "Search routes"}
        >
          <Search className="h-4 w-4 mr-2" aria-hidden="true" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Results Table */}
      {hasSearched && (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-neutral-600" role="status" aria-live="polite">
              Loading route data...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-neutral-600" role="status">
              No routes found matching the search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table 
                role="table" 
                aria-label="Route reliability search results"
                className="ux4g-table ux4g-table-sortable"
              >
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      scope="col"
                      className="cursor-pointer select-none hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-[-2px]"
                      onClick={() => handleSort("route")}
                      onKeyDown={(e) => handleSortKeyDown(e, "route")}
                      tabIndex={0}
                      aria-sort={
                        sortField === "route"
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      aria-label="Sort by Route"
                    >
                      <div className="flex items-center gap-2">
                        Route
                        {sortField === "route" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      scope="col"
                      className="cursor-pointer select-none hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-[-2px]"
                      onClick={() => handleSort("avgTransitDays")}
                      onKeyDown={(e) => handleSortKeyDown(e, "avgTransitDays")}
                      tabIndex={0}
                      aria-sort={
                        sortField === "avgTransitDays"
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      aria-label="Sort by Average Transit Days"
                    >
                      <div className="flex items-center gap-2">
                        Avg Transit Days
                        {sortField === "avgTransitDays" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      scope="col"
                      className="cursor-pointer select-none hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-[-2px]"
                      onClick={() => handleSort("reliabilityStdDev")}
                      onKeyDown={(e) => handleSortKeyDown(e, "reliabilityStdDev")}
                      tabIndex={0}
                      aria-sort={
                        sortField === "reliabilityStdDev"
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      aria-label="Sort by Reliability Standard Deviation"
                    >
                      <div className="flex items-center gap-2">
                      Reliability Std Dev
                      <span className="sr-only">
                        (Standard deviation of reliability scores)
                      </span>
                        {sortField === "reliabilityStdDev" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      scope="col"
                      className="cursor-pointer select-none hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-[-2px]"
                      onClick={() => handleSort("mode")}
                      onKeyDown={(e) => handleSortKeyDown(e, "mode")}
                      tabIndex={0}
                      aria-sort={
                        sortField === "mode"
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      aria-label="Sort by Delivery Mode"
                    >
                      <div className="flex items-center gap-2">
                        Mode
                        {sortField === "mode" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      scope="col"
                      className="cursor-pointer select-none hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E74C3C] focus:ring-offset-[-2px]"
                      onClick={() => handleSort("nature")}
                      onKeyDown={(e) => handleSortKeyDown(e, "nature")}
                      tabIndex={0}
                      aria-sort={
                        sortField === "nature"
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      aria-label="Sort by Parcel Nature"
                    >
                      <div className="flex items-center gap-2">
                        Nature
                        {sortField === "nature" ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map((route, idx) => {
                    const isHighVariance = route.reliabilityStdDev > 1.5;
                    const isHighDelay = route.avgTransitDays > 4.0;
                    const rowLabel = `${route.route} route from ${route.origin} to ${route.destination}`;
                    return (
                      <TableRow
                        key={`${route.route}-${idx}`}
                        className="hover:bg-neutral-50 focus-within:bg-neutral-50 focus-within:outline focus-within:outline-2 focus-within:outline-[#E74C3C] focus-within:outline-offset-[-2px]"
                        tabIndex={0}
                        aria-label={rowLabel}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isHighVariance && (
                              <Tooltip 
                                content="High Variance Route: Reliability standard deviation exceeds 1.5, indicating inconsistent performance requiring operational attention."
                                aria-label="High variance indicator - click for details"
                              >
                              <AlertTriangle 
                                  className="h-4 w-4 text-[#FF9933] cursor-help" 
                                aria-label="High variance indicator"
                              />
                              </Tooltip>
                            )}
                            <span className="font-semibold text-neutral-900">{route.route}</span>
                          </div>
                          <div className="text-xs text-neutral-600 mt-0.5">
                            {route.origin} → {route.destination}
                          </div>
                          {isHighVariance && (
                            <div className="sr-only">
                              High variance route - reliability standard deviation exceeds 1.5
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              "inline-block tabular-nums font-semibold",
                              isHighDelay ? "text-[#DC2626]" : "text-neutral-900"
                            )}
                            aria-label={`Average transit days: ${route.avgTransitDays.toFixed(1)}${isHighDelay ? " (High delay - exceeds 4.0 days)" : ""}`}
                          >
                            {route.avgTransitDays.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-2 tabular-nums font-semibold text-neutral-900">
                            {route.reliabilityStdDev.toFixed(2)}
                            {isHighVariance && (
                              <Tooltip
                                content="High Variance: This route shows inconsistent reliability (std dev > 1.5), indicating potential operational issues."
                                aria-label="High variance indicator - click for details"
                              >
                              <span 
                                  className="text-xs text-[#FF9933] font-medium cursor-help border-b border-dotted border-[#FF9933]"
                                aria-label="High variance"
                              >
                                High Variance
                              </span>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded border border-neutral-200">
                            {route.mode}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded border border-neutral-200">
                            {route.nature}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center p-8 text-neutral-600 border border-dashed border-neutral-300 rounded-lg">
          Enter search criteria above to explore route reliability metrics
        </div>
      )}
    </Panel>
  );
}
