/* =========================================================
   NOTICES PAGE MODULE
   PM SHRI +2 HARIBAG HIGH SCHOOL
   ========================================================= */

const ALL_NOTICES_API = "http://localhost:3000/api/notices";

let allPublicNotices = [];

/* =========================================================
   LANGUAGE
   ========================================================= */

function getNoticesPageLanguage() {
  return (
    window.schoolLanguage || localStorage.getItem("schoolLanguage") || "hi"
  );
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatNoticesPageDate(dateValue) {
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

  const language = getNoticesPageLanguage();

  const month =
    language === "en" ? monthEn[date.getMonth()] : monthHi[date.getMonth()];

  return `${day} ${month} ${date.getFullYear()}`;
}

/* =========================================================
   PDF URL
   ========================================================= */

function getNoticesPagePdfUrl(pdfFile) {
  if (!pdfFile) {
    return "";
  }

  pdfFile = String(pdfFile).trim();

  if (pdfFile.startsWith("http://") || pdfFile.startsWith("https://")) {
    return pdfFile;
  }

  if (pdfFile.startsWith("/uploads/notices/")) {
    return "http://localhost:3000" + pdfFile;
  }

  if (pdfFile.startsWith("uploads/notices/")) {
    return "http://localhost:3000/" + pdfFile;
  }

  const filename = pdfFile.split("/").pop();

  return "http://localhost:3000/uploads/notices/" + filename;
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeNoticesPageHTML(value) {
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
   PDF VIEWER
   ========================================================= */

function openNoticePdf(pdfUrl, title) {
  if (!pdfUrl) {
    return;
  }

  let viewer = document.getElementById("noticePdfViewer");

  /* =============================================
       CREATE VIEWER
       ============================================= */

  if (!viewer) {
    viewer = document.createElement("div");

    viewer.id = "noticePdfViewer";

    viewer.innerHTML = `

            <div
                class="notice-pdf-overlay"
                id="noticePdfOverlay"
            >

                <div
                    class="notice-pdf-modal"
                >

                    <div
                        class="notice-pdf-header"
                    >

                        <strong
                            id="noticePdfTitle"
                        >
                            Notice PDF
                        </strong>


                        <button
                            type="button"
                            id="closeNoticePdf"
                            class="notice-pdf-close"
                            aria-label="Close PDF"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        class="notice-pdf-body"
                    >

                        <iframe
                            id="noticePdfFrame"
                            title="Notice PDF"
                            src=""
                        ></iframe>

                    </div>

                </div>

            </div>

        `;

    document.body.appendChild(viewer);

    /* =====================================
           CLOSE BUTTON
           ===================================== */

    const closeButton = document.getElementById("closeNoticePdf");

    if (closeButton) {
      closeButton.addEventListener("click", closeNoticePdf);
    }

    /* =====================================
           CLICK OUTSIDE
           ===================================== */

    const overlay = document.getElementById("noticePdfOverlay");

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          closeNoticePdf();
        }
      });
    }
  }

  const frame = document.getElementById("noticePdfFrame");

  const titleElement = document.getElementById("noticePdfTitle");

  if (!frame) {
    return;
  }

  frame.src = pdfUrl;

  if (titleElement) {
    titleElement.textContent = title || "Notice PDF";
  }

  viewer.classList.add("open");

  document.body.classList.add("notice-pdf-open");
}

/* =========================================================
   CLOSE PDF
   ========================================================= */

function closeNoticePdf() {
  const viewer = document.getElementById("noticePdfViewer");

  const frame = document.getElementById("noticePdfFrame");

  if (frame) {
    frame.src = "";
  }

  if (viewer) {
    viewer.classList.remove("open");
  }

  document.body.classList.remove("notice-pdf-open");
}

/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeNoticePdf();
  }
});

/* =========================================================
   LOAD ALL NOTICES
   ========================================================= */

async function loadAllPublicNotices() {
  const list = document.getElementById("allNoticesList");

  if (!list) {
    return;
  }

  try {
    const response = await fetch(ALL_NOTICES_API);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const notices = await response.json();

    allPublicNotices = Array.isArray(notices) ? notices : [];

    renderAllPublicNotices(allPublicNotices);
  } catch (error) {
    console.error("ALL NOTICES ERROR:", error);

    list.innerHTML = `

            <div
                class="notice-page-error"
            >

                <strong>
                    सूचनाएँ लोड नहीं हो सकीं।
                </strong>

                <span>
                    Notices could not be loaded.
                </span>

                <button
                    type="button"
                    id="retryNoticesBtn"
                >
                    Try Again
                </button>

            </div>

        `;

    const retryButton = document.getElementById("retryNoticesBtn");

    if (retryButton) {
      retryButton.addEventListener("click", loadAllPublicNotices);
    }
  }
}

