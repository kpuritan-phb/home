const works = [
    // LANDSCAPE (16:9 가로형)

    {
        id: 36,
        title: "대전 최대 규모 스포츠센터, CNU 스포렉스 센터",
        client: "충남대학교",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/s4cqLJhCgE8/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/s4cqLJhCgE8",
        description: "대전 최대 규모를 자랑하는 CNU 스포렉스 센터의 시설과 활기를 소개하는 영상입니다."
    },
    {
        id: 37,
        title: "피부 RETURN 시리즈 콜라젠 리프팅 입점",
        client: "YouTube",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/QbwHp3gcZDE/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/QbwHp3gcZDE",
        description: "콜라젠 리프팅 입점 소식과 제품의 매력을 담은 브랜드 영상입니다."
    },
    {
        id: 27,
        title: "영하의 날씨에 버려진 누더기 실버푸들 미용했어요🩷",
        client: "YouTube",
        category: "OTHERS",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/nyiKexi9NSw/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/nyiKexi9NSw",
        description: "추운 날씨에 구조된 실버푸들의 미용 과정 영상입니다."
    },
    {
        id: 28,
        title: "25년 경력 뷰티팟 TV 송원장의 브랜드 '퀸즈본가'",
        client: "퀸즈본가",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/atuODTDp0Qk/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/atuODTDp0Qk",
        description: "뷰티 브랜드 퀸즈본가 소개 영상입니다."
    },
    {
        id: 29,
        title: "소향 - 나 언젠가 떠날거야 (디즈니 모아나 커버)",
        client: "진제이",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/MEOo7CNdcXs/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/MEOo7CNdcXs",
        description: "디즈니 모아나 OST '나 언젠가 떠날거야' 커버 영상입니다."
    },
    {
        id: 30,
        title: "WOO(성현우) - 없었던 것처럼 LIVE CLIP",
        client: "WOO(성현우)",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/42BldXKgIao/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/42BldXKgIao",
        description: "WOO(성현우)의 '없었던 것처럼' 라이브 클립입니다."
    },
    {
        id: 31,
        title: "WOO(성현우) - DiNA LIVE CLIP",
        client: "WOO(성현우)",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/-XrWUXBvyMY/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/-XrWUXBvyMY",
        description: "WOO(성현우)의 'DiNA' (원곡.Yuuri/優里) 라이브 클립입니다."
    },
    {
        id: 32,
        title: "덥덥이(dubdubee) - Again and Again(Official MV)",
        client: "덥덥이",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/XHGNBDjRgdQ/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/XHGNBDjRgdQ",
        description: "덥덥이의 'Again and Again' 공식 뮤직비디오입니다."
    },
    {
        id: 33,
        title: "랩레슨 싸이퍼 촬영 비하인드",
        client: "326-2KIDS",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/hqh2-3iBWM4/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/hqh2-3iBWM4",
        description: "랩레슨 싸이퍼 촬영 비하인드 영상입니다."
    },
    {
        id: 34,
        title: "흉터치료 새살침, 치료 방법과 접근법",
        client: "흉지사",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/GCJ6Qkosgaw/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/GCJ6Qkosgaw",
        description: "피부 유형에 따른 흉터치료 새살침의 접근법을 소개합니다."
    },
    {
        id: 20,
        title: "집 [대전CKL 2차 유튜브 콘테스트 공모작]",
        client: "YouTube",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/3umEWnQN_oM/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/3umEWnQN_oM",
        description: "대전CKL 2차 유튜브 콘테스트 공모작 '집' 영상입니다."
    },
    {
        id: 21,
        title: "인간극장 : 존재의 이유",
        client: "KOHI",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/gv_7288qSng/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/gv_7288qSng",
        description: "2023년 KOHI 사회복무요원 SNS 영상 공모전 대상 수상작입니다."
    },
    {
        id: 22,
        title: "Mirabelle Korea 2025 Brand Film",
        client: "Mirabelle Korea",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/tjn6_Tp6bGo/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/tjn6_Tp6bGo",
        description: "Mirabelle Korea 2025 브랜드 필름입니다."
    },
    {
        id: 23,
        title: "피부 고민 하던 지하니, 결국 사버린 찐템은? 🛍",
        client: "YouTube",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/X8bjIyiJeYI/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/X8bjIyiJeYI",
        description: "피부 고민 타파를 위한 찐템 소개 영상입니다."
    },
    {
        id: 24,
        title: "너는 누구이고 싶어? BE YOU, MELLBEU",
        client: "MELLBEU",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/yEhwdmJ5xTg/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/yEhwdmJ5xTg",
        description: "MELLBEU 브랜드 영상 'BE YOU' 입니다."
    },
    {
        id: 25,
        title: "수은등-김연자 l COVER BY 김다현",
        client: "김다현",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/uCIRKVpoXb4/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/uCIRKVpoXb4",
        description: "김다현의 '수은등' 커버 영상입니다."
    },
    {
        id: 26,
        title: "트롯요정 김다현, 과연 몇 명이나 알아볼까? 🤔",
        client: "김다현",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://img.youtube.com/vi/xvwhyCuUO-Q/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/xvwhyCuUO-Q",
        description: "관악중부시장에서 진행된 떴다떴다현 에피소드 1입니다."
    },


    // PORTRAIT (9:16 세로형)
    {
        id: 38,
        title: "에어리어(Airear): 브랜드 스토리",
        client: "에어리어",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.instagram.com/reel/DRlgi0ZE5xy/embed",
        description: "누구나 따뜻하게 씻을 수 있게 하자. 에어리어 창업자의 진심이 담긴 브랜드 스토리와 A3 욕실 온풍기 소개 영상입니다."
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
        thumbnail: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.instagram.com/reel/DTU3zQAkV14/embed",
        description: "광주 프리미엄 풀빌라 '메종드오누'. 청결하고 프라이빗한 파티풀 시설의 매력을 담은 감성 영상입니다."
    },
    {
        id: 18,
        title: "Obang Heater: Originality",
        client: "오방난로",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1591197172071-36acd2517335?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.instagram.com/reel/DRwggvgk791/embed",
        description: "기술력에 대한 브랜드의 자신감. 세계 최초 상단 하이라이트 가열 구조를 가진 오방난로의 오리지널리티를 강조합니다."
    },
    {
        id: 19,
        title: "Mirabelle Korea: K-Solutions",
        client: "Mirabelle Korea",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.instagram.com/reel/DMdGy21PiTy/embed",
        description: "인도를 위한 K-솔루션. 다양한 기후와 피부 타입에 맞춘 현지화된 K-뷰티 스킨케어를 소개합니다."
    },

];

export default works;
