// =========================
// Character definities (alle abilities hebben level)
// =========================
// =========================
// Character definities (volgens jouw nieuwe schema)
// =========================
const characters = {
    mario: {
        name: "Mario",
        hp: 1083,
        maxHp: 2600,
        stone: "Power",
        abilities: [
            { name: "Punch", level: 1, damage: 120 },
            { name: "Power Slam (Power Stone)", level: 3, damage: 140 },
            { name: "Ground Pound", level: 7, damage: 150 },
            { name: "Stone Smash (Power Stone)", level: 11, damage: 200 }
        ],
        image: "Mario_sideways.png"
    },
    luigi: {
        name: "Luigi",
        hp: 1042,
        maxHp: 2500,
        stone: "Reality",
        abilities: [
            { name: "Jump Punch", level: 1, damage: 120 },                     // non-stone
            { name: "Reality Slam (Reality Stone)", level: 3, damage: 140 },   // reality stone
            { name: "Green Missile", level: 7, damage: 150 },                  // non-stone
            { name: "Time Warp", level: 11, damage: 210 }                      // non-stone
        ],
        image: "luigi_jump.webp"
    },
    sonic: {
        name: "Sonic",
        hp: 958,
        maxHp: 2300,
        stone: "Reality",
        abilities: [
            { name: "Spin Dash", level: 1, damage: 140 },                       // non-stone
            { name: "Reality Rush (Reality Stone)", level: 3, damage: 160 },    // reality stone
            { name: "Reality Burst (Reality Stone)", level: 7, damage: 180 },   // reality stone
            { name: "Speed Spin", level: 11, damage: 200 }                      // non-stone
        ],
        image: "sonic_sideways.jpg"
    },
    shadow: {
        name: "Shadow",
        hp: 875,
        maxHp: 2100,
        stone: "Mind",
        abilities: [
            { name: "Soul Kick (Soul Stone)", level: 1, damage: 130 },          // soul stone
            { name: "Chaos Punch", level: 3, damage: 140 },                     // non-stone
            { name: "Spin Barrage", level: 7, damage: 150 },                    // non-stone
            { name: "Chaos Control (Mind Stone)", level: 11, damage: 220 }      // mind stone
        ],
        image: "shadow_.webp"
    },
    hulk: {
        name: "Hulk",
        hp: 1200,
        maxHp: 2800,
        stone: "Power",
        abilities: [
            { name: "Hulk Smash (Power Stone)", level: 1, damage: 160 },        // power stone
            { name: "Thunder Clap", level: 3, damage: 140 },                    // non-stone
            { name: "Rampage (Power Stone)", level: 7, damage: 170 },           // power stone
            { name: "Smash Hit", level: 11, damage: 230 }                       // non-stone
        ],
        image: "hulk_jump.webp"
    }
};



// =========================
// Stone multiplier tabel
// =========================
const stoneMultipliers = {
    Time: { Time: 1.00, Power: 1.30, Soul: 1.15, Mind: 1.00, Space: 0.87, Reality: 0.77 },
    Power: { Time: 0.77, Power: 1.00, Soul: 0.87, Mind: 1.15, Space: 1.30, Reality: 1.00 },
    Soul: { Time: 1.15, Power: 0.77, Soul: 1.00, Mind: 0.87, Space: 1.30, Reality: 1.00 },
    Mind: { Time: 0.87, Power: 1.00, Soul: 1.30, Mind: 1.00, Space: 1.15, Reality: 0.77 },
    Space: { Time: 1.30, Power: 1.15, Soul: 1.00, Mind: 0.77, Space: 1.00, Reality: 0.87 },
    Reality: { Time: 1.00, Power: 0.87, Soul: 0.77, Mind: 1.30, Space: 1.15, Reality: 1.00 }
};

// =========================
// Huidige gameState
// =========================
let gameState = {
    player: {},
    enemy: {},
    playerTurn: true,
    playerCharTemp: null
};

// =========================
// Coins & Rings
// =========================
let coins = parseInt(localStorage.getItem('coins')) || 0;
let rings = parseInt(localStorage.getItem('rings')) || 0;

