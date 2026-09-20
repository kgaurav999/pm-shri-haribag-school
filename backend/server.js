const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const helmet = require("helmet");

const pool = require("./db");

const authRoutes = require("./auth/auth.routes");
const {
  requireAdmin,
  requireAdminForWrite,
} = require("./auth/auth.middleware");

const app = express();
const PORT = 3000;

// --------------------------------------------------
// BASIC SETTINGS
// --------------------------------------------------

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    name: "haribag.sid",

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);
// ==================================================
// AUTHENTICATION API
// ==================================================

app.use("/api/auth", authRoutes);

// ==================================================
// ADMIN WRITE API PROTECTION
// GET requests remain public.
// POST / PUT / PATCH / DELETE require admin login.
// ==================================================

app.use(
  ["/api/notices", "/api/events", "/api/teachers", "/api/gallery"],
  requireAdminForWrite,
);

// --------------------------------------------------
// UPLOAD FOLDER
// --------------------------------------------------

const uploadDir = path.join(__dirname, "uploads", "notices");
// =========================================
// TEACHER PHOTO UPLOAD CONFIGURATION
// =========================================

const teacherUploadDir = path.join(__dirname, "uploads", "teachers");
// =========================================
// GALLERY IMAGE UPLOAD FOLDER
// =========================================

const galleryUploadDir = path.join(__dirname, "uploads", "gallery");

if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, {
    recursive: true,
  });
}

// =========================================
// GALLERY IMAGE UPLOAD CONFIGURATION
// =========================================

const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, galleryUploadDir);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const safeName = `gallery-${Date.now()}${extension}`;

    cb(null, safeName);
  },
});

const galleryUpload = multer({
  storage: galleryStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }

    cb(null, true);
  },
});

if (!fs.existsSync(teacherUploadDir)) {
  fs.mkdirSync(teacherUploadDir, {
    recursive: true,
  });
}

const teacherStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, teacherUploadDir);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const safeName = `teacher-${Date.now()}${extension}`;

    cb(null, safeName);
  },
});

const teacherUpload = multer({
  storage: teacherStorage,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }

    cb(null, true);
  },
});

// =========================================
// TEACHER PHOTO DELETE HELPER
// =========================================

function deleteTeacherPhoto(photoFile) {
  if (!photoFile) return;

  const filePath = path.join(__dirname, "uploads", photoFile);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("Teacher photo deleted:", filePath);
  }
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------------
// MULTER - PDF UPLOAD
// --------------------------------------------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ".pdf";

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const isPDF =
      file.mimetype === "application/pdf" ||
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isPDF) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

// --------------------------------------------------
// HELPER - DELETE OLD PDF
// --------------------------------------------------

function deletePdfFile(filename) {
  if (!filename) return;

  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// --------------------------------------------------
// NOTICE DATABASE FORMAT → FRONTEND FORMAT
// --------------------------------------------------

function formatNotice(row) {
  return {
    id: row.id,
    date: row.notice_date,
    titleHi: row.title_hi,
    titleEn: row.title_en,
    descriptionHi: row.description_hi || "",
    descriptionEn: row.description_en || "",
    noticeType: row.notice_type,
    pdfFile: row.pdf_file || null,
    externalLink: row.external_link || null,
    important: row.important,
    createdAt: row.created_at,
  };
}

// --------------------------------------------------
// EVENT DATABASE FORMAT → FRONTEND FORMAT
// --------------------------------------------------

function formatEvent(row) {
  return {
    id: row.id,
    date: row.event_date,
    categoryHi: row.category_hi,
    categoryEn: row.category_en,
    titleHi: row.title_hi,
    titleEn: row.title_en,
    descriptionHi: row.description_hi || "",
    descriptionEn: row.description_en || "",
    createdAt: row.created_at,
  };
}

// ==================================================
// NOTICES API
// ==================================================

// GET ALL NOTICES

app.get("/api/notices", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
             FROM notices
             ORDER BY notice_date DESC, id DESC`,
    );

    res.json(result.rows.map(formatNotice));
  } catch (error) {
    console.error("GET notices error:", error.message);

    res.status(500).json({
      error: "Failed to load notices.",
    });
  }
});

// GET SINGLE NOTICE

app.get("/api/notices/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
             FROM notices
             WHERE id = $1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Notice not found.",
      });
    }

    res.json(formatNotice(result.rows[0]));
  } catch (error) {
    console.error("GET notice error:", error.message);

    res.status(500).json({
      error: "Failed to load notice.",
    });
  }
});

// ADD NOTICE

app.post("/api/notices", upload.single("noticePdf"), async (req, res) => {
  try {
    const {
      noticeDate,
      noticeType,
      titleHi,
      titleEn,
      descriptionHi,
      descriptionEn,
      externalLink,
      important,
    } = req.body;

    // Validate required fields
    if (!noticeDate || !noticeType || !titleHi || !titleEn) {
      if (req.file) {
        deletePdfFile(req.file.filename);
      }

      return res.status(400).json({
        error: "Required notice fields are missing.",
      });
    }

    const pdfFile = req.file ? req.file.filename : null;

    const result = await pool.query(
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
                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9)
                RETURNING *`,

      [
        noticeDate,
        titleHi,
        titleEn,
        descriptionHi || "",
        descriptionEn || "",
        noticeType,
        pdfFile,
        externalLink || null,
        important === "true" || important === true,
      ],
    );

    res.status(201).json(formatNotice(result.rows[0]));
  } catch (error) {
    console.error("POST notice error:", error.message);

    if (req.file) {
      deletePdfFile(req.file.filename);
    }

    res.status(500).json({
      error: "Failed to add notice.",
    });
  }
});

