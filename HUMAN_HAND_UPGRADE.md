# 1인칭 손 교체 — 2026-10-29

이전 MakeHuman 전신 모델에서 잘라 쓰던 손을 **WebXR Input Profiles generic-hand/right.glb** 전용 오른손으로 교체했다. 1,360 vertices, 2,314 triangles, 25개 관절의 실제 리깅 GLB다.

출처: https://github.com/immersive-web/webxr-input-profiles/tree/main/packages/assets/profiles/generic-hand
직접 다운로드: https://raw.githubusercontent.com/immersive-web/webxr-input-profiles/main/packages/assets/profiles/generic-hand/right.glb
라이선스: MIT. 상업 이용·수정·재배포 가능. 원래 고지문을 `assets/models/hands/webxr/LICENSE.md`에 포함했다.

수정 내용:

- 평면 관절 목록을 손목→중수골→손가락 마디 계층으로 재구성하며 바인드 변환을 보존했다.
- 각 관절의 굽힘 범위를 제한하고 손가락 끝이 손잡이 주변에 오도록 로드 시에만 그립 자세를 계산한다. 엄지도 손잡이를 감싼다.
- 다운로드한 손 메시의 손목 부분을 늘리고 완만하게 넓혀 짧은 팔뚝으로 연결했다. 별도 구체·캡슐 팔을 붙이지 않는다.
- 화면 끝에 몰린 손과 방망이를 안쪽으로 옮겼다. 공격 중 회전량과 대기 흔들림을 줄였다.
- 명중 거리·피해량·공격 시간·쿨다운·좀비 AI는 수정하지 않았다. 기존 명중 반동과 소리는 유지한다.

검증:

- `node qa/hand-model.cjs`: 실제 GLB 파싱, 25관절·2,314삼각형 확인, 손가락 계층, 대기~공격 구간의 유효 변환, 무기 미장착 시 숨김.
- `node chapter-test.cjs`: 공격 명중/빗맞음/쿨다운, 피해·사망·재시작과 기존 챕터 진행 통과.
- Chrome 실제 게임의 대기 자세와 공격 중간 자세를 시각 확인했다. 콘솔 JavaScript 오류 없음.
- `qa/hand-before.jpg`, `qa/hand-after.jpg`, `qa/hand-swing.jpg`는 동일한 검사 장면의 실제 게임 렌더링이다. 공격 이미지는 자세를 잠시 고정한 검사 프레임이다.

한계: 피부는 색상·거칠기를 지정한 재질이며 사진 기반 피부 텍스처나 피부 노멀맵을 새로 적용한 작업은 아니다. 현재 손은 방망이를 장착한 1인칭 화면에 표시된다.
