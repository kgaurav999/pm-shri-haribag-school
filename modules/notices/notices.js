/* =========================================================
   NOTICES MODULE
   PM SHRI +2 HARIBAG HIGH SCHOOL
   Public Website
   ========================================================= */

const PUBLIC_NOTICES_API = "http://localhost:3000/api/notices";

let publicNoticesData = [];

/* =========================================================
   LANGUAGE
   ========================================================= */

function getPublicNoticeLanguage() {
  return (
    window.schoolLanguage || localStorage.getItem("schoolLanguage") || "hi"
  );
}

/* =========================================================
   FORMAT NOTICE DATE
   ========================================================= */

function formatPublicNoticeDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  const day = String(date.getDate()).padStart(2, "0");

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

  const language = getPublicNoticeLanguage();

  const month =
    language === "en" ? monthEn[date.getMonth()] : monthHi[date.getMonth()];

  return `${day} ${month} ${date.getFullYear()}`;
}

/* =========================================================
   PDF URL
   Backend / Database field = pdfFile
   ========================================================= */

/* =========================================================
   GET PUBLIC PDF URL
   Backend PDF location:
   backend/uploads/notices/
   ========================================================= */

function getPublicNoticePdfUrl(pdfFile) {
  if (!pdfFile) {
    return "";
  }

  pdfFile = String(pdfFile).trim();

  /* -----------------------------------------
       Already a complete URL
       ----------------------------------------- */

  if (pdfFile.startsWith("http://") || pdfFile.startsWith("https://")) {
    return pdfFile;
  }

  /* -----------------------------------------
       Already has /uploads/notices/
       ----------------------------------------- */

  if (pdfFile.startsWith("/uploads/notices/")) {
    return "http://localhost:3000" + pdfFile;
  }

  /* -----------------------------------------
       Has uploads/notices without first /
       ----------------------------------------- */

  if (pdfFile.startsWith("uploads/notices/")) {
    return "http://localhost:3000/" + pdfFile;
  }

  /* -----------------------------------------
       If backend/database contains only
       filename:
       
       1789517107070-45263329.pdf

       Convert it to:
       
       /uploads/notices/
       ----------------------------------------- */

  const filename = pdfFile.split("/").pop();

  return "http://localhost:3000/uploads/notices/" + filename;
}
/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeNoticeHTML(value) {
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
   OPEN PDF
   ========================================================= */

function openPublicPdf(pdfUrl, title) {
  if (!pdfUrl) {
    return;
  }

  /*
   * PDF viewer/modal HTML is created dynamically.
   * Styling will be handled by notices.css.
   */

  let viewer = document.getElementById("publicPdfViewer");

  /*
   * Create viewer only once.
   */

  if (!viewer) {
    viewer = document.createElement("div");

    viewer.id = "publicPdfViewer";

    viewer.innerHTML = `

            <div
                class="public-pdf-overlay"
                id="publicPdfOverlay"
            >

                <div
                    class="public-pdf-modal"
                >

                    <div
                        class="public-pdf-header"
                    >

                        <strong
                            id="publicPdfTitle"
                        >
                            Notice PDF
                        </strong>

                        <button
                            type="button"
                            id="closePublicPdf"
                            class="close-public-pdf"
                            aria-label="Close PDF"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        class="public-pdf-body"
                    >

                        <iframe
                            id="publicPdfFrame"
                            title="Notice PDF"
                            src=""
                        ></iframe>

                    </div>

                </div>

            </div>

        `;

    document.body.appendChild(viewer);

    /* =============================================
           CLOSE BUTTON
           ============================================= */

    const closeButton = document.getElementById("closePublicPdf");

    if (closeButton) {
      closeButton.addEventListener("click", closePublicPdf);
    }

    /* =============================================
           CLICK OUTSIDE MODAL
           ============================================= */

    const overlay = document.getElementById("publicPdfOverlay");

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          closePublicPdf();
        }
      });
    }
  }

  /* =============================================
       SET PDF
       ============================================= */

  const frame = document.getElementById("publicPdfFrame");

  const titleElement = document.getElementById("publicPdfTitle");

  if (!frame) {
    return;
  }

  frame.src = pdfUrl;

  if (titleElement) {
    titleElement.textContent = title || "Notice PDF";
  }

  viewer.classList.add("open");

  document.body.classList.add("public-pdf-open");
}

/* =========================================================
   CLOSE PDF
   ========================================================= */

function closePublicPdf() {
  const viewer = document.getElementById("publicPdfViewer");

  const frame = document.getElementById("publicPdfFrame");

  if (frame) {
    frame.src = "";
  }

  if (viewer) {
    viewer.classList.remove("open");
  }

  document.body.classList.remove("public-pdf-open");
}

/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePublicPdf();
  }
});

/* =========================================================
   LOAD PUBLIC NOTICES
   ========================================================= */

async function loadPublicNotices() {
  const list = document.getElementById("noticeList");

  if (!list) {
    console.error("Public Notices: #noticeList not found.");

    return;
  }

  list.innerHTML = `

        <div class="notice-loading">

            सूचनाएँ लोड हो रही हैं...

        </div>

    `;

  try {
    const response = await fetch(PUBLIC_NOTICES_API);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const notices = await response.json();

    publicNoticesData = Array.isArray(notices) ? notices : [];

    renderPublicNotices(publicNoticesData);
  } catch (error) {
    console.error("PUBLIC NOTICES ERROR:", error);

    list.innerHTML = `

            <div class="notice-error">

                <strong>
                    सूचनाएँ लोड नहीं हो सकीं।
                </strong>

                <small>
                    Notices could not be loaded.
                </small>

            </div>

        `;
  }
}

