const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

const PORT = 3000;

/* =========================================
   MIDDLEWARE
   ========================================= */

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/* =========================================
   FILE PATHS
   ========================================= */

const noticesFile = path.join(__dirname, "data", "notices.json");

const eventsFile = path.join(__dirname, "data", "events.json");

/* =========================================
   PDF UPLOAD DIRECTORY
   ========================================= */

const noticesUploadDir = path.join(__dirname, "uploads", "notices");

/*
 * Create upload directory automatically
 * if it does not exist.
 */

if (!fs.existsSync(noticesUploadDir)) {
  fs.mkdirSync(noticesUploadDir, {
    recursive: true,
  });
}

/*
 * Make uploaded PDFs publicly accessible.
 *
 * Example:
 * http://localhost:3000/uploads/notices/file.pdf
 */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================
   MULTER CONFIGURATION
   ========================================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, noticesUploadDir);
  },

  filename: function (req, file, cb) {
    const originalName = path.basename(
      file.originalname,
      path.extname(file.originalname),
    );

    /*
     * Remove unsafe characters.
     */

    const safeName = originalName
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    const timestamp = Date.now();

    const filename = `${timestamp}-${safeName}.pdf`;

    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10 MB
  },

  fileFilter: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const isPDF =
      extension === ".pdf" &&
      (file.mimetype === "application/pdf" ||
        file.mimetype === "application/octet-stream");

    if (!isPDF) {
      return cb(new Error("Only PDF files are allowed."));
    }

    cb(null, true);
  },
});

/* =========================================
   HELPER FUNCTIONS
   ========================================= */

/*
 * READ EVENTS
 */

function readEvents() {
  try {
    const data = fs.readFileSync(eventsFile, "utf8");

    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading events:", error);

    return [];
  }
}

/*
 * SAVE EVENTS
 */

function saveEvents(events) {
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 4), "utf8");
}

/*
 * NORMALIZE NOTICE DATE
 *
 * Old notices may have:
 *
 * 12 Sep 2026
 *
 * New notices use:
 *
 * 2026-09-12
 */

function normalizeNoticeDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  /*
   * Already ISO format
   */

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  /*
   * Try normal JavaScript date.
   */

  const parsed = new Date(dateValue);

  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();

    const month = String(parsed.getMonth() + 1).padStart(2, "0");

    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return dateValue;
}

/*
 * READ NOTICES
 */

function readNotices() {
  try {
    const data = fs.readFileSync(noticesFile, "utf8");

    const notices = JSON.parse(data);

    /*
     * Fix old date format
     * automatically.
     */

    return notices.map((notice) => ({
      ...notice,

      date: normalizeNoticeDate(notice.date),

      important: notice.important === true,
    }));
  } catch (error) {
    console.error("Error reading notices:", error);

    return [];
  }
}

/*
 * SAVE NOTICES
 */

function saveNotices(notices) {
  fs.writeFileSync(noticesFile, JSON.stringify(notices, null, 4), "utf8");
}

/*
 * DELETE STORED PDF
 */

