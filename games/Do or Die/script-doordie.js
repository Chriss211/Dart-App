class Player {
    constructor(id) {
        this.id = id;
        this.life = 1000;
        this.currentScore = 0;
        this.previousScore = 0;
    }
}

let players = [];
let currentPlayerIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    initializeGame(2); // Standardmäßig 2 Spieler
    document.getElementById('throwBtn').addEventListener('click', handleThrow);
    document.getElementById('resetGame').addEventListener('click', () => initializeGame(2));
    document.getElementById('scoreInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleThrow();
    });
});

function initializeGame(numPlayers) {
    players = Array.from({length: numPlayers}, (_, i) => new Player(i + 1));
    currentPlayerIndex = 0;
    renderPlayers();
    updateActivePlayer();
}

function renderPlayers() {
    const container = document.querySelector('.players-container');
    container.innerHTML = players.map(player => `
        <div class="player" id="player-${player.id}">
            <h3>Spieler ${player.id}</h3>
            <div class="life-bar">
                <div class="life-progress" style="width: ${(player.life/10)}%"></div>
            </div>
            <div class="current-score">${player.currentScore}</div>
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
    
    if (points > currentPlayer.previousScore) {
        currentPlayer.currentScore += points;
        currentPlayer.previousScore = points;
    } else {
        const damage = currentPlayer.previousScore - points;
        currentPlayer.life = Math.max(0, currentPlayer.life - damage);
        currentPlayer.currentScore = 0;
        currentPlayer.previousScore = 0;
        
        if (currentPlayer.life === 0) {
            if (confirm(`Spieler ${currentPlayer.id} hat verloren! Neues Spiel?`)) {
                initializeGame(2);
            }
            return;
        }
    }

    input.value = '';
    renderPlayers();
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateActivePlayer();
}