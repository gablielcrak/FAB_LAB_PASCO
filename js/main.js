/* ==========================================================================
   CONFIGURACIÓN DE SUPABASE (Reemplaza con las credenciales de tu proyecto)
   ========================================================================== */
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY";

const supabaseClient =
  window.supabase && SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("TU-PROYECTO")
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const WHATSAPP_NUMBER = "51938500836";

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initThemeToggle();
  initSessionUI();
  initCart();
  initStoreFilters();
  initPasswordToggles();
  initRegisterForm();
  initLoginForm();
  initContactForm();
  initAdminPanel();
});

/* ==========================================================================
   1. MENÚ RESPONSIVO MÓVIL (☰)
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const siteHeader = document.querySelector(".site-header");

  if (!menuToggle || !siteHeader) return;

  menuToggle.addEventListener("click", () => {
    siteHeader.classList.toggle("open");
  });

  siteHeader.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
      siteHeader.classList.remove("open");
    });
  });
}

/* ==========================================================================
   2. CAMBIO DE TEMA (MODO OSCURO / MODO CLARO)
   ========================================================================== */
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("fablab_theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeToggle) themeToggle.textContent = "☀️";
  }

  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("fablab_theme", isLight ? "light" : "dark");
    themeToggle.textContent = isLight ? "☀️" : "🌙";
  });
}

/* ==========================================================================
   3. GESTIÓN DE SESIÓN DE USUARIO EN EL HEADER
   ========================================================================== */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("fablab_user"));
  } catch {
    return null;
  }
}

function initSessionUI() {
  const user = getCurrentUser();
  const adminNavLink = document.getElementById("adminNavLink");
  const authContainer = document.querySelector(".auth");

  if (user && user.es_admin && adminNavLink) {
    adminNavLink.style.display = "inline-block";
  }

  if (user && authContainer) {
    const loginLink = authContainer.querySelector('a[href="login.html"]');
    const registerLink = authContainer.querySelector('a[href="registro.html"]');

    if (loginLink) loginLink.remove();
    if (registerLink) registerLink.remove();

    const userChip = document.createElement("span");
    userChip.className = "user-chip";
    userChip.textContent = `Hola, ${user.nombre.split(" ")[0]}`;

    const logoutBtn = document.createElement("button");
    logoutBtn.type = "button";
    logoutBtn.className = "btn btn-ghost";
    logoutBtn.textContent = "Salir";
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("fablab_user");
      window.location.href = "index.html";
    });

    authContainer.appendChild(userChip);
    authContainer.appendChild(logoutBtn);
  }
}

/* ==========================================================================
   4. CARRITO DE COMPRAS LATERAL (DRAWER) Y PEDIDO POR WHATSAPP
   ========================================================================== */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("fablab_cart")) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("fablab_cart", JSON.stringify(cart));
  renderCart();
}

function initCart() {
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const openDrawer = () => {
    if (cartDrawer) cartDrawer.classList.add("active");
    if (cartOverlay) cartOverlay.classList.add("active");
  };

  const closeDrawer = () => {
    if (cartDrawer) cartDrawer.classList.remove("active");
    if (cartOverlay) cartOverlay.classList.remove("active");
  };

  if (openCartBtn) openCartBtn.addEventListener("click", openDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeDrawer);
  if (cartOverlay) cartOverlay.addEventListener("click", closeDrawer);

  // Botones "+ Agregar" en compras.html
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const title = btn.dataset.title || btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const img = btn.dataset.img || "assets/logo.svg";

      const cart = getCart();
      const existing = cart.find((item) => item.id === id);

      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, title, price, img, qty: 1 });
      }

      saveCart(cart);
      openDrawer();
    });
  });

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      saveCart([]);
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }

      let total = 0;
      let message = "Hola *Fab Lab Pasco*, quisiera realizar el siguiente pedido:%0A%0A";

      cart.forEach((item) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `• ${item.qty}x ${item.title} — S/ ${subtotal.toFixed(2)}%0A`;
      });

      message += `%0A*Total estimado:* S/ ${total.toFixed(2)}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    });
  }

  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  const cart = getCart();

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (countEl) countEl.textContent = totalItems;
  if (totalEl) totalEl.textContent = `S/ ${totalAmount.toFixed(2)}`;
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
    return;
  }

  container.innerHTML = cart
    .map(
      (item, index) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.title}">
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <span class="price">S/ ${(item.price * item.qty).toFixed(2)}</span>
          <div class="cart-item-qty">
            <button class="qty-btn" type="button" data-action="dec" data-index="${index}">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" type="button" data-action="inc" data-index="${index}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" type="button" data-action="rem" data-index="${index}" title="Eliminar">&times;</button>
      </div>
    `
    )
    .join("");

  container.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      const action = btn.dataset.action;
      const updatedCart = getCart();

      if (action === "inc") updatedCart[idx].qty += 1;
      if (action === "dec") {
        updatedCart[idx].qty -= 1;
        if (updatedCart[idx].qty <= 0) updatedCart.splice(idx, 1);
      }
      if (action === "rem") updatedCart.splice(idx, 1);

      saveCart(updatedCart);
    });
  });
}