function deleteStoredPdf(pdfUrl) {
  if (!pdfUrl) {
    return;
  }

  try {
    /*
     * Only handle our own
     * local uploaded PDFs.
     */

    if (!pdfUrl.startsWith("/uploads/notices/")) {
      return;
    }

    const filename = path.basename(decodeURIComponent(pdfUrl));

    const filePath = path.join(noticesUploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("PDF delete error:", error);
  }
}

/*
 * CREATE PDF URL
 */

function getPdfUrl(filename) {
  if (!filename) {
    return "";
  }

  return `/uploads/notices/${filename}`;
}

/* =====================================================
   =====================================================
                         NOTICES API
   =====================================================
   ===================================================== */

/* =========================================
   GET ALL NOTICES
   ========================================= */

app.get("/api/notices", (req, res) => {
  const notices = readNotices();

  /*
   * Newest notices first.
   */

  notices.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json(notices);
});

/* =========================================
   GET SINGLE NOTICE
   ========================================= */

app.get("/api/notices/:id", (req, res) => {
  const notices = readNotices();

  const id = Number(req.params.id);

  const notice = notices.find((item) => item.id === id);

  if (!notice) {
    return res.status(404).json({
      message: "Notice not found",
    });
  }

  res.json(notice);
});

/* =========================================
   ADD NEW NOTICE
   ========================================= */

app.post("/api/notices", upload.single("pdf"), (req, res) => {
  try {
    const notices = readNotices();

    const {
      date,

      noticeType,

      titleHi,

      titleEn,

      externalLink,

      descriptionHi,

      descriptionEn,

      important,
    } = req.body;

    const type = noticeType || "text";

    /*
     * Basic validation
     */

    if (!date || !titleHi || !titleEn) {
      /*
       * If PDF was uploaded
       * but validation fails,
       * remove it.
       */

      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Date, Hindi title and English title are required.",
      });
    }

    /*
     * PDF required for
     * PDF / PDF + Link
     */

    if ((type === "pdf" || type === "both") && !req.file) {
      return res.status(400).json({
        message: "Please upload a PDF file.",
      });
    }

    /*
     * Link required for
     * PDF + External Link
     */

    if (type === "both" && !externalLink) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Please provide the external link.",
      });
    }

    /*
     * Generate ID
     */

    const newId =
      notices.length > 0
        ? Math.max(...notices.map((notice) => Number(notice.id) || 0)) + 1
        : 1;

    /*
     * PDF URL
     */

    const pdfUrl = req.file ? getPdfUrl(req.file.filename) : "";

    /*
     * Create notice
     */

    const newNotice = {
      id: newId,

      date: normalizeNoticeDate(date),

      noticeType: type,

      titleHi: titleHi.trim(),

      titleEn: titleEn.trim(),

      descriptionHi: (descriptionHi || "").trim(),

      descriptionEn: (descriptionEn || "").trim(),

      important: important === true || important === "true",

      pdfUrl: pdfUrl,

      externalLink: (externalLink || "").trim(),
    };

    /*
     * Save
     */

    notices.unshift(newNotice);

    saveNotices(notices);

    res.status(201).json(newNotice);
  } catch (error) {
    console.error("ADD NOTICE ERROR:", error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error(deleteError);
      }
    }

    res.status(500).json({
      message: "Notice could not be added.",
    });
  }
});

/* =========================================
   UPDATE NOTICE
   ========================================= */

app.put("/api/notices/:id", upload.single("pdf"), (req, res) => {
  try {
    const notices = readNotices();

    const id = Number(req.params.id);

    const noticeIndex = notices.findIndex((notice) => Number(notice.id) === id);

    if (noticeIndex === -1) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        message: "Notice not found",
      });
    }

    const oldNotice = notices[noticeIndex];

    const {
      date,

      noticeType,

      titleHi,

      titleEn,

      externalLink,

      descriptionHi,

      descriptionEn,

      important,

      existingPdf,
    } = req.body;

    const type = noticeType || "text";

    /*
     * Basic validation
     */

    if (!date || !titleHi || !titleEn) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Date, Hindi title and English title are required.",
      });
    }

    /*
     * Determine PDF
     */

    let pdfUrl = oldNotice.pdfUrl || existingPdf || "";

    /*
     * New PDF uploaded
     */

    if (req.file) {
      /*
       * Delete old PDF
       */

      deleteStoredPdf(oldNotice.pdfUrl);

      /*
       * Use new PDF
       */

      pdfUrl = getPdfUrl(req.file.filename);
    }

    /*
     * If changed to TEXT,
     * remove existing PDF.
     */

    if (type === "text") {
      if (oldNotice.pdfUrl && !req.file) {
        deleteStoredPdf(oldNotice.pdfUrl);
      }

      pdfUrl = "";
    }

    /*
     * PDF required for
     * PDF / BOTH
     */

    if ((type === "pdf" || type === "both") && !pdfUrl) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Please upload a PDF file.",
      });
    }

    /*
     * Link required for BOTH
     */

    if (type === "both" && !externalLink) {
      return res.status(400).json({
        message: "Please provide the external link.",
      });
    }

    /*
     * Updated notice
     */

    const updatedNotice = {
      id: id,

      date: normalizeNoticeDate(date),

      noticeType: type,

      titleHi: titleHi.trim(),

      titleEn: titleEn.trim(),

      descriptionHi: (descriptionHi || "").trim(),

      descriptionEn: (descriptionEn || "").trim(),

      important: important === true || important === "true",

      pdfUrl: pdfUrl,

      externalLink: (externalLink || "").trim(),
    };

    notices[noticeIndex] = updatedNotice;

    saveNotices(notices);

    res.json({
      message: "Notice updated successfully",

      notice: updatedNotice,
    });
  } catch (error) {
    console.error("UPDATE NOTICE ERROR:", error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error(deleteError);
      }
    }

    res.status(500).json({
      message: "Notice could not be updated.",
    });
  }
});

