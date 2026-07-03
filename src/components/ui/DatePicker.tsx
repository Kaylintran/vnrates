"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (date: string) => void;
  max?: string; // "YYYY-MM-DD"
  placeholder?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseDateStr(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function DatePicker({ value, onChange, max, placeholder = "dd/mm/yyyy" }: DatePickerProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value ? parseDateStr(value) : null;
  const maxDate = max ? parseDateStr(max) : null;
  const today = new Date();

  const [viewYear, setViewYear] = useState((selected ?? today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selected ?? today).getMonth());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayText = selected
    ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(selected)
    : placeholder;

  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(1970, 0, 4 + i))
  );
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(viewYear, viewMonth, 1)
  );

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function isDisabled(day: number) {
    if (!maxDate) return false;
    return new Date(viewYear, viewMonth, day) > maxDate;
  }

  function isSelected(day: number) {
    return (
      !!selected &&
      selected.getFullYear() === viewYear &&
      selected.getMonth() === viewMonth &&
      selected.getDate() === day
    );
  }

  function selectDay(day: number) {
    onChange(toDateStr(viewYear, viewMonth, day));
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: selected ? "var(--text)" : "var(--text-3)",
        }}
      >
        <Calendar size={14} />
        {displayText}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 z-20 rounded-xl border p-3 w-64"
          style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md transition-colors"
              style={{ color: "var(--text-2)" }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm capitalize font-medium" style={{ color: "var(--text)" }}>
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md transition-colors"
              style={{ color: "var(--text-2)" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase mb-1" style={{ color: "var(--text-3)" }}>
            {weekdayLabels.map((w, i) => (
              <div key={`${w}-${i}`}>{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const disabled = isDisabled(day);
              const active = isSelected(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className="text-xs rounded-md py-1.5 transition-colors"
                  style={{
                    color: disabled ? "var(--text-3)" : active ? "#fff" : "var(--text-2)",
                    backgroundColor: active ? "var(--blue)" : "transparent",
                    opacity: disabled ? 0.35 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
