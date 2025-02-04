let players = [];
let currentPlayerIndex = 0;
const colors = ["#2196F3", "#f44336", "#4CAF50", "#FFC107"];

// ========== SPIELER-VERWALTUNG ==========
document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPlayer();
});

document.getElementById('addPlayerBtn').addEventListener('click', addPlayer);

function addPlayer() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    
    if (name) {
        players.push({
            name: name,
            score: 501,
            history: [],
            color: colors[players.length % colors.length]
        });
        updatePlayerList();
        nameInput.value = '';
        nameInput.focus();
        document.getElementById('startGame').disabled = false;
    }
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = players.map((player, index) => `
        <div class="player-item">
            <span>${player.name}</span>
            <button class="remove-btn" onclick="removePlayer(${index})">Entfernen</button>
        </div>
    `).join('');
}

function removePlayer(index) {
    players.splice(index, 1);
    updatePlayerList();
    document.getElementById('startGame').disabled = players.length === 0;
}

// ========== SPIEL-LOGIK ==========
document.getElementById('startGame').addEventListener('click', () => {
    document.getElementById('player-setup').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    initGame();
});

function initGame() {
    const container = document.getElementById('tables-container');
    container.innerHTML = players.map((player, index) => `
        <div class="player-table player-table-${index % colors.length}" id="player-${index}">
            <h3 style="color: ${player.color}">${player.name}</h3>
            <table>
                <thead>
                    <tr><th>Verbleibend</th><th>Score</th></tr>
                </thead>
                <tbody>
                    <tr><td class="current-score">501</td><td>-</td></tr>
                </tbody>
            </table>
        </div>
    `).join('');

    updateCurrentPlayer();
    document.getElementById('scoreInput').focus();
}

document.getElementById('submitScore').addEventListener('click', addScore);
document.getElementById('scoreInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addScore();
});

function addScore() {
    const input = document.getElementById('scoreInput');
    const points = parseInt(input.value);
    const currentPlayer = players[currentPlayerIndex];

    if (isNaN(points) || points < 0) {
        alert("Ungültige Eingabe!");
        return;
    }

    const previousScore = currentPlayer.score;
    const newScore = previousScore - points;
    
    // Überprüfung auf ungültigen Wurf
    if (newScore < 0 || newScore === 1) {
        alert("Ungültiger Wurf! Score bleibt unverändert.");
        return;
    }

    // Update Spieler
    currentPlayer.history.push(points);
    currentPlayer.score = newScore;

    // Update Tabelle
    const tableBody = document.querySelector(`#player-${currentPlayerIndex} tbody`);
    
    // Neue Zeile unter der Kopfzeile einfügen
    const newRow = tableBody.insertRow(1);
    newRow.innerHTML = `
        <td class="strikethrough">${previousScore}</td>
        <td class="strikethrough">${points}</td>
    `;

    // Aktuelle Score-Zeile updaten (unten)
    const lastRow = tableBody.rows[tableBody.rows.length - 1];
    lastRow.innerHTML = `
        <td class="current-score" style="color: ${currentPlayer.color}">${newScore}</td>
        <td>-</td>
    `;

    // Gewinnbedingung
    if (newScore === 0) {
        alert(`${currentPlayer.name} hat gewonnen! 🎉`);
        resetGame();
        return;
    }

    // Nächster Spieler
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
    input.value = '';
    input.focus();
}

function updateCurrentPlayer() {
    document.querySelectorAll('.player-table').forEach(table => 
        table.style.transform = 'scale(1)');
    
    const currentTable = document.getElementById(`player-${currentPlayerIndex}`);
    currentTable.style.transform = 'scale(1.05)';
    document.getElementById('current-player').textContent = 
        `${players[currentPlayerIndex].name} ist am Zug`;
}

document.getElementById('resetGame').addEventListener('click', resetGame);

function resetGame() {
    players = [];
    currentPlayerIndex = 0;
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('player-setup').style.display = 'block';
    document.getElementById('player-list').innerHTML = '';
    document.getElementById('playerNameInput').focus();
}