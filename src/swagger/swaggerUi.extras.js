(function () {
  var MODULE_PREFIX = {
    member: "Member \u2014",
    admin: "Admin \u2014",
    staff: "Staff \u2014",
  };

  function applyBearerToken(token) {
    var clean = String(token || "")
      .replace(/^Bearer\s+/i, "")
      .trim();
    if (!clean || !window.ui || !window.ui.authActions) return false;
    try {
      window.ui.authActions.logout(["bearerAuth"]);
    } catch (e) {
      /* ignore */
    }
    window.ui.authActions.authorize({
      bearerAuth: {
        name: "bearerAuth",
        schema: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        value: clean,
      },
    });
    var input = document.getElementById("toybox-token-input");
    if (input) input.value = clean;
    return true;
  }

  window.toyboxApplyBearerToken = applyBearerToken;

  function setStatus(msg, isError) {
    var el = document.getElementById("toybox-token-status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = isError ? "error" : "";
  }

  function readStoredToken() {
    try {
      var auth = JSON.parse(localStorage.getItem("authorized") || "{}");
      return auth.bearerAuth && auth.bearerAuth.value ? auth.bearerAuth.value : "";
    } catch (e) {
      return "";
    }
  }

  function clearSwaggerFilter() {
    var input = document.querySelector(".swagger-ui .filter-container input");
    if (!input) return;
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("keyup", { bubbles: true }));
  }

  function applyModuleFilter(moduleKey) {
    var prefix = moduleKey ? MODULE_PREFIX[moduleKey] : "";
    var sections = document.querySelectorAll(".swagger-ui .opblock-tag-section");
    if (!sections.length) return false;

    clearSwaggerFilter();
    sections.forEach(function (section) {
      var tagEl = section.querySelector(".opblock-tag");
      var tagName = tagEl ? String(tagEl.textContent || "").trim() : "";
      var show = !prefix || tagName.indexOf(prefix) === 0;
      section.style.display = show ? "" : "none";
    });
    return true;
  }

  function injectModuleFilters() {
    if (document.getElementById("toybox-module-filters")) return;
    var bar = document.getElementById("toybox-auth-bar");
    if (!bar) return;

    var wrap = document.createElement("div");
    wrap.id = "toybox-module-filters";
    wrap.innerHTML =
      '<span class="toybox-module-label">Module</span>' +
      '<button type="button" class="toybox-module-btn active" data-module="">All</button>' +
      '<button type="button" class="toybox-module-btn" data-module="member">Member</button>' +
      '<button type="button" class="toybox-module-btn" data-module="admin">Admin</button>' +
      '<button type="button" class="toybox-module-btn" data-module="staff">Staff</button>';

    bar.appendChild(wrap);

    wrap.querySelectorAll(".toybox-module-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        wrap.querySelectorAll(".toybox-module-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        var moduleKey = btn.getAttribute("data-module") || "";
        if (!applyModuleFilter(moduleKey)) {
          setStatus("Swagger still loading\u2026", true);
        } else {
          setStatus("");
        }
      });
    });
  }

  function injectTokenBar() {
    if (document.getElementById("toybox-auth-bar")) return;
    var ui = document.getElementById("swagger-ui");
    if (!ui || !ui.parentNode) return;

    var bar = document.createElement("div");
    bar.id = "toybox-auth-bar";
    bar.innerHTML =
      '<label for="toybox-token-input">Bearer token</label>' +
      '<input id="toybox-token-input" type="text" spellcheck="false" ' +
      'placeholder="Paste accessToken from POST /auth/sign-in — applies to ALL protected APIs" />' +
      '<button type="button" id="toybox-token-apply">Apply token</button>' +
      '<button type="button" id="toybox-token-clear">Clear</button>' +
      '<span id="toybox-token-status"></span>';

    ui.parentNode.insertBefore(bar, ui);

    var input = document.getElementById("toybox-token-input");
    var stored = readStoredToken();
    if (stored) input.value = stored;

    document.getElementById("toybox-token-apply").addEventListener("click", function () {
      var token = input.value.trim();
      if (!token) {
        setStatus("Paste a token first", true);
        return;
      }
      if (!window.ui) {
        setStatus("Swagger still loading\u2026", true);
        return;
      }
      if (applyBearerToken(token)) {
        setStatus("Token applied — lock icon should be closed");
      } else {
        setStatus("Could not apply token", true);
      }
    });

    document.getElementById("toybox-token-clear").addEventListener("click", function () {
      input.value = "";
      if (window.ui && window.ui.authActions) {
        window.ui.authActions.logout(["bearerAuth"]);
      }
      setStatus("Token cleared");
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        document.getElementById("toybox-token-apply").click();
      }
    });
  }

  function hideResponseHeaders() {
    document.querySelectorAll(".swagger-ui h4, .swagger-ui h5").forEach(function (heading) {
      var text = (heading.textContent || "").trim().toLowerCase();
      if (text !== "response headers") return;
      heading.classList.add("toybox-hidden-headers");
      var sibling = heading.nextElementSibling;
      while (sibling) {
        sibling.classList.add("toybox-hidden-headers");
        if (sibling.tagName === "H4" || sibling.tagName === "H5") break;
        sibling = sibling.nextElementSibling;
      }
    });
  }

  function boot() {
    injectTokenBar();
    injectModuleFilters();
    hideResponseHeaders();
    var stored = readStoredToken();
    if (stored && window.ui) applyBearerToken(stored);
  }

  var observer = new MutationObserver(function () {
    injectTokenBar();
    injectModuleFilters();
    hideResponseHeaders();
  });

  window.addEventListener("load", function () {
    boot();
    observer.observe(document.body, { childList: true, subtree: true });
    var n = 0;
    var tick = setInterval(function () {
      boot();
      if (++n > 40) clearInterval(tick);
    }, 200);
  });
})();
