/**
 * ========================================
 * Azinco Interiors — Toast Notifications
 * ========================================
 * Lightweight toast system. No dependencies.
 *
 * Usage:
 *   Toast.success("Product uploaded!");
 *   Toast.error("Upload failed");
 *   Toast.info("Loading products…");
 */

const Toast = (() => {
  let container = null;

  function _getContainer() {
    if (container) return container;
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText =
      "position:fixed;top:24px;right:24px;z-index:99999;" +
      "display:flex;flex-direction:column;gap:10px;pointer-events:none;";
    document.body.appendChild(container);
    return container;
  }

  function _show(message, type) {
    var wrap = _getContainer();

    var colors = {
      success: { bg: "#0d9e5f", icon: "✓" },
      error: { bg: "#e53e3e", icon: "✕" },
      info: { bg: "#3EA6EB", icon: "ℹ" },
      warning: { bg: "#e8a317", icon: "⚠" },
    };

    var c = colors[type] || colors.info;

    var el = document.createElement("div");
    el.style.cssText =
      "pointer-events:auto;display:flex;align-items:center;gap:10px;" +
      "padding:14px 22px;border-radius:10px;color:#fff;font-size:14px;" +
      "font-family:'Mulish',sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.18);" +
      "background:" +
      c.bg +
      ";transform:translateX(120%);transition:transform .35s cubic-bezier(.22,1,.36,1)," +
      "opacity .3s;opacity:0;max-width:360px;word-break:break-word;";

    el.innerHTML =
      '<span style="font-size:18px;flex-shrink:0">' +
      c.icon +
      "</span>" +
      '<span style="flex:1">' +
      message +
      "</span>";

    wrap.appendChild(el);

    // Animate in
    requestAnimationFrame(function () {
      el.style.transform = "translateX(0)";
      el.style.opacity = "1";
    });

    // Auto-dismiss after 4s
    setTimeout(function () {
      el.style.transform = "translateX(120%)";
      el.style.opacity = "0";
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    }, 4000);
  }

  return {
    success: function (msg) { _show(msg, "success"); },
    error: function (msg) { _show(msg, "error"); },
    info: function (msg) { _show(msg, "info"); },
    warning: function (msg) { _show(msg, "warning"); },
  };
})();
