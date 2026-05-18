const STORAGE_KEY = "cuisineavecmoi-recipes";
const FAVORITES_KEY = "cuisineavecmoi-favorites";

const CATEGORY_LABELS = {
  entree: "Entrée",
  plat: "Plat",
  dessert: "Dessert",
};

const CATEGORY_EMOJI = {
  entree: "🥗",
  plat: "🍲",
  dessert: "🍰",
};

const DEFAULT_RECIPES = [
  {
    id: "1",
    name: "Soupe à l'oignon gratinée",
    category: "entree",
    time: 45,
    ingredients: [
      "4 oignons jaunes",
      "50 g de beurre",
      "1 L de bouillon de bœuf",
      "4 tranches de pain",
      "100 g de gruyère râpé",
      "Sel, poivre, thym",
    ],
    steps: [
      "Émincer finement les oignons et les faire caraméliser à feu doux avec le beurre.",
      "Ajouter le bouillon, assaisonner et laisser mijoter 20 minutes.",
      "Verser dans des bols, poser le pain et le fromage, gratiner au four 5 min.",
    ],
  },
  {
    id: "2",
    name: "Poulet rôti aux herbes",
    category: "plat",
    time: 75,
    ingredients: [
      "1 poulet fermier",
      "2 citrons",
      "4 gousses d'ail",
      "Romarin, thym, sel, poivre",
      "2 c. à s. d'huile d'olive",
      "500 g de pommes de terre",
    ],
    steps: [
      "Préchauffer le four à 200 °C.",
      "Frotter le poulet avec l'huile, les herbes et l'ail, glisser le citron à l'intérieur.",
      "Disposer les pommes de terre autour, enfourner 1 h en arrosant régulièrement.",
      "Laisser reposer 10 min avant de découper.",
    ],
  },
  {
    id: "3",
    name: "Tarte aux pommes",
    category: "dessert",
    time: 60,
    ingredients: [
      "1 pâte brisée",
      "4 pommes Golden",
      "30 g de beurre",
      "2 c. à s. de sucre",
      "1 sachet de sucre vanillé",
      "Cannelle (optionnel)",
    ],
    steps: [
      "Étaler la pâte dans un moule et piquer le fond.",
      "Éplucher et couper les pommes en fines lamelles, les disposer en rosace.",
      "Parsemer de beurre et de sucre, saupoudrer de cannelle.",
      "Cuire 35 à 40 min à 180 °C jusqu'à coloration dorée.",
    ],
  },
  {
    id: "4",
    name: "Salade composée méditerranéenne",
    category: "entree",
    time: 20,
    ingredients: [
      "Laitue romaine",
      "Tomates cerises",
      "Concombre",
      "Olives noires",
      "Feta",
      "Huile d'olive, citron, origan",
    ],
    steps: [
      "Laver et couper tous les légumes.",
      "Émietter la feta et ajouter les olives.",
      "Assaisonner d'huile, de citron et d'origan, mélanger délicatement.",
    ],
  },
];

let recipes = [];
let favorites = new Set();
let activeFilter = "all";
let searchQuery = "";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  recipes = stored ? JSON.parse(stored) : [...DEFAULT_RECIPES];

  const storedFavs = localStorage.getItem(FAVORITES_KEY);
  favorites = new Set(storedFavs ? JSON.parse(storedFavs) : []);
}

function saveRecipes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

