// =========================================================
// PM SHRI +2 HARIBAG HIGH SCHOOL
// PUBLIC EVENTS MODULE
// =========================================================

// =========================================================
// API
// =========================================================

const EVENTS_API = "http://localhost:3000/api/events";

// =========================================================
// LANGUAGE
// =========================================================

function getEventsLanguage() {
  return localStorage.getItem("schoolLanguage") || "hi";
}

// =========================================================
// MONTH NAMES
// =========================================================

const EVENT_MONTHS_HI = [
  "जनवरी",
  "फरवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
];

const EVENT_MONTHS_EN = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// =========================================================
// SAFE HTML
// =========================================================

function escapeEventHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================================================
// EVENT DATE PARSER
// =========================================================
//
// API date examples:
//
// 2026-09-16
// 2026-09-16T18:30:00
// 2026-09-16T18:30:00.000Z
//
// We only use YYYY-MM-DD.
// Time is completely ignored.
// =========================================================

function parseEventDate(dateValue) {
  if (dateValue === null || dateValue === undefined) {
    return {
      day: "",
      monthIndex: -1,
      year: "",
    };
  }

  const rawDate = String(dateValue).trim();

  if (!rawDate) {
    return {
      day: "",
      monthIndex: -1,
      year: "",
    };
  }

  // -----------------------------------------
  // Extract only YYYY-MM-DD
  // -----------------------------------------

  const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return {
      day: "",
      monthIndex: -1,
      year: "",
    };
  }

  const year = match[1];

  const monthNumber = Number(match[2]);

  const day = match[3];

  if (monthNumber < 1 || monthNumber > 12) {
    return {
      day: day,
      monthIndex: -1,
      year: year,
    };
  }

  return {
    day: day,

    monthIndex: monthNumber - 1,

    year: year,
  };
}

// =========================================================
// LOAD EVENTS
// =========================================================

async function loadEvents() {
  const grid = document.querySelector(".events-grid");

  if (!grid) {
    console.warn("Events grid not found.");

    return;
  }

  const language = getEventsLanguage();

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  grid.innerHTML = `

        <div class="event-loading">

            ${
              language === "en"
                ? "Events are loading..."
                : "कार्यक्रम लोड हो रहे हैं..."
            }

        </div>

    `;

  try {
    const response = await fetch(EVENTS_API);

    if (!response.ok) {
      throw new Error("Event API Error: " + response.status);
    }

    const events = await response.json();

    console.log("PUBLIC EVENTS:", events);

    renderEvents(events);
  } catch (error) {
    console.error("EVENT API ERROR:", error);

    grid.innerHTML = `

            <div class="event-error">

                ${
                  language === "en"
                    ? "Events could not be loaded."
                    : "कार्यक्रम लोड नहीं हो सके।"
                }

            </div>

        `;
  }
}

// =========================================================
// RENDER EVENTS
// =========================================================