function endBattle(result) {
    // Coins verdien-logic blijft hetzelfde
    let coinEl = document.getElementById('coin-count');
    let ringEl = document.getElementById('ring-count');

    if(result === "win") {
        coins += 100; // voorbeeld coins bij winst
        rings += 150; // 150 ringen bij winst
    } else if(result === "lose") {
        coins += 20;  // voorbeeld coins bij verlies
        rings += 50;  // 50 ringen bij verlies
    }

    // Opslaan
    localStorage.setItem('coins', coins);
    localStorage.setItem('rings', rings);

    // Update panelen
    if(coinEl) coinEl.textContent = coins;
    if(ringEl) ringEl.textContent = rings;

    // Overige battle-afsluiting (schermen verbergen, resetBattle etc.)
    document.getElementById('battlefield').style.display = 'none';
    document.getElementById('end-screen').style.display = 'flex';
}




function updateCoins(amount) {
    coins += amount;
    localStorage.setItem("coins", coins);
    const coinEl = document.getElementById("coin-count");
    if(coinEl) coinEl.textContent = coins;
}

function updateRings(amount) {
    rings += amount;
    localStorage.setItem("rings", rings);
    const ringEl = document.getElementById("ring-count");
    if(ringEl) ringEl.textContent = rings;
}

// =========================
// HP-balken update
// =========================
function updateHpBars() {
    const playerBar = document.getElementById('player-hp');
    const enemyBar = document.getElementById('enemy-hp');
    const playerText = document.getElementById('player-hp-text');
    const enemyText = document.getElementById('enemy-hp-text');

    if(playerBar && gameState.player.hp !== undefined)
        playerBar.style.width = (gameState.player.hp / gameState.player.maxHp * 100) + '%';
    if(enemyBar && gameState.enemy.hp !== undefined)
        enemyBar.style.width = (gameState.enemy.hp / gameState.enemy.maxHp * 100) + '%';
    if(playerText) playerText.textContent = gameState.player.hp;
    if(enemyText) enemyText.textContent = gameState.enemy.hp;

    if(playerBar) playerBar.style.backgroundColor = getHpColor(gameState.player.hp);
    if(enemyBar) enemyBar.style.backgroundColor = getHpColor(gameState.enemy.hp);
}

function getHpColor(hp) {
    if(hp <= 150) return 'red';
    if(hp <= 300) return 'orange';
    if(hp <= 500) return 'yellow';
    return '#4caf50';
}

// =========================
// Damage animatie
// =========================
function showDamage(targetId, damage, usedStone = false, multiplier = 1) {
    const bar = document.getElementById(targetId);
    if(!bar) return;
    const characterDiv = bar.closest('.character');
    if(!characterDiv) return;

    const damageText = document.createElement('span');

    if (usedStone && multiplier) {
        if (multiplier > 1) {
            damageText.textContent = `CRITICAL! -${damage}`;
            damageText.style.color = 'orange';
        } else if (multiplier < 1) {
            damageText.textContent = `-${damage}`;
            damageText.style.color = 'yellow';
        } else {
            damageText.textContent = `-${damage}`;
            damageText.style.color = 'red';
        }
    } else {
        damageText.textContent = `-${damage}`;
        damageText.style.color = 'red';
    }

    damageText.className = 'damage-text';
    characterDiv.appendChild(damageText);
    setTimeout(() => damageText.remove(), 1000);
}

// =========================
// Player & Enemy Attack
// =========================
function playerAttack(ability) {
    if(!gameState.playerTurn) return;
    let damage = ability.damage;

    let usedStone = null;
    for(const stone of ["Time","Power","Soul","Mind","Space","Reality"]){
        if(ability.name.toLowerCase().includes(stone.toLowerCase())){
            usedStone = stone;
            break;
        }
    }

    let multiplier = 1;
    if(usedStone && gameState.enemy.stone){
        multiplier = stoneMultipliers[usedStone][gameState.enemy.stone] || 1;
        damage = Math.floor(damage * multiplier);
    }

    showDamage('enemy-hp', damage, usedStone !== null, multiplier);
    gameState.enemy.hp -= damage;
    if(gameState.enemy.hp < 0) gameState.enemy.hp = 0;
    updateHpBars();
    gameState.playerTurn = false;

    if(gameState.enemy.hp <= 0){
        endGame("Gefeliciteerd! Vijand verslagen!");
        return;
    }

    setTimeout(enemyAttack, 1000);
}

