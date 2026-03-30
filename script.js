const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game State
let score = 0;
let isSwinging = true;
let gravity = 0.35; 
let player = { x: 0, y: 0, vx: 0, vy: 0, radius: 10 };
let pivot = { x: 0, y: 0, angle: 0, length: 160, speed: 0.003 };
let nextPivot = { x: 0, y: 0, radius: 35 };

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Start player in a safe zone (middle of screen)
    player.x = canvas.width / 2;
    player.y = canvas.height / 2; 
    
    resetPivots();
    animate();
}

function resetPivots() {
    pivot.x = player.x;
    pivot.y = player.y - pivot.length;
    
    // Keep next hook within reachable horizontal bounds
    let margin = canvas.width * 0.2;
    nextPivot.x = margin + Math.random() * (canvas.width - (margin * 2));
    nextPivot.y = pivot.y - 250; 
    
    // Difficulty: Target shrinks as you climb
    nextPivot.radius = Math.max(12, 35 - (score * 1.5));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isSwinging) {
        // Pendulum Math
        pivot.angle = Math.sin(Date.now() * pivot.speed) * (Math.PI / 2.5);
        player.x = pivot.x + Math.sin(pivot.angle) * pivot.length;
        player.y = pivot.y + Math.cos(pivot.angle) * pivot.length;
        
        // Draw Rope
        ctx.beginPath();
        ctx.moveTo(pivot.x, pivot.y);
        ctx.lineTo(player.x, player.y);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        // Falling Physics
        player.vy += gravity;
        player.x += player.vx;
        player.y += player.vy;

        // Check for "Catch"
        let dist = Math.hypot(player.x - nextPivot.x, player.y - nextPivot.y);
        if (dist < nextPivot.radius + player.radius) {
            score++;
            scoreElement.innerText = score;
            isSwinging = true;
            
            // Snap to new hook
            pivot.x = nextPivot.x;
            pivot.y = nextPivot.y;
            
            // Generate next target even higher
            let margin = canvas.width * 0.2;
            nextPivot.x = margin + Math.random() * (canvas.width - (margin * 2));
            nextPivot.y -= 250;
        }

        // Game Over: Only if you fall way past the bottom
        if (player.y > canvas.height + 100) {
            alert("Game Over! Height reached: " + score + "m");
            location.reload(); 
            return;
        }
    }

    // Camera Effect: If player gets too high, slide everything down
    if (player.y < canvas.height * 0.4) {
        let diff = (canvas.height * 0.4) - player.y;
        player.y += diff;
        pivot.y += diff;
        nextPivot.y += diff;
    }

    // Draw Objects
    drawCircle(pivot.x, pivot.y, 6, "#888"); // Current Hook
    drawCircle(nextPivot.x, nextPivot.y, nextPivot.radius, "#ff4444"); // Target Hook
    drawCircle(player.x, player.y, player.radius, "#00ffcc"); // Player

    requestAnimationFrame(animate);
}

function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// Controls: Works for Click and Touch
function handleAction() {
    if (isSwinging) {
        let power = 12;
        // Launch based on swing angle
        player.vx = Math.sin(pivot.angle) * power * 1.5;
        player.vy = -Math.cos(pivot.angle) * power;
        isSwinging = false;
    }
}

window.addEventListener('mousedown', handleAction);
window.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents flickering/scrolling on mobile
    handleAction();
}, { passive: false });

// Resize handling
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

init();