/* ==========================================================================
   5. FILTROS DE CATÁLOGO EN TIENDA (COMPRAS.HTML)
   ========================================================================== */
function initStoreFilters() {
  const filterBtns = document.querySelectorAll(".filter-tabs .filter-btn");
  const productCards = document.querySelectorAll("#productsGrid .product-card");

  if (filterBtns.length === 0 || productCards.length === 0) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.filter;
      productCards.forEach((card) => {
        if (category === "all" || card.dataset.category === category) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* ==========================================================================
   6. MOSTRAR / OCULTAR CONTRASEÑA (LOGIN Y REGISTRO)
   ========================================================================== */
function initPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".password-wrap");
      const input = wrap ? wrap.querySelector("input") : null;
      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.style.opacity = isPassword ? "1" : "0.7";
    });
  });
}

/* ==========================================================================
   7. REGISTRO DE USUARIOS (SUPABASE: TABLA "usuarios")
   ========================================================================== */
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const msgEl = document.getElementById("formMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("regNombre").value.trim();
    const correo = document.getElementById("regCorreo").value.trim().toLowerCase();
    const clave = document.getElementById("regClave").value.trim();

    if (!supabaseClient) {
      showMsg(msgEl, "Configura SUPABASE_URL y SUPABASE_ANON_KEY en js/main.js", "err");
      return;
    }

    showMsg(msgEl, "Registrando cuenta...", "");

    const { data: existing } = await supabaseClient
      .from("usuarios")
      .select("id")
      .eq("correo", correo)
      .maybeSingle();

    if (existing) {
      showMsg(msgEl, "Este correo ya se encuentra registrado.", "err");
      return;
    }

    const { error } = await supabaseClient.from("usuarios").insert([
      { nombre, correo, clave, es_admin: false }
    ]);

    if (error) {
      showMsg(msgEl, "Error al registrar: " + error.message, "err");
      return;
    }

    showMsg(msgEl, "Cuenta creada correctamente. Redirigiendo...", "ok");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}

/* ==========================================================================
   8. INICIO DE SESIÓN (SUPABASE: TABLA "usuarios")
   ========================================================================== */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const msgEl = document.getElementById("formMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("loginCorreo").value.trim().toLowerCase();
    const clave = document.getElementById("loginClave").value.trim();

    if (!supabaseClient) {
      showMsg(msgEl, "Configura SUPABASE_URL y SUPABASE_ANON_KEY en js/main.js", "err");
      return;
    }

    showMsg(msgEl, "Verificando credenciales...", "");

    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("id, nombre, correo, es_admin")
      .eq("correo", correo)
      .eq("clave", clave)
      .maybeSingle();

    if (error) {
      showMsg(msgEl, "Error de conexión: " + error.message, "err");
      return;
    }

    if (!data) {
      showMsg(msgEl, "Correo o contraseña incorrectos.", "err");
      return;
    }

    localStorage.setItem("fablab_user", JSON.stringify(data));
    showMsg(msgEl, `Bienvenido, ${data.nombre}. Redirigiendo...`, "ok");

    setTimeout(() => {
      window.location.href = data.es_admin ? "admin.html" : "index.html";
    }, 900);
  });
}