function enemyAttack(){
    let damage;
    if(gameState.enemy.abilities.length > 0){
        const ability = gameState.enemy.abilities[Math.floor(Math.random() * gameState.enemy.abilities.length)];
        damage = ability.damage;
    } else {
        damage = Math.floor(Math.random()*50)+20;
    }

    gameState.player.hp -= damage;
    if(gameState.player.hp < 0) gameState.player.hp = 0;

    showDamage('player-hp', damage);
    updateHpBars();

    if(gameState.player.hp <= 0){
        endGame("Je bent verslagen! Game over.");
        return;
    }

    gameState.playerTurn = true;
}

// =========================
// Battlefield laden
// =========================
function loadBattlefield(playerChar, enemyChar){
    const playerDiv = document.querySelector("#battlefield .character:first-child");
    const enemyDiv = document.querySelector("#battlefield .character:last-child");
    if(!playerDiv || !enemyDiv) return;

    const upgrades = [
        { id: 'mario', baseHp: 1083, hpPerLevel: 108.33, maxHp: 2600 },
        { id: 'luigi', baseHp: 1042, hpPerLevel: 104.17, maxHp: 2500 },
        { id: 'sonic', baseHp: 958, hpPerLevel: 95.83, maxHp: 2300 },
        { id: 'shadow', baseHp: 875, hpPerLevel: 87.5, maxHp: 2100 },
        { id: 'hulk', baseHp: 1200, hpPerLevel: 120, maxHp: 2800 }
    ];

    const playerLevel = parseInt(localStorage.getItem(`${playerChar.name.toLowerCase()}Level`)) || 1;
    const enemyLevel = parseInt(localStorage.getItem(`${enemyChar.name.toLowerCase()}Level`)) || 1;

    function getLevelMaxHp(charId, level) {
        const upgrade = upgrades.find(u => u.id === charId.toLowerCase());
        if(!upgrade) return characters[charId].hp;
        return Math.round(upgrade.baseHp + (level - 1) * upgrade.hpPerLevel);
    }

    const playerMaxHp = getLevelMaxHp(playerChar.name, playerLevel);
    const enemyMaxHp = getLevelMaxHp(enemyChar.name, enemyLevel);

    gameState.player = {...playerChar, hp: playerMaxHp, maxHp: playerMaxHp, level: playerLevel};
    gameState.enemy = {...enemyChar, hp: enemyMaxHp, maxHp: enemyMaxHp, level: enemyLevel};

    // Zet images
    playerDiv.querySelector(".character-image").src = playerChar.image;
    enemyDiv.querySelector(".character-image").src = enemyChar.image;

    // Ability buttons
    const stoneColorMap = {
        Power: 'purple',
        Space: 'darkblue',
        Soul: 'orange',
        Mind: 'yellow',
        Time: 'lime',
        Reality: 'red'
    };

    // verwijder oude buttons
    playerDiv.querySelectorAll(".ability-button").forEach(btn => btn.remove());

    playerChar.abilities.forEach(ability => {
        if(playerLevel >= ability.level){
            const btn = document.createElement('button');
            btn.className='ability-button';
            btn.textContent = ability.name;

            // Detecteer stone
            let stone = null;
            for(const s of Object.keys(stoneColorMap)){
                if(ability.name.toLowerCase().includes(s.toLowerCase())){
                    stone = s;
                    break;
                }
            }
            if(stone){
                btn.style.backgroundColor = stoneColorMap[stone];
                btn.style.color = 'white';
            }

            btn.onclick = ()=>playerAttack(ability);
            playerDiv.appendChild(btn);
        }
    });

    // ✅ Update HP-balken en getallen
    updateHpBars();
    gameState.playerTurn = true;
    document.getElementById('battlefield').style.display='flex';
}





