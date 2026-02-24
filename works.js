const works = [
    // LANDSCAPE (16:9 가로형)
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

    // PORTRAIT (9:16 세로형)
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
    {
        id: 14,
        title: "Experimental Motion",
        client: "TikTok Creative",
        category: "BRAND",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.tiktok.com/embed/v2/7600738854332665109",
        description: "A fast-paced creative edit specifically designed for TikTok's unique visual language."
    },
    {
        id: 15,
        title: "Behind the Scenes",
        client: "Threads Post",
        category: "OTHERS",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.threads.net/post/DUCiAXOAWxT/embed",
        description: "Capturing the raw process and intimate moments behind the production, shared on Threads."
    },
    {
        id: 16,
        title: "Urban Expression",
        client: "Instagram Reel",
        category: "FASHION",
        orientation: "portrait",
        thumbnail: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=450&h=800",
        videoUrl: "https://www.instagram.com/reel/DTfRhxVE6f9/embed",
        description: "Short-form cinematic expression exploring urban style through Instagram Reels."
    },
];

export default works;
