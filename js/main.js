/* ============================================
   LUXURY BOOKSHOP - MAIN JAVASCRIPT
   Core utilities: theme, scroll, nav, animations
   ============================================ */

'use strict';

// ============================================
// THEME MANAGER
// ============================================
const ThemeManager = (() => {
  const STORAGE_KEY = 'bookshop-theme';
  const THEMES = { LIGHT: 'light', DARK: 'dark' };

  let currentTheme = localStorage.getItem(STORAGE_KEY) || THEMES.LIGHT;

  function apply(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all toggle icons
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      const svg = el.querySelector('use');
      if (svg) {
        svg.setAttribute('href', `assets/icons.svg#${theme === THEMES.DARK ? 'icon-sun' : 'icon-moon'}`);
      }
    });
  }

  function toggle() {
    apply(currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  }

  function init() {
    apply(currentTheme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, apply, current: () => currentTheme };
})();

// ============================================
// RTL MANAGER
// ============================================
const RTLManager = (() => {
  const STORAGE_KEY = 'bookshop-dir';
  let currentDir = localStorage.getItem(STORAGE_KEY) || 'ltr';

  function apply(dir) {
    currentDir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
    localStorage.setItem(STORAGE_KEY, dir);

    document.querySelectorAll('[data-dir-label]').forEach(el => {
      el.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  }

  function toggle() {
    apply(currentDir === 'rtl' ? 'ltr' : 'rtl');
  }

  function init() {
    apply(currentDir);
    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, current: () => currentDir };
})();

// ============================================
// NAVBAR MANAGER
// ============================================
const NavbarManager = (() => {
  let navbar, hamburger, mobileMenu, mobileOverlay, mobileClose;
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      if (navbar.hasAttribute('data-transparent')) {
        navbar.classList.add('transparent');
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  function openMobile() {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.classList.add('active');
  }

  function closeMobile() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.classList.remove('active');
  }

  function setActivePage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === filename || (filename === 'index.html' && href === '/') || href.includes(filename)) {
        link.classList.add('active');
      }
    });
  }

  function init() {
    navbar = document.querySelector('.navbar');
    hamburger = document.querySelector('.hamburger');
    mobileMenu = document.querySelector('.mobile-menu');
    mobileOverlay = document.querySelector('.mobile-menu-overlay');
    mobileClose = document.querySelector('.mobile-menu-close');

    if (!navbar) return;

    // Initial transparent state for hero pages
    if (navbar.hasAttribute('data-transparent')) {
      navbar.classList.add('transparent');
    }

    // Scroll handler
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    }, { passive: true });

    // Mobile menu
    if (hamburger) hamburger.addEventListener('click', openMobile);
    if (mobileClose) mobileClose.addEventListener('click', closeMobile);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobile);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobile();
    });

    setActivePage();
    updateNavbar();
  }

  return { init };
})();

// ============================================
// SCROLL REVEAL
// ============================================
const ScrollReveal = (() => {
  let observer;

  function init() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!elements.length) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optional: unobserve after reveal
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

// ============================================
// READING PROGRESS BAR
// ============================================
const ProgressBar = (() => {
  function init() {
    const bar = document.querySelector('.progress-bar');
    if (!bar) return;

    function update() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? scrolled / total : 0;
      bar.style.transform = `scaleX(${progress})`;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  return { init };
})();

// ============================================
// BACK TO TOP
// ============================================
const BackToTop = (() => {
  function init() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();

// ============================================
// COUNTER ANIMATION
// ============================================
const CounterAnimation = (() => {
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target') || el.textContent);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = parseInt(el.getAttribute('data-duration') || '2000');
    const decimals = (target.toString().split('.')[1] || '').length;

    let startTime = null;

    function update(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = eased * target;

      el.textContent = prefix + current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function init() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();

// ============================================
// HERO SLIDER
// ============================================
const HeroSlider = (() => {
  let slides, dots, currentIndex = 0, timer;

  function goTo(index) {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    currentIndex = (index + slides.length) % slides.length;
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  function startAutoplay(interval = 5000) {
    clearInterval(timer);
    timer = setInterval(next, interval);
  }

  function init() {
    const sliderEl = document.querySelector('.hero-slides');
    if (!sliderEl) return;

    slides = sliderEl.querySelectorAll('.hero-slide');
    dots = document.querySelectorAll('.hero-dot');

    if (!slides.length) return;

    // Dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        startAutoplay();
      });
    });

    // Prev/Next buttons
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });

    // Touch/Swipe
    let touchStartX = 0;
    sliderEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        startAutoplay();
      }
    });

    // Pause on hover
    sliderEl.addEventListener('mouseenter', () => clearInterval(timer));
    sliderEl.addEventListener('mouseleave', () => startAutoplay());

    slides[0].classList.add('active');
    dots[0]?.classList.add('active');
    startAutoplay();
  }

  return { init };
})();