// =========================
// Start nieuw gevecht
// =========================
function startBattle(){
    if(!gameState.playerCharTemp) return;

    // Kies een random enemy als voorbeeld
    const enemyKeys = Object.keys(characters);
    const randomKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
    const enemyChar = characters[randomKey];

    loadBattlefield(gameState.playerCharTemp, enemyChar);

    document.getElementById('end-screen').style.display='none';
    document.getElementById('battlefield').style.display='flex';
}

// =========================
// Einde / restart / pause / village
// =========================
function endGame(message){
    const endScreen = document.getElementById('end-screen');
    const endMessage = document.getElementById('end-message');
    if(endScreen && endMessage){
        endMessage.textContent = message;
        endScreen.style.display='flex';
    }

    if(message.includes("Gefeliciteerd")) {
        updateCoins(150);
        updateRings(150); // <-- Ringen bij winst
    }
    else if(message.includes("Game over")) {
        updateCoins(50);
        updateRings(50);  // <-- Ringen bij verlies
    }
}


function resetBattle(){
    // Reset speler HP
    if(gameState.player.hp !== undefined) gameState.player.hp = gameState.player.maxHp;
    // Reset vijand HP
    if(gameState.enemy.hp !== undefined) gameState.enemy.hp = gameState.enemy.maxHp;

    gameState.playerTurn = true;

    // Update buttons en images opnieuw
    loadBattlefield(gameState.player, gameState.enemy);

    // Verberg einde scherm, toon battlefield
    const endScreen = document.getElementById('end-screen');
    if(endScreen) endScreen.style.display = 'none';
    const battlefield = document.getElementById('battlefield');
    if(battlefield) battlefield.style.display = 'flex';
}


function resumeGame(){
    const pauseScreen = document.getElementById('pause-screen');
    if(pauseScreen) pauseScreen.style.display='none';
}

function goToVillage(){
    ['pause-screen','end-screen','battlefield'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.style.display='none';
    });
    const village = document.getElementById('village-screen');
    if(village) village.style.display='flex';
}

