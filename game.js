// Black Cat Snake - Core Game Engine

// Grid configuration
const GRID_SIZE = 20;
const CELL_SIZE = 25; // 20 * 25 = 500px

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const confettiCanvas = document.getElementById('confetti-canvas');
const cCtx = confettiCanvas.getContext('2d');


// Game state variables
let currentLevel = 1;
let score = 0;
let bestScore = 0;
let lives = 3;
let catsEaten = 0;
const CATS_GOAL = 10;
let isProVersion = false;
let isGameOver = false;
let isLevelCleared = false;
let isPaused = false;
let gameTickInterval = null;
let currentSpeed = 150; // ms per tick

// Entities
let snake = []; // array of segments: { x, y }
let direction = { x: 1, y: 0 }; // moving right initially
let nextDirection = { x: 1, y: 0 };
let whiteCat = { x: 0, y: 0 };
let exitPortal = null; // { x, y, revealed }

// local storage keys
const BEST_SCORE_KEY = 'black_cat_snake_best';
const PRO_VERSION_KEY = 'black_cat_snake_pro';

// 20 Level Maps: 0 = empty, 1 = obstacle
const MAPS = [
    // Level 1: Outer border walls only
    createBorderMap(),
    // Level 2: Four corner columns
    createCornerColumnsMap(),
    // Level 3: Central cross block
    createCentralCrossMap(),
    // Level 4: Grid of separate pillars
    createPillarsGridMap(),
    // Level 5: Double horizontal barriers (End of Free Version)
    createDoubleBarriersMap(),
    
    // Level 6 (Premium): Spiral maze start
    createSpiralStartMap(),
    // Level 7 (Premium): Central square ring
    createSquareRingMap(),
    // Level 8 (Premium): Vertical bars
    createVerticalBarsMap(),
    // Level 9 (Premium): Four corner L-shapes
    createCornerLMap(),
    // Level 10 (Premium): Center diamond obstacle
    createCenterDiamondMap(),
    // Level 11 (Premium): Horizontal slots
    createHorizontalSlotsMap(),
    // Level 12 (Premium): Diagonal gates
    createDiagonalGatesMap(),
    // Level 13 (Premium): Double vertical sliders
    createVerticalSlidersMap(),
    // Level 14 (Premium): Center cross + corner dots
    createCrossDotMap(),
    // Level 15 (Premium): H-shape structure
    createHShapeMap(),
    // Level 16 (Premium): Two interlocking U-shapes
    createInterlockingUMap(),
    // Level 17 (Premium): Left/right staggered blocks
    createStaggeredMap(),
    // Level 18 (Premium): Tight columns maze
    createTightColumnsMap(),
    // Level 19 (Premium): Triple rings
    createTripleRingsMap(),
    // Level 20 (Premium): Ultimate Maze
    createUltimateMazeMap()
];

// Helper to initialize map with borders
function createBorderMap() {
    const grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            grid[r][c] = (r === 0 || r === GRID_SIZE - 1 || c === 0 || c === GRID_SIZE - 1) ? 1 : 0;
        }
    }
    return grid;
}

function createCornerColumnsMap() {
    const grid = createBorderMap();
    // Add 4 columns in corners
    for (let i = 4; i <= 6; i++) {
        grid[i][4] = 1; grid[i][15] = 1;
        grid[19 - i - 1][4] = 1; grid[19 - i - 1][15] = 1;
    }
    return grid;
}

function createCentralCrossMap() {
    const grid = createBorderMap();
    // Add cross in middle
    for (let i = 7; i <= 12; i++) {
        grid[9][i] = 1;
        grid[i][9] = 1;
    }
    return grid;
}

function createPillarsGridMap() {
    const grid = createBorderMap();
    // Pillars spaced out
    const rows = [5, 10, 14];
    const cols = [5, 10, 14];
    rows.forEach(r => {
        cols.forEach(c => {
            grid[r][c] = 1;
        });
    });
    return grid;
}