/* =========================================================
   RENDER PUBLIC NOTICES
   ========================================================= */

function renderPublicNotices(notices) {
  const list = document.getElementById("noticeList");

  if (!list) {
    return;
  }

  const language = getPublicNoticeLanguage();

  /* =====================================================
       EMPTY STATE
       ===================================================== */

  if (!Array.isArray(notices) || notices.length === 0) {
    list.innerHTML = `

            <div class="notice-empty">

                ${
                  language === "en"
                    ? "No notices available at present."
                    : "अभी कोई सूचना उपलब्ध नहीं है।"
                }

            </div>

        `;

    return;
  }

  /* =====================================================
       NOTICE CARDS
       ===================================================== */

  const noticeHTML = notices
    .map(function (notice) {
      const title = language === "en" ? notice.titleEn : notice.titleHi;

      const description =
        language === "en" ? notice.descriptionEn : notice.descriptionHi;

      const date = formatPublicNoticeDate(notice.date);

      const noticeType = String(notice.noticeType || "text").toLowerCase();

      /*
       * IMPORTANT:
       * Backend field = pdfFile
       */

      const pdfFile = notice.pdfFile || "";

      const pdfUrl = getPublicNoticePdfUrl(pdfFile);

      const externalLink = notice.externalLink || "";

      let actions = "";

      /* =========================================
                   PDF ACTIONS
                   ========================================= */

      if ((noticeType === "pdf" || noticeType === "both") && pdfFile) {
        actions += `

                        <div
                            class="notice-actions"
                        >

                            <button
                                type="button"
                                class="view-pdf-btn"
                                data-pdf-url="${escapeNoticeHTML(pdfUrl)}"
                                data-pdf-title="${escapeNoticeHTML(title || "Notice PDF")}"
                            >

                                📄
                                ${language === "en" ? "View PDF" : "PDF देखें"}

                            </button>


                            <a
                                href="${escapeNoticeHTML(pdfUrl)}"
                                download
                                class="download-pdf-btn"
                            >

                                ⬇
                                ${language === "en" ? "Download" : "डाउनलोड"}

                            </a>

                        </div>

                    `;
      }

      /* =========================================
                   EXTERNAL LINK
                   ========================================= */

      if ((noticeType === "link" || noticeType === "both") && externalLink) {
        actions += `

                        <div
                            class="notice-actions"
                        >

                            <a
                                href="${escapeNoticeHTML(externalLink)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="open-link-btn"
                            >

                                🔗
                                ${
                                  language === "en" ? "Open Link" : "लिंक खोलें"
                                }

                            </a>

                        </div>

                    `;
      }

      /* =========================================
                   IMPORTANT BADGE
                   ========================================= */

      const isImportant =
        notice.important === true || notice.important === "true";

      const importantHTML = isImportant
        ? `

                            <span
                                class="notice-important"
                            >

                                ★
                                ${
                                  language === "en" ? "Important" : "महत्वपूर्ण"
                                }

                            </span>

                        `
        : "";

      /* =========================================
                   DESCRIPTION
                   ========================================= */

      const descriptionHTML = description
        ? `

                            <div
                                class="notice-description"
                            >

                                ${escapeNoticeHTML(description)}

                            </div>

                        `
        : "";

      /* =========================================
                   FINAL NOTICE
                   ========================================= */

      return `

                    <div
                        class="notice-item"
                    >

                        <div
                            class="notice-date"
                        >

                            ${escapeNoticeHTML(date)}

                        </div>


                        <div
                            class="notice-content"
                        >

                            <div
                                class="notice-title"
                            >

                                ${escapeNoticeHTML(title || "")}

                            </div>


                            ${importantHTML}


                            ${descriptionHTML}


                            ${actions}

                        </div>

                    </div>

                `;
    })
    .join("");

  /* =====================================================
       NOTICE TICKER
       ===================================================== */

  list.innerHTML = `

        <div
            class="notice-ticker"
        >

            <div
                class="notice-ticker-track"
            >

                ${noticeHTML}

                ${noticeHTML}

            </div>

        </div>

    `;

  /* =====================================================
       VIEW PDF BUTTONS
       ===================================================== */

  list.querySelectorAll(".view-pdf-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const pdfUrl = button.dataset.pdfUrl;

      const title = button.dataset.pdfTitle;

      openPublicPdf(pdfUrl, title);
    });
  });

  /* =====================================================
       TICKER INTERACTION
       ===================================================== */

  if (typeof setupTickerInteractions === "function") {
    setupTickerInteractions(".notice-ticker", ".notice-ticker-track");
  }
}

/* =========================================================
   REFRESH AFTER LANGUAGE CHANGE
   ========================================================= */

function refreshPublicNotices() {
  if (Array.isArray(publicNoticesData)) {
    renderPublicNotices(publicNoticesData);
  } else {
    loadPublicNotices();
  }
}

/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadPublicNotices();
});
