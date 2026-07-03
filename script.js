/**
 * GameVerse Engine System
 * Architecture Core Architecture: Clean Module Pattern State Management
 */

// Global Application State Matrix
const state = {
    user: {
        xp: 0,
        level: 1,
        coins: 0,
        highScore: 0,
        gamesPlayed: 0,
        wins: 0,
        favoriteGame: 'N/A',
        playTime: 0, // In minutes
        recentGames: [],
        unlockedAchievements: []
    },
    activeGame: null,
    gameScore: 0,
    soundMuted: false,
    historyCounter: {}
};

// Constant Configuration Maps
const CATEGORIES = [
    { id: 'puzzle', name: 'Puzzle Games', icon: 'fa-puzzle-piece' },
    { id: 'arcade', name: 'Arcade Games', icon: 'fa-gamepad' },
    { id: 'board', name: 'Board Games', icon: 'fa-chess-board' },
    { id: 'card', name: 'Card Games', icon: 'fa-id-card' },
    { id: 'action', name: 'Action Games', icon: 'fa-burst' },
    { id: 'strategy', name: 'Strategy Games', icon: 'fa-brain' }
];

const GAMES_REGISTRY = [
    { id: 'ttt', title: 'Tic-Tac-Toe', category: 'board', difficulty: 'easy', desc: 'Engage in a classic match of positional tactical alignments.', xpReward: 10 },
    { id: 'snake', title: 'Retro Snake', category: 'arcade', difficulty: 'medium', desc: 'Navigate through a self-growing kinetic vector matrix.', xpReward: 20 },
    { id: 'rps', title: 'Rock Paper Scissors', category: 'arcade', difficulty: 'easy', desc: 'A game of chance, intuition, and predictive deduction.', xpReward: 10 },
    { id: 'memory', title: 'Memory Cards', category: 'puzzle', difficulty: 'medium', desc: 'Synthesize retention pathways under rigorous constraints.', xpReward: 20 },
    { id: 'hangman', title: 'Elite Hangman', category: 'puzzle', difficulty: 'easy', desc: 'Extract complex vocabulary strings systematically.', xpReward: 10 },
    { id: '2048', title: '2048 Matrix', category: 'puzzle', difficulty: 'hard', desc: 'Merge proportional mathematical grids logarithmically.', xpReward: 40 }
];

const ACHIEVEMENTS_MAP = [
    { id: 'first_win', name: 'First Win', desc: 'Successfully win your first game instance.', icon: 'fa-bolt' },
    { id: 'veteran', name: '10 Games Played', desc: 'Log 10 complete matches inside GameVerse.', icon: 'fa-shield-halved' },
    { id: 'snake_master', name: 'Snake Master', desc: 'Score over 100 points in Retro Snake.', icon: 'fa-dragon' },
    { id: 'legend', name: 'Legend Player', desc: 'Advance to profile Level 5.', icon: 'fa-crown' }
];

const LEVEL_NAMES = [
    "Beginner", "Rookie", "Explorer", "Skilled", "Pro", 
    "Expert", "Master", "Champion", "Legend", "Ultimate Gamer"
];

// Main Application Flow Orchestrator
class GameVerseApp {
    constructor() {
        this.initDOMRefs();
        this.bindGlobalEvents();
        this.loadStateFromStorage();
        this.renderCatalogues();
        this.updateDynamicUI();
        this.runAnimatedCounters();
        
        // Kill structural splash screen
        setTimeout(() => {
            document.getElementById('loader').style.opacity = 0;
            setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
        }, 1000);
    }

    initDOMRefs() {
        this.views = document.querySelectorAll('.view-section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.themeToggle = document.getElementById('theme-toggle');
        this.backToTopBtn = document.getElementById('back-to-top');
    }

    bindGlobalEvents() {
        // Theme toggler mechanic
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', targetTheme);
            this.themeToggle.innerHTML = targetTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        });

