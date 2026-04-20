"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useI18n } from "@/i18n";
import { theme, mono } from "@/lib/theme";

type Rating = "like" | "dislike";

interface StoryRatingProps {
  sessionId: string | null;
}

export function StoryRating({ sessionId }: StoryRatingProps) {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState<Rating | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (rating: Rating) => {
    if (submitted || pending) return;
    setPending(true);
    setSubmitted(rating);
    if (sessionId) {
      try {
        await fetch("/api/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "rate", sessionId, rating }),
        });
      } catch {
        // Telemetry must never break UX.
      }
    }
    setPending(false);
  };

  const containerStyle: React.CSSProperties = {
    marginTop: 20,
    padding: "14px 18px",
    borderRadius: 8,
    border: `1px solid ${theme.inkBorder07}`,
    background: "rgba(255,250,240,0.48)",
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    animation: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
  };

  const promptStyle: React.CSSProperties = {
    fontSize: 12,
    ...mono,
    color: theme.ink55,
    letterSpacing: 0.6,
    marginRight: "auto",
  };

  const buttonStyle = (active: boolean, locked: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 999,
    border: `1px solid ${active ? theme.mossBorder24 : theme.inkBorder08}`,
    background: active ? theme.mossBg09 : "rgba(255,250,240,0.6)",
    color: active ? theme.moss78 : theme.ink55,
    fontSize: 11,
    ...mono,
    letterSpacing: 0.8,
    cursor: locked ? "default" : "pointer",
    opacity: locked && !active ? 0.5 : 1,
    transition: "all 0.2s ease",
  });

  return (
    <div style={containerStyle}>
      <div style={promptStyle}>
        {submitted ? t("rate_thanks") : t("rate_prompt")}
      </div>
      <button
        type="button"
        aria-label={t("rate_like")}
        onClick={() => submit("like")}
        disabled={submitted !== null || pending}
        style={buttonStyle(submitted === "like", submitted !== null)}
      >
        <ThumbsUp size={13} strokeWidth={1.8} aria-hidden="true" />
        {t("rate_like")}
      </button>
      <button
        type="button"
        aria-label={t("rate_dislike")}
        onClick={() => submit("dislike")}
        disabled={submitted !== null || pending}
        style={buttonStyle(submitted === "dislike", submitted !== null)}
      >
        <ThumbsDown size={13} strokeWidth={1.8} aria-hidden="true" />
        {t("rate_dislike")}
      </button>
    </div>
  );
}