function showToast(message) {
  let toast = $(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function getFilteredRecipes() {
  return recipes.filter((recipe) => {
    const matchesSearch =
      !searchQuery ||
      recipe.name.toLowerCase().includes(searchQuery) ||
      recipe.ingredients.some((i) => i.toLowerCase().includes(searchQuery));

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "favori" ? favorites.has(recipe.id) : recipe.category === activeFilter);

    return matchesSearch && matchesFilter;
  });
}

function renderRecipes() {
  const grid = $("#recipe-grid");
  const empty = $("#empty-state");
  const countEl = $("#recipe-count");
  const filtered = getFilteredRecipes();

  countEl.textContent =
    filtered.length === 0
      ? ""
      : `${filtered.length} recette${filtered.length > 1 ? "s" : ""}`;

  grid.innerHTML = "";

  if (filtered.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  filtered.forEach((recipe) => {
    const card = document.createElement("article");
    card.className = "recipe-card";
    card.dataset.id = recipe.id;

    const isFav = favorites.has(recipe.id);
    const preview = recipe.ingredients.slice(0, 3).join(", ");

    card.innerHTML = `
      <div class="recipe-card__visual" aria-hidden="true">${CATEGORY_EMOJI[recipe.category] || "🍽️"}</div>
      <div class="recipe-card__body">
        <div class="recipe-card__top">
          <span class="recipe-card__badge">${CATEGORY_LABELS[recipe.category]}</span>
          <button type="button" class="recipe-card__fav ${isFav ? "is-favorite" : ""}" aria-label="${isFav ? "Retirer des favoris" : "Ajouter aux favoris"}">${isFav ? "★" : "☆"}</button>
        </div>
        <h3 class="recipe-card__title">${escapeHtml(recipe.name)}</h3>
        <p class="recipe-card__meta">⏱ ${recipe.time} min</p>
        <p class="recipe-card__preview">${escapeHtml(preview)}…</p>
        <div class="recipe-card__actions">
          <button type="button" class="recipe-card__btn recipe-card__btn--primary" data-action="view">Voir la recette</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function openModal(recipe) {
  const modal = $("#recipe-modal");
  $("#modal-title").textContent = recipe.name;
  $("#modal-category").textContent = CATEGORY_LABELS[recipe.category];
  $("#modal-meta").textContent = `⏱ ${recipe.time} minutes`;

  const ingredientsList = $("#modal-ingredients");
  ingredientsList.innerHTML = recipe.ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join("");

  const stepsList = $("#modal-steps");
  stepsList.innerHTML = recipe.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("");

  modal.showModal();
}

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast("Retiré des favoris");
  } else {
    favorites.add(id);
    showToast("Ajouté aux favoris");
  }
  saveFavorites();
  renderRecipes();
}

function handleAddRecipe(e) {
  e.preventDefault();
  const form = e.target;

  const name = form.name.value.trim();
  const category = form.category.value;
  const time = parseInt(form.time.value, 10);
  const ingredients = form.ingredients.value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const steps = form.steps.value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!name || ingredients.length === 0 || steps.length === 0) return;

  const recipe = {
    id: Date.now().toString(),
    name,
    category,
    time,
    ingredients,
    steps,
  };

  recipes.unshift(recipe);
  saveRecipes();
  form.reset();
  form.time.value = "30";
  showToast(`« ${name} » a été ajoutée !`);
  renderRecipes();
  document.getElementById("recettes").scrollIntoView({ behavior: "smooth" });
}

function init() {
  loadData();
  renderRecipes();

  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    searchQuery = $("#search-input").value.trim().toLowerCase();
    renderRecipes();
  });

  $("#search-input").addEventListener("input", () => {
    searchQuery = $("#search-input").value.trim().toLowerCase();
    renderRecipes();
  });

  $$(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".filter-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.filter;
      renderRecipes();
    });
  });

  $("#recipe-grid").addEventListener("click", (e) => {
    const card = e.target.closest(".recipe-card");
    if (!card) return;

    const id = card.dataset.id;
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;

    if (e.target.closest(".recipe-card__fav")) {
      toggleFavorite(id);
      return;
    }

    if (e.target.closest("[data-action='view']")) {
      openModal(recipe);
    }
  });

  $("#add-form").addEventListener("submit", handleAddRecipe);

  $("#modal-close").addEventListener("click", () => $("#recipe-modal").close());
  $("#recipe-modal").addEventListener("click", (e) => {
    if (e.target === $("#recipe-modal")) $("#recipe-modal").close();
  });
}

document.addEventListener("DOMContentLoaded", init);
