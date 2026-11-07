"use client";

import { useEffect, useRef, useState } from "react";

// 헤더 안 빈 공간(lane)을 Supansa가 책을 들고 천천히 왔다 갔다 걷는다.
// 이동·방향·멈춤은 JS(requestAnimationFrame), 발걸음·몸 흔들림은 CSS(.walker 클래스, globals.css).

const W = 40; // 캐릭터 너비(px)
const SPEED = 24; // px/s — 산책하듯 느리게
const READ_MS: [number, number] = [1600, 3200]; // 끝에서 책 보며 멈추는 시간
const rand = (a: number, b: number) => a + Math.random() * (b - a);

type Phase = "walking" | "reading";

export function WalkingSupansa() {
  const laneRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("reading");
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    const lane = laneRef.current;
    const walker = walkerRef.current;
    if (!lane || !walker) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // 가만히 서 있음

    let x = 0;
    let d: 1 | -1 = 1;
    let width = lane.clientWidth;
    let raf = 0;
    let last = 0;
    let pauseUntil = performance.now() + 900;
    let nextMidStop = -1; // 가끔 중간에서도 멈춰 책을 봄 (넓을 때만)
    let current: Phase = "reading";

    const ro = new ResizeObserver(() => {
      width = lane.clientWidth;
      x = Math.min(x, Math.max(0, width - W));
    });
    ro.observe(lane);

    const setP = (p: Phase) => {
      if (p !== current) {
        current = p;
        setPhase(p);
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) / 1000 : 0;
      last = now;
      const max = Math.max(0, width - W);

      if (now < pauseUntil || max < 8) {
        setP("reading");
      } else {
        setP("walking");
        x += d * SPEED * dt;
        const progress = max ? x / max : 0;
        if (x <= 0 || x >= max) {
          // 끝에 도착 → 멈춰서 책 읽고 → 돌아서기
          x = Math.max(0, Math.min(max, x));
          d = d === 1 ? -1 : 1;
          setDir(d);
          pauseUntil = now + rand(...READ_MS);
          nextMidStop = max > 160 && Math.random() < 0.5 ? rand(0.3, 0.7) : -1;
        } else if (nextMidStop > 0 && Math.abs(progress - nextMidStop) < 0.01) {
          pauseUntil = now + rand(1200, 2200);
          nextMidStop = -1;
        }
      }
      walker.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={laneRef} aria-hidden className="relative order-last mt-1 h-14 min-w-0 basis-full sm:order-none sm:mt-0 sm:basis-auto sm:flex-1">
      {/* 바닥 그림자 선 */}
      <div className="absolute inset-x-0 bottom-0.5 h-px bg-gradient-to-r from-transparent via-[var(--line-strong)] to-transparent" />
      <div ref={walkerRef} className={`walker absolute bottom-0 left-0 is-${phase}`} style={{ width: W }}>
        <div style={{ transform: `scaleX(${dir})` }} className="transition-transform duration-300">
          <WalkerSvg />
        </div>
      </div>
    </div>
  );
}