function createDoubleBarriersMap() {
    const grid = createBorderMap();
    // Double horizontal bars with gaps
    for (let i = 3; i <= 16; i++) {
        if (i !== 9 && i !== 10) {
            grid[6][i] = 1;
            grid[13][i] = 1;
        }
    }
    return grid;
}

function createSpiralStartMap() {
    const grid = createBorderMap();
    for (let i = 3; i <= 16; i++) {
        grid[4][i] = 1;
        if (i >= 8) grid[15][i] = 1;
    }
    for (let i = 5; i <= 15; i++) {
        grid[i][16] = 1;
        if (i <= 11) grid[i][3] = 1;
    }
    return grid;
}

function createSquareRingMap() {
    const grid = createBorderMap();
    // Square ring in center with four openings
    for (let i = 5; i <= 14; i++) {
        if (i !== 9 && i !== 10) {
            grid[5][i] = 1;
            grid[14][i] = 1;
            grid[i][5] = 1;
            grid[i][14] = 1;
        }
    }
    return grid;
}

function createVerticalBarsMap() {
    const grid = createBorderMap();
    // Three vertical walls with gaps
    for (let i = 3; i <= 16; i++) {
        if (i !== 5 && i !== 14) grid[i][5] = 1;
        if (i !== 9 && i !== 10) grid[i][10] = 1;
        if (i !== 5 && i !== 14) grid[i][15] = 1;
    }
    return grid;
}

function createCornerLMap() {
    const grid = createBorderMap();
    // L-shapes in corners
    for (let i = 3; i <= 7; i++) {
        grid[3][i] = 1; grid[i][3] = 1;
        grid[3][19 - i - 1] = 1; grid[i][16] = 1;
        grid[16][i] = 1; grid[19 - i - 1][3] = 1;
        grid[16][19 - i - 1] = 1; grid[19 - i - 1][16] = 1;
    }
    return grid;
}

function createCenterDiamondMap() {
    const grid = createBorderMap();
    // Diamond shape in middle
    grid[9][6] = 1; grid[9][13] = 1;
    grid[6][9] = 1; grid[13][9] = 1;
    grid[8][7] = 1; grid[8][12] = 1; grid[10][7] = 1; grid[10][12] = 1;
    grid[7][8] = 1; grid[7][11] = 1; grid[11][8] = 1; grid[11][11] = 1;
    return grid;
}

function createHorizontalSlotsMap() {
    const grid = createBorderMap();
    for (let r = 4; r <= 15; r += 3) {
        for (let c = 3; c <= 16; c++) {
            if (r % 2 === 0 ? c > 5 : c < 14) {
                grid[r][c] = 1;
            }
        }
    }
    return grid;
}

function createDiagonalGatesMap() {
    const grid = createBorderMap();
    for (let i = 4; i <= 8; i++) {
        grid[i][i] = 1;
        grid[i][19 - i - 1] = 1;
        grid[19 - i - 1][i] = 1;
        grid[19 - i - 1][19 - i - 1] = 1;
    }
    return grid;
}

function createVerticalSlidersMap() {
    const grid = createBorderMap();
    for (let i = 1; i <= 14; i++) {
        grid[i][4] = 1;
        grid[19 - i - 1][15] = 1;
    }
    return grid;
}

function createCrossDotMap() {
    const grid = createBorderMap();
    // Cross
    for (let i = 5; i <= 14; i++) {
        grid[9][i] = 1;
        grid[i][9] = 1;
    }
    // Corner blockages
    grid[4][4] = 1; grid[4][15] = 1;
    grid[15][4] = 1; grid[15][15] = 1;
    return grid;
}

function createHShapeMap() {
    const grid = createBorderMap();
    for (let i = 4; i <= 15; i++) {
        grid[i][6] = 1;
        grid[i][13] = 1;
    }
    grid[9][7] = 1; grid[9][8] = 1; grid[9][11] = 1; grid[9][12] = 1;
    return grid;
}

