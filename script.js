
const skins = [ // db skin dispo + taro
  { id: "classic", name: "Classic", icon: "♟️", price: 0, rarity: "Commun", color: "#ffffff" },
  { id: "gold", name: "Royal Gold", icon: "♛", price: 800, rarity: "Rare", color: "#ffd166" },
  { id: "cyber", name: "Cyberpunk", icon: "♞", price: 1200, rarity: "Épique", color: "#c084fc" },
  { id: "ice", name: "Ice Kingdom", icon: "♚", price: 1500, rarity: "Épique", color: "#67e8f9" },
  { id: "fire", name: "Inferno", icon: "♜", price: 2000, rarity: "Légendaire", color: "#fb7185" },
  { id: "emerald", name: "Emerald", icon: "♝", price: 2500, rarity: "Légendaire", color: "#4ade80" }
];

// Premier lacement du site de l'utilisateur  ( donne de base)
const DEFAULT_DATA = {
  coins: 10000, // Nombre de pièces de départ
  owned: ["classic"], // Liste des skins possédés au départ
  equipped: "classic", // Skin équipé automatiquement au début
};

// Sauvegarde la progression
function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem("chessShopData"));
    if (!saved || typeof saved !== "object") return { ...DEFAULT_DATA };

    // import les donnees du joueur enregistré
    return {
      ...DEFAULT_DATA,
      ...saved,
      coins: Math.max(0, Number(saved.coins) || 0), // min piece = 0
      owned: Array.isArray(saved.owned)
        ? [...new Set(["classic", ...saved.owned.filter(id => skins.some(s => s.id === id))])] // Garde uniquement les skins existants et évite les doublons
        : ["classic"],
      equipped: skins.some(s => s.id === saved.equipped)
        ? saved.equipped // garde le skin utiliser
        : "classic", // si ya pas de skin utilise on remet le classique 
    };
  } catch {
    return { ...DEFAULT_DATA }; // si ya un prblm il recommence sa progressions du debut
  }
}

//  met les donnes du joueur et sauvegarde
let data = loadData();
let toastTimeout;


function saveData() {
  localStorage.setItem("chessShopData", JSON.stringify(data));
}

// message de pas lgtmps pr afficher sue le joueur y fais
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2500);
}

// enleve les piece quand on acht
function updateWallet() {
  document.getElementById("coins").textContent =
    data.coins.toLocaleString("fr-FR");
}

// skin dans la boutique fais tous seul
function renderShop() {
  const container = document.getElementById("skin-list");
  container.innerHTML = ""; 

  skins.forEach(skin => {
    const owned = data.owned.includes(skin.id); // regarde si on a deja acht se skin
    const card = document.createElement("article");
    card.className = "skin-card";

    // genere les skins dans la boutique
    card.innerHTML = `
      <div class="skin-icon" style="color:${skin.color}">
        ${skin.icon}
      </div>
      <h3>${skin.name}</h3>
      <p>${skin.rarity}</p>
      <div class="price">
        ${skin.price === 0 ? "GRATUIT" : "🪙 " + skin.price}
      </div>
      <button class="card-button" ${owned ? "disabled" : ""}>
        ${owned ? "Déjà possédé" : "Acheter"}
      </button>
    `;

    // bouton pr acheter les skins
    if (!owned) {
      card.querySelector("button").addEventListener("click", () => {
        buySkin(skin.id);
      });
    }

    container.appendChild(card); // Ajoute la carte a la boutique
  });
}

// regerde les condi et met apr le skins dans l'inventaire
function buySkin(id) {
  const skin = skins.find(s => s.id === id); // chrch le skin qui a cette avec l'id

  if (!skin || data.owned.includes(id)) return; // peut pas acht un skin dja acht

  // rgd si on a assez de tune
  if (data.coins < skin.price) {
    showToast("Ta pas la tune gros lardon paypal : paypal.me/MehdiHammouchi !");
    return;
  }

  // Fais l'achat et save
  data.coins -= skin.price; // enleve l'aregent 
  data.owned.push(id); // met le skin dans inventaire

  saveData(); // save les nvl data
  updateWallet(); // met l'argent a jour
  renderShop(); // chnage la boutique 
  renderInventory(); // inventaire a jour 

  showToast( "tu as acheté " + skin.name + " sale riche BAHAHAHAH !"); // Confirme l'achat avec un notif
}

// montre tous squil a acht
function renderInventory() {
  const container = document.getElementById("inventory-list");
  container.innerHTML = ""; // enlv tous les skins

  // montre tous squ'il a 
  skins.filter(s => data.owned.includes(s.id)).forEach(skin => {
    const equipped = data.equipped === skin.id; // Vérifie si le skin est actuellement équipé
    const card = document.createElement("article");
    card.className = "skin-card";

    // fais une carte da,ns l'inventaire 
    card.innerHTML = `
      <div class="skin-icon" style="color:${skin.color}">
        ${skin.icon}
      </div>
      <h3>${skin.name}</h3>
      <p>${skin.rarity}</p>
      <button class="card-button" ${equipped ? "disabled" : ""}>
        ${equipped ? "✓ Équipé" : "Équiper"}
      </button>
    `;

    // on peut changer de skin dans l'inventair
    if (!equipped) {
      card.querySelector("button").addEventListener("click", () => {
        data.equipped = skin.id; // met le nouveau skin equipe 
        saveData(); // savegarde 
        renderInventory(); // new inventaire
        showToast("Skin " + skin.name + " équipé gros porc que t'es tu me donne du travaille !"); // il lui dis que sa a changer
      });
    }

    container.appendChild(card); // ajr carte inventaire zef
  });
}

// gère les bails d'onglet et aide le joueur avec la page
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {

    // enlève onglet actiif
    document.querySelectorAll(".tab").forEach(t =>
      t.classList.remove("active")
    );

    // il taille toute les pages et afiche la nouvelle en bien
    document.querySelectorAll(".page").forEach(p =>
      p.classList.remove("active")
    );

    tab.classList.add("active"); // mets l'onglet que le joueur a cliquer
    document.getElementById(tab.dataset.page).classList.add("active"); // Affiche la page correspondante
  });
});

updateWallet(); // mets les pièce que le fréro il a
renderShop(); // mets les skin que la boutique a
renderInventory(); // mets l'invintaire du jouer