/* =========================================================
   RENDER ALL NOTICES
   ========================================================= */

function renderAllPublicNotices(notices) {
  const list = document.getElementById("allNoticesList");

  if (!list) {
    return;
  }

  const language = getNoticesPageLanguage();

  /* =============================================
       EMPTY
       ============================================= */

  if (!Array.isArray(notices) || notices.length === 0) {
    list.innerHTML = `

            <div
                class="notice-page-empty"
            >

                <div class="empty-icon">
                    📢
                </div>

                <strong>

                    ${
                      language === "en"
                        ? "No notices available"
                        : "अभी कोई सूचना उपलब्ध नहीं है"
                    }

                </strong>

                <span>

                    ${
                      language === "en"
                        ? "Please check again later."
                        : "कृपया बाद में पुनः देखें।"
                    }

                </span>

            </div>

        `;

    return;
  }

  /* =============================================
       NOTICE LIST
       ============================================= */

  list.innerHTML = notices
    .map(function (notice) {
      const title = language === "en" ? notice.titleEn : notice.titleHi;

      const description =
        language === "en" ? notice.descriptionEn : notice.descriptionHi;

      const date = formatNoticesPageDate(notice.date);

      const noticeType = String(notice.noticeType || "text").toLowerCase();

      const pdfFile = notice.pdfFile || "";

      const pdfUrl = getNoticesPagePdfUrl(pdfFile);

      const externalLink = notice.externalLink || "";

      const isImportant =
        notice.important === true || notice.important === "true";

      let actions = "";

      /* =================================
                       PDF
                       ================================= */

      if ((noticeType === "pdf" || noticeType === "both") && pdfFile) {
        actions += `

                            <button
                                type="button"
                                class="notice-page-view-btn"
                                data-pdf-url="${escapeNoticesPageHTML(pdfUrl)}"
                                data-pdf-title="${escapeNoticesPageHTML(title || "Notice PDF")}"
                            >

                                📄

                                ${language === "en" ? "View PDF" : "PDF देखें"}

                            </button>


                            <a
                                href="${escapeNoticesPageHTML(pdfUrl)}"
                                download
                                class="notice-page-download-btn"
                            >

                                ⬇

                                ${language === "en" ? "Download" : "डाउनलोड"}

                            </a>

                        `;
      }

      /* =================================
                       EXTERNAL LINK
                       ================================= */

      if ((noticeType === "link" || noticeType === "both") && externalLink) {
        actions += `

                            <a
                                href="${escapeNoticesPageHTML(externalLink)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="notice-page-link-btn"
                            >

                                🔗

                                ${
                                  language === "en" ? "Open Link" : "लिंक खोलें"
                                }

                            </a>

                        `;
      }

      /* =================================
                       ACTION CONTAINER
                       ================================= */

      const actionsHTML = actions
        ? `

                                <div
                                    class="notice-page-actions"
                                >

                                    ${actions}

                                </div>

                            `
        : "";

      /* =================================
                       IMPORTANT
                       ================================= */

      const importantHTML = isImportant
        ? `

                                <span
                                    class="notice-page-important"
                                >

                                    ★

                                    ${
                                      language === "en"
                                        ? "Important"
                                        : "महत्वपूर्ण"
                                    }

                                </span>

                            `
        : "";

      /* =================================
                       DESCRIPTION
                       ================================= */

      const descriptionHTML = description
        ? `

                                <p
                                    class="notice-page-description"
                                >

                                    ${escapeNoticesPageHTML(description)}

                                </p>

                            `
        : "";

      /* =================================
                       NOTICE CARD
                       ================================= */

      return `

                        <article
                            class="notice-page-item"
                        >


                            <div
                                class="notice-page-date"
                            >

                                <strong>
                                    ${escapeNoticesPageHTML(date)}
                                </strong>

                            </div>


                            <div
                                class="notice-page-content"
                            >

                                <div
                                    class="notice-page-title-row"
                                >

                                    <h4>
                                        ${escapeNoticesPageHTML(title || "")}
                                    </h4>


                                    ${importantHTML}

                                </div>


                                ${descriptionHTML}


                                ${actionsHTML}

                            </div>


                        </article>

                    `;
    })
    .join("");

  /* =============================================
       VIEW PDF BUTTONS
       ============================================= */

  list.querySelectorAll(".notice-page-view-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      openNoticePdf(
        button.dataset.pdfUrl,

        button.dataset.pdfTitle,
      );
    });
  });
}

/* =========================================================
   LANGUAGE CHANGE
   ========================================================= */

function refreshAllPublicNotices() {
  if (Array.isArray(allPublicNotices)) {
    renderAllPublicNotices(allPublicNotices);
  }
}

/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadAllPublicNotices();
});