/** 3/4 측면(오른쪽을 봄) — 방향은 scaleX로 뒤집음 */
function WalkerSvg() {
  return (
    <svg viewBox="0 0 40 56" className="block h-14 w-10" role="img" aria-label="Supansa">
      {/* 발밑 그림자 */}
      <ellipse className="w-shadow" cx="20" cy="53.6" rx="8" ry="1.3" fill="var(--line-strong)" opacity=".7" />
      {/* 다리 + 분홍 운동화 — 치마 뒤에서 엉덩이를 축으로 앞뒤로 흔들림 (뒷다리 → 앞다리 순) */}
      <g className="w-leg-b">
        <path d="M18.4 36v14.2" stroke="#ecc4a9" strokeWidth="2.3" strokeLinecap="round" />
        <path d="M16.799999999999997 50.4h4.6a1.6 1.6 0 0 1 0 2.4h-4.6a1.2 1.2 0 0 1 0-2.4z" fill="#ff5c8a" />
        <path d="M16.2 52.6h5.8" stroke="#ffffff" strokeWidth=".8" strokeLinecap="round" />
      </g>
      <g className="w-leg-f">
        <path d="M21.6 36v14.2" stroke="#f7d6bf" strokeWidth="2.3" strokeLinecap="round" />
        <path d="M20 50.4h4.6a1.6 1.6 0 0 1 0 2.4h-4.6a1.2 1.2 0 0 1 0-2.4z" fill="#ff5c8a" />
        <path d="M19.400000000000002 52.6h5.8" stroke="#ffffff" strokeWidth=".8" strokeLinecap="round" />
      </g>
      <g className="w-body">
        {/* 뒷머리 */}
        <path d="M11.5 12.5c0-6 3.8-9.5 8.5-9.5s8.5 3.5 8.5 9.5v11.5c0 1.6-1.3 2.6-2.8 2.2L20 25l-5.7 1.2c-1.5.4-2.8-.6-2.8-2.2z" fill="#3b2a2c" />
        {/* 긴 청치마 (걸을 때 살랑) */}
        <g className="w-skirt">
          <path d="M14.8 30.6h10.4l3.8 15H11z" fill="#5b8dc9" />
          <path d="M14.8 30.6h10.4v1.8H14.8z" fill="#4a79b3" />
          <path d="M20 32.4v13.2" stroke="#8db3e2" strokeWidth=".7" strokeDasharray="1.4 1" />
          <path d="M11.6 44.2h16.8" stroke="#8db3e2" strokeWidth=".7" strokeDasharray="1.4 1" />
        </g>
        {/* 목 */}
        <rect x="18.6" y="19" width="2.8" height="2.6" fill="#f7d6bf" />
        {/* 흰 티셔츠 */}
        <path d="M14.5 21h11l2.6 3.4-2 1.6-1-1V31h-10.4v-6l-1 1-2-1.6z" fill="#ffffff" stroke="#f1d3df" strokeWidth=".6" />
        {/* 책 + 책을 감싼 팔 */}
        <g className="w-book">
          <path d="M14 23.5c-.8 2.4-.4 4.6 1.6 5.6" stroke="#f7d6bf" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <g transform="rotate(-10 25 28)">
            <rect x="20.2" y="24.2" width="9.6" height="7.4" rx="1" fill="#ff5c8a" />
            <rect x="21" y="25" width="8" height="5.8" rx=".6" fill="#ffe3ec" />
            <path d="M25 25v5.8" stroke="#ff5c8a" strokeWidth=".7" />
            <path d="M22 26.6h2M22 28h2M26 26.6h2M26 28h2" stroke="#d9a3b6" strokeWidth=".45" strokeLinecap="round" />
          </g>
          <path d="M26.6 22.8c1.4 2 1.6 4.2.2 6.4" stroke="#f7d6bf" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="15.8" cy="29.2" r="1.2" fill="#f7d6bf" />
          <circle cx="26.8" cy="29.4" r="1.2" fill="#f7d6bf" />
        </g>
        {/* 머리 (읽을 때 살짝 숙임) */}
        <g className="w-head">
          <ellipse cx="20.4" cy="13" rx="6.2" ry="6.8" fill="#f7d6bf" />
          <path d="M14 12.4c.4-4.3 3-6.9 6.4-6.9 3.6 0 6.1 2.6 6.5 6.6-2.4-.6-4.6-2-5.9-3.9-1.5 2.2-4 3.6-7 4.2z" fill="#3b2a2c" />
          <circle cx="17.6" cy="15.6" r="1.2" fill="#ffb3c7" opacity=".8" />
          <circle cx="24.6" cy="15.6" r="1.2" fill="#ffb3c7" opacity=".8" />
          <g className="w-eyes">
            <circle cx="18.9" cy="13.3" r=".8" fill="#2e2440" />
            <circle cx="23.5" cy="13.3" r=".8" fill="#2e2440" />
          </g>
          <path d="M19.8 16.7c1 .8 2.2.8 3.2 0" stroke="#d93a6e" strokeWidth=".9" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
