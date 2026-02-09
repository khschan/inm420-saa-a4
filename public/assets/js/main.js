// link html objects
const resultCard = document.getElementById("result");
const wordTitle = document.getElementById("wordTitle");
const definitionText = document.getElementById("definition");

const MW_API_KEY = "ae3ce711-ecc8-4c92-b299-42353a5ff951";

// load card after search
function showResult(title, htmlContent) {
  wordTitle.textContent = title;
  definitionText.innerHTML = htmlContent;

  resultCard.classList.remove("d-none", "show");
  void resultCard.offsetWidth; // restart animation
  resultCard.classList.add("show");
}

// add api call and parse
async function searchWord() {
  const word = document.getElementById("wordInput").value.trim();
  if (!word) return;

  try {
    const res = await fetch(
      `https://dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${MW_API_KEY}`
    );

    const data = await res.json();

    // Handle suggestion-only responses
    if (!Array.isArray(data) || typeof data[0] === "string") {
      showResult("Not found", "Try a different word 🤔");
      return;
    }

    const entry = data[0];

    // ---- SHORT DEFINITIONS ----
    const shortdefs = Array.isArray(entry.shortdef)
      ? entry.shortdef
      : [];

    const shortdefHTML = shortdefs.length
      ? `<strong>Definition</strong>
         <ul>${shortdefs
           .slice(0, 3)
           .map(def => `<li>${def}</li>`)
           .join("")}</ul>`
      : "<strong>Definition</strong><p>None available.</p>";

    // ---- ETYMOLOGY ----
    let etymology = "";

    if (Array.isArray(entry.et)) {
      etymology = entry.et
        .map(part => Array.isArray(part) ? part[1] : "")
        .join(" ")
        .replace(/{[^}]+}/g, "")
        .trim();
    }

    const etHTML = etymology
      ? `<strong>Etymology</strong><p>${etymology}</p>`
      : "<strong>Etymology</strong><p>Not available.</p>";

    showResult(word, `${shortdefHTML}${etHTML}`);

  } catch (err) {
    showResult("Error", "Something went wrong 😬");
  }
}

const MW_THESAURUS_KEY = "1e964eda-2f1d-4ccb-bfe0-ba8ab73b5e5b";

async function searchThesaurus() {
  const word = document.getElementById("wordInput").value.trim();
  if (!word) return;

  try {
    const res = await fetch(
      `https://dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=${MW_THESAURUS_KEY}`
    );

    const data = await res.json();

    // Handle suggestion-only responses
    if (!Array.isArray(data) || typeof data[0] === "string") {
      showResult("Not found", "No thesaurus entry available 🤔");
      return;
    }

    const entry = data[0];

    // ---- SHORT DEFINITIONS ----
    const shortdefs = Array.isArray(entry.shortdef)
      ? entry.shortdef
      : [];

    const shortdefHTML = shortdefs.length
      ? `<strong>Meaning</strong>
         <ul>${shortdefs
           .slice(0, 2)
           .map(def => `<li>${def}</li>`)
           .join("")}</ul>`
      : "<strong>Meaning</strong><p>None available.</p>";

    // ---- SYNONYMS ----
    const synGroups = entry.meta?.syns || [];
    const synonyms = synGroups.flat().slice(0, 8);

    const synHTML = synonyms.length
      ? `<strong>Synonyms</strong>
         <p>${synonyms.join(", ")}</p>`
      : "<strong>Synonyms</strong><p>None found.</p>";

    showResult(`${word} (thesaurus)`, `${shortdefHTML}${synHTML}`);

  } catch (err) {
    showResult("Error", "Couldn’t fetch thesaurus data 😬");
  }
}

// Clear everything
function clearResult() {
  document.getElementById("wordInput").value = "";
  resultCard.classList.remove("show");
  resultCard.classList.add("d-none");
  wordTitle.textContent = "";
  definitionText.innerHTML = "";
}
