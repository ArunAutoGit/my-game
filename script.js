// ---------------------------- Game Data ---------------------------- //
const imageFiles = [
  'image/Liam_Livingstone_All Rounder.png','image/Lungisani_Ngidi_Bowler.png',
  'image/Manoj_Bhandage_All Rounder.png','image/Mayank_Agarwal_Batter.png',
  'image/Mohit_Rathee_Bowler.png','image/Nuwan_Thushara_Bowler.png',
  'image/Phil_Salt_WK-Batter.png','image/Rajat_Patidar_Batter.png',
  'image/Rasikh_Dar_Bowler.png','image/Romario_Shepherd_All Rounder.png',
  'image/Suyash_Sharma_Bowler.png','image/Swapnil_Singh_All Rounder.png',
  'image/Swastik_Chhikara_Batter.png','image/Tim_David_All Rounder.png',
  'image/Tim_Seifert_WK-Batter.png','image/Virat_Kohli_Batter.png',
  'image/Yash_Dayal_Bowler.png','image/Abhinandan_Singh_Bowler.png',
  'image/Bhuvneshwar_Kumar_Bowler.png','image/Blessing_Muzarabani_Bowler.png',
  'image/Jitesh_Sharma_WK-Batter.png','image/Josh_Hazlewood_Bowler.png',
  'image/Krunal_Pandya_All Rounder.png'
];

const allTeams = ["CSK","MI","RCB","KKR","SRH","DC","PBKS","RR","LSG","GT"];
const teamLogos = {
  "CSK":"logos/CSK.PNG","MI":"logos/MI.PNG","RCB":"logos/RCB.PNG","KKR":"logos/KKR.PNG",
  "SRH":"logos/SRH.PNG","DC":"logos/DC.PNG","PBKS":"logos/PBKS.PNG","RR":"logos/RR.PNG",
  "LSG":"logos/LSG.PNG","GT":"logos/GT.PNG"
};

// ---------------------------- Variables ---------------------------- //
let humanPlayers = [];
let players = [];
let playerTeams = {};   // player -> team
let scoreboard = {};
let remainingCards = [];
let currentPlayerName = "";
let playerIndex = -1;
let bidCount = 0;
let highestBid = 0;
let highestBidder = "";
let timerInterval, timeLeft;
let joinTimer = 30;
let joinInterval;
let selectedTeam = null;
const maxPlayers = 4;
let joinedFromThisDevice = false; // only one join from device

// ---------------------------- Utilities ---------------------------- //
const shuffleArray = arr => arr.sort(() => Math.random() - 0.5);
const clearHighlight = () =>
  document.querySelectorAll('.log-entry').forEach(e => e.classList.remove('highlight'));

// ---------------------------- Lobby ---------------------------- //
function waitForPlayers() {
  joinInterval = setInterval(() => {
    joinTimer--;
    document.getElementById("joinTimer").textContent = `⏳ Time left: ${joinTimer}s`;
    if (joinTimer <= 0 || humanPlayers.length >= maxPlayers) {
      clearInterval(joinInterval);
      showTeamSelection(); // show team selection instead of directly finalizing
    }
  }, 1000);
}

function addHumanPlayer() {
  if (joinedFromThisDevice) return;
  const playerName = `Player_${humanPlayers.length + 1}`;
  humanPlayers.push(playerName);
  joinedFromThisDevice = true;
  document.getElementById("joinStatus").textContent =
    `${playerName} joined (${humanPlayers.length}/${maxPlayers})`;
}

function finalizePlayers() {
  // Ensure human player slot exists
  if (players.length === 0) players = [humanPlayers[0]];

  // Fill remaining slots with AI teams
  const availableTeams = allTeams.filter(t => t !== selectedTeam);
  shuffleArray(availableTeams);
  while (players.length < maxPlayers) {
    const team = availableTeams.pop();
    players.push(team);
    playerTeams[team] = team;
  }

  // Assign human player's selected team
  if (selectedTeam) {
    playerTeams[humanPlayers[0]] = selectedTeam;
  }

  // Initialize scoreboard
  players.forEach(p => scoreboard[p] = []);

  document.getElementById("lobbySection").style.display = "none";
  document.getElementById("gameSection").style.display = "block";
  startGame();
}

// ---------------------------- Team Selection ---------------------------- //
function showTeamSelection() {
  const teamListDiv = document.getElementById("teamList");
  teamListDiv.innerHTML = '';
  allTeams.forEach(team => {
    const card = document.createElement("div");
    card.className = "team-card";
    card.onclick = () => selectTeam(team, card);
    card.innerHTML = `<img src="${teamLogos[team]}" width="32" height="32"><div>${team}</div>`;
    teamListDiv.appendChild(card);
  });
  document.getElementById("teamSelectModal").style.display = "block";
}

function selectTeam(team, card) {
  selectedTeam = team;
  document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
}

