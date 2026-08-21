(function () {
  'use strict';

  const SUPABASE_URL = 'https://dtjnhgcgevlppwkjhqys.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_KIOBeiAOOiSLS0vxFJTADg_sowEHvSW';

  async function getInspirations(category) {
    let url = SUPABASE_URL + '/rest/v1/inspirations?select=id,title,space,style,location,description,image_url,created_at&order=created_at.desc';
    if (category) url += '&space=eq.' + encodeURIComponent(category);
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY
      }
    });
    if (!response.ok) throw new Error('Unable to load inspirations (' + response.status + ')');
    return response.json();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  function escapeAttr(value) { return escapeHtml(value); }

  function renderEmpty(grid, category) {
    grid.innerHTML = '<div id="kv-live-empty" style="grid-column:1/-1;padding:70px 24px;text-align:center;border:1px solid rgba(201,169,110,.18);border-radius:4px;color:rgba(245,239,230,.55)">' +
      '<h3 style="font-family:Georgia,serif;font-size:30px;color:#F5EFE6;font-weight:400;margin:0 0 10px">The collection is beginning.</h3>' +
      '<p>No published ' + escapeHtml(category || '') + ' inspirations yet.</p></div>';
  }

  async function loadMoodboardFromSupabase(category) {
    const grid = document.getElementById('mb-grid');
    if (!grid) return;

    const title = document.getElementById('mb-title-text');
    if (title && category) title.textContent = category + ' Designs';

    grid.innerHTML = '<div style="grid-column:1/-1;padding:50px;text-align:center;color:rgba(245,239,230,.55)">Loading inspirations…</div>';

    try {
      const items = await getInspirations(category);
      grid.innerHTML = '';

      if (!items.length) {
        renderEmpty(grid, category);
        return;
      }

      items.forEach(function (item) {
        const card = document.createElement('div');
        card.className = 'mb-item';
        card.innerHTML = '<img src="' + escapeAttr(item.image_url) + '" alt="' + escapeAttr(item.title) + '" class="mb-item-img" loading="lazy">' +
          '<div class="mb-item-title">' + escapeHtml(item.title) + '</div>' +
          '<div style="margin-top:8px;font-size:11px;letter-spacing:1px;color:rgba(245,239,230,.45);text-transform:uppercase">' +
          escapeHtml(item.space || '') + (item.style ? ' · ' + escapeHtml(item.style) : '') + '</div>';
        card.addEventListener('click', function () { openSupabaseInspiration(item); });
        grid.appendChild(card);
      });
    } catch (error) {
      console.error('Kasa Vaas moodboard:', error);
      grid.innerHTML = '<div id="kv-live-empty" style="grid-column:1/-1;padding:70px 24px;text-align:center;color:#c9a96e">Unable to load your published collection. Please refresh the page.</div>';
    }
  }

  function openSupabaseInspiration(item) {
    const modal = document.getElementById('inspiration-modal');
    if (!modal) return;

    const hero = modal.querySelector('.insp-hero');
    const title = modal.querySelector('.insp-title');
    const desc = modal.querySelector('.insp-desc');
    const materials = modal.querySelector('#insp-materials');
    const palette = modal.querySelector('#insp-palette');
    const similar = modal.querySelector('#insp-similar');

    if (hero) { hero.src = item.image_url; hero.alt = item.title || ''; }
    if (title) title.textContent = item.title || '';
    if (desc) desc.textContent = item.description || '';
    if (materials) materials.innerHTML = item.style ? '<span class="insp-material-tag">' + escapeHtml(item.style) + '</span>' : '';
    if (palette) palette.innerHTML = item.location ? '<div class="insp-color"><div class="insp-color-name">' + escapeHtml(item.location) + '</div></div>' : '';
    if (similar) similar.innerHTML = '';

    modal.classList.remove('hidden');
    setTimeout(function () { modal.classList.add('show'); }, 10);
    if (!document.getElementById('auth-overlay')?.classList.contains('show')) document.body.style.overflow = 'hidden';
    modal.querySelector('.insp-modal-content')?.scrollTo(0, 0);
  }

  /* IMPORTANT: replace the old hard-coded MOCK_INSPIRATIONS functions from index.html. */
  window.loadMoodboard = loadMoodboardFromSupabase;
  window.openInspiration = function (id) {
    // The public moodboard is now database-only. Cards use openSupabaseInspiration directly.
  };

  function init() {
    const style = document.createElement('style');
    style.textContent = '#kv-live-empty h3{font-family:Georgia,serif;font-size:30px;color:#F5EFE6;font-weight:400;margin:0 0 10px}.kv-live-meta{margin-top:8px;font-size:11px;letter-spacing:1px;color:rgba(245,239,230,.45);text-transform:uppercase}';
    document.head.appendChild(style);

    const observer = new MutationObserver(function () {
      const view = document.getElementById('view-moodboard');
      if (view && view.classList.contains('active')) {
        const category = (document.getElementById('mb-title-text')?.textContent || '').replace(/\s+Designs\s*$/, '').trim();
        if (category && view.dataset.kvLoadedCategory !== category) {
          view.dataset.kvLoadedCategory = category;
          loadMoodboardFromSupabase(category);
        }
      }
    });
    observer.observe(document.body, { attributes:true, subtree:true, attributeFilter:['class'] });

    const view = document.getElementById('view-moodboard');
    if (view && view.classList.contains('active')) {
      const category = (document.getElementById('mb-title-text')?.textContent || '').replace(/\s+Designs\s*$/, '').trim();
      if (category) loadMoodboardFromSupabase(category);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
