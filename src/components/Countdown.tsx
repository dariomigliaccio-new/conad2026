"use client";

import { useEffect, useState } from "react";

const EVENT_DATE = new Date("2026-08-15T09:00:00-04:00").getTime();

type TimeLeft = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function getTimeLeft(): TimeLeft {
  const distance = Math.max(0, EVENT_DATE - Date.now());
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => ({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  }));

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="countdownSection" aria-label="Contagem regressiva do evento">
      <p className="impactKicker">CONAD 2026</p>
      <h2>Faltam poucos dias para começar.</h2>
      <div className="countdownGrid">
        <div>
          <strong>{timeLeft.days}</strong>
          <span>Dias</span>
        </div>
        <div>
          <strong>{timeLeft.hours}</strong>
          <span>Horas</span>
        </div>
        <div>
          <strong>{timeLeft.minutes}</strong>
          <span>Minutos</span>
        </div>
        <div>
          <strong>{timeLeft.seconds}</strong>
          <span>Segundos</span>
        </div>
      </div>
    </section>
  );
}
