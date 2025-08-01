//---------------------------- Data ----------------------------//
const imageFiles = [
  'image/Liam_Livingstone_All Rounder.png',
  'image/Lungisani_Ngidi_Bowler.png',
  'image/Manoj_Bhandage_All Rounder.png',
  'image/Mayank_Agarwal_Batter.png',
  'image/Mohit_Rathee_Bowler.png',
  'image/Nuwan_Thushara_Bowler.png',
  'image/Phil_Salt_WK-Batter.png',
  'image/Rajat_Patidar_Batter.png',
  'image/Rasikh_Dar_Bowler.png',
  'image/Romario_Shepherd_All Rounder.png',
  'image/Suyash_Sharma_Bowler.png',
  'image/Swapnil_Singh_All Rounder.png',
  'image/Swastik_Chhikara_Batter.png',
  'image/Tim_David_All Rounder.png',
  'image/Tim_Seifert_WK-Batter.png',
  'image/Virat_Kohli_Batter.png',
  'image/Yash_Dayal_Bowler.png',
  'image/Abhinandan_Singh_Bowler.png',
  'image/Bhuvneshwar_Kumar_Bowler.png',
  'image/Blessing_Muzarabani_Bowler.png',
  'image/Jitesh_Sharma_WK-Batter.png',
  'image/Josh_Hazlewood_Bowler.png',
  'image/Krunal_Pandya_All Rounder.png'
];

const allTeams = ["CSK", "MI", "RCB", "KKR", "SRH", "DC", "PBKS", "RR", "LSG", "GT"];
const teamLogos = {
  "CSK": "logos/CSK.PNG",
  "MI": "logos/MI.PNG",
  "RCB": "logos/RCB.PNG",
  "KKR": "logos/KKR.PNG",
  "SRH": "logos/SRH.PNG",
  "DC": "logos/DC.PNG",
  "PBKS": "logos/PBKS.PNG",
  "RR": "logos/RR.PNG",
  "LSG": "logos/LSG.PNG",
  "GT": "logos/GT.PNG"
};

//---------------------------- Game State ----------------------------//
let players = [];
let scoreboard = {};
let currentPlayerName = "";
let remainingCards = [];
let bidCount = 0;
let playerIndex = -1;
let highestBid = 0;
let highestBidder = "";
let timerInterval, timeLeft;
let playerOneTeam = "Player 1";
let selectedTeam = null;

//---------------------------- Utilities ----------------------------//
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
function clearHighlight() {
  document.querySelectorAll('.log-entry').forEach(e => e.classList.remove('highlight'));
}

//---------------------------- Logging ----------------------------//
function logBid(who, bidAmount, didBid = true) {
  const logPanel = document.getElementById("logPanel");
  const entry = document.createElement("div");
  entry.className = "log-entry";

  if (didBid) {
    entry.textContent = `💰 ${who} bid $${bidAmount} for ${currentPlayerName}`;
    if (bidAmount > highestBid) {
      highestBid = bidAmount;
      highestBidder = who;
      clearHighlight();
      entry.classList.add('highlight');
    }
  } else {
    entry.textContent = `⏭️ ${who} skipped bidding`;
  }
  logPanel.prepend(entry);
}

//---------------------------- Timer ----------------------------//
function updateTimerUI() {
  document.getElementById("bidTimer").textContent = `⏳ Time left: ${timeLeft}s`;
  document.getElementById("timerFill").style.width = `${(timeLeft / 10) * 100}%`;
}
function startTimer() {
  timeLeft = 10;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      skipBid();
    }
  }, 1000);
}

//---------------------------- Bidding ----------------------------//
function playerBid(name) {
  document.getElementById("modalPrompt").textContent = `${name}, bid for ${currentPlayerName}`;
  document.getElementById("bidInput").value = '';
  document.getElementById("bidModal").style.display = "block";
  startTimer();
}
function submitBid() {
  clearInterval(timerInterval);
  const val = parseFloat(document.getElementById("bidInput").value);
  bidCount++;
  document.getElementById("bidModal").style.display = "none";
  if (!val || isNaN(val)) logBid(playerOneTeam, 0, false);
  else logBid(playerOneTeam, val, true);
  nextTurn();
}
function skipBid() {
  clearInterval(timerInterval);
  bidCount++;
  document.getElementById("bidModal").style.display = "none";
  logBid(playerOneTeam, 0, false);
  nextTurn();
}
function computerBid(name) {
  bidCount++;
  const willBid = Math.random() > 0.5;
  const bid = willBid ? Math.floor(Math.random() * 500 + 100) : 0;
  logBid(name, bid, willBid);
  setTimeout(nextTurn, 500);
}
function nextTurn() {
  if (bidCount >= players.length) {
    if (!highestBidder) {
      bidCount = 0;
      playerBid(playerOneTeam);
    } else announceWinner();
    return;
  }
  playerIndex = (playerIndex + 1) % players.length;
  const player = players[playerIndex];
  if (player === playerOneTeam) playerBid(playerOneTeam);
  else computerBid(player);
}

