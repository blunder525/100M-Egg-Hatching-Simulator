// script.js
const pets = [
  { name: "Bronze Bunny",    baseChance: 64.0,    rarity: "common" },
  { name: "Silver Fox",      baseChance: 30.0,    rarity: "unique" },
  { name: "Golden Dragon",   baseChance: 3.0,     rarity: "epic" },
  { name: "Diamond Serpent", baseChance: 0.04,    rarity: "legendary" },
  { name: "Diamond Hexarium",baseChance: 0.002,   rarity: "legendary" },
  { name: "King Pufferfish", baseChance: 0.0001,  rarity: "legendary" },
  { name: "Royal Trophy",    baseChance: 0.000002,rarity: "secret" },
];

let shinyChance = 1 / 40;    // Updated shiny chance (fraction)
let mythicChance = 1 / 100;  // Updated mythic chance (fraction)
const mythicRarities = new Set(["legendary", "secret"]);
let luckPercent = 100;

// Recompute adjusted + normalized chances
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

// Choose one pet weighted by normalizedChance
function choosePet() {
  const roll = Math.random();
  let cum = 0;
  for (const pet of pets) {
    cum += pet.normalizedChance;
    if (roll <= cum) return pet;
  }
  return pets[pets.length - 1];
}

// Build “1 in X” original odds string from baseChance + shiny/mythic
function getOriginalOdds(baseChance, shiny, mythic) {
  // baseChance is a percentage (e.g., 3.0 for 3%)
  let odds = 1 / (baseChance / 100);
  if (shiny)  odds *= 40;   // 1 in 40 for shinies
  if (mythic) odds *= 100;  // 1 in 100 for mythics
  return `1 in ${Math.round(odds).toLocaleString()}`;
}

// Hatch N eggs
function hatchEggs(num) {
  const results = {};
  for (let i = 0; i < num; i++) {
    const pet = choosePet();
    const isShiny = Math.random() < shinyChance;
    const isMythic = mythicRarities.has(pet.rarity) && Math.random() < mythicChance;
    let label = pet.name;
    if (isShiny && isMythic)      label = `Shiny Mythic ${pet.name}`;
    else if (isShiny)             label = `Shiny ${pet.name}`;
    else if (isMythic)            label = `Mythic ${pet.name}`;

    if (!results[label]) {
      results[label] = {
        count: 0,
        normalizedChance: pet.normalizedChance, // drop rate (adjusted by luck)
        baseChance: pet.baseChance,
        shiny: isShiny,
        mythic: isMythic
      };
    }
    results[label].count++;
  }
  return results;
}

// Render results table
function printResults(results) {
  // Build an array with true variant probability included
  const formatted = Object.entries(results).map(([name, d]) => {
    const variantProb = d.normalizedChance
      * (d.shiny  ? shinyChance  : 1)
      * (d.mythic ? mythicChance : 1);

    return {
      name: name,
      count: d.count,
      prob: variantProb,
      oddsStr: getOriginalOdds(d.baseChance, d.shiny, d.mythic)
    };
  });

  // Sort by highest-to-lowest actual probability
  formatted.sort((a, b) => b.prob - a.prob);

  let html = "<h3>🎉 Hatch Results:</h3><ul>";
  formatted.forEach(item => {
    html += `<li>${item.name}: ${item.count} (Original Odds: ${item.oddsStr})</li>`;
  });
  html += "</ul>";
  document.getElementById("results").innerHTML = html;
}

// Event bindings
document.getElementById("hatch-button").addEventListener("click", () => {
  const n = parseInt(document.getElementById("num-eggs").value, 10);
  if (isNaN(n) || n < 1) return alert("Please enter a valid number of eggs.");
  applyLuck(pets, luckPercent / 100);
  printResults(hatchEggs(n));
});

document.getElementById("change-luck-button").addEventListener("click", () => {
  const v = parseFloat(document.getElementById("luck-input").value);
  if (isNaN(v) || v < 0) return alert("Please enter a valid luck percentage.");
  luckPercent = v;
  document.getElementById("luck").textContent = `${luckPercent}%`;
});

document.getElementById("change-shiny-button").addEventListener("click", () => {
  const v = parseFloat(document.getElementById("shiny-input").value) / 100;
  if (isNaN(v) || v < 0) return alert("Please enter a valid shiny percentage.");
  shinyChance = v;
});

document.getElementById("change-mythic-button").addEventListener("click", () => {
  const v = parseFloat(document.getElementById("mythic-input").value) / 100;
  if (isNaN(v) || v < 0) return alert("Please enter a valid mythic percentage.");
  mythicChance = v;
});

document.getElementById("toggle-dark-mode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
