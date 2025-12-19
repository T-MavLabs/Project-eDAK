"use client";

import { useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
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
import type { RouteResult, RouteSearchParams } from "@/lib/analyticsApi";
import { searchRoutes } from "@/lib/analyticsApi";

export function RouteReliabilityExplorer() {
  const [searchParams, setSearchParams] = useState<RouteSearchParams>({});
  const [results, setResults] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      // Clean up search params - remove empty strings and trim whitespace
      const cleanParams: RouteSearchParams = {};
      if (searchParams.origin?.trim()) cleanParams.origin = searchParams.origin.trim();
      if (searchParams.destination?.trim()) cleanParams.destination = searchParams.destination.trim();
      if (searchParams.mode) cleanParams.mode = searchParams.mode;
      if (searchParams.nature) cleanParams.nature = searchParams.nature;
      
      console.log("Searching routes with params:", cleanParams);
      const data = await searchRoutes(cleanParams);
      console.log("Received routes data:", data);
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Route search failed:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to search routes. Please try again.";
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="daksh-layered-deep daksh-gradient-card rounded-xl overflow-hidden border border-border/60">
      <div className="p-6 border-b border-border/60 daksh-gradient-muted bg-gradient-to-r from-muted/40 to-muted/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          <div className="daksh-text-primary text-lg font-semibold">
            Route Reliability Explorer
          </div>
        </div>
        <div className="daksh-text-secondary text-sm">
          Search and analyze route performance metrics across delivery modes
        </div>
      </div>

      <div className="p-6">
        {/* Search Filters */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="grid gap-4 md:grid-cols-5 mb-6"
        >
          <Input
            placeholder="Origin (e.g., Delhi)"
            value={searchParams.origin || ""}
            onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
            className="daksh-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Input
            placeholder="Destination (e.g., Bengaluru)"
            value={searchParams.destination || ""}
            onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
            className="daksh-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Select
            value={searchParams.mode || "all"}
            onValueChange={(value: "Surface" | "Air" | "Express" | "all") =>
              setSearchParams({ ...searchParams, mode: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="daksh-input">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="Surface">Surface</SelectItem>
              <SelectItem value="Air">Air</SelectItem>
              <SelectItem value="Express">Express</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.nature || "all"}
            onValueChange={(value: "Dox" | "Non-Dox" | "all") =>
              setSearchParams({ ...searchParams, nature: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="daksh-input">
              <SelectValue placeholder="Nature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Dox">Dox</SelectItem>
              <SelectItem value="Non-Dox">Non-Dox</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 daksh-elevated daksh-focus-ring daksh-press"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Results Table */}
        {hasSearched && (
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center daksh-text-secondary">
                Loading route data...
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-sm font-semibold text-[#E74C3C] mb-2">Error</div>
                <div className="text-sm text-muted-foreground">{error}</div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center daksh-text-secondary">
                No routes found matching the search criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Avg Transit Days</TableHead>
                    <TableHead>Reliability Std Dev</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Nature</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((route, idx) => {
                    // Safely handle potentially undefined values
                    const avgTransitDays = route.avgTransitDays ?? 0;
                    const reliabilityStdDev = route.reliabilityStdDev ?? 0;
                    const isHighVariance = reliabilityStdDev > 1.5;
                    const isHighDelay = avgTransitDays > 4.0;
                    return (
                      <TableRow
                        key={`${route.route || idx}-${idx}`}
                        className="daksh-interactive daksh-table-row-enhanced daksh-fade-in"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <TableCell className="font-semibold daksh-text-secondary">
                          <div className="flex items-center gap-2">
                            {isHighVariance && (
                              <AlertTriangle className="h-4 w-4 text-[#FF9933]" />
                            )}
                            {route.route || "N/A"}
                          </div>
                          <div className="text-xs daksh-text-meta mt-0.5">
                            {route.origin || "N/A"} → {route.destination || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`daksh-data-emphasis inline-block tabular-nums ${
                              isHighDelay ? "text-[#E74C3C]" : ""
                            }`}
                          >
                            {avgTransitDays.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="daksh-data-emphasis inline-block tabular-nums">
                            {reliabilityStdDev.toFixed(2)}
                            {isHighVariance && (
                              <span className="ml-2 text-xs text-[#FF9933]">High Variance</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="daksh-code">{route.mode || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="daksh-code">{route.nature || "N/A"}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="text-center p-8 daksh-text-meta border border-dashed rounded-lg">
            <div className="mb-2">Enter search criteria above to explore route reliability metrics</div>
            <div className="text-xs text-muted-foreground mt-2">
              You can search by origin, destination, mode, or nature. Leave fields empty to see all routes.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
