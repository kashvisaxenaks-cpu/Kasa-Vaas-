/* Kasa Vaas: first-step auth gate for Explore by Space.
   This is a front-end gate only. Real account authentication can be connected later. */
(function () {
  'use strict';

  const CATEGORIES = ['Residential', 'Hospitality', 'Commercial', 'Speciality'];
  let selectedCategory = '';

  function addStyles() {
    if (document.getElementById('kv-space-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'kv-space-auth-styles';
    style.textContent = `
      #kv-space-auth-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: none; align-items: flex-start; justify-content: center;
        padding: 24px; background: rgba(8,7,6,.78); backdrop-filter: blur(12px);
        overflow-y: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box;
      }
      #kv-space-auth-overlay.kv-open { display: flex; }
      .kv-space-auth-card {
        width: min(460px, 100%); position: relative; margin: auto 0;
        padding: 42px 38px 36px; max-height: calc(100vh - 48px);
        overflow-y: auto; overflow-x: hidden; box-sizing: border-box;
        background: #171512; border: 1px solid rgba(201,169,110,.28);
        box-shadow: 0 30px 90px rgba(0,0,0,.55); color: #F5EFE6;
        text-align: center; border-radius: 4px; overscroll-behavior: contain;
      }
      .kv-space-auth-card::-webkit-scrollbar { width: 5px; }
      .kv-space-auth-card::-webkit-scrollbar-thumb { background: rgba(201,169,110,.45); border-radius: 5px; }
      .kv-space-auth-close {
        position: absolute; top: 14px; right: 16px; width: 34px; height: 34px;
        border: 1px solid rgba(245,239,230,.18); background: transparent;
        color: #F5EFE6; cursor: pointer; border-radius: 50%; font-size: 20px;
        line-height: 1; z-index: 2;
      }
      .kv-space-auth-kicker { color:#C9A96E; font-size:10px; letter-spacing:3px; text-transform:uppercase; margin-bottom:12px; }
      .kv-space-auth-title { font-family:'DM Serif Display', Georgia, serif; font-size:38px; line-height:1.05; margin:0 0 12px; font-weight:400; }
      .kv-space-auth-copy { color:rgba(245,239,230,.66); font-size:13px; line-height:1.7; margin:0 auto 26px; max-width:350px; }
      .kv-space-auth-category { color:#E2C99A; }
      .kv-space-auth-actions { display:grid; gap:10px; }
      .kv-space-auth-btn {
        width:100%; padding:14px 18px; border-radius:2px; cursor:pointer;
        font:600 11px Inter, sans-serif; letter-spacing:2px; text-transform:uppercase;
      }
      .kv-space-auth-primary { background:#C9A96E; color:#0E0D0B; border:1px solid #C9A96E; }
      .kv-space-auth-secondary { background:transparent; color:#E2C99A; border:1px solid rgba(201,169,110,.55); }
      .kv-space-auth-note { margin-top:18px; color:rgba(245,239,230,.35); font-size:10px; line-height:1.6; }
      @media (max-width:520px) {
        #kv-space-auth-overlay { padding:12px; }
        .kv-space-auth-card { padding:38px 24px 28px; max-height:calc(100vh - 24px); }
        .kv-space-auth-title { font-size:32px; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildModal() {
    if (document.getElementById('kv-space-auth-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'kv-space-auth-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="kv-space-auth-card">
        <button class="kv-space-auth-close" type="button" aria-label="Close">×</button>
        <div class="kv-space-auth-kicker">Kasa Vaas</div>
        <h2 class="kv-space-auth-title">Continue your discovery</h2>
        <p class="kv-space-auth-copy">Sign in or create an account to explore <span class="kv-space-auth-category"></span> spaces.</p>
        <div class="kv-space-auth-actions">
          <button class="kv-space-auth-btn kv-space-auth-primary" type="button" data-auth-action="signin">Sign In</button>
          <button class="kv-space-auth-btn kv-space-auth-secondary" type="button" data-auth-action="signup">Create Account</button>
        </div>
        <div class="kv-space-auth-note">Your selected space will be ready for you after authentication.</div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.kv-space-auth-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeModal();
    });
    overlay.querySelectorAll('[data-auth-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        sessionStorage.setItem('kasaVaasPendingSpace', selectedCategory);
        const action = button.dataset.authAction;
        alert(action === 'signin'
          ? 'Sign-in is the next step. Your selected space is: ' + selectedCategory
          : 'Account creation is the next step. Your selected space is: ' + selectedCategory);
      });
    });
  }

  function openModal(category) {
    selectedCategory = category;
    sessionStorage.setItem('kasaVaasPendingSpace', category);
    const overlay = document.getElementById('kv-space-auth-overlay');
    overlay.querySelector('.kv-space-auth-category').textContent = category;
    overlay.classList.add('kv-open');
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;
    overlay.querySelector('.kv-space-auth-close').focus();
  }

  function closeModal() {
    const overlay = document.getElementById('kv-space-auth-overlay');
    if (!overlay) return;
    overlay.classList.remove('kv-open');
    document.body.style.overflow = '';
  }

  function findClickable(element) {
    return element.closest('a, button, [role="button"], .card, .space-card, .category-card') || element;
  }

  function wireCategory(category) {
    const matches = Array.from(document.querySelectorAll('body *')).filter(function (el) {
      return el.children.length === 0 && el.textContent.trim().toLowerCase() === category.toLowerCase();
    });

    matches.forEach(function (textNode) {
      const target = findClickable(textNode);
      if (target.dataset.kvSpaceAuthWired === '1') return;
      target.dataset.kvSpaceAuthWired = '1';
      target.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openModal(category);
      }, true);
    });
  }

  function init() {
    addStyles();
    buildModal();
    CATEGORIES.forEach(wireCategory);

    const observer = new MutationObserver(function () {
      CATEGORIES.forEach(wireCategory);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