// UPDATE NOTICE

app.put("/api/notices/:id", upload.single("noticePdf"), async (req, res) => {
  try {
    const id = req.params.id;

    const existing = await pool.query(
      `SELECT *
                 FROM notices
                 WHERE id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      if (req.file) {
        deletePdfFile(req.file.filename);
      }

      return res.status(404).json({
        error: "Notice not found.",
      });
    }

    const oldNotice = existing.rows[0];

    const {
      noticeDate,
      noticeType,
      titleHi,
      titleEn,
      descriptionHi,
      descriptionEn,
      externalLink,
      important,
    } = req.body;

    let pdfFile = oldNotice.pdf_file;

    // If new PDF uploaded
    if (req.file) {
      pdfFile = req.file.filename;

      // Delete old PDF
      if (oldNotice.pdf_file) {
        deletePdfFile(oldNotice.pdf_file);
      }
    }

    // If notice type doesn't require PDF
    if (noticeType === "text" || noticeType === "link") {
      if (oldNotice.pdf_file && !req.file) {
        deletePdfFile(oldNotice.pdf_file);
      }

      pdfFile = null;
    }

    const result = await pool.query(
      `UPDATE notices
                 SET
                    notice_date = $1,
                    title_hi = $2,
                    title_en = $3,
                    description_hi = $4,
                    description_en = $5,
                    notice_type = $6,
                    pdf_file = $7,
                    external_link = $8,
                    important = $9
                 WHERE id = $10
                 RETURNING *`,

      [
        noticeDate,
        titleHi,
        titleEn,
        descriptionHi || "",
        descriptionEn || "",
        noticeType,
        pdfFile,
        externalLink || null,
        important === "true" || important === true,
        id,
      ],
    );

    res.json(formatNotice(result.rows[0]));
  } catch (error) {
    console.error("PUT notice error:", error.message);

    if (req.file) {
      deletePdfFile(req.file.filename);
    }

    res.status(500).json({
      error: "Failed to update notice.",
    });
  }
});

// DELETE NOTICE

app.delete("/api/notices/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM notices
             WHERE id = $1
             RETURNING *`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Notice not found.",
      });
    }

    const deletedNotice = result.rows[0];

    // Delete associated PDF
    if (deletedNotice.pdf_file) {
      deletePdfFile(deletedNotice.pdf_file);
    }

    res.json({
      message: "Notice deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE notice error:", error.message);

    res.status(500).json({
      error: "Failed to delete notice.",
    });
  }
});

// ==================================================
// EVENTS API
// ==================================================

// GET ALL EVENTS

