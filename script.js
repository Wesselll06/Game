// Stats (placeholder)
let player = { name: "Jouw Draak", hp: 100, maxHp: 100 };
let enemy = { name: "Vijand", hp: 100, maxHp: 100 };

// Update HP bar
function updateHP() {
  document.getElementById("player-hp").style.width = (player.hp / player.maxHp * 100) + "%";
  document.getElementById("enemy-hp").style.width = (enemy.hp / enemy.maxHp * 100) + "%";
}

// Speler aanval
function attack(type) {
  let damage = 0;
  if (type === "fire") {
    damage = Math.floor(Math.random() * 15) + 5; // 5-20
  } else if (type === "water") {
    damage = Math.floor(Math.random() * 10) + 10; // 10-20
  }

  enemy.hp = Math.max(0, enemy.hp - damage);
  updateHP();

  if (enemy.hp <= 0) {
    return;
  }

  // Enemy beurt
  setTimeout(enemyTurn, 1000);
}

// Enemy aanval
function enemyTurn() {
  let damage = Math.floor(Math.random() * 12) + 8; // 8-20
  player.hp = Math.max(0, player.hp - damage);
  updateHP();

  if (player.hp <= 0) {
  }
}

// Init
updateHP();