// =========================
// Ongeldige code feedback
// =========================
    function showInvalidCode(){
    const codeInput = document.getElementById('vault-code');
    if(!codeInput) return;
    const errorText = document.createElement('span');
    errorText.textContent = "ONGELDIGE CODE";
    errorText.style.color='red';
    errorText.style.fontWeight='bold';
    errorText.style.position='absolute';
    errorText.style.top = (codeInput.offsetTop + codeInput.offsetHeight + 5)+"px";
    errorText.style.left = codeInput.offsetLeft+"px";
    codeInput.parentElement.appendChild(errorText);
    setTimeout(()=>errorText.remove(),1500);
}
function updateAllCharacterAbilities() {
    const screens = ["mario", "luigi", "sonic", "shadow"];
    screens.forEach(charId => {
        const screen = document.getElementById(`${charId}-detail-screen`);
        if (!screen) return;

        const abilityEls = screen.querySelectorAll('.abilities p');
        const currentLevel = parseInt(screen.dataset.level) || 1;

        abilityEls.forEach(p => {
            const unlockLevel = parseInt(p.dataset.unlock);
            if (currentLevel >= unlockLevel) {
                p.style.display = "block";
            } else {
                p.style.display = "none";
            }
        });
    });
}
function initCharacterUpgrades() {
    const upgrades = [
        { id: 'mario', baseHp: 1083, hpPerLevel: 108.33, maxHp: 2600, currency: 'coins', cost: 100 },
        { id: 'luigi', baseHp: 1042, hpPerLevel: 104.17, maxHp: 2500, currency: 'coins', cost: 100 },
        { id: 'sonic', baseHp: 958, hpPerLevel: 95.83, maxHp: 2300, currency: 'rings', cost: 150 },
        { id: 'shadow', baseHp: 875, hpPerLevel: 87.5, maxHp: 2100, currency: 'rings', cost: 150 },
        // Marvel characters
        { id: 'hulk', baseHp: 1200, hpPerLevel: 120, maxHp: 2800, coinsCost: 75, ringsCost: 75 },
        // voeg andere Marvel characters hier toe
    ];

    upgrades.forEach(char => {
        const screen = document.getElementById(`${char.id}-detail-screen`);
        if (!screen) return;

        const upgradeBtn = screen.querySelector(`.${char.id}-upgrade-button`);
        const hpText = screen.querySelector(`#${char.id}-hp-text`);
        const hpBar = screen.querySelector(`#${char.id}-hp-bar`);
        const levelText = screen.querySelector('.level-text') || screen.querySelector('p');

        let savedLevel = parseInt(localStorage.getItem(`${char.id}Level`)) || 1;

        function updateHpBar(level) {
            let hp = char.baseHp + (level - 1) * char.hpPerLevel;
            if (hp > char.maxHp) hp = char.maxHp;
            const percentage = (hp / char.maxHp) * 100;
            hpBar.style.width = percentage + "%";
            hpText.textContent = `${Math.round(hp)} / ${char.maxHp}`;
            return hp;
        }

        screen.dataset.level = savedLevel;
        levelText.textContent = `Level ${savedLevel}`;
        updateHpBar(savedLevel);

        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                let currentLevel = parseInt(screen.dataset.level);

                // Controleer currency
                let coinsAvailable = parseInt(localStorage.getItem('coins')) || 0;
                let ringsAvailable = parseInt(localStorage.getItem('rings')) || 0;

                // Marvel characters gebruiken beide currencies
                if (char.coinsCost && char.ringsCost) {
                    if (coinsAvailable < char.coinsCost || ringsAvailable < char.ringsCost) {
                        alert("Niet genoeg coins of rings!");
                        return;
                    }
                    coinsAvailable -= char.coinsCost;
                    ringsAvailable -= char.ringsCost;
                    localStorage.setItem('coins', coinsAvailable);
                    localStorage.setItem('rings', ringsAvailable);

                    // Update panelen
                    const coinEl = document.getElementById('coin-count');
                    if (coinEl) coinEl.textContent = coinsAvailable;
                    const ringEl = document.getElementById('ring-count');
                    if (ringEl) ringEl.textContent = ringsAvailable;
                } else {
                    // Gewone characters
                    let currencyAvailable = parseInt(localStorage.getItem(char.currency)) || 0;
                    if (currencyAvailable < char.cost) {
                        alert(`Niet genoeg ${char.currency}!`);
                        return;
                    }
                    currencyAvailable -= char.cost;
                    localStorage.setItem(char.currency, currencyAvailable);
                    const currencyEl = document.getElementById(char.currency === 'coins' ? 'coin-count' : 'ring-count');
                    if (currencyEl) currencyEl.textContent = currencyAvailable;
                }

                if (currentLevel >= 15) {
                    alert("Max level bereikt!");
                    return;
                }

                // Level verhogen en opslaan
                currentLevel += 1;
                screen.dataset.level = currentLevel;
                levelText.textContent = `Level ${currentLevel}`;
                localStorage.setItem(`${char.id}Level`, currentLevel);

                // HP updaten
                const newHp = updateHpBar(currentLevel);
                localStorage.setItem(`${char.id}Hp`, newHp);

                // abilities updaten bij level up
                updateAbilityVisibility(char.id, currentLevel);
            });
        }

        // abilities updaten bij het laden
        updateAbilityVisibility(char.id, savedLevel);

        function updateAbilityVisibility(charId, level) {
            const screen = document.getElementById(`${charId}-detail-screen`);
            if (!screen) return;

            const abilityEls = screen.querySelectorAll('.abilities p');
            abilityEls.forEach(p => {
                const unlockLevel = parseInt(p.dataset.unlock);
                if (level >= unlockLevel) {
                    p.style.display = "block";
                } else {
                    p.style.display = "none";
                }
            });
        }
    });
}









