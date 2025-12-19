"use client";

import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { fetchDigipinByAddress, fetchDigipinByLocation } from "@/lib/digipin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DigipinInputProps {
  value: string;
  onChange: (value: string) => void;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  disabled?: boolean;
  className?: string;
  showAutoFetch?: boolean;
}

export function DigipinInput({
  value,
  onChange,
  address,
  city,
  state,
  pincode,
  disabled = false,
  className,
  showAutoFetch = true,
}: DigipinInputProps) {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetchByAddress() {
    if (!address || !city || !state || !pincode) {
      setError("Please fill in address, city, state, and PIN code first");
      return;
    }

    setFetching(true);
    setError(null);

    try {
      const result = await fetchDigipinByAddress(address, city, state, pincode);
      
      if (result) {
        onChange(result);
      } else {
        setError("Could not fetch DIGIPIN. Please enter manually.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DIGIPIN");
    } finally {
      setFetching(false);
    }
  }

  async function handleFetchByLocation() {
    setFetching(true);
    setError(null);

    try {
      const result = await fetchDigipinByLocation();
      
      if (result) {
        onChange(result);
      } else {
        setError("Could not fetch DIGIPIN from location. Please try address or enter manually.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DIGIPIN from location");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., DL-110001-3F2A"
          disabled={disabled || fetching}
          className="flex-1"
        />
        {showAutoFetch && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleFetchByAddress}
              disabled={fetching || !address || !city || !state || !pincode}
              title="Fetch DIGIPIN from address"
            >
              {fetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleFetchByLocation}
              disabled={fetching}
              title="Fetch DIGIPIN from device location"
            >
              {fetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
      {error && (
        <div className="mt-1 text-xs text-destructive">{error}</div>
      )}
      <div className="mt-1 text-xs text-muted-foreground">
        Official Address Code used for accurate routing and hub assignment.
        {fetching && " Fetching DIGIPIN..."}
        {!fetching && value && " ✓ DIGIPIN ready"}
      </div>
    </div>
  );
}
