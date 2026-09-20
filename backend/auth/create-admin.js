const readline = require("readline");
const bcrypt = require("bcrypt");

const pool = require("../db");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    const username = (await ask("Admin username: ")).trim();
    const password = await ask("Admin password: ");

    if (!username || !password) {
      throw new Error("Username and password are required.");
    }

    if (password.length < 12) {
      throw new Error("Password must be at least 12 characters long.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
        INSERT INTO admin_users
          (
            username,
            password_hash,
            role,
            is_active
          )
        VALUES
          ($1, $2, 'admin', TRUE)
        RETURNING
          id,
          username,
          role,
          is_active
      `,
      [username, passwordHash],
    );

    console.log("\nAdmin created successfully.");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("\nFailed to create admin:");

    if (error.code === "23505") {
      console.error("Username already exists.");
    } else {
      console.error(error.message);
    }
  } finally {
    await pool.end();
    rl.close();
  }
}

createAdmin();
