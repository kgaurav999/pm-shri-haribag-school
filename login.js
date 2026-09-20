const API_BASE_URL = "http://127.0.0.1:3000";
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

async function checkExistingSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (data.authenticated && data.user) {
      window.location.replace("./admin.html");
    }
  } catch (error) {
    console.error("Session check failed:", error);
  }
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  loginMessage.textContent = "";

  if (!username || !password) {
    loginMessage.textContent = "Username and password are required.";
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent =
        data.error || "Login failed. Please try again.";

      return;
    }

    if (!data.success || !data.user) {
      loginMessage.textContent = "Login failed. Please try again.";
      return;
    }

    loginMessage.style.color = "#15803d";
    loginMessage.textContent = "Login successful. Opening admin panel...";

    window.location.replace("./admin.html");
  } catch (error) {
    console.error("Login error:", error);

    loginMessage.textContent =
      "Unable to connect to the server. Please try again.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});

checkExistingSession();
