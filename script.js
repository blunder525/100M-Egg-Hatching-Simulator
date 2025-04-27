const pets = [
    { name: "Bronze Bunny", baseChance: 64.0, rarity: "common" },
    { name: "Silver Fox", baseChance: 30.0, rarity: "unique" },
    { name: "Golden Dragon", baseChance: 3.0, rarity: "epic" },
    { name: "Diamond Serpent", baseChance: 0.04, rarity: "legendary" },
    { name: "Diamond Hexarium", baseChance: 0.002, rarity: "legendary" },
    { name: "King Pufferfish", baseChance: 0.0001, rarity: "legendary" },
    { name: "Royal Trophy", baseChance: 0.000002, rarity: "secret" },
];

let shinyChance = 1 / 26;
let mythicChance = 1 / 40;
const mythicRarities = new Set(["legendary", "secret"]);
let luckPercent = 100;

// Apply luck only to legend & secret; then normalize
function applyLuck(pets, luckMultiplier) {
    pets.forEach(pet => {
        pet.adjustedChance = mythicRarities.has(pet.rarity)
            ? pet.baseChance * luckMultiplier
            : pet.baseChance;
    });

    const total = pets.reduce((sum, p) => sum + p.adjustedChance, 0);
    pets.forEach(p => {
        p.normalizedChance = p.adjustedChance / total;
    });
}

// Randomly choose one pet (before shiny/mythic modifiers)
function choosePet() {
    const roll = Math.random();
    let cum = 0;
    for (const pet of pets) {
        cum += pet.normalizedChance;
        if (roll <= cum) return pet;
    }
    return pets[pets.length - 1];
}

// Compute original odds string (ignores luck)
function getOriginalOdds(baseChance, shiny, mythic) {
    let chance = baseChance / 100;
    if (shiny) chance *= shinyChance;
    if (mythic) chance *= mythicChance;
    return `1 in ${Math.round(1 / chance).toLocaleString()}`;
}

function hatchEggs(num) {
    const results = {};
    for (let i = 0; i < num; i++) {
        const pet = choosePet();
        const isShiny = Math.random() < shinyChance;
        const isMythic = mythicRarities.has(pet.rarity) && Math.random() < mythicChance;

        // Both shiny and mythic could apply, so check both
        let label = pet.name;
        if (isShiny && isMythic) {
            label = `Shiny Mythic ${pet.name}`;
        } else if (isShiny) {
            label = `Shiny ${pet.name}`;
        } else if (isMythic) {
            label = `Mythic ${pet.name}`;
        }

        if (!results[label]) {
            results[label] = {
                count: 0,
                normalizedChance: pet.normalizedChance,
                baseChance: pet.baseChance,
                shiny: isShiny,
                mythic: isMythic
            };
        }
        results[label].count++;
    }
    return results;
}

function printResults(results) {
    const formatted = Object.entries(results).map(([name, d]) => {
        // true variant probability under luck
        const prob = d.normalizedChance * (d.shiny ? shinyChance : 1) * (d.mythic ? mythicChance : 1);
        return {
            name,
            count: d.count,
            prob,
            oddsStr: getOriginalOdds(d.baseChance, d.shiny, d.mythic)
        };
    });

    // sort by most‐likely to rarest under current luck
    formatted.sort((a, b) => b.prob - a.prob);

    let html = "<h3>🎉 Hatch Results:</h3><ul>";
    formatted.forEach(item => {
        html += `<li>${item.name}: ${item.count} (Original Odds: ${item.oddsStr})</li>`;
    });
    html += "</ul>";
    document.getElementById("results").innerHTML = html;
}

document.getElementById("hatch-button").addEventListener("click", () => {
    const n = parseInt(document.getElementById("num-eggs").value, 10);
    if (isNaN(n) || n < 1) return alert("Please enter a valid number of eggs.");
    applyLuck(pets, luckPercent / 100);
    printResults(hatchEggs(n));
});

document.getElementById("change-luck-button").addEventListener("click", () => {
    const newLuck = parseFloat(document.getElementById("luck-input").value);
    if (isNaN(newLuck) || newLuck < 0) return alert("Please enter a valid luck percentage.");
    luckPercent = newLuck;
    document.getElementById("luck").textContent = `${luckPercent}%`;
});

document.getElementById("change-shiny-button").addEventListener("click", () => {
    const newShiny = parseFloat(document.getElementById("shiny-input").value) / 100;
    if (isNaN(newShiny) || newShiny < 0) return alert("Please enter a valid shiny percentage.");
    shinyChance = newShiny;
});

document.getElementById("change-mythic-button").addEventListener("click", () => {
    const newMythic = parseFloat(document.getElementById("mythic-input").value) / 100;
    if (isNaN(newMythic) || newMythic < 0) return alert("Please enter a valid mythic percentage.");
    mythicChance = newMythic;
});

document.getElementById("toggle-dark-mode").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
