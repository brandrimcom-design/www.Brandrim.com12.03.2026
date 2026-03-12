const cart = [];

const body = document.body;
const cartIcon = document.getElementById("cartIcon");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const notification = document.getElementById("cartNotification");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const statNumbers = document.querySelectorAll(".stat-number");
const testimonialCards = document.querySelectorAll(".testimonial-card");
const testimonialDots = document.querySelectorAll(".dot");
const addToCartButtons = document.querySelectorAll(".add-to-cart");
const countdownElements = document.querySelectorAll(".countdown");

let testimonialIntervalId = null;

function parsePrice(priceText) {
  const numeric = Number.parseInt(priceText, 10);
  return Number.isNaN(numeric) ? 0 : numeric;
}

function formatPrice(value) {
  return `${value} MAD`;
}

function showNotification(message) {
  if (!notification) {
    return;
  }

  notification.textContent = message;
  notification.classList.add("show");

  window.clearTimeout(showNotification.timer);
  showNotification.timer = window.setTimeout(() => {
    notification.classList.remove("show");
  }, 2200);
}

function setPageScrollLocked(isLocked) {
  if (!body) {
    return;
  }

  body.style.overflow = isLocked ? "hidden" : "";
}

function isCartOpen() {
  return Boolean(cartPanel && cartPanel.classList.contains("open"));
}

function isMenuOpen() {
  return Boolean(navLinks && navLinks.classList.contains("open"));
}

function syncPageState() {
  setPageScrollLocked(isCartOpen());
}

function openCart() {
  if (!cartPanel || !cartOverlay) {
    return;
  }

  cartPanel.classList.add("open");
  cartOverlay.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  syncPageState();
}

function closeCartPanel() {
  if (!cartPanel || !cartOverlay) {
    return;
  }

  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  syncPageState();
}

function renderCart() {
  if (!cartCount || !cartItems || !cartTotal) {
    return;
  }

  cartCount.textContent = String(cart.length);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
    cartTotal.textContent = "الإجمالي: 0 MAD";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <span>${item.price}</span>
          </div>
          <button class="remove-item" type="button" data-index="${index}">حذف</button>
        </div>
      `
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + parsePrice(item.price), 0);
  cartTotal.textContent = `الإجمالي: ${formatPrice(total)}`;
}

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
  showNotification(`تمت إضافة ${name} إلى السلة`);
}

function buildWhatsAppMessage() {
  const lines = [
    "السلام عليكم، أريد طلب الخدمات التالية من Brandrim:",
    "",
    ...cart.map((item, index) => `${index + 1}. ${item.name} - ${item.price}`),
    "",
    cartTotal ? cartTotal.textContent : ""
  ];

  return encodeURIComponent(lines.join("\n"));
}

function setMenuOpen(isOpen) {
  if (!navLinks || !menuToggle) {
    return;
  }

  navLinks.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

function updateCountdowns() {
  if (countdownElements.length === 0) {
    return;
  }

  const now = Date.now();

  countdownElements.forEach((element) => {
    const target = new Date(element.dataset.target).getTime();

    if (Number.isNaN(target)) {
      element.textContent = "تاريخ العرض غير متوفر";
      return;
    }

    const difference = target - now;

    if (difference <= 0) {
      element.textContent = "انتهى العرض الخاص";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);

    element.textContent = `ينتهي خلال ${days} يوم ${hours} ساعة ${minutes} دقيقة`;
  });
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll(
    ".hero-copy, .hero-visual, .service-card, .feature-cards article, .gallery figure, .testimonial-cards article, .info-card, .contact-card, .site-footer"
  );

  if (revealElements.length === 0) {
    return;
  }

  revealElements.forEach((element) => {
    element.classList.add("reveal");
  });

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18
    }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
    observer.observe(element);
  });
}

function animateCounter(element) {
  const target = Number(element.dataset.target);
  if (Number.isNaN(target)) {
    return;
  }

  const suffix = target === 100 ? "%" : target === 24 ? "/7" : "+";
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = `${value}${progress === 1 ? suffix : ""}`;

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    }
  }

  window.requestAnimationFrame(frame);
}

function setupCounters() {
  if (statNumbers.length === 0) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    statNumbers.forEach((element) => animateCounter(element));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((element) => observer.observe(element));
}

function activateTestimonial(index) {
  testimonialCards.forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === index);
  });

  testimonialDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
    dot.setAttribute("aria-pressed", String(dotIndex === index));
  });
}

function setupTestimonials() {
  if (testimonialCards.length === 0 || testimonialDots.length !== testimonialCards.length) {
    return;
  }

  let currentIndex = 0;
  activateTestimonial(currentIndex);

  function startAutoplay() {
    if (testimonialIntervalId) {
      return;
    }

    testimonialIntervalId = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonialCards.length;
      activateTestimonial(currentIndex);
    }, 3200);
  }

  function stopAutoplay() {
    if (!testimonialIntervalId) {
      return;
    }

    window.clearInterval(testimonialIntervalId);
    testimonialIntervalId = null;
  }

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentIndex = index;
      activateTestimonial(currentIndex);
    });
  });

  testimonialCards.forEach((card) => {
    card.addEventListener("mouseenter", stopAutoplay);
    card.addEventListener("mouseleave", startAutoplay);
    card.addEventListener("focusin", stopAutoplay);
    card.addEventListener("focusout", startAutoplay);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  });

  startAutoplay();
}

addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.package || "Service", button.dataset.price || "0 MAD");
    openCart();
  });
});

if (cartItems) {
  cartItems.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("remove-item")) {
      return;
    }

    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }

    const [removedItem] = cart.splice(index, 1);
    renderCart();

    if (removedItem) {
      showNotification(`تم حذف ${removedItem.name} من السلة`);
    }
  });
}

if (cartIcon) {
  cartIcon.addEventListener("click", openCart);
}

if (closeCart) {
  closeCart.addEventListener("click", closeCartPanel);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCartPanel);
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showNotification("أضف خدمة واحدة على الأقل قبل إتمام الطلب");
      return;
    }

    const message = buildWhatsAppMessage();
    window.open(`https://wa.me/212698490007?text=${message}`, "_blank", "noopener,noreferrer");
  });
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    setMenuOpen(!isMenuOpen());
  });
}

document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    setMenuOpen(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCartPanel();
    setMenuOpen(false);
  }
});

renderCart();
updateCountdowns();
setupRevealAnimations();
setupCounters();
setupTestimonials();
window.setInterval(updateCountdowns, 60000);