/* =========================================
   DELETE NOTICE
   ========================================= */

app.delete("/api/notices/:id", (req, res) => {
  try {
    const notices = readNotices();

    const id = Number(req.params.id);

    const notice = notices.find((item) => Number(item.id) === id);

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    /*
     * Delete associated PDF
     */

    deleteStoredPdf(notice.pdfUrl);

    /*
     * Remove notice
     */

    const updatedNotices = notices.filter((item) => Number(item.id) !== id);

    saveNotices(updatedNotices);

    res.json({
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE NOTICE ERROR:", error);

    res.status(500).json({
      message: "Notice could not be deleted.",
    });
  }
});

/* =====================================================
   =====================================================
                          EVENTS API
   =====================================================
   ===================================================== */

/* =========================================
   GET ALL EVENTS
   ========================================= */

app.get("/api/events", (req, res) => {
  const events = readEvents();

  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json(events);
});

/* =========================================
   GET SINGLE EVENT
   ========================================= */

app.get("/api/events/:id", (req, res) => {
  const events = readEvents();

  const id = Number(req.params.id);

  const event = events.find((item) => item.id === id);

  if (!event) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  res.json(event);
});

/* =========================================
   ADD NEW EVENT
   ========================================= */

app.post("/api/events", (req, res) => {
  const events = readEvents();

  const {
    date,

    categoryHi,

    categoryEn,

    titleHi,

    titleEn,

    descriptionHi,

    descriptionEn,
  } = req.body;

  if (
    !date ||
    !categoryHi ||
    !categoryEn ||
    !titleHi ||
    !titleEn ||
    !descriptionHi ||
    !descriptionEn
  ) {
    return res.status(400).json({
      message: "All event fields are required.",
    });
  }

  const newEvent = {
    id:
      events.length > 0
        ? Math.max(...events.map((event) => Number(event.id) || 0)) + 1
        : 1,

    date,

    categoryHi,

    categoryEn,

    titleHi,

    titleEn,

    descriptionHi,

    descriptionEn,
  };

  events.push(newEvent);

  saveEvents(events);

  res.status(201).json(newEvent);
});

/* =========================================
   DELETE EVENT
   ========================================= */

app.delete("/api/events/:id", (req, res) => {
  const events = readEvents();

  const id = Number(req.params.id);

  const updatedEvents = events.filter((event) => event.id !== id);

  if (updatedEvents.length === events.length) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  saveEvents(updatedEvents);

  res.json({
    message: "Event deleted successfully",
  });
});

/* =========================================
   UPDATE EVENT
   ========================================= */

app.put("/api/events/:id", (req, res) => {
  const events = readEvents();

  const id = Number(req.params.id);

  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  const {
    date,

    categoryHi,

    categoryEn,

    titleHi,

    titleEn,

    descriptionHi,

    descriptionEn,
  } = req.body;

  if (
    !date ||
    !categoryHi ||
    !categoryEn ||
    !titleHi ||
    !titleEn ||
    !descriptionHi ||
    !descriptionEn
  ) {
    return res.status(400).json({
      message: "All event fields are required.",
    });
  }

  events[eventIndex] = {
    id: id,

    date,

    categoryHi,

    categoryEn,

    titleHi,

    titleEn,

    descriptionHi,

    descriptionEn,
  };

  saveEvents(events);

  res.json({
    message: "Event updated successfully",

    event: events[eventIndex],
  });
});

/* =========================================
   MULTER / SERVER ERROR HANDLER
   ========================================= */

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "PDF file is too large. Maximum allowed size is 10 MB.",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }

  if (error && error.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      message: "Only PDF files are allowed.",
    });
  }

  res.status(500).json({
    message: "Something went wrong on the server.",
  });
});

/* =========================================
   SERVER
   ========================================= */

app.listen(PORT, () => {
  console.log(`School website backend running at http://localhost:${PORT}`);
});