function createInterlockingUMap() {
    const grid = createBorderMap();
    // First U facing down
    for (let i = 4; i <= 15; i++) {
        grid[4][i] = 1;
    }
    grid[5][4] = 1; grid[6][4] = 1; grid[7][4] = 1;
    grid[5][15] = 1; grid[6][15] = 1; grid[7][15] = 1;
    
    // Second U facing up
    for (let i = 4; i <= 15; i++) {
        grid[15][i] = 1;
    }
    grid[14][4] = 1; grid[13][4] = 1; grid[12][4] = 1;
    grid[14][15] = 1; grid[13][15] = 1; grid[12][15] = 1;
    return grid;
}

function createStaggeredMap() {
    const grid = createBorderMap();
    for (let i = 1; i <= 12; i++) {
        grid[5][i] = 1;
        grid[14][19 - i - 1] = 1;
    }
    for (let i = 6; i <= 13; i++) {
        grid[i][9] = 1;
    }
    return grid;
}

function createTightColumnsMap() {
    const grid = createBorderMap();
    for (let c = 3; c <= 16; c += 2) {
        for (let r = 3; r <= 16; r++) {
            if (c % 4 === 3 ? r < 14 : r > 5) {
                grid[r][c] = 1;
            }
        }
    }
    return grid;
}

function createTripleRingsMap() {
    const grid = createBorderMap();
    // Ring 1
    for (let i = 4; i <= 15; i++) {
        if (i !== 9) { grid[4][i] = 1; grid[15][i] = 1; grid[i][4] = 1; grid[i][15] = 1; }
    }
    // Ring 2
    for (let i = 7; i <= 12; i++) {
        if (i !== 9) { grid[7][i] = 1; grid[12][i] = 1; grid[i][7] = 1; grid[i][12] = 1; }
    }
    return grid;
}

function createUltimateMazeMap() {
    const grid = createBorderMap();
    // Tight custom maze walls
    for (let i = 2; i <= 8; i++) grid[4][i] = 1;
    for (let i = 11; i <= 17; i++) grid[4][i] = 1;
    for (let i = 5; i <= 14; i++) grid[i][9] = 1;
    for (let i = 2; i <= 7; i++) grid[15][i] = 1;
    for (let i = 12; i <= 17; i++) grid[15][i] = 1;
    for (let i = 6; i <= 13; i++) {
        grid[i][4] = 1;
        grid[i][15] = 1;
    }
    return grid;
}

// 2. Start game, state managers
function startNewGame() {
    currentLevel = 1;
    score = 0;
    lives = 3;
    isGameOver = false;
    isLevelCleared = false;
    isPaused = false;
    
    document.getElementById('level-val').textContent = currentLevel;
    document.getElementById('score-val').textContent = score;
    document.getElementById('lives-val').textContent = lives;
    
    initLevel();
}

function initLevel() {
    catsEaten = 0;
    isLevelCleared = false;
    isPaused = false;
    exitPortal = null;
    
    document.getElementById('eaten-val').textContent = catsEaten;
    document.getElementById('game-overlay').classList.add('hidden');
    
    // Spawn snake near center of map, facing right
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    // Speed increases as level increments
    currentSpeed = Math.max(160 - (currentLevel * 6), 65);
    
    // Generate food (white cat)
    spawnFood();
    
    // Launch game tick
    stopGameTick();
    startGameTick();
}

function startGameTick() {
    gameTickInterval = setInterval(() => {
        updateGame();
        draw();
    }, currentSpeed);
}

function stopGameTick() {
    if (gameTickInterval) {
        clearInterval(gameTickInterval);
        gameTickInterval = null;
    }
}

function togglePause() {
    if (isGameOver || isLevelCleared) return;
    isPaused = !isPaused;
    playClick();
    if (isPaused) {
        stopGameTick();
        draw(); // Redraw immediately to display "PAUSED" overlay
    } else {
        startGameTick();
    }
}

