"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventStatus = "completed" | "upcoming" | "coming_soon";

export interface SitEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  year: string;
  time: string;
  location: string;
  description: string;
  status: EventStatus;
  color: string;
  tags: string[];
}

interface EventListProps {
  events: SitEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
}

// ─── Status Indicator ────────────────────────────────────────────────────────

function StatusIndicator({
  status,
  color,
  isHovered,
}: {
  status: EventStatus;
  color: string;
  isHovered: boolean;
}) {
  const size = isHovered ? 12 : 8;

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    transition: "width 200ms ease-out, height 200ms ease-out, min-width 200ms ease-out, min-height 200ms ease-out",
  };

  if (status === "completed") {
    return (
      <span
        style={{
          ...baseStyle,
          background: color,
        }}
        aria-hidden="true"
      />
    );
  }

  if (status === "upcoming") {
    return (
      <span
        style={{
          ...baseStyle,
          border: `2px solid ${color}`,
          animation: "statusPulse 1.5s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
    );
  }

  // coming_soon
  return (
    <span
      style={{
        ...baseStyle,
        border: `1.5px dashed ${color}`,
        opacity: 0.6,
      }}
      aria-hidden="true"
    />
  );
}

// ─── Event List Item ─────────────────────────────────────────────────────────

function EventListItem({
  event,
  isSelected,
  isFocused,
  onSelect,
  onFocus,
  itemRef,
}: {
  event: SitEvent;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
  onFocus: () => void;
  itemRef: (el: HTMLButtonElement | null) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showBlip, setShowBlip] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const glitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShowBlip(true);

    // Glitch flicker: add class, remove after 60ms
    if (titleRef.current) {
      titleRef.current.classList.add("glitch-flicker");
      glitchTimeoutRef.current = setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.classList.remove("glitch-flicker");
        }
      }, 60);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowBlip(false);
  }, []);

  // Hex alpha for 5% opacity of event color
  // The color is a CSS variable, so we apply it as a semi-transparent background
  const hoverBgColor = `color-mix(in srgb, ${event.color} 5%, transparent)`;

  return (
    <button
      ref={itemRef}
      role="option"
      aria-selected={isSelected}
      data-event-item
      onClick={onSelect}
      onFocus={onFocus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="font-mono"
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        minHeight: 64,
        position: "relative",
        background: isSelected ? "var(--color-surface)" : "transparent",
        padding: "12px 16px",
        cursor: "pointer",
        outline: isFocused ? "2px solid var(--color-accent-gold)" : "none",
        outlineOffset: isFocused ? "-2px" : "0",
        textAlign: "left",
        transition: "background 200ms ease-out, border-left-color 200ms ease-out",
        overflow: "hidden",
        borderTop: "none",
        borderRight: "none",
        borderLeft: `3px solid ${isSelected ? "var(--color-accent-gold)" : "transparent"}`,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Hover background slide-in from left */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: hoverBgColor,
          transformOrigin: "left",
          transform: isHovered || isSelected ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 200ms ease-out",
          pointerEvents: "none",
        }}
      />

      {/* Horizontal blip line on hover */}
      {showBlip && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: event.color,
            transformOrigin: "left",
            animation: "hBlip 100ms ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content layer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Status indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            flexShrink: 0,
          }}
        >
          <StatusIndicator
            status={event.status}
            color={event.color}
            isHovered={isHovered}
          />
        </div>

        {/* Title + date */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            ref={titleRef}
            className="font-mono font-bold uppercase tracking-wider"
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.4,
              color: isSelected ? event.color : "var(--color-text)",
              display: "block",
              transition: "color 200ms ease-out",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event.title}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "0.75rem",
              lineHeight: 1.4,
              color: "var(--color-text-muted)",
              display: "block",
              marginTop: 2,
            }}
          >
            {event.month}/{event.year}
          </span>
        </div>

        {/* Arrow */}
        <span
          className="font-mono"
          style={{
            fontSize: "0.875rem",
            color: isSelected ? "var(--color-accent-gold)" : "var(--color-text)",
            opacity: isSelected || isHovered ? 1 : 0.3,
            transition: "opacity 200ms ease-out, color 200ms ease-out",
            flexShrink: 0,
            marginLeft: 8,
          }}
          aria-hidden="true"
        >
          {">"}
        </span>
      </div>
    </button>
  );
}

// ─── Event List (main export) ────────────────────────────────────────────────

export default function EventList({
  events,
  selectedId,
  onSelect,
}: EventListProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const len = events.length;
      if (len === 0) return;

      let nextIndex = focusedIndex;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          nextIndex = focusedIndex < len - 1 ? focusedIndex + 1 : 0;
          break;
        case "ArrowUp":
          e.preventDefault();
          nextIndex = focusedIndex > 0 ? focusedIndex - 1 : len - 1;
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = len - 1;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < len) {
            onSelect(events[focusedIndex].id);
          }
          return;
        default:
          return;
      }

      setFocusedIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus();
    },
    [events, focusedIndex, onSelect]
  );

  // Sync focusedIndex with selectedId on mount / selectedId change
  useEffect(() => {
    const idx = events.findIndex((ev) => ev.id === selectedId);
    if (idx !== -1) {
      setFocusedIndex(idx);
    }
  }, [selectedId, events]);

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Event selectie"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="font-mono"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        background: "var(--color-bg)",
        borderRight: "1px solid var(--color-border)",
        overflowY: "auto",
        outline: "none",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span
          className="font-mono font-bold uppercase tracking-wider"
          style={{
            fontSize: "0.625rem",
            color: "var(--color-text-muted)",
            letterSpacing: "0.15em",
          }}
        >
          {"// EVENT SELECT"}
        </span>
      </div>

      {/* Event items */}
      {events.map((event, index) => (
        <EventListItem
          key={event.id}
          event={event}
          isSelected={event.id === selectedId}
          isFocused={focusedIndex === index}
          onSelect={() => onSelect(event.id)}
          onFocus={() => setFocusedIndex(index)}
          itemRef={(el) => {
            itemRefs.current[index] = el;
          }}
        />
      ))}

      {/* Footer hint */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--color-border)",
          marginTop: "auto",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: "0.625rem",
            color: "var(--color-text-muted)",
            opacity: 0.5,
          }}
        >
          {"["}
          <span style={{ color: "var(--color-accent-gold)" }}>{"ARROW"}</span>
          {"] navigate  ["}
          <span style={{ color: "var(--color-accent-gold)" }}>{"ENTER"}</span>
          {"] select"}
        </span>
      </div>
    </div>
  );
}
