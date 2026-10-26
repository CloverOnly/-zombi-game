# 3D 주택 실내 다듬기 — 2026-10-26

## 내려받은 무료 재질

- 출처: [Poly Haven · Rough Linen](https://polyhaven.com/a/rough_linen)
- 라이선스: [CC0](https://polyhaven.com/license), 상업용 게임에 포함 가능.
- [Poly Haven API](https://polyhaven.com/our-api)를 `User-Agent: PoyuHouseInterior/1.0`로 사용해 파일 주소를 확인했다.
- 메타데이터: `rough-linen-files.json`. 내려받은 세 파일은 메타데이터에 기재된 MD5와 모두 일치한다.

| 파일 | 용도 | MD5 |
| --- | --- | --- |
| rough_linen_diff_1k.jpg | 천 색상과 직조 무늬 | 663db789fb075462b685c1f740e58930 |
| rough_linen_nor_gl_1k.jpg | 빛에 반응하는 직조 표면 | 3350269a2e9c472aa406bd3cc1eaf2c8 |
| rough_linen_rough_1k.jpg | 천 표면의 반사 거칠기 | a380b24cc43cff88c39510305ebf0020 |

기본 실내 재질은 내려받은 원본을 변경 없이 `interior-bundle.js`에 담았다. 색상 맵은 sRGB, 표면 방향과 거칠기는 선형 데이터로 읽는다. 소파·이불·외투 등에 적용하며, 노멀 강도는 과도한 요철이 생기지 않게 낮췄다.

안방 침대 프레임과 이불, 게임방 의자는 인터넷 연결 시 [Poly Haven 무료 API](https://github.com/Poly-Haven/Public-API)의 파일 목록에서 1K 색상 맵을 확인해 비동기로 적용한다. 사용 자산은 [Wood Table](https://polyhaven.com/a/wood_table), [Rough Linen](https://polyhaven.com/a/rough_linen), [Leather White](https://polyhaven.com/a/leather_white)이며 모두 CC0이다. 응답이나 다운로드가 실패하면 프로젝트에 포함된 재질을 유지한다. 가구의 3D 형상은 프로젝트 코드에서 직접 구성했다.

## 직접 구성한 형상

소파, 봉제선, 쿠션, 담요, 외투, 커튼, TV 테두리와 뒷면, 주전자·식기·조리도구·화분·액자·콘센트는 `interior-polish.js`에서 직접 구성했다. 다운로드한 완성 소파 모델을 사용한 것은 아니다. 기존 `oak-floor.png`, `kitchen-tile.png`는 변경 없이 재사용한다.

## 변경 범위와 검증

1인칭 3D 게임을 계속 사용한다. 방 세 개·화장실·거실과 주방의 연결 구조, 수집·현관·전투·이웃집·엘리베이터·주차장·롯데마트 진행을 유지한다. 안방 침대 폭을 2.2m로 줄이고, 소파는 기존 충돌 경계 안에 다시 구성했다. 실내 조명의 그림자는 위층 실내만 대상으로 한다.

기존 파일은 `backups/before-interior-polish`에 보관했다. 이동·수집·스토리 진행 검사는 로컬 시뮬레이션으로 수행한다. `qa/material-*.png`는 배치 점검용 소프트웨어 렌더로, 실제 WebGL 조명이나 게임 화면을 그대로 나타내지 않는다.
