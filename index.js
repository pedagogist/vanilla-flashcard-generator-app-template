import "./actions.js";
import { openDB } from "https://cdn.jsdelivr.net/npm/idb/+esm";

// IndexedDB initialization
export let db;
let cards = [];

async function initDB() {
	db = await openDB("flashcardDB", 1, {
		upgrade(db) {
			if (!db.objectStoreNames.contains("cards")) {
				db.createObjectStore("cards", { keyPath: "id" });
			}
		}
	});

	return reloadCardsFromDB();
}

export async function reloadCardsFromDB() {
	// Get all cards from DB
	cards = await db.getAll("cards");

	// Sort cards by due date
	cards.sort((a, b) => {
		const dateA = a.progress?.dueDate ? new Date(a.progress.dueDate) : Infinity;
		const dateB = b.progress?.dueDate ? new Date(b.progress.dueDate) : Infinity;
		return dateA - dateB;
	});

	// Render the UI
	initEntries();
	renderCard();
}

let currentIndex = 0;

/** Creates a table row for each card, allowing quick navigation. */
function initEntries() {
	// Clear existing rows
	document.getElementById("entries-body").textContent = "";

	// Build table rows
	for (const [index, card] of cards.entries()) {
		const row = document.createElement("tr");
		row.addEventListener("click", () => {
			currentIndex = index;
			renderCard();
		});

		const cellImage = document.createElement("td");
		const img = document.createElement("img");
		img.src = URL.createObjectURL(card.image);
		img.className = "entries-image";
		cellImage.appendChild(img);

		const cellWord = document.createElement("td");
		cellWord.textContent = card.word;

		const cellDue = document.createElement("td");
		cellDue.textContent = card.progress?.dueDate ?? "Unseen"; // If the card has not been learnt before, mark it as "Unseen"

		const cellAction = document.createElement("td");
		const btnDelete = document.createElement("button");
		btnDelete.textContent = "🗑️";
		btnDelete.className = "btn-delete";
		btnDelete.addEventListener("click", event => {
			event.stopPropagation(); // Prevent row click
			deleteCard(card.id, index);
		});
		cellAction.appendChild(btnDelete);

		row.appendChild(cellImage);
		row.appendChild(cellWord);
		row.appendChild(cellDue);
		row.appendChild(cellAction);
		document.getElementById("entries-body").appendChild(row);
	}
}

// Function to delete a card
async function deleteCard(cardId, index) {
	if (!confirm("Are you sure you want to delete this flashcard?")) {
		return;
	}

	try {
		// Delete from the database
		await db.delete("cards", cardId);

		// Remove from local array
		cards.splice(index, 1);

		// Re-render entries
		initEntries();

		// Adjust current index if needed
		if (cards.length === 0) {
			// No cards left
			currentIndex = 0;
		} else if (currentIndex >= cards.length) {
			// Current card was deleted, move to the last card
			currentIndex = cards.length - 1;
		}

		renderCard();
	} catch (error) {
		console.error("Error deleting card:", error);
	}
}

/** Updates highlighted row and due dates each time we render or change data. */
function updateEntries() {
	// Update row highlight and due dates
	for (const [index, card] of cards.entries()) {
		const row = document.getElementById("entries-body").children[index];
		row.classList.toggle("row-highlight", index === currentIndex);

		const cellDue = row.children[2]; // Due date is at index 2
		const dueDateString = card.progress?.dueDate;
		if (dueDateString) {
			cellDue.textContent = dueDateString;
			// If the due date is earlier than today, mark it as overdue
			const dueDate = new Date(dueDateString);
			const today = new Date();
			cellDue.classList.toggle("overdue-date", dueDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0));
		} else {
			cellDue.textContent = "Unseen";
			cellDue.classList.remove("overdue-date");
		}
	}
}

/**
 * Mapping between abbreviated and full forms of parts of speech.
 * You can use the same technique to transform your data.
 */
const posMapping = {
	n: "noun",
	v: "verb",
	adj: "adjective",
	adv: "adverb",
	// Add more mappings as needed
};

const transitionHalfDuration = parseFloat(getComputedStyle(document.getElementById("card-inner")).transitionDuration) * 1000 / 2;

