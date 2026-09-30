"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPlaces, type Place } from "@/lib/geo";

interface PlaceSearchInputProps {
  label: string;
  placeholder: string;
  value: Place | null;
  initialText?: string;
  onSelect: (place: Place | null) => void;
}

export function PlaceSearchInput({
  label,
  placeholder,
  value,
  initialText = "",
  onSelect,
}: PlaceSearchInputProps) {
  const [text, setText] = useState(value?.shortName ?? initialText);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Place[]>([]);
  const [failed, setFailed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(value?.shortName ?? "");
  }, [value]);

  useEffect(() => {
    const q = text.trim();
    if (q.length < 3) {
      setOptions([]);
      setLoading(false);
      setFailed(false);
      return;
    }
    setLoading(true);
    setFailed(false);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const results = await searchPlaces(q, controller.signal);
        setOptions(results);
        setOpen(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setFailed(true);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [text]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-sm text-[#6B6B6B] mb-2">{label}</label>
      <div className="relative" ref={boxRef}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A] pointer-events-none" />
        <Input
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (value) onSelect(null);
          }}
          onFocus={() => {
            if (options.length > 0) setOpen(true);
          }}
          className="pl-10 pr-10 h-11 rounded-xl border-[#E8E8E8] bg-[#FAFAFA] text-[#111111] placeholder:text-[#8A8A8A] focus:bg-white"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A] animate-spin" />
        )}
        {open && options.length > 0 && (
          <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#E8E8E8] bg-white shadow-lg">
            {options.map((opt, i) => (
              <li key={`${opt.lat}-${opt.lon}-${i}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(opt);
                    setText(opt.shortName);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-[#FAFAFA]"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8A8A8A]" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[#111111]">
                      {opt.shortName}
                    </span>
                    <span className="block truncate text-xs text-[#8A8A8A]">
                      {opt.displayName}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {open && !loading && text.trim().length >= 3 && options.length === 0 && !failed && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-[#6B6B6B] shadow-lg">
            No places found. Try a different search.
          </div>
        )}
        {failed && (
          <p className="mt-2 text-xs text-red-600">
            Search is unavailable right now. Check your connection.
          </p>
        )}
      </div>
    </div>
  );
}
