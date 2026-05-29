require(['jquery'], function($) {
$(function() {

/* ════════════════════════════════════════════════════════════════════
   CSS — injected into <head> by init() so we don't depend on <html>
   panels (broken in Splunk 9.4.4 with dashboard_html_wrap_embed=true)
════════════════════════════════════════════════════════════════════ */

var CSS = `
/* ─── Splunk chrome overrides ─── */
.dashboard-body            { background: #171d21 !important; }
.dashboard-row             { padding: 0 !important; margin: 0 !important; }
.dashboard-cell            { padding: 0 !important; }
.panel-head, .panel-footer { display: none !important; }
.dashboard-panel           { background: transparent !important; border: none !important;
                             box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
.panel-body.html           { padding: 0 !important; overflow: visible !important; }
.fieldset                  { display: none !important; }

/* ─── design tokens ─── */
:root {
  --bg:             #171d21;
  --surface:        #1e2730;
  --surface-raised: #253039;
  --border:         #2d3a47;
  --text-primary:   #c3cbd4;
  --text-secondary: #7b8fa3;
  --text-heading:   #e8edf0;
  --accent:         #009cde;
  --green:          #53a051;
  --yellow:         #f8be34;
  --red:            #dc4e41;
  --silent:         #555f6c;
}

*, *::before, *::after { box-sizing: border-box; }

#de-root { background: var(--bg); color: var(--text-primary); font: 13px/1.5 'Helvetica Neue', Arial, sans-serif; min-height: 100vh; }

#tab-nav { position: sticky; top: 0; z-index: 200; background: #0f1519; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 2px; }
#tab-nav .app-name { font-size: 14px; font-weight: 600; color: var(--accent); padding-right: 24px; border-right: 1px solid var(--border); margin-right: 8px; white-space: nowrap; line-height: 44px; }
.tab-btn { background: none; border: none; color: var(--text-secondary); padding: 0 16px; height: 44px; font-size: 13px; cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent; }
.tab-btn:hover  { color: var(--text-primary); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

.filter-bar { position: sticky; top: 44px; z-index: 100; background: var(--surface); border-bottom: 1px solid var(--border); padding: 12px 24px; }
.filter-bar-inner { display: flex; align-items: flex-end; column-gap: 20px; row-gap: 8px; max-width: 1400px; margin: 0 auto; flex-wrap: wrap; }
.filter-bar-title { font-size: 16px; font-weight: 600; color: var(--text-heading); white-space: nowrap; padding-bottom: 6px; }
.filter-group { display: flex; flex-direction: column; row-gap: 4px; }
.filter-group label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); }
.filter-group select { background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); padding: 6px 30px 6px 10px; border-radius: 4px; font-size: 13px; min-width: 180px; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%237b8fa3' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
.toggle-group { display: flex; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
.toggle-group .toggle { background: var(--bg); border: none; color: var(--text-secondary); padding: 6px 14px; font-size: 13px; cursor: pointer; font-family: inherit; }
.toggle-group .toggle + .toggle { border-left: 1px solid var(--border); }
.toggle-group .toggle.active { background: var(--accent); color: #fff; }
.filter-spacer { flex: 1; min-width: 20px; }
.filter-status { font-size: 11px; color: var(--text-secondary); padding-bottom: 6px; }

.main-content { max-width: 1400px; margin: 0 auto; padding: 24px; }

.kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.kpi-tile  { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 18px 20px; }
.kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 8px; }
.kpi-value { font-size: 28px; font-weight: 600; color: var(--text-heading); line-height: 1.2; margin-bottom: 6px; }
.kpi-value.green  { color: var(--green); }
.kpi-value.yellow { color: var(--yellow); }
.kpi-value.red    { color: var(--red); }
.kpi-delta { font-size: 11px; color: var(--text-secondary); }

/* ─── Heatmap ─── */
.heatmap-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 20px; margin-bottom: 20px; }
.heatmap-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
.heatmap-title  { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); }
.heatmap-sub    { font-size: 11px; color: var(--text-secondary); }
.heatmap-grid   { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 4px; }
.heatmap-cell   { aspect-ratio: 2 / 1; border-radius: 3px; padding: 5px 6px; cursor: pointer; font-size: 10px; color: rgba(255,255,255,0.92); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 1px solid transparent; line-height: 1.25; }
.heatmap-cell:hover { border-color: rgba(255,255,255,0.5); }
.heatmap-cell .cell-host { font-weight: 600; }
.heatmap-cell .cell-sub  { font-size: 9px; opacity: 0.8; }
.cell-ok      { background: rgba(83,160,81,0.55);  border-color: rgba(83,160,81,0.8); }
.cell-warn    { background: rgba(248,190,52,0.55); border-color: rgba(248,190,52,0.85); color: #1a1a1a; }
.cell-crit    { background: rgba(220,78,65,0.7);   border-color: rgba(220,78,65,0.9); }
.cell-silent  { background: rgba(85,95,108,0.55);  border-color: rgba(85,95,108,0.9); color: var(--text-secondary); }
.heatmap-legend { display: flex; gap: 14px; margin-top: 14px; font-size: 11px; color: var(--text-secondary); }
.heatmap-legend .lg-sw { display: inline-block; width: 12px; height: 12px; border-radius: 2px; margin-right: 5px; vertical-align: middle; }

/* ─── Cards & tables ─── */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 20px; }
.card + .card { margin-top: 20px; }
.card-header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.card-header h2 { font-size: 14px; font-weight: 600; color: var(--text-heading); margin: 0; }
.card-header .count { font-weight: 400; color: var(--text-secondary); font-size: 12px; }
.empty-state { padding: 30px; text-align: center; color: var(--text-secondary); font-size: 12px; }
.loading     { padding: 30px; text-align: center; color: var(--text-secondary); font-size: 12px; }

.de-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.de-table th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); white-space: nowrap; cursor: pointer; }
.de-table th:hover { color: var(--text-primary); }
.de-table td { padding: 8px 12px; border-bottom: 1px solid rgba(45,58,71,0.5); color: var(--text-primary); vertical-align: middle; }
.de-table tr:last-child td { border-bottom: none; }
.de-table tr:hover td { background: var(--surface-raised); }
.row-link { cursor: pointer; }
.num { text-align: right; font-variant-numeric: tabular-nums; }

/* ─── Identity card (host drill-in) ─── */
.identity-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 20px 24px; margin-bottom: 20px; display: flex; flex-wrap: wrap; column-gap: 24px; row-gap: 16px; }
.identity-primary { flex: 0 0 auto; min-width: 200px; }
.identity-name    { font-size: 22px; font-weight: 600; color: var(--text-heading); margin-bottom: 4px; word-break: break-all; }
.identity-sub     { font-size: 13px; color: var(--accent); }
.identity-meta    { display: flex; flex-wrap: wrap; column-gap: 28px; row-gap: 20px; flex: 1; }
.meta-item        { display: flex; flex-direction: column; row-gap: 3px; }
.meta-label       { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); }
.meta-value       { font-size: 13px; font-weight: 500; color: var(--text-heading); }

.badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
.badge-active      { background: rgba(83,160,81,0.18);  color: var(--green); }
.badge-anomalous   { background: rgba(220,78,65,0.18);  color: var(--red); }
.badge-silent      { background: rgba(85,95,108,0.25);  color: var(--text-secondary); }
.badge-needs_setup { background: rgba(248,190,52,0.18); color: var(--yellow); }
.badge-high        { background: rgba(220,78,65,0.15);  color: var(--red); }
.badge-medium      { background: rgba(248,190,52,0.15); color: var(--yellow); }
.badge-low         { background: rgba(83,160,81,0.15);  color: var(--green); }
.badge-ok          { background: rgba(83,160,81,0.15);  color: var(--green); }
.badge-warn        { background: rgba(248,190,52,0.15); color: var(--yellow); }
.badge-crit        { background: rgba(220,78,65,0.15);  color: var(--red); }

.zpos { color: var(--red); }
.zneg { color: var(--accent); }
.zok  { color: var(--text-secondary); }

#filter-host { background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); padding: 6px 12px; border-radius: 4px; font-size: 13px; width: 260px; font-family: inherit; }
#filter-host:focus { outline: none; border-color: var(--accent); }

.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* ─── Alert tab ─── */
.alert-dot { display:inline-block; width:8px; height:8px; border-radius:50%; vertical-align:middle; margin-right:6px; flex-shrink:0; }
.alert-dot.open   { background:var(--red);            box-shadow:0 0 0 2px rgba(220,78,65,0.3); }
.alert-dot.closed { background:var(--text-secondary); }
.duration-open   { color:var(--red);            font-size:11px; font-weight:500; }
.duration-closed { color:var(--text-secondary); font-size:11px; }
.correlation-banner { background:rgba(248,190,52,0.08); border:1px solid rgba(248,190,52,0.3); border-radius:6px; padding:12px 16px; margin-bottom:20px; color:var(--yellow); font-size:13px; }
.chart-card { background:var(--surface); border:1px solid var(--border); border-radius:6px; padding:20px; margin-bottom:20px; }
.chart-title { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-secondary); margin-bottom:14px; }
.al-type-silent       { color:var(--text-secondary); font-weight:600; font-size:12px; }
.al-type-unknown      { color:var(--accent);         font-weight:600; font-size:12px; }
.al-type-volume-low   { color:var(--red);            font-weight:600; font-size:12px; }
.al-type-volume-high  { color:var(--yellow);         font-weight:600; font-size:12px; }

@media (max-width: 900px) { .kpi-strip { grid-template-columns: 1fr 1fr; } }
`;

/* ════════════════════════════════════════════════════════════════════
   HTML skeleton — built into .dashboard-body by init()
════════════════════════════════════════════════════════════════════ */

var HTML_SKELETON = `
<div id="de-root">

  <div id="tab-nav">
    <span class="app-name">Data Explorer</span>
    <button class="tab-btn active" data-tab="fleet">Fleet Overview</button>
    <button class="tab-btn"        data-tab="host">Host Drill-In</button>
    <button class="tab-btn"        data-tab="alerts">Alerts</button>
  </div>

  <!-- TAB 1 — FLEET OVERVIEW -->
  <div id="tab-fleet" class="tab-panel active">
    <div class="filter-bar">
      <div class="filter-bar-inner">
        <span class="filter-bar-title">Fleet Overview</span>
        <div class="filter-group">
          <label>Time Window</label>
          <div class="toggle-group" id="fleet-window">
            <button class="toggle"        data-window="-1h@h">Last Hour</button>
            <button class="toggle active" data-window="-24h@h">24h</button>
            <button class="toggle"        data-window="-7d@h">7d</button>
          </div>
        </div>
        <div class="filter-group">
          <label>Criticality</label>
          <div class="toggle-group" id="fleet-crit">
            <button class="toggle active" data-crit="all">All</button>
            <button class="toggle"        data-crit="high">High</button>
            <button class="toggle"        data-crit="medium">Medium</button>
            <button class="toggle"        data-crit="low">Low</button>
          </div>
        </div>
        <div class="filter-spacer"></div>
        <div class="filter-status" id="fleet-status">&nbsp;</div>
      </div>
    </div>
    <div class="main-content">
      <div class="kpi-strip">
        <div class="kpi-tile"><div class="kpi-label">Healthy</div><div class="kpi-value green" id="fleet-kpi-ok">—</div><div class="kpi-delta" id="fleet-kpi-ok-sub">&nbsp;</div></div>
        <div class="kpi-tile"><div class="kpi-label">Warn (z &ge; 2)</div><div class="kpi-value yellow" id="fleet-kpi-warn">—</div><div class="kpi-delta">medium severity</div></div>
        <div class="kpi-tile"><div class="kpi-label">Critical (z &ge; 3)</div><div class="kpi-value red" id="fleet-kpi-crit">—</div><div class="kpi-delta">high severity</div></div>
        <div class="kpi-tile"><div class="kpi-label">Silent / Unreported</div><div class="kpi-value" id="fleet-kpi-silent">—</div><div class="kpi-delta">in registry, no events</div></div>
      </div>
      <div class="heatmap-card">
        <div class="heatmap-header">
          <span class="heatmap-title">Host Health Heatmap</span>
          <span class="heatmap-sub">Each cell = one host. Color = worst sourcetype z-score vs. 28d baseline. Click to drill in.</span>
        </div>
        <div class="heatmap-grid" id="fleet-heatmap"><div class="loading">Loading host health…</div></div>
        <div class="heatmap-legend">
          <span><span class="lg-sw" style="background:rgba(83,160,81,0.55)"></span>OK (|z| &lt; 2)</span>
          <span><span class="lg-sw" style="background:rgba(248,190,52,0.55)"></span>Warn (|z| &ge; 2)</span>
          <span><span class="lg-sw" style="background:rgba(220,78,65,0.7)"></span>Critical (|z| &ge; 3)</span>
          <span><span class="lg-sw" style="background:rgba(85,95,108,0.55)"></span>Silent</span>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Top Anomalies Now <span class="count" id="fleet-top-count"></span></h2></div>
        <div id="fleet-top-table"><div class="loading">Loading…</div></div>
      </div>
    </div>
  </div>

  <!-- TAB 2 — HOST DRILL-IN -->
  <div id="tab-host" class="tab-panel">
    <div class="filter-bar">
      <div class="filter-bar-inner">
        <span class="filter-bar-title">Host Drill-In</span>
        <div class="filter-group">
          <label>Host</label>
          <select id="filter-host"><option value="">— select a host —</option></select>
        </div>
        <div class="filter-group">
          <label>Time Window</label>
          <div class="toggle-group" id="host-window">
            <button class="toggle"        data-window="-1h@h">Last Hour</button>
            <button class="toggle active" data-window="-24h@h">24h</button>
            <button class="toggle"        data-window="-7d@h">7d</button>
          </div>
        </div>
        <div class="filter-spacer"></div>
      </div>
    </div>
    <div class="main-content">
      <div class="identity-card" id="host-identity"><div class="empty-state">Select a host above to drill in.</div></div>
      <div class="kpi-strip" id="host-kpis" style="display:none">
        <div class="kpi-tile"><div class="kpi-label">Events</div><div class="kpi-value" id="host-kpi-events">—</div><div class="kpi-delta" id="host-kpi-events-sub">in window</div></div>
        <div class="kpi-tile"><div class="kpi-label">Sourcetypes</div><div class="kpi-value" id="host-kpi-sts">—</div><div class="kpi-delta">reporting</div></div>
        <div class="kpi-tile"><div class="kpi-label">Anomalies</div><div class="kpi-value yellow" id="host-kpi-anom">—</div><div class="kpi-delta">|z| &ge; 2</div></div>
        <div class="kpi-tile"><div class="kpi-label">Last Event</div><div class="kpi-value" id="host-kpi-last">—</div><div class="kpi-delta" id="host-kpi-last-sub">ago</div></div>
      </div>
      <div class="card" id="host-st-card" style="display:none">
        <div class="card-header"><h2>Sourcetypes — Current vs. Baseline <span class="count" id="host-st-count"></span></h2></div>
        <div id="host-st-table"><div class="loading">Loading…</div></div>
      </div>
    </div>
  </div>

  <!-- TAB 3 — ALERTS -->
  <div id="tab-alerts" class="tab-panel">
    <div class="filter-bar">
      <div class="filter-bar-inner">
        <span class="filter-bar-title">Alerts</span>
        <div class="filter-group">
          <label>Time Range</label>
          <div class="toggle-group" id="alerts-range">
            <button class="toggle"        data-range="-1h">1h</button>
            <button class="toggle active" data-range="-24h">24h</button>
            <button class="toggle"        data-range="-7d">7d</button>
            <button class="toggle"        data-range="-30d">30d</button>
          </div>
        </div>
        <div class="filter-group">
          <label>Status</label>
          <div class="toggle-group" id="alerts-status">
            <button class="toggle active" data-status="all">All</button>
            <button class="toggle"        data-status="open">Open</button>
            <button class="toggle"        data-status="closed">Closed</button>
          </div>
        </div>
        <div class="filter-group">
          <label>Alert Type</label>
          <div class="toggle-group" id="alerts-type">
            <button class="toggle active" data-atype="all">All</button>
            <button class="toggle"        data-atype="silent">Silent</button>
            <button class="toggle"        data-atype="absent">Absent</button>
          </div>
        </div>
        <div class="filter-group">
          <label>Severity</label>
          <div class="toggle-group" id="alerts-sev">
            <button class="toggle active" data-sev="all">All</button>
            <button class="toggle"        data-sev="high">High</button>
            <button class="toggle"        data-sev="medium">Med</button>
            <button class="toggle"        data-sev="low">Low</button>
          </div>
        </div>
        <div class="filter-spacer"></div>
      </div>
    </div>
    <div class="main-content">
      <div class="kpi-strip">
        <div class="kpi-tile"><div class="kpi-label">Open Alerts</div><div class="kpi-value red" id="al-kpi-open">—</div><div class="kpi-delta">currently anomalous</div></div>
        <div class="kpi-tile"><div class="kpi-label">Closed (window)</div><div class="kpi-value" id="al-kpi-closed">—</div><div class="kpi-delta">recovered</div></div>
        <div class="kpi-tile"><div class="kpi-label">Sources Affected</div><div class="kpi-value" id="al-kpi-sources">—</div><div class="kpi-delta">unique host::sourcetype</div></div>
        <div class="kpi-tile"><div class="kpi-label">Boundaries Affected</div><div class="kpi-value" id="al-kpi-boundaries">—</div><div class="kpi-delta" id="al-kpi-boundaries-sub">&nbsp;</div></div>
      </div>
      <div id="al-correlation" class="correlation-banner" style="display:none"></div>
      <div class="chart-card">
        <div class="chart-title">Alert Volume — Last 14 Days</div>
        <div id="al-hist-chart"><div class="loading">Loading…</div></div>
      </div>
      <div class="chart-card">
        <div class="chart-title" id="al-timeline-title">Alert Timeline</div>
        <div id="al-timeline"></div>
      </div>
      <div class="card">
        <div class="card-header"><h2>Fired Alerts <span class="count" id="al-table-count"></span></h2></div>
        <div id="al-table"><div class="loading">Loading…</div></div>
      </div>
    </div>
  </div>

</div>
`;

/* ════════════════════════════════════════════════════════════════════
   State & constants
════════════════════════════════════════════════════════════════════ */

var STATE = {
    fleet:  { window: '-24h@h', criticality: 'all' },
    host:   { host: '',         window: '-24h@h' },
    alerts: { range: '-24h',    status: 'all', severity: 'all', alertType: 'all' }
};

var Z_WARN = 2;
var Z_CRIT = 3;

/* ════════════════════════════════════════════════════════════════════
   Helpers
════════════════════════════════════════════════════════════════════ */

function esc(s) {
    return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtCount(n) {
    n = Number(n) || 0;
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.round(n).toLocaleString();
}

function fmtPct(p) {
    if (p == null || isNaN(p)) return '';
    var sign = p > 0 ? '+' : '';
    return sign + p + '%';
}

function fmtRelativeTime(epoch) {
    if (!epoch) return '—';
    var diff = Math.floor(Date.now() / 1000) - Number(epoch);
    if (diff < 60)     return diff + 's ago';
    if (diff < 3600)   return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

function getCsrfToken() {
    if (window.$C && window.$C['SPLUNK_FORM_KEY']) return window.$C['SPLUNK_FORM_KEY'];
    var m = document.cookie.match(/splunkweb_csrf_token_\d+=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

function runSearch(spl, earliest, latest, cb) {
    var csrf = getCsrfToken();
    $.ajax({
        url: '/en-US/splunkd/__raw/services/search/jobs',
        type: 'POST', dataType: 'json',
        data: {
            search:        spl,
            earliest_time: earliest || '',
            latest_time:   latest   || 'now',
            output_mode:   'json',
            count:         '50000',
            splunk_form_key: csrf
        },
        headers: { 'X-Splunk-Form-Key': csrf, 'X-Requested-With': 'XMLHttpRequest' },
        success: function(r) { pollJob(r.sid, cb); },
        error:   function(_, _t, e) { console.warn('search failed', e, spl); cb([]); }
    });
}

function pollJob(sid, cb) {
    $.getJSON('/en-US/splunkd/__raw/services/search/jobs/' + sid, { output_mode: 'json' })
        .done(function(r) {
            if (r.entry[0].content.isDone) {
                $.getJSON('/en-US/splunkd/__raw/services/search/jobs/' + sid + '/results',
                    { output_mode: 'json', count: '50000' })
                    .done(function(r) { cb(r.results || []); })
                    .fail(function() { cb([]); });
            } else {
                setTimeout(function() { pollJob(sid, cb); }, 750);
            }
        })
        .fail(function() { cb([]); });
}

/* ════════════════════════════════════════════════════════════════════
   Tab switching
════════════════════════════════════════════════════════════════════ */

function showTab(tab) {
    $('.tab-btn').removeClass('active');
    $('.tab-btn[data-tab="' + tab + '"]').addClass('active');
    $('.tab-panel').removeClass('active');
    $('#tab-' + tab).addClass('active');

    if      (tab === 'fleet')  loadFleet();
    else if (tab === 'host')   loadHostPickerIfNeeded();
    else if (tab === 'alerts') loadAlerts();
}

$(document).on('click', '.tab-btn', function() {
    showTab($(this).data('tab'));
});

/* ════════════════════════════════════════════════════════════════════
   FLEET OVERVIEW
════════════════════════════════════════════════════════════════════ */

$(document).on('click', '#fleet-window .toggle', function() {
    $('#fleet-window .toggle').removeClass('active');
    $(this).addClass('active');
    STATE.fleet.window = $(this).data('window');
    loadFleet();
});

$(document).on('click', '#fleet-crit .toggle', function() {
    $('#fleet-crit .toggle').removeClass('active');
    $(this).addClass('active');
    STATE.fleet.criticality = $(this).data('crit');
    loadFleet();
});

function buildFleetSpl(win, critFilter) {
    var critClause = (critFilter && critFilter !== 'all')
        ? '| where criticality="' + esc(critFilter) + '" '
        : '';
    return ''
        + '| tstats count as ev WHERE `de_monitored_index` '
        +     'earliest=' + win + ' latest=now BY host, sourcetype, index, _time span=1h '
        + '| lookup de_host_registry_lookup host OUTPUT criticality, host_role, system_boundary, status '
        + critClause
        + '| eval slot_key=host."::".sourcetype."::".strftime(_time,"%w")."::".tonumber(strftime(_time,"%H")) '
        + '| join type=left slot_key ['
        +     'search `de_summary_index` sourcetype="de:hourly_stat" earliest=-28d latest=now '
        +     '| eval slot_key=s_host."::".s_sourcetype."::".dow."::".hod '
        +     '| stats median(events) as med, stdev(events) as sd BY slot_key'
        + '] '
        // collapse hourly buckets -> per host::sourcetype; expected = sum of slot medians,
        // combined stdev = sqrt(sum of slot variances) — correct for any multi-hour window
        + '| eval sd2=if(isnotnull(sd), pow(sd,2), null()) '
        + '| stats sum(ev) as events, sum(med) as med, sum(sd2) as var_sum, '
        +         'values(criticality) as criticality, values(host_role) as host_role, '
        +         'values(system_boundary) as boundary BY host, sourcetype '
        + '| eval sd_combined=sqrt(var_sum) '
        + '| eval z=if(isnotnull(sd_combined) AND sd_combined>0, round((events-med)/sd_combined, 2), 0), abs_z=abs(z) '
        + '| sort 0 host -abs_z '
        + '| stats first(z) as worst_z, first(sourcetype) as worst_st, first(abs_z) as worst_abs_z, '
        +         'sum(events) as events, dc(sourcetype) as st_count, '
        +         'values(criticality) as crit_mv, values(host_role) as host_role, '
        +         'values(boundary) as boundary BY host '
        + '| eval criticality=mvindex(crit_mv, 0) '
        + '| eval severity=case(worst_abs_z>=' + Z_CRIT + ', "crit", worst_abs_z>=' + Z_WARN + ', "warn", true(), "ok") '
        + '| sort 0 -worst_abs_z host';
}

function buildSilentSpl(critFilter) {
    var critClause = (critFilter && critFilter !== 'all')
        ? '| where criticality="' + esc(critFilter) + '" '
        : '';
    return ''
        + '| inputlookup de_host_registry_lookup '
        + '| where status="active" '
        + critClause
        + '| join type=left host ['
        +     '| inputlookup data_source_registry_lookup | stats max(last_seen) as last_seen BY host'
        + '] '
        + '| stats values(criticality) as criticality, values(host_role) as host_role, '
        +         'values(system_boundary) as boundary, max(last_seen) as last_seen BY host';
}

function loadFleet() {
    $('#fleet-heatmap').html('<div class="loading">Loading host health…</div>');
    $('#fleet-top-table').html('<div class="loading">Loading…</div>');
    $('#fleet-status').text('Running…');

    var win = STATE.fleet.window;
    var crit = STATE.fleet.criticality;
    var fleetRows = null, regRows = null;

    runSearch(buildFleetSpl(win, crit), win, 'now', function(rows) {
        fleetRows = rows;
        if (regRows !== null) mergeAndRender(fleetRows, regRows);
    });
    runSearch(buildSilentSpl(crit), '-1d', 'now', function(rows) {
        regRows = rows;
        if (fleetRows !== null) mergeAndRender(fleetRows, regRows);
    });
}

function mergeAndRender(fleetRows, regRows) {
    var byHost = {};
    fleetRows.forEach(function(r) {
        byHost[r.host] = {
            host:        r.host,
            severity:    r.severity || 'ok',
            worst_z:     Number(r.worst_z) || 0,
            worst_abs_z: Number(r.worst_abs_z) || 0,
            worst_st:    r.worst_st || '',
            events:      Number(r.events) || 0,
            st_count:    Number(r.st_count) || 0,
            criticality: r.criticality || '',
            host_role:   r.host_role || '',
            boundary:    r.boundary || ''
        };
    });
    regRows.forEach(function(r) {
        if (!byHost[r.host]) {
            byHost[r.host] = {
                host:        r.host,
                severity:    'silent',
                worst_z:     0, worst_abs_z: 0, worst_st: '',
                events: 0, st_count: 0,
                criticality: r.criticality || '',
                host_role:   r.host_role || '',
                boundary:    r.boundary || '',
                last_seen:   Number(r.last_seen) || 0
            };
        }
    });
    var merged = Object.keys(byHost).map(function(h) { return byHost[h]; });
    merged.sort(function(a, b) {
        var rank = { crit: 0, warn: 1, silent: 2, ok: 3 };
        if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
        return b.worst_abs_z - a.worst_abs_z;
    });

    renderFleetKpis(merged);
    renderHeatmap(merged);
    renderTopAnomalies(merged);
    $('#fleet-status').text(merged.length + ' hosts');
}

function renderFleetKpis(rows) {
    var c = { ok: 0, warn: 0, crit: 0, silent: 0 };
    rows.forEach(function(r) { c[r.severity] = (c[r.severity] || 0) + 1; });
    $('#fleet-kpi-ok').text(c.ok);
    $('#fleet-kpi-ok-sub').text('of ' + rows.length + ' total');
    $('#fleet-kpi-warn').text(c.warn);
    $('#fleet-kpi-crit').text(c.crit);
    $('#fleet-kpi-silent').text(c.silent);
}

function renderHeatmap(rows) {
    if (!rows.length) {
        $('#fleet-heatmap').html('<div class="empty-state">No hosts match the current filters.</div>');
        return;
    }
    var html = rows.map(function(r) {
        var cls = 'cell-' + r.severity;
        var sub = '';
        if (r.severity === 'crit' || r.severity === 'warn') {
            sub = (r.worst_z > 0 ? '+' : '') + r.worst_z + 'σ';
        } else if (r.severity === 'silent') {
            sub = 'no events';
        } else {
            sub = fmtCount(r.events);
        }
        var title = r.host + '\nseverity: ' + r.severity
            + (r.worst_st ? '\nworst: ' + r.worst_st + ' (z=' + r.worst_z + ')' : '')
            + (r.boundary ? '\nboundary: ' + r.boundary : '')
            + (r.criticality ? '\ncriticality: ' + r.criticality : '');
        return ''
            + '<div class="heatmap-cell ' + cls + '" data-host="' + escHtml(r.host) + '" title="' + escHtml(title) + '">'
            +   '<div class="cell-host">' + escHtml(r.host) + '</div>'
            +   '<div class="cell-sub">'  + escHtml(sub)    + '</div>'
            + '</div>';
    }).join('');
    $('#fleet-heatmap').html(html);
}

function renderTopAnomalies(rows) {
    var anom = rows.filter(function(r) { return r.severity === 'crit' || r.severity === 'warn'; });
    if (!anom.length) {
        $('#fleet-top-table').html('<div class="empty-state">No anomalies in window. ' +
            'All reporting hosts within baseline (|z| &lt; 2).</div>');
        $('#fleet-top-count').text('');
        return;
    }
    var html = ''
        + '<table class="de-table"><thead><tr>'
        +   '<th>Host</th><th>Worst Sourcetype</th><th class="num">Events</th>'
        +   '<th class="num">z-score</th><th>Severity</th><th>Criticality</th><th>Boundary</th>'
        + '</tr></thead><tbody>'
        + anom.slice(0, 25).map(function(r) {
            var zCls = r.worst_z >= 0 ? 'zpos' : 'zneg';
            return '<tr class="row-link" data-host="' + escHtml(r.host) + '">'
                + '<td><strong>' + escHtml(r.host) + '</strong></td>'
                + '<td>' + escHtml(r.worst_st) + '</td>'
                + '<td class="num">' + fmtCount(r.events) + '</td>'
                + '<td class="num ' + zCls + '">' + (r.worst_z > 0 ? '+' : '') + r.worst_z + '</td>'
                + '<td><span class="badge badge-' + r.severity + '">' + r.severity + '</span></td>'
                + '<td>' + escHtml(r.criticality || '—') + '</td>'
                + '<td>' + escHtml(r.boundary || '—') + '</td>'
                + '</tr>';
        }).join('')
        + '</tbody></table>';
    $('#fleet-top-table').html(html);
    $('#fleet-top-count').text(anom.length + ' anomalous host' + (anom.length === 1 ? '' : 's'));
}

$(document).on('click', '.heatmap-cell, #fleet-top-table .row-link', function() {
    var host = $(this).data('host');
    if (!host) return;
    STATE.host.host = String(host);
    showTab('host');
    setTimeout(function() {
        $('#filter-host').val(STATE.host.host).trigger('change');
    }, 50);
});

/* ════════════════════════════════════════════════════════════════════
   HOST DRILL-IN
════════════════════════════════════════════════════════════════════ */

var hostPickerLoaded = false;

function loadHostPickerIfNeeded() {
    if (hostPickerLoaded) return;
    hostPickerLoaded = true;
    var spl = ''
        + '| inputlookup de_host_registry_lookup '
        + '| where status="active" '
        + '| stats count BY host '
        + '| sort host';
    runSearch(spl, '-1d', 'now', function(rows) {
        var opts = ['<option value="">— select a host —</option>']
            .concat(rows.map(function(r) {
                return '<option value="' + escHtml(r.host) + '">' + escHtml(r.host) + '</option>';
            }));
        $('#filter-host').html(opts.join(''));
        if (STATE.host.host) $('#filter-host').val(STATE.host.host).trigger('change');
    });
}

$(document).on('change', '#filter-host', function() {
    STATE.host.host = $(this).val() || '';
    if (STATE.host.host) loadHost();
    else {
        $('#host-identity').html('<div class="empty-state">Select a host above to drill in.</div>');
        $('#host-kpis').hide();
        $('#host-st-card').hide();
    }
});

$(document).on('click', '#host-window .toggle', function() {
    $('#host-window .toggle').removeClass('active');
    $(this).addClass('active');
    STATE.host.window = $(this).data('window');
    if (STATE.host.host) loadHost();
});

function loadHost() {
    var host = STATE.host.host;
    var win  = STATE.host.window;
    if (!host) return;

    var identitySpl = ''
        + '| inputlookup de_host_registry_lookup '
        + '| where host="' + esc(host) + '" '
        + '| stats values(host_role) as host_role, values(system_boundary) as boundary, '
        +         'values(criticality) as criticality, values(status) as status BY host '
        + '| join type=left host ['
        +     '| inputlookup data_source_registry_lookup | where host="' + esc(host) + '" '
        +     '| stats count as st_count, max(last_seen) as last_seen BY host'
        + '] ';

    runSearch(identitySpl, '-1d', 'now', function(rows) {
        renderHostIdentity(rows[0] || { host: host });
    });

    var stSpl = ''
        + '| tstats count as ev WHERE `de_monitored_index` host="' + esc(host) + '" '
        +     'earliest=' + win + ' latest=now BY sourcetype, index, _time span=1h '
        + '| eval slot_key=sourcetype."::".strftime(_time,"%w")."::".tonumber(strftime(_time,"%H")) '
        + '| join type=left slot_key ['
        +     'search `de_summary_index` sourcetype="de:hourly_stat" s_host="' + esc(host) + '" '
        +     'earliest=-28d latest=now '
        +     '| eval slot_key=s_sourcetype."::".dow."::".hod '
        +     '| stats median(events) as med, stdev(events) as sd BY slot_key'
        + '] '
        + '| eval sd2=if(isnotnull(sd), pow(sd,2), null()) '
        + '| stats sum(ev) as current_events, sum(med) as med, sum(sd2) as var_sum BY sourcetype '
        + '| eval sd_combined=sqrt(var_sum) '
        + '| eval z=if(isnotnull(sd_combined) AND sd_combined>0, round((current_events-med)/sd_combined, 2), 0) '
        + '| eval pct=if(med>0, round((current_events-med)/med*100, 1), null()) '
        + '| eval severity=case(abs(z)>=' + Z_CRIT + ', "crit", abs(z)>=' + Z_WARN + ', "warn", true(), "ok") '
        + '| sort 0 -current_events';

    runSearch(stSpl, win, 'now', function(rows) {
        renderHostKpis(rows);
        renderHostStTable(rows);
    });
}

function renderHostIdentity(r) {
    var statusBadge = r.status ? '<span class="badge badge-' + r.status + '">' + r.status + '</span>' : '';
    var critBadge   = r.criticality ? '<span class="badge badge-' + r.criticality + '">' + r.criticality + '</span>' : '—';
    $('#host-identity').html(''
        + '<div class="identity-primary">'
        +   '<div class="identity-name">' + escHtml(r.host) + '</div>'
        +   '<div class="identity-sub">'  + escHtml(r.host_role || 'unclassified') + '</div>'
        + '</div>'
        + '<div class="identity-meta">'
        +   '<div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">' + statusBadge + '</div></div>'
        +   '<div class="meta-item"><div class="meta-label">Criticality</div><div class="meta-value">' + critBadge + '</div></div>'
        +   '<div class="meta-item"><div class="meta-label">Boundary</div><div class="meta-value">' + escHtml(r.boundary || '—') + '</div></div>'
        +   '<div class="meta-item"><div class="meta-label">Sourcetypes (registry)</div><div class="meta-value">' + escHtml(r.st_count || '0') + '</div></div>'
        +   '<div class="meta-item"><div class="meta-label">Last Event</div><div class="meta-value">' + fmtRelativeTime(r.last_seen) + '</div></div>'
        + '</div>'
    );
}

function renderHostKpis(rows) {
    var totalEvents = 0, anomCount = 0;
    rows.forEach(function(r) {
        totalEvents += Number(r.current_events) || 0;
        if (r.severity === 'warn' || r.severity === 'crit') anomCount++;
    });
    $('#host-kpis').show();
    $('#host-kpi-events').text(fmtCount(totalEvents));
    $('#host-kpi-events-sub').text(rows.length + ' sourcetype' + (rows.length === 1 ? '' : 's'));
    $('#host-kpi-sts').text(rows.length);
    $('#host-kpi-anom').text(anomCount);
    $('#host-kpi-anom').toggleClass('red',    anomCount > 0)
                      .toggleClass('green',   anomCount === 0)
                      .toggleClass('yellow',  false);
    $('#host-kpi-last').text('—');
    $('#host-kpi-last-sub').text('see identity card');
}

function renderHostStTable(rows) {
    $('#host-st-card').show();
    if (!rows.length) {
        $('#host-st-table').html('<div class="empty-state">No events for this host in the selected window.</div>');
        $('#host-st-count').text('');
        return;
    }
    var html = ''
        + '<table class="de-table"><thead><tr>'
        +   '<th>Sourcetype</th>'
        +   '<th class="num">Current</th>'
        +   '<th class="num">Baseline (median)</th>'
        +   '<th class="num">Δ %</th>'
        +   '<th class="num">z-score</th>'
        +   '<th>Severity</th>'
        + '</tr></thead><tbody>'
        + rows.map(function(r) {
            var z   = Number(r.z);
            var pct = (r.pct === null || r.pct === undefined || r.pct === '') ? null : Number(r.pct);
            var zCls = isNaN(z) || Math.abs(z) < Z_WARN ? 'zok' : (z > 0 ? 'zpos' : 'zneg');
            var sev = r.severity || 'ok';
            return '<tr>'
                + '<td>' + escHtml(r.sourcetype) + '</td>'
                + '<td class="num">' + fmtCount(r.current_events) + '</td>'
                + '<td class="num">' + (r.med == null || r.med === '' ? '—' : fmtCount(r.med)) + '</td>'
                + '<td class="num">' + (pct === null ? '—' : fmtPct(pct)) + '</td>'
                + '<td class="num ' + zCls + '">' + (isNaN(z) ? '—' : (z > 0 ? '+' : '') + z) + '</td>'
                + '<td><span class="badge badge-' + sev + '">' + sev + '</span></td>'
                + '</tr>';
        }).join('')
        + '</tbody></table>';
    $('#host-st-table').html(html);
    $('#host-st-count').text(rows.length + ' sourcetype' + (rows.length === 1 ? '' : 's'));
}

/* ════════════════════════════════════════════════════════════════════
   ALERTS
════════════════════════════════════════════════════════════════════ */

$(document).on('click', '#alerts-range .toggle', function() {
    $('#alerts-range .toggle').removeClass('active');
    $(this).addClass('active');
    STATE.alerts.range = $(this).data('range');
    loadAlerts();
});
$(document).on('click', '#alerts-status .toggle', function() {
    $('#alerts-status .toggle').removeClass('active');
    $(this).addClass('active');
    STATE.alerts.status = $(this).data('status');
    loadAlerts();
});
$(document).on('click', '#alerts-type .toggle', function() {
    $('#alerts-type .toggle').removeClass('active');
    $(this).addClass('active');
    STATE.alerts.alertType = $(this).data('atype');
    loadAlerts();
});
$(document).on('click', '#alerts-sev .toggle', function() {
    $('#alerts-sev .toggle').removeClass('active');
    $(this).addClass('active');
    STATE.alerts.severity = $(this).data('sev');
    loadAlerts();
});

function buildAlertsSpl(range) {
    return ''
        + 'search `de_alert_index` sourcetype="data_explorer:alert" earliest=' + range + ' latest=now '
        + '| stats min(_time) as first_seen, max(_time) as last_seen, '
        +         'values(alert_event_type) as event_types, '
        +         'last(severity) as severity, last(message) as message, '
        +         'last(affected_host) as host, last(affected_sourcetype) as sourcetype, '
        +         'last(alert_type) as alert_type, '
        +         'last(system_boundary) as system_boundary '
        +         'BY alert_id '
        + '| eval status=if(match(mvjoin(event_types, ","), "close"), "closed", "open") '
        + '| eval duration_seconds=last_seen - first_seen '
        + '| sort -first_seen';
}

function buildHistogramSpl() {
    return 'search `de_alert_index` sourcetype="data_explorer:alert" alert_event_type=open earliest=-14d latest=now '
        + '| bin _time span=1d '
        + '| stats dc(alert_id) as cnt BY _time '
        + '| sort _time';
}

function loadAlerts() {
    $('#al-table').html('<div class="loading">Loading…</div>');
    $('#al-hist-chart').html('<div class="loading">Loading…</div>');
    $('#al-timeline').html('');
    $('#al-correlation').hide();

    var range = STATE.alerts.range;
    var mainRows = null, histRows = null;

    function tryRender() {
        if (mainRows === null || histRows === null) return;
        var filtered = mainRows.filter(function(r) {
            if (STATE.alerts.status !== 'all' && r.status !== STATE.alerts.status) return false;
            if (STATE.alerts.severity !== 'all' && r.severity !== STATE.alerts.severity) return false;
            var at = STATE.alerts.alertType;
            if (at !== 'all') {
                if (at === 'silent' && r.alert_type !== 'source_silent') return false;
                if (at === 'absent' && r.alert_type !== 'source_absent') return false;
            }
            return true;
        });
        renderAlertKpis(filtered);
        renderAlertHistogram(histRows);
        renderAlertTimeline(filtered, range);
        renderCorrelationBanner(filtered);
        renderAlertTable(filtered);
    }

    runSearch(buildAlertsSpl(range), range, 'now', function(rows) {
        mainRows = rows;
        tryRender();
    });
    runSearch(buildHistogramSpl(), '-14d', 'now', function(rows) {
        histRows = rows;
        tryRender();
    });
}

function renderAlertKpis(rows) {
    var open = 0, closed = 0;
    var sources = {}, boundaries = {};
    rows.forEach(function(r) {
        if (r.status === 'open') open++; else closed++;
        if (r.host) sources[r.host + '::' + (r.sourcetype || '')] = 1;
        if (r.system_boundary) boundaries[r.system_boundary] = 1;
    });
    var bKeys = Object.keys(boundaries);
    $('#al-kpi-open').text(open);
    $('#al-kpi-closed').text(closed);
    $('#al-kpi-sources').text(Object.keys(sources).length);
    $('#al-kpi-boundaries').text(bKeys.length);
    $('#al-kpi-boundaries-sub').text(bKeys.length === 1 ? bKeys[0] : (bKeys.length > 1 ? bKeys.slice(0,2).join(', ') + (bKeys.length > 2 ? '…' : '') : '—'));
}

function fmtDuration(sec) {
    sec = Number(sec) || 0;
    if (sec < 60)    return Math.round(sec) + 's';
    if (sec < 3600)  return Math.round(sec / 60) + 'm';
    if (sec < 86400) return (sec / 3600).toFixed(1) + 'h';
    return (sec / 86400).toFixed(1) + 'd';
}

function fmtAbsoluteTime(epoch) {
    if (!epoch) return '—';
    var d = new Date(Number(epoch) * 1000);
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return (d.getMonth()+1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function pad2(n) { return n < 10 ? '0' + n : String(n); }

function getTimelineTicks(tMin, tMax, span) {
    var ticks = [], step;
    if      (span <= 3600)   step = 600;
    else if (span <= 86400)  step = 14400;
    else if (span <= 604800) step = 86400;
    else                     step = 604800;
    for (var t = Math.ceil(tMin / step) * step; t <= tMax; t += step) ticks.push(t);
    return ticks;
}

function renderAlertHistogram(rows) {
    var el = document.getElementById('al-hist-chart');
    if (!el) return;
    if (!rows || !rows.length) {
        el.innerHTML = '<div class="empty-state">No alert history in last 14 days.</div>';
        return;
    }
    var dayMap = {};
    rows.forEach(function(r) {
        var d = new Date(Number(r._time) * 1000);
        var key = (d.getMonth() + 1) + '/' + d.getDate();
        dayMap[key] = Number(r.cnt) || 0;
    });
    var buckets = [];
    var now = new Date();
    for (var i = 13; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        var key = (d.getMonth() + 1) + '/' + d.getDate();
        buckets.push({ label: key, val: dayMap[key] || 0, today: i === 0 });
    }
    var maxV = Math.max.apply(null, buckets.map(function(b) { return b.val; })) || 1;
    var W = Math.max(200, el.offsetWidth - 40), H = 90, bl = H - 18;
    var n = buckets.length, slot = W / n, bw = Math.max(2, Math.floor(slot) - 2);
    var s = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">'];
    [1, 2, 3].forEach(function(v) {
        if (v > maxV) return;
        var y = bl - Math.round((v / maxV) * (bl - 8));
        s.push('<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '" stroke="#2d3a47" stroke-width="1" stroke-dasharray="3,4"/>');
        s.push('<text x="2" y="' + (y - 3) + '" fill="#7b8fa3" font-size="9" font-family="sans-serif">' + v + '</text>');
    });
    buckets.forEach(function(b, i) {
        if (!b.val) return;
        var bh = Math.max(2, Math.round((b.val / maxV) * (bl - 8)));
        var x  = Math.round(i * slot);
        var col = b.today ? '#dc4e41' : '#7b8fa3';
        s.push('<rect x="' + x + '" y="' + (bl - bh) + '" width="' + bw + '" height="' + bh + '" fill="' + col + '" opacity="0.85" rx="1"><title>' + escHtml(b.label + ': ' + b.val) + '</title></rect>');
    });
    s.push('<line x1="0" y1="' + bl + '" x2="' + W + '" y2="' + bl + '" stroke="#2d3a47" stroke-width="1"/>');
    var step = Math.max(1, Math.ceil(n / 7));
    buckets.forEach(function(b, i) {
        if (i % step !== 0 && !b.today) return;
        var cx = Math.round(i * slot + bw / 2);
        s.push('<text x="' + cx + '" y="' + (H - 3) + '" fill="' + (b.today ? '#c3cbd4' : '#7b8fa3') + '" font-size="9" font-family="sans-serif" text-anchor="middle">' + escHtml(b.label) + '</text>');
    });
    s.push('</svg>');
    el.innerHTML = s.join('');
}

function renderAlertTimeline(rows, range) {
    var el = document.getElementById('al-timeline');
    if (!el) return;
    var title = { '-1h': 'Last Hour', '-24h': 'Last 24 Hours', '-7d': 'Last 7 Days', '-30d': 'Last 30 Days' }[range] || '';
    $('#al-timeline-title').text('Alert Timeline — ' + title);
    if (!rows.length) {
        el.innerHTML = '<div class="empty-state">No alerts in window.</div>';
        return;
    }
    var now = Math.floor(Date.now() / 1000);
    var offsets = { '-1h': 3600, '-24h': 86400, '-7d': 604800, '-30d': 2592000 };
    var span = offsets[range] || 86400;
    var tMin = now - span, tMax = now;

    var stOrder = [], stSeen = {};
    rows.forEach(function(r) {
        var st = r.sourcetype || '(unknown)';
        if (!stSeen[st]) { stSeen[st] = true; stOrder.push(st); }
    });
    var bySourcetype = {};
    rows.forEach(function(r) {
        var st = r.sourcetype || '(unknown)';
        if (!bySourcetype[st]) bySourcetype[st] = [];
        bySourcetype[st].push(r);
    });

    var LABEL_W = 200, AXIS_H = 22, ROW_H = 26, GAP = 3;
    var totalW = Math.max(500, el.offsetWidth || 800);
    var CW = totalW - LABEL_W - 4;
    var H = stOrder.length * (ROW_H + GAP) + AXIS_H + 6;

    function tx(epoch) {
        var clamped = Math.min(Math.max(Number(epoch), tMin), tMax);
        return LABEL_W + ((clamped - tMin) / span) * CW;
    }
    function rowY(i) { return i * (ROW_H + GAP); }

    var typeColor = { source_silent: '#555f6c', source_absent: '#009cde' };
    var svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + totalW + '" height="' + H + '" style="display:block">'];

    stOrder.forEach(function(st, i) {
        svg.push('<rect x="' + LABEL_W + '" y="' + rowY(i) + '" width="' + CW + '" height="' + ROW_H + '" fill="' + (i % 2 === 0 ? '#1e2730' : '#1a242c') + '"/>');
    });

    var ticks = getTimelineTicks(tMin, tMax, span);
    ticks.forEach(function(t) {
        var x = tx(t);
        svg.push('<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + (H - AXIS_H) + '" stroke="#2d3a47" stroke-width="1"/>');
    });

    stOrder.forEach(function(st, i) {
        (bySourcetype[st] || []).forEach(function(a) {
            var x1 = tx(Number(a.first_seen));
            var x2 = a.status === 'open' ? tx(now) : tx(Number(a.last_seen));
            var bw = Math.max(3, x2 - x1);
            var y  = rowY(i) + 4, bh = ROW_H - 8;
            var col = typeColor[a.alert_type] || '#7b8fa3';
            var opacity = a.status === 'open' ? '0.9' : '0.45';
            svg.push('<rect x="' + x1 + '" y="' + y + '" width="' + bw + '" height="' + bh + '" fill="' + col + '" opacity="' + opacity + '" rx="2"><title>' + escHtml(st + ' · ' + (a.alert_type || '') + ' · ' + (a.status === 'open' ? 'OPEN' : 'closed')) + '</title></rect>');
            if (a.status === 'open') {
                var cx = x2, cy = y + bh / 2;
                svg.push('<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + col + '" opacity="0.9"/>');
                svg.push('<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="none" stroke="' + col + '" stroke-width="1.5" opacity="0.4"/>');
            }
        });
    });

    var nowX = tx(now);
    svg.push('<line x1="' + nowX + '" y1="0" x2="' + nowX + '" y2="' + (H - AXIS_H) + '" stroke="#c3cbd4" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>');
    svg.push('<text x="' + (nowX + 3) + '" y="10" fill="#7b8fa3" font-size="9" font-family="sans-serif">now</text>');

    stOrder.forEach(function(st, i) {
        svg.push('<rect x="0" y="' + rowY(i) + '" width="' + LABEL_W + '" height="' + ROW_H + '" fill="' + (i % 2 === 0 ? '#171d21' : '#141a1e') + '"/>');
    });
    stOrder.forEach(function(st, i) {
        var cy = rowY(i) + ROW_H / 2;
        var hasOpen = (bySourcetype[st] || []).some(function(a) { return a.status === 'open'; });
        var lbl = st.length > 26 ? st.slice(0, 25) + '…' : st;
        svg.push('<text x="10" y="' + (cy + 4) + '" fill="' + (hasOpen ? '#e8edf0' : '#7b8fa3') + '" font-size="11" font-family="sans-serif">' + escHtml(lbl) + '</text>');
    });

    svg.push('<line x1="' + LABEL_W + '" y1="0" x2="' + LABEL_W + '" y2="' + (H - AXIS_H) + '" stroke="#2d3a47" stroke-width="1"/>');

    var axisY = H - AXIS_H + 14;
    ticks.forEach(function(t) {
        var x = tx(t), d = new Date(t * 1000);
        var lbl = span <= 3600  ? pad2(d.getHours()) + ':' + pad2(d.getMinutes())
                : span <= 86400 ? pad2(d.getHours()) + ':00'
                : (d.getMonth() + 1) + '/' + d.getDate();
        svg.push('<text x="' + x + '" y="' + axisY + '" fill="#7b8fa3" font-size="9" font-family="sans-serif" text-anchor="middle">' + escHtml(lbl) + '</text>');
    });

    svg.push('</svg>');
    el.innerHTML = svg.join('');
}

function renderCorrelationBanner(rows) {
    var $banner = $('#al-correlation');
    var open = rows.filter(function(r) { return r.status === 'open'; });
    if (open.length < 2) { $banner.hide(); return; }
    var byBoundary = {};
    open.forEach(function(r) {
        var b = r.system_boundary || 'Unknown';
        if (!byBoundary[b]) byBoundary[b] = [];
        byBoundary[b].push(r);
    });
    var found = null;
    Object.keys(byBoundary).forEach(function(b) {
        if (found) return;
        var group = byBoundary[b];
        if (group.length < 2) return;
        group.sort(function(a, c) { return Number(a.first_seen) - Number(c.first_seen); });
        for (var i = 0; i < group.length - 1; i++) {
            if (Number(group[i + 1].first_seen) - Number(group[i].first_seen) <= 1800) {
                found = { boundary: b, a: group[i], b: group[i + 1] };
                break;
            }
        }
    });
    if (!found) { $banner.hide(); return; }
    $banner.html(
        '&#9888;&nbsp; Possible correlation &mdash; <strong>' + escHtml(found.a.sourcetype || '?') + '</strong> and ' +
        '<strong>' + escHtml(found.b.sourcetype || '?') + '</strong> both opened within 30 min on ' +
        '<strong>' + escHtml(found.boundary) + '</strong>. Consider as a single incident.'
    ).show();
}

function renderAlertTable(rows) {
    if (!rows.length) {
        $('#al-table').html('<div class="empty-state">No alerts match the current filters.</div>');
        $('#al-table-count').text('');
        return;
    }

    function typeHtml(r) {
        if (r.alert_type === 'source_silent')  return '<span class="al-type-silent">Silent</span>';
        if (r.alert_type === 'source_absent')  return '<span class="al-type-unknown">Absent</span>';
        return escHtml(r.alert_type || '—');
    }

    var html = ''
        + '<table class="de-table"><thead><tr>'
        +   '<th></th><th>ID</th><th>Opened</th><th>Host</th>'
        +   '<th>Sourcetype</th><th>Type</th><th>Duration</th>'
        +   '<th>Boundary</th><th class="num">Severity</th>'
        + '</tr></thead><tbody>'
        + rows.map(function(r) {
            var isOpen = r.status === 'open';
            var nowSec = Math.floor(Date.now() / 1000);
            var dur = isOpen
                ? '<span class="duration-open">' + fmtDuration(nowSec - Number(r.first_seen)) + ' · OPEN</span>'
                : '<span class="duration-closed">' + fmtDuration(r.duration_seconds) + '</span>';
            var sev = r.severity || 'info';
            return '<tr class="row-link" data-host="' + escHtml(r.host || '') + '">'
                + '<td><span class="alert-dot ' + (isOpen ? 'open' : 'closed') + '"></span></td>'
                + '<td style="color:var(--text-secondary);font-family:monospace;font-size:11px">' + escHtml(r.alert_id || '—') + '</td>'
                + '<td style="white-space:nowrap">' + fmtAbsoluteTime(r.first_seen) + '</td>'
                + '<td><strong>' + escHtml(r.host || '—') + '</strong></td>'
                + '<td>' + escHtml(r.sourcetype || '—') + '</td>'
                + '<td>' + typeHtml(r) + '</td>'
                + '<td>' + dur + '</td>'
                + '<td style="color:var(--text-secondary);font-size:11px">' + escHtml(r.system_boundary || '—') + '</td>'
                + '<td class="num"><span class="badge badge-' + sev + '">' + sev + '</span></td>'
                + '</tr>';
        }).join('')
        + '</tbody></table>';
    $('#al-table').html(html);
    $('#al-table-count').text(rows.length + ' alert' + (rows.length === 1 ? '' : 's'));
}

$(document).on('click', '#al-table .row-link', function() {
    var host = $(this).data('host');
    if (!host) return;
    STATE.host.host = String(host);
    showTab('host');
    setTimeout(function() {
        $('#filter-host').val(STATE.host.host).trigger('change');
    }, 50);
});

/* ════════════════════════════════════════════════════════════════════
   Init — inject CSS + build DOM, then kick off first search
════════════════════════════════════════════════════════════════════ */

function init() {
    $('head').append('<style id="de-styles">' + CSS + '</style>');
    var $target = $('.dashboard-body');
    if (!$target.length) $target = $('body');
    $target.html(HTML_SKELETON);
    loadFleet();
}

init();

}); // $(function() {
}); // require([
