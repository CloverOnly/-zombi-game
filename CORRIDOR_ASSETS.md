# 6층 복도 한 구역: 외부 3D 에셋

2026-10-28에 Poly Haven 공식 API에서 1K glTF 및 PBR 파일을 다운로드했다. 다운로드한 각 파일은 API에 기재된 MD5와 대조했다. [Poly Haven의 자산 라이선스](https://polyhaven.com/license)는 CC0이며 상업용 게임에 사용할 수 있다.

| 사용처 | 에셋 | 원본 |
| --- | --- | --- |
| 천장 형광등 | Mounted Fluorescent Lights | https://polyhaven.com/a/mounted_fluorescent_lights |
| 소화기 | Korean Fire Extinguisher 01 | https://polyhaven.com/a/korean_fire_extinguisher_01 |
| 배전함 소품 | Utility Box 02 | https://polyhaven.com/a/utility_box_02 |
| 복도 수납장 | Modern Wooden Cabinet | https://polyhaven.com/a/modern_wooden_cabinet |
| 바닥 PBR | Floor Tiles 02 | https://polyhaven.com/a/floor_tiles_02 |
| 벽 PBR | Painted Plaster Wall | https://polyhaven.com/a/painted_plaster_wall |

모델은 `assets/models/corridor/`에 GLTF, BIN, 1K 텍스처를 함께 보관한다. 표면 재질은 `assets/materials/corridor/`에 색상, OpenGL 노멀, 러프니스 맵을 보관한다. `corridor-upgrade.js`는 해당 파일을 비동기 로드하며, 로드 결과를 `window.poyuCorridorStatus`로 제공한다. 오류가 있으면 기존 장면을 유지하고 오류 목록에 기록한다.

범위는 현관 앞 복도 첫 구역(x=16~20, z=8.4~13.2)의 시각적 소품과 표면이다. 기존 벽·문·천장의 구조 메시, 충돌체, 진행 동선과 상호작용은 유지한다. 적합한 한국형 현관문·문틀·계단실 및 모듈형 복도 구조 모델은 이번에 확보하지 못했으므로, 건축 구조 교체는 완료되지 않았다. 현재 배전함은 실외용 산업 설비 모델이며 실제 한국 아파트 실내 설비와 외관 차이가 있다.

`qa/corridor-before.png`와 `qa/corridor-after.png`는 Chrome에서 안전 현관 시작 지점을 선택한 다음 동일한 E 및 W 입력을 보낸 결과다. `qa/corridor-actual.png`는 실제 게임 폴더에 복사한 뒤 다시 캡처한 화면이다.
