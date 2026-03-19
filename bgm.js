// --- BGM Player Logic (YouTube API) with Sync ---
let player;
const bgmVideoId = 'rr8AnfdhP7Q'; // Amazing Grace (Instrumental)
let isPlayerReady = false;

// Load YouTube API
if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('yt-player-container', {
        height: '0',
        width: '0',
        videoId: bgmVideoId,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': bgmVideoId,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    isPlayerReady = true;
    player.setVolume(50); // Set volume

    // Sync: Restore position from localStorage
    const savedTime = localStorage.getItem('bgm_time');
    if (savedTime) {
        player.seekTo(parseFloat(savedTime), true);
    }

    // Sync: Restore play/pause state
    const savedState = localStorage.getItem('bgm_state');
    if (savedState === 'playing') {
        player.playVideo();
    } else if (savedState === 'paused') {
        player.pauseVideo();
    } else {
        // Default: try to play
        player.playVideo();
    }

    // Start sync interval
    setInterval(() => {
        if (isPlayerReady && player && player.getPlayerState) {
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                localStorage.setItem('bgm_time', player.getCurrentTime());
                localStorage.setItem('bgm_state', 'playing');
            } else if (state === YT.PlayerState.PAUSED) {
                localStorage.setItem('bgm_state', 'paused');
            }
        }
    }, 1000);
}

function onPlayerStateChange(event) {
    const bgmPlayer = document.getElementById('bgm-player');
    const musicText = document.querySelector('.music-text');

    if (event.data === YT.PlayerState.PLAYING) {
        if (bgmPlayer) bgmPlayer.classList.add('playing');
        if (musicText) musicText.textContent = "Amazing Grace (Instrumental)";
        localStorage.setItem('bgm_state', 'playing');
    } else if (event.data === YT.PlayerState.PAUSED) {
        if (bgmPlayer) bgmPlayer.classList.remove('playing');
        if (musicText) musicText.textContent = "배경음악 On/Off";
        localStorage.setItem('bgm_state', 'paused');
    }
}

// BGM Toggle Function for Global Access
window.toggleBGM = (e) => {
    if (e) e.stopPropagation();
    if (!isPlayerReady || !player) {
        console.log("Audio player loading...");
        return;
    }
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Add specific styles if missing (shared CSS might not have everything)
    const style = document.createElement('style');
    style.textContent = `
        .bgm-player.playing .music-icon {
            animation: rotate 3s linear infinite;
            color: var(--secondary-color, #c99c5e);
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    const bgmBtn = document.getElementById('bgm-toggle-btn');
    if (bgmBtn) {
        bgmBtn.addEventListener('click', window.toggleBGM);
    }

    // Robust Auto-play Fallback (Unlock on any user interaction)
    const unlockAudio = () => {
        if (isPlayerReady && player) {
            const savedState = localStorage.getItem('bgm_state');
            if (savedState !== 'paused' && player.getPlayerState() !== YT.PlayerState.PLAYING) {
                player.playVideo();
            }
        }
        document.body.removeEventListener('click', unlockAudio);
        document.body.removeEventListener('touchstart', unlockAudio);
        document.body.removeEventListener('keydown', unlockAudio);
    };
    document.body.addEventListener('click', unlockAudio);
    document.body.addEventListener('touchstart', unlockAudio);
    document.body.addEventListener('keydown', unlockAudio);
});