// ============================================
// TESTIMONIALS SLIDER
// ============================================
const TestimonialsSlider = (() => {
  let track, cards, currentIndex = 0;

  function getVisible() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function goTo(index) {
    const visible = getVisible();
    const max = cards.length - visible;
    currentIndex = Math.max(0, Math.min(index, max));
    const wrapperWidth = track.parentElement.clientWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const cardWidth = (wrapperWidth - (visible - 1) * gap) / visible;
    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
  }

  function init() {
    track = document.querySelector('.testimonials-track');
    if (!track) return;

    cards = track.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    window.addEventListener('resize', () => goTo(currentIndex));
  }

  return { init };
})();

// ============================================
// FAQ ACCORDION
// ============================================
const FAQAccordion = (() => {
  function init() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        faqItems.forEach(i => i.classList.remove('open'));

        // Open clicked if was closed
        if (!isOpen) item.classList.add('open');
      });
    });

    // Open first by default
    if (faqItems.length) faqItems[0].classList.add('open');
  }

  return { init };
})();

// ============================================
// BOOK TABS
// ============================================
const BookTabs = (() => {
  function init() {
    const tabsContainer = document.querySelector('.books-tabs');
    if (!tabsContainer) return;

    const tabs = tabsContainer.querySelectorAll('.books-tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Filter books based on tab data
        const filter = tab.getAttribute('data-filter');
        const books = document.querySelectorAll('.book-card[data-category], .blog-post-card[data-category]');

        books.forEach(book => {
          if (filter === 'all' || book.getAttribute('data-category') === filter) {
            book.style.display = '';
            setTimeout(() => { book.style.opacity = '1'; book.style.transform = ''; }, 10);
          } else {
            book.style.opacity = '0';
            book.style.transform = 'scale(0.9)';
            setTimeout(() => { book.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  return { init };
})();

// ============================================
// AUTH
// ============================================
const Auth = (() => {
  const USERS_KEY = 'bookshop-users';
  const SESSION_KEY = 'bookshop-current-user';

  function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }

  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

  function isLoggedIn() { return !!localStorage.getItem(SESSION_KEY); }

  function currentUser() { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }

  function updateNavbar() {
    const user = currentUser();
    document.querySelectorAll('.nav-actions').forEach(actions => {
      let auth = actions.querySelector('.nav-auth');
      if (!auth) {
        const visitUs = actions.querySelector('a[href="contact.html"].btn-primary');
        if (visitUs) {
          auth = document.createElement('div');
          auth.className = 'nav-auth' + (visitUs.classList.contains('desktop-only') ? ' desktop-only' : '');
          auth.style.cssText = 'align-items:center;gap:var(--space-2);margin-left:8px;';
          visitUs.replaceWith(auth);
        }
      }

      if (!auth) return;

      if (user) {
        auth.classList.remove('desktop-only');
        auth.innerHTML = `
          <span style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-primary);font-family:var(--font-accent);white-space:nowrap;">${user.name}</span>
          <button class="btn btn-secondary btn-sm" data-logout style="padding:var(--space-1) var(--space-3);font-size:var(--font-size-xs);">Logout</button>
        `;
        auth.querySelector('[data-logout]').addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      } else {
        auth.innerHTML = `
          <a href="login.html" class="btn btn-primary btn-sm desktop-only" style="padding:var(--space-1) var(--space-3);font-size:var(--font-size-xs);">Login</a>
        `;
      }
    });

    document.querySelectorAll('.mobile-menu-footer').forEach(footer => {
      const existing = footer.querySelector('.mobile-auth-links');
      if (existing) existing.remove();

      const div = document.createElement('div');
      div.className = 'mobile-auth-links';
      div.style.cssText = 'margin-top:var(--space-2);text-align:center;';

      if (isLoggedIn()) {
        div.innerHTML = `<span style="font-size:var(--font-size-xs);color:var(--text-secondary);font-family:var(--font-accent);display:block;margin-bottom:var(--space-2);">Signed in as ${currentUser().name}</span>
          <button class="btn btn-secondary btn-sm" data-mobile-logout style="width:100%;justify-content:center;">Logout</button>`;
        footer.appendChild(div);
        div.querySelector('[data-mobile-logout]').addEventListener('click', (e) => {
          e.preventDefault();
          logout();
          footer.querySelector('.mobile-auth-links')?.remove();
        });
      } else {
        div.innerHTML = `<a href="login.html" class="btn btn-primary btn-sm" style="width:100%;justify-content:center;">Login</a>`;
        footer.appendChild(div);
      }
    });
  }

  function signup(first, last, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { ok: false, error: 'An account with this email already exists' };
    users.push({ first, last, email, password, name: `${first} ${last}` });
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: `${first} ${last}`, email }));
    updateNavbar();
    return { ok: true };
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'Invalid email or password' };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
    updateNavbar();
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    updateNavbar();
    window.location.href = 'index.html';
  }

  function init() {
    if (window.location.pathname.includes('login.html')) {
      const form = document.getElementById('login-form');
      const errorEl = document.getElementById('login-error');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          errorEl.classList.remove('show');
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const result = login(email, password);
          if (result.ok) {
            window.location.href = 'index.html';
          } else {
            errorEl.textContent = result.error;
            errorEl.classList.add('show');
          }
        });
      }
    }

    if (window.location.pathname.includes('signup.html')) {
      const form = document.getElementById('signup-form');
      const errorEl = document.getElementById('signup-error');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          errorEl.classList.remove('show');
          const first = document.getElementById('signup-first').value;
          const last = document.getElementById('signup-last').value;
          const email = document.getElementById('signup-email').value;
          const password = document.getElementById('signup-password').value;
          const confirm = document.getElementById('signup-confirm').value;

          if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.classList.add('show');
            return;
          }

          if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.classList.add('show');
            return;
          }

          const result = signup(first, last, email, password);
          if (result.ok) {
            window.location.href = 'index.html';
          } else {
            errorEl.textContent = result.error;
            errorEl.classList.add('show');
          }
        });
      }
    }

    updateNavbar();
  }

  return { init, isLoggedIn, currentUser, login, signup, logout };
})();

