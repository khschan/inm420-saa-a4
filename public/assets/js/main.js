// define html objects
const resultCard = document.getElementById("result");
const wordTitle = document.getElementById("wordTitle");
const definitionText = document.getElementById("definition");

const MW_API_KEY = "ae3ce711-ecc8-4c92-b299-42353a5ff951";
const MW_THESAURUS_KEY = "1e964eda-2f1d-4ccb-bfe0-ba8ab73b5e5b";

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

    // handle suggestion-only responses
    if (!Array.isArray(data) || typeof data[0] === "string") {
      showResult("hmm...", "are you sure that's a word? 🤔");
      return;
    }

    const entry = data[0];

    // display short definition
    const shortdefs = Array.isArray(entry.shortdef)
      ? entry.shortdef
      : [];

    const shortdefHTML = shortdefs.length
      ? `<strong>definition 📖</strong>
         <ul>${shortdefs
           .slice(0, 3)
           .map(def => `<li>${def}</li>`)
           .join("")}</ul>`
      : "<strong>definition 📖</strong><p>let me get back to you on that one.</p>";

    // display etymology
    let etymology = "";

    if (Array.isArray(entry.et)) {
      etymology = entry.et
        .map(part => Array.isArray(part) ? part[1] : "")
        .join(" ")
        .replace(/{[^}]+}/g, "")
        .trim();
    }

    const etHTML = etymology
      ? `<strong>etymology 🏛️</strong><p>${etymology}</p>`
      : "<strong>etymology 🏛️</strong><p>let me get back to you on that one.</p>";

    showResult(`${word} (dictionary)`, `${shortdefHTML}${etHTML}`);

  } catch (err) {
    showResult("hmm...", "are you sure that's a word? 🤔");
  }
}

// THESAURUS FUNCTIONALITY
async function searchThesaurus() {
  const word = document.getElementById("wordInput").value.trim();
  if (!word) return;

  try {
    const res = await fetch(
      `https://dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=${MW_THESAURUS_KEY}`
    );

    const data = await res.json();

    // handle suggestion-only responses
    if (!Array.isArray(data) || typeof data[0] === "string") {
      showResult("there aren't any 😔", "your word is pretty unique...");
      return;
    }

    const entry = data[0];

    // display short definition
    const shortdefs = Array.isArray(entry.shortdef)
      ? entry.shortdef
      : [];

    const shortdefHTML = shortdefs.length
      ? `<strong>meaning ❓</strong>
         <ul>${shortdefs
           .slice(0, 2)
           .map(def => `<li>${def}</li>`)
           .join("")}</ul>`
      : "<strong>meaning ❓</strong><p>None available.</p>";

    // display synonyms
    const synGroups = entry.meta?.syns || [];
    const synonyms = synGroups.flat().slice(0, 8);

    const synHTML = synonyms.length
      ? `<strong>synonyms 📃</strong>
         <p>${synonyms.join(", ")}</p>`
      : "<strong>synonyms 📃</strong><p>None found.</p>";

    showResult(`${word} (thesaurus)`, `${shortdefHTML}${synHTML}`);

  } catch (err) {
    showResult("sorry...", "i don't know that one 😔");
  }
}

// clear all results
function clearResult() {
  document.getElementById("wordInput").value = "";
  resultCard.classList.remove("show");
  resultCard.classList.add("d-none");
  wordTitle.textContent = "";
  definitionText.innerHTML = "";
}
