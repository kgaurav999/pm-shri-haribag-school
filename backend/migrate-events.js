const fs = require("fs");
const path = require("path");
const pool = require("./db");

const filePath = path.join(__dirname, "data", "events.json");

function convertDate(dateString) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  return date.toISOString().split("T")[0];
}

async function migrateEvents() {
  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    const events = JSON.parse(fileData);

    console.log(`Found ${events.length} events in JSON file.`);

    for (const event of events) {
      await pool.query(
        `INSERT INTO events
                (
                    event_date,
                    category_hi,
                    category_en,
                    title_hi,
                    title_en,
                    description_hi,
                    description_en
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          convertDate(event.date),
          event.categoryHi,
          event.categoryEn,
          event.titleHi,
          event.titleEn,
          event.descriptionHi || "",
          event.descriptionEn || "",
        ],
      );
    }

    console.log("✅ All events migrated successfully!");
  } catch (error) {
    console.error("❌ Migration failed!");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

migrateEvents();
