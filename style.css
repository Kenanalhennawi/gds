:root{
  --bg:#0b0f14;
  --panel:#0f1621;
  --panel2:#0c121b;
  --text:#e7eefc;
  --muted:#9bb0d0;
  --border:rgba(255,255,255,.08);
  --shadow:0 10px 30px rgba(0,0,0,.35);
  --accent:#ff7a18;
  --accent2:#ffd5b3;
  --ok:#42d392;
  --warn:#ffcc66;
  --bad:#ff5a6a;
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji";
}

[data-theme="light"]{
  --bg:#f6f8fc;
  --panel:#ffffff;
  --panel2:#f3f6fb;
  --text:#0b1220;
  --muted:#56657f;
  --border:rgba(0,0,0,.08);
  --shadow:0 10px 30px rgba(16,24,40,.12);
  --accent:#ff6a00;
  --accent2:#ffe3cd;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:var(--sans);
  background:radial-gradient(1200px 600px at 15% 0%, rgba(255,122,24,.12), transparent 55%),
             radial-gradient(900px 500px at 85% 10%, rgba(66,211,146,.09), transparent 50%),
             var(--bg);
  color:var(--text);
}

.topbar{
  position:sticky;
  top:0;
  z-index:10;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 16px;
  border-bottom:1px solid var(--border);
  background:rgba(10,14,20,.7);
  backdrop-filter:blur(12px);
}

[data-theme="light"] .topbar{
  background:rgba(246,248,252,.8);
}

.brand{display:flex;align-items:center;gap:12px}
.brand__logo{
  width:44px;height:44px;border-radius:14px;
  display:grid;place-items:center;
  background:linear-gradient(135deg, rgba(255,122,24,.95), rgba(255,213,179,.65));
  color:#1a0f07;
  font-weight:900;
  box-shadow:var(--shadow);
}
.brand__title{font-weight:800;letter-spacing:.2px}
.brand__sub{font-size:12px;color:var(--muted);margin-top:2px}

.topbar__actions{display:flex;gap:10px}

.btn{
  border:1px solid var(--border);
  background:linear-gradient(135deg, rgba(255,122,24,.95), rgba(255,122,24,.55));
  color:#1a0f07;
  padding:10px 14px;
  border-radius:14px;
  font-weight:800;
  cursor:pointer;
  box-shadow:var(--shadow);
}

.btn--ghost{
  background:transparent;
  color:var(--text);
  box-shadow:none;
}

.btn:active{transform:translateY(1px)}

.layout{
  display:grid;
  grid-template-columns:1fr 1.2fr;
  gap:14px;
  padding:14px;
  max-width:1400px;
  margin:0 auto;
}

@media(max-width:1100px){
  .layout{grid-template-columns:1fr}
}

.panel{
  background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
  border:1px solid var(--border);
  border-radius:18px;
  box-shadow:var(--shadow);
  overflow:hidden;
}

[data-theme="light"] .panel{
  background:linear-gradient(180deg, rgba(0,0,0,.02), rgba(0,0,0,.01));
}

.panel__head{
  padding:14px 16px;
  border-bottom:1px solid var(--border);
  background:var(--panel2);
}

.panel__head--inline{border-bottom:0;background:transparent;padding:14px 16px 8px 16px}

.panel__title{font-weight:900}
.panel__hint{font-size:12px;color:var(--muted);margin-top:4px}

.input{
  width:100%;
  min-height:360px;
  resize:vertical;
  border:0;
  outline:none;
  padding:16px;
  font-family:var(--mono);
  font-size:12.5px;
  line-height:1.5;
  background:transparent;
  color:var(--text);
}

.split{border-top:1px solid var(--border)}

.searchRow{
  display:flex;
  gap:10px;
  padding:0 16px 14px 16px;
}

.search{
  flex:1;
  border:1px solid var(--border);
  background:rgba(255,255,255,.03);
  color:var(--text);
  padding:10px 12px;
  border-radius:14px;
  outline:none;
}

.searchResults{
  padding:0 16px 16px 16px;
  display:grid;
  gap:10px;
}

.resultCard{
  border:1px solid var(--border);
  border-radius:16px;
  background:rgba(255,255,255,.02);
  padding:12px 12px;
}

.resultCard__top{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
}

.badge{
  display:inline-flex;
  align-items:center;
  gap:8px;
  border:1px solid var(--border);
  padding:6px 10px;
  border-radius:999px;
  font-weight:900;
  font-family:var(--mono);
  font-size:12px;
  background:rgba(255,255,255,.03);
}

.badge--ok{border-color:rgba(66,211,146,.3);color:var(--ok)}
.badge--warn{border-color:rgba(255,204,102,.3);color:var(--warn)}
.badge--bad{border-color:rgba(255,90,106,.3);color:var(--bad)}

.kv{margin-top:8px;color:var(--muted);font-size:12px}
.kv b{color:var(--text);font-weight:900}

.output{padding:14px 16px;display:grid;gap:12px}

.msg{
  border:1px solid var(--border);
  border-radius:18px;
  background:rgba(255,255,255,.02);
  overflow:hidden;
}

.msg__head{
  padding:12px 14px;
  border-bottom:1px solid var(--border);
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:flex-start;
}

.msg__title{
  font-weight:900;
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
}

.pill{
  font-family:var(--mono);
  font-size:12px;
  padding:6px 10px;
  border:1px solid var(--border);
  border-radius:999px;
  background:rgba(255,255,255,.03);
}

.msg__meta{
  font-size:12px;
  color:var(--muted);
  text-align:right;
}

.msg__body{padding:12px 14px;display:grid;gap:12px}

.grid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0,1fr));
  gap:10px;
}

@media(max-width:900px){
  .grid{grid-template-columns:1fr}
}

.card{
  border:1px solid var(--border);
  border-radius:16px;
  padding:10px 12px;
  background:rgba(255,255,255,.02);
}

.card__title{font-weight:900;margin-bottom:8px}
.list{display:grid;gap:6px}
.row{
  display:flex;
  justify-content:space-between;
  gap:10px;
  font-family:var(--mono);
  font-size:12px;
  padding:6px 8px;
  border:1px solid var(--border);
  border-radius:12px;
  background:rgba(0,0,0,.08);
}

[data-theme="light"] .row{
  background:rgba(0,0,0,.03);
}

.row__left{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.small{font-size:12px;color:var(--muted);font-family:var(--mono)}
.hr{height:1px;background:var(--border);margin:4px 0}

.table{
  width:100%;
  border-collapse:separate;
  border-spacing:0;
  overflow:hidden;
  border:1px solid var(--border);
  border-radius:16px;
}

.table th,.table td{
  padding:10px 10px;
  border-bottom:1px solid var(--border);
  font-family:var(--mono);
  font-size:12px;
  text-align:left;
}

.table th{background:rgba(255,255,255,.03);font-weight:900}
.table tr:last-child td{border-bottom:0}

.tag{
  display:inline-flex;
  align-items:center;
  padding:4px 8px;
  border-radius:999px;
  border:1px solid var(--border);
  background:rgba(255,255,255,.03);
  font-family:var(--mono);
  font-size:12px;
  font-weight:900;
}

.tags{display:flex;gap:8px;flex-wrap:wrap}

.pre{
  white-space:pre-wrap;
  word-break:break-word;
  font-family:var(--mono);
  font-size:12px;
  line-height:1.5;
  color:var(--muted);
}

