// =========================================
// SCHOOL WEBSITE JAVASCRIPT
// PM SHRI +2 HARIBAG HIGH SCHOOL
// =========================================

// =========================================
// LANGUAGE
// =========================================

let language = localStorage.getItem("schoolLanguage") || "hi";

// =========================================
// DYNAMIC NOTICES
// =========================================

async function loadNotices() {
  const list = document.getElementById("noticeList");

  if (!list) {
    return;
  }

  list.innerHTML = `
    <div class="notice-loading">
      ${
        language === "en"
          ? "Notices are loading..."
          : "सूचनाएँ लोड हो रही हैं..."
      }
    </div>
  `;

  try {
    const response = await fetch("http://localhost:3000/api/notices");

    if (!response.ok) {
      throw new Error("Server returned status: " + response.status);
    }

    const notices = await response.json();

    renderNotices(notices);
  } catch (error) {
    console.error("NOTICE API ERROR:", error);

    list.innerHTML = `
      <div class="notice-error">

        <strong>
          ${
            language === "en"
              ? "Notices could not be loaded."
              : "सूचनाएँ लोड नहीं हो सकीं।"
          }
        </strong>

        <small>
          ${
            language === "en"
              ? "Please try again later."
              : "कृपया बाद में दोबारा प्रयास करें।"
          }
        </small>

      </div>
    `;
  }
}

// =========================================
// RENDER NOTICES
// =========================================

function renderNotices(notices) {
  const list = document.getElementById("noticeList");

  if (!list) {
    return;
  }

  if (!notices || notices.length === 0) {
    list.innerHTML = `
      <div class="notice-empty">

        ${
          language === "en"
            ? "No notices available."
            : "अभी कोई सूचना उपलब्ध नहीं है।"
        }

      </div>
    `;

    return;
  }

  const noticeHTML = notices
    .map(function (notice) {
      const title = language === "en" ? notice.titleEn : notice.titleHi;

      return `

          <div class="notice-item">

            <div class="notice-date">
              ${notice.date || ""}
            </div>

            <div class="notice-content">

              <span class="notice-title">
                ${title || ""}
              </span>

              ${
                notice.important
                  ? `
                    <span class="notice-badge">
                      ${language === "en" ? "Important" : "महत्वपूर्ण"}
                    </span>
                  `
                  : ""
              }

            </div>

          </div>

        `;
    })
    .join("");

  list.innerHTML = `

    <div class="notice-ticker">

      <div class="notice-ticker-track">

        ${noticeHTML}
        ${noticeHTML}

      </div>

    </div>

  `;
}

// =========================================
// DYNAMIC EVENTS
// =========================================

