"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Shanghai",
});

function formatShanghaiTime(date: Date) {
  return formatter.format(date);
}

type LiveLocalTimeProps = {
  compact?: boolean;
};

export function LiveLocalTime({ compact = false }: LiveLocalTimeProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(formatShanghaiTime(new Date()));
    tick();

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <span className="live-local-time live-local-time-compact">
        <span>Local Time</span>
        <strong suppressHydrationWarning>{time || "--:--"}</strong>
      </span>
    );
  }

  return (
    <span className="text-center text-foreground/46">
      Local Time
      <br />
      <span suppressHydrationWarning>UTC+8 {time || "--:--"}</span>
    </span>
  );
}