        // Instant structural search handling
        document.getElementById('global-search').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.switchView('games-hub');
            this.filterGamesContainer(query, 'search');
        });

        // Hub filtering system layout
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterGamesContainer(e.target.dataset.filter, 'category');
            });
        });

        // Scroll event binding context
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.backToTopBtn.style.display = 'flex';
            } else {
                this.backToTopBtn.style.display = 'none';
            }
        });
        this.backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    loadStateFromStorage() {
        const stored = localStorage.getItem('gameverse_user_state_v1');
        if (stored) {
            try {
                state.user = { ...state.user, ...JSON.parse(stored) };
            } catch (e) { console.error("Corrupted engine cache reset initialized.", e); }
        }
    }

    saveStateToStorage() {
        localStorage.setItem('gameverse_user_state_v1', JSON.stringify(state.user));
        this.updateDynamicUI();
    }

    switchView(viewId) {
        this.views.forEach(view => view.classList.remove('active'));
        this.navLinks.forEach(link => link.classList.remove('active'));

        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) targetView.classList.add('active');

        // Align active states to components
        const matchingLink = document.querySelector(`.nav-link[onclick*="'${viewId}'"]`);
        if (matchingLink) matchingLink.classList.add('active');
        window.scrollTo({ top: 0 });
    }

    renderCatalogues() {
        // Build Home Categories Layout
        const catContainer = document.getElementById('category-container');
        if (catContainer) {
            catContainer.innerHTML = CATEGORIES.map(cat => `
                <div class="card glass category-card" onclick="app.openCategory('${cat.id}')">
                    <i class="fa-solid ${cat.icon} text-primary"></i>
                    <h4>${cat.name}</h4>
                </div>
            `).join('');
        }

        // Build Master Arcade Registry Grid Layout
        this.renderGamesGrid(GAMES_REGISTRY);
    }

    renderGamesGrid(dataset) {
        const gamesContainer = document.getElementById('games-container');
        if (!gamesContainer) return;
        
        gamesContainer.innerHTML = dataset.map(game => `
            <div class="card glass game-card">
                <div class="game-card-banner">
                    <i class="fa-solid fa-gamepad"></i>
                    <span class="game-card-meta-tag">${game.difficulty}</span>
                </div>
                <div class="game-card-body">
                    <div>
                        <h3 class="game-card-title">${game.title}</h3>
                        <p class="game-card-desc">${game.desc}</p>
                    </div>
                    <button class="btn btn-primary btn-sm ripple" style="width:100%; justify-content:center;" onclick="app.launchGameEngine('${game.id}')">Initialize Engine</button>
                </div>
            </div>
        `).join('');
    }

    openCategory(catId) {
        this.switchView('games-hub');
        const filterBtn = document.querySelector(`.filter-btn[data-filter="${catId}"]`);
        if (filterBtn) filterBtn.click();
    }

    filterGamesContainer(criteria, mode) {
        if (mode === 'search') {
            const filtered = GAMES_REGISTRY.filter(g => g.title.toLowerCase().includes(criteria));
            this.renderGamesGrid(filtered);
        } else if (mode === 'category') {
            if (criteria === 'all') { this.renderGamesGrid(GAMES_REGISTRY); return; }
            const filtered = GAMES_REGISTRY.filter(g => g.category === criteria || g.difficulty === criteria);
            this.renderGamesGrid(filtered);
        }
    }

    updateDynamicUI() {
        // Nav elements
        document.getElementById('nav-xp').innerText = state.user.xp;
        
        // Dashboard calculations
        document.getElementById('dash-level-num').innerText = state.user.level;
        document.getElementById('dash-level-name').innerText = LEVEL_NAMES[state.user.level - 1] || "Pro Gamer";
        document.getElementById('dash-xp-current').innerText = state.user.xp;
        document.getElementById('dash-coins').innerText = state.user.coins;
        document.getElementById('dash-score').innerText = state.user.highScore;
        
        const nextLevelXP = state.user.level * 100;
        const currentLevelBase = (state.user.level - 1) * 100;
        const relativeProgress = ((state.user.xp - currentLevelBase) / (nextLevelXP - currentLevelBase)) * 100;
        document.getElementById('dash-xp-progress').style.width = `${Math.min(100, Math.max(0, relativeProgress))}%`;
        document.getElementById('dash-xp-next').innerText = `${Math.max(0, nextLevelXP - state.user.xp)} XP to higher dimension`;

        // Metric calculations
        document.getElementById('m-played').innerText = state.user.gamesPlayed;
        const winPct = state.user.gamesPlayed > 0 ? Math.round((state.user.wins / state.user.gamesPlayed) * 100) : 0;
        document.getElementById('m-winpct').innerText = `${winPct}%`;
        document.getElementById('m-fav').innerText = state.user.favoriteGame;
        document.getElementById('m-time').innerText = `${state.user.playTime}m`;

        // Render trophies achievements frame block
        const achContainer = document.getElementById('achievements-container');
        if (achContainer) {
            achContainer.innerHTML = ACHIEVEMENTS_MAP.map(ach => {
                const isUnlocked = state.user.unlockedAchievements.includes(ach.id);
                return `
                    <div class="badge-trophy ${isUnlocked ? 'unlocked' : ''}" title="${ach.desc}">
                        <i class="fa-solid ${ach.icon}"></i>
                        <span>${ach.name}</span>
                    </div>
                `;
            }).join('');
        }
    }

    runAnimatedCounters() {
        document.querySelectorAll('.stat-num').forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let current = 0;
            const step = target / 50;
            const update = () => {
                current += step;
                if (current < target) {
                    counter.innerText = Math.floor(current) + "+";
                    setTimeout(update, 20);
                } else {
                    counter.innerText = target + "+";
                }
            };
            update();
        });
    }

    launchGameEngine(gameId) {
        const gameData = GAMES_REGISTRY.find(g => g.id === gameId);
        if (!gameData) return;

        state.activeGame = gameId;
        state.gameScore = 0;
        document.getElementById('live-score').innerText = "0";
        document.getElementById('current-game-title').innerText = gameData.title;
        document.getElementById('game-instructions-text').innerText = gameData.desc;
        document.getElementById('game-difficulty-badge').innerText = gameData.difficulty;
        document.getElementById('game-difficulty-badge').className = `badge xp-badge`;

        // Context dynamic structural engine switcher initialization
        const viewport = document.getElementById('game-viewport');
        viewport.innerHTML = ""; // Clear existing frame loop runtime references

        this.switchView('game-player');

        // Attach action handlers dynamically
        document.getElementById('game-restart-btn').onclick = () => this.launchGameEngine(gameId);

        // Map execution matrices
        if (gameId === 'ttt') {
            this.initTicTacToe(viewport);
        } else if (gameId === 'snake') {
            this.initSnake(viewport);
        } else if (gameId === 'rps') {
            this.initRPS(viewport);
        } else {
            viewport.innerHTML = `<div class="text-center" style="padding:40px;"><i class="fa-solid fa-code-branch" style="font-size:3rem; margin-bottom:16px; color:var(--text-secondary);"></i><p>Game Engine micro-architecture integration optimization ongoing in core.</p></div>`;
        }
    }

    /**
     * PROCESS: COMPLETE CORE NATIVE MODULE GAME ENGINES INJECTIONS
     */
    initTicTacToe(viewport) {
        const container = document.createElement('div');
        container.className = "ttt-board animated-pop";
        let boardState = ["", "", "", "", "", "", "", "", ""];
        let isGameActive = true;

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = "ttt-cell";
            cell.dataset.index = i;
            cell.addEventListener('click', (e) => {
                if (boardState[i] !== "" || !isGameActive) return;
                
                // Human Turn execution
                boardState[i] = "X";
                e.target.innerText = "X";
                e.target.classList.add('X');
                
                if (checkWin("X")) { endGame(true); return; }
                if (!boardState.includes("")) { endGame(false, true); return; }

                isGameActive = false; // block operational space during calculation thread loop
                setTimeout(() => {
                    // AI logical operational turn selector engine algorithm simulation
                    let emptyIndices = boardState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
                    if (emptyIndices.length > 0) {
                        let aiChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                        boardState[aiChoice] = "O";
                        const targetCell = container.querySelector(`[data-index="${aiChoice}"]`);
                        if (targetCell) {
                            targetCell.innerText = "O";
                            targetCell.classList.add('O');
                        }
                        if (checkWin("O")) { endGame(false); return; }
                    }
                    isGameActive = true;
                }, 400);
            });
            container.appendChild(cell);
        }

        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // Rows
            [0,3,6], [1,4,7], [2,5,8], // Cols
            [0,4,8], [2,4,6]           // Diagonals
        ];

        const checkWin = (player) => winPatterns.some(pattern => pattern.every(idx => boardState[idx] === player));

        const endGame = (humanWon, isDraw = false) => {
            isGameActive = false;
            if (isDraw) {
                app.triggerGameOver(false, "Draw structural tie. Matrix normalized.");
            } else if (humanWon) {
                state.gameScore = 100;
                document.getElementById('live-score').innerText = state.gameScore;
                app.triggerGameOver(true, "Tic-Tac-Toe structural validation win executed.");
            } else {
                app.triggerGameOver(false, "System AI alignment conquered processing space.");
            }
        };

        viewport.appendChild(container);
    }

    initSnake(viewport) {
        const canvas = document.createElement('canvas');
        canvas.className = "snake-canvas";
        canvas.width = 300; canvas.height = 300;
        viewport.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const grid = 15;
        let count = 0;
        let snake = { x: 150, y: 150, dx: grid, dy: 0, cells: [], maxCells: 4 };
        let apple = { x: 60, y: 60 };
        let loopId = null;

        function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

        const loop = () => {
            if (!state.activeGame || state.activeGame !== 'snake') { cancelAnimationFrame(loopId); return; }
            loopId = requestAnimationFrame(loop);
            
            if (++count < 6) return; // Cap visual frames to process physics processing throttling loops
            count = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            snake.x += snake.dx; snake.y += snake.dy;
            
            // Loop screen boundaries safely
            if (snake.x < 0) snake.x = canvas.width - grid;
            else if (snake.x >= canvas.width) snake.x = 0;
            if (snake.y < 0) snake.y = canvas.height - grid;
            else if (snake.y >= canvas.height) snake.y = 0;

            snake.cells.unshift({ x: snake.x, y: snake.y });
            if (snake.cells.length > snake.maxCells) snake.cells.pop();

            // Draw operational targets
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

            ctx.fillStyle = '#10b981';
            snake.cells.forEach((cell, index) => {
                ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);
                // Collision alignment evaluations
                if (cell.x === apple.x && cell.y === apple.y) {
                    snake.maxCells++;
                    state.gameScore += 10;
                    document.getElementById('live-score').innerText = state.gameScore;
                    apple.x = getRandomInt(0, 20) * grid;
                    apple.y = getRandomInt(0, 20) * grid;
                }
                for (let i = index + 1; i < snake.cells.length; i++) {
                    if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                        cancelAnimationFrame(loopId);
                        app.triggerGameOver(state.gameScore > 40, `Game finished. Cluster score: ${state.gameScore}`);
                    }
                }
            });
        };

        // Keyboard vector adjustments interception structure binding
        const controlBinder = (e) => {
            if (e.key === 'ArrowLeft' && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
            else if (e.key === 'ArrowUp' && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
            else if (e.key === 'ArrowRight' && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
            else if (e.key === 'ArrowDown' && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
        };
        document.addEventListener('keydown', controlBinder);
        loopId = requestAnimationFrame(loop);
    }

    initRPS(viewport) {
        const frame = document.createElement('div');
        frame.className = "rps-container animated-pop";
        frame.innerHTML = `
            <div class="rps-choices">
                <button class="rps-btn" data-choice="rock"><i class="fa-solid fa-hand-fist"></i></button>
                <button class="rps-btn" data-choice="paper"><i class="fa-solid fa-span-hard"></i><i class="fa-solid fa-hand"></i></button>
                <button class="rps-btn" data-choice="scissors"><i class="fa-solid fa-hand-scissors"></i></button>
            </div>
            <div class="rps-sandbox">
                <div>You <span id="rps-p" class="rps-hand-display">-</span></div>
                <div>System Engine <span id="rps-c" class="rps-hand-display">-</span></div>
            </div>
        `;

        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };

        frame.querySelectorAll('.rps-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pChoice = btn.dataset.choice;
                const cChoice = choices[Math.floor(Math.random() * 3)];
                
                frame.querySelector('#rps-p').innerText = emojis[pChoice];
                frame.querySelector('#rps-c').innerText = emojis[cChoice];

                if (pChoice === cChoice) {
                    app.triggerGameOver(false, "Draw calculation cycle complete.");
                } else if (
                    (pChoice === 'rock' && cChoice === 'scissors') ||
                    (pChoice === 'paper' && cChoice === 'rock') ||
                    (pChoice === 'scissors' && cChoice === 'paper')
                ) {
                    state.gameScore = 50;
                    document.getElementById('live-score').innerText = state.gameScore;
                    app.triggerGameOver(true, "Intuitive deployment sequence victorious.");
                } else {
                    app.triggerGameOver(false, "Defeat. Sub-optimal strategy profile detected.");
                }
            });
        });
        viewport.appendChild(frame);
    }

    triggerGameOver(isWin, messageString) {
        const gameData = GAMES_REGISTRY.find(g => g.id === state.activeGame);
        state.user.gamesPlayed++;
        
        let earnedXP = 0;
        let earnedCoins = 0;

        if (isWin) {
            state.user.wins++;
            earnedXP = gameData ? gameData.xpReward : 10;
            earnedCoins = earnedXP * 2;
            
            state.user.xp += earnedXP;
            state.user.coins += earnedCoins;
            if (state.gameScore > state.user.highScore) state.user.highScore = state.gameScore;

            document.getElementById('go-title').innerText = "VICTORY";
            document.getElementById('go-title').className = "gradient-text";
        } else {
            document.getElementById('go-title').innerText = "CYCLE END";
            document.getElementById('go-title').className = "text-danger";
        }

        // Metrics engine calculations update state parameters safely
        state.user.playTime += Math.floor(Math.random() * 3) + 1; // Simulate play time increments
        if (gameData) {
            state.historyCounter[gameData.title] = (state.historyCounter[gameData.title] || 0) + 1;
            // Establish favorite game via frequency check maps logic
            state.user.favoriteGame = Object.keys(state.historyCounter).reduce((a, b) => state.historyCounter[a] > state.historyCounter[b] ? a : b);
        }

        // Display results structure data binds
        document.getElementById('go-message').innerText = messageString;
        document.getElementById('go-xp').innerText = earnedXP;
        document.getElementById('go-coins').innerText = earnedCoins;

        // Process conditional level advancements
        this.evaluateLevelMatrix();
        this.evaluateAchievementsMatrix();
        this.saveStateToStorage();

        // Reveal game results matrix viewport
        document.getElementById('go-retry-btn').onclick = () => {
            this.closeModal('game-over-modal');
            this.launchGameEngine(state.activeGame);
        };
        this.openModal('game-over-modal');
    }

    evaluateLevelMatrix() {
        const currentTargetLevel = Math.floor(state.user.xp / 100) + 1;
        if (currentTargetLevel > state.user.level) {
            state.user.level = currentTargetLevel;
            
            // Populate and scale Level Up Interface Module popup
            document.getElementById('modal-level-idx').innerText = state.user.level;
            document.getElementById('modal-level-name').innerText = LEVEL_NAMES[state.user.level - 1] || "Elite Legend";
            
            setTimeout(() => this.openModal('level-up-modal'), 600);
        }
    }

    evaluateAchievementsMatrix() {
        const unlock = (id) => {
            if (!state.user.unlockedAchievements.includes(id)) {
                state.user.unlockedAchievements.push(id);
            }
        };

        if (state.user.wins >= 1) unlock('first_win');
        if (state.user.gamesPlayed >= 10) unlock('veteran');
        if (state.activeGame === 'snake' && state.gameScore >= 100) unlock('snake_master');
        if (state.user.level >= 5) unlock('legend');
    }

    openModal(id) { document.getElementById(id).classList.add('active'); }
    closeModal(id) { document.getElementById(id).classList.remove('active'); }
}

// Instantiate engine pipeline lifecycle parameters on frame components configuration loading
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GameVerseApp();
});