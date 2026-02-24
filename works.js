const works = [
    // LANDSCAPE (16:9 가로형)
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
    {
        id: 1,
        title: "Brand Commercial",
        client: "Luxury Auto",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1492691523567-61125645e34b?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "A cinematic commercial highlighting the elegance and power of the new luxury sedan."
    },
    {
        id: 2,
        title: "MV: Midnight City",
        client: "Synth Echo",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1550745619-7214ad4a0913?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "An neon-lit exploration of the urban landscape through sound and light."
    },
    {
        id: 3,
        title: "Nature Documentary",
        client: "Green Planet",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Capturing the silent majesty of the mountain ranges."
    },
    {
        id: 4,
        title: "Corporate Vision",
        client: "Tech Corp",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Defining the future of technology through powerful imagery."
    },
    {
        id: 7,
        title: "Architecture Study",
        client: "Design Studio",
        category: "OTHERS",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "A formal study of geometry and shadow in modern architecture."
    },
    {
        id: 8,
        title: "City Pulse",
        client: "Seoul Studio",
        category: "DOCUMENTARY",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "The relentless rhythm of the city captured frame by frame."
    },
    {
        id: 9,
        title: "Season Campaign",
        client: "Outdoor Brand",
        category: "BRAND",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Seasonal storytelling rooted in nature and movement."
    },
    {
        id: 10,
        title: "Live Concert Film",
        client: "Artist Collective",
        category: "MUSIC_VIDEO",
        orientation: "landscape",
        thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Raw energy and light from a sold-out live performance."
    },

    // PORTRAIT (9:16 세로형) - 신규 영상을 최상단으로 이동
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
    {
        id: 5,
        title: "Fashion Film: Noir",
        client: "Vogue Style",
        category: "FASHION",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "High-contrast visuals showcasing the latest noir-inspired collection."
    },
    {
        id: 6,
        title: "Street Portrait",
        client: "W Magazine",
        category: "FASHION",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Intimate portraits shot in the quiet corners of the city."
    },
    {
        id: 11,
        title: "Dance Reel",
        client: "Studio K",
        category: "OTHERS",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Vertical storytelling through body and motion."
    },
    {
        id: 12,
        title: "Vertical Campaign",
        client: "Beauty Label",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Made for mobile-first audiences with cinematic depth."
    },
    {
        id: 13,
        title: "Social Reel",
        client: "IG Brand",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1522386167-97116F33e21F?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Short-form storytelling optimized for social feed."
    },
];

export default works;
