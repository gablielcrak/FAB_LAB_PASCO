(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("open");
    });
  }

  const session = JSON.parse(localStorage.getItem("fablab_session") || "null");
  const auth = document.querySelector(".auth");
  if (session && auth) {
    auth.innerHTML =
      '<span class="user-chip">Hola, ' +
      escapeHtml(session.nombre) +
      '</span><button class="btn btn-ghost" id="logoutBtn" type="button">Salir</button>';
    const logout = document.getElementById("logoutBtn");
    if (logout) {
      logout.addEventListener("click", function () {
        localStorage.removeItem("fablab_session");
        window.location.reload();
      });
    }
  }

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

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      show(document.getElementById("formMsg"), "Mensaje enviado. Te contactaremos pronto.", true);
      contactForm.reset();
    });
  }

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