// Spawn food (white cat) in empty space
function spawnFood() {
    const currentMap = MAPS[currentLevel - 1];
    let attempts = 0;
    while (attempts < 200) {
        const rx = Math.floor(Math.random() * GRID_SIZE);
        const ry = Math.floor(Math.random() * GRID_SIZE);
        
        // Check if overlaps wall
        if (currentMap[ry][rx] === 1) {
            attempts++;
            continue;
        }
        
        // Check if overlaps snake body
        const overlapsSnake = snake.some(seg => seg.x === rx && seg.y === ry);
        if (overlapsSnake) {
            attempts++;
            continue;
        }
        
        // Found empty spot!
        whiteCat = { x: rx, y: ry };
        return;
    }
    
    // Fallback placement
    whiteCat = { x: 10, y: 2 };
}

// Spawn portal (exit box) in empty space
function spawnPortal() {
    const currentMap = MAPS[currentLevel - 1];
    let attempts = 0;
    while (attempts < 200) {
        const rx = Math.floor(Math.random() * GRID_SIZE);
        const ry = Math.floor(Math.random() * GRID_SIZE);
        
        if (currentMap[ry][rx] === 1) {
            attempts++;
            continue;
        }
        const overlapsSnake = snake.some(seg => seg.x === rx && seg.y === ry);
        if (overlapsSnake) {
            attempts++;
            continue;
        }
        
        exitPortal = { x: rx, y: ry, revealed: true };
        return;
    }
    
    // Fallback exit placement
    exitPortal = { x: 10, y: 18, revealed: true };
}

// 3. Core Physics & Game Updates
function updateGame() {
    if (isGameOver || isLevelCleared || isPaused) return;
    
    // 1. Lock new direction to prevent self-collision
    direction = nextDirection;
    
    // 2. Calculate new head position
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // 3. Check collision with obstacles (map walls)
    const currentMap = MAPS[currentLevel - 1];
    if (currentMap[newHead.y][newHead.x] === 1) {
        takeDamage();
        return;
    }
    
    // 4. Check collision with own tail
    const hitSelf = snake.some((seg, index) => index > 0 && seg.x === newHead.x && seg.y === newHead.y);
    if (hitSelf) {
        takeDamage();
        return;
    }
    
    // 5. Add new head segment
    snake.unshift(newHead);
    
    // 6. Check if eaten the white cat
    if (newHead.x === whiteCat.x && newHead.y === whiteCat.y) {
        playLick();
        catsEaten++;
        score += 100 * currentLevel;
        document.getElementById('score-val').textContent = score;
        document.getElementById('eaten-val').textContent = catsEaten;
        
        // Update highscore
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_SCORE_KEY, bestScore);
            document.getElementById('best-val').textContent = bestScore;
        }
        
        if (catsEaten >= CATS_GOAL) {
            // Spawn the exit box portal
            spawnPortal();
        } else {
            spawnFood();
        }
        
        // Increase speed slightly
        stopGameTick();
        currentSpeed = Math.max(currentSpeed - 2, 50);
        startGameTick();
    } else {
        // Did not eat food, remove tail segment (keeps snake same size)
        snake.pop();
    }
    
    // 7. Check if entered Exit Portal box
    if (exitPortal && exitPortal.revealed) {
        if (newHead.x === exitPortal.x && newHead.y === exitPortal.y) {
            levelClear();
        }
    }
}

// 4. Collision Damage & Lifespans
function takeDamage() {
    playHiss();
    stopGameTick();
    lives--;
    document.getElementById('lives-val').textContent = lives;
    
    if (lives <= 0) {
        triggerGameOver();
    } else {
        // Flash overlay, reset position
        document.getElementById('overlay-emoji').textContent = '💥';
        document.getElementById('overlay-title').textContent = 'Crashed!';
        document.getElementById('overlay-desc').textContent = `Oops! You hit a wall or your tail. Lives left: ${lives}`;
        document.getElementById('overlay-action-btn').textContent = 'Reset Snake 🐾';
        
        document.getElementById('game-overlay').classList.remove('hidden');
    }
}

