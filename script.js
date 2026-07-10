const eventList = document.querySelector("#event-list");
const dayTitle = document.querySelector("#selected-day-title");
const eventCount = document.querySelector("#event-count");
const stageSelect = document.querySelector("#stage-select");
const dayTabs = [...document.querySelectorAll(".day-tab")];

let program = [];
let selectedDay = "Thursday";
let programState = "loading";
const favoritesStorageKey = "maanen-2026-favorites";
const ratingsStorageKey = "maanen-2026-ratings";
let favorites = loadFavorites();
let ratings = loadRatings();

const stageClasses = {
  "Månehagen": "stage-manehagen",
  "Tøihusplassen": "stage-toihusplassen",
  "Vollen Stage": "stage-vollen"
};

function loadFavorites() {
  try {
    const savedFavorites = JSON.parse(localStorage.getItem(favoritesStorageKey) || "[]");
    return new Set(Array.isArray(savedFavorites) ? savedFavorites : []);
  } catch (error) {
    console.warn("Kunne ikke lese lagrede favoritter:", error);
    return new Set();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(favoritesStorageKey, JSON.stringify([...favorites]));
  } catch (error) {
    console.warn("Kunne ikke lagre favoritter:", error);
  }
}

function loadRatings() {
  try {
    const savedRatings = JSON.parse(localStorage.getItem(ratingsStorageKey) || "{}");
    return savedRatings && typeof savedRatings === "object" && !Array.isArray(savedRatings)
      ? savedRatings
      : {};
  } catch (error) {
    console.warn("Kunne ikke lese lagrede terningkast:", error);
    return {};
  }
}

function saveRatings() {
  try {
    localStorage.setItem(ratingsStorageKey, JSON.stringify(ratings));
  } catch (error) {
    console.warn("Kunne ikke lagre terningkast:", error);
  }
}

function getEventId(event) {
  return [event.date, event.time, event.stage, event.title].join("|");
}

function updateFavoriteButton(button, event, isFavorite) {
  button.classList.toggle("is-favorite", isFavorite);
  button.setAttribute("aria-pressed", String(isFavorite));
  button.setAttribute(
    "aria-label",
    `${isFavorite ? "Fjern" : "Legg til"} ${event.title} ${isFavorite ? "fra" : "i"} favoritter`
  );
  button.title = isFavorite ? "Fjern fra favoritter" : "Legg til i favoritter";
}

const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const unratedDieIcon = `
  <svg class="die-3d" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path class="die-3d__face die-3d__top" d="M16 2 29 9.5 16 17 3 9.5Z" />
    <path class="die-3d__face die-3d__left" d="M3 9.5 16 17v13L3 22.5Z" />
    <path class="die-3d__face die-3d__right" d="M29 9.5 16 17v13l13-7.5Z" />
    <circle cx="16" cy="9.5" r="1.35" />
    <circle cx="7.5" cy="14.5" r="1.2" />
    <circle cx="11.5" cy="19.8" r="1.2" />
    <circle cx="7.5" cy="23.1" r="1.2" />
    <circle cx="24.4" cy="15.2" r="1.2" />
    <circle cx="20.5" cy="23" r="1.2" />
  </svg>`;

function updateRatingButton(button, event, rating) {
  const hasRating = Number.isInteger(rating) && rating >= 1 && rating <= 6;
  button.classList.toggle("has-rating", hasRating);
  button.innerHTML = hasRating
    ? `<span class="die-face" aria-hidden="true">${diceFaces[rating - 1]}</span>`
    : unratedDieIcon;
  button.setAttribute(
    "aria-label",
    hasRating ? `${event.title}: terningkast ${rating}. Endre vurdering` : `Gi ${event.title} terningkast`
  );
  button.title = hasRating ? `Terningkast ${rating} – trykk for å endre` : "Gi terningkast";
}

