const fs = require("fs");
const path = require("path");
const pool = require("./db");

const filePath = path.join(__dirname, "data", "notices.json");

function convertDate(dateString) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  return date.toISOString().split("T")[0];
}

async function migrateNotices() {
  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    const notices = JSON.parse(fileData);

    console.log(`Found ${notices.length} notices in JSON file.`);

    for (const notice of notices) {
      await pool.query(
        `INSERT INTO notices
                (
                    notice_date,
                    title_hi,
                    title_en,
                    description_hi,
                    description_en,
                    notice_type,
                    pdf_file,
                    external_link,
                    important
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          convertDate(notice.date),
          notice.titleHi,
          notice.titleEn,
          notice.descriptionHi || "",
          notice.descriptionEn || "",
          notice.noticeType || "text",
          notice.pdfFile || null,
          notice.externalLink || null,
          notice.important || false,
        ],
      );
    }

    console.log("✅ All notices migrated successfully!");
  } catch (error) {
    console.error("❌ Migration failed!");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

migrateNotices();
