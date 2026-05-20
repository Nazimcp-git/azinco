/**
 * ========================================
 * Azinco Interiors — Admin Authentication
 * ========================================
 * Simple SHA-256 password check.
 * No backend needed — hash is compared client-side.
 *
 * To set your password:
 * 1. Go to https://emn178.github.io/online-tools/sha256.html
 * 2. Type your password, copy the hash
 * 3. Paste it in CONFIG.ADMIN_PASSWORD_HASH
 */

var AdminAuth = (function () {

  function init() {
    // Check if already authenticated this session
    if (sessionStorage.getItem("azinco_admin") === "true") {
      _showDashboard();
    }
    _bindEvents();
  }

  function _bindEvents() {
    var form = document.getElementById("loginForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        _handleLogin();
      });
    }

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  }

  async function _handleLogin() {
    var passInput = document.getElementById("adminPassword");
    var loginBtn = document.getElementById("loginBtn");
    var errorEl = document.getElementById("loginError");

    var password = passInput ? passInput.value : "";

    if (!password) {
      _showError("Please enter a password.");
      return;
    }

    if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = "Verifying…"; }

    try {
      // Hash the entered password with SHA-256
      var hash = await _sha256(password);

      if (hash === CONFIG.ADMIN_PASSWORD_HASH) {
        sessionStorage.setItem("azinco_admin", "true");
        Toast.success("Welcome back!");
        _showDashboard();
      } else {
        _showError("Incorrect password.");
        Toast.error("Wrong password.");
      }
    } catch (err) {
      _showError("Authentication error.");
    }

    if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = "Sign In"; }
  }

  /**
   * SHA-256 hash using Web Crypto API (built into all browsers).
   */
  async function _sha256(message) {
    var msgBuffer = new TextEncoder().encode(message);
    var hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  function _showError(msg) {
    var el = document.getElementById("loginError");
    if (el) { el.textContent = msg; el.style.display = "block"; }
  }

  function _showDashboard() {
    var login = document.getElementById("loginScreen");
    var dash = document.getElementById("dashboard");
    if (login) login.style.display = "none";
    if (dash) dash.style.display = "block";

    // Initialize admin modules
    if (typeof AdminProducts !== "undefined") AdminProducts.init();
    if (typeof AdminUpload !== "undefined") AdminUpload.init();
  }

  function isLoggedIn() {
    return sessionStorage.getItem("azinco_admin") === "true";
  }

  function logout() {
    sessionStorage.removeItem("azinco_admin");
    var login = document.getElementById("loginScreen");
    var dash = document.getElementById("dashboard");
    if (login) login.style.display = "flex";
    if (dash) dash.style.display = "none";
    Toast.info("Logged out.");
  }

  return { init: init, isLoggedIn: isLoggedIn, logout: logout };
})();
