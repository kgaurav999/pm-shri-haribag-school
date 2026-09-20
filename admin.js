// =========================================
// ADMIN PANEL JAVASCRIPT
// PM SHRI +2 HARIBAG HIGH SCHOOL
// =========================================

// =========================================
// API URLS
// =========================================
const EVENTS_API = "http://127.0.0.1:3000/api/events";
const NOTICES_API = "http://127.0.0.1:3000/api/notices";
const GALLERY_API = "http://127.0.0.1:3000/api/gallery";

// =========================================
// GALLERY
// =========================================

const galleryForm = document.getElementById("galleryForm");
const adminGalleryGrid = document.getElementById("adminGalleryGrid");

// =========================================
// LOAD GALLERY
// =========================================

async function loadAdminGallery() {
  if (!adminGalleryGrid) {
    return;
  }

  adminGalleryGrid.innerHTML = `
    <div class="loading">
      Gallery लोड हो रही है...
    </div>
  `;

  try {
    const response = await fetch(GALLERY_API);

    if (!response.ok) {
      throw new Error("Failed to load gallery");
    }

    const gallery = await response.json();

    if (!Array.isArray(gallery) || gallery.length === 0) {
      adminGalleryGrid.innerHTML = `
        <div class="empty">
          अभी कोई photo उपलब्ध नहीं है।
        </div>
      `;
      return;
    }

    adminGalleryGrid.innerHTML = gallery
      .map(function (photo) {
        return `
          <div class="gallery-admin-card">

            <img
              src="http://localhost:3000/uploads/${photo.image_file}"
              alt="${photo.title_en || "Gallery Photo"}"
            >

            <div class="gallery-admin-info">

              <h4>
                ${photo.title_hi || ""}
              </h4>

              <p>
                ${photo.title_en || ""}
              </p>

              <small>
                ${photo.category_hi || photo.category_en || ""}
              </small>

              <div class="gallery-admin-actions">

                <button
                  type="button"
                  class="table-action delete gallery-delete-btn"
                  data-id="${photo.id}"
                >
                  Delete
                </button>

              </div>

            </div>

                      </div>
                    `;
      })
      .join("");
  } catch (error) {
    console.error("ADMIN GALLERY ERROR:", error);

    adminGalleryGrid.innerHTML = `
                  <div class="empty">
                    Gallery load नहीं हो सकी।
                  </div>
                `;
  }
}

// =========================================
// ADD GALLERY PHOTO
// =========================================

if (galleryForm) {
  galleryForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();

    const imageInput = document.getElementById("galleryImage");

    formData.append("image", imageInput.files[0]);

    formData.append(
      "titleHi",
      document.getElementById("galleryTitleHi").value.trim(),
    );

    formData.append(
      "titleEn",
      document.getElementById("galleryTitleEn").value.trim(),
    );

    formData.append(
      "categoryHi",
      document.getElementById("galleryCategoryHi").value.trim(),
    );

    formData.append(
      "categoryEn",
      document.getElementById("galleryCategoryEn").value.trim(),
    );

    formData.append(
      "displayOrder",
      Number(document.getElementById("galleryDisplayOrder").value) || 0,
    );

    try {
      const response = await fetch(GALLERY_API, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gallery photo upload failed.");
      }

      /* SUCCESS POPUP */
      /* SUCCESS POPUP */

      alert(
        "Gallery photo successfully added! ✓\n" + "फोटो सफलतापूर्वक add हो गई।",
      );

      galleryForm.reset();

      document.getElementById("galleryDisplayOrder").value = 0;

      /* Keep Gallery module open after adding */
      if (typeof window.showGallery === "function") {
        window.showGallery();
      } else {
        await loadAdminGallery();
      }

      /* Update Dashboard Gallery Count */

      if (typeof loadDashboardGallery === "function") {
        await loadDashboardGallery();
      }
    } catch (error) {
      console.error("ADD GALLERY ERROR:", error);

      alert(error.message || "Gallery photo upload नहीं हो सकी।");
    }
  });
}

// =========================================
// EVENT ELEMENTS
// =========================================

const eventForm = document.getElementById("eventForm");

const eventsList = document.getElementById("eventsList");

const eventCount = document.getElementById("eventCount");

const message = document.getElementById("message");

const addEventBtn = document.getElementById("addEventBtn");

const eventFormCard = document.getElementById("eventFormCard");

const closeEventFormBtn = document.getElementById("closeEventFormBtn");

const cancelEventBtn = document.getElementById("cancelEventBtn");

const eventMessage = document.getElementById("eventMessage");

// =========================================
// NOTICE ELEMENTS
// =========================================

const noticeForm = document.getElementById("noticeForm");

const noticesList = document.getElementById("noticesList");

const noticeCount = document.getElementById("noticeCount");

const noticeMessage = document.getElementById("noticeMessage");

// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
// =====================================================
// =====================================================
//                    EVENTS
// =====================================================
// =====================================================

// =========================================
// LOAD EVENTS
// =========================================

async function loadAdminEvents() {
  if (!eventsList) {
    return;
  }

  eventsList.innerHTML = `
        <div class="loading">
            Events लोड हो रहे हैं...
        </div>
    `;

  try {
    const response = await fetch(EVENTS_API);

    if (!response.ok) {
      throw new Error("Failed to load events");
    }

    const events = await response.json();

    if (eventCount) {
      eventCount.textContent = `${events.length} Events`;
    }

    if (!events || events.length === 0) {
      eventsList.innerHTML = `
                <div class="empty">
                    अभी कोई event उपलब्ध नहीं है।
                </div>
            `;

      return;
    }

    // Sort by date

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    eventsList.innerHTML = events
      .map((event) => {
        return `

                        <div class="admin-event">

                            <div class="admin-event-info">

                                <div class="admin-event-date">
                                    ${formatDate(event.date)}
                                </div>

                                <div class="admin-event-title">
                                    ${event.titleHi}
                                </div>

                                <div class="admin-event-title-en">
                                    ${event.titleEn}
                                </div>

                                <div class="admin-event-category">
                                    ${event.categoryHi}
                                </div>

                            </div>


                            <div class="event-actions">

                                <button
                                    class="edit-btn"
                                    onclick="editEvent(${event.id})"
                                >
                                    Edit
                                </button>

                                <button
                                    class="delete-btn"
                                    onclick="deleteEvent(${event.id})"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    `;
      })
      .join("");
  } catch (error) {
    console.error("ADMIN EVENT ERROR:", error);

    eventsList.innerHTML = `
            <div class="empty">
                Events load नहीं हो सके।
            </div>
        `;
  }
}