app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
             FROM events
             ORDER BY event_date ASC, id ASC`,
    );

    res.json(result.rows.map(formatEvent));
  } catch (error) {
    console.error("GET events error:", error.message);

    res.status(500).json({
      error: "Failed to load events.",
    });
  }
});

// GET SINGLE EVENT

app.get("/api/events/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
             FROM events
             WHERE id = $1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    res.json(formatEvent(result.rows[0]));
  } catch (error) {
    console.error("GET event error:", error.message);

    res.status(500).json({
      error: "Failed to load event.",
    });
  }
});

// ADD EVENT

app.post("/api/events", async (req, res) => {
  try {
    const {
      date,
      categoryHi,
      categoryEn,
      titleHi,
      titleEn,
      descriptionHi,
      descriptionEn,
    } = req.body;

    if (!date || !categoryHi || !categoryEn || !titleHi || !titleEn) {
      return res.status(400).json({
        error: "Required event fields are missing.",
      });
    }

    const result = await pool.query(
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
            VALUES
            ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,

      [
        date,
        categoryHi,
        categoryEn,
        titleHi,
        titleEn,
        descriptionHi || "",
        descriptionEn || "",
      ],
    );

    res.status(201).json(formatEvent(result.rows[0]));
  } catch (error) {
    console.error("POST event error:", error.message);

    res.status(500).json({
      error: "Failed to add event.",
    });
  }
});

// UPDATE EVENT

app.put("/api/events/:id", async (req, res) => {
  try {
    const {
      date,
      categoryHi,
      categoryEn,
      titleHi,
      titleEn,
      descriptionHi,
      descriptionEn,
    } = req.body;

    const result = await pool.query(
      `UPDATE events
             SET
                event_date = $1,
                category_hi = $2,
                category_en = $3,
                title_hi = $4,
                title_en = $5,
                description_hi = $6,
                description_en = $7
             WHERE id = $8
             RETURNING *`,

      [
        date,
        categoryHi,
        categoryEn,
        titleHi,
        titleEn,
        descriptionHi || "",
        descriptionEn || "",
        req.params.id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    res.json(formatEvent(result.rows[0]));
  } catch (error) {
    console.error("PUT event error:", error.message);

    res.status(500).json({
      error: "Failed to update event.",
    });
  }
});

// DELETE EVENT

app.delete("/api/events/:id", async (req, res) => {
  try {
    rs;
    const result = await pool.query(
      `DELETE FROM events
             WHERE id = $1
             RETURNING id`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    res.json({
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE event error:", error.message);

    res.status(500).json({
      error: "Failed to delete event.",
    });
  }
});
// ==================================================
// GALLERY API
// ==================================================

// ==================================================
// GALLERY API
// ==================================================
// ADD GALLERY IMAGE

app.post("/api/gallery", galleryUpload.single("image"), async (req, res) => {
  try {
    const { titleHi, titleEn, categoryHi, categoryEn, displayOrder } = req.body;

    // Image is required
    if (!req.file) {
      return res.status(400).json({
        error: "Gallery image is required.",
      });
    }

    const imageFile = `gallery/${req.file.filename}`;

    const result = await pool.query(
      `
        INSERT INTO gallery (
          title_hi,
          title_en,
          category_hi,
          category_en,
          image_file,
          display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
      [
        titleHi || null,
        titleEn || null,
        categoryHi || null,
        categoryEn || null,
        imageFile,
        Number(displayOrder) || 0,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST gallery error:", error.message);

    // Delete uploaded image if database insert fails
    if (req.file) {
      const filePath = path.join(galleryUploadDir, req.file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      error: "Failed to add gallery image.",
    });
  }
});
// =========================================
// DELETE GALLERY IMAGE
// =========================================

app.delete("/api/gallery/:id", async (req, res) => {
  try {
    const galleryId = Number(req.params.id);

    if (!galleryId) {
      return res.status(400).json({
        error: "Invalid gallery ID.",
      });
    }

    // Get image file before deleting database record
    const result = await pool.query(
      `
      SELECT image_file
      FROM gallery
      WHERE id = $1
      `,
      [galleryId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Gallery image not found.",
      });
    }

    const imageFile = result.rows[0].image_file;

    // Delete database record
    await pool.query(
      `
      DELETE FROM gallery
      WHERE id = $1
      `,
      [galleryId],
    );

    // Delete actual image file
    if (imageFile) {
      const filePath = path.join(galleryUploadDir, path.basename(imageFile));

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      message: "Gallery image deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE gallery error:", error.message);

    res.status(500).json({
      error: "Failed to delete gallery image.",
    });
  }
});

// GET ALL GALLERY IMAGES

app.get("/api/gallery", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title_hi,
        title_en,
        category_hi,
        category_en,
        image_file,
        display_order,
        created_at
      FROM gallery
      ORDER BY display_order ASC, id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET gallery error:", error.message);

    res.status(500).json({
      error: "Failed to load gallery.",
    });
  }
});
// ==================================================
// DATABASE CONNECTION TEST
// ==================================================

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// =========================================
// TEACHERS API
// =========================================

app.get("/api/teachers", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                id,
                name_hi,
                name_en,
                designation_hi,
                designation_en,
                subject_hi,
                subject_en,
                photo_file,
                display_order
            FROM teachers
            ORDER BY display_order ASC, id ASC
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Teachers API Error:", error);

    res.status(500).json({
      error: "Failed to load teachers",
    });
  }
});
// =========================================
// ADD TEACHER API
// =========================================