function triggerGameOver() {
    isGameOver = true;
    stopGameTick();
    
    document.getElementById('overlay-emoji').textContent = '💀';
    document.getElementById('overlay-title').textContent = 'Game Over';
    document.getElementById('overlay-desc').textContent = `You scored ${score} points. Final Level: ${currentLevel}`;
    document.getElementById('overlay-action-btn').textContent = 'Try Again 🔄';
    
    document.getElementById('game-overlay').classList.remove('hidden');
}

function levelClear() {
    isLevelCleared = true;
    stopGameTick();
    playVictory();
    
    // Confetti particles
    for (let i = 0; i < 50; i++) {
        confettiParticles.push(new ConfettiParticle(Math.random() * confettiCanvas.width, Math.random() * confettiCanvas.height - 100));
    }
    startConfetti();
    
    score += 500; // Level clear bonus
    document.getElementById('score-val').textContent = score;
    
    // Check demo levels bounds
    if (currentLevel === 5 && !isProVersion) {
        document.getElementById('overlay-emoji').textContent = '🔒🐈‍⬛';
        document.getElementById('overlay-title').textContent = 'Demo Completed!';
        document.getElementById('overlay-desc').textContent = 'You cleared all 5 free levels! Unlock the full game (Levels 6-20) for 1.49€ to continue your cozy snake adventure!';
        document.getElementById('overlay-action-btn').textContent = 'Unlock Levels 6-20 💎';
    } else if (currentLevel === 20) {
        document.getElementById('overlay-emoji').textContent = '👑🐈‍⬛';
        document.getElementById('overlay-title').textContent = 'Ultimate Victory!';
        document.getElementById('overlay-desc').textContent = `Incredible! You cleared all 20 maps of Black Cat Snake! Final Score: ${score}.`;
        document.getElementById('overlay-action-btn').textContent = 'Play Again 🔄';
    } else {
        document.getElementById('overlay-emoji').textContent = '🎉🐈‍⬛';
        document.getElementById('overlay-title').textContent = 'Level Cleared!';
        document.getElementById('overlay-desc').textContent = `You fed the cat and reached the box! Level bonus: +500 points.`;
        document.getElementById('overlay-action-btn').textContent = 'Next Level ⏩';
    }
    
    document.getElementById('game-overlay').classList.remove('hidden');
}

function advanceNextLevel() {
    currentLevel++;
    document.getElementById('level-val').textContent = currentLevel;
    document.getElementById('game-overlay').classList.add('hidden');
    isLevelCleared = false;
    
    initLevel();
}