// =========================================
// EDIT EVENT
// =========================================

async function editEvent(id) {
  try {
    const response = await fetch(`${EVENTS_API}/${id}`);

    if (!response.ok) {
      throw new Error("Event could not be loaded.");
    }

    const event = await response.json();

    document.getElementById("eventDate").value = event.date;

    document.getElementById("categoryHi").value = event.categoryHi;

    document.getElementById("categoryEn").value = event.categoryEn;

    document.getElementById("titleHi").value = event.titleHi;

    document.getElementById("titleEn").value = event.titleEn;

    document.getElementById("descriptionHi").value = event.descriptionHi;

    document.getElementById("descriptionEn").value = event.descriptionEn;

    eventForm.dataset.editingId = id;

    const button = eventForm.querySelector(".add-event-btn");

    button.textContent = "✓ Update Event";

    message.className = "message";

    message.textContent = "";

    eventForm.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("EDIT EVENT ERROR:", error);

    alert("Event load नहीं हो सका।");
  }
}

// =========================================
// ADD / UPDATE EVENT
// =========================================

if (eventForm) {
  eventForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    message.className = "message";

    message.textContent = "";

    const button = eventForm.querySelector(".add-event-btn");

    button.disabled = true;

    button.textContent = "Saving Event...";

    const editingId = eventForm.dataset.editingId;

    const eventData = {
      date: document.getElementById("eventDate").value,

      categoryHi: document.getElementById("categoryHi").value.trim(),

      categoryEn: document.getElementById("categoryEn").value.trim(),

      titleHi: document.getElementById("titleHi").value.trim(),

      titleEn: document.getElementById("titleEn").value.trim(),

      descriptionHi: document.getElementById("descriptionHi").value.trim(),

      descriptionEn: document.getElementById("descriptionEn").value.trim(),
    };

    try {
      let response;

      if (editingId) {
        response = await fetch(`${EVENTS_API}/${editingId}`, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch(EVENTS_API, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(eventData),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed.");
      }

      message.className = "message success";

      message.textContent = editingId
        ? "Event successfully updated. ✓"
        : "Event successfully added. ✓";

      eventForm.reset();

      eventForm.dataset.editingId = "";

      button.textContent = "+ Add Event";

      await loadAdminEvents();
    } catch (error) {
      console.error("SAVE EVENT ERROR:", error);

      message.className = "message error";

      message.textContent = error.message || "Event save नहीं हो सका.";
    } finally {
      button.disabled = false;

      if (eventForm.dataset.editingId) {
        button.textContent = "✓ Update Event";
      } else {
        button.textContent = "+ Add Event";
      }
    }
  });
}

// =========================================
// DELETE EVENT
// =========================================

async function deleteEvent(id) {
  const confirmDelete = confirm(
    "क्या आप इस event को permanently delete करना चाहते हैं?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${EVENTS_API}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Delete failed.");
    }

    await loadAdminEvents();
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    alert("Event delete नहीं हो सका।");
  }
}