function createEventCard(event) {
  const article = document.createElement("article");
  const stageClass = stageClasses[event.stage] || "stage-none";
  article.className = `event-card ${stageClass}${event.type === "info" ? " event-card--info" : ""}`;

  const time = document.createElement("time");
  time.className = "event-card__time";
  time.dateTime = event.time;
  time.textContent = event.time;

  const body = document.createElement("div");
  body.className = "event-card__body";

  const title = document.createElement("h4");
  title.className = "event-card__title";
  title.textContent = event.title;

  const meta = document.createElement("div");
  meta.className = "event-card__meta";
  let ratingPicker;

  const stage = document.createElement("span");
  stage.className = `stage-badge ${stageClass}`;
  stage.textContent = event.stage === "—" ? "Hele festivalområdet" : event.stage;
  meta.append(stage);
  body.append(title, meta);

  if (event.type === "artist") {
    const spotify = document.createElement("a");
    spotify.className = "spotify-link";
    spotify.href = event.spotifyUrl;
    spotify.target = "_blank";
    spotify.rel = "noopener noreferrer";
    spotify.textContent = "Spotify";
    spotify.setAttribute("aria-label", `Åpne ${event.title} på Spotify i en ny fane`);
    spotify.addEventListener("click", (clickEvent) => {
      if (event.spotifyUrl === "#") clickEvent.preventDefault();
    });
    meta.append(spotify);

    const eventId = getEventId(event);
    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-button";
    favoriteButton.type = "button";
    favoriteButton.innerHTML = '<span aria-hidden="true">♥</span>';
    updateFavoriteButton(favoriteButton, event, favorites.has(eventId));
    favoriteButton.addEventListener("click", () => {
      const isFavorite = favorites.has(eventId);
      if (isFavorite) {
        favorites.delete(eventId);
      } else {
        favorites.add(eventId);
      }
      saveFavorites();
      updateFavoriteButton(favoriteButton, event, !isFavorite);
    });
    article.append(favoriteButton);

    const ratingButton = document.createElement("button");
    ratingButton.className = "rating-button";
    ratingButton.type = "button";
    ratingButton.setAttribute("aria-expanded", "false");
    updateRatingButton(ratingButton, event, ratings[eventId]);

    ratingPicker = document.createElement("div");
    ratingPicker.className = "rating-picker";
    ratingPicker.hidden = true;
    ratingPicker.setAttribute("role", "group");
    ratingPicker.setAttribute("aria-label", `Velg terningkast for ${event.title}`);

    diceFaces.forEach((face, index) => {
      const rating = index + 1;
      const option = document.createElement("button");
      option.className = "rating-option";
      option.type = "button";
      option.innerHTML = `<span aria-hidden="true">${face}</span>`;
      option.setAttribute("aria-label", `Terningkast ${rating}`);
      option.setAttribute("aria-pressed", String(ratings[eventId] === rating));
      option.addEventListener("click", () => {
        ratings[eventId] = rating;
        saveRatings();
        updateRatingButton(ratingButton, event, rating);
        ratingPicker.querySelectorAll(".rating-option").forEach((ratingOption, optionIndex) => {
          ratingOption.setAttribute("aria-pressed", String(optionIndex + 1 === rating));
        });
        ratingPicker.hidden = true;
        ratingButton.setAttribute("aria-expanded", "false");
        ratingButton.focus();
      });
      ratingPicker.append(option);
    });

    const clearRating = document.createElement("button");
    clearRating.className = "rating-clear";
    clearRating.type = "button";
    clearRating.textContent = "×";
    clearRating.setAttribute("aria-label", "Fjern terningkast");
    clearRating.title = "Fjern terningkast";
    clearRating.addEventListener("click", () => {
      delete ratings[eventId];
      saveRatings();
      updateRatingButton(ratingButton, event);
      ratingPicker.querySelectorAll(".rating-option").forEach((ratingOption) => {
        ratingOption.setAttribute("aria-pressed", "false");
      });
      ratingPicker.hidden = true;
      ratingButton.setAttribute("aria-expanded", "false");
      ratingButton.focus();
    });
    ratingPicker.append(clearRating);

    ratingButton.addEventListener("click", () => {
      const willOpen = ratingPicker.hidden;
      ratingPicker.hidden = !willOpen;
      ratingButton.setAttribute("aria-expanded", String(willOpen));
    });

    article.append(ratingButton);
  }

  article.append(time, body);
  if (ratingPicker) article.append(ratingPicker);
  return article;
}

function renderProgram() {
  if (programState !== "ready") return;

  const dayEvents = program.filter((event) => event.day === selectedDay);
  const selectedStage = stageSelect.value;
  const visibleEvents = selectedStage === "all"
    ? dayEvents
    : dayEvents.filter((event) => event.stage === selectedStage);

  const currentDay = dayEvents[0];
  dayTitle.textContent = currentDay?.displayDate || "Program";
  eventCount.textContent = `${visibleEvents.length} ${visibleEvents.length === 1 ? "punkt" : "programpunkter"}`;
  eventList.replaceChildren();

  if (!visibleEvents.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Ingen programpunkter på denne scenen denne dagen.";
    eventList.append(empty);
    return;
  }

  visibleEvents.forEach((event) => eventList.append(createEventCard(event)));
}

function syncStageFilterWithDay() {
  const isThursday = selectedDay === "Thursday";

  if (isThursday) {
    stageSelect.value = "Månehagen";
  }

  stageSelect.disabled = isThursday || programState !== "ready";
  if (isThursday) {
    stageSelect.setAttribute("aria-description", "Alle programpunkter torsdag er i Månehagen.");
  } else {
    stageSelect.removeAttribute("aria-description");
  }
}

function selectDay(tab) {
  selectedDay = tab.dataset.day;
  dayTabs.forEach((candidate) => {
    const isSelected = candidate === tab;
    candidate.classList.toggle("is-active", isSelected);
    candidate.setAttribute("aria-selected", String(isSelected));
    candidate.tabIndex = isSelected ? 0 : -1;
  });
  eventList.setAttribute("aria-labelledby", tab.id);
  syncStageFilterWithDay();
  renderProgram();
}

dayTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectDay(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + dayTabs.length) % dayTabs.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % dayTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = dayTabs.length - 1;
    selectDay(dayTabs[nextIndex]);
    dayTabs[nextIndex].focus();
  });
});

stageSelect.addEventListener("change", renderProgram);

fetch(new URL("data/program.json", document.baseURI))
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Programfilen inneholder ingen programpunkter");
    }
    program = data;
    programState = "ready";
    dayTabs.forEach((tab) => { tab.disabled = false; });
    syncStageFilterWithDay();
    renderProgram();
  })
  .catch((error) => {
    programState = "error";
    console.error("Kunne ikke laste programmet:", error);
    eventCount.textContent = "";
    dayTitle.textContent = "Programmet er utilgjengelig";
    eventList.innerHTML = '<p class="error">Programmet kunne ikke lastes. Kjør siden via en lokal webserver, eller prøv å oppdatere siden.</p>';
  });
