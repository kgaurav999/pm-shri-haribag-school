const express = require("express");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

const pool = require("../db");

const router = express.Router();

/*
==================================================
LOGIN RATE LIMITER
==================================================
*/

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error: "Too many login attempts. Please try again later.",
  },
});

/*
==================================================
POST /api/auth/login
==================================================
*/

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Username and password are required.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          username,
          password_hash,
          role,
          is_active
        FROM admin_users
        WHERE username = $1
        LIMIT 1
      `,
      [username.trim()],
    );

    /*
      Same generic response for invalid username/password.
      This avoids revealing whether a username exists.
    */

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: "This account is inactive.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    /*
    --------------------------------------------------
    PREVENT SESSION FIXATION
    --------------------------------------------------
    */

    req.session.regenerate(function (sessionError) {
      if (sessionError) {
        console.error("Session regeneration error:", sessionError);

        return res.status(500).json({
          error: "Login failed. Please try again.",
        });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      req.session.save(function (saveError) {
        if (saveError) {
          console.error("Session save error:", saveError);

          return res.status(500).json({
            error: "Login failed. Please try again.",
          });
        }

        return res.json({
          success: true,
          user: req.session.user,
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Something went wrong while logging in.",
    });
  }
});

/*
==================================================
GET /api/auth/me
==================================================
*/

router.get("/me", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      authenticated: false,
    });
  }

  res.json({
    authenticated: true,
    user: req.session.user,
  });
});

/*
==================================================
POST /api/auth/logout
==================================================
*/

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.json({
      success: true,
    });
  }

  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);

      return res.status(500).json({
        error: "Logout failed.",
      });
    }

    res.clearCookie("haribag.sid");

    res.json({
      success: true,
    });
  });
});

module.exports = router;