/* ==========================================================================
   9. FORMULARIO DE CONTACTO (SUPABASE: TABLA "contacto_mensajes")
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const msgEl = document.getElementById("formMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();

    if (!supabaseClient) {
      showMsg(msgEl, "Configura SUPABASE_URL y SUPABASE_ANON_KEY en js/main.js", "err");
      return;
    }

    showMsg(msgEl, "Enviando mensaje...", "");

    const { error } = await supabaseClient
      .from("contacto_mensajes")
      .insert([{ nombre, correo, mensaje }]);

    if (error) {
      showMsg(msgEl, "No se pudo enviar el mensaje: " + error.message, "err");
      return;
    }

    showMsg(msgEl, "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.", "ok");
    form.reset();
  });
}

/* ==========================================================================
   10. PANEL DE ADMINISTRACIÓN (ADMIN.HTML - TABLA "usuarios")
   ========================================================================== */
function initAdminPanel() {
  const tableBody = document.getElementById("usuariosTableBody");
  if (!tableBody) return;

  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.es_admin) {
    tableBody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; color:#ff8b8b;">Acceso denegado. Inicia sesión como administrador.</td></tr>';
    return;
  }

  const editCard = document.getElementById("editUserCard");
  const editForm = document.getElementById("editUserForm");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const editFormMsg = document.getElementById("editFormMsg");

  async function loadUsuarios() {
    if (!supabaseClient) {
      tableBody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Configura tus credenciales de Supabase en js/main.js</td></tr>';
      return;
    }

    const { data, error } = await supabaseClient
      .from("usuarios")
      .select("id, nombre, correo, es_admin")
      .order("id", { ascending: true });

    if (error) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ff8b8b;">Error: ${error.message}</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay usuarios registrados.</td></tr>';
      return;
    }

    tableBody.innerHTML = data
      .map(
        (u) => `
        <tr>
          <td>${u.id}</td>
          <td>${u.nombre}</td>
          <td>${u.correo}</td>
          <td>
            <span class="badge-role ${u.es_admin ? "admin" : "user"}">
              ${u.es_admin ? "Admin" : "Usuario"}
            </span>
          </td>
          <td style="display:flex; gap:8px;">
            <button class="btn btn-ghost btn-sm edit-user-btn" type="button"
              data-id="${u.id}"
              data-nombre="${u.nombre}"
              data-correo="${u.correo}"
              data-admin="${u.es_admin}">
              Editar
            </button>
            <button class="btn btn-ghost btn-sm delete-user-btn" type="button"
              style="border-color:#ff6b6b; color:#ff6b6b;"
              data-id="${u.id}">
              Eliminar
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    // Eventos de edición
    tableBody.querySelectorAll(".edit-user-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("editUserId").value = btn.dataset.id;
        document.getElementById("editNombre").value = btn.dataset.nombre;
        document.getElementById("editCorreo").value = btn.dataset.correo;
        document.getElementById("editClave").value = "";
        document.getElementById("editEsAdmin").checked = btn.dataset.admin === "true";
        editFormMsg.textContent = "";
        editCard.style.display = "block";
        editCard.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Eventos de eliminación
    tableBody.querySelectorAll(".delete-user-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (String(id) === String(currentUser.id)) {
          alert("No puedes eliminar tu propio usuario administrador activo.");
          return;
        }
        if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

        const { error: delError } = await supabaseClient.from("usuarios").delete().eq("id", id);
        if (delError) {
          alert("Error al eliminar: " + delError.message);
        } else {
          loadUsuarios();
        }
      });
    });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      editCard.style.display = "none";
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editUserId").value;
      const nombre = document.getElementById("editNombre").value.trim();
      const correo = document.getElementById("editCorreo").value.trim().toLowerCase();
      const nuevaClave = document.getElementById("editClave").value.trim();
      const es_admin = document.getElementById("editEsAdmin").checked;

      const updates = { nombre, correo, es_admin };
      if (nuevaClave) updates.clave = nuevaClave;

      const { error } = await supabaseClient.from("usuarios").update(updates).eq("id", id);

      if (error) {
        showMsg(editFormMsg, "Error al actualizar: " + error.message, "err");
        return;
      }

      showMsg(editFormMsg, "Usuario actualizado correctamente.", "ok");
      setTimeout(() => {
        editCard.style.display = "none";
        loadUsuarios();
      }, 800);
    });
  }

  loadUsuarios();
}

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = "msg" + (type ? " " + type : "");
}