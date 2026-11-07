# 작업 중인 챕터

발음 음성이 아직 다 만들어지지 않아 앱 목록에서 빠져 있는 챕터입니다.
사진(`public/images/<id>/`)은 이미 있습니다.

완성되면:
1. 이 폴더의 JSON을 `content/chapters/`로 옮긴다
2. `content/index.json`에 항목을 추가한다 (id, order, title, level, category, cover)
3. 음성 파일을 `public/audio/<id>/lN.mp3`에 넣고 각 대사에 `audio` 경로를 연결한다
4. `npm run validate`로 확인한다