// =====================================================
// =====================================================
//                    NOTICES
// =====================================================
/* =========================================================
   NOTICE FORM OPEN / CLOSE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const addNoticeBtn = document.getElementById("addNoticeBtn");

  const noticeFormCard = document.getElementById("noticeFormCard");

  const closeNoticeFormBtn = document.getElementById("closeNoticeFormBtn");

  const cancelNoticeBtn = document.getElementById("cancelNoticeBtn");

  /* -----------------------------------------
       OPEN NOTICE FORM
       ----------------------------------------- */

  if (addNoticeBtn) {
    addNoticeBtn.addEventListener("click", function () {
      if (noticeFormCard) {
        noticeFormCard.style.display = "block";

        noticeFormCard.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  /* -----------------------------------------
       CLOSE NOTICE FORM
       ----------------------------------------- */

  function closeNoticeForm() {
    if (noticeFormCard) {
      noticeFormCard.style.display = "none";
    }
  }

  /* Close using X */

  if (closeNoticeFormBtn) {
    closeNoticeFormBtn.addEventListener("click", closeNoticeForm);
  }

  /* Close using Cancel */

  if (cancelNoticeBtn) {
    cancelNoticeBtn.addEventListener("click", closeNoticeForm);
  }
});

// =====================================================

// =========================================
// LOAD NOTICES
// =========================================

async function loadAdminNotices() {
  if (!noticesList) {
    return;
  }

  noticesList.innerHTML = `
        <div class="loading">
            Notices लोड हो रहे हैं...
        </div>
    `;

  try {
    const response = await fetch(NOTICES_API);

    if (!response.ok) {
      throw new Error("Failed to load notices");
    }

    const notices = await response.json();

    if (noticeCount) {
      noticeCount.textContent = `${notices.length} Notices`;
    }

    if (!notices || notices.length === 0) {
      noticesList.innerHTML = `
                <div class="empty">
                    अभी कोई notice उपलब्ध नहीं है।
                </div>
            `;

      return;
    }

    // Newest first

    notices.sort((a, b) => new Date(b.date) - new Date(a.date));

    noticesList.innerHTML = notices
      .map((notice) => {
        return createNoticeHTML(notice);
      })
      .join("");
  } catch (error) {
    console.error("ADMIN NOTICE ERROR:", error);

    noticesList.innerHTML = `
            <div class="empty">
                Notices load नहीं हो सके।
            </div>
        `;
  }
}

// =========================================
// CREATE NOTICE HTML
// =========================================
function createNoticeHTML(notice) {
  const pdfFile = notice.pdfFile || "";

  let pdfUrl = "";

  if (pdfFile) {
    if (pdfFile.startsWith("http://") || pdfFile.startsWith("https://")) {
      pdfUrl = pdfFile;
    } else if (pdfFile.startsWith("/")) {
      pdfUrl = `http://localhost:3000${pdfFile}`;
    } else {
      pdfUrl = `http://localhost:3000/uploads/notices/${pdfFile}`;
    }
  }

  const pdfExists = Boolean(pdfFile);
  const linkExists = Boolean(notice.externalLink);

  const noticeType = notice.noticeType || "text";

  let actions = "";

  // =========================================
  // PDF BUTTONS
  // =========================================

  if (noticeType === "pdf" || noticeType === "both") {
    if (pdfExists) {
      actions += `
                <a
                    href="${pdfUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="view-pdf-btn"
                >
                    📄 View PDF
                </a>
            `;

      actions += `
                <a
                    href="${pdfUrl}"
                    download
                    class="download-pdf-btn"
                >
                    ⬇ Download
                </a>
            `;
    }
  }

  // =========================================
  // EXTERNAL LINK
  // =========================================

  if (noticeType === "link" || noticeType === "both") {
    if (linkExists) {
      actions += `
                <a
                    href="${notice.externalLink}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="open-link-btn"
                >
                    🔗 Open Link
                </a>
            `;
    }
  }

  // =========================================
  // EDIT
  // =========================================

  actions += `
        <button
            class="notice-edit-btn"
            onclick="editNotice(${notice.id})"
        >
            Edit
        </button>
    `;

  // =========================================
  // DELETE
  // =========================================

  actions += `
        <button
            class="notice-delete-btn"
            onclick="deleteNotice(${notice.id})"
        >
            Delete
        </button>
    `;

  // =========================================
  // NOTICE HTML
  // =========================================

  return `

        <div class="admin-notice">

            <div class="admin-notice-info">

                <div class="admin-notice-date">

                ${formatDate(notice.date || notice.notice_date)}    

                    ${
                      notice.important
                        ? `
                                <span class="important-badge">
                                    ★ Important
                                </span>
                              `
                        : ""
                    }

                </div>


                <div class="admin-notice-title">
                    ${notice.titleHi}
                </div>


                <div class="admin-notice-title-en">
                    ${notice.titleEn}
                </div>


                ${
                  notice.descriptionHi
                    ? `
                            <div class="admin-notice-description">
                                ${notice.descriptionHi}
                            </div>
                          `
                    : ""
                }


                ${
                  pdfExists
                    ? `
                            <div class="notice-file-info">
                                📄 PDF Available
                            </div>
                          `
                    : ""
                }

            </div>


            <div class="notice-actions">

                ${actions}

            </div>

        </div>

    `;
}

// =========================================
// EDIT NOTICE
// =========================================

async function editNotice(id) {
  try {
    const response = await fetch(`${NOTICES_API}/${id}`);

    if (!response.ok) {
      throw new Error("Notice could not be loaded.");
    }

    const notice = await response.json();

    document.getElementById("noticeDate").value = notice.date || "";

    document.getElementById("noticeType").value = notice.noticeType || "text";

    document.getElementById("noticeTitleHi").value = notice.titleHi || "";

    document.getElementById("noticeTitleEn").value = notice.titleEn || "";

    document.getElementById("noticeLink").value = notice.externalLink || "";

    document.getElementById("noticeDescriptionHi").value =
      notice.descriptionHi || "";

    document.getElementById("noticeDescriptionEn").value =
      notice.descriptionEn || "";

    document.getElementById("noticeImportant").checked =
      notice.important === true;

    noticeForm.dataset.editingId = id;

    noticeForm.dataset.existingPdf = notice.pdfFile || "";

    const button = noticeForm.querySelector(".add-notice-btn");

    button.textContent = "✓ Update Notice";

    noticeMessage.className = "message";

    noticeMessage.textContent = "";

    const noticeFormCard = document.getElementById("noticeFormCard");

    if (noticeFormCard) {
      noticeFormCard.style.display = "block";
    }

    noticeForm.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("EDIT NOTICE ERROR:", error);

    alert("Notice load नहीं हो सका।");
  }
}

// =========================================
// ADD / UPDATE NOTICE
// =========================================

if (noticeForm) {
  noticeForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    noticeMessage.className = "message";

    noticeMessage.textContent = "";

    const button = noticeForm.querySelector(".add-notice-btn");

    button.disabled = true;

    button.textContent = "Saving Notice...";
    const editingId = noticeForm.dataset.editingId;

    try {
      /*
       * FormData is used because
       * PDF file needs to be uploaded.
       */

      const formData = new FormData();

      formData.append(
        "noticeDate",
        document.getElementById("noticeDate").value,
      );

      formData.append(
        "noticeType",
        document.getElementById("noticeType").value,
      );

      formData.append(
        "titleHi",
        document.getElementById("noticeTitleHi").value.trim(),
      );

      formData.append(
        "titleEn",
        document.getElementById("noticeTitleEn").value.trim(),
      );

      formData.append(
        "externalLink",
        document.getElementById("noticeLink").value.trim(),
      );

      formData.append(
        "descriptionHi",
        document.getElementById("noticeDescriptionHi").value.trim(),
      );

      formData.append(
        "descriptionEn",
        document.getElementById("noticeDescriptionEn").value.trim(),
      );

      formData.append(
        "important",
        document.getElementById("noticeImportant").checked,
      );

      // PDF

      const pdfInput = document.getElementById("noticePdf");

      if (pdfInput && pdfInput.files.length > 0) {
        formData.append("noticePdf", pdfInput.files[0]);
      }

      // Existing PDF

      if (noticeForm.dataset.existingPdf) {
        formData.append("existingPdf", noticeForm.dataset.existingPdf);
      }

      let response;

      // =================================
      // UPDATE NOTICE
      // =================================

      if (editingId) {
        response = await fetch(`${NOTICES_API}/${editingId}`, {
          method: "PUT",
          body: formData,
        });
      }

      // =================================
      // ADD NOTICE
      // =================================
      else {
        response = await fetch(NOTICES_API, {
          method: "POST",
          body: formData,
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Notice operation failed.");
      }

      // =================================
      // SUCCESS
      // =================================

      noticeMessage.className = "message success";

      noticeMessage.textContent = editingId
        ? "Notice successfully updated. ✓"
        : "Notice successfully added. ✓";

      noticeForm.reset();

      noticeForm.dataset.editingId = "";

      noticeForm.dataset.existingPdf = "";

      button.textContent = "+ Add Notice";

      await loadAdminNotices();
    } catch (error) {
      console.error("SAVE NOTICE ERROR:", error);

      noticeMessage.className = "message error";

      noticeMessage.textContent = error.message || "Notice save नहीं हो सका.";
    } finally {
      button.disabled = false;

      if (noticeForm.dataset.editingId) {
        button.textContent = "✓ Update Notice";
      } else {
        button.textContent = "+ Add Notice";
      }
    }
  });
}

// =========================================
// DELETE NOTICE
// =========================================

async function deleteNotice(id) {
  const confirmDelete = confirm(
    "क्या आप इस notice को permanently delete करना चाहते हैं?\n\n" +
      "Are you sure you want to delete this notice?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${NOTICES_API}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || result.error || "Notice delete failed.",
      );
    }

    alert(
      "Notice deleted successfully!\n" + "Notice सफलतापूर्वक delete हो गया।",
    );

    await loadAdminNotices();
  } catch (error) {
    console.error("DELETE NOTICE ERROR:", error);

    alert(error.message || "Notice delete नहीं हो सका।");
  }
}

