(function () {
  'use strict';

  const SUPABASE_URL = 'https://dtjnhgcgevlppwkjhqys.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_KIOBeiAOOiSLS0vxFJTADg_sowEHvSW';

  const css = `
    #kv-live-empty { padding: 70px 24px; text-align:center; border:1px solid rgba(201,169,110,.18); border-radius:4px; color:rgba(245,239,230,.55); }
    #kv-live-empty h3 { font-family:'Cormorant Garamond',serif; font-size:30px; color:#F5EFE6; font-weight:400; margin:0 0 10px; }
    #kv-live-grid .mb-item { cursor:pointer; }
    #kv-live-grid .mb-item-img { display:block; }
    .kv-live-meta { margin-top:8px; font-size:11px; letter-spacing:1px; color:rgba(245,239,230,.45); text-transform:uppercase; }
  `;

  function addCss() {
    if (document.getElementById('kv-live-css')) return;
    const s = document.createElement('style'); s.id='kv-live-css'; s.textContent=css; document.head.appendChild(s);
  }

  async function loadMoodboard() {
    const original = document.getElementById('mb-grid');
    if (!original) return;
    if (original.dataset.kvLiveLoaded === '1') return;

    original.dataset.kvLiveLoaded = '1';
    original.id = 'kv-live-grid';
    original.innerHTML = '<div style="grid-column:1/-1;padding:50px;text-align:center;color:rgba(245,239,230,.55)">Loading inspirations…</div>';

    try {
      const response = await fetch(SUPABASE_URL + '/rest/v1/inspirations?select=id,title,space,style,location,description,image_url,created_at&order=created_at.desc', {
        headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
      });
      if (!response.ok) throw new Error('Unable to load inspirations (' + response.status + ')');
      const items = await response.json();
      original.innerHTML = '';

      if (!items.length) {
        original.innerHTML = '<div id="kv-live-empty" style="grid-column:1/-1"><h3>The collection is beginning.</h3><p>New spaces will appear here soon.</p></div>';
        return;
      }

      items.forEach(function (item) {
        const card = document.createElement('article');
        card.className = 'mb-item';
        card.innerHTML = `
          <img class="mb-item-img" src="${escapeAttr(item.image_url)}" alt="${escapeAttr(item.title)}" loading="lazy">
          <div class="mb-item-title">${escapeHtml(item.title)}</div>
          <div class="kv-live-meta">${escapeHtml(item.space || '')}${item.style ? ' · ' + escapeHtml(item.style) : ''}</div>`;
        card.addEventListener('click', function () { openDetails(item); });
        original.appendChild(card);
      });
    } catch (error) {
      console.error('Kasa Vaas moodboard:', error);
      original.innerHTML = '<div id="kv-live-empty" style="grid-column:1/-1"><h3>Unable to load the collection.</h3><p>Please try refreshing the page.</p></div>';
    }
  }

  function openDetails(item) {
    const modal = document.getElementById('inspiration-modal');
    if (!modal) return;
    const hero = modal.querySelector('.insp-hero');
    const title = modal.querySelector('.insp-title');
    const desc = modal.querySelector('.insp-desc');
    if (hero) { hero.src = item.image_url; hero.alt = item.title || ''; }
    if (title) title.textContent = item.title || '';
    if (desc) desc.textContent = item.description || '';
    modal.classList.add('show');
  }

  function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function escapeAttr(value) { return escapeHtml(value); }

  function init() {
    addCss();
    const observer = new MutationObserver(function () {
      const view = document.getElementById('view-moodboard');
      if (view && view.classList.contains('active')) loadMoodboard();
    });
    observer.observe(document.body, { attributes:true, subtree:true, attributeFilter:['class'] });

    const view = document.getElementById('view-moodboard');
    if (view && view.classList.contains('active')) loadMoodboard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