/** Renders the current card on both front and back. */
function renderCard() {
	if (cards.length === 0) {
		document.getElementById("card-front-word").textContent = "No flashcards available";
		document.getElementById("card-inner").dataset.side = "front";

		// Clear all fields
		document.getElementById("card-front-image").removeAttribute("src");
		document.getElementById("card-back-word").textContent = "";
		document.getElementById("card-back-pronunciation-uk").textContent = "—";
		document.getElementById("card-back-pronunciation-us").textContent = "—";
		document.getElementById("card-back-pos-container").textContent = "";
		document.getElementById("card-back-definition").textContent = "";
		document.getElementById("card-back-example").textContent = "";
		document.getElementById("card-back-image").removeAttribute("src");
		return;
	}

	// STUDENTS: Start of recommended modifications
	// If there are more fields in the dataset (e.g., synonyms),
	// display them here (e.g., document.getElementById("card-back-synonym").textContent = currentCard.synonym).

	// Update the front side with the current card's word
	const currentCard = cards[currentIndex];
	document.getElementById("card-front-word").textContent = currentCard.word;

	// Display image on front side
	document.getElementById("card-front-image").src = URL.createObjectURL(currentCard.image);

	// Reset flashcard to the front side
	document.getElementById("card-inner").dataset.side = "front";

	// Wait for the back side to become invisible before updating the content
	setTimeout(() => {
		// Update word on back side
		document.getElementById("card-back-word").textContent = currentCard.word;

		// Update pronunciations, default to "—" if empty
		document.getElementById("card-back-pronunciation-uk").textContent = currentCard.pronunciationUK || "—";
		document.getElementById("card-back-pronunciation-us").textContent = currentCard.pronunciationUS || "—";

		// Clear previous parts of speech
		document.getElementById("card-back-pos-container").textContent = "";

		// Create a span for each part of speech
		for (const pos of Array.isArray(currentCard.pos) ? currentCard.pos : [currentCard.pos]) {
			const span = document.createElement("span");
			span.className = "card-back-pos";
			span.textContent = posMapping[pos] ?? pos;
			document.getElementById("card-back-pos-container").appendChild(span);
		}

		// Update definition
		document.getElementById("card-back-definition").textContent = currentCard.definition ?? "";

		// Update example sentence
		document.getElementById("card-back-example").textContent = currentCard.exampleSentence ?? "";

		// Update image on back side
		document.getElementById("card-back-image").src = URL.createObjectURL(currentCard.image);
	}, transitionHalfDuration);
	// STUDENTS: End of recommended modifications

	updateEntries();
}

// Toggle the entries list when the hamburger button in the heading is clicked
document.getElementById("toggle-entries").addEventListener("click", () => {
	document.getElementById("entries").hidden = !document.getElementById("entries").hidden;
});

// Toggle the tools interface when the picture button in the heading is clicked
document.getElementById("toggle-tools").addEventListener("click", () => {
	if (document.getElementById("tools").hidden) {
		// The tools interface and feedback area are currently hidden. Show them.
		document.getElementById("tools").hidden = false;
		document.getElementById("operation-feedback").hidden = false;

		// Hide the entries list, flashcard area and actions
		document.getElementById("entries").hidden = true;
		document.getElementById("card").hidden = true;
		document.getElementById("actions").hidden = true;

		// Make the toggle entries button ineffective
		document.getElementById("toggle-entries").disabled = true;
	} else {
		// The tools interface and feedback area are currently visible. Hide them.
		document.getElementById("tools").hidden = true;
		document.getElementById("operation-feedback").hidden = true;

		// Restore flashcard area, actions and the toggle entries button, but leave the entries list hidden
		document.getElementById("card").hidden = false;
		document.getElementById("actions").hidden = false;
		document.getElementById("toggle-entries").disabled = false;
	}
});

// Flip the card when the card itself is clicked
document.getElementById("card-inner").addEventListener("click", event => {
	event.currentTarget.dataset.side = event.currentTarget.dataset.side === "front" ? "back" : "front";
});

/** Navigates to the previous card. */
function previousCard() {
	currentIndex = (currentIndex - 1 + cards.length) % cards.length;
}

/** Navigates to the next card. */
function nextCard() {
	currentIndex = (currentIndex + 1) % cards.length;
}

document.getElementById("btn-back").addEventListener("click", () => {
	previousCard();
	renderCard();
});
document.getElementById("btn-skip").addEventListener("click", () => {
	nextCard();
	renderCard();
});

/**
 * Mapping between the user's selection (Again, Good, Easy) and the number of days until the due date.
 */
const dayOffset = { again: 1, good: 3, easy: 7 };

/**
 * Records learning progress by updating the card's due date based on the user's selection (Again, Good, Easy).
 */
async function updateDueDate(type) {
	const card = cards[currentIndex];
	const today = new Date();
	const dueDate = new Date(today.setDate(today.getDate() + dayOffset[type]) - today.getTimezoneOffset() * 60 * 1000);
	const dueDateString = dueDate.toISOString().split("T")[0]; // Format in YYYY-MM-DD format

	// Update card's progress in memory
	(card.progress ??= {}).dueDate = dueDateString;

	// Save to IndexedDB
	await db.put("cards", card);

	updateEntries();
}

document.getElementById("btn-again").addEventListener("click", async () => {
	await updateDueDate("again");
	nextCard();
	renderCard();
});
document.getElementById("btn-good").addEventListener("click", async () => {
	await updateDueDate("good");
	nextCard();
	renderCard();
});
document.getElementById("btn-easy").addEventListener("click", async () => {
	await updateDueDate("easy");
	nextCard();
	renderCard();
});

// Initialize database and the app
initDB();