// 5. Drawing Canvas Loop
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentMap = MAPS[currentLevel - 1];
    
    // Draw grid map obstacles
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;
            
            if (currentMap[r][c] === 1) {
                // Obstacle - styled block
                ctx.fillStyle = '#1e153a';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = '#9b5de5';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                
                // Cross detail on blocks
                ctx.strokeStyle = 'rgba(155, 93, 229, 0.15)';
                ctx.beginPath();
                ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + CELL_SIZE - 4, y + CELL_SIZE - 4);
                ctx.stroke();
            } else {
                // Path
                ctx.fillStyle = '#0c081d';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = 'rgba(155, 93, 229, 0.04)';
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    // Draw food (white cat face)
    const fx = whiteCat.x * CELL_SIZE + CELL_SIZE/2;
    const fy = whiteCat.y * CELL_SIZE + CELL_SIZE/2;
    ctx.save();
    ctx.translate(fx, fy);
    
    // White body/head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Pink ears
    ctx.fillStyle = '#ff758c';
    ctx.beginPath();
    ctx.moveTo(-7, -4); ctx.lineTo(-10, -11); ctx.lineTo(-3, -7); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -4); ctx.lineTo(10, -11); ctx.lineTo(3, -7); ctx.closePath(); ctx.fill();
    
    // Dark eyes
    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.arc(-3, -1, 1, 0, Math.PI*2);
    ctx.arc(3, -1, 1, 0, Math.PI*2);
    ctx.fill();
    
    // Pink nose
    ctx.fillStyle = '#ff758c';
    ctx.beginPath();
    ctx.arc(0, 2, 1, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    
    // Draw exit portal
    if (exitPortal && exitPortal.revealed) {
        const ex = exitPortal.x * CELL_SIZE + 2;
        const ey = exitPortal.y * CELL_SIZE + 2;
        const size = CELL_SIZE - 4;
        
        // Draw cardboard cat box
        ctx.fillStyle = '#d2af76';
        ctx.fillRect(ex, ey, size, size);
        ctx.fillStyle = '#a6804a';
        ctx.fillRect(ex - 1, ey - 2, 4, 2);
        ctx.fillRect(ex + size - 3, ey - 2, 4, 2);
        // Box opening shadow
        ctx.fillStyle = '#4c3516';
        ctx.fillRect(ex + 3, ey + 3, size - 6, size - 6);
    }
    
    // Draw Snake body segments
    for (let i = snake.length - 1; i > 0; i--) {
        const seg = snake[i];
        const sx = seg.x * CELL_SIZE + CELL_SIZE/2;
        const sy = seg.y * CELL_SIZE + CELL_SIZE/2;
        
        ctx.fillStyle = '#181522'; // Sleek dark black segments
        ctx.beginPath();
        ctx.arc(sx, sy, 9, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cute little pink paws prints inside body segments
        ctx.fillStyle = '#ff758c';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI*2); // Center paw
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx - 3, sy - 3, 1, 0, Math.PI*2);
        ctx.arc(sx, sy - 4, 1, 0, Math.PI*2);
        ctx.arc(sx + 3, sy - 3, 1, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Draw Snake head (glowing eyes black cat)
    const head = snake[0];
    const hx = head.x * CELL_SIZE + CELL_SIZE/2;
    const hy = head.y * CELL_SIZE + CELL_SIZE/2;
    
    ctx.save();
    ctx.translate(hx, hy);
    
    // Rotate head depending on movement direction
    let angle = 0;
    if (direction.x === 1) angle = 0;            // right
    if (direction.x === -1) angle = Math.PI;       // left
    if (direction.y === -1) angle = -Math.PI / 2; // up
    if (direction.y === 1) angle = Math.PI / 2;   // down
    ctx.rotate(angle);
    
    // Black cat face
    ctx.fillStyle = '#181522';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    
    // Pointy ears
    ctx.beginPath();
    ctx.moveTo(-10, -5); ctx.lineTo(-14, -15); ctx.lineTo(-4, -9); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -5); ctx.lineTo(14, -15); ctx.lineTo(4, -9); ctx.closePath(); ctx.fill();
    
    // Yellow glowing eyes
    ctx.fillStyle = '#fee440';
    ctx.beginPath();
    ctx.ellipse(-4, -1, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(4, -1, 2.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(-4, -1, 0.8, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(4, -1, 0.8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Whiskers
    ctx.strokeStyle = '#3d3856';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, 2); ctx.lineTo(-14, 1);
    ctx.moveTo(-8, 4); ctx.lineTo(-14, 5);
    ctx.moveTo(8, 2); ctx.lineTo(14, 1);
    ctx.moveTo(8, 4); ctx.lineTo(14, 5);
    ctx.stroke();
    
    // Small pink nose
    ctx.fillStyle = '#ff758c';
    ctx.beginPath();
    ctx.moveTo(0, 3); ctx.lineTo(-1.5, 1); ctx.lineTo(1.5, 1); ctx.closePath(); ctx.fill();
    
    ctx.restore();
    
    // Draw pause overlay if game is paused
    if (isPaused) {
        ctx.fillStyle = 'rgba(13, 10, 27, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fee440';
        ctx.font = 'bold 36px Fredoka';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.fillStyle = '#f5f6fa';
        ctx.font = '16px Fredoka';
        ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 25);
    }
}

// 6. WinRT Store purchases logic & fallback
function loadPurchaseState() {
    const saved = localStorage.getItem(PRO_VERSION_KEY);
    if (saved === 'true') {
        isProVersion = true;
        applyProUpgradeUI();
        return;
    }
    
    if (typeof Windows !== 'undefined' && Windows.Services && Windows.Services.Store) {
        try {
            const storeContext = Windows.Services.Store.StoreContext.getDefault();
            storeContext.getCustomerPurchaseResultsAsync().then(result => {
                const hasLicense = result.licenses.has("pro_upgrade");
                if (hasLicense) {
                    localStorage.setItem(PRO_VERSION_KEY, 'true');
                    isProVersion = true;
                    applyProUpgradeUI();
                }
            });
        } catch (e) {
            console.error("Error reading licenses from Windows Store:", e);
        }
    }
}

function applyProUpgradeUI() {
    document.getElementById('pro-badge').classList.remove('hidden');
    document.getElementById('open-shop-btn').classList.add('hidden');
    const hint = document.querySelector('.shop-hint');
    if (hint) hint.textContent = 'Pro version active! levels 6-20 unlocked. Thank you for your support! 💎';
}

function simulatePurchase() {
    if (typeof Windows !== 'undefined' && Windows.Services && Windows.Services.Store) {
        try {
            const storeContext = Windows.Services.Store.StoreContext.getDefault();
            const storeId = "pro_upgrade"; // Durable IAP ID
            
            storeContext.requestPurchaseAsync(storeId).then(result => {
                if (result.status === Windows.Services.Store.StorePurchaseStatus.succeeded) {
                    playVictory();
                    localStorage.setItem(PRO_VERSION_KEY, 'true');
                    isProVersion = true;
                    applyProUpgradeUI();
                    
                    document.getElementById('shop-modal').classList.add('hidden');
                    
                    // Unlock next level if sitting on Level 5 completion overlay
                    if (isLevelCleared && currentLevel === 5) {
                        document.getElementById('overlay-emoji').textContent = '🎉🐈‍⬛';
                        document.getElementById('overlay-title').textContent = 'Levels Unlocked!';
                        document.getElementById('overlay-desc').textContent = 'Pro Version active! levels 6-20 are now unlocked. Press Next Level to continue!';
                        document.getElementById('overlay-action-btn').textContent = 'Next Level ⏩';
                    }
                    
                    alert("Thank you! Full Game successfully unlocked. Levels 6-20 are now ready to play! 🐾💎");
                } else {
                    alert("Purchase was cancelled or failed. Status: " + result.status);
                }
            });
        } catch (e) {
            alert("Error connecting to payment gateway: " + e.message);
        }
    } else {
        // Local Mockup for Mac browser testing
        playVictory();
        localStorage.setItem(PRO_VERSION_KEY, 'true');
        isProVersion = true;
        applyProUpgradeUI();
        
        document.getElementById('shop-modal').classList.add('hidden');
        
        if (isLevelCleared && currentLevel === 5) {
            document.getElementById('overlay-emoji').textContent = '🎉🐈‍⬛';
            document.getElementById('overlay-title').textContent = 'Levels Unlocked!';
            document.getElementById('overlay-desc').textContent = 'Pro Version active! levels 6-20 are now unlocked. Press Next Level to continue!';
            document.getElementById('overlay-action-btn').textContent = 'Next Level ⏩';
        }
        
        alert("Purchase simulated successfully! (Testing Mode on Mac) 🐾💎");
    }
}

// 7. Confetti Effects (victory animation helper)
class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 4;
        const colors = ['#9b5de5', '#f15bb5', '#fee440', '#00f5d4', '#00bbf9'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 + 2;
        this.gravity = 0.1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.15 - 0.07;
        this.opacity = 1;
        this.decay = Math.random() * 0.012 + 0.008;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.decay;
    }
    draw() {
        cCtx.save();
        cCtx.translate(this.x, this.y);
        cCtx.rotate(this.rotation);
        cCtx.fillStyle = this.color;
        cCtx.globalAlpha = this.opacity;
        cCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        cCtx.restore();
    }
}

let confettiParticles = [];
let confettiAnimationId = null;
function startConfetti() {
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    function loop() {
        cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        if (!document.getElementById('game-overlay').classList.contains('hidden') && confettiParticles.length < 80) {
            confettiParticles.push(new ConfettiParticle(Math.random() * confettiCanvas.width, -10));
        }
        
        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.update();
            p.draw();
            if (p.opacity <= 0 || p.y > confettiCanvas.height) {
                confettiParticles.splice(i, 1);
            }
        }
        
        if (confettiParticles.length > 0) {
            confettiAnimationId = requestAnimationFrame(loop);
        } else {
            cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiAnimationId = null;
        }
    }
    loop();
}

