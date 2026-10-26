# 롯데마트 노은점 내부 구현 근거 — 2026-10-25

## 확인한 노은점 자료

- [네이버 플레이스 노은점 사진](https://pcmap.place.naver.com/place/12973693/photo): 2026년 10월 방문 사진의 델리·분식 코너 두 장을 직접 확인했다. 베이지색 흡음 천장판, 일정한 간격의 긴 형광등, 회색으로 매달린 조명 레일과 원통형 스폿 조명, 원형 환기구, 유리와 금속 프레임으로 된 진열대, 목재 무늬 바닥, 한글 가격표를 모델에 반영했다. 사진 자체를 게임에 복사하지 않았다.
- [중도일보: 롯데마트 노은점 수박, 2019-03-17](https://m.joongdo.co.kr/view.php?key=20190317010006693): 노은점 지하 1층 식품관이라는 층 구성을 확인하는 보조 근거다. 오래된 기사이며 현재 세부 배치의 근거로 삼지 않았다.
- [롯데마트 공식 매장찾기](https://company.lottemart.com/shop/shop_search.asp): 노은점의 점포 정보 확인용. 상세 실측 평면은 확보하지 못했다.

## 실제 확인과 게임용 구성의 구분

천장·조명·델리 진열대·목재 무늬 마감은 노은점 사진에서 확인한 특징이다. 1층에서 지하 식품관으로 이어지는 입구, 두 개의 무빙워크, 21개 가공식품 진열대, 냉장 진열대, 과일 매대, 계산대와 각 코너의 좌표·치수는 게임 내 이동을 위해 구성한 근사 배치다. 공식 평면도나 매장 전체를 1:1로 복제한 자료가 아니다. 다른 지점의 사진을 노은점 사진으로 소개하지 않는다.

1층 입구 → 내려가는 무빙워크 → B1 식품관 → 각 코너 조사 → 올라가는 무빙워크 → 실외 복귀가 가능하다. 진열 상품은 개별 입체 물체 6,098개로 구성하며 재사용 가능한 묶음으로 렌더링한다. 상품 조사 메시지는 구현했으며 신규 식량 인벤토리 증감은 이번 변경에 포함하지 않았다.

## 제작한 로컬 이미지

도구: 내장 `image_gen.imagegen`. 두 생성 원본을 변경 없이 프로젝트에 복사했다. 실제 상품 브랜드나 매장 촬영 이미지를 사용하지 않고 가상의 상품 포장 재질을 제작했다. `mart-photo-bundle.js`에 데이터 URI로 포함해 외부 서버 없이 실행된다.

### grocery-atlas-v1.png — 최종 프롬프트

Use case: product-mockup. Asset type: a 4 by 4 texture atlas of sixteen Korean grocery PACKAGE FRONT LABELS for real-time 3D supermarket shelf products. Generate one perfectly square image, exactly sixteen equally sized square cells in a precise 4-column 4-row grid, NO margins between cells, NO exterior border. Each cell fills its entire area edge to edge with the PRINTED flat front design of one food package, straight-on orthographic view. These are raw package label textures, not photos of a package sitting in a scene. NO shelves, no scenery, no drop shadows, no rendered box sides, no people, no hands. Detailed photographic food serving images printed on realistic slightly crinkled foil or cardboard packaging, small typography and realistic nutritional microcopy. Consistent Korean supermarket look, restrained commercial colors. Row1 red instant noodle multipack front, orange cup noodles label, blue drinking water label, dark green canned tuna label. Row2 cream rice bag design, blue milk carton face, orange juice carton face, olive canned beans face. Row3 red tomato sauce label, beige crackers box face, dark brown chocolate biscuit box face, burgundy coffee bag face. Row4 beige cereal box face, blue tissue box face, light green hand soap label, deep blue alkaline battery blister package face. Generic fictional package brands, no actual brand logos, no prices or sale stickers. Clear category cues, natural subtle printed gloss highlights only, readable large Korean category words where possible, no perspective. Precise equal 4x4 grid is crucial because each cell will be sampled separately on individual 3D objects.

### mart-floor-v1.png — 최종 프롬프트

Use case: photorealistic-natural. Asset type: seamless physically based albedo texture for a Korean large supermarket floor. A single square flat orthographic overhead photograph of four large ivory pale warm grey polished porcelain floor tiles in a 2 by 2 grid. Actual covered area 2.4 by 2.4 meters, each tile 1.2m square. Subtle fine cloudy mineral texture, tiny realistic scuff marks and lightly used satin-polished surface, very thin cool gray grout lines 2mm wide. Restrained very low contrast, almost uniform warm off white. Even diffuse light, absolutely no baked light reflections, no ceiling reflected in it, no shadows, no perspective, no text, no objects, no bevel shadows, no decorative pattern, no large marble veins. Seamless tiling opposite edges. This should look like a real supermarket porcelain floor material, not a stylized illustration.

원본 보관 폴더: `C:\Users\lyj\.codex\generated_images\01a1677c-1865-7710-ac26-8496f802330f`.

- 상품: `exec-5a6b865d-c7cd-4db7-82c8-a779b65de0b0.png`
- 타일: `exec-59fc5642-e176-4de1-96c7-d4c65d1f5ee8.png`

## 검증 범위

`mart-interior-test.cjs`는 다섯 코너까지의 보행 경로, 진열대 충돌, 무빙워크의 연속적인 높이 변화, 지하로 열린 공간, 입출입과 재시작을 검증한다. `smoke-test.js`는 실제 키 입력으로 새 시작 버튼, 지하 이동, 실내 지도, 복귀와 출구를 검증한다. `qa/material-*.png`는 배치·재질 보조 검토용 CPU 렌더이며 실제 WebGL 게임 화면과 조명 품질을 보증하는 스크린샷이 아니다.
