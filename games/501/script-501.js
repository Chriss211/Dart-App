let players = [];
let currentPlayerIndex = 0;
let startingPlayerIndex = 0; // Spieler, der das nächste Leg beginnt
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
            legsWon: 0,
            totalPoints: 0, // Gesamtpunkte für den Durchschnitt
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
            <span>${player.name} (Legs: ${player.legsWon})</span>
            <button class="remove-btn" onclick="removePlayer(${index})">Entfernen</button>
            <button class="change-starter-btn ${index === startingPlayerIndex ? 'selected' : ''}" onclick="setStartingPlayer(${index})">Anwurf</button>
        </div>
    `).join('');
}

function removePlayer(index) {
    players.splice(index, 1);
    updatePlayerList();
    document.getElementById('startGame').disabled = players.length === 0;
}

function setStartingPlayer(index) {
    startingPlayerIndex = index;
    updatePlayerList();
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
            <div class="average">Avg.: ${calculateAverage(player)}</div>
            <div class="legs">Gewonnene Legs: ${player.legsWon}</div>
            <table>
                <thead>
                    <tr><th>Score</th><th>Verbleibend</th></tr>
                </thead>
                <tbody>
                    <tr><td>-</td><td class="current-score">501</td></tr>
                </tbody>
            </table>
        </div>
    `).join('');

    currentPlayerIndex = startingPlayerIndex; // Startspieler setzen
    updateCurrentPlayer();
    document.getElementById('scoreInput').focus();
}

document.getElementById('submitScore').addEventListener('click', addScore);
document.getElementById('scoreInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addScore();
});

document.getElementById('undoBtn').addEventListener('click', undoLastScore);

function addScore() {
    const input = document.getElementById('scoreInput');
    const points = parseInt(input.value);
    const currentPlayer = players[currentPlayerIndex];
    const currentTable = document.getElementById(`player-${currentPlayerIndex}`);

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
    currentPlayer.totalPoints += points; // Gesamtpunkte aktualisieren

    // Update Tabelle
    updateTable(currentTable, currentPlayer);

    // Gewinnbedingung
    if (newScore === 0) {
        currentPlayer.legsWon++; // Leg-Zähler erhöhen
        resetLeg();
        return;
    }

    // Nächster Spieler
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateCurrentPlayer();
    input.value = ''; // Eingabefeld leeren
    input.focus();
}

function updateTable(table, player) {
    const tableBody = table.querySelector('tbody');
    
    // Neue Zeile am Ende einfügen
    const newRow = tableBody.insertRow();
    newRow.innerHTML = `
        <td>${player.history[player.history.length - 1]}</td>
        <td>${player.score}</td>
    `;

    // Alle Zeilen durchstreichen (außer letzter)
    const rows = tableBody.rows;
    for (let i = 0; i < rows.length - 1; i++) {
        rows[i].cells[0].classList.add('strikethrough');
        rows[i].cells[1].classList.add('strikethrough');
    }

    // Letzte Zeile hervorheben
    const lastRow = rows[rows.length - 1];
    lastRow.cells[1].classList.add('current-score');
    lastRow.cells[1].style.color = player.color;

    // Durchschnitt aktualisieren
    table.querySelector('.average').textContent = `Avg.: ${calculateAverage(player)}`;
}

function calculateAverage(player) {
    return player.history.length > 0 
        ? (player.totalPoints / player.history.length).toFixed(2) 
        : '-';
}

function undoLastScore() {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.history.length === 0) return;

    const lastScore = currentPlayer.history.pop();
    currentPlayer.score += lastScore;
    currentPlayer.totalPoints -= lastScore;

    const currentTable = document.getElementById(`player-${currentPlayerIndex}`);
    updateTable(currentTable, currentPlayer);
}

function updateCurrentPlayer() {
    document.querySelectorAll('.player-table').forEach(table => 
        table.style.transform = 'scale(1)');
    
    const currentTable = document.getElementById(`player-${currentPlayerIndex}`);
    currentTable.style.transform = 'scale(1.05)';
    document.getElementById('current-player').textContent = 
        `${players[currentPlayerIndex].name} ist am Zug`;
}

function resetLeg() {
    players.forEach(player => {
        player.score = 501;
        player.history = [];
    });

    // Anwurf wechseln
    startingPlayerIndex = (startingPlayerIndex + 1) % players.length;
    currentPlayerIndex = startingPlayerIndex;

    // UI aktualisieren
    initGame();
    document.getElementById('scoreInput').value = ''; // Eingabefeld leeren
    document.getElementById('scoreInput').focus();
}

document.getElementById('resetGame').addEventListener('click', () => {
    players = [];
    currentPlayerIndex = 0;
    startingPlayerIndex = 0;
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('player-setup').style.display = 'block';
    document.getElementById('player-list').innerHTML = '';
    document.getElementById('playerNameInput').focus();
});