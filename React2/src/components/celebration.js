import confetti from 'canvas-confetti';

const showCustomVideo = (videoUrl) => {
    if (!videoUrl) return;
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.padding = '1rem';

    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.style.maxWidth = '100%';
    video.style.maxHeight = '100%';
    video.style.borderRadius = '1rem';
    video.style.boxShadow = '0 0 40px rgba(0,0,0,0.8)';

    overlay.appendChild(video);
    document.body.appendChild(overlay);

    const cleanup = () => {
        video.pause();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    overlay.addEventListener('click', cleanup);
    video.addEventListener('click', (event) => event.stopPropagation());
    video.addEventListener('ended', cleanup);
};

export const triggerCelebration = (preset, custom = {}) => {
    if (preset === 'custom' && custom.type === 'video' && custom.url) {
        showCustomVideo(custom.url);
        // Add a subtle confetti burst to accompany the video.
        const defaults = { spread: 120, ticks: 50, gravity: 0.5, startVelocity: 20, colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
        confetti({ ...defaults, particleCount: 50, origin: { x: 0.5, y: 0.1 } });
        return;
    }

    if (preset === 'fireworks') {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } });
        }, 250);
    } else if (preset === 'stars') {
        const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
        const shoot = () => {
            confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
            confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
        };
        setTimeout(shoot, 0);
        setTimeout(shoot, 100);
        setTimeout(shoot, 200);
    } else if (preset === 'emoji') {
        const emojiCharacters = ['✨', '🎉', '💫', '🎊', '🌧️'];
        const scalar = 2.2;
        const origins = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9];

        origins.forEach((x, index) => {
            const emoji = emojiCharacters[index % emojiCharacters.length];
            const shape = confetti.shapeFromText({ text: emoji, scalar });
            confetti({
                particleCount: 25,
                scalar,
                spread: 45,
                angle: 270,
                startVelocity: 20,
                gravity: 0.75,
                drift: 0.02,
                origin: { x, y: -0.1 },
                shapes: [shape]
            });
        });
    } else {
        const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
        const shoot = () => {
            confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['square'] });
            confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['square'] });
        };
        setTimeout(shoot, 0);
        setTimeout(shoot, 100);
        setTimeout(shoot, 200);
    }
};