/* =========================================================
   DASHBOARD - NOTICE COUNT & RECENT NOTICES
   ========================================================= */

async function loadDashboardNotices() {
  try {
    const response = await fetch(NOTICES_API);

    if (!response.ok) {
      throw new Error("Failed to load notices");
    }

    const notices = await response.json();

    /* -------------------------------
           Notice Count
        -------------------------------- */

    const noticeCount = document.getElementById("dashboardNoticeCount");

    if (noticeCount) {
      noticeCount.textContent = notices.length;
    }

    /* -------------------------------
           Recent Notices
        -------------------------------- */

    const recentNoticeContainer = document.querySelector(
      ".dashboard-card:first-child .dashboard-list",
    );

    if (!recentNoticeContainer) {
      return;
    }

    if (notices.length === 0) {
      recentNoticeContainer.innerHTML = `
                <div class="empty-dashboard">
                    No notices available.
                </div>
            `;

      return;
    }

    /* Latest 5 notices */

    const recentNotices = [...notices].reverse().slice(0, 5);

    recentNoticeContainer.innerHTML = recentNotices
      .map((notice) => {
        return `
                    <div class="dashboard-notice-item">

                        <div class="dashboard-notice-info">

                            <strong>
                                ${notice.titleHi || notice.titleEn}
                            </strong>

                            <span>
                                ${formatDashboardNoticeDate(notice.date)}
                            </span>

                        </div>

                        ${
                          notice.important
                            ? `<span class="dashboard-important">
                                    Important
                               </span>`
                            : ""
                        }

                    </div>
                `;
      })
      .join("");
  } catch (error) {
    console.error("Dashboard notices error:", error);
  }
}

/* =========================================================
   DASHBOARD NOTICE DATE
   ========================================================= */

function formatDashboardNoticeDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   LOAD DASHBOARD DATA
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadDashboardNotices();
});

/* =========================================================
   DASHBOARD - EVENT COUNT & UPCOMING EVENTS
   ========================================================= */

async function loadDashboardEvents() {
  try {
    const response = await fetch(EVENTS_API);

    if (!response.ok) {
      throw new Error("Failed to load events");
    }

    const events = await response.json();

    /* -------------------------------
           Event Count
        -------------------------------- */

    const eventCount = document.getElementById("dashboardEventCount");

    if (eventCount) {
      eventCount.textContent = events.length;
    }

    /* -------------------------------
           Upcoming Events
        -------------------------------- */

    const upcomingEventContainer = document.querySelector(
      ".dashboard-card:nth-child(2) .dashboard-list",
    );

    if (!upcomingEventContainer) {
      return;
    }

    if (events.length === 0) {
      upcomingEventContainer.innerHTML = `
                <div class="empty-dashboard">
                    No upcoming events available.
                </div>
            `;

      return;
    }

    /* Latest / upcoming 5 events */

    const upcomingEvents = [...events]
      .sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      })
      .slice(0, 5);

    upcomingEventContainer.innerHTML = upcomingEvents
      .map((event) => {
        return `
                    <div class="dashboard-event-item">

                        <div class="dashboard-event-date">
                            ${formatDashboardEventDate(event.date)}
                        </div>

                        <div class="dashboard-event-info">

                            <strong>
                                ${event.titleHi || event.titleEn}
                            </strong>

                            <span>
                                ${event.categoryHi || event.categoryEn}
                            </span>

                        </div>

                    </div>
                `;
      })
      .join("");
  } catch (error) {
    console.error("Dashboard events error:", error);
  }
}

/* =========================================================
   DASHBOARD EVENT DATE
   ========================================================= */

function formatDashboardEventDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   LOAD DASHBOARD EVENTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadDashboardEvents();
});

/* =========================================================
   DASHBOARD - TEACHERS COUNT
   ========================================================= */

