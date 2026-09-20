const API_BASE_URL = "http://127.0.0.1:3000";
(async function () {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      window.location.replace("./login.html");
      return;
    }

    const data = await response.json();

    if (!data.authenticated || !data.user) {
      window.location.replace("./login.html");
      return;
    }

    console.log("Admin authenticated:", data.user.username);
  } catch (error) {
    console.error("Authentication check failed:", error);
    window.location.replace("./login.html");
  }
})();

//logout

const logoutButton = document.getElementById("adminLogoutBtn");

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout request failed.");
      }

      window.location.replace("./login.html");
    } catch (error) {
      console.error("Logout error:", error);

      logoutButton.disabled = false;
      logoutButton.textContent = "Logout";

      alert("Logout failed. Please try again.");
    }
  });
}

// =========================================
// INCLUDE ADMIN SESSION IN API REQUESTS
// =========================================

const originalFetch = window.fetch.bind(window);

window.fetch = function (input, init = {}) {
  const requestUrl = typeof input === "string" ? input : input.url;

  if (requestUrl.startsWith(API_BASE_URL)) {
    init = {
      ...init,
      credentials: "include",
    };
  }

  return originalFetch(input, init);
};
