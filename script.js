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

const players = [
  "Player 1",  // Human player
  "CSK",       // Chennai Super Kings
  "MI",        // Mumbai Indians
  "RCB",       // Royal Challengers Bangalore
  "KKR",       // Kolkata Knight Riders
  "SRH",       // Sunrisers Hyderabad
  "DC",        // Delhi Capitals
  "PBKS",      // Punjab Kings
  "RR",        // Rajasthan Royals
  "LSG",        // Lucknow Super Giants
  "GT"
];
const scoreboard = {};
players.forEach(p => scoreboard[p] = []);

let currentPlayerName = "";
let remainingCards = [];
let bidCount = 0;
let playerIndex = -1;
let highestBid = 0;
let highestBidder = "";
let timerInterval, timeLeft;

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function clearHighlight() {
  document.querySelectorAll('.log-entry').forEach(e => e.classList.remove('highlight'));
}

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
  if (!val || isNaN(val)) {
    logBid("Player 1", 0, false);
  } else {
    logBid("Player 1", val, true);
  }
  nextTurn();
}

function skipBid() {
  clearInterval(timerInterval);
  bidCount++;
  document.getElementById("bidModal").style.display = "none";
  logBid("Player 1", 0, false);
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
      playerBid("Player 1");
    } else {
      announceWinner();
    }
    return;
  }

  playerIndex = (playerIndex + 1) % players.length;
  const player = players[playerIndex];

  if (player === "Player 1") {
    playerBid(player);
  } else {
    computerBid(player);
  }
}

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
    if (remainingCards.length > 0) {
      generateNextCard();
    } else {
      result.textContent = "🎉 Game Over!";
    }
  }, 3000);
}

function updateScoreboard() {
  const container = document.getElementById("gridContainer");
  container.innerHTML = '';

  players.forEach(p => {
    const box = document.createElement("div");
    box.className = "player-box";

    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = p;

    box.appendChild(name);

    scoreboard[p].forEach(entry => {
      const card = document.createElement("div");
      card.className = "card-entry";
      card.textContent = `🃏 ${entry.name} - $${entry.bid}`;
      box.appendChild(card);
    });

    container.appendChild(box);
  });
}

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

function startGame() {
  remainingCards = shuffleArray([...imageFiles]);
  generateNextCard();
}

startGame();
