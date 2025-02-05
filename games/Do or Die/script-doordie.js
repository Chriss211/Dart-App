class PlayerConfig {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.isStarter = false;
    }
}

class Player {
    constructor(id, name, life) {
        this.id = id;
        this.name = name;
        this.life = life;
        this.lastScore = 0;
        this.previousScore = 0;
    }
}

let playersConfig = [];
let playerCounter = 1;
let players = [];
let currentPlayerIndex = 0;
let baseLifePoints = 1000;

document.addEventListener('DOMContentLoaded', () => {
    // Setup Event-Listener
    document.getElementById('playerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });

    document.getElementById('lifePointsOption').addEventListener('change', function() {
        document.getElementById('customLifeContainer').style.display = 
            this.value === 'custom' ? 'block' : 'none';
    });

    document.getElementById('startGame').addEventListener('click', startGame);
    document.getElementById('throwBtn').addEventListener('click', handleThrow);
    document.getElementById('resetGame').addEventListener('click', resetGame);
    document.getElementById('scoreInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleThrow();
    });
});

function addPlayer() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim();
    
    if (name && playersConfig.length < 8) {
        const player = new PlayerConfig(playerCounter++, name);
        playersConfig.push(player);
        if (playersConfig.length === 1) player.isStarter = true;
        renderPlayerList();
        nameInput.value = '';
        nameInput.focus();
        updateStartButton();
    }
}

function removePlayer(id) {
    playersConfig = playersConfig.filter(p => p.id !== id);
    if (playersConfig.length > 0 && !playersConfig.some(p => p.isStarter)) {
        playersConfig[0].isStarter = true;
    }
    renderPlayerList();
    updateStartButton();
}

function toggleStarter(id) {
    playersConfig.forEach(p => p.isStarter = p.id === id);
    renderPlayerList();
}

function renderPlayerList() {
    const list = document.getElementById('playerList');
    list.innerHTML = playersConfig.map(p => `
        <div class="player-item">
            <span>${p.name}</span>
            <div>
                <button class="starter-btn ${p.isStarter ? 'selected' : ''}" 
                        onclick="toggleStarter(${p.id})">
                    ${p.isStarter ? '🎯 Anwurf' : 'Anwurf wählen'}
                </button>
                <button class="remove-btn" onclick="removePlayer(${p.id})">✖</button>
            </div>
        </div>
    `).join('');
}

function updateStartButton() {
    const startBtn = document.getElementById('startGame');
    const lifeOption = document.getElementById('lifePointsOption').value;
    const customLife = parseInt(document.getElementById('customLifePoints').value);
    
    const validCustomLife = lifeOption !== 'custom' || (customLife >= 100 && !isNaN(customLife));
    startBtn.disabled = playersConfig.length < 2 || 
                       !playersConfig.some(p => p.isStarter) || 
                       !validCustomLife;
}

function startGame() {
    const lifeOption = document.getElementById('lifePointsOption').value;
    const customLife = parseInt(document.getElementById('customLifePoints').value);
    
    baseLifePoints = lifeOption === 'custom' && !isNaN(customLife) ? customLife : 1000;

    if (playersConfig.length < 2) {
        alert('Mindestens 2 Spieler benötigt!');
        return;
    }
    
    const starterIndex = playersConfig.findIndex(p => p.isStarter);
    players = playersConfig.map(p => new Player(
        p.id,
        p.name,
        baseLifePoints
    ));
    
    if (starterIndex > 0) {
        const starter = players.splice(starterIndex, 1)[0];
        players.unshift(starter);
    }
    
    document.getElementById('setup-screen').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
    currentPlayerIndex = 0;
    renderPlayers();
    updateActivePlayer();
    document.getElementById('scoreInput').focus();
}

function resetGame() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'flex';
    playersConfig = [];
    playerCounter = 1;
    renderPlayerList();
    updateStartButton();
}

function renderPlayers() {
    const container = document.querySelector('.players-container');
    container.innerHTML = players.map(player => `
        <div class="player" id="player-${player.id}">
            <h3>${player.name}</h3>
            <div class="life-bar">
                <div class="life-progress" style="width: ${(player.life/baseLifePoints*100)}%"></div>
            </div>
            <div class="last-score">Letzter Wurf: ${player.lastScore}</div>
            <div>Lebenspunkte: ${player.life}</div>
        </div>
    `).join('');
}

function updateActivePlayer() {
    document.querySelectorAll('.player').forEach((el, i) => {
        el.classList.toggle('active-player', i === currentPlayerIndex);
    });
}

function handleThrow() {
    const input = document.getElementById('scoreInput');
    const points = parseInt(input.value);
    
    if (isNaN(points) || points < 0) {
        alert("Ungültige Eingabe!");
        return;
    }

    const currentPlayer = players[currentPlayerIndex];
    currentPlayer.lastScore = points;

    if (points > currentPlayer.previousScore) {
        currentPlayer.previousScore = points;
    } else {
        const damage = currentPlayer.previousScore - points;
        currentPlayer.life = Math.max(0, currentPlayer.life - damage);
        currentPlayer.previousScore = 0;
        
        if (currentPlayer.life === 0) {
            if (confirm(`${currentPlayer.name} hat verloren! Neues Spiel?`)) {
                resetGame();
            }
            return;
        }
    }

    input.value = '';
    renderPlayers();
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateActivePlayer();
}