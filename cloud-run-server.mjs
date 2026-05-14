:root {
  --blue: #1A6DB5;
  --orange: #F07D1A;
  --green: #3BAA4A;
  --purple: #6D5BD0;
  --blue-soft: #EBF5FF;
  --orange-soft: #FFF4EB;
  --green-soft: #EEFBF0;
  --purple-soft: #F2F0FF;
  --ink: #1F2937;
  --muted: #6B7280;
  --line: #D7DEE8;
  --surface: #FFFFFF;
  --surface-2: #F8FAFC;
  --danger: #B42318;
  --warning: #92400E;
  --shadow: 0 18px 60px rgba(31, 41, 55, 0.12);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
  background: #F0F4F8;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 1024px; background: linear-gradient(135deg, #f5f9ff 0%, #fff 46%, #fff7f0 100%); }
button, input, textarea { font: inherit; }
button { cursor: pointer; }
textarea { resize: vertical; }

.app-shell { max-width: 1480px; margin: 0 auto; padding: 22px; }
.hero {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 22px 26px;
  border-radius: 28px 28px 0 0;
  color: white;
  background: linear-gradient(135deg, var(--blue), #154F86 72%);
  box-shadow: var(--shadow);
}
.hero h1 { margin: 0; font-size: 30px; letter-spacing: -0.03em; }
.hero-subtitle { margin: 6px 0 0; max-width: 840px; color: rgba(255,255,255,0.82); }
.eyebrow { margin: 0 0 4px; color: inherit; opacity: 0.72; text-transform: uppercase; font-size: 12px; letter-spacing: .12em; font-weight: 750; }
.hero-mark { position: relative; width: 66px; height: 66px; border-radius: 22px; background: rgba(255,255,255,0.12); display: grid; place-items: center; }
.ring { position: absolute; border-radius: 999px; border: 3px solid white; opacity: .9; }
.ring-a { width: 42px; height: 42px; border-color: white; }
.ring-b { width: 12px; height: 12px; left: 13px; top: 14px; background: var(--orange); border: none; }
.ring-c { width: 13px; height: 13px; right: 13px; bottom: 15px; background: var(--green); border: none; }
.progress-card { min-width: 170px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.13); border-radius: 18px; padding: 12px 14px; }
.progress-card strong { font-size: 24px; display: block; }
.progress-card span { color: rgba(255,255,255,.8); font-size: 12px; }
.progress-track { margin-top: 8px; height: 8px; border-radius: 99px; background: rgba(255,255,255,.25); overflow: hidden; }
.progress-track div { height: 100%; background: var(--green); border-radius: 99px; transition: width .25s ease; }

.workspace { display: grid; grid-template-columns: 292px 1fr; min-height: 780px; border: 1px solid var(--line); border-top: none; background: var(--surface); border-radius: 0 0 28px 28px; overflow: hidden; box-shadow: var(--shadow); }
.sidebar { background: var(--surface-2); border-right: 1px solid var(--line); padding: 16px 12px; overflow-y: auto; }
.sidebar-section-title { margin: 10px 8px 8px; font-size: 11px; color: var(--muted); letter-spacing: .12em; text-transform: uppercase; font-weight: 800; }
.module-list { display: flex; flex-direction: column; gap: 6px; }
.module-button { width: 100%; border: 1px solid transparent; background: transparent; display: grid; grid-template-columns: 34px 1fr; gap: 9px; align-items: center; padding: 8px; border-radius: 14px; text-align: left; color: var(--ink); }
.module-button:hover { background: white; border-color: var(--line); }
.module-button.active { background: white; box-shadow: 0 8px 22px rgba(31,41,55,.08); border-color: var(--line); }
.module-button.locked { opacity: .48; }
.module-button.done .module-index { background: var(--green); color: white; border-color: var(--green); }
.module-index { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 10px; font-weight: 850; border: 1px solid var(--line); background: white; color: var(--muted); }
.module-button strong { display: block; font-size: 13px; line-height: 1.2; }
.module-button small { display: block; margin-top: 2px; color: var(--muted); text-transform: uppercase; font-size: 10px; letter-spacing: .07em; }
.module-button.tone-blue.active .module-index { background: var(--blue); border-color: var(--blue); color: white; }
.module-button.tone-orange.active .module-index { background: var(--orange); border-color: var(--orange); color: white; }
.module-button.tone-green.active .module-index { background: var(--green); border-color: var(--green); color: white; }
.module-button.tone-purple.active .module-index { background: var(--purple); border-color: var(--purple); color: white; }
.nav-list { display: grid; gap: 4px; }
.nav-list button { border: none; background: transparent; text-align: left; padding: 9px 11px; border-radius: 12px; color: var(--ink); }
.nav-list button:hover, .nav-list button.selected { background: white; color: var(--blue); box-shadow: 0 6px 18px rgba(31,41,55,.06); }
.panel { position: relative; padding: 18px; overflow-y: auto; background: linear-gradient(180deg, #fff, #fbfdff); }
.copy-toast { position: sticky; top: 0; z-index: 20; margin-left: auto; width: max-content; background: #111827; color: white; border-radius: 999px; padding: 8px 14px; font-size: 13px; box-shadow: var(--shadow); }
.module-summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; background: white; border: 1px solid var(--line); border-radius: 22px; margin-bottom: 16px; }
.module-summary h2 { margin: 0; font-size: 22px; letter-spacing: -.02em; }
.module-summary p { margin: 5px 0 0; color: var(--muted); max-width: 950px; }
.tab-grid { display: grid; gap: 16px; align-items: start; }
.chat-grid, .sources-grid, .excerpt-grid, .documentary-grid, .links-grid, .ufg-grid, .periodicals-grid, .export-grid, .config-grid { grid-template-columns: minmax(0, 1fr) 360px; }
.card { background: white; border: 1px solid var(--line); border-radius: 22px; padding: 18px; box-shadow: 0 10px 28px rgba(31,41,55,.04); }
.card.wide { min-width: 0; }
.card h3 { margin: 0 0 8px; font-size: 18px; }
.card h4 { margin: 0 0 6px; }
.card p { color: var(--muted); line-height: 1.55; }
.card-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.primary, .secondary, .text-button, .file-button { border-radius: 12px; border: 1px solid transparent; padding: 10px 14px; font-weight: 750; }
.primary { background: var(--blue); color: white; }
.primary:hover { background: #145a97; }
.primary:disabled { opacity: .55; cursor: wait; }
.secondary { background: var(--blue-soft); color: var(--blue); border-color: rgba(26,109,181,.25); }
.secondary:hover { background: #ddecff; }
.text-button { border: none; padding: 4px 0; background: transparent; color: var(--blue); font-weight: 800; }
.file-button { display: inline-grid; place-items: center; background: var(--orange-soft); color: var(--orange); border-color: rgba(240,125,26,.25); position: relative; overflow: hidden; }
.file-button input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.button-row, .quick-actions, .export-buttons { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.messages { height: 500px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px; }
.message { padding: 12px 14px; border-radius: 16px; max-width: 90%; border: 1px solid var(--line); }
.message p { margin: 0; white-space: pre-wrap; color: inherit; }
.message-meta { font-size: 11px; color: var(--muted); margin-bottom: 6px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.message.user { align-self: flex-end; background: var(--blue); color: white; border-color: var(--blue); }
.message.user .message-meta { color: rgba(255,255,255,.72); }
.message.assistant { align-self: flex-start; background: var(--surface-2); }
.message.system { align-self: flex-start; background: #F0F7FF; border-style: dashed; border-color: rgba(26,109,181,.4); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
.chat-input-row { margin-top: 14px; display: grid; grid-template-columns: 1fr auto; gap: 10px; }
.chat-input-row input, .form-grid input, label input { width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 11px 12px; }
.quick-actions button { border: 1px solid rgba(26,109,181,.22); color: var(--blue); background: var(--blue-soft); border-radius: 999px; padding: 7px 10px; font-size: 12px; }
.check-list, .fact-list, .ordered-list, .finding-list { margin: 0; padding-left: 20px; color: var(--ink); line-height: 1.6; }
.check-list li { margin: 6px 0; }
.check-list.big li { margin-bottom: 10px; }
.source-chip-list { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 14px; }
.source-chip, .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 850; }
.source-chip.publica, .badge.publica { background: var(--green-soft); color: #166534; }
.source-chip.restrita, .badge.restrita { background: var(--blue-soft); color: var(--blue); }
.source-chip.sensivel, .badge.sensivel { background: #FEE2E2; color: #991B1B; }
.source-chip.temporaria, .badge.temporaria { background: var(--orange-soft); color: var(--orange); }
.source-table { display: grid; gap: 10px; margin-top: 14px; }
.source-row { display: grid; grid-template-columns: 1fr auto; gap: 8px 14px; border: 1px solid var(--line); border-radius: 18px; padding: 14px; }
.source-row small { display: block; color: var(--muted); margin-top: 3px; }
.source-row p { grid-column: 1 / -1; margin: 0; }
.source-row button { justify-self: start; }
.warning { background: #FFF7ED; border-left: 4px solid var(--orange); padding: 10px 12px; border-radius: 10px; color: #7C2D12 !important; }
.large-textarea { width: 100%; min-height: 380px; border: 1px solid var(--line); border-radius: 16px; padding: 14px; line-height: 1.55; }
textarea { width: 100%; min-height: 120px; border: 1px solid var(--line); border-radius: 14px; padding: 12px; line-height: 1.5; }
.finding-list { list-style: none; padding: 0; }
.finding-list li { border: 1px solid var(--line); padding: 10px 12px; border-radius: 14px; margin-bottom: 8px; }
.finding-list li strong { display: block; }
.finding-list li span { display: block; margin-top: 4px; color: var(--muted); }
.finding-list li.alto { background: #FEF2F2; border-color: #FECACA; }
.finding-list li.medio { background: #FFF7ED; border-color: #FED7AA; }
.finding-list li.baixo { background: #F8FAFC; }
.form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0; }
.form-grid label, .three-columns label, .config-grid label { font-weight: 800; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.form-grid input, .three-columns textarea, .config-grid input { margin-top: 6px; color: var(--ink); text-transform: none; letter-spacing: 0; font-weight: 400; }
.three-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.three-columns textarea { min-height: 260px; }
.small-pre { max-height: 360px; overflow: auto; white-space: pre-wrap; background: var(--surface-2); border: 1px solid var(--line); border-radius: 16px; padding: 12px; font-size: 12px; line-height: 1.5; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: var(--ink) !important; background: var(--surface-2); border: 1px solid var(--line); border-radius: 14px; padding: 10px; word-break: break-word; }
.link-results { display: grid; gap: 8px; max-height: 540px; overflow: auto; }
.link-results article { border: 1px solid var(--line); border-radius: 14px; padding: 10px; }
.link-results article.ok { background: var(--green-soft); border-color: #BBF7D0; }
.link-results article.fail { background: #FEF2F2; border-color: #FECACA; }
.link-results p { margin: 4px 0; word-break: break-all; color: var(--ink); }
.link-results small { color: var(--muted); }
.article-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.article-cards article { border: 1px solid var(--line); border-radius: 18px; padding: 14px; background: var(--surface-2); }
.export-buttons { align-items: stretch; }
.export-buttons button { min-height: 54px; }
.palette-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.palette-grid button { display: grid; grid-template-columns: 28px 1fr; gap: 8px; align-items: center; border: 1px solid var(--line); background: white; border-radius: 14px; padding: 8px; text-align: left; }
.palette-grid span { width: 28px; height: 28px; border-radius: 9px; border: 1px solid rgba(0,0,0,.08); grid-row: span 2; }
.palette-grid strong { font-size: 12px; }
.palette-grid small { color: var(--muted); }
@media (max-width: 1100px) {
  body { min-width: 0; }
  .workspace { grid-template-columns: 1fr; }
  .sidebar { border-right: none; border-bottom: 1px solid var(--line); }
  .chat-grid, .sources-grid, .excerpt-grid, .documentary-grid, .links-grid, .ufg-grid, .periodicals-grid, .export-grid, .config-grid { grid-template-columns: 1fr; }
  .hero { grid-template-columns: 1fr; }
  .form-grid, .three-columns, .article-cards { grid-template-columns: 1fr; }
}

.agent-grid { grid-template-columns: minmax(0, 1fr) 380px; }
.workflow-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 12px 0 18px; }
.workflow-card { border: 1px solid var(--line); background: var(--surface-2); border-radius: 16px; padding: 12px; text-align: left; display: grid; gap: 6px; }
.workflow-card:hover, .workflow-card.selected { border-color: rgba(26,109,181,.42); background: var(--blue-soft); box-shadow: 0 8px 22px rgba(31,41,55,.06); }
.workflow-card strong { color: var(--ink); }
.workflow-card span { color: var(--muted); line-height: 1.35; }
.workflow-card small { color: var(--blue); font-weight: 750; line-height: 1.35; }
.agent-textarea { min-height: 160px; }
.agent-output { margin-top: 18px; border-top: 1px solid var(--line); padding-top: 16px; }
.agent-run-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
.status-ok, .status-warn { border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 850; text-transform: uppercase; letter-spacing: .06em; }
.status-ok { background: var(--green-soft); color: #166534; }
.status-warn { background: #FFF7ED; color: #9A3412; }
.agent-final { white-space: pre-wrap; background: #0F172A; color: #E5E7EB; border-radius: 18px; padding: 16px; line-height: 1.55; max-height: 520px; overflow: auto; }
.agent-timeline, .agent-list { display: grid; gap: 10px; }
.agent-step, .mini-agent { border: 1px solid var(--line); border-radius: 16px; padding: 12px; background: var(--surface-2); }
.agent-step strong, .mini-agent strong { display: block; }
.agent-step small, .mini-agent small { color: var(--muted); font-size: 12px; }
.agent-step p, .mini-agent p { margin: 6px 0; color: var(--muted); }
.agent-step.ok { border-color: #BBF7D0; background: var(--green-soft); }
.agent-step.warning { border-color: #FED7AA; background: #FFF7ED; }
.agent-step.blocked { border-color: #FECACA; background: #FEF2F2; }
.agent-step details { margin-top: 8px; }
.agent-step summary { color: var(--blue); font-weight: 800; cursor: pointer; }
.agent-step pre { white-space: pre-wrap; background: rgba(255,255,255,.74); border: 1px solid var(--line); border-radius: 12px; padding: 10px; overflow: auto; max-height: 260px; }
.mini-agent.tone-blue { border-left: 5px solid var(--blue); }
.mini-agent.tone-orange { border-left: 5px solid var(--orange); }
.mini-agent.tone-green { border-left: 5px solid var(--green); }
.mini-agent.tone-purple { border-left: 5px solid var(--purple); }
@media (max-width: 1100px) { .agent-grid, .workflow-grid { grid-template-columns: 1fr; } }