//---------------------------- Winner ----------------------------//
function announceWinner() {
  const result = document.getElementById("winnerDisplay");
  if (highestBidder) {
    result.textContent = `🏆 ${highestBidder} wins ${currentPlayerName} for $${highestBid}`;
    scoreboard[highestBidder].push({ name: currentPlayerName, bid: highestBid });
  } else result.textContent = `❌ No bids for ${currentPlayerName}`;

  updateScoreboard();
  setTimeout(() => {
    if (remainingCards.length > 0) generateNextCard();
    else result.textContent = "🎉 Game Over!";
  }, 3000);
}

//---------------------------- Scoreboard ----------------------------//
function updateScoreboard() {
  const container = document.getElementById("gridContainer");
  container.innerHTML = '';

  players.forEach(p => {
    const box = document.createElement("div");
    box.className = "player-box";

    // --- Team Header ---
    const header = document.createElement("div");
    header.className = "team-header";

    const logo = document.createElement("img");
    logo.src = teamLogos[p] || "logos/default.png";
    logo.alt = p;
    logo.width = 32;
    logo.height = 32;

    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = p;

    header.appendChild(logo);
    header.appendChild(name);
    box.appendChild(header);

    // --- Bought Players ---
    scoreboard[p].forEach(entry => {
      const card = document.createElement("div");
      card.className = "card-entry";
      card.textContent = `🃏 ${entry.name} - $${entry.bid}`;
      box.appendChild(card);
    });

    container.appendChild(box);
  });
}

//---------------------------- Cards ----------------------------//
function generateNextCard() {
  const container = document.getElementById("cardContainer");
  container.innerHTML = '';
  document.getElementById("winnerDisplay").textContent = '';

  const nextCard = remainingCards.pop();
  currentPlayerName = nextCard.split('/').pop().replace('.png', '').replaceAll('_', ' ');

  const card = document.createElement("div");
  card.className = "rounded-card";

  const img = document.createElement("img");
  img.src = nextCard;

  const name = document.createElement("div");
  name.className = "card-name";
  name.textContent = currentPlayerName;

  card.appendChild(img);
  card.appendChild(name);
  container.appendChild(card);

  playerIndex = -1;
  bidCount = 0;
  highestBid = 0;
  highestBidder = '';

  nextTurn();
}

//---------------------------- Team Selection ----------------------------//
function showTeamSelection() {
  const teamListDiv = document.getElementById("teamList");
  teamListDiv.innerHTML = '';

  allTeams.forEach(team => {
    const card = document.createElement("div");
    card.className = "team-card";
    card.onclick = () => selectTeam(team, card);

    const logo = document.createElement("img");
    logo.src = teamLogos[team];
    logo.alt = team;
    logo.width = 32;
    logo.height = 32;

    const name = document.createElement("div");
    name.textContent = team;
    name.className = "team-name";

    card.appendChild(logo);
    card.appendChild(name);
    teamListDiv.appendChild(card);
  });

  document.getElementById("teamSelectModal").style.display = "block";
}
function selectTeam(team, cardElement) {
  selectedTeam = team;
  document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
  cardElement.classList.add("selected");
}
function confirmTeam() {
  if (!selectedTeam) {
    alert("Please select a team");
    return;
  }
  playerOneTeam = selectedTeam;
  players = [playerOneTeam, ...allTeams.filter(t => t !== playerOneTeam)];
  scoreboard = {};
  players.forEach(p => scoreboard[p] = []);
  document.getElementById("teamSelectModal").style.display = "none";
  startGame();
}

//---------------------------- Game Start ----------------------------//
function startGame() {
  remainingCards = shuffleArray([...imageFiles]);
  generateNextCard();
}

//---------------------------- Entry ----------------------------//
showTeamSelection();
