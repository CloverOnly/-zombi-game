# 포유하우스 외벽 모델 시험 구역

2026-10-28 [네이버 지도 포유하우스 장소](https://map.naver.com/p/entry/place/1750196378)에서 게임의 건물 주소가 **대전 유성구 지족로364번길 25**임을 확인했다. 이후 사용자가 지정한 [건물 정면 거리뷰](https://map.naver.com/p?c=17.00,0,0,0,adh&p=9HFpXSeej2Av6rXIjrgIbw,44.69,-9.75,80,Float)를 직접 확인했다. 사진에는 회색 석재 저층부, 좁은 가로창 두 줄, 중앙 보행 출입구, 흰색 상층의 세로로 좁은 창과 중앙의 짙은 세로 구역이 보인다. 치수는 사진에서 실측할 수 없으므로 **1:1 복원이라고 주장하지 않는다.**

시험 자산: [Poly Haven Modular Urban Apartments Facade](https://polyhaven.com/a/modular_urban_apartments_facade). [Poly Haven 라이선스](https://polyhaven.com/license)는 CC0이며 상업 이용이 가능하다. 공식 API의 1K glTF, BIN 및 포함된 PBR 텍스처를 다운로드하여 MD5를 모두 대조했다. `assets/models/exterior/polyhaven-facade/`에 저장했다.

처음 시험한 2×2 벽 패널은 실제 정면과 달라 제거했다. `exterior-upgrade.js`는 키트의 좁은 창 GLTF 모델 4개를 기존 창 네 곳의 위치에 배치한다. `streets.js`에서는 해당 네 곳의 원래 시각 창을 생성하지 않는다. 기존 충돌체·주행 경로·주차장 입구는 유지한다. 화면에서 볼 수 있는 것은 **작은 시험 구역**이며 외벽 전체 교체가 아니다. 정확한 창틀 세부와 층별 치수가 확인되지 않아 전체 외벽에는 반복 배치하지 않았다.

Chrome 게임 시험에서 `window.poyuExteriorStatus.loaded=true`, `panels=4`, `pbrMeshes=8`, `error=null`을 확인했다. 180프레임 표본 중앙값 59.9fps, 95백분위 59.5fps(Headless Chrome·SwiftShader). 화면은 `qa/exterior-study.png`. 이 화면은 임시 검사용 시점을 사용해 촬영했고 해당 코드는 제거했다. 실제 플레이 화면의 시야·동선은 변경하지 않았다.
# 투썸플레이스 인접 건물 (2026-10-28)

사용자가 지정한 [네이버 거리뷰](https://map.naver.com/p?c=17.00,0,0,0,adh&p=9HFpXSeej2Av6rXIjrgIbw,44.69,-9.75,80,Float)의 2025년 3월 화면에서 포유하우스 오른쪽의 투썸플레이스 건물을 확인했다. 검은 저층 상가의 넓은 유리 정면, 중앙에서 약간 벗어난 출입구, 위쪽의 흰 아파트형 외벽을 기준으로 삼았다. 거리뷰 이미지는 게임 에셋으로 복제하지 않았다.

기존 게임의 `twosome` 위치와 충돌체는 유지했다. 저층 외벽 재질을 어둡게 조정하고, 이미 다운로드한 Poly Haven [Modular Urban Apartments Facade](https://polyhaven.com/a/modular_urban_apartments_facade)의 glTF 창 및 문 모듈 6개를 동쪽 정면에 배치했다. 이 모델과 포함된 PBR 텍스처는 [CC0](https://polyhaven.com/license)이며 상업적 이용이 가능하다.

2026-10-28 재검토: 거리뷰에서 건물 저층부는 갈색이 아닌 차콜색 외장과 청회색 유리로 확인했다. 기존 glTF의 갈색 원본 색상 맵을 저층 모듈에서 제거하고 노멀/러프니스 맵은 유지했다. 동쪽 정면에서 남쪽 옆길과 북쪽 측면까지 동일한 glTF 모듈을 이어 붙였으며, 모서리의 밝은 틈은 같은 자산의 벽 모듈로 덮었다. 기존 도로와 보도, 충돌체는 유지했다.

브라우저 검증: `window.poyuExteriorStatus.loaded === true`, `twosomePanels === 21`, `twosomePbrMeshes === 32`, `twosomeReturns === 11`; 리소스 오류는 `favicon.ico` 404뿐이었다. 거리뷰와 비교하면 창틀이 여전히 촘촘하고 상가의 정확한 간판·출입구 비례까지 재현된 상태는 아니다. 전용 상가 유리 파사드 GLB가 확보되면 이 모듈을 교체해야 한다. 아파트 전체 확장은 진행하지 않았다.

## 투썸 주변 거리 확장

같은 거리뷰에서 투썸 앞 보도가 옆길로 이어지고, 도로 반대쪽에 거친 블록 옹벽이 길게 이어지는 것을 확인했다. 원래 게임의 보도 경계·도로·충돌체를 유지하며 동쪽/남쪽 보도와 기존 끝 옹벽에 실측 PBR 표면을 적용했다. 반대쪽 도로 바깥(x=74.5, z=91~136)에는 다운로드한 Poly Haven glTF 외벽 모듈 11개를 배치해 연속된 옹벽을 만들었다. 3D 모델과 텍스처는 게임 파일 안에 저장되어 있다.

- [Concrete Block Wall](https://polyhaven.com/a/concrete_block_wall): Diffuse, OpenGL Normal, Roughness 1K JPEG. 옹벽 3D 모듈과 기존 끝 옹벽에 적용.
- [Concrete Tiles 02](https://polyhaven.com/a/concrete_tiles_02): Diffuse, OpenGL Normal, Roughness 1K JPEG. 투썸 앞 보도, 가로수 보도, 옆길 보도에 적용.
- [Modular Urban Apartments Facade](https://polyhaven.com/a/modular_urban_apartments_facade): 기존 다운로드 glTF의 벽 모듈 사용.

보도변의 기존 박스형 설비함 표시도 이미 확보한 [Utility Box 02](https://polyhaven.com/a/utility_box_02) glTF 모델 2개로 교체했다. 모두 [Poly Haven CC0](https://polyhaven.com/license)로 상업적 이용 가능하다. 브라우저에서는 옹벽 모델 11개, 설비함 모델 2개, PBR 표면 4개의 로딩을 확인했고 옹벽과 보도는 화면에서도 확인했다. 거리뷰의 금속 울타리, 겨울 가로수와 먼 건물은 아직 실제 모델로 교체되지 않았다.