app.post("/api/teachers", teacherUpload.single("photo"), async (req, res) => {
  try {
    const {
      nameHi,
      nameEn,
      designationHi,
      designationEn,
      subjectHi,
      subjectEn,
      displayOrder,
    } = req.body;
    const photoFile = req.file ? `teachers/${req.file.filename}` : null;
    // Required fields

    if (!nameHi || !nameEn) {
      return res.status(400).json({
        error: "Hindi and English teacher names are required.",
      });
    }

    const result = await pool.query(
      `
           INSERT INTO teachers (
    name_hi,
    name_en,
    designation_hi,
    designation_en,
    subject_hi,
    subject_en,
    photo_file,
    display_order
)

            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

            RETURNING *
            `,
      [
        nameHi,
        nameEn,
        designationHi || null,
        designationEn || null,
        subjectHi || null,
        subjectEn || null,
        photoFile,
        Number(displayOrder) || 0,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Add Teacher API Error:", error);

    res.status(500).json({
      error: "Failed to add teacher.",
    });
  }
});

// =========================================
// UPDATE TEACHER API
// =========================================

app.put(
  "/api/teachers/:id",
  teacherUpload.single("photo"),
  async (req, res) => {
    try {
      const teacherId = Number(req.params.id);
      // Get old teacher photo
      const oldTeacherResult = await pool.query(
        `
  SELECT photo_file
  FROM teachers
  WHERE id = $1
  `,
        [teacherId],
      );

      if (oldTeacherResult.rows.length === 0) {
        if (req.file) {
          deleteTeacherPhoto(`teachers/${req.file.filename}`);
        }

        return res.status(404).json({
          error: "Teacher not found.",
        });
      }

      const oldPhotoFile = oldTeacherResult.rows[0].photo_file;

      const {
        nameHi,
        nameEn,
        designationHi,
        designationEn,
        subjectHi,
        subjectEn,
        displayOrder,
      } = req.body;
      const photoFile = req.file ? `teachers/${req.file.filename}` : null;
      if (!nameHi || !nameEn) {
        return res.status(400).json({
          error: "Hindi and English teacher names are required.",
        });
      }

      const result = await pool.query(
        `
     UPDATE teachers

     SET
         name_hi = $1,
         name_en = $2,
         designation_hi = $3,
         designation_en = $4,
         subject_hi = $5,
         subject_en = $6,
         photo_file = COALESCE($7, photo_file),
         display_order = $8

     WHERE id = $9

     RETURNING *
     `,

        [
          nameHi,
          nameEn,
          designationHi || null,
          designationEn || null,
          subjectHi || null,
          subjectEn || null,
          photoFile,
          Number(displayOrder) || 0,
          teacherId,
        ],
      );

      // Delete old photo only when a new photo was uploaded
      if (req.file && oldPhotoFile) {
        deleteTeacherPhoto(oldPhotoFile);
      }

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Teacher not found.",
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update Teacher API Error:", error);

      res.status(500).json({
        error: "Failed to update teacher.",
      });
    }
  },
);

// =========================================
// DELETE TEACHER API
// =========================================

app.delete("/api/teachers/:id", async (req, res) => {
  try {
    const teacherId = Number(req.params.id);

    if (!teacherId) {
      return res.status(400).json({
        error: "Invalid teacher ID.",
      });
    }

    const result = await pool.query(
      `
            DELETE FROM teachers
            WHERE id = $1
            RETURNING *
            `,
      [teacherId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Teacher not found.",
      });
    }

    // Delete teacher photo from server
    const deletedTeacher = result.rows[0];

    if (deletedTeacher.photo_file) {
      deleteTeacherPhoto(deletedTeacher.photo_file);
    }

    res.json({
      message: "Teacher deleted successfully.",
      teacher: result.rows[0],
    });
  } catch (error) {
    console.error("Delete Teacher API Error:", error);

    res.status(500).json({
      error: "Failed to delete teacher.",
    });
  }
});

// ==================================================
// ERROR HANDLER
// ==================================================

app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "PDF file must be 10 MB or smaller.",
      });
    }

    return res.status(400).json({
      error: error.message,
    });
  }

  if (error.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      error: "Only PDF files are allowed.",
    });
  }

  res.status(500).json({
    error: "Something went wrong on the server.",
  });
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  console.log("🗄️ PostgreSQL database connected through db.js");
});
