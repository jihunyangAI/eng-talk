# Eng Talk — 상황별 영어회화

장면 사진과 원어민 발음으로 상황별 영어 대화를 익히고, 마이크로 직접 말해 보며 발음 정확도를 확인하는 웹앱입니다.

## 기능

- **챕터별 대화**: 공항·카페·호텔 등 상황(챕터)마다 2인 대화 1개
- **장면 사진**: 대사를 한 번 주고받을 때마다 사진 1장 (AI 생성, 실사)
- **번역**: 영어 + 한국어 / 태국어 (화면 문구도 선택한 언어를 따라감)
- **발음 듣기**: 모든 대사에 미국식 영어 음성 (AI 생성)
- **체험하기**: 역할을 골라 상대방 음성을 듣고 마이크로 대답 → 인식된 문장과 발음 정확도(%) 표시

## 챕터

| # | 챕터 | # | 챕터 |
|---|---|---|---|
| 1 | 공항 체크인 | 5 | 택시 타기 |
| 2 | 카페에서 주문하기 | 6 | 호텔 체크인 |
| 3 | 도서관에서 책 빌리기 | 7 | 식당에서 주문하기 |
| 4 | 입국심사 | 8 | 길 묻기 |

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 빌드 전 콘텐츠 검증 자동 실행
```

체험하기(마이크)는 Chrome·Edge·Safari에서 **https 또는 localhost** 주소로만 동작합니다.

## 구조

```
content/
  chapters/<id>.json        # 챕터 데이터 (대사, 번역, 장면, 음성 경로)
  index.json                # 챕터 목록
  types.ts                  # 데이터 타입
  schema/chapter.schema.json
public/images/<id>/sN.webp  # 장면 사진
public/audio/<id>/lN.mp3    # 대사 발음
app/                        # Next.js App Router 페이지
components/                 # 대화 보기, 체험하기 등 UI
lib/scoring.ts              # 발음 정확도 채점 (단어 단위 비교)
scripts/
  validate-content.mjs      # 콘텐츠 검증 (빌드 전 자동 실행)
  optimize-images.mjs       # 사진 용량 줄이기
```

## 콘텐츠 원칙

대사·사진·음성은 한 번 생성해 저장한 뒤 계속 사용하는 **교재**입니다. 앱 실행 중에 새로 생성하지 않습니다.

## 기술

Next.js 16 (App Router, 정적 생성) · React 19 · TypeScript · Tailwind CSS 4 · Web Speech API