function confirmTeam() {
  if (!selectedTeam) return alert("Please select a team");
  playerTeams[humanPlayers[0]] = selectedTeam;
  document.getElementById("teamSelectModal").style.display = "none";
  finalizePlayers(); // finalize after team selection
}

// ---------------------------- Game Flow ---------------------------- //
function startGame() {
  remainingCards = shuffleArray([...imageFiles]);
  generateNextCard();
}

function generateNextCard() {
  const container = document.getElementById("cardContainer");
  container.innerHTML = '';
  document.getElementById("winnerDisplay").textContent = '';

  const nextCard = remainingCards.pop();
  currentPlayerName = nextCard.split('/').pop().replace('.png','').replaceAll('_',' ');

  container.innerHTML = `
    <div class="rounded-card">
      <img src="${nextCard}" />
      <div class="card-name">${currentPlayerName}</div>
    </div>`;

  playerIndex = -1;
  bidCount = 0;
  highestBid = 0;
  highestBidder = '';
  nextTurn();
}

function nextTurn() {
  if (bidCount >= players.length) return announceWinner();

  playerIndex = (playerIndex + 1) % players.length;
  const currentTurnPlayer = players[playerIndex];

  if (currentTurnPlayer === humanPlayers[0]) {
    // Local human player input
    playerBid(currentTurnPlayer);
  } else {
    // AI player
    computerBid(currentTurnPlayer);
  }
}

// ---------------------------- Bidding ---------------------------- //
function playerBid(name) {
  document.getElementById("modalPrompt").textContent = `${name}, bid for ${currentPlayerName}`;
  document.getElementById("bidInput").value = '';
  document.getElementById("bidModal").style.display = "block";
  startTimer();
}

function submitBid() {
  clearInterval(timerInterval);
  const val = parseFloat(document.getElementById("bidInput").value);
  document.getElementById("bidModal").style.display = "none";
  const bidAmount = !isNaN(val) && val > 0 ? val : 0;
  logBid(players[playerIndex], bidAmount, bidAmount > 0);
  bidCount++;
  nextTurn();
}

function skipBid() {
  clearInterval(timerInterval);
  document.getElementById("bidModal").style.display = "none";
  logBid(players[playerIndex], 0, false);
  bidCount++;
  nextTurn();
}

function computerBid(name) {
  const willBid = Math.random() > 0.5;
  const bid = willBid ? Math.floor(Math.random() * 500 + 100) : 0;
  logBid(name, bid, willBid);
  bidCount++;
  setTimeout(nextTurn, 500);
}

// ---------------------------- Timer ---------------------------- //
function startTimer() {
  timeLeft = 10;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) skipBid();
  }, 1000);
}

function updateTimerUI() {
  document.getElementById("bidTimer").textContent = `⏳ Time left: ${timeLeft}s`;
  document.getElementById("timerFill").style.width = `${(timeLeft / 10) * 100}%`;
}

// ---------------------------- Winner ---------------------------- //
function announceWinner() {
  const result = document.getElementById("winnerDisplay");
  if (highestBidder) {
    result.textContent = `🏆 ${highestBidder} wins ${currentPlayerName} for $${highestBid}`;
    scoreboard[highestBidder].push({ name: currentPlayerName, bid: highestBid });
  } else {
    result.textContent = `❌ No bids for ${currentPlayerName}`;
  }
  updateScoreboard();
  setTimeout(() => {
    if (remainingCards.length > 0) generateNextCard();
    else result.textContent = "🎉 Game Over!";
  }, 2000);
}

// ---------------------------- Scoreboard ---------------------------- //
function updateScoreboard() {
  const container = document.getElementById("gridContainer");
  container.innerHTML = '';
  players.forEach(p => {
    const teamName = playerTeams[p] || p;
    const box = document.createElement("div");
    box.className = "player-box";
    box.innerHTML = `
      <div class="team-header">
        <img src="${teamLogos[teamName] || "logos/default.png"}" width="32" height="32" />
        <div class="player-name">${teamName}</div>
      </div>`;
    scoreboard[p].forEach(entry => {
      const card = document.createElement("div");
      card.className = "card-entry";
      card.textContent = `🃏 ${entry.name} - $${entry.bid}`;
      box.appendChild(card);
    });
    container.appendChild(box);
  });
}

// ---------------------------- Log ---------------------------- //
function logBid(who, bidAmount, didBid = true) {
  const logPanel = document.getElementById("logPanel");
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = didBid
    ? `💰 ${who} bid $${bidAmount} for ${currentPlayerName}`
    : `⏭️ ${who} skipped bidding`;
  if (didBid && bidAmount >= highestBid) {
    highestBid = bidAmount;
    highestBidder = who;
    clearHighlight();
    entry.classList.add('highlight');
  }
  logPanel.prepend(entry);
}

// ---------------------------- Entry ---------------------------- //
waitForPlayers();
