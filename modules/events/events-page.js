/* =========================================================
   PUBLIC EVENTS PAGE
   PM SHRI +2 HARIBAG HIGH SCHOOL
   ========================================================= */

const EVENTS_PAGE_API = "http://localhost:3000/api/events";

/* =========================================================
   LANGUAGE
   ========================================================= */

let eventsPageLanguage = localStorage.getItem("schoolLanguage") || "hi";

/* =========================================================
   LANGUAGE HELPER
   ========================================================= */

function getEventsPageLanguage() {
  return eventsPageLanguage;
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatEventPageDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString + "T00:00:00");

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

/* =========================================================
   MONTH NAMES
   ========================================================= */

const eventsPageMonthHi = [
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

const eventsPageMonthEn = [
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

/* =========================================================
   ESCAPE HTML
   ========================================================= */

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

/* =========================================================
   LOAD EVENTS
   ========================================================= */

async function loadPublicEventsPage() {
  const list = document.getElementById("allEventsList");

  if (!list) {
    return;
  }

  list.innerHTML = `
        <div class="event-page-loading">
            ${
              eventsPageLanguage === "en"
                ? "Events are loading..."
                : "कार्यक्रम लोड हो रहे हैं..."
            }
        </div>
    `;

  try {
    const response = await fetch(EVENTS_PAGE_API);

    if (!response.ok) {
      throw new Error("Event API Error: " + response.status);
    }

    const events = await response.json();

    renderPublicEventsPage(events);
  } catch (error) {
    console.error("PUBLIC EVENTS PAGE ERROR:", error);

    list.innerHTML = `

            <div class="event-page-error">

                <strong>
                    ${
                      eventsPageLanguage === "en"
                        ? "Events could not be loaded."
                        : "कार्यक्रम लोड नहीं हो सके।"
                    }
                </strong>

                <span>
                    ${
                      eventsPageLanguage === "en"
                        ? "Please try again."
                        : "कृपया दोबारा प्रयास करें।"
                    }
                </span>

                <button
                    type="button"
                    onclick="loadPublicEventsPage()"
                >
                    ${
                      eventsPageLanguage === "en"
                        ? "Try Again"
                        : "दोबारा प्रयास करें"
                    }
                </button>

            </div>

        `;
  }
}

/* =========================================================
   CREATE EVENT HTML
   ========================================================= */

function createPublicEventHTML(event) {
  const rawDate = String(event.date || "").trim();

  let day = "";
  let monthIndex = -1;
  let year = "";

  const dateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateMatch) {
    year = dateMatch[1];
    monthIndex = Number(dateMatch[2]) - 1;
    day = dateMatch[3];
  } else {
    const date = new Date(rawDate);

    if (!Number.isNaN(date.getTime())) {
      day = String(date.getDate()).padStart(2, "0");
      monthIndex = date.getMonth();
      year = String(date.getFullYear());
    }
  }

  const month =
    monthIndex >= 0 && monthIndex <= 11
      ? eventsPageLanguage === "en"
        ? eventsPageMonthEn[monthIndex]
        : eventsPageMonthHi[monthIndex]
      : "";

  const category =
    eventsPageLanguage === "en" ? event.categoryEn : event.categoryHi;

  const title = eventsPageLanguage === "en" ? event.titleEn : event.titleHi;

  const description =
    eventsPageLanguage === "en" ? event.descriptionEn : event.descriptionHi;

  return `

        <article class="event-page-item">


            <!-- DATE -->

            <div class="event-page-date">

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



            <!-- CONTENT -->

            <div class="event-page-content">


                <div class="event-page-category">

                    ${escapeEventHTML(category)}

                </div>


                <h4>
                    ${escapeEventHTML(title)}
                </h4>


                ${
                  description
                    ? `
                            <p class="event-page-description">
                                ${escapeEventHTML(description)}
                            </p>
                          `
                    : ""
                }


            </div>


        </article>

    `;
}

/* =========================================================
   RENDER EVENTS
   ========================================================= */

function renderPublicEventsPage(events) {
  const list = document.getElementById("allEventsList");

  if (!list) {
    return;
  }

  if (!events || events.length === 0) {
    list.innerHTML = `

            <div class="event-page-empty">

                <div class="empty-icon">
                    📅
                </div>

                <strong>
                    ${
                      eventsPageLanguage === "en"
                        ? "No events available."
                        : "अभी कोई कार्यक्रम उपलब्ध नहीं है।"
                    }
                </strong>

                <span>
                    ${
                      eventsPageLanguage === "en"
                        ? "School events will appear here."
                        : "विद्यालय के कार्यक्रम यहाँ दिखाई देंगे।"
                    }
                </span>

            </div>

        `;

    return;
  }

  /*
       Newest events first
    */

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  list.innerHTML = events.map(createPublicEventHTML).join("");
}

/* =========================================================
   LANGUAGE SWITCHER
   ========================================================= */

function setEventsPageLanguage(lang) {
  eventsPageLanguage = lang;

  localStorage.setItem("schoolLanguage", lang);

  document.documentElement.lang = lang === "hi" ? "hi" : "en";

  updateEventsPageStaticLanguage();

  updateEventsPageLanguageButtons();

  loadPublicEventsPage();
}

/* =========================================================
   STATIC LANGUAGE TEXT
   ========================================================= */

function updateEventsPageStaticLanguage() {
  document.querySelectorAll("[data-hi]").forEach(function (element) {
    const text = element.dataset[eventsPageLanguage];

    if (text !== undefined) {
      element.textContent = text;
    }
  });
}

/* =========================================================
   LANGUAGE BUTTONS
   ========================================================= */

function updateEventsPageLanguageButtons() {
  const hiBtn = document.getElementById("hiBtn");

  const enBtn = document.getElementById("enBtn");

  if (hiBtn) {
    hiBtn.classList.toggle("active", eventsPageLanguage === "hi");
  }

  if (enBtn) {
    enBtn.classList.toggle("active", eventsPageLanguage === "en");
  }
}

/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  document.documentElement.lang = eventsPageLanguage === "hi" ? "hi" : "en";

  updateEventsPageStaticLanguage();

  updateEventsPageLanguageButtons();

  loadPublicEventsPage();
});