async function loadDashboardTeachers() {
  try {
    const response = await fetch("http://localhost:3000/api/teachers");

    if (!response.ok) {
      throw new Error("Failed to load teachers");
    }

    const teachers = await response.json();

    const teacherCount = document.getElementById("dashboardTeacherCount");

    if (teacherCount) {
      teacherCount.textContent = teachers.length;
    }
  } catch (error) {
    console.error("Dashboard teachers error:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadDashboardTeachers();
});

/* =========================================================
   ADMIN MODULE NAVIGATION
   ========================================================= */
/* =====================================================
   ADMIN MODULE NAVIGATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");

  const dashboardContent = document.querySelector(".dashboard-content");

  const noticesModule = document.getElementById("noticesModule");

  const eventsModule = document.getElementById("eventsModule");

  const teachersModule = document.getElementById("teachersModule");

  const galleryModule = document.getElementById("galleryModule");

  /* =================================================
       HIDE ALL MODULES
       ================================================= */

  function hideAllModules() {
    if (noticesModule) {
      noticesModule.style.display = "none";
    }

    if (eventsModule) {
      eventsModule.style.display = "none";
    }

    if (teachersModule) {
      teachersModule.style.display = "none";
    }
  }

  if (galleryModule) {
    galleryModule.style.display = "none";
  }

  /* =================================================
       SHOW DASHBOARD
       ================================================= */

  function showDashboard() {
    hideAllModules();

    if (dashboardContent) {
      dashboardContent
        .querySelectorAll(":scope > *")
        .forEach(function (section) {
          section.style.display = "";
        });
    }
  }

  /* =================================================
       SHOW NOTICES
       ================================================= */

  function showNotices() {
    hideAllModules();

    if (dashboardContent) {
      dashboardContent
        .querySelectorAll(":scope > *")
        .forEach(function (section) {
          section.style.display = "none";
        });
    }

    if (noticesModule) {
      noticesModule.style.display = "block";
    }

    if (typeof loadAdminNotices === "function") {
      loadAdminNotices();
    }
  }

  /* =================================================
       SHOW EVENTS
       ================================================= */

  function showEvents() {
    hideAllModules();

    if (dashboardContent) {
      dashboardContent
        .querySelectorAll(":scope > *")
        .forEach(function (section) {
          section.style.display = "none";
        });
    }

    if (eventsModule) {
      eventsModule.style.display = "block";
    }

    if (typeof loadAdminEvents === "function") {
      loadAdminEvents();
    }
  }

  /* =================================================
       SHOW TEACHERS
       ================================================= */

  function showTeachers() {
    hideAllModules();

    if (dashboardContent) {
      dashboardContent
        .querySelectorAll(":scope > *")
        .forEach(function (section) {
          section.style.display = "none";
        });
    }

    if (teachersModule) {
      teachersModule.style.display = "block";
    }

    if (typeof loadTeachers === "function") {
      loadTeachers();
    }
  }

  // =================================================
  // SHOW GALLERY
  // =================================================

  function showGallery() {
    hideAllModules();

    if (dashboardContent) {
      dashboardContent
        .querySelectorAll(":scope > *")
        .forEach(function (section) {
          section.style.display = "none";
        });
    }

    if (galleryModule) {
      galleryModule.style.display = "block";
    }

    /* Load Gallery only when Gallery is opened */
    if (typeof loadAdminGallery === "function") {
      loadAdminGallery();
    }
  }

  /* Make Gallery navigation available to Gallery CRUD handlers */
  window.showGallery = showGallery;

  /* =================================================
       NAVIGATION CLICK
       ================================================= */

  navItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.preventDefault();

      /* -----------------------------
                   ACTIVE MENU
                   ----------------------------- */

      navItems.forEach(function (nav) {
        nav.classList.remove("active");
      });

      item.classList.add("active");

      /* -----------------------------
                   DETERMINE MODULE
                   ----------------------------- */

      const itemId = item.id || "";

      const itemText = item.textContent.trim().toLowerCase();

      /* Dashboard */

      if (itemId === "dashboardNavItem" || itemText.includes("dashboard")) {
        showDashboard();

        return;
      }

      /* Notices */

      if (itemId === "noticesNavItem") {
        showNotices();

        return;
      }

      /* Events */

      if (itemId === "eventsNavItem") {
        showEvents();

        return;
      }

      /* Teachers */

      if (itemId === "teachersNavItem") {
        showTeachers();

        return;
      }

      /* Gallery */

      if (itemId === "galleryNavItem") {
        showGallery();

        return;
      }

      /*
                   Other menu items:
                   अभी उनका module नहीं बना है,
                   इसलिए dashboard/modules को
                   unnecessarily change नहीं करेंगे.
                */
    });
  });

  /* =================================================
       INITIAL STATE
       ================================================= */

  hideAllModules();
});

