const works = [
    // LANDSCAPE (16:9 가로형)
    {
        id: 44,
        title: "Mercedes-AMG G 63 오너의 남다른 일상 ㅣ 한성 SEE. Vol.2",
        client: "한성자동차",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/P0brARRRS_c/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/P0brARRRS_c",
        description: "Mercedes-AMG G 63 오너의 남다른 일상을 담은 한성 SEE. Vol.2 영상입니다."
    },
    {
        id: 45,
        title: "📢숨겨진 최고의 인증 중고차 보물을 찾아라! 한성트레저 두번째 이야기💎",
        client: "한성자동차",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/ZeiWlxHSKWY/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/ZeiWlxHSKWY",
        description: "최고의 인증 중고차를 찾는 한성트레저 두 번째 이야기 영상입니다."
    },
    {
        id: 43,
        title: "[안전로드 퀴즈쇼] 드디어 등장한 현대모비스 아이돌?✨ 우리 회사 자랑 좀 들어보세요😎 | 현대모비스 본사",
        client: "현대모비스",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/PofMcsINkHc/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/PofMcsINkHc",
        description: "현대모비스 본사에서 진행된 안전로드 퀴즈쇼 영상입니다."
    },
    {
        id: 22,
        title: "Mirabelle Korea 2025 Brand Film",
        client: "Mirabelle Korea",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/tjn6_Tp6bGo/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/tjn6_Tp6bGo",
        description: "Mirabelle Korea 2025 브랜드 필름입니다."
    },
    {
        id: 39,
        title: "지하니_수분라인-1",
        client: "Vimeo",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://i.vimeocdn.com/video/2125713132-e9aaaf337903130fc6b3ca6edc27dfb70ee5114aacd249086143e6b93819127b-d_1280?region=us",
        videoUrl: "https://player.vimeo.com/video/1167646145",
        description: "지하니 피부 수분라인 소개 영상입니다."
    },
    {
        id: 40,
        title: "온누리상품권이별-1",
        client: "Vimeo",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://i.vimeocdn.com/video/2125713291-2265b8cfd78d386b9d6236b5520ba24709e88bf642c276fa490cbe169ef82dbc-d_1280?region=us",
        videoUrl: "https://player.vimeo.com/video/1167646253",
        description: "온누리상품권 이별 단편 영상입니다."
    },
    {
        id: 41,
        title: "온누리상품권500원이_없어서-1",
        client: "Vimeo",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://i.vimeocdn.com/video/2125713326-a54dabd4eda07d326a4e72c1c290f9258f4580b5bedd933953fd0b0d0bda2038-d_1280?region=us",
        videoUrl: "https://player.vimeo.com/video/1167646281",
        description: "온누리상품권 500원이 없어서 생긴 에피소드 영상입니다."
    },
    {
        id: 42,
        title: "김다현 1390만 유튜버 대선배 햄지님과 먹방 했습니다😋🍴 #김다현 #김다현tv",
        client: "김다현",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/OaGTS4ybsYQ/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/OaGTS4ybsYQ",
        description: "1390만 유튜버 햄지님과의 먹방 콜라보레이션 영상입니다."
    },
    {
        id: 36,
        title: "대전 최대 규모 스포츠센터, CNU 스포렉스 센터",
        client: "충남대학교",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/s4cqLJhCgE8/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/s4cqLJhCgE8",
        description: "대전 최대 규모를 자랑하는 CNU 스포렉스 센터의 시설과 활기를 소개하는 영상입니다."
    },
    {
        id: 37,
        title: "피부 RETURN 시리즈 콜라젠 리프팅 입점",
        client: "YouTube",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/QbwHp3gcZDE/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/QbwHp3gcZDE",
        description: "콜라젠 리프팅 입점 소식과 제품의 매력을 담은 브랜드 영상입니다."
    },
    {
        id: 27,
        title: "영하의 날씨에 버려진 누더기 실버푸들 미용했어요🩷",
        client: "YouTube",
        category: "OTHERS",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/nyiKexi9NSw/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/nyiKexi9NSw",
        description: "추운 날씨에 구조된 실버푸들의 미용 과정 영상입니다."
    },
    {
        id: 28,
        title: "25년 경력 뷰티팟 TV 송원장의 브랜드 '퀸즈본가'",
        client: "퀸즈본가",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/atuODTDp0Qk/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/atuODTDp0Qk",
        description: "뷰티 브랜드 퀸즈본가 소개 영상입니다."
    },
    {
        id: 29,
        title: "소향 - 나 언젠가 떠날거야 (디즈니 모아나 커버)",
        client: "진제이",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/MEOo7CNdcXs/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/MEOo7CNdcXs",
        description: "디즈니 모아나 OST '나 언젠가 떠날거야' 커버 영상입니다."
    },
    {
        id: 30,
        title: "WOO(성현우) - 없었던 것처럼 LIVE CLIP",
        client: "WOO(성현우)",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/42BldXKgIao/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/42BldXKgIao",
        description: "WOO(성현우)의 '없었던 것처럼' 라이브 클립입니다."
    },
    {
        id: 31,
        title: "WOO(성현우) - DiNA LIVE CLIP",
        client: "WOO(성현우)",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/-XrWUXBvyMY/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/-XrWUXBvyMY",
        description: "WOO(성현우)의 'DiNA' (원곡.Yuuri/優里) 라이브 클립입니다."
    },
    {
        id: 32,
        title: "덥덥이(dubdubee) - Again and Again(Official MV)",
        client: "덥덥이",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/XHGNBDjRgdQ/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/XHGNBDjRgdQ",
        description: "덥덥이의 'Again and Again' 공식 뮤직비디오입니다."
    },
    {
        id: 33,
        title: "랩레슨 싸이퍼 촬영 비하인드",
        client: "326-2KIDS",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/hqh2-3iBWM4/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/hqh2-3iBWM4",
        description: "랩레슨 싸이퍼 촬영 비하인드 영상입니다."
    },
    {
        id: 34,
        title: "흉터치료 새살침, 치료 방법과 접근법",
        client: "흉지사",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/GCJ6Qkosgaw/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/GCJ6Qkosgaw",
        description: "피부 유형에 따른 흉터치료 새살침의 접근법을 소개합니다."
    },
    {
        id: 20,
        title: "집 [대전CKL 2차 유튜브 콘테스트 공모작]",
        client: "YouTube",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/3umEWnQN_oM/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/3umEWnQN_oM",
        description: "대전CKL 2차 유튜브 콘테스트 공모작 '집' 영상입니다."
    },
    {
        id: 21,
        title: "인간극장 : 존재의 이유",
        client: "KOHI",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/gv_7288qSng/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/gv_7288qSng",
        description: "2023년 KOHI 사회복무요원 SNS 영상 공모전 대상 수상작입니다."
    },
    {
        id: 23,
        title: "피부 고민 하던 지하니, 결국 사버린 찐템은? 🛍",
        client: "YouTube",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/X8bjIyiJeYI/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/X8bjIyiJeYI",
        description: "피부 고민 타파를 위한 찐템 소개 영상입니다."
    },
    {
        id: 24,
        title: "너는 누구이고 싶어? BE YOU, MELLBEU",
        client: "MELLBEU",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/yEhwdmJ5xTg/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/yEhwdmJ5xTg",
        description: "MELLBEU 브랜드 영상 'BE YOU' 입니다."
    },
    {
        id: 25,
        title: "수은등-김연자 l COVER BY 김다현",
        client: "김다현",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/uCIRKVpoXb4/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/uCIRKVpoXb4",
        description: "김다현의 '수은등' 커버 영상입니다."
    },
    {
        id: 26,
        title: "트롯요정 김다현, 과연 몇 명이나 알아볼까? 🤔",
        client: "김다현",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/xvwhyCuUO-Q/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/xvwhyCuUO-Q",
        description: "관악중부시장에서 진행된 떴다떴다현 에피소드 1입니다."
    },


    // PORTRAIT (9:16 세로형) - 신규 영상을 최상단으로 이동
    {
        id: 19,
        title: "Mirabelle Korea: K-Solutions",
        client: "Mirabelle Korea",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "images/works/thumb_mirabelle.jpg",
        videoUrl: "https://www.instagram.com/reel/DMdGy21PiTy/embed",
        description: "인도를 위한 K-솔루션. 다양한 기후와 피부 타입에 맞춘 현지화된 K-뷰티 스킨케어를 소개합니다."
    },
    {
        id: 14,
        title: "TikTok: Creative Edit",
        client: "@1ndian2wins",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "images/works/thumb_tiktok.jpg",
        videoUrl: "https://www.tiktok.com/embed/v2/7600738854332665109",
        description: "Fast-paced vertical edit specifically designed for TikTok's visual language."
    },
    {
        id: 15,
        title: "Threads: Storytelling",
        client: "@1ndian2wins",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "images/works/thumb_threads.jpg",
        videoUrl: "https://www.threads.net/@1ndian2wins/post/DUCiAXOAWxT/embed",
        description: "Engaging and raw storytelling produced for the Threads platform."
    },
    {
        id: 16,
        title: "Instagram: Cinematic Reel",
        client: "@1ndian2wins",
        category: "FASHION",
        orientation: "portrait",
        thumbnail: "images/works/thumb_instagram.jpg",
        videoUrl: "https://www.instagram.com/reel/DTfRhxVE6f9/embed",
        description: "A premium cinematic expression exploring style through Instagram Reels."
    },
    {
        id: 17,
        title: "Maison de Onu: Party Pool",
        client: "Maison de Onu",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "images/works/thumb_maison.jpg",
        videoUrl: "https://www.instagram.com/reel/DTU3zQAkV14/embed",
        description: "광주 프리미엄 풀빌라 '메종드오누'. 청결하고 프라이빗한 파티풀 시설의 매력을 담은 감성 영상입니다."
    },
    {
        id: 18,
        title: "Obang Heater: Originality",
        client: "오방난로",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "images/works/thumb_obang.jpg",
        videoUrl: "https://www.instagram.com/reel/DRwggvgk791/embed",
        description: "기술력에 대한 브랜드의 자신감. 세계 최초 상단 하이라이트 가열 구조를 가진 오방난로의 오리지널리티를 강조합니다."
    },

];

export default works;
