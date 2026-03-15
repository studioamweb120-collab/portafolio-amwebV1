/**
 * STUDIO A & M WEB — main.js
 * Handles: Theme Toggle, Navigation, Scroll Animations,
 * Circuit Canvas, Binary Rain, Portfolio Filters,
 * Counter Animations, Contact Form, Modals
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════
   THEME TOGGLE (Day / Night)
═══════════════════════════════════════════════════════════════════════ */
const ThemeManager = (() => {
  const html        = document.documentElement;
  const toggleBtn   = document.getElementById('theme-toggle');
  const themeLabel  = document.getElementById('theme-label');
  const STORAGE_KEY = 'sam-theme';

  const apply = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    themeLabel.textContent = theme === 'dark' ? 'Day' : 'Night';
    // Redraw circuit canvas on theme change
    if (typeof CircuitCanvas !== 'undefined') CircuitCanvas.redraw();
  };

  const init = () => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    apply(saved);
    toggleBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      apply(current === 'dark' ? 'light' : 'dark');
    });
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════════════
   CIRCUIT CANVAS BACKGROUND
═══════════════════════════════════════════════════════════════════════ */
const CircuitCanvas = (() => {
  const canvas = document.getElementById('circuit-canvas');
  const ctx    = canvas.getContext('2d');
  let nodes    = [];
  let raf;

  const COLORS = {
    dark:  { node: '#00D4FF', line: '#17E5C8', text: '#00D4FF' },
    light: { node: '#0A1628', line: '#1a3060', text: '#0A1628' },
  };

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = document.body.scrollHeight;
    generateNodes();
  };

  const generateNodes = () => {
    nodes = [];
    const count = Math.floor((canvas.width * canvas.height) / 90000);
    for (let i = 0; i < Math.min(count, 80); i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 4 + 2,
        connections: [],
      });
    }
    // Build connections (nearby nodes)
    nodes.forEach((n, i) => {
      nodes.forEach((m, j) => {
        if (i !== j) {
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < 200) n.connections.push(j);
        }
      });
    });
  };

  const draw = () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const col   = COLORS[theme];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    nodes.forEach((n) => {
      n.connections.forEach((ci) => {
        const m = nodes[ci];
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        ctx.beginPath();
        ctx.strokeStyle = col.line;
        ctx.globalAlpha = Math.max(0, 1 - dist / 200) * 0.6;
        ctx.lineWidth = 0.5;
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      });
    });

    // Draw nodes
    nodes.forEach((n) => {
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = col.node;
      ctx.fill();

      // Binary text near nodes
      if (Math.random() < 0.01) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = col.text;
        ctx.font = '8px JetBrains Mono, monospace';
        const bits = Array.from({ length: 6 }, () => Math.round(Math.random())).join('');
        ctx.fillText(bits, n.x + n.r + 4, n.y + 4);
      }
    });

    ctx.globalAlpha = 1;
  };

  const redraw = () => {
    cancelAnimationFrame(raf);
    draw();
  };

  const init = () => {
    resize();
    draw();
    window.addEventListener('resize', () => { resize(); draw(); });
  };

  return { init, redraw };
})();