/* =========================================================
   TEACHER FORM - OPEN / CLOSE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const addTeacherBtn = document.getElementById("addTeacherBtn");

  const teacherFormCard = document.getElementById("teacherFormCard");

  const closeTeacherFormBtn = document.getElementById("closeTeacherFormBtn");

  const cancelTeacherBtn = document.getElementById("cancelTeacherBtn");

  /* Open Form */

  if (addTeacherBtn) {
    addTeacherBtn.addEventListener("click", function () {
      if (teacherFormCard) {
        teacherFormCard.style.display = "block";

        teacherFormCard.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  /* Close Form */

  function closeTeacherForm() {
    if (teacherFormCard) {
      teacherFormCard.style.display = "none";
    }
  }

  if (closeTeacherFormBtn) {
    closeTeacherFormBtn.addEventListener("click", closeTeacherForm);
  }

  if (cancelTeacherBtn) {
    cancelTeacherBtn.addEventListener("click", closeTeacherForm);
  }
});

/* =========================================================
   SAVE TEACHER TO DATABASE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const teacherForm = document.getElementById("teacherForm");

  if (!teacherForm) {
    return;
  }

  teacherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const teacherFormData = new FormData(teacherForm);

    teacherFormData.set(
      "nameHi",
      document.getElementById("teacherNameHi").value.trim(),
    );

    teacherFormData.set(
      "nameEn",
      document.getElementById("teacherNameEn").value.trim(),
    );

    teacherFormData.set(
      "designationHi",
      document.getElementById("teacherDesignationHi").value.trim(),
    );

    teacherFormData.set(
      "designationEn",
      document.getElementById("teacherDesignationEn").value.trim(),
    );

    teacherFormData.set(
      "subjectHi",
      document.getElementById("teacherSubjectHi").value.trim(),
    );

    teacherFormData.set(
      "subjectEn",
      document.getElementById("teacherSubjectEn").value.trim(),
    );

    teacherFormData.set(
      "displayOrder",
      Number(document.getElementById("teacherOrder").value) || 0,
    );

    try {
      const url = editingTeacherId
        ? `http://localhost:3000/api/teachers/${editingTeacherId}`
        : "http://localhost:3000/api/teachers";

      const method = editingTeacherId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,

        body: teacherFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save teacher");
      }

      alert(
        editingTeacherId
          ? "Teacher updated successfully!"
          : "Teacher saved successfully!",
      );

      teacherForm.reset();
      editingTeacherId = null;

      document.getElementById("teacherOrder").value = 0;

      const teacherFormCard = document.getElementById("teacherFormCard");

      if (teacherFormCard) {
        teacherFormCard.style.display = "none";
      }

      loadDashboardTeachers();
    } catch (error) {
      console.error("Save teacher error:", error);

      alert("Teacher save नहीं हो सका। कृपया server check करें.");
    }
  });
});

/* =========================================================
   LOAD TEACHERS INTO TABLE
   ========================================================= */

async function loadTeachers() {
  try {
    const response = await fetch("http://localhost:3000/api/teachers");

    if (!response.ok) {
      throw new Error("Failed to load teachers");
    }

    const teachers = await response.json();

    const tableBody = document.getElementById("teachersTableBody");

    if (!tableBody) {
      return;
    }

    /* No teachers */

    if (teachers.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty">
                        No teachers added yet.
                    </td>
                </tr>
            `;

      return;
    }

    /* Teachers list */

    tableBody.innerHTML = teachers
      .map((teacher, index) => {
        return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${teacher.name_hi || ""}
                            </strong>

                            <br>

                            <small>
                                ${teacher.name_en || ""}
                            </small>
                        </td>

                        <td>
                            ${teacher.designation_hi || "-"}
                            <br>
                            <small>
                                ${teacher.designation_en || ""}
                            </small>
                        </td>

                        <td>
                            ${teacher.subject_hi || "-"}
                            <br>
                            <small>
                                ${teacher.subject_en || ""}
                            </small>
                        </td>

                        <td>
                            ${teacher.display_order ?? 0}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="table-action edit"
                                data-id="${teacher.id}"
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                class="table-action delete teacher-delete-btn"
                                data-id="${teacher.id}"
                            >
                                Delete
                            </button>
                        </td>

                    </tr>
                `;
      })
      .join("");
  } catch (error) {
    console.error("Load teachers error:", error);
  }
}

/* Load teachers when admin page opens */

document.addEventListener("DOMContentLoaded", function () {
  loadTeachers();
});

/* =========================================================
   EDIT TEACHER
   ========================================================= */

let editingTeacherId = null;

editingTeacherId = null;

/* Reset form heading and button */

const formHeading = document.querySelector(
  "#teacherFormCard .form-card-header h3",
);

if (formHeading) {
  formHeading.textContent = "नए शिक्षक की जानकारी / Teacher Information";
}

const submitButton = document.querySelector(
  "#teacherForm button[type='submit']",
);

if (submitButton) {
  submitButton.textContent = "Save Teacher / शिक्षक सहेजें";
}

const teacherFormCard = document.getElementById("teacherFormCard");

if (teacherFormCard) {
  teacherFormCard.style.display = "none";
}

document.addEventListener("click", function (event) {
  const editButton = event.target.closest(".table-action.edit");

  if (!editButton) {
    return;
  }

  const teacherId = Number(editButton.dataset.id);

  openTeacherEditForm(teacherId);
});

async function openTeacherEditForm(teacherId) {
  try {
    const response = await fetch("http://localhost:3000/api/teachers");

    if (!response.ok) {
      throw new Error("Failed to load teacher");
    }

    const teachers = await response.json();

    const teacher = teachers.find((item) => Number(item.id) === teacherId);

    if (!teacher) {
      alert("Teacher information not found.");

      return;
    }

    editingTeacherId = teacherId;

    /* Fill form */

    document.getElementById("teacherNameHi").value = teacher.name_hi || "";

    document.getElementById("teacherNameEn").value = teacher.name_en || "";

    document.getElementById("teacherDesignationHi").value =
      teacher.designation_hi || "";

    document.getElementById("teacherDesignationEn").value =
      teacher.designation_en || "";

    document.getElementById("teacherSubjectHi").value =
      teacher.subject_hi || "";

    document.getElementById("teacherSubjectEn").value =
      teacher.subject_en || "";

    document.getElementById("teacherOrder").value = teacher.display_order ?? 0;

    /* Open form */

    const formCard = document.getElementById("teacherFormCard");

    if (formCard) {
      formCard.style.display = "block";

      formCard.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    /* Change heading and button */

    const formHeading = document.querySelector(
      "#teacherFormCard .form-card-header h3",
    );

    if (formHeading) {
      formHeading.textContent =
        "शिक्षक की जानकारी संपादित करें / Edit Teacher Information";
    }

    const submitButton = document.querySelector(
      "#teacherForm button[type='submit']",
    );

    if (submitButton) {
      submitButton.textContent = "Update Teacher / जानकारी अपडेट करें";
    }
  } catch (error) {
    console.error("Edit teacher error:", error);

    alert("Teacher information load नहीं हो सकी।");
  }
}

/* =========================================================
   DELETE TEACHER
========================================================= */

document.addEventListener("click", async function (event) {
  const deleteButton = event.target.closest(".teacher-delete-btn");

  if (!deleteButton) {
    return;
  }

  event.preventDefault();

  const teacherId = Number(deleteButton.dataset.id);

  if (!teacherId) {
    alert("Invalid teacher ID.");
    return;
  }

  const confirmed = confirm(
    "क्या आप इस शिक्षक की जानकारी delete करना चाहते हैं?\n\n" +
      "Are you sure you want to delete this teacher?",
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/teachers/${teacherId}`,
      {
        method: "DELETE",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Failed to delete teacher",
      );
    }

    alert(
      "Teacher deleted successfully!\n" +
        "शिक्षक की जानकारी सफलतापूर्वक delete हो गई।",
    );

    await loadTeachers();

    if (typeof loadDashboardTeachers === "function") {
      await loadDashboardTeachers();
    }
  } catch (error) {
    console.error("Delete teacher error:", error);

    alert(error.message || "Teacher delete नहीं हो सका।");
  }
});

/* =====================================================
   EVENTS MODULE
   ===================================================== */

/* =====================================================
   DOM ELEMENTS
   ===================================================== */

/* =====================================================
   FORMAT DATE
   ===================================================== */

function formatEventDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

/* =====================================================
   SHOW MESSAGE
   ===================================================== */

function showEventMessage(message, type = "success") {
  if (!eventMessage) {
    return;
  }

  eventMessage.textContent = message;

  eventMessage.className = `message ${type}`;
}

/* =====================================================
   CLEAR MESSAGE
   ===================================================== */

function clearEventMessage() {
  if (!eventMessage) {
    return;
  }

  eventMessage.textContent = "";

  eventMessage.className = "message";
}

/* =====================================================
   OPEN EVENT FORM
   ===================================================== */

function openEventForm() {
  if (!eventFormCard) {
    return;
  }

  eventFormCard.style.display = "block";

  clearEventMessage();

  eventFormCard.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/* =====================================================
   CLOSE EVENT FORM
   ===================================================== */

function closeEventForm() {
  if (!eventFormCard) {
    return;
  }

  eventFormCard.style.display = "none";

  clearEventMessage();

  resetEventForm();
}

/* =====================================================
   RESET EVENT FORM
   ===================================================== */

function resetEventForm() {
  if (!eventForm) {
    return;
  }

  eventForm.reset();

  delete eventForm.dataset.editingId;

  const button = eventForm.querySelector(".add-event-btn");

  if (button) {
    button.textContent = "Save Event / कार्यक्रम सहेजें";
  }
}

/* =====================================================
   LOAD EVENTS
   ===================================================== */

async function loadAdminEvents() {
  if (!eventsList) {
    return;
  }

  eventsList.innerHTML = `
        <div class="events-loading">
            Events लोड हो रहे हैं...
        </div>
    `;

  try {
    const response = await fetch(EVENTS_API);

    if (!response.ok) {
      throw new Error("Events could not be loaded.");
    }

    const events = await response.json();

    console.log("ADMIN EVENTS:", events);

    if (!Array.isArray(events) || events.length === 0) {
      eventsList.innerHTML = `
                <div class="events-empty">

                    <strong>
                        अभी कोई Event उपलब्ध नहीं है।
                    </strong>

                    <br>

                    <small>
                        No events available at present.
                    </small>

                </div>
            `;

      return;
    }

    /* Newest events first */

    events.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    eventsList.innerHTML = events.map(createEventHTML).join("");
  } catch (error) {
    console.error("ADMIN EVENTS ERROR:", error);

    eventsList.innerHTML = `
            <div class="events-error">

                <strong>
                    Events लोड नहीं हो सके।
                </strong>

                <br>

                <small>
                    Please check the server connection.
                </small>

            </div>
        `;
  }
}

/* =====================================================
   CREATE EVENT HTML
   ===================================================== */

function createEventHTML(event) {
  const date = formatEventDate(event.date);

  const categoryHi = event.categoryHi || "";

  const categoryEn = event.categoryEn || "";

  const titleHi = event.titleHi || "";

  const titleEn = event.titleEn || "";

  const descriptionHi = event.descriptionHi || "";

  const descriptionEn = event.descriptionEn || "";

  return `

        <div
            class="admin-event"
            data-event-id="${event.id}"
        >

            <div class="admin-event-info">


                <!-- DATE -->

                <div class="admin-event-date">

                    ${date}

                </div>


                <!-- CATEGORY -->

                ${
                  categoryHi || categoryEn
                    ? `
                            <div class="admin-event-category">

                                ${categoryHi || categoryEn}

                            </div>
                          `
                    : ""
                }


                <!-- HINDI TITLE -->

                <div class="admin-event-title">

                    ${titleHi}

                </div>


                <!-- ENGLISH TITLE -->

                ${
                  titleEn
                    ? `
                            <div class="admin-event-title-en">

                                ${titleEn}

                            </div>
                          `
                    : ""
                }


                <!-- DESCRIPTION -->

                ${
                  descriptionHi || descriptionEn
                    ? `
                            <div class="admin-event-description">

                                ${descriptionHi || descriptionEn}

                                ${
                                  descriptionEn && descriptionHi
                                    ? `
                                            <br>
                                            <span>
                                                ${descriptionEn}
                                            </span>
                                          `
                                    : ""
                                }

                            </div>
                          `
                    : ""
                }


                <!-- ACTIONS -->

                <div class="event-actions">

                    <button
                        type="button"
                        class="event-edit-btn"
                        onclick="editEvent(${event.id})"
                    >
                        ✏ Edit
                    </button>


                    <button
                        type="button"
                        class="event-delete-btn"
                        onclick="deleteEvent(${event.id})"
                    >
                        🗑 Delete
                    </button>

                </div>


            </div>

        </div>

    `;
}

/* =====================================================
   GET SINGLE EVENT
   ===================================================== */

async function editEvent(id) {
  try {
    const response = await fetch(`${EVENTS_API}/${id}`);

    if (!response.ok) {
      throw new Error("Event could not be loaded.");
    }

    const event = await response.json();

    /* Open form */

    if (eventFormCard) {
      eventFormCard.style.display = "block";
    }

    /* Fill form */

    document.getElementById("eventDate").value = event.date || "";

    document.getElementById("eventCategoryHi").value = event.categoryHi || "";

    document.getElementById("eventCategoryEn").value = event.categoryEn || "";

    document.getElementById("eventTitleHi").value = event.titleHi || "";

    document.getElementById("eventTitleEn").value = event.titleEn || "";

    document.getElementById("eventDescriptionHi").value =
      event.descriptionHi || "";

    document.getElementById("eventDescriptionEn").value =
      event.descriptionEn || "";

    /* Store editing ID */

    eventForm.dataset.editingId = id;

    /* Change button */

    const button = eventForm.querySelector(".add-event-btn");

    if (button) {
      button.textContent = "✓ Update Event / कार्यक्रम अपडेट करें";
    }

    clearEventMessage();

    /* Scroll to form */

    eventFormCard.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("EDIT EVENT ERROR:", error);

    alert("Event load नहीं हो सका।");
  }
}

// =========================================
// DELETE EVENT
// =========================================

async function deleteEvent(id) {
  const confirmed = confirm(
    "क्या आप इस Event को delete करना चाहते हैं?\n\n" +
      "Are you sure you want to delete this event?",
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${EVENTS_API}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || "Event delete failed.");
    }

    alert(
      "Event successfully deleted.\n" + "कार्यक्रम सफलतापूर्वक delete हो गया।",
    );

    await loadAdminEvents();
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    alert(error.message || "Event delete नहीं हो सका।");
  }
}

/* =====================================================
   SAVE / UPDATE EVENT
   ===================================================== */

if (eventForm) {
  eventForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearEventMessage();

    /* -----------------------------------------
               GET FORM VALUES
               ----------------------------------------- */

    const date = document.getElementById("eventDate").value;

    const categoryHi = document.getElementById("eventCategoryHi").value.trim();

    const categoryEn = document.getElementById("eventCategoryEn").value.trim();

    const titleHi = document.getElementById("eventTitleHi").value.trim();

    const titleEn = document.getElementById("eventTitleEn").value.trim();

    const descriptionHi = document
      .getElementById("eventDescriptionHi")
      .value.trim();

    const descriptionEn = document
      .getElementById("eventDescriptionEn")
      .value.trim();

    /* -----------------------------------------
               DATA OBJECT
               ----------------------------------------- */

    const eventData = {
      date: date,

      categoryHi: categoryHi,

      categoryEn: categoryEn,

      titleHi: titleHi,

      titleEn: titleEn,

      descriptionHi: descriptionHi,

      descriptionEn: descriptionEn,
    };

    /* -----------------------------------------
               EDITING?
               ----------------------------------------- */

    const editingId = eventForm.dataset.editingId;

    const isEditing = Boolean(editingId);

    const url = isEditing ? `${EVENTS_API}/${editingId}` : EVENTS_API;

    const method = isEditing ? "PUT" : "POST";

    /* -----------------------------------------
               BUTTON
               ----------------------------------------- */

    const button = eventForm.querySelector(".add-event-btn");

    if (button) {
      button.disabled = true;

      button.textContent = isEditing ? "Updating..." : "Saving...";
    }

    try {
      /* -------------------------------------
                   API REQUEST
                   ------------------------------------- */

      const response = await fetch(url, {
        method: method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(errorText || "Event save failed.");
      }

      /* -------------------------------------
                   SUCCESS
                   ------------------------------------- */

      showEventMessage(
        isEditing
          ? "✓ Event successfully updated."
          : "✓ Event successfully added.",
        "success",
      );

      /* -------------------------------------
                   REFRESH EVENTS
                   ------------------------------------- */

      await loadAdminEvents();

      /* -------------------------------------
                   KEEP EVENTS MODULE OPEN
                   ------------------------------------- */

      const eventsModule = document.getElementById("eventsModule");

      if (eventsModule) {
        eventsModule.style.display = "block";
      }

      /* -------------------------------------
                   RESET FORM
                   ------------------------------------- */

      resetEventForm();

      /*
                   Keep form closed after save/update
                   just like a clean admin workflow.
                */

      if (eventFormCard) {
        eventFormCard.style.display = "none";
      }
    } catch (error) {
      console.error("SAVE EVENT ERROR:", error);

      showEventMessage(
        "Event save नहीं हो सका। Server/API check करें.",
        "error",
      );
    } finally {
      if (button) {
        button.disabled = false;

        button.textContent = "Save Event / कार्यक्रम सहेजें";
      }
    }
  });
}

/* =====================================================
   ADD EVENT BUTTON
   ===================================================== */

if (addEventBtn) {
  addEventBtn.addEventListener("click", function () {
    resetEventForm();

    openEventForm();
  });
}

/* =====================================================
   CLOSE BUTTON
   ===================================================== */

if (closeEventFormBtn) {
  closeEventFormBtn.addEventListener("click", closeEventForm);
}

/* =====================================================
   CANCEL BUTTON
   ===================================================== */

if (cancelEventBtn) {
  cancelEventBtn.addEventListener("click", closeEventForm);
}

/* =====================================================
   DEFAULT FORM STATE
   ===================================================== */

if (eventFormCard) {
  eventFormCard.style.display = "none";
}

/* =====================================================
   LOAD EVENTS WHEN PAGE LOADS
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  loadAdminEvents();
});

// =====================================================
// GALLERY DELETE
// =====================================================

// =====================================================
// GALLERY DELETE
// =====================================================

document.addEventListener("click", async function (event) {
  const deleteButton = event.target.closest(".gallery-delete-btn");

  if (!deleteButton) {
    return;
  }

  event.preventDefault();

  const galleryId = Number(deleteButton.dataset.id);

  if (!galleryId) {
    alert("Invalid gallery ID.");
    return;
  }

  const confirmed = confirm(
    "क्या आप इस photo को permanently delete करना चाहते हैं?\n\n" +
      "Are you sure you want to delete this photo?",
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${GALLERY_API}/${galleryId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Gallery photo delete failed.");
    }

    /* SUCCESS */

    alert("Photo deleted successfully!\n" + "फोटो सफलतापूर्वक delete हो गई।");

    /* Keep Gallery module open after delete */

    if (typeof window.showGallery === "function") {
      window.showGallery();
    } else {
      await loadAdminGallery();
    }

    /* Update Dashboard count */

    if (typeof loadDashboardGallery === "function") {
      await loadDashboardGallery();
    }
  } catch (error) {
    console.error("Gallery delete error:", error);

    alert(error.message || "Photo delete नहीं हो सकी।");
  }
});

// =====================================================
// DASHBOARD - GALLERY COUNT
// =====================================================

async function loadDashboardGallery() {
  try {
    const response = await fetch("http://localhost:3000/api/gallery");

    if (!response.ok) {
      throw new Error("Failed to load gallery");
    }

    const gallery = await response.json();

    const galleryCount = document.getElementById("dashboardGalleryCount");

    if (galleryCount) {
      galleryCount.textContent = gallery.length;
    }
  } catch (error) {
    console.error("Dashboard gallery error:", error);
  }
}

// =========================================
// GALLERY FORM OPEN / CLOSE
// =========================================

document.addEventListener("DOMContentLoaded", function () {
  const addGalleryBtn = document.getElementById("addGalleryBtn");

  const galleryFormCard = document.getElementById("galleryFormCard");

  const closeGalleryFormBtn = document.getElementById("closeGalleryFormBtn");

  const cancelGalleryBtn = document.getElementById("cancelGalleryBtn");

  // Open Gallery Form
  if (addGalleryBtn) {
    addGalleryBtn.addEventListener("click", function () {
      if (galleryFormCard) {
        galleryFormCard.style.display = "block";

        galleryFormCard.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  // Close Gallery Form
  function closeGalleryForm() {
    if (galleryFormCard) {
      galleryFormCard.style.display = "none";
    }
  }

  // Close button (×)
  if (closeGalleryFormBtn) {
    closeGalleryFormBtn.addEventListener("click", closeGalleryForm);
  }

  // Cancel button
  if (cancelGalleryBtn) {
    cancelGalleryBtn.addEventListener("click", closeGalleryForm);
  }
});

loadAdminEvents();

loadAdminNotices();
loadDashboardGallery();