async function loadEvents() {
  const grid = document.querySelector(".events-grid");

  if (!grid) {
    return;
  }

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
    const response = await fetch("http://localhost:3000/api/events");

    if (!response.ok) {
      throw new Error("Event API Error: " + response.status);
    }

    const events = await response.json();

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

// =========================================
// RENDER EVENTS
// =========================================

function renderEvents(events) {
  const grid = document.querySelector(".events-grid");

  if (!grid) {
    return;
  }

  if (!events || events.length === 0) {
    grid.innerHTML = `
      <div class="event-empty">

        ${
          language === "en"
            ? "No events available."
            : "अभी कोई कार्यक्रम उपलब्ध नहीं है।"
        }

      </div>
    `;

    return;
  }

  // =======================================
  // MONTH NAMES
  // =======================================

  const monthHi = [
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

  const monthEn = [
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

  // =======================================
  // SORT EVENTS
  // =======================================

  events.sort(function (a, b) {
    const dateA = String(a.date || "");

    const dateB = String(b.date || "");

    return dateA.localeCompare(dateB);
  });

  // =======================================
  // CREATE EVENT HTML
  // =======================================

  const eventHTML = events
    .map(function (event) {
      /*
         Expected date:
         YYYY-MM-DD
        */

      const eventDate = String(event.date || "").trim();

      let day = "—";
      let month = "";
      let year = "";

      // -----------------------------------
      // SAFE DATE PARSING
      // -----------------------------------

      const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

      if (dateMatch) {
        year = dateMatch[1];

        const monthNumber = Number(dateMatch[2]);

        day = dateMatch[3];

        if (monthNumber >= 1 && monthNumber <= 12) {
          const monthIndex = monthNumber - 1;

          month = language === "en" ? monthEn[monthIndex] : monthHi[monthIndex];
        }
      }

      // -----------------------------------
      // LANGUAGE CONTENT
      // -----------------------------------

      const category = language === "en" ? event.categoryEn : event.categoryHi;

      const title = language === "en" ? event.titleEn : event.titleHi;

      const description =
        language === "en" ? event.descriptionEn : event.descriptionHi;

      return `

          <article class="event-card">


            <!-- EVENT DATE -->

            <div class="event-date">

              <strong>
                ${day}
              </strong>

              <span>
                ${month}
              </span>

              <small>
                ${year}
              </small>

            </div>


            <!-- EVENT INFORMATION -->

            <div class="event-info">


              ${
                category
                  ? `
                    <span class="event-category">
                      ${category}
                    </span>
                  `
                  : ""
              }


              <h3>
                ${title || ""}
              </h3>


              ${
                description
                  ? `
                    <p>
                      ${description}
                    </p>
                  `
                  : ""
              }


            </div>


          </article>

        `;
    })
    .join("");

  // =======================================
  // SEAMLESS EVENT TICKER
  // =======================================

  grid.innerHTML = `

    <div class="events-ticker">

      <div class="events-track">

        <div class="events-group">

          ${eventHTML}

        </div>


        <div class="events-group">

          ${eventHTML}

        </div>

      </div>

    </div>

  `;
}

// =========================================
// LANGUAGE SWITCHER
// =========================================

function setLanguage(lang) {
  language = lang;

  localStorage.setItem("schoolLanguage", lang);

  document.documentElement.lang = lang === "hi" ? "hi" : "en";

  // =======================================
  // LANGUAGE BUTTONS
  // =======================================

  const hiBtn = document.getElementById("hiBtn");

  const enBtn = document.getElementById("enBtn");

  if (hiBtn) {
    hiBtn.classList.toggle("active", lang === "hi");
  }

  if (enBtn) {
    enBtn.classList.toggle("active", lang === "en");
  }

  // =======================================
  // BILINGUAL ELEMENTS
  // =======================================

  document.querySelectorAll("[data-hi]").forEach(function (element) {
    const text = element.dataset[lang];

    if (text !== undefined) {
      element.textContent = text;
    }
  });

  // =======================================
  // TAGLINE
  // =======================================

  const tagline = document.getElementById("tagline");

  if (tagline) {
    tagline.textContent =
      lang === "hi"
        ? "ज्ञान • अनुशासन • उत्कृष्टता"
        : "Knowledge • Discipline • Excellence";
  }

  // =======================================
  // HERO TITLE
  // =======================================

  const heroTitle = document.getElementById("heroTitle");

  if (heroTitle) {
    heroTitle.textContent =
      lang === "hi"
        ? "शिक्षा से सशक्त समाज का निर्माण"
        : "Empowering Society Through Education";
  }

  // =======================================
  // HERO SUBTITLE
  // =======================================

  const heroSub = document.getElementById("heroSub");

  if (heroSub) {
    heroSub.textContent =
      lang === "hi"
        ? "Empowering Lives Through Education"
        : "शिक्षा के माध्यम से जीवन को सशक्त बनाना";
  }

  // =======================================
  // HERO BUTTON
  // =======================================

  const heroBtn = document.getElementById("heroBtn");

  if (heroBtn) {
    heroBtn.textContent =
      lang === "hi" ? "हमारे बारे में जानें →" : "Learn About Us →";
  }

  // =======================================
  // ABOUT TEXT
  // =======================================

  const aboutText = document.getElementById("aboutText");

  if (aboutText) {
    aboutText.textContent =
      lang === "hi"
        ? "पीएम श्री +2 हरिबाग उच्च विद्यालय, Dhekwaha-Saraiya, Islampur-801303, Nalanda, Bihar स्थित एक सरकारी विद्यालय है, जो कक्षा 6 से 12 तक गुणवत्तापूर्ण एवं समावेशी शिक्षा प्रदान करने के लिए प्रतिबद्ध है।"
        : "PM SHRI +2 Haribag High School, located at Dhekwaha-Saraiya, Islampur-801303, Nalanda, Bihar, is a government school committed to providing quality and inclusive education from Classes 6 to 12.";
  }

  // =======================================
  // RELOAD DYNAMIC CONTENT
  // =======================================

  loadNotices();

  loadEvents();
}

// =========================================
// PAGE READY
// =========================================

document.addEventListener("DOMContentLoaded", function () {
  // =====================================
  // LANGUAGE BUTTONS
  // =====================================

  const hiBtn = document.getElementById("hiBtn");

  const enBtn = document.getElementById("enBtn");

  if (hiBtn) {
    hiBtn.addEventListener("click", function () {
      setLanguage("hi");
    });
  }

  if (enBtn) {
    enBtn.addEventListener("click", function () {
      setLanguage("en");
    });
  }

  // =====================================
  // MOBILE MENU
  // =====================================

  const menuToggle = document.getElementById("menuToggle");

  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  // =====================================
  // CLOSE MOBILE MENU
  // =====================================

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (navLinks) {
        navLinks.classList.remove("open");
      }
    });
  });

  // =====================================
  // INITIAL LANGUAGE
  // =====================================

  setLanguage(language);
});
