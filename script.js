const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game State
let score = 0;
let isSwinging = true;
let gravity = 0.25;
let player = { x: 0, y: 0, vx: 0, vy: 0, radius: 10 };
let pivot = { x: 0, y: 0, angle: 0, length: 150, speed: 0.05 };
let nextPivot = { x: 0, y: 0, radius: 30 };

// 1. Initialize Game
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    resetPivots();
    animate();
}

function resetPivots() {
    pivot.x = canvas.width / 2;
    pivot.y = player.y - pivot.length;
    // Set the "target" hook higher up
    nextPivot.x = Math.random() * (canvas.width - 200) + 100;
    nextPivot.y = pivot.y - 200;
    // Difficulty: Shrink the target as score increases
    nextPivot.radius = Math.max(10, 35 - (score * 2));
}

// 2. The Physics Engine
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isSwinging) {
        // Calculate Pendulum Motion
        pivot.angle = Math.sin(Date.now() * pivot.speed * 0.05) * (Math.PI / 3);
        player.x = pivot.x + Math.sin(pivot.angle) * pivot.length;
        player.y = pivot.y + Math.cos(pivot.angle) * pivot.length;
        
        // Draw Rope
        ctx.beginPath();
        ctx.moveTo(pivot.x, pivot.y);
        ctx.lineTo(player.x, player.y);
        ctx.strokeStyle = "white";
        ctx.stroke();
    } else {
        // Free Fall Physics
        player.vy += gravity;
        player.x += player.vx;
        player.y += player.vy;

        // Check for "Catch"
        let dist = Math.hypot(player.x - nextPivot.x, player.y - nextPivot.y);
        if (dist < nextPivot.radius) {
            score++;
            scoreElement.innerText = score;
            isSwinging = true;
            pivot.x = nextPivot.x;
            pivot.y = nextPivot.y;
            // Make the next hook even higher
            nextPivot.y -= 200;
            nextPivot.x = Math.random() * (canvas.width - 200) + 100;
        }

        // Game Over Condition (Falling off screen)
        if (player.y > canvas.height) {
            alert("Game Over! Score: " + score);
            location.reload(); 
        }
    }

    // Draw Hooks & Player
    drawCircle(pivot.x, pivot.y, 5, "gray"); // Current Hook
    drawCircle(nextPivot.x, nextPivot.y, nextPivot.radius, "red"); // Target Hook
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

// 3. Controls
window.addEventListener('mousedown', () => {
    if (isSwinging) {
        // Calculate release velocity based on angle
        let releaseSpeed = 12; 
        player.vx = Math.cos(pivot.angle) * releaseSpeed * (pivot.angle > 0 ? 1 : -1);
        player.vy = -Math.abs(Math.sin(pivot.angle) * releaseSpeed);
        isSwinging = false;
    }
});

init();
