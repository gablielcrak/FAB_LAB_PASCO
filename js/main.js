(function () {
  // Manejo del menú desplegable para dispositivos móviles
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("open");
    });
  }

  // Manejo del cambio de tema (Modo Claro / Modo Oscuro)
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("fablab_theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeToggle) themeToggle.textContent = "☀️";
  }

  function setupThemeToggle(btn) {
    if (!btn) return;
    btn.addEventListener("click", function () {
      const isLight = document.body.classList.toggle("light-mode");
      btn.textContent = isLight ? "☀️" : "🌙";
      localStorage.setItem("fablab_theme", isLight ? "light" : "dark");
    });
  }

  setupThemeToggle(themeToggle);

  // Manejo de la sesión de usuario activa
  const session = JSON.parse(localStorage.getItem("fablab_session") || "null");
  const auth = document.querySelector(".auth");
  if (session && auth) {
    const isLightActive = document.body.classList.contains("light-mode");
    auth.innerHTML =
      '<button class="btn btn-ghost theme-toggle" id="themeToggle" type="button" title="Cambiar tema">' +
      (isLightActive ? "☀️" : "🌙") +
      '</button>' +
      '<span class="user-chip">Hola, ' +
      escapeHtml(session.nombre) +
      '</span><button class="btn btn-ghost" id="logoutBtn" type="button">Salir</button>';

    // Volver a enlazar el evento del botón de tema tras reconstruir el contenedor de autenticación
    const newThemeToggle = document.getElementById("themeToggle");
    setupThemeToggle(newThemeToggle);

    const logout = document.getElementById("logoutBtn");
    if (logout) {
      logout.addEventListener("click", function () {
        localStorage.removeItem("fablab_session");
        window.location.reload();
      });
    }
  }

  // Manejo del formulario de inicio de sesión
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const correo = value("loginCorreo").toLowerCase();
      const clave = value("loginClave");
      const users = JSON.parse(localStorage.getItem("fablab_users") || "[]");
      const found = users.find(function (u) {
        return u.correo === correo && u.clave === clave;
      });
      const msg = document.getElementById("formMsg");
      if (!found) {
        show(msg, "Correo o contraseña incorrectos.", false);
        return;
      }
      localStorage.setItem(
        "fablab_session",
        JSON.stringify({ nombre: found.nombre, correo: found.correo })
      );
      show(msg, "Sesión iniciada. Redirigiendo...", true);
      setTimeout(function () {
        window.location.href = "index.html";
      }, 700);
    });
  }

  // Manejo del formulario de registro de nuevos usuarios
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nombre = value("regNombre");
      const correo = value("regCorreo").toLowerCase();
      const clave = value("regClave");
      const msg = document.getElementById("formMsg");
      if (clave.length < 6) {
        show(msg, "La contraseña debe tener al menos 6 caracteres.", false);
        return;
      }
      const users = JSON.parse(localStorage.getItem("fablab_users") || "[]");
      if (users.some(function (u) {
        return u.correo === correo;
      })) {
        show(msg, "Ese correo ya está registrado.", false);
        return;
      }
      users.push({ nombre: nombre, correo: correo, clave: clave });
      localStorage.setItem("fablab_users", JSON.stringify(users));
      localStorage.setItem(
        "fablab_session",
        JSON.stringify({ nombre: nombre, correo: correo })
      );
      show(msg, "Cuenta creada. Redirigiendo...", true);
      setTimeout(function () {
        window.location.href = "index.html";
      }, 700);
    });
  }

  // Manejo del formulario de contacto
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      show(document.getElementById("formMsg"), "Mensaje enviado. Te contactaremos pronto.", true);
      contactForm.reset();
    });
  }

  // Funciones auxiliares de utilidad
  function value(id) {
    return (document.getElementById(id).value || "").trim();
  }

  function show(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.className = "msg " + (ok ? "ok" : "err");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();