// ============================================
// CART
// ============================================
const Cart = (() => {
  let items = JSON.parse(localStorage.getItem('bookshop-cart') || '[]');
  let overlay, drawer;

  function save() {
    localStorage.setItem('bookshop-cart', JSON.stringify(items));
    updateBadge();
  }

  function add(id, title, price) {
    const existing = items.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      items.push({ id, title, price, qty: 1 });
    }
    save();
    renderItems();
    showToast(`"${title}" added to cart`);
  }

  function updateBadge() {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count ? 'inline-flex' : 'none';
    });
  }

  function open() {
    renderItems();
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderItems() {
    const container = drawer.querySelector('.cart-drawer-body');
    const footer = drawer.querySelector('.cart-drawer-footer');

    if (!items.length) {
      container.innerHTML = '<div class="cart-drawer-empty"><span class="cart-drawer-empty-icon"><svg class="icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></span><p class="cart-drawer-empty-text">Your cart is empty</p></div>';
      footer.innerHTML = '';
      return;
    }

    container.innerHTML = items.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="cart-item-qty-btn" data-cart-dec="${i}">−</button>
          <span class="cart-item-qty-num">${item.qty}</span>
          <button class="cart-item-qty-btn" data-cart-inc="${i}">+</button>
        </div>
        <button class="cart-item-remove" data-cart-remove="${i}" aria-label="Remove"><svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
    `).join('');

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    footer.innerHTML = `
      <div class="cart-total-row">
        <span class="cart-total-label">Total</span>
        <span class="cart-total-value">$${total.toFixed(2)}</span>
      </div>
      <button class="btn btn-primary cart-checkout-btn">Proceed to Checkout</button>
    `;

    container.querySelectorAll('[data-cart-inc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.cartInc);
        items[idx].qty++;
        save();
        renderItems();
      });
    });

    container.querySelectorAll('[data-cart-dec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.cartDec);
        if (items[idx].qty > 1) {
          items[idx].qty--;
        } else {
          items.splice(idx, 1);
        }
        save();
        renderItems();
      });
    });

    container.querySelectorAll('[data-cart-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.cartRemove);
        items.splice(idx, 1);
        save();
        renderItems();
      });
    });

    if (!footer._checkoutDelegated) {
      footer.addEventListener('click', (e) => {
        if (e.target.closest('.cart-checkout-btn')) {
          close();
          showToast('Checkout feature coming soon!');
        }
      });
      footer._checkoutDelegated = true;
    }
  }

  function injectDrawer() {
    if (document.querySelector('.cart-drawer')) return;

    const div = document.createElement('div');
    div.innerHTML = `
      <div class="cart-overlay"></div>
      <div class="cart-drawer">
        <div class="cart-drawer-header">
          <h3 class="cart-drawer-title">Your Cart</h3>
          <button class="cart-drawer-close" aria-label="Close cart"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="cart-drawer-body"></div>
        <div class="cart-drawer-footer"></div>
      </div>
    `;
    document.body.appendChild(div);

    overlay = document.querySelector('.cart-overlay');
    drawer = document.querySelector('.cart-drawer');

    overlay.addEventListener('click', close);
    drawer.querySelector('.cart-drawer-close').addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) close();
    });
  }

  function init() {
    injectDrawer();

    document.querySelectorAll('.add-to-cart-btn, [data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-book-id') || Math.random().toString(36).substr(2);
        const title = btn.getAttribute('data-book-title') || 'Book';
        const price = parseFloat(btn.getAttribute('data-price') || '0');
        add(id, title, price);
      });
    });

    document.querySelectorAll('.nav-action-btn[aria-label="Cart"], .nav-action-btn[aria-label="Shopping cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });
    });

    updateBadge();
  }

  return { init, open, close };
})();

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, duration = 3000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ============================================
// NEWSLETTER
// ============================================
const Newsletter = (() => {
  function init() {
    document.querySelectorAll('.newsletter-form, .footer-newsletter-form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (!input?.value) return;

        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
          const original = btn.textContent;
          btn.textContent = 'Subscribed!';
          btn.disabled = true;
          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
          }, 3000);
        }

        showToast('Thanks for subscribing!');
        input.value = '';
      });
    });
  }

  return { init };
})();

// ============================================
// CONTACT FORM
// ============================================
const ContactForm = (() => {
  function init() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = 'Message Sent!';
      btn.disabled = true;
      btn.classList.add('btn-emerald');

      showToast('Message sent successfully! We\'ll reply within 24 hours');

      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
        btn.classList.remove('btn-emerald');
        form.reset();
      }, 4000);
    });
  }

  return { init };
})();


// ============================================
// STICKY HEADER SHRINK
// ============================================
const StickyHeader = (() => {
  function init() {
    const header = document.querySelector('.page-sticky-header');
    if (!header) return;

    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    header.parentNode.insertBefore(sentinel, header);

    const observer = new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-sticky', !entry.isIntersecting);
    });

    observer.observe(sentinel);
  }

  return { init };
})();

// ============================================
// COUNTDOWN TIMER
// ============================================
const Countdown = (() => {
  function init() {
    const countdowns = document.querySelectorAll('[data-countdown]');
    if (!countdowns.length) return;

    countdowns.forEach(el => {
      const target = new Date(el.getAttribute('data-countdown'));

      function update() {
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
          el.innerHTML = '<span class="countdown-num">00</span><span class="countdown-label">Done</span>';
          return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        const items = el.querySelectorAll('.countdown-num');
        if (items.length >= 4) {
          items[0].textContent = String(days).padStart(2, '0');
          items[1].textContent = String(hours).padStart(2, '0');
          items[2].textContent = String(mins).padStart(2, '0');
          items[3].textContent = String(secs).padStart(2, '0');
        }
      }

      update();
      setInterval(update, 1000);
    });
  }

  return { init };
})();

// ============================================
// IMAGE LAZY LOADING
// ============================================
const LazyLoad = (() => {
  function init() {
    if (!('IntersectionObserver' in window)) return;

    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    images.forEach(img => observer.observe(img));
  }

  return { init };
})();

// ============================================
// TABS COMPONENT (Generic)
// ============================================
const Tabs = (() => {
  function init() {
    document.querySelectorAll('[data-tabs]').forEach(container => {
      const tabs = container.querySelectorAll('[data-tab]');
      const panels = container.querySelectorAll('[data-panel]');

      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          panels[i]?.classList.add('active');
        });
      });

      tabs[0]?.classList.add('active');
      panels[0]?.classList.add('active');
    });
  }

  return { init };
})();

// ============================================
// SEARCH OVERLAY
// ============================================
const SearchOverlay = (() => {
  let overlay, input, isOpen = false;

  function open() {
    if (!overlay) return;
    overlay.classList.add('active');
    input?.focus();
    isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('active');
    isOpen = false;
    document.body.style.overflow = '';
  }

  function init() {
    overlay = document.querySelector('.search-overlay');
    input = overlay?.querySelector('.search-overlay-input');

    document.querySelectorAll('[data-search-toggle]').forEach(btn => {
      btn.addEventListener('click', () => isOpen ? close() : open());
    });

    document.querySelector('.search-overlay-close')?.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? close() : open();
      }
    });

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  return { init };
})();

// ============================================
// HORIZONTAL SCROLL (New Arrivals)
// ============================================
const HorizontalScroll = (() => {
  function init() {
    document.querySelectorAll('.books-horizontal-scroll').forEach(container => {
      let isDown = false, startX, scrollLeft;

      container.addEventListener('mousedown', e => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });

      container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = '';
      });

      container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = '';
      });

      container.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
      });
    });
  }

  return { init };
})();

// ============================================
// INITIALIZE ALL MODULES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  RTLManager.init();
  NavbarManager.init();
  ScrollReveal.init();
  ProgressBar.init();
  BackToTop.init();
  CounterAnimation.init();
  HeroSlider.init();
  TestimonialsSlider.init();
  FAQAccordion.init();
  BookTabs.init();
  Auth.init();
  Cart.init();
  Newsletter.init();
  ContactForm.init();
  StickyHeader.init();
  Countdown.init();
  LazyLoad.init();
  Tabs.init();
  SearchOverlay.init();
  HorizontalScroll.init();

  console.log('%cFolio & Ink Bookshop — Loaded', 'color:#C9A84C;font-size:14px;font-weight:bold;');
});