/* ═══════════════════════════════════════════════════════════════════════
   BINARY RAIN (Hero)
═══════════════════════════════════════════════════════════════════════ */
const BinaryRain = (() => {
  const container = document.getElementById('binary-rain');

  const init = () => {
    if (!container) return;
    const cols = Math.floor(window.innerWidth / 28);
    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div');
      col.classList.add('binary-column');
      col.style.left = `${i * 28}px`;
      col.style.animationDuration = `${Math.random() * 8 + 6}s`;
      col.style.animationDelay    = `${Math.random() * -12}s`;

      let bits = '';
      for (let r = 0; r < 40; r++) {
        bits += (Math.round(Math.random()) + '\n');
      }
      col.textContent = bits;
      container.appendChild(col);
    }
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════════════
   NAVIGATION — Scroll Active + Header Scroll State + Mobile Menu
═══════════════════════════════════════════════════════════════════════ */
const Navigation = (() => {
  const header    = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('main-nav');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');

  const onScroll = () => {
    // Header style
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active nav link
    let current = '';
    sections.forEach((s) => {
      const top = s.offsetTop - 100;
      if (window.scrollY >= top) current = s.getAttribute('id');
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };

  const init = () => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile hamburger
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      nav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    // Close menu on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════════════════════ */
const ScrollReveal = (() => {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  const init = () => {
    elements.forEach((el) => observer.observe(el));
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════════════
   COUNTER ANIMATION (Hero Stats)
═══════════════════════════════════════════════════════════════════════ */
const CounterAnimation = (() => {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const animateCounter = (el) => {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const step     = target / (duration / 16);
    let current    = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current < target) requestAnimationFrame(tick);
    };

    tick();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const init = () => {
    counters.forEach((c) => observer.observe(c));
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════════════
   PORTFOLIO FILTERS
═══════════════════════════════════════════════════════════════════════ */
const PortfolioFilter = (() => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');

  const filter = (category) => {
    cards.forEach((card) => {
      const match = category === 'all' || card.dataset.category === category;
      card.style.display = match ? '' : 'none';

      if (match) {
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = 'fadeIn 0.4s ease';
      }
    });
  };

  const init = () => {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        filter(btn.dataset.filter);
      });
    });
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════════════
   PROJECT MODALS
   Real projects open via external links on their cards.
   This modal system is kept for future case-study cards.
═══════════════════════════════════════════════════════════════════════ */
const modalData = {};

const openModal = (key) => {
  const data   = modalData[key];
  if (!data) return;
  const modal  = document.getElementById('project-modal');
  const body   = document.getElementById('modal-body');

  body.innerHTML = `
    <div style="margin-bottom:8px">
      <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--cyan-400)">${data.category}</span>
    </div>
    <h2 style="font-size:1.7rem;margin-bottom:16px;">${data.title}</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px;">
      <div style="padding:12px 16px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md)">
        <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:3px">CLIENTE</div>
        <div style="font-size:0.85rem;font-weight:600">${data.client}</div>
      </div>
      <div style="padding:12px 16px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md)">
        <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:3px">DURACIÓN</div>
        <div style="font-size:0.85rem;font-weight:600">${data.duration}</div>
      </div>
      <div style="padding:12px 16px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-md)">
        <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:3px">AÑO</div>
        <div style="font-size:0.85rem;font-weight:600">${data.year}</div>
      </div>
    </div>
    <h4 style="font-size:0.9rem;color:var(--cyan-400);font-family:var(--font-mono);margin-bottom:8px">// PROBLEMA</h4>
    <p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.8;margin-bottom:20px">${data.problem}</p>
    <h4 style="font-size:0.9rem;color:var(--cyan-400);font-family:var(--font-mono);margin-bottom:8px">// SOLUCIÓN TÉCNICA</h4>
    <p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.8;margin-bottom:20px">${data.solution}</p>
    <h4 style="font-size:0.9rem;color:var(--cyan-400);font-family:var(--font-mono);margin-bottom:8px">// RESULTADOS</h4>
    <ul style="margin-bottom:24px;display:flex;flex-direction:column;gap:8px">
      ${data.results.map(r => `
        <li style="display:flex;align-items:flex-start;gap:8px;font-size:0.88rem;color:var(--text-secondary)">
          <i class="fa-solid fa-circle-check" style="color:var(--teal-400);margin-top:3px;flex-shrink:0"></i>
          <span>${r}</span>
        </li>`).join('')}
    </ul>
    <h4 style="font-size:0.9rem;color:var(--cyan-400);font-family:var(--font-mono);margin-bottom:10px">// STACK TECNOLÓGICO</h4>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">
      ${data.stack.map(t => `<span style="padding:5px 12px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:20px;font-size:0.78rem;font-family:var(--font-mono);color:var(--teal-400)">${t}</span>`).join('')}
    </div>
    <a href="#contact" class="btn btn-primary" onclick="closeModal()" style="text-decoration:none">
      <i class="fa-solid fa-paper-plane"></i> Hablar sobre un Proyecto Similar
    </a>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  const modal = document.getElementById('project-modal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
};

window.openModal = openModal;
window.closeModal = closeModal;

// Modal close events
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('project-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});


/* ═══════════════════════════════════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════════════════════════════════ */
const BackToTop = (() => {
  const btn = document.getElementById('back-to-top');

  const init = () => {
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════════════
   FOOTER YEAR
═══════════════════════════════════════════════════════════════════════ */
document.getElementById('footer-year').textContent = new Date().getFullYear();


/* ═══════════════════════════════════════════════════════════════════════
   SMOOTH NAV LINKS
═══════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ═══════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  CircuitCanvas.init();
  BinaryRain.init();
  Navigation.init();
  ScrollReveal.init();
  CounterAnimation.init();
  PortfolioFilter.init();
  BackToTop.init();

  console.log('%c Studio A & M Web — Frontend Loaded ✓', 'color:#00D4FF;font-family:monospace;font-size:14px;font-weight:bold;');
});
