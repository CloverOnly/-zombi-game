# 차량 모델 교체

Innerscene의 무료 CC0 `White four-door sedan` GLB(5,063,600 bytes)를 내려받았다. 출처와 상업 이용·재배포 허용 선언은 `assets/models/vehicles/sedan/LICENSE.txt`에 기록했다. 사진 속 현대·기아 차량을 정확히 복원한 모델은 아니다.

`vehicle-upgrade.js`는 GLTFLoader로 로컬 GLB를 읽고 운전 차량 1대와 주차 차량 33대의 시각 메시를 교체한다. 운전 차량의 기존 충돌체, 키·탑승·시동·내구도·차단기 API를 보존했다. 다운로드한 차체에서 운전석 문 패널을 분리해 기존 경첩 제어에 연결하고, 모델 핸들을 기존 조향 제어에 연결했다. 운전석 위치는 새 좌석과 앞유리에 맞췄다. 주차 차량은 10개 재질별 인스턴스를 공유하며 13,878 삼각형의 경량화 형상을 사용한다. 차량별 외부 API 요청은 없으며 최초 로컬 파일 로드만 한다.

모델의 기본 색상 텍스처와 PBR 재질을 사용한다. 내부 카메라에서 투과 유리가 검게 보이던 문제는 얇은 투명 유리 재질로 수정했다. 독립된 벽지·타일용 노멀맵을 차량에 적용했다고 주장하지 않는다.

검증: `node qa/vehicle-model.cjs`는 실제 다운로드 GLB의 형상을 GLTFLoader로 읽어 문 패널 이동·닫힘, 운전석 앞 공간, UV 보존을 확인한다. 이 Node 시험은 이미지 디코딩을 대체하므로 텍스처·최종 화면 검증은 Chrome에서 별도로 수행한다. `smoke-test.js`, `chapter-test.cjs`의 기존 진행 시험도 통과했다.

사진 방향 — 사용자 추가 확인에 따라 정정: **010024(세 번째 사진)이 건물 정면 자체**다. 이를 기준으로 010040은 오른쪽 도로, 010050은 왼쪽 도로를 본 장면으로 연결한다. `streets.referenceViews`에 사진 번호·시점·방향을 저장했다. 게임 좌표 기준 정면은 -X, 오른쪽은 -Z, 왼쪽은 +Z이며 실측 방위각을 뜻하지 않는다. 이번 차량 교체에서는 도로·출입구를 추가로 회전하거나 건물을 이동하지 않았다.

Chrome 최종 확인: 차량 loaded=true, parked=33, driverDoor=true, errors=[]; 리소스 실패 없음. 기존 Three.js 버전 경고만 관찰했다. 주차장 검사 시점에서 264 draw calls, 990,890 triangles, 약 12fps를 관찰했다. 이 환경에서 60fps를 검증한 결과는 아니다. 주차장은 주차장 차량만 표시하고 외부 차량은 공간별 인스턴스 묶음으로 나눠 보이지 않는 차량의 렌더링을 줄인다.

변경 파일: `vehicle-upgrade.js`, `model-upgrade.js`, `parking.js`, `street-details.js`, `driving.js`, `world.js`, `index.html`, 차량 GLB와 출처 문서. 비교 이미지는 `qa/car-before.jpg`, `qa/car-after.jpg`, `qa/car-door.jpg`, `qa/car-cockpit.jpg`.
