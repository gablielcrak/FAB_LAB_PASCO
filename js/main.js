(function () {
  // ==========================================================================
  // 1. CONFIGURACIÓN E INICIALIZACIÓN DE SUPABASE
  // ==========================================================================
  const SUPABASE_URL = "https://qwlgeohyjjgzkaserznk.supabase.co";
  const SUPABASE_KEY = "sb_publishable_8h0MU4A7j7_yA8Xl7GXebQ_n-qATjUI";

  const supabase = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

  // ==========================================================================
  // 2. MÓDULO CRUD GENERAL (OPERACIONES CON LA BASE DE DATOS)
  // ==========================================================================
  window.FabLabDB = {
    // --- USUARIOS ---
    async registrarUsuario(nombre, correo, clave) {
      const { data, error } = await supabase
        .from("usuarios")
        .insert([{ nombre, correo, clave }])
        .select();
      if (error) throw error;
      return data[0];
    },

    async loginUsuario(correo, clave) {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("correo", correo)
        .eq("clave", clave)
        .single();
      if (error) throw error;
      return data;
    },

    // --- MENSAJES DE CONTACTO ---
    async enviarContacto(nombre, correo, mensaje) {
      const { data, error } = await supabase
        .from("contacto_mensajes")
        .insert([{ nombre, correo, mensaje }]);
      if (error) throw error;
      return data;
    },

    // --- PORTAFOLIO ---
    async obtenerPortafolio() {
      const { data, error } = await supabase
        .from("portafolio")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },

    async crearProyecto(titulo, descripcion, imagen_url) {
      const { data, error } = await supabase
        .from("portafolio")
        .insert([{ titulo, descripcion, imagen_url }])
        .select();
      if (error) throw error;
      return data[0];
    },

    // --- BLOG / RECURSOS ---
    async obtenerArticulos() {
      const { data, error } = await supabase
        .from("blog_articulos")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },

    async crearArticulo(categoria, titulo, contenido) {
      const { data, error } = await supabase
        .from("blog_articulos")
        .insert([{ categoria, titulo, contenido }])
        .select();
      if (error) throw error;
      return data[0];
    }
  };

  // ==========================================================================
  // 3. CARGA DINÁMICA DE DATOS DESDE SUPABASE EN LAS PÁGINAS
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", function () {
    // Cargar proyectos en portafolio.html
    const portafolioContainer = document.querySelector("main.page .grid");
    if (portafolioContainer && window.location.pathname.includes("portafolio.html")) {
      window.FabLabDB.obtenerPortafolio()
        .then(function (proyectos) {
          if (proyectos && proyectos.length > 0) {
            portafolioContainer.innerHTML = proyectos.map(function (p) {
              return (
                '<article class="card">' +
                  '<img src="' + escapeHtml(p.imagen_url) + '" alt="' + escapeHtml(p.titulo) + '">' +
                  '<div class="card-body">' +
                    '<h3>' + escapeHtml(p.titulo) + '</h3>' +
                    '<p>' + escapeHtml(p.descripcion) + '</p>' +
                  '</div>' +
                '</article>'
              );
            }).join('');
          }
        })
        .catch(function (err) {
          console.error("Error al cargar portafolio desde Supabase:", err);
        });
    }

    // Cargar artículos en blog.html
    const articlesContainer = document.querySelector(".articles");
    if (articlesContainer && window.location.pathname.includes("blog.html")) {
      window.FabLabDB.obtenerArticulos()
        .then(function (articulos) {
          if (articulos && articulos.length > 0) {
            articlesContainer.innerHTML = articulos.map(function (a) {
              return (
                '<article class="article">' +
                  '<span>' + escapeHtml(a.categoria) + '</span>' +
                  '<h3>' + escapeHtml(a.titulo) + '</h3>' +
                  '<p>' + escapeHtml(a.contenido) + '</p>' +
                '</article>'
              );
            }).join('');
          }
        })
        .catch(function (err) {
          console.error("Error al cargar artículos desde Supabase:", err);
        });
    }
  });

  // ==========================================================================
  // 4. INTERFAZ Y NAVEGACIÓN
  // ==========================================================================

  // Menú Móvil
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("open");
    });
  }

  // Tema Claro / Oscuro
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

  // Estado de Sesión Activa
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

    setupThemeToggle(document.getElementById("themeToggle"));

    const logout = document.getElementById("logoutBtn");
    if (logout) {
      logout.addEventListener("click", function () {
        localStorage.removeItem("fablab_session");
        window.location.reload();
      });
    }
  }

  // ==========================================================================
  // 5. ENVÍO DE DATOS DESDE FORMULARIOS A SUPABASE
  // ==========================================================================

  // Guardar Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const correo = value("loginCorreo").toLowerCase();
      const clave = value("loginClave");
      const msg = document.getElementById("formMsg");

      try {
        const usuario = await window.FabLabDB.loginUsuario(correo, clave);
        localStorage.setItem(
          "fablab_session",
          JSON.stringify({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo })
        );
        show(msg, "Sesión iniciada correctamente. Redirigiendo...", true);
        setTimeout(function () {
          window.location.href = "index.html";
        }, 700);
      } catch (err) {
        show(msg, "Correo o contraseña incorrectos.", false);
      }
    });
  }

  // Guardar Nuevo Usuario en la tabla 'usuarios'
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const nombre = value("regNombre");
      const correo = value("regCorreo").toLowerCase();
      const clave = value("regClave");
      const msg = document.getElementById("formMsg");

      if (clave.length < 6) {
        show(msg, "La contraseña debe tener al menos 6 caracteres.", false);
        return;
      }

      try {
        const nuevoUsuario = await window.FabLabDB.registrarUsuario(nombre, correo, clave);
        localStorage.setItem(
          "fablab_session",
          JSON.stringify({ id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, correo: nuevoUsuario.correo })
        );
        show(msg, "Cuenta creada y registrada en Supabase. Redirigiendo...", true);
        setTimeout(function () {
          window.location.href = "index.html";
        }, 700);
      } catch (err) {
        show(msg, "El correo ya está registrado o hubo un error al guardar.", false);
      }
    });
  }

  // Guardar Mensaje en la tabla 'contacto_mensajes'
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const nombre = value("nombre");
      const correo = value("correo");
      const mensaje = value("mensaje");
      const msg = document.getElementById("formMsg");

      try {
        await window.FabLabDB.enviarContacto(nombre, correo, mensaje);
        show(msg, "Mensaje guardado con éxito en la base de datos de Supabase.", true);
        contactForm.reset();
      } catch (err) {
        show(msg, "Error al guardar el mensaje en la base de datos.", false);
      }
    });
  }

  // ==========================================================================
  // 6. FUNCIONES AUXILIARES
  // ==========================================================================
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