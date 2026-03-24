/**
 * Your AI Mini-Map — Interactive Lead Magnet
 *
 * Modules:
 *   1. Flow controller — screen transitions, progress, back button
 *   2. Data loader — fetches industries.json
 *   3. Rating handler — captures time + repetitiveness per process
 *   4. Scoring engine — computes impact/effort coordinates
 *   5. Shareable state — URL hash encoding/decoding for bookmarks + sharing
 *   6. Chart renderer — Chart.js scatter with quadrants
 *   7. Segmentation engine — HOT/WARM/SOLOPRENEUR/COMMUNITY + sector demo CTA
 *   8. Email handler — POSTs to AIOS server API
 */

(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // Config
  // -----------------------------------------------------------------------

  const API_BASE = 'https://api.primemeridianai.com'; // Production
  // const API_BASE = 'http://localhost:8000'; // Development

  const INDUSTRY_ICONS = {
    accountancy: '\u{1F4CA}', // bar chart
    law: '\u{2696}',          // scales
    recruitment: '\u{1F465}', // people
    marketing: '\u{1F3A8}',  // palette
  };

  // Sector demo links — keyed by Mini-Map industry ID
  const SECTOR_DEMO_LINKS = {
    accountancy: { name: 'Hadley Marshall LLP (Accountancy)', url: 'https://blueprint-advisor.lovable.app/' },
    law:         { name: 'Whitfield Carr Solicitors (Law)', url: 'https://roadmap-whisperer-44.lovable.app/' },
    recruitment: { name: 'Kinsley Archer Recruitment', url: 'https://ai-compass-guide-98.lovable.app/' },
    marketing:   { name: 'Ember & Oak (Marketing & Creative)', url: 'https://strategy-compass-82.lovable.app/' },
  };

  const QUADRANT_COLORS = {
    'Quick wins':         { bg: 'rgba(74, 222, 128, 0.8)',  border: '#4ADE80' },
    'Strategic projects': { bg: 'rgba(96, 165, 250, 0.8)',  border: '#60A5FA' },
    'Nice to have':       { bg: 'rgba(138, 135, 128, 0.6)', border: '#8A8780' },
    'Avoid':              { bg: 'rgba(248, 113, 113, 0.6)', border: '#F87171' },
  };

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------

  let industries = [];
  let selectedIndustry = null;
  let aboutAnswers = { role: null, team_size: null, ai_stage: null };
  let processRatings = {}; // { processId: { time: 1-3, repetitiveness: 1-3 } }
  let chartInstance = null;
  let scoredProcesses = [];
  const screenHistory = ['screen-welcome'];

  // -----------------------------------------------------------------------
  // 1. Flow Controller
  // -----------------------------------------------------------------------

  const screens = {
    'screen-welcome': 0,
    'screen-industry': 25,
    'screen-about': 50,
    'screen-rate': 75,
    'screen-results': 100,
  };

  function showScreen(id) {
    document.querySelectorAll('.minimap__screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Update progress
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = (screens[id] || 0) + '%';
  }

  function goBack() {
    if (screenHistory.length > 1) {
      screenHistory.pop();
      showScreen(screenHistory[screenHistory.length - 1]);
    }
  }

  function navigateTo(id) {
    screenHistory.push(id);
    showScreen(id);
  }

  // Back buttons
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', goBack);
  });

  // Generic next buttons
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-next');
      if (next) navigateTo(next);
    });
  });

  // -----------------------------------------------------------------------
  // 2. Data Loader
  // -----------------------------------------------------------------------

  async function loadIndustries() {
    try {
      const res = await fetch('/data/industries.json');
      const data = await res.json();
      industries = data.industries || [];
      renderIndustryGrid();
    } catch (err) {
      console.error('Failed to load industries:', err);
    }
    return industries;
  }

  function renderIndustryGrid() {
    const grid = document.getElementById('industry-grid');
    if (!grid) return;
    grid.innerHTML = industries.map(ind => `
      <button class="minimap__industry-btn" data-industry="${ind.id}">
        <span class="minimap__industry-icon">${INDUSTRY_ICONS[ind.id] || '\u{1F4BC}'}</span>
        <span>${ind.name}</span>
      </button>
    `).join('');

    // Click handlers
    grid.querySelectorAll('.minimap__industry-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-industry');
        selectedIndustry = industries.find(i => i.id === id);
        // Visual selection
        grid.querySelectorAll('.minimap__industry-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        // Short delay then navigate
        setTimeout(() => navigateTo('screen-about'), 300);
      });
    });
  }

  // -----------------------------------------------------------------------
  // 3. About You Handler
  // -----------------------------------------------------------------------

  document.querySelectorAll('.minimap__options').forEach(group => {
    group.addEventListener('click', (e) => {
      const option = e.target.closest('.minimap__option');
      if (!option) return;

      const field = group.getAttribute('data-field');
      const value = option.getAttribute('data-value');

      // Select within group
      group.querySelectorAll('.minimap__option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      aboutAnswers[field] = value;

      // Enable continue button when all answered
      const allAnswered = aboutAnswers.role && aboutAnswers.team_size && aboutAnswers.ai_stage;
      const btnContinue = document.getElementById('btn-to-rate');
      if (btnContinue) btnContinue.disabled = !allAnswered;
    });
  });

  // When navigating to rate screen, populate processes
  const btnToRate = document.getElementById('btn-to-rate');
  if (btnToRate) {
    btnToRate.addEventListener('click', () => {
      if (!selectedIndustry) return;
      renderProcesses();
      navigateTo('screen-rate');
    });
  }

  // -----------------------------------------------------------------------
  // 4. Rating Handler
  // -----------------------------------------------------------------------

  function renderProcesses() {
    const list = document.getElementById('process-list');
    if (!list || !selectedIndustry) return;

    processRatings = {};
    const processes = selectedIndustry.processes;

    list.innerHTML = processes.map(proc => `
      <div class="minimap__process" data-process-id="${proc.id}">
        <div class="minimap__process-name">${proc.name}</div>
        <div class="minimap__process-desc">${proc.description}</div>
        <div class="minimap__ratings">
          <div class="minimap__rating-group">
            <label>Time consumed</label>
            <div class="minimap__rating-buttons" data-rating="time" data-process="${proc.id}">
              <button class="minimap__rating-btn" data-value="1">Low</button>
              <button class="minimap__rating-btn" data-value="2">Medium</button>
              <button class="minimap__rating-btn" data-value="3">High</button>
            </div>
          </div>
          <div class="minimap__rating-group">
            <label>Repetitiveness</label>
            <div class="minimap__rating-buttons" data-rating="repetitiveness" data-process="${proc.id}">
              <button class="minimap__rating-btn" data-value="1">Low</button>
              <button class="minimap__rating-btn" data-value="2">Medium</button>
              <button class="minimap__rating-btn" data-value="3">High</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Update count
    updateRatedCount();

    // Click handlers
    list.querySelectorAll('.minimap__rating-buttons').forEach(group => {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.minimap__rating-btn');
        if (!btn) return;

        const processId = group.getAttribute('data-process');
        const ratingType = group.getAttribute('data-rating');
        const value = parseInt(btn.getAttribute('data-value'));

        // Select within group
        group.querySelectorAll('.minimap__rating-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Store
        if (!processRatings[processId]) processRatings[processId] = {};
        processRatings[processId][ratingType] = value;

        // Mark card as rated when both ratings are in
        const r = processRatings[processId];
        const card = list.querySelector(`[data-process-id="${processId}"]`);
        if (r.time && r.repetitiveness && card) {
          card.classList.add('rated');
        }

        updateRatedCount();
      });
    });
  }

  function updateRatedCount() {
    const total = selectedIndustry ? selectedIndustry.processes.length : 0;
    const rated = Object.values(processRatings).filter(r => r.time && r.repetitiveness).length;
    const countEl = document.getElementById('rated-count');
    if (countEl) countEl.textContent = `${rated} of ${total} rated`;

    const btnMap = document.getElementById('btn-see-map');
    if (btnMap) btnMap.disabled = rated < total;
  }

  // See Map button
  const btnSeeMap = document.getElementById('btn-see-map');
  if (btnSeeMap) {
    btnSeeMap.addEventListener('click', () => {
      scoredProcesses = computeScores();
      renderResults();
      navigateTo('screen-results');
    });
  }

  // -----------------------------------------------------------------------
  // 5. Scoring Engine
  // -----------------------------------------------------------------------

  const EFFORT_MAP = { low: 1, medium: 2, high: 3 };

  function computeScores() {
    if (!selectedIndustry) return [];

    return selectedIndustry.processes.map(proc => {
      const r = processRatings[proc.id] || { time: 1, repetitiveness: 1 };
      const defaultEffort = EFFORT_MAP[proc.defaultEffort] || 2;

      // Impact = (time * 1.5) + (repetitiveness * 1.0), max = (3*1.5)+(3*1.0) = 5.5
      const rawImpact = (r.time * 1.5) + (r.repetitiveness * 1.0);
      const impact = (rawImpact / 5.5) * 100;

      // Effort inverted: low effort (1) → high x (easy), high effort (3) → low x (hard)
      const effort = ((4 - defaultEffort) / 3) * 100;

      // Dot size based on time
      const size = 6 + (r.time * 6); // 12, 18, 24

      // Quadrant
      let quadrant;
      if (impact >= 50 && effort >= 50) quadrant = 'Quick wins';
      else if (impact >= 50 && effort < 50) quadrant = 'Strategic projects';
      else if (impact < 50 && effort >= 50) quadrant = 'Nice to have';
      else quadrant = 'Avoid';

      return {
        id: proc.id,
        name: proc.name,
        description: proc.description,
        explanation: proc.explanation,
        defaultEffort: proc.defaultEffort,
        impact: Math.round(impact),
        effort: Math.round(effort),
        size,
        quadrant,
        time: r.time,
        repetitiveness: r.repetitiveness,
      };
    });
  }

  // -----------------------------------------------------------------------
  // 6. Shareable State (URL hash encoding)
  // -----------------------------------------------------------------------

  function encodeState() {
    const state = {
      i: selectedIndustry ? selectedIndustry.id : null,
      r: aboutAnswers.role,
      t: aboutAnswers.team_size,
      a: aboutAnswers.ai_stage,
      p: processRatings,
    };
    try {
      return btoa(JSON.stringify(state));
    } catch { return null; }
  }

  function decodeState(hash) {
    try {
      return JSON.parse(atob(hash));
    } catch { return null; }
  }

  function saveStateToUrl() {
    const encoded = encodeState();
    if (encoded) {
      history.replaceState(null, '', '#' + encoded);
    }
  }

  function restoreFromUrl() {
    const hash = window.location.hash.slice(1);
    if (!hash) return false;
    const state = decodeState(hash);
    if (!state || !state.i || !state.p) return false;

    // Restore industry
    selectedIndustry = industries.find(ind => ind.id === state.i);
    if (!selectedIndustry) return false;

    // Restore answers and ratings
    aboutAnswers = { role: state.r, team_size: state.t, ai_stage: state.a };
    processRatings = state.p;

    // Compute and render
    scoredProcesses = computeScores();
    renderResults();
    showScreen('screen-results');
    screenHistory.push('screen-results');
    return true;
  }

  // -----------------------------------------------------------------------
  // 7. Chart Renderer
  // -----------------------------------------------------------------------

  function renderResults() {
    // Headline
    const quickWins = scoredProcesses.filter(p => p.quadrant === 'Quick wins');
    const headline = document.getElementById('results-headline');
    const subtitle = document.getElementById('results-subtitle');
    if (headline) {
      headline.textContent = `We found ${scoredProcesses.length} opportunities. ${quickWins.length} are quick wins.`;
    }
    if (subtitle) {
      subtitle.textContent = quickWins.length > 0
        ? 'The green dots in the top-right are where to start. Click any dot for details.'
        : 'Click any dot to see what AI could change for that process.';
    }

    renderChart();
    renderSegmentCTA();
    renderSectorDemo();
    renderActionButtons();
    saveStateToUrl();
  }

  function renderChart() {
    const canvas = document.getElementById('minimap-chart');
    if (!canvas) return;

    // Destroy previous chart
    if (chartInstance) {
      chartInstance.destroy();
    }

    const data = scoredProcesses.map(p => ({
      x: p.effort,
      y: p.impact,
      r: p.size,
      label: p.name,
      processData: p,
    }));

    const datasets = [];
    const quadrants = ['Quick wins', 'Strategic projects', 'Nice to have', 'Avoid'];

    quadrants.forEach(q => {
      const points = data.filter(d => d.processData.quadrant === q);
      if (points.length > 0) {
        datasets.push({
          label: q,
          data: points,
          backgroundColor: QUADRANT_COLORS[q].bg,
          borderColor: QUADRANT_COLORS[q].border,
          borderWidth: 2,
          hoverBackgroundColor: QUADRANT_COLORS[q].border,
          hoverBorderWidth: 3,
          clip: false,
        });
      }
    });

    chartInstance = new Chart(canvas, {
      type: 'bubble',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        layout: {
          padding: 40,
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Ease of Implementation \u2192',
              color: '#8A8780',
              font: { family: "'DM Sans', sans-serif", size: 13 },
            },
            grid: {
              color: 'rgba(30, 42, 66, 0.5)',
              drawTicks: false,
            },
            ticks: { display: false },
            border: { color: 'rgba(30, 42, 66, 0.5)' },
          },
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: '\u2191 Business Impact',
              color: '#8A8780',
              font: { family: "'DM Sans', sans-serif", size: 13 },
            },
            grid: {
              color: 'rgba(30, 42, 66, 0.5)',
              drawTicks: false,
            },
            ticks: { display: false },
            border: { color: 'rgba(30, 42, 66, 0.5)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#131B2E',
            borderColor: '#D4A853',
            borderWidth: 1,
            titleFont: { family: "'Fraunces', serif", weight: 600, size: 14 },
            bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
            titleColor: '#E8DCC8',
            bodyColor: '#C8C5BE',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items) => items[0]?.raw?.label || '',
              label: (item) => {
                const p = item.raw.processData;
                return `${p.quadrant} \u2022 Impact: ${p.impact} \u2022 Ease: ${p.effort}`;
              },
            },
          },
        },
        onClick: (_event, elements) => {
          if (elements.length > 0) {
            const el = elements[0];
            const point = chartInstance.data.datasets[el.datasetIndex].data[el.index];
            showProcessDetail(point.processData);
          }
        },
        onHover: (event, elements) => {
          event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        },
      },
    });

    // Draw quadrant backgrounds
    const quadrantPlugin = {
      id: 'quadrantBackground',
      beforeDraw: (chart) => {
        const { ctx, chartArea: { left, top, right, bottom } } = chart;
        const midX = (left + right) / 2;
        const midY = (top + bottom) / 2;

        // Top-right: Quick wins (green tint)
        ctx.fillStyle = 'rgba(74, 222, 128, 0.03)';
        ctx.fillRect(midX, top, right - midX, midY - top);
        // Top-left: Strategic (blue tint)
        ctx.fillStyle = 'rgba(96, 165, 250, 0.03)';
        ctx.fillRect(left, top, midX - left, midY - top);
        // Bottom-right: Nice to have (no tint)
        // Bottom-left: Avoid (red tint)
        ctx.fillStyle = 'rgba(248, 113, 113, 0.03)';
        ctx.fillRect(left, midY, midX - left, bottom - midY);

        // Crosshair lines
        ctx.strokeStyle = 'rgba(30, 42, 66, 0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(midX, top);
        ctx.lineTo(midX, bottom);
        ctx.moveTo(left, midY);
        ctx.lineTo(right, midY);
        ctx.stroke();
        ctx.setLineDash([]);
      },
    };

    Chart.register(quadrantPlugin);
    chartInstance.update();
  }

  function showProcessDetail(proc) {
    const panel = document.getElementById('process-detail');
    if (!panel) return;

    document.getElementById('detail-name').textContent = proc.name;
    document.getElementById('detail-explanation').textContent = proc.explanation;

    const quadrantTag = document.getElementById('detail-quadrant');
    const effortTag = document.getElementById('detail-effort');

    const colorMap = {
      'Quick wins': 'minimap__tag--green',
      'Strategic projects': 'minimap__tag--blue',
      'Nice to have': 'minimap__tag--grey',
      'Avoid': 'minimap__tag--red',
    };

    quadrantTag.textContent = proc.quadrant;
    quadrantTag.className = `minimap__tag ${colorMap[proc.quadrant] || ''}`;
    effortTag.textContent = `Effort: ${proc.defaultEffort}`;
    effortTag.className = 'minimap__tag minimap__tag--grey';

    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // -----------------------------------------------------------------------
  // 8. Segmentation Engine
  // -----------------------------------------------------------------------

  function getSegment() {
    const isOwner = aboutAnswers.role === 'Owner/MD/Partner';
    const isTargetSize = ['10-30', '31-75', '76-150'].includes(aboutAnswers.team_size);
    const isSolo = aboutAnswers.team_size === '1-9';

    if (isOwner && isTargetSize) return 'HOT';
    if (isOwner && !isTargetSize && !isSolo) return 'WARM';
    if (isSolo) return 'SOLOPRENEUR';
    return 'COMMUNITY';
  }

  function renderSegmentCTA() {
    const segment = getSegment();
    const container = document.getElementById('segment-cta');
    if (!container) return;

    const ctas = {
      HOT: `
        <h3>You're exactly who we built this for</h3>
        <p>Owner-led, right-sized team, professional services. We help businesses like yours turn these opportunities into action with a full AI Audit tailored to your team.</p>
        <a href="/book.html" class="btn btn--primary btn--large" style="margin-top: var(--space-sm)">Book a free discovery call</a>
        <p style="font-size: var(--text-sm);">30 minutes. No obligation. We'll talk about what you just saw on your map.</p>`,
      WARM: `
        <h3>Want to go deeper?</h3>
        <p>Your map shows where the opportunities are. Our YouTube channel breaks down exactly how businesses like yours are acting on them. Real examples, no fluff.</p>
        <a href="https://youtube.com/@KrisFarebrother" target="_blank" class="btn btn--primary btn--large" style="margin-top: var(--space-sm)">Watch on YouTube</a>`,
      SOLOPRENEUR: `
        <h3>Flying solo? These tools can help now.</h3>
        <p>As a small team, you don't need a full audit. You need the right tools. Our YouTube channel covers the best AI tools for solo and micro businesses.</p>
        <a href="https://youtube.com/@KrisFarebrother" target="_blank" class="btn btn--primary btn--large" style="margin-top: var(--space-sm)">Watch on YouTube</a>`,
      COMMUNITY: `
        <h3>Know someone who should see this?</h3>
        <p>Use the <strong>Share</strong> button above to send these exact results to the person in your business thinking about AI. They'll see the same map you're looking at now.</p>`,
    };

    container.innerHTML = ctas[segment] || ctas.COMMUNITY;
  }

  function renderSectorDemo() {
    const container = document.getElementById('sector-demo-cta');
    if (!container || !selectedIndustry) return;

    const demo = SECTOR_DEMO_LINKS[selectedIndustry.id];
    if (!demo) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = `
      <p style="font-size: var(--text-sm); margin-bottom: var(--space-xs) !important;">Want to see a full AI Audit? Explore an interactive demo for a fictional ${selectedIndustry.name.toLowerCase()} firm:</p>
      <a href="${demo.url}" target="_blank" class="btn btn--outline" style="font-size: var(--text-sm);">Explore the ${selectedIndustry.name} demo</a>`;
    container.style.display = 'block';
  }

  function renderActionButtons() {
    const saveBtn = document.getElementById('btn-save-link');
    const shareBtn = document.getElementById('btn-share-link');
    const confirm = document.getElementById('action-confirm');

    function showConfirm(msg) {
      if (!confirm) return;
      confirm.textContent = msg;
      confirm.style.display = 'block';
      setTimeout(() => { confirm.style.display = 'none'; }, 4000);
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showConfirm('Link copied! Paste it somewhere safe to come back to these results any time.');
        });
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showConfirm('Link copied! Send it to a colleague and they\'ll see your exact results.');
        });
      });
    }
  }

  // -----------------------------------------------------------------------
  // 9. Email Handler
  // -----------------------------------------------------------------------

  const btnSaveResults = document.getElementById('btn-save-results');
  if (btnSaveResults) {
    btnSaveResults.addEventListener('click', async () => {
      const emailInput = document.getElementById('results-email');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !email.includes('@')) {
        emailInput.style.borderColor = 'var(--color-error)';
        return;
      }

      btnSaveResults.disabled = true;
      btnSaveResults.textContent = 'Sending...';

      const segment = getSegment();
      const topOpps = scoredProcesses
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          impact: p.impact,
          effort: p.effort,
          quadrant: p.quadrant,
        }));

      try {
        const res = await fetch(`${API_BASE}/api/mini-map/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            segment,
            industry: selectedIndustry.id,
            role: aboutAnswers.role,
            team_size: aboutAnswers.team_size,
            ai_stage: aboutAnswers.ai_stage,
            top_opportunities: topOpps,
          }),
        });

        if (res.ok) {
          document.getElementById('email-thanks').style.display = 'block';
          document.querySelector('.minimap__email-form').style.display = 'none';
          document.querySelector('.minimap__email-note').style.display = 'none';
        } else {
          btnSaveResults.textContent = 'Something went wrong — try again';
          btnSaveResults.disabled = false;
        }
      } catch {
        // If API is down, still show a graceful message
        btnSaveResults.textContent = 'Could not connect — try again later';
        btnSaveResults.disabled = false;
      }
    });
  }

  // -----------------------------------------------------------------------
  // 10. Restart
  // -----------------------------------------------------------------------

  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      // Reset state
      selectedIndustry = null;
      aboutAnswers = { role: null, team_size: null, ai_stage: null };
      processRatings = {};
      scoredProcesses = [];
      screenHistory.length = 0;
      screenHistory.push('screen-welcome');

      // Clear URL hash
      history.replaceState(null, '', window.location.pathname);

      // Reset UI
      document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      const btnContinue = document.getElementById('btn-to-rate');
      if (btnContinue) btnContinue.disabled = true;
      document.getElementById('process-detail').style.display = 'none';

      showScreen('screen-welcome');
    });
  }

  // -----------------------------------------------------------------------
  // Notify (industry not listed)
  // -----------------------------------------------------------------------

  const notifyBtn = document.getElementById('notify-btn');
  if (notifyBtn) {
    notifyBtn.addEventListener('click', () => {
      const email = document.getElementById('notify-email').value.trim();
      if (!email || !email.includes('@')) return;
      // For now, just show thanks (no API call — can add later)
      document.getElementById('notify-thanks').style.display = 'block';
      document.querySelector('.minimap__notify-form').style.display = 'none';
    });
  }

  // -----------------------------------------------------------------------
  // Init
  // -----------------------------------------------------------------------

  async function init() {
    await loadIndustries();
    // If URL has encoded state, restore directly to results
    if (window.location.hash.length > 1) {
      restoreFromUrl();
    }
  }

  init();

})();
