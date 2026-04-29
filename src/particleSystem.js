// 粒子系统

import { particleColors, particleCounts } from './config.js';

class Particle {
    constructor(x, y, targetX, targetY, color, type) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.type = type;
        this.alpha = 1;
        this.size = Math.random() * 8 + 4;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.speed = Math.random() * 3 + 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.gravity = 0.05;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.1 + 0.05;
        this.trail = [];
        this.maxTrailLength = 5;
    }

    update() {
        this.wobble += this.wobbleSpeed;
        this.vy += this.gravity;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
            this.vx += (dx / dist) * 0.1;
            this.vy += (dy / dist) * 0.1;
        }
        
        this.x += this.vx + Math.sin(this.wobble) * 0.5;
        this.y += this.vy;
        
        this.trail.unshift({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        this.alpha -= 0.01;
        this.size *= 0.995;
        
        return this.alpha > 0 && this.size > 0.5;
    }

    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const trailAlpha = t.alpha * (1 - i / this.trail.length);
            const trailSize = this.size * (1 - i / this.trail.length * 0.5);
            
            ctx.beginPath();
            ctx.arc(t.x, t.y, trailSize, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace('1)', `${trailAlpha})`);
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('1)', `${this.alpha})`);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
        this.screenShakeX = 0;
        this.screenShakeY = 0;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles(startX, startY, targetX, targetY, cardType) {
        const colors = particleColors[cardType] || particleColors['初始'];
        const particleCount = particleCounts[cardType] || particleCounts['初始'];
        
        for (let i = 0; i < particleCount; i++) {
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = (Math.random() - 0.5) * 50;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(
                startX + offsetX,
                startY + offsetY,
                targetX,
                targetY,
                color,
                cardType
            ));
        }
    }

    createEnemyAttackParticles(startX, startY, targetX, targetY) {
        const colors = particleColors['enemy'];
        const particleCount = particleCounts['enemy'];
        
        for (let i = 0; i < particleCount; i++) {
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 60;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(
                startX + offsetX,
                startY + offsetY,
                targetX,
                targetY,
                color,
                'enemy'
            ));
        }
    }

    shakeScreen(intensity, duration) {
        const start = Date.now();
        const shake = () => {
            const elapsed = Date.now() - start;
            if (elapsed < duration) {
                const progress = 1 - elapsed / duration;
                this.screenShakeX = (Math.random() - 0.5) * intensity * progress;
                this.screenShakeY = (Math.random() - 0.5) * intensity * progress;
                requestAnimationFrame(shake);
            } else {
                this.screenShakeX = 0;
                this.screenShakeY = 0;
            }
        };
        shake();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.screenShakeX !== 0 || this.screenShakeY !== 0) {
            this.ctx.save();
            this.ctx.translate(this.screenShakeX, this.screenShakeY);
        }
        
        this.particles = this.particles.filter(particle => {
            if (particle.update()) {
                particle.draw(this.ctx);
                return true;
            }
            return false;
        });
        
        if (this.screenShakeX !== 0 || this.screenShakeY !== 0) {
            this.ctx.restore();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

export default ParticleSystem;