const imageFiles = [
  'images/liam_livingstone_all_rounder.png',
  'images/lungisani_ngidi_bowler.png',
  'images/manoj_bhandage_all_rounder.png',
  'images/mayank_agarwal_batter.png',
  'images/mohit_rathee_bowler.png',
  'images/nuwan_thushara_bowler.png',
  'images/phil_salt_wk-batter.png',
  'images/rajat_patidar_batter.png',
  'images/rasikh_dar_bowler.png',
  'images/romario_shepherd_all_rounder.png',
  'images/suyash_sharma_bowler.png',
  'images/swapnil_singh_all_rounder.png',
  'images/swastik_chhikara_batter.png',
  'images/tim_david_all_rounder.png',
  'images/tim_seifert_wk-batter.png',
  'images/virat_kohli_batter.png',
  'images/yash_dayal_bowler.png',
  'images/abhinandan_singh_bowler.png',
  'images/bhuvneshwar_kumar_bowler.png',
  'images/blessing_muzarabani_bowler.png',
  'images/jitesh_sharma_wk-batter.png',
  'images/josh_hazlewood_bowler.png',
  'images/krunal_pandya_all_rounder.png'
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
