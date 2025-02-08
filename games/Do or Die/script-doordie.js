class Player {
    constructor(id, name, life) {
        this.id = id;
        this.name = name;
        this.life = life;
        this.lastScore = 0;
        this.previousScore = 0;
        this.legs = 0;
    }
}

let players = [];
let currentPlayerIndex = 0;
let baseLife = 1000;
let playerCounter = 1;
let history = [];

document.addEventListener('DOMContentLoaded', () => {
    const setup = {
        playerName: document.getElementById('playerName'),
        lifeOption: document.getElementById('lifePointsOption'),
        customLife: document.getElementById('customLifePoints'),
        startBtn: document.getElementById('startGame')
    };

    setup.playerName.addEventListener('keypress', e => {
        if (e.key === 'Enter') addPlayer();
    });

    setup.lifeOption.addEventListener('change', () => {
        document.getElementById('customLifeContainer').classList.toggle('hidden', setup.lifeOption.value !== 'custom');
        updateStartButton();
    });

    setup.startBtn.addEventListener('click', startGame);
    document.getElementById('throwBtn').addEventListener('click', handleThrow);
    document.getElementById('undoBtn').addEventListener('click', undoLastThrow);
    document.getElementById('resetGame').addEventListener('click', resetGame);
    document.getElementById('scoreInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') handleThrow();
    });
});

function addPlayer() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim();
    
    if (name && players.length < 8) {
        players.push({
            id: playerCounter++,
            name: name,
            isStarter: players.length === 0
        });
        
        nameInput.value = '';
        renderPlayerList();
        updateStartButton();
        nameInput.focus();
    }
}

function removePlayer(id) {
    players = players.filter(p => p.id !== id);
    if (players.length > 0 && !players.some(p => p.isStarter)) {
        players[0].isStarter = true;
    }
    renderPlayerList();
    updateStartButton();
}

function toggleStarter(id) {
    players.forEach(p => p.isStarter = p.id === id);
    renderPlayerList();
}

function renderPlayerList() {
    const list = document.getElementById('playerList');
    list.innerHTML = players.map(p => `
        <div class="player-item">
            <span>${p.name}</span>
            <div>
                <button class="starter-btn ${p.isStarter ? 'selected' : ''}" 
                        onclick="toggleStarter(${p.id})">
                    ${p.isStarter ? 'Anwurf' : 'Anwurf wählen'}
                </button>
                <button class="remove-btn" onclick="removePlayer(${p.id})">X</button>
            </div>
        </div>
    `).join('');
}

function updateStartButton() {
    const isValid = players.length >= 2 && 
        (document.getElementById('lifePointsOption').value !== 'custom' || 
         document.getElementById('customLifePoints').value >= 100);
    document.getElementById('startGame').disabled = !isValid;
}

function startGame() {
    baseLife = document.getElementById('lifePointsOption').value === 'custom' 
        ? parseInt(document.getElementById('customLifePoints').value) 
        : 1000;

    const starterIndex = players.findIndex(p => p.isStarter);
    const gamePlayers = players.map(p => new Player(p.id, p.name, baseLife));
    
    if (starterIndex > 0) {
        const starter = gamePlayers.splice(starterIndex, 1)[0];
        gamePlayers.unshift(starter);
    }

    players = gamePlayers;
    currentPlayerIndex = 0;
    history = [];

    document.getElementById('setup-screen').classList.add('hidden');
    document.querySelector('.game-container').classList.remove('hidden');
    renderGame();
    document.getElementById('scoreInput').focus();
}

function renderGame() {
    const container = document.querySelector('.players-container');
    container.innerHTML = players.map((p, index) => `
        <div class="player ${index === currentPlayerIndex ? 'active-player' : ''}">
            <h3>${p.name} <span class="leg-counter">(${p.legs} Legs)</span></h3>
            <div class="life-container">
                <div class="life-header">
                    <span>Lebenspunkte</span>
                    <span>${p.life}</span>
                </div>
                <div class="life-bar">
                    <div class="life-progress" style="width: ${(p.life / baseLife * 100)}%"></div>
                </div>
            </div>
            <div class="score-info">
                <div class="score-item">
                    <div class="score-label">Letzter Wurf</div>
                    <div class="score-value" style="${p.lastScore < p.previousScore ? 'text-decoration: line-through; color: #e74c3c;' : ''}">
                        ${p.lastScore}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function handleThrow() {
    const input = document.getElementById('scoreInput');
    const points = parseInt(input.value);
    const currentPlayer = players[currentPlayerIndex];

    if (isNaN(points) || points < 0 || points > 180) {
        alert("Ungültige Eingabe! Nur Zahlen zwischen 0-180 erlaubt.");
        return;
    }

    // Historien-Speicherung
    history.push({
        players: JSON.parse(JSON.stringify(players)), // Deep copy
        currentPlayerIndex: currentPlayerIndex
    });

    currentPlayer.lastScore = points;

    // Neue Schadenslogik
    if (points === 180) {
        currentPlayer.previousScore = 0;
    } else if (points > currentPlayer.previousScore) {
        currentPlayer.previousScore = points;
    } else {
        const damage = currentPlayer.previousScore - points;
        currentPlayer.life = Math.max(0, currentPlayer.life - damage);
        currentPlayer.previousScore = points;
        
        if (currentPlayer.life === 0) {
            handleLegResult(currentPlayer);
            return;
        }
    }

    input.value = '';
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    renderGame();
}

function undoLastThrow() {
    if (history.length === 0) return;

    const lastState = history.pop();
    players = lastState.players.map(p => {
        const player = new Player(p.id, p.name, p.life);
        player.lastScore = p.lastScore;
        player.previousScore = p.previousScore;
        player.legs = p.legs;
        return player;
    });
    currentPlayerIndex = lastState.currentPlayerIndex;
    renderGame();
}

function handleLegResult(loser) {
    const winners = players.filter(p => p !== loser);
    winners.forEach(p => p.legs++);
    const winnerNames = winners.map(p => p.name).join(' & ');

    const continueHTML = `
        <div class="leg-result-overlay">
            <div class="leg-result-box">
                <h2>Leg beendet!</h2>
                <div class="winner-text">🏆 ${winnerNames} gewinnt!</div>
                <button id="continueBtn" class="continue-btn">Weiter (Enter)</button>
            </div>
        </div>
    `;

    document.getElementById('scoreInput').value = '';
    document.body.insertAdjacentHTML('beforeend', continueHTML);
    
    document.getElementById('continueBtn').focus();
    document.addEventListener('keypress', handleContinueKey);
    document.getElementById('continueBtn').addEventListener('click', startNewLeg);
}

function handleContinueKey(e) {
    if (e.key === 'Enter') {
        startNewLeg();
    }
}

function startNewLeg() {
    history = [];
    players.forEach(p => {
        p.life = baseLife;
        p.lastScore = 0;
        p.previousScore = 0;
    });
    
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
    document.querySelector('.leg-result-overlay')?.remove();
    document.removeEventListener('keypress', handleContinueKey);
    renderGame();
    document.getElementById('scoreInput').focus();
}

function resetGame() {
    players = [];
    playerCounter = 1;
    currentPlayerIndex = 0;
    history = [];
    document.querySelector('.game-container').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}