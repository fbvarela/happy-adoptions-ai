"use client";
import { useState, useEffect } from "react";
import ChatInterface from "@/components/chat/ChatInterface";

export default function FloatingChatButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI chat"
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--bark, #3d2b1f)",
          color: "#fff",
          display: open ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          zIndex: 999,
          border: "none",
          cursor: "pointer",
          fontSize: 22,
        }}
      >
        &#128172;
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI chat assistant"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface, #fff)",
              width: "100%",
              maxWidth: 480,
              height: "min(85dvh, 640px)",
              borderRadius: "16px 16px 0 0",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.1rem",
                borderBottom: "1px solid var(--line, #e5e5e5)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #1a1a1a)" }}>
                AI Assistant
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 26,
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "var(--text-muted, #777)",
                  padding: "0 4px",
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: "1rem 1.1rem" }}>
              <ChatInterface />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
