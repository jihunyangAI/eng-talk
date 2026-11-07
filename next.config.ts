import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 서버에 같은 와이파이의 휴대폰(내부 IP)으로 접속 허용 — 운영 배포에는 영향 없음
  // (PC의 내부 IP가 바뀌면 이 값도 바꿔야 함)
  allowedDevOrigins: ["192.168.35.136"],
};

export default nextConfig;
