import confetti from 'canvas-confetti';

export const triggerCelebration = (preset) => {
    if (preset === 'fireworks') {
        const duration = 3 * 1000; // Fire for 3 seconds
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            // Shoot fireworks from the bottom left and right
            confetti({ ...defaults, particleCount, origin: { x: Math.random() * (0.3 - 0.1) + 0.1, y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: Math.random() * (0.9 - 0.7) + 0.7, y: Math.random() - 0.2 } });
        }, 250);
    } else if (preset === 'stars') {
        // Exploding star bursts
        const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
        const shoot = () => {
            confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
            confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
        };
        setTimeout(shoot, 0);
        setTimeout(shoot, 100);
        setTimeout(shoot, 200);
    } else if (preset === 'emoji') {
        // Sparkles and emojis!
        const scalar = 2;
        const sparkles = confetti.shapeFromText({ text: '✨', scalar });
        confetti({
            particleCount: 150,
            scalar,
            spread: 360,
            angle: 270,
            startVelocity: 15,
            origin: { y: -0.1 },
            shapes: [sparkles]
        });
    } else {
        // Standard 'confetti' rain falling from the top
        confetti({ particleCount: 300, spread: 360, angle: 270, startVelocity: 15, origin: { y: -0.1 } });
    }
};