// =========================
// DOMContentLoaded
// =========================
document.addEventListener("DOMContentLoaded", () => {
    let coins = parseInt(localStorage.getItem("coins")) || 0;
let rings = parseInt(localStorage.getItem("rings")) || 0;

    // -------------------------------
    // Coins en Rings bijwerken
    // -------------------------------
    const coinEl = document.getElementById("coin-count");
    if (coinEl) coinEl.textContent = coins;

    function setCoins(value) {
    coins = value;
    localStorage.setItem("coins", coins);
    const coinEl = document.getElementById("coin-count");
    if (coinEl) coinEl.textContent = coins;
}

    const ringEl = document.getElementById("ring-count");
    if (ringEl) ringEl.textContent = rings;

function setRings(value) {
    rings = value;
    localStorage.setItem("rings", rings);
    const ringEl = document.getElementById("ring-count");
    if (ringEl) ringEl.textContent = rings;
}

// Helpers
function getCoins() {
    return parseInt(localStorage.getItem("coins")) || 0;
}

function setCoins(value) {
    localStorage.setItem("coins", value);
    coins = value;
    const coinEl = document.getElementById("coin-count");
    if (coinEl) coinEl.textContent = value;
}

function getRings() {
    return parseInt(localStorage.getItem("rings")) || 0;
}

function setRings(value) {
    localStorage.setItem("rings", value);
    rings = value;
    const ringEl = document.getElementById("ring-count");
    if (ringEl) ringEl.textContent = value;
}


    // -------------------------------
    // Collection knop
    // -------------------------------
    const collectionBtn = document.getElementById('collection-button');
    if (collectionBtn) {
        collectionBtn.addEventListener('click', () => {
            document.getElementById('village-screen').style.display = 'none';
            document.getElementById('character-select-screen').style.display = 'flex';
        });
    }

    // -------------------------------
    // Karakter kiezen (speler)
    // -------------------------------
    document.querySelectorAll('.character-choice').forEach(button => {
        button.addEventListener('click', () => {
            const chosenChar = button.dataset.character;
            const playerChar = characters[chosenChar];
            if (!playerChar) return;
            gameState.playerCharTemp = playerChar;
            document.getElementById('character-select-screen').style.display = 'none';
            document.getElementById('enemy-select-screen').style.display = 'flex';
        });
    });

    // -------------------------------
    // Karakter kiezen (vijand)
    // -------------------------------
    document.querySelectorAll('.enemy-choice').forEach(button => {
        button.addEventListener('click', () => {
            const chosenChar = button.dataset.character;
            const enemyChar = characters[chosenChar];
            if (!enemyChar) return;
            loadBattlefield(gameState.playerCharTemp, enemyChar);
            document.getElementById('enemy-select-screen').style.display = 'none';
            document.getElementById('battlefield').style.display = 'flex';
        });
    });

    // -------------------------------
    // Random Enemy
    // -------------------------------
    const randomEnemyBtn = document.getElementById('random-enemy');
    if (randomEnemyBtn) {
        randomEnemyBtn.addEventListener('click', () => {
            const enemyKeys = Object.keys(characters);
            const randomKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
            const enemyChar = characters[randomKey];
            loadBattlefield(gameState.playerCharTemp, enemyChar);
            document.getElementById('enemy-select-screen').style.display = 'none';
            document.getElementById('battlefield').style.display = 'flex';
        });
    }

    // -------------------------------
    // Pauze / Resume
    // -------------------------------
    const pauseBtn = document.getElementById('pause-button');
    if (pauseBtn) pauseBtn.addEventListener('click', () => document.getElementById('pause-screen').style.display = 'flex');

    const resumeBtn = document.getElementById('resume-button');
    if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);

    const restartPauseBtn = document.getElementById('restart-button');
    if (restartPauseBtn) {
        restartPauseBtn.addEventListener('click', () => {
            const pauseScreen = document.getElementById('pause-screen');
            if(pauseScreen) pauseScreen.style.display = 'none';
            resetBattle();
        });
    }

    const backToVillagePauseBtn = document.getElementById('back-to-village-button');
    if (backToVillagePauseBtn) {
        backToVillagePauseBtn.addEventListener('click', () => {
            const pauseScreen = document.getElementById('pause-screen');
            if(pauseScreen) pauseScreen.style.display = 'none';
            goToVillage();
        });
    }

    // -------------------------------
    // End game knoppen
    // -------------------------------
    const endRestartBtn = document.getElementById('end-restart-button');
    const endBackToVillageBtn = document.getElementById('end-back-to-village');

    if (endRestartBtn) endRestartBtn.addEventListener('click', () => resetBattle());
    if (endBackToVillageBtn) endBackToVillageBtn.addEventListener('click', () => goToVillage());

    // -------------------------------
    // Village knoppen
    // -------------------------------
    const charactersBtn = document.getElementById('characters-button');
    if (charactersBtn) charactersBtn.addEventListener('click', () => {
        document.getElementById('village-screen').style.display = 'none';
        document.getElementById('character-details-screen').style.display = 'flex';
    });

    const shopBtn = document.getElementById('shop-button');
    if (shopBtn) shopBtn.addEventListener('click', () => {
        document.getElementById('village-screen').style.display = 'none';
        document.getElementById('shop-screen').style.display = 'flex';
    });

    const backFromShopBtn = document.getElementById('back-to-village-from-shop');
    if (backFromShopBtn) backFromShopBtn.addEventListener('click', () => {
        document.getElementById('shop-screen').style.display = 'none';
        document.getElementById('village-screen').style.display = 'flex';
    });

    const backFromDetailsBtn = document.getElementById('back-to-village-from-details');
    if (backFromDetailsBtn) backFromDetailsBtn.addEventListener('click', () => {
        document.getElementById('character-details-screen').style.display = 'none';
        document.getElementById('village-screen').style.display = 'flex';
    });

    // -------------------------------
    // Kluis / Cheatcodes
    // -------------------------------
const validateBtn = document.getElementById('validate-code');
if (validateBtn) {
    validateBtn.addEventListener('click', () => {
        const codeInput = document.getElementById('vault-code');
        const code = codeInput.value.trim().toUpperCase();
        let valid = true;

        switch(code) {
            case "SET0":
                setCoins(0);
                setRings(0);
                break;
            case "CHEAT":
                setCoins(1000000);
                setRings(1000000);
                break;
            case "LEVEL1":
                Object.keys(characters).forEach(charKey => {
                    localStorage.setItem(charKey + "Level", 1);
                });

                const screens = ["mario", "luigi", "sonic", "shadow"];
                screens.forEach(name => {
                    const screen = document.getElementById(name + "-detail-screen");
                    if(!screen) return;

                    screen.dataset.level = 1;
                    const levelText = screen.querySelector('.level-text');
                    if(levelText) levelText.textContent = "Level 1";

                    const hpText = screen.querySelector(`#${name}-hp-text`);
                    const hpBar = screen.querySelector(`#${name}-hp-bar`);
                    if(hpText && hpBar){
                        hpText.textContent = `${characters[name].hp} / ${characters[name].maxHp}`;
                        hpBar.style.width = (characters[name].hp / characters[name].maxHp * 100) + "%";
                    }
                });
                break;
            default:
                valid = false;
        }
        updateAllCharacterAbilities();
displayMarioAbilities();
        // **Altijd het invoerveld leegmaken**
        codeInput.value = "";

        // Foutmelding tonen als code ongeldig is
        if (!valid) {
            showInvalidCode();
        }
    });
}


    // -------------------------------
    // Character detail buttons
    // -------------------------------
    const characterDetailButtons = document.querySelectorAll('.character-detail-button');
    characterDetailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            // Verberg alle detail screens
            document.querySelectorAll('.character-detail-screen').forEach(screen => {
                screen.style.display = 'none';
            });
            // Toon het geselecteerde scherm
            const targetScreen = document.getElementById(targetId);
            if (targetScreen) targetScreen.style.display = 'flex';
        });
    });


    // -------------------------------
    // Terug-knoppen in detail screens
    // -------------------------------
    document.querySelectorAll('.back-from-detail').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.character-detail-screen').forEach(screen => {
                screen.style.display = 'none';
            });
            document.getElementById('village-screen').style.display = 'flex';
        });
    });

    // -------------------------------
    // Init upgrades
    // -------------------------------
initCharacterUpgrades();



    console.log("Alle event listeners zijn nu netjes geladen ✅");
});