function renderEvents(events) {
  const grid = document.querySelector(".events-grid");

  if (!grid) {
    return;
  }

  const language = getEventsLanguage();

  // -----------------------------------------
  // No events
  // -----------------------------------------

  if (!Array.isArray(events) || events.length === 0) {
    grid.innerHTML = `

            <div class="event-empty">

                ${
                  language === "en"
                    ? "No upcoming events available."
                    : "अभी कोई आगामी कार्यक्रम उपलब्ध नहीं है।"
                }

            </div>

        `;

    return;
  }

  // -----------------------------------------
  // Sort by date
  // -----------------------------------------

  const sortedEvents = [...events].sort(function (a, b) {
    const dateA = String(a.date || "").substring(0, 10);

    const dateB = String(b.date || "").substring(0, 10);

    return dateA.localeCompare(dateB);
  });

  // -----------------------------------------
  // Create event card
  // -----------------------------------------

  function createEventHTML(event) {
    // =====================================
    // DATE
    // =====================================

    const parsedDate = parseEventDate(event.date);

    const day = parsedDate.day || "—";

    const year = parsedDate.year || "";

    let month = "";

    if (parsedDate.monthIndex >= 0 && parsedDate.monthIndex <= 11) {
      month =
        language === "en"
          ? EVENT_MONTHS_EN[parsedDate.monthIndex]
          : EVENT_MONTHS_HI[parsedDate.monthIndex];
    }

    // =====================================
    // CONTENT
    // =====================================

    const category = language === "en" ? event.categoryEn : event.categoryHi;

    const title = language === "en" ? event.titleEn : event.titleHi;

    const description =
      language === "en" ? event.descriptionEn : event.descriptionHi;

    // =====================================
    // CARD
    // =====================================

    return `

            <article class="event-card">


                <!-- EVENT DATE -->

                <div class="event-date">

                    <strong>
                        ${escapeEventHTML(day)}
                    </strong>


                    <span>
                        ${escapeEventHTML(month)}
                    </span>


                    <small>
                        ${escapeEventHTML(year)}
                    </small>

                </div>


                <!-- EVENT INFORMATION -->

                <div class="event-info">


                    ${
                      category
                        ? `
                                <span class="event-category">
                                    ${escapeEventHTML(category)}
                                </span>
                              `
                        : ""
                    }


                    <h3>
                        ${escapeEventHTML(title)}
                    </h3>


                    ${
                      description
                        ? `
                                <p>
                                    ${escapeEventHTML(description)}
                                </p>
                              `
                        : ""
                    }


                </div>


            </article>

        `;
  }

  // -----------------------------------------
  // First group
  // -----------------------------------------

  const eventHTML = sortedEvents.map(createEventHTML).join("");

  // -----------------------------------------
  // Duplicate group
  // -----------------------------------------

  const duplicateHTML = sortedEvents.map(createEventHTML).join("");

  // -----------------------------------------
  // Events ticker
  // -----------------------------------------

  grid.innerHTML = `

        <div class="events-ticker">


            <div class="events-track">


                <!-- FIRST GROUP -->

                <div class="events-group">

                    ${eventHTML}

                </div>


                <!-- DUPLICATE GROUP -->

                <div class="events-group">

                    ${duplicateHTML}

                </div>


            </div>


        </div>

    `;

  // -----------------------------------------
  // Ticker controls
  // -----------------------------------------

  setupEventsTicker();
}

// =========================================================
// EVENTS TICKER
// =========================================================

function setupEventsTicker() {
  const ticker = document.querySelector(".events-ticker");

  if (!ticker) {
    return;
  }

  const track = ticker.querySelector(".events-track");

  if (!track) {
    return;
  }

  // -----------------------------------------
  // Prevent duplicate listeners
  // -----------------------------------------

  if (ticker.dataset.eventsReady === "true") {
    return;
  }

  ticker.dataset.eventsReady = "true";

  // =====================================================
  // DESKTOP
  // Mouse hover = pause
  // =====================================================

  ticker.addEventListener("mouseenter", function () {
    if (window.matchMedia("(hover: hover)").matches) {
      track.style.animationPlayState = "paused";
    }
  });

  ticker.addEventListener("mouseleave", function () {
    if (window.matchMedia("(hover: hover)").matches) {
      track.style.animationPlayState = "running";
    }
  });

  // =====================================================
  // MOBILE
  // Tap = pause
  // Tap again = resume
  // =====================================================

  if (window.matchMedia("(hover: none)").matches) {
    ticker.addEventListener("click", function (event) {
      // -----------------------------------------
      // If there is any future button/link,
      // don't pause ticker.
      // -----------------------------------------

      if (event.target.closest("a, button")) {
        return;
      }

      const currentState = getComputedStyle(track).animationPlayState;

      if (currentState === "paused") {
        track.style.animationPlayState = "running";
      } else {
        track.style.animationPlayState = "paused";
      }
    });
  }
}

// =========================================================
// INITIAL LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
  loadEvents();
});

// =========================================================
// LANGUAGE CHANGE SUPPORT
// =========================================================
//
// script.js already changes localStorage.
// This listener allows Events module to refresh
// when language changes.
// =========================================================

window.addEventListener("storage", function (event) {
  if (event.key === "schoolLanguage") {
    loadEvents();
  }
});
