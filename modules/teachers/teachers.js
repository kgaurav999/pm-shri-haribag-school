// =========================================
// TEACHERS & STAFF - PUBLIC MODULE
// =========================================

const TEACHERS_API = "http://localhost:3000/api/teachers";

document.addEventListener("DOMContentLoaded", () => {
  loadPublicTeachers();
});

async function loadPublicTeachers() {
  const container = document.getElementById("teachersPublicGrid");

  if (!container) return;

  try {
    const response = await fetch(TEACHERS_API);

    if (!response.ok) {
      throw new Error("Failed to load teachers");
    }

    const teachers = await response.json();

    if (!Array.isArray(teachers) || teachers.length === 0) {
      container.innerHTML = `
        <div class="teachers-empty">
          <p
            data-hi="शिक्षक एवं कर्मचारी की जानकारी शीघ्र उपलब्ध होगी।"
            data-en="Teachers & Staff information will be available soon."
          >
            शिक्षक एवं कर्मचारी की जानकारी शीघ्र उपलब्ध होगी।
          </p>
        </div>
      `;
      return;
    }

    renderPublicTeachers(teachers);

  } catch (error) {
    console.error("Teachers loading error:", error);

    container.innerHTML = `
      <div class="teachers-error">
        <p
          data-hi="शिक्षक एवं कर्मचारी की जानकारी लोड नहीं हो सकी।"
          data-en="Teachers & Staff information could not be loaded."
        >
          शिक्षक एवं कर्मचारी की जानकारी लोड नहीं हो सकी।
        </p>
      </div>
    `;
  }
}

function renderPublicTeachers(teachers) {
  const container = document.getElementById("teachersPublicGrid");

  if (!container) return;

  container.innerHTML = teachers
    .map((teacher) => {
      return `
        <article class="teacher-public-card">

          <div class="teacher-public-avatar">
            👨‍🏫
          </div>

          <div class="teacher-public-info">

            <h3
              data-hi="${escapeTeacherText(teacher.name_hi)}"
              data-en="${escapeTeacherText(teacher.name_en)}"
            >
              ${escapeTeacherText(teacher.name_hi)}
            </h3>

            <p
              class="teacher-designation"
              data-hi="${escapeTeacherText(teacher.designation_hi || "")}"
              data-en="${escapeTeacherText(teacher.designation_en || "")}"
            >
              ${escapeTeacherText(teacher.designation_hi || "")}
            </p>

            <p
              class="teacher-subject"
              data-hi="${escapeTeacherText(teacher.subject_hi || "")}"
              data-en="${escapeTeacherText(teacher.subject_en || "")}"
            >
              ${escapeTeacherText(teacher.subject_hi || "")}
            </p>

          </div>

        </article>
      `;
    })
    .join("");

  applyTeacherLanguage();
}

function applyTeacherLanguage() {
  const currentLanguage =
    document.documentElement.lang === "en" ? "en" : "hi";

  document
    .querySelectorAll("#teachersPublicGrid [data-hi][data-en]")
    .forEach((element) => {
      element.textContent =
        currentLanguage === "en"
          ? element.dataset.en
          : element.dataset.hi;
    });
}

function escapeTeacherText(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}