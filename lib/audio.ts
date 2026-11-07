"use client";

// 앱 전체에서 한 번에 하나의 음성만 재생 (정답 발음 듣기, 상대방 대사 공통)
let current: HTMLAudioElement | null = null;

export function playExclusive(a: HTMLAudioElement): Promise<void> {
  if (current && current !== a) release(current);
  current = a;
  return a.play();
}

/**
 * 재생을 멈추고 오디오 자원을 완전히 놓음.
 * iOS Safari는 재생이 멈춰도 오디오를 '재생 모드'로 잡고 있어서 직후 음성인식에 소리가 안 들어오는 경우가 있음
 */
function release(a: HTMLAudioElement) {
  a.pause();
  a.removeAttribute("src");
  a.load();
}

/** 재생 중인 음성을 모두 멈추고 해제. 실제로 재생 중이던 소리가 있었으면 true */
export function stopAllAudio(): boolean {
  const wasPlaying = !!current && !current.paused && !current.ended;
  if (current) release(current);
  current = null;
  return wasPlaying;
}
