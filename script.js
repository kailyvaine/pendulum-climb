const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game State
let score = 0;
let isSwinging = true;
let gameStarted = false; // NEW: Prevents the game from running until you tap
let gravity = 0.35; 
let player = { x: 0, y: 0, vx: 0, vy: 0, radius: 10 };
let pivot = { x: 0, y: 0, angle: 0, length: 160, speed: 0.003 };
let nextPivot = { x: 0, y: 0, radius: 35 };

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Safety start position
    player.x = canvas.width / 2;
    player.y = canvas.height / 2; 
    
    resetPivots();
    animate();
}

function resetPivots() {
    pivot.x = player.x;
    pivot.y = player.y - pivot.length;
    let margin = canvas.width * 0.2;
    nextPivot.x = margin + Math.random() * (canvas.width - (margin * 2));
    nextPivot.y = pivot.y - 250; 
    nextPivot.radius = Math.max(12, 35 - (score * 1.5));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If game hasn't started, show a "Tap to Start" message
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("TAP TO START CLIMBING", canvas.width / 2, canvas.height / 2 + 50);
        drawCircle(player.x, player.y, player.radius, "#00ffcc");
        requestAnimationFrame(animate);
        return;
    }

    if (isSwinging) {
        pivot.angle = Math.sin(Date.now() * pivot.speed) * (Math.PI / 2.5);
        player.x = pivot.x + Math.sin(pivot.angle) * pivot.length;
        player.y = pivot.y + Math.cos(pivot.angle) * pivot.length;
        
        ctx.beginPath();
        ctx.moveTo(pivot.x, pivot.y);
        ctx.lineTo(player.x, player.y);
        ctx.strokeStyle = "white";
        ctx.stroke();
    } else {
        player.vy += gravity;
        player.x += player.vx;
        player.y += player.vy;

        let dist = Math.hypot(player.x - nextPivot.x, player.y - nextPivot.y);
        if (dist < nextPivot.radius + player.radius) {
            score++;
            scoreElement.innerText = score;
            isSwinging = true;
            pivot.x = nextPivot.x;
            pivot.y = nextPivot.y;
            let margin = canvas.width * 0.2;
            nextPivot.x = margin + Math.random() * (canvas.width - (margin * 2));
            nextPivot.y -= 250;
        }

        // Game Over Check
        if (player.y > canvas.height + 100) {
            gameStarted = false; // Reset start state
            alert("Game Over! Height: " + score + "m");
            location.reload(); 
            return;
        }
    }

    // Camera follow
    if (player.y < canvas.height * 0.4) {
        let diff = (canvas.height * 0.4) - player.y;
        player.y += diff;
        pivot.y += diff;
        nextPivot.y += diff;
    }

    drawCircle(pivot.x, pivot.y, 6, "#888");
    drawCircle(nextPivot.x, nextPivot.y, nextPivot.radius, "#ff4444");
    drawCircle(player.x, player.y, player.radius, "#00ffcc");

    requestAnimationFrame(animate);
}

function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function handleAction() {
    if (!gameStarted) {
        gameStarted = true; // First tap starts the game
        return;
    }
    
    if (isSwinging) {
        let power = 16; 
        player.vx = Math.sin(pivot.angle) * power * 1.5;
        player.vy = -Math.abs(Math.cos(pivot.angle) * power) - 5;
        isSwinging = false;
    }
}

window.addEventListener('mousedown', handleAction);
window.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    handleAction();
}, { passive: false });

init();