function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

// 8. Setup DOM Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check highscore
    const best = localStorage.getItem(BEST_SCORE_KEY);
    if (best) {
        bestScore = parseInt(best);
        document.getElementById('best-val').textContent = bestScore;
    }
    
    // Keyboard inputs
    window.addEventListener('keydown', e => {
        const key = e.key;
        
        // Prevent default scrolling keys
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(key) > -1) {
            e.preventDefault();
        }
        
        if (key === 'p' || key === 'P') {
            e.preventDefault();
            togglePause();
        }
        
        if ((key === 'ArrowUp' || key === 'w') && direction.y !== 1) {
            nextDirection = { x: 0, y: -1 };
        } else if ((key === 'ArrowDown' || key === 's') && direction.y !== -1) {
            nextDirection = { x: 0, y: 1 };
        } else if ((key === 'ArrowLeft' || key === 'a') && direction.x !== 1) {
            nextDirection = { x: -1, y: 0 };
        } else if ((key === 'ArrowRight' || key === 'd') && direction.x !== -1) {
            nextDirection = { x: 1, y: 0 };
        }
    });
    
    // Controls click handlers
    document.getElementById('restart-btn').addEventListener('click', () => {
        playClick();
        startNewGame();
    });
    
    const soundBtn = document.getElementById('sound-btn');
    soundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        if (isSoundEnabled) {
            soundBtn.textContent = '🔊 Sound';
            playClick();
        } else {
            soundBtn.textContent = '🔇 Mute';
        }
    });
    
    // Modal action button click
    document.getElementById('overlay-action-btn').addEventListener('click', () => {
        playClick();
        if (isLevelCleared) {
            if (currentLevel === 5 && !isProVersion) {
                // Trigger Shop
                document.getElementById('shop-modal').classList.remove('hidden');
            } else if (currentLevel === 20) {
                // Victory clear, start new game
                startNewGame();
            } else {
                advanceNextLevel();
            }
        } else {
            // Crash or GameOver, start level or game again
            if (lives <= 0) {
                startNewGame();
            } else {
                initLevel();
            }
        }
    });
    
    // Shop modals listeners
    document.getElementById('open-shop-btn').addEventListener('click', () => {
        playClick();
        document.getElementById('shop-modal').classList.remove('hidden');
    });
    
    document.getElementById('close-shop-btn').addEventListener('click', () => {
        playClick();
        document.getElementById('shop-modal').classList.add('hidden');
    });
    
    document.getElementById('purchase-btn').addEventListener('click', () => {
        simulatePurchase();
    });
    
    // Unlock Audio Context on first interaction
    document.body.addEventListener('mousedown', () => {
        initAudio();
    }, { once: true });
    
    // Boot game
    loadPurchaseState();
    startNewGame();
});
