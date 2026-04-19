import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// KitchenOS v4
// ✨ NEW:
//   🎨 3テーマ切替 (ダーク / ライト / ウォーム)
//   📅 週間メニュープランナー (1日3食×7日)
//   🛒 日別・週別 買い物リスト自動生成
//   ✏️  レシピ手動編集 (工程・材料・時間をインライン編集)
// ═══════════════════════════════════════════════════════════════

// ── THEMES ──────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:"#0d0f0e", surface:"#151918", surface2:"#1c211f", border:"#2a332f",
    text:"#e8ede9", muted:"#6b7c72",
    amber:"#f5a623", green:"#3dffa0", red:"#ff4d4d", blue:"#5bc8ff", purple:"#c084fc",
    label:"ダーク",
  },
  light: {
    bg:"#f5f5f2", surface:"#ffffff", surface2:"#f0efe8", border:"#dddbd2",
    text:"#1a1a18", muted:"#7a7a6e",
    amber:"#c87800", green:"#1a7a50", red:"#d93030", blue:"#1a6fa8", purple:"#7c4dca",
    label:"ライト",
  },
  warm: {
    bg:"#fdf6ed", surface:"#fff9f2", surface2:"#f7eedd", border:"#e6d9c4",
    text:"#2c1f0e", muted:"#8a6f4e",
    amber:"#b35c00", green:"#2a6b3c", red:"#c0392b", blue:"#1d5a8c", purple:"#6b3fa0",
    label:"ウォーム",
  },
};

const makeCSS = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:${t.bg};--surface:${t.surface};--surface2:${t.surface2};--border:${t.border};
    --text:${t.text};--muted:${t.muted};
    --amber:${t.amber};--green:${t.green};--red:${t.red};--blue:${t.blue};--purple:${t.purple};
    --ui:'Syne',sans-serif;--mono:'JetBrains Mono',monospace;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--ui);overflow-x:hidden;}
  .app{min-height:100vh;display:flex;flex-direction:column;}

  .hdr{border-bottom:1px solid var(--border);padding:0 20px;height:52px;display:flex;align-items:center;justify-content:space-between;background:var(--surface);position:sticky;top:0;z-index:100;}
  .logo{display:flex;align-items:center;gap:8px;cursor:pointer;}
  .logo-txt{font-size:15px;font-weight:800;letter-spacing:-.5px;color:var(--text);}
  .logo-txt span{color:var(--amber);}
  .hdr-r{display:flex;align-items:center;gap:8px;}

  .theme-btns{display:flex;gap:4px;}
  .theme-btn{padding:4px 10px;border-radius:20px;border:1px solid var(--border);background:transparent;cursor:pointer;font-size:10px;font-weight:700;font-family:var(--mono);color:var(--muted);transition:all .15s;}
  .theme-btn.on{background:var(--amber);border-color:var(--amber);color:#fff;}
  .theme-btn:hover:not(.on){border-color:var(--amber);color:var(--amber);}

  .pill{font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;font-family:var(--mono);letter-spacing:1px;}
  .pill-amber{background:var(--amber);color:#fff;}
  .pill-red{background:var(--red);color:#fff;animation:pulse 1.5s infinite;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}

  .body{display:flex;flex:1;}
  .side{width:210px;min-width:210px;border-right:1px solid var(--border);background:var(--surface);padding:12px 0;overflow-y:auto;}
  .side-sect{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:2px;padding:14px 16px 5px;font-family:var(--mono);}
  .nav-item{display:flex;align-items:center;gap:9px;padding:9px 16px;cursor:pointer;font-size:12px;font-weight:600;color:var(--muted);border-left:3px solid transparent;transition:all .15s;}
  .nav-item:hover{color:var(--text);background:var(--surface2);}
  .nav-item.on{color:var(--amber);border-left-color:var(--amber);background:rgba(128,90,0,.07);}
  .content{flex:1;padding:20px 24px;overflow-y:auto;max-height:calc(100vh - 52px);}

  .card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:18px;margin-bottom:14px;}
  .ch{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .ct{font-size:13px;font-weight:700;letter-spacing:.3px;color:var(--text);}

  .btn{font-family:var(--ui);font-size:11px;font-weight:700;padding:7px 14px;border-radius:4px;border:none;cursor:pointer;letter-spacing:.3px;transition:all .15s;display:inline-flex;align-items:center;gap:5px;}
  .btn:disabled{opacity:.4;cursor:not-allowed;}
  .b-amber{background:var(--amber);color:#fff;}
  .b-amber:not(:disabled):hover{filter:brightness(1.1);transform:translateY(-1px);}
  .b-ghost{background:transparent;color:var(--muted);border:1px solid var(--border);}
  .b-ghost:hover{color:var(--text);border-color:var(--muted);}
  .b-red{background:transparent;color:var(--red);border:1px solid var(--red);}
  .b-red:hover{background:rgba(200,0,0,.06);}
  .b-green{background:var(--green);color:#000;}
  .b-green:not(:disabled):hover{filter:brightness(1.05);}
  .b-purple{background:var(--purple);color:#fff;}
  .b-blue{background:var(--blue);color:#fff;}
  .b-sm{padding:4px 9px;font-size:10px;}
  .w100{width:100%;justify-content:center;}

  .inp,.sel,.ta{background:var(--surface2);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:12px;padding:7px 10px;border-radius:4px;width:100%;transition:border-color .15s;outline:none;}
  .inp:focus,.sel:focus,.ta:focus{border-color:var(--amber);}
  .ta{resize:vertical;min-height:60px;}
  .sel option{background:var(--surface);}

  .tag{font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;font-family:var(--mono);letter-spacing:.5px;}
  .t-amber{background:rgba(180,100,0,.12);color:var(--amber);border:1px solid rgba(180,100,0,.25);}
  .t-green{background:rgba(30,120,70,.1);color:var(--green);border:1px solid rgba(30,120,70,.2);}
  .t-blue{background:rgba(20,90,160,.1);color:var(--blue);border:1px solid rgba(20,90,160,.2);}
  .t-muted{background:rgba(120,120,100,.1);color:var(--muted);border:1px solid var(--border);}
  .t-purple{background:rgba(140,60,200,.1);color:var(--purple);border:1px solid rgba(140,60,200,.2);}
  .t-red{background:rgba(200,40,40,.1);color:var(--red);border:1px solid rgba(200,40,40,.2);}

  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;}
  .stat{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:14px;}
  .stat-n{font-size:24px;font-weight:800;font-family:var(--mono);color:var(--amber);}
  .stat-l{font-size:10px;color:var(--muted);margin-top:2px;}

  /* ── GANTT ── */
  .gantt-wrap{width:100%;}
  .gantt-legend-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border);}
  .gantt-legend-item{display:flex;align-items:center;gap:4px;font-size:10px;font-weight:700;font-family:var(--mono);color:var(--text);}
  .gantt-legend-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
  .gantt-axis{position:relative;height:16px;margin-bottom:3px;}
  .gantt-axis-mark{position:absolute;transform:translateX(-50%);font-size:8px;font-family:var(--mono);color:var(--muted);top:5px;}
  .gantt-axis-tick{position:absolute;top:0;width:1px;height:5px;background:var(--border);}
  .gantt-row2{position:relative;height:26px;margin-bottom:2px;}
  .gantt-bg2{position:absolute;inset:0;background:var(--surface2);border-radius:3px;border:1px solid var(--border);}
  .gantt-gl{position:absolute;top:0;bottom:0;width:1px;background:rgba(128,128,100,.2);pointer-events:none;}
  .gbar3{position:absolute;top:2px;height:22px;border-radius:3px;display:flex;align-items:center;font-size:9px;font-weight:700;font-family:var(--mono);overflow:hidden;padding:0 5px;cursor:pointer;transition:filter .12s,box-shadow .12s;}
  .gbar3:hover{filter:brightness(1.2);}
  .gbar3.ho{background:var(--amber);color:#fff;}
  .gbar3.ps{background:var(--green);color:#000;}
  .gbar3.done3{opacity:.3;}
  .gbar3.act3{box-shadow:0 0 0 2px var(--green);}
  .gbar3-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-right:3px;}
  .gbar3-txt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;}
  .gbar3-m{flex-shrink:0;margin-left:2px;opacity:.7;font-size:8px;}

  /* GANTT TOOLTIP */
  .gtip{position:fixed;z-index:400;pointer-events:none;background:var(--surface);border:1px solid var(--amber);border-radius:7px;padding:10px 13px;font-family:var(--mono);font-size:10px;box-shadow:0 6px 20px rgba(0,0,0,.2);max-width:240px;}
  .gtip-recipe{font-size:9px;font-weight:700;margin-bottom:2px;}
  .gtip-desc{font-weight:700;color:var(--text);margin-bottom:5px;font-size:11px;line-height:1.3;}
  .gtip-row{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:9px;margin-bottom:2px;}
  .gtip-div{border:none;border-top:1px solid var(--border);margin:5px 0;}
  .gtip-ing-ttl{font-size:8px;color:var(--muted);letter-spacing:.8px;margin-bottom:3px;}
  .gtip-ing{display:flex;justify-content:space-between;font-size:9px;padding:1px 0;}

  /* ── WEEK PLANNER ── */
  .week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;}
  .week-col{display:flex;flex-direction:column;gap:6px;}
  .week-day-hdr{text-align:center;font-size:10px;font-weight:700;font-family:var(--mono);color:var(--muted);padding:6px 4px;border-bottom:2px solid var(--border);}
  .week-day-hdr.today{color:var(--amber);border-bottom-color:var(--amber);}
  .week-meal-slot{background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:6px;min-height:52px;cursor:pointer;transition:border-color .15s;position:relative;}
  .week-meal-slot:hover{border-color:var(--amber);}
  .week-meal-slot.filled{border-color:var(--border);}
  .week-meal-type{font-size:8px;font-weight:700;font-family:var(--mono);color:var(--muted);letter-spacing:1px;margin-bottom:3px;}
  .week-meal-name{font-size:10px;font-weight:700;color:var(--text);line-height:1.2;}
  .week-meal-empty{font-size:9px;color:var(--muted);font-style:italic;}
  .week-meal-dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:4px;flex-shrink:0;}
  .week-nav{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
  .week-title{font-size:15px;font-weight:800;color:var(--text);flex:1;text-align:center;}

  /* ── RECIPE EDITOR ── */
  .edit-section{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:10px;}
  .edit-section-title{font-size:10px;font-weight:700;font-family:var(--mono);color:var(--muted);letter-spacing:1px;margin-bottom:8px;}
  .edit-ing-row{display:flex;gap:6px;align-items:center;margin-bottom:6px;}
  .edit-step-card{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:10px;margin-bottom:8px;}
  .edit-step-hdr{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .edit-step-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;font-family:var(--mono);flex-shrink:0;}
  .edit-label{font-size:10px;font-weight:700;color:var(--muted);font-family:var(--mono);margin-bottom:3px;display:block;}
  .edit-row{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;}
  .edit-field{display:flex;flex-direction:column;flex:1;min-width:80px;}
  .edit-check{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:var(--text);}
  .edit-check input{accent-color:var(--amber);width:14px;height:14px;}

  /* ── SHOP ── */
  .shop-section{margin-bottom:14px;}
  .shop-section-hdr{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:2px solid var(--border);margin-bottom:6px;}
  .shop-recipe-name{font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;color:var(--text);}
  .shop-item-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);}
  .shop-item-row:last-child{border-bottom:none;}
  .chk{width:15px;height:15px;border:1.5px solid var(--border);border-radius:3px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
  .chk.on{background:var(--green);border-color:var(--green);}

  /* ── COOKING MODE ── */
  .cook-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px;}
  .cook-card{background:var(--surface);border:2px solid var(--amber);border-radius:14px;width:100%;max-width:560px;padding:24px 28px;max-height:92vh;overflow-y:auto;}
  .cook-prog{height:3px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden;}
  .cook-prog-bar{height:100%;background:var(--amber);border-radius:2px;transition:width .5s;}
  .cook-step-num{font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin-bottom:5px;}
  .cook-recipe-lbl{font-size:11px;font-weight:700;margin-bottom:5px;}
  .cook-desc{font-size:18px;font-weight:800;line-height:1.3;margin-bottom:14px;}
  .cook-ing-panel{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:14px;}
  .cook-ing-ttl{font-size:9px;font-family:var(--mono);color:var(--muted);letter-spacing:1.5px;margin-bottom:8px;font-weight:700;}
  .cook-ing-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);}
  .cook-ing-row:last-child{border-bottom:none;}
  .cook-ing-name{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--text);}
  .cook-ing-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
  .cook-ing-amt{font-family:var(--mono);font-size:14px;font-weight:800;color:var(--amber);}
  .cook-timer-ring{position:relative;width:110px;height:110px;margin:0 auto 14px;}
  .cook-timer-svg{transform:rotate(-90deg);}
  .cook-timer-bg{fill:none;stroke:var(--border);stroke-width:5;}
  .cook-timer-fg{fill:none;stroke-width:5;stroke-linecap:round;transition:stroke-dashoffset .9s linear;}
  .cook-timer-txt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .cook-timer-num{font-size:22px;font-weight:800;font-family:var(--mono);}
  .cook-timer-unit{font-size:9px;color:var(--muted);font-family:var(--mono);}
  .cook-badges{display:flex;gap:6px;justify-content:center;margin-bottom:14px;flex-wrap:wrap;}
  .cook-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}
  .cook-next{background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:10px 12px;margin-top:14px;font-size:11px;}
  .cook-next-lbl{font-size:9px;color:var(--muted);font-family:var(--mono);letter-spacing:1px;margin-bottom:3px;}

  /* RECIPE LIST */
  .rec-item{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:8px;}

  /* STEP FLOW */
  .step-flow-item{display:flex;gap:0;position:relative;}
  .step-flow-left{display:flex;flex-direction:column;align-items:center;width:44px;flex-shrink:0;}
  .step-flow-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;font-family:var(--mono);flex-shrink:0;z-index:1;}
  .step-flow-line{width:2px;flex:1;min-height:12px;background:var(--border);}
  .step-flow-body{flex:1;padding:0 0 14px 4px;}
  .step-flow-header{display:flex;align-items:center;gap:8px;margin-bottom:5px;padding-top:3px;}
  .step-flow-title{font-weight:700;font-size:13px;color:var(--text);}
  .step-flow-meta{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:7px;}
  .step-flow-ings{background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:8px 10px;}
  .step-ing-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);}
  .step-ing-row:last-child{border-bottom:none;}
  .step-ing-name{font-size:11px;display:flex;align-items:center;gap:5px;color:var(--text);}
  .step-ing-amt{font-family:var(--mono);font-size:11px;font-weight:700;color:var(--amber);}
  .step-note{font-size:10px;color:var(--muted);font-style:italic;margin-top:5px;}

  /* ING TABLE */
  .ing-table{width:100%;border-collapse:collapse;font-size:12px;}
  .ing-table th{text-align:left;padding:5px 10px;font-size:9px;font-weight:700;color:var(--muted);font-family:var(--mono);letter-spacing:1px;border-bottom:1px solid var(--border);}
  .ing-table td{padding:7px 10px;border-bottom:1px solid rgba(128,128,100,.2);}
  .ing-table tr:last-child td{border-bottom:none;}
  .ing-amount{font-family:var(--mono);color:var(--amber);font-weight:700;}

  /* RECIPE TABS */
  .rtabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:16px;}
  .rtab{padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all .15s;margin-bottom:-1px;}
  .rtab:hover{color:var(--text);}
  .rtab.on{color:var(--amber);border-bottom-color:var(--amber);}

  /* MODAL */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
  .modal{background:var(--surface);border:1px solid var(--border);border-radius:10px;width:100%;max-width:520px;padding:24px;max-height:90vh;overflow-y:auto;}
  .modal-t{font-size:15px;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px;color:var(--text);}

  /* TOAST */
  .toast{position:fixed;bottom:20px;right:20px;z-index:999;background:var(--surface);border:1px solid var(--amber);border-radius:6px;padding:10px 16px;font-size:12px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,.15);max-width:300px;}

  .muted{color:var(--muted);}
  .sm{font-size:11px;}
  .mono{font-family:var(--mono);}
  .divider{border:none;border-top:1px solid var(--border);margin:12px 0;}

  @media(max-width:768px){
    .side{display:none;}
    .stats{grid-template-columns:repeat(2,1fr);}
    .week-grid{grid-template-columns:repeat(4,1fr);}
    .cook-card{padding:16px;}
  }
`;

// ── helpers ──────────────────────────────────────────────────
const t2m = t=>{const[h,m]=t.split(":").map(Number);return h*60+m;};
const m2t = m=>{const v=((m%1440)+1440)%1440;return`${String(Math.floor(v/60)).padStart(2,"0")}:${String(v%60).padStart(2,"0")}`;};
const fmtSec = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const uid = ()=>Math.random().toString(36).slice(2,8);
const DAYS = ["月","火","水","木","金","土","日"];
const MEAL_TYPES = ["朝食","昼食","夕食"];
const COLORS = ["#c87800","#1a7a50","#1a6fa8","#7c4dca","#d93030","#2a6b3c","#b35c00"];

// ── scheduler ────────────────────────────────────────────────
function buildSchedule(recipes,equipment,serveTime){
  const serveMin=t2m(serveTime),all=[];
  recipes.forEach((r,ri)=>(r.steps||[]).forEach(step=>{
    all.push({...step,gid:`${ri}_${step.id}`,recipeName:r.name,recipeColor:r.color||"#c87800",recipeIdx:ri,recipeId:r.id});
  }));
  const dep={};
  all.forEach(s=>{dep[s.gid]=(s.depends_on||[]).map(d=>`${s.recipeIdx}_${d}`);});
  const vis=new Set(),order=[];
  function visit(gid){if(vis.has(gid))return;vis.add(gid);(dep[gid]||[]).forEach(visit);order.push(gid);}
  all.forEach(s=>visit(s.gid));
  const byGid=Object.fromEntries(all.map(s=>[s.gid,s]));
  const endT={},startT={};
  [...order].reverse().forEach(gid=>{
    const step=byGid[gid],succs=all.filter(s=>(dep[s.gid]||[]).includes(gid));
    let le=serveMin;
    if(succs.length)le=Math.min(...succs.map(s=>startT[s.gid]??serveMin));
    endT[gid]=le;startT[gid]=le-step.duration_min;
  });
  const equipSlots={};
  Object.keys(equipment).forEach(k=>{equipSlots[k]=[];});
  [...order].sort((a,b)=>startT[a]-startT[b]).forEach(gid=>{
    const step=byGid[gid];
    (step.requires_equipment||[]).forEach(eq=>{
      const maxC=equipment[eq]||1,slots=equipSlots[eq]||[];
      let ok=false,tries=0;
      while(!ok&&tries<60){
        const ov=slots.filter(s=>s.end>startT[gid]&&s.start<endT[gid]);
        if(ov.length<maxC)ok=true;else{startT[gid]-=1;endT[gid]-=1;}
        tries++;
      }
      slots.push({start:startT[gid],end:endT[gid],gid});
      equipSlots[eq]=slots;
    });
  });
  return all.map(s=>({...s,start:m2t(startT[s.gid]),end:m2t(endT[s.gid]),startMin:startT[s.gid],endMin:endT[s.gid]}));
}

// ── TEMPLATES ────────────────────────────────────────────────
const TEMPLATES = {
  curry:{name:"チキンカレー",category:"メイン",color:"#c87800",
    ingredients:[{name:"鶏もも肉",amount:"400g"},{name:"玉ねぎ",amount:"2個"},{name:"にんじん",amount:"1本"},{name:"じゃがいも",amount:"2個"},{name:"カレールー",amount:"1箱"},{name:"水",amount:"800ml"},{name:"サラダ油",amount:"大さじ1"},{name:"塩・胡椒",amount:"適量"}],
    steps:[
      {id:1,description:"玉ねぎをみじん切り",duration_min:5,requires_equipment:[],hands_on:true,depends_on:[],ingredients:[{name:"玉ねぎ",amount:"2個"}],note:"繊維を断つように切ると早く炒まる"},
      {id:2,description:"玉ねぎを飴色に炒める",duration_min:15,requires_equipment:["stove"],hands_on:false,depends_on:[1],ingredients:[{name:"サラダ油",amount:"大さじ1"}],note:"中火でじっくり。焦げないよう時々混ぜる"},
      {id:3,description:"鶏肉・野菜を切る",duration_min:10,requires_equipment:[],hands_on:true,depends_on:[],ingredients:[{name:"鶏もも肉",amount:"400g"},{name:"にんじん",amount:"1本"},{name:"じゃがいも",amount:"2個"}],note:"じゃがいもは水にさらしてアク抜き"},
      {id:4,description:"鶏肉を炒める",duration_min:5,requires_equipment:["stove"],hands_on:true,depends_on:[2,3],ingredients:[{name:"塩・胡椒",amount:"少々"}],note:"表面に焼き色がつく程度でOK"},
      {id:5,description:"水を加えて煮込む",duration_min:20,requires_equipment:["stove"],hands_on:false,depends_on:[4],ingredients:[{name:"水",amount:"800ml"}],note:"沸騰したらアクを取り弱火に"},
      {id:6,description:"ルーを溶かして仕上げ",duration_min:5,requires_equipment:["stove"],hands_on:true,depends_on:[5],ingredients:[{name:"カレールー",amount:"1箱"}],note:"火を止めてからルーを入れ溶かす"},
    ]},
  salad:{name:"シーザーサラダ",category:"前菜",color:"#1a7a50",
    ingredients:[{name:"ロメインレタス",amount:"1玉"},{name:"ベーコン",amount:"100g"},{name:"クルトン",amount:"20g"},{name:"パルメザンチーズ",amount:"30g"},{name:"シーザードレッシング",amount:"大さじ3"}],
    steps:[
      {id:1,description:"レタスを洗って乾かす",duration_min:5,requires_equipment:[],hands_on:true,depends_on:[],ingredients:[{name:"ロメインレタス",amount:"1玉"}],note:"スピナーで水気をしっかり切る"},
      {id:2,description:"ベーコンを炒める",duration_min:5,requires_equipment:["stove"],hands_on:true,depends_on:[],ingredients:[{name:"ベーコン",amount:"100g"}],note:"カリカリになるまで弱〜中火"},
      {id:3,description:"盛り付け・ドレッシング",duration_min:3,requires_equipment:[],hands_on:true,depends_on:[1,2],ingredients:[{name:"クルトン",amount:"20g"},{name:"パルメザンチーズ",amount:"30g"},{name:"シーザードレッシング",amount:"大さじ3"}],note:"食べる直前に和えること"},
    ]},
  soup:{name:"コーンスープ",category:"スープ",color:"#1a6fa8",
    ingredients:[{name:"コーン缶",amount:"1缶"},{name:"牛乳",amount:"400ml"},{name:"バター",amount:"20g"},{name:"コンソメ",amount:"1個"},{name:"塩・胡椒",amount:"適量"}],
    steps:[
      {id:1,description:"コーンをミキサー撹拌",duration_min:3,requires_equipment:["microwave"],hands_on:true,depends_on:[],ingredients:[{name:"コーン缶",amount:"1缶"}],note:"缶汁も半量入れると旨味が出る"},
      {id:2,description:"バターでコーンを炒める",duration_min:3,requires_equipment:["stove"],hands_on:true,depends_on:[1],ingredients:[{name:"バター",amount:"20g"}],note:"バターが焦げないよう中火で"},
      {id:3,description:"牛乳を加えて温める",duration_min:8,requires_equipment:["stove"],hands_on:false,depends_on:[2],ingredients:[{name:"牛乳",amount:"400ml"},{name:"コンソメ",amount:"1個"},{name:"塩・胡椒",amount:"適量"}],note:"沸騰させないよう弱火でゆっくり"},
    ]},
};

const EQUIP_META={stove:{icon:"🔥",label:"コンロ"},oven:{icon:"🫙",label:"オーブン"},microwave:{icon:"📡",label:"電子レンジ"},mixer:{icon:"🌀",label:"ミキサー"}};

// ── 週間プラン初期値 ─────────────────────────────────────────
const makeEmptyWeek = () => DAYS.map(d=>({day:d, meals:{朝食:null,昼食:null,夕食:null}}));

// ════════════════════════════════════════════════════════════
export default function KitchenOS() {
  const [themeName,setThemeName] = useState("dark");
  const theme = THEMES[themeName];

  const [tab,setTab]           = useState("dashboard");
  const [recipes,setRecipes]   = useState([
    {...TEMPLATES.salad,id:"r1"},
    {...TEMPLATES.curry,id:"r2"},
    {...TEMPLATES.soup, id:"r3"},
  ]);
  const [equip,setEquip]       = useState({stove:2,oven:1,microwave:1});
  const [serveTime,setServe]   = useState("18:00");
  const [schedule,setSched]    = useState(null);
  const [toast,setToast]       = useState(null);

  // Week planner
  const [weekPlan,setWeekPlan] = useState(makeEmptyWeek());
  const [mealPickTarget,setMealPickTarget] = useState(null); // {dayIdx, mealType}
  const [shopDay,setShopDay]   = useState(null); // null=全体, 0-6=曜日

  // Recipe detail/edit
  const [detailId,setDetailId] = useState(null);
  const [detailView,setDetailView] = useState("flow");
  const [editMode,setEditMode] = useState(false);
  const [editRecipe,setEditRecipe] = useState(null); // deep copy for editing

  // Cooking mode
  const [cookMode,setCook]   = useState(false);
  const [cookIdx,setCookIdx] = useState(0);
  const [secLeft,setSecLeft] = useState(0);
  const [running,setRunning] = useState(false);
  const timerRef             = useRef(null);
  const [tip,setTip]         = useState(null);

  const [checked,setChecked] = useState({});

  const sortedSched = schedule?[...schedule].sort((a,b)=>a.startMin-b.startMin):[];
  const showToast = useCallback(msg=>{setToast(msg);setTimeout(()=>setToast(null),2800);},[]);
  const css = makeCSS(theme);

  // ── schedule ──
  const genSchedule=()=>{
    if(!recipes.length){showToast("⚠ レシピを追加してください");return;}
    setSched(buildSchedule(recipes,equip,serveTime));
    setTab("schedule");showToast("✓ スケジュール生成完了");
  };

  // ── cooking mode ──
  const startCook=()=>{
    if(!schedule){showToast("⚠ まずスケジュールを生成");return;}
    setCookIdx(0);setSecLeft((sortedSched[0]?.duration_min||0)*60);setRunning(false);setCook(true);
  };
  useEffect(()=>{
    if(timerRef.current)clearInterval(timerRef.current);
    if(running&&cookMode){
      timerRef.current=setInterval(()=>{
        setSecLeft(s=>{if(s<=1){clearInterval(timerRef.current);setRunning(false);showToast("⏱ タイマー終了！");return 0;}return s-1;});
      },1000);
    }
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[running,cookMode,showToast]);

  const cookStep=sortedSched[cookIdx];
  const totalSec=cookStep?cookStep.duration_min*60:1;
  const dashCirc=2*Math.PI*42;
  const dashOff=dashCirc*(1-(totalSec-secLeft)/totalSec);
  const goNext=()=>{
    if(timerRef.current)clearInterval(timerRef.current);setRunning(false);
    const ni=cookIdx+1;
    if(ni>=sortedSched.length){setCook(false);showToast("🎉 全工程完了！");return;}
    setCookIdx(ni);setSecLeft(sortedSched[ni].duration_min*60);
  };
  const goPrev=()=>{
    if(timerRef.current)clearInterval(timerRef.current);setRunning(false);
    const pi=Math.max(0,cookIdx-1);setCookIdx(pi);setSecLeft(sortedSched[pi].duration_min*60);
  };

  // ── recipe detail open ──
  const openDetail=(id)=>{
    setDetailId(id);setDetailView("flow");setEditMode(false);setTab("recipe-detail");
  };

  // ── recipe edit helpers ──
  const startEdit=()=>{
    const r=recipes.find(r=>r.id===detailId);
    setEditRecipe(JSON.parse(JSON.stringify(r)));
    setEditMode(true);
  };
  const saveEdit=()=>{
    setRecipes(p=>p.map(r=>r.id===editRecipe.id?editRecipe:r));
    setEditMode(false);showToast("✓ レシピを保存しました");
  };
  const cancelEdit=()=>{setEditMode(false);};

  // edit helpers for editRecipe
  const setER=(fn)=>setEditRecipe(prev=>fn({...prev}));

  // ── week planner ──
  const setMeal=(dayIdx,mealType,recipe)=>{
    setWeekPlan(p=>{
      const np=[...p];
      np[dayIdx]={...np[dayIdx],meals:{...np[dayIdx].meals,[mealType]:recipe?{id:recipe.id,name:recipe.name,color:recipe.color}:null}};
      return np;
    });
    setMealPickTarget(null);
  };

  // ── shop list from week ──
  const getShopList=(dayIdxFilter=null)=>{
    const m={};
    weekPlan.forEach((dayObj,di)=>{
      if(dayIdxFilter!=null&&di!==dayIdxFilter)return;
      MEAL_TYPES.forEach(mt=>{
        const meal=dayObj.meals[mt];
        if(!meal)return;
        const recipe=recipes.find(r=>r.id===meal.id);
        if(!recipe)return;
        (recipe.ingredients||[]).forEach(ing=>{
          const key=`${recipe.id}_${ing.name}`;
          if(!m[key])m[key]={name:ing.name,amount:ing.amount,recipeName:recipe.name,recipeColor:recipe.color,key};
        });
      });
    });
    return Object.values(m);
  };

  // ── gantt ──
  const renderGantt=(highlight=null)=>{
    if(!schedule||!schedule.length)return null;
    const minS=Math.min(...schedule.map(s=>s.startMin));
    const maxE=Math.max(...schedule.map(s=>s.endMin));
    const total=maxE-minS;
    const interval=total<=60?10:total<=180?15:30;
    const marks=[];for(let m=minS;m<=maxE;m+=interval)marks.push(m);
    if(marks[marks.length-1]!==maxE)marks.push(maxE);
    const doneGids=new Set(sortedSched.slice(0,highlight??0).map(s=>s.gid));
    const recipeSet=[];
    schedule.forEach(s=>{if(!recipeSet.find(r=>r.name===s.recipeName))recipeSet.push({name:s.recipeName,color:s.recipeColor});});
    const pct=v=>`${((v-minS)/total*100).toFixed(2)}%`;
    const onEnter=(e,step)=>{const r=e.currentTarget.getBoundingClientRect();setTip({step,x:r.left+r.width/2,y:r.top-8});};
    const onLeave=()=>setTip(null);
    const onTap=(e,step)=>{e.stopPropagation();setTip(t=>t?.step?.gid===step.gid?null:{step,x:e.clientX,y:e.clientY-8});};
    return(
      <div className="gantt-wrap" onClick={()=>setTip(null)}>
        <div className="gantt-legend-row">
          {recipeSet.map(r=><div key={r.name} className="gantt-legend-item"><div className="gantt-legend-dot" style={{background:r.color}}/>{r.name}</div>)}
          <div style={{marginLeft:"auto",display:"flex",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"var(--muted)"}}><div style={{width:9,height:9,borderRadius:2,background:"var(--amber)"}}/> 要注意</div>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"var(--muted)"}}><div style={{width:9,height:9,borderRadius:2,background:"var(--green)"}}/> 放置可</div>
          </div>
        </div>
        <div style={{width:"100%"}}>
          <div className="gantt-axis">{marks.map(m=><div key={m}><div className="gantt-axis-tick" style={{left:pct(m)}}/><div className="gantt-axis-mark" style={{left:pct(m)}}>{m2t(m)}</div></div>)}</div>
          {schedule.map(step=>{
            const lp=((step.startMin-minS)/total*100).toFixed(2);
            const wp=(step.duration_min/total*100).toFixed(2);
            const bw=parseFloat(wp);
            return(
              <div key={step.gid} className="gantt-row2">
                <div className="gantt-bg2">{marks.map(m=><div key={m} className="gantt-gl" style={{left:pct(m)}}/>)}</div>
                <div className={`gbar3 ${step.hands_on?"ho":"ps"} ${highlight!=null&&sortedSched[highlight]?.gid===step.gid?"act3":""} ${doneGids.has(step.gid)?"done3":""}`}
                  style={{left:`${lp}%`,width:`${Math.max(bw,0.8)}%`}}
                  onMouseEnter={e=>onEnter(e,step)} onMouseLeave={onLeave} onClick={e=>onTap(e,step)}>
                  {bw>1&&<div className="gbar3-dot" style={{background:step.recipeColor}}/>}
                  {bw>7&&<span className="gbar3-txt">{step.description}</span>}
                  {bw>11&&<span className="gbar3-m">{step.duration_min}m</span>}
                </div>
              </div>
            );
          })}
          {schedule.length>5&&<div className="gantt-axis" style={{marginTop:3}}>{marks.map(m=><div key={m}><div className="gantt-axis-tick" style={{left:pct(m)}}/><div className="gantt-axis-mark" style={{left:pct(m)}}>{m2t(m)}</div></div>)}</div>}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // TAB: Dashboard
  // ════════════════════════════════════════════════════════════
  const tabDash=()=>(
    <div>
      <div style={{marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:3,color:"var(--text)"}}>ダッシュボード</div>
          <div className="muted sm">料理をプロジェクト管理として扱う</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <input type="time" className="inp" style={{width:120}} value={serveTime} onChange={e=>setServe(e.target.value)}/>
          <button className="btn b-amber" onClick={genSchedule}>⚡ スケジュール生成</button>
          {schedule&&<button className="btn b-purple" onClick={startCook}>🔴 調理モード</button>}
        </div>
      </div>
      <div className="stats">
        {[{n:recipes.length,l:"レシピ数"},{n:recipes.reduce((s,r)=>s+(r.steps?.length||0),0),l:"総工程数"},{n:recipes.reduce((s,r)=>s+(r.steps?.reduce((a,st)=>a+st.duration_min,0)||0),0),l:"合計調理時間(分)"},{n:weekPlan.reduce((s,d)=>s+MEAL_TYPES.filter(m=>d.meals[m]).length,0),l:"今週の予定食数"}].map((x,i)=>(
          <div key={i} className="stat"><div className="stat-n">{x.n}</div><div className="stat-l">{x.l}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="ch">
          <div className="ct">🍽 レシピライブラリ</div>
          <div style={{display:"flex",gap:6}}>
            {Object.entries(TEMPLATES).map(([k,t])=>(
              <button key={k} className="btn b-ghost b-sm" onClick={()=>{setRecipes(p=>[...p,{...t,id:`r_${uid()}`,color:COLORS[p.length%COLORS.length]}]);showToast("✓ "+t.name+"を追加");}}>+ {t.name}</button>
            ))}
          </div>
        </div>
        {!recipes.length&&<div style={{textAlign:"center",padding:"32px 0",color:"var(--muted)"}}>レシピを追加してください</div>}
        {recipes.map(r=>(
          <div key={r.id} className="rec-item">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:r.color}}/>
                <span style={{fontWeight:700,fontSize:13,color:"var(--text)"}}>{r.name}</span>
                <span className={`tag ${r.category==="メイン"?"t-amber":r.category==="前菜"?"t-green":"t-blue"}`}>{r.category}</span>
                <span className="tag t-muted">{(r.ingredients||[]).length}種</span>
                <span className="tag t-muted">{(r.steps||[]).length}工程</span>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button className="btn b-ghost b-sm" onClick={()=>openDetail(r.id)}>📋 詳細・編集</button>
                <button className="btn b-red b-sm" onClick={()=>setRecipes(p=>p.filter(x=>x.id!==r.id))}>削除</button>
              </div>
            </div>
            <div style={{marginTop:8,display:"flex",gap:4,flexWrap:"wrap"}}>
              {(r.steps||[]).map(s=>(
                <span key={s.id} className={`tag ${s.hands_on?"t-amber":"t-muted"}`} title={`工程${s.id}: ${s.description}${(s.ingredients||[]).length>0?" ["+s.ingredients.map(i=>i.name).join(",")+"]":""}`}>
                  {s.id}. {s.description.slice(0,8)}{s.description.length>8?"…":""} {s.duration_min}m
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {schedule&&(
        <div className="card" style={{borderColor:"var(--green)"}}>
          <div className="ch">
            <div className="ct" style={{color:"var(--green)"}}>✓ スケジュール生成済み</div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn b-ghost b-sm" onClick={()=>setTab("schedule")}>詳細 →</button>
              <button className="btn b-purple b-sm" onClick={startCook}>🔴 調理開始</button>
            </div>
          </div>
          <div className="sm muted">開始: {sortedSched[0]?.start} ／ 提供: {serveTime} ／ {schedule.length}工程</div>
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // TAB: Week Planner
  // ════════════════════════════════════════════════════════════
  const tabWeek=()=>(
    <div>
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:3,color:"var(--text)"}}>週間メニュープランナー</div>
          <div className="muted sm">食事枠をクリックしてレシピを割り当て　→　🛒 で買い物リストへ</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn b-ghost b-sm" onClick={()=>setWeekPlan(makeEmptyWeek())}>クリア</button>
          <button className="btn b-amber" onClick={()=>{setShopDay(null);setTab("shopping");}}>🛒 今週まとめて買う</button>
        </div>
      </div>

      <div className="week-grid">
        {weekPlan.map((dayObj,di)=>{
          const hasMeals=MEAL_TYPES.some(m=>dayObj.meals[m]);
          return(
          <div key={di} className="week-col">
            {/* 曜日ヘッダー + 買い物ボタン */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,paddingBottom:6,borderBottom:`2px solid ${di===new Date().getDay()-1?"var(--amber)":"var(--border)"}`}}>
              <div style={{fontSize:13,fontWeight:800,fontFamily:"var(--mono)",color:di===new Date().getDay()-1?"var(--amber)":"var(--muted)"}}>{dayObj.day}</div>
              <button
                style={{fontSize:9,padding:"3px 6px",borderRadius:4,border:`1px solid ${hasMeals?"var(--amber)":"var(--border)"}`,background:hasMeals?"rgba(180,100,0,.1)":"transparent",color:hasMeals?"var(--amber)":"var(--muted)",cursor:hasMeals?"pointer":"default",fontFamily:"var(--mono)",fontWeight:700,width:"100%",transition:"all .15s"}}
                onClick={()=>{if(hasMeals){setShopDay(di);setTab("shopping");}}}
                title={hasMeals?`${dayObj.day}曜の買い物リストを見る`:"メニュー未登録"}
              >
                {hasMeals?"🛒 買い物":"—"}
              </button>
            </div>
            {MEAL_TYPES.map(mt=>{
              const meal=dayObj.meals[mt];
              return(
                <div key={mt} className={`week-meal-slot ${meal?"filled":""}`}
                  onClick={()=>setMealPickTarget({dayIdx:di,mealType:mt})}
                  style={{borderColor:meal?meal.color:undefined}}>
                  <div className="week-meal-type">{mt}</div>
                  {meal
                    ?<div className="week-meal-name"><span className="week-meal-dot" style={{background:meal.color}}/>{meal.name}</div>
                    :<div className="week-meal-empty">+ 追加</div>
                  }
                  {meal&&(
                    <div style={{marginTop:4,display:"flex",gap:4,justifyContent:"flex-end"}}>
                      <span style={{fontSize:9,color:"var(--muted)",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setMeal(di,mt,null);}}>✕</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          );
        })}
      </div>

      {/* 週全体のサマリ */}
      <div className="card" style={{marginTop:16}}>
        <div className="ch"><div className="ct">📊 今週のサマリ</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
          {recipes.map(r=>{
            const cnt=weekPlan.reduce((s,d)=>s+MEAL_TYPES.filter(m=>d.meals[m]?.id===r.id).length,0);
            if(!cnt)return null;
            return(
              <div key={r.id} style={{background:"var(--surface2)",border:`1px solid ${r.color}`,borderRadius:6,padding:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:r.color}}/>
                  <span style={{fontSize:11,fontWeight:700,color:"var(--text)"}}>{r.name}</span>
                </div>
                <div style={{fontSize:20,fontWeight:800,fontFamily:"var(--mono)",color:r.color}}>{cnt}回</div>
              </div>
            );
          }).filter(Boolean)}
          {weekPlan.every(d=>MEAL_TYPES.every(m=>!d.meals[m]))&&(
            <div className="muted sm" style={{gridColumn:"1/-1",textAlign:"center",padding:"20px 0"}}>メニューが登録されていません</div>
          )}
        </div>
      </div>

      {/* Meal picker modal */}
      {mealPickTarget&&(
        <div className="overlay" onClick={()=>setMealPickTarget(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-t">
              {weekPlan[mealPickTarget.dayIdx].day}曜 {mealPickTarget.mealType} のレシピを選ぶ
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {recipes.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer"}}
                  onClick={()=>setMeal(mealPickTarget.dayIdx,mealPickTarget.mealType,r)}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:r.color}}/>
                    <span style={{fontWeight:700,fontSize:13,color:"var(--text)"}}>{r.name}</span>
                    <span className={`tag ${r.category==="メイン"?"t-amber":r.category==="前菜"?"t-green":"t-blue"}`}>{r.category}</span>
                  </div>
                  <span className="tag t-muted">{(r.steps||[]).reduce((s,st)=>s+st.duration_min,0)}分</span>
                </div>
              ))}
              {weekPlan[mealPickTarget.dayIdx].meals[mealPickTarget.mealType]&&(
                <button className="btn b-red w100" onClick={()=>setMeal(mealPickTarget.dayIdx,mealPickTarget.mealType,null)}>✕ 削除</button>
              )}
              <button className="btn b-ghost w100" onClick={()=>setMealPickTarget(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // TAB: Shopping
  // ════════════════════════════════════════════════════════════
  const tabShop=()=>{
    const list=getShopList(shopDay);
    const byRecipe={};
    list.forEach(item=>{
      if(!byRecipe[item.recipeName])byRecipe[item.recipeName]={color:item.recipeColor,items:[]};
      byRecipe[item.recipeName].items.push(item);
    });
    return(
      <div>
        <div style={{marginBottom:4,color:"var(--text)"}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:3}}>買い物リスト</div>
        </div>

        {/* 日付セレクター — 目立つタブ形式 */}
        <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          {/* 週全体ボタン */}
          <button
            onClick={()=>setShopDay(null)}
            style={{
              padding:"8px 14px",borderRadius:6,border:"none",cursor:"pointer",
              fontFamily:"var(--mono)",fontSize:11,fontWeight:700,transition:"all .15s",
              background:shopDay==null?"var(--amber)":"var(--surface2)",
              color:shopDay==null?"#fff":"var(--muted)",
              boxShadow:shopDay==null?"0 2px 8px rgba(0,0,0,.15)":"none",
            }}>
            📋 週全体
          </button>
          <div style={{width:1,height:28,background:"var(--border)",margin:"0 4px"}}/>
          {/* 曜日ボタン */}
          {weekPlan.map((dayObj,i)=>{
            const hasMeals=MEAL_TYPES.some(m=>dayObj.meals[m]);
            const isToday=i===new Date().getDay()-1;
            const isSelected=shopDay===i;
            return(
              <button key={i}
                onClick={()=>setShopDay(isSelected?null:i)}
                disabled={!hasMeals}
                style={{
                  padding:"8px 12px",borderRadius:6,cursor:hasMeals?"pointer":"not-allowed",
                  fontFamily:"var(--mono)",fontSize:11,fontWeight:700,transition:"all .15s",
                  border:`1px solid ${isSelected?"var(--amber)":isToday?"var(--amber)":"var(--border)"}`,
                  background:isSelected?"var(--amber)":hasMeals?"var(--surface2)":"transparent",
                  color:isSelected?"#fff":hasMeals?"var(--text)":"var(--muted)",
                  opacity:hasMeals?1:0.4,
                  position:"relative",
                  boxShadow:isSelected?"0 2px 8px rgba(0,0,0,.15)":"none",
                }}>
                {dayObj.day}
                {isToday&&!isSelected&&<span style={{position:"absolute",top:-3,right:-3,width:7,height:7,borderRadius:"50%",background:"var(--amber)",border:"1.5px solid var(--bg)"}}/>}
                {hasMeals&&!isSelected&&<span style={{display:"block",fontSize:8,color:"var(--muted)",marginTop:1,fontWeight:400}}>{MEAL_TYPES.filter(m=>dayObj.meals[m]).length}食</span>}
              </button>
            );
          })}
          <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center"}}>
            <span className="muted sm">{list.length}種類</span>
            <button className="btn b-ghost b-sm" onClick={()=>setChecked({})}>チェックリセット</button>
          </div>
        </div>

        {/* 選択中ラベル */}
        <div style={{marginBottom:12,fontSize:13,fontWeight:700,color:"var(--text)"}}>
          {shopDay!=null
            ?<span>📅 <span style={{color:"var(--amber)"}}>{weekPlan[shopDay].day}曜日</span> の買い物リスト</span>
            :<span>📋 今週まとめ買いリスト</span>
          }
        </div>

        {!list.length?(
          <div className="card" style={{textAlign:"center",padding:"40px 0",color:"var(--muted)"}}>
            {shopDay!=null?"この日はメニューが登録されていません":"週間プランにメニューを登録すると買い物リストが生成されます"}
            <div style={{marginTop:12}}><button className="btn b-amber" onClick={()=>setTab("week")}>📅 週間プランへ</button></div>
          </div>
        ):Object.entries(byRecipe).map(([rname,{color,items}])=>(
          <div key={rname} className="card" style={{borderLeft:`3px solid ${color}`,paddingLeft:14,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:8,borderBottom:"1px solid var(--border)",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:7,fontWeight:700,fontSize:12,color:"var(--text)"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
                {rname}
              </div>
              <span className="tag t-muted">{items.length}種</span>
            </div>
            {items.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div className={`chk ${checked[item.key]?"on":""}`} onClick={()=>setChecked(c=>({...c,[item.key]:!c[item.key]}))}>
                    {checked[item.key]&&<span style={{fontSize:9,color:"#000",fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{textDecoration:checked[item.key]?"line-through":"none",color:checked[item.key]?"var(--muted)":"var(--text)",fontWeight:600,fontSize:12}}>{item.name}</span>
                </div>
                <span style={{fontFamily:"var(--mono)",color:"var(--amber)",fontWeight:700,fontSize:12}}>{item.amount}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // TAB: Schedule
  // ════════════════════════════════════════════════════════════
  const tabSched=()=>(
    <div>
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:3,color:"var(--text)"}}>調理スケジュール</div>
          <div className="muted sm">バーをタップ → 工程詳細・投入食材を確認</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn b-amber" onClick={genSchedule}>⚡ 再生成</button>
          {schedule&&<button className="btn b-purple" onClick={startCook}>🔴 調理モード</button>}
        </div>
      </div>
      {!schedule?(
        <div className="card" style={{textAlign:"center",padding:"50px 0"}}>
          <div style={{fontSize:36,marginBottom:10}}>📋</div>
          <div style={{marginBottom:14,color:"var(--muted)"}}>スケジュール未生成</div>
          <button className="btn b-amber" onClick={genSchedule}>⚡ 今すぐ生成</button>
        </div>
      ):(
        <>
          <div className="card">
            <div className="ch"><div className="ct">ガントチャート</div><span className="tag t-green">提供 {serveTime}</span></div>
            {renderGantt()}
          </div>
          <div className="card">
            <div className="ch"><div className="ct">工程一覧</div></div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"var(--mono)"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid var(--border)",color:"var(--muted)"}}>
                    {["料理","工程","開始","終了","時間","タイプ","投入食材"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:"left",fontWeight:700}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {sortedSched.map(s=>(
                    <tr key={s.gid} style={{borderBottom:"1px solid var(--border)"}}>
                      <td style={{padding:"6px 8px"}}><span style={{color:s.recipeColor,fontWeight:700}}>{s.recipeName}</span></td>
                      <td style={{padding:"6px 8px",color:"var(--text)"}}>{s.description}</td>
                      <td style={{padding:"6px 8px",color:"var(--amber)"}}>{s.start}</td>
                      <td style={{padding:"6px 8px",color:"var(--muted)"}}>{s.end}</td>
                      <td style={{padding:"6px 8px"}}>{s.duration_min}m</td>
                      <td style={{padding:"6px 8px"}}><span className={`tag ${s.hands_on?"t-amber":"t-muted"}`}>{s.hands_on?"要注意":"放置可"}</span></td>
                      <td style={{padding:"6px 8px"}}>
                        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                          {(s.ingredients||[]).length>0?(s.ingredients||[]).map((ing,i)=><span key={i} className="tag t-muted">{ing.name} {ing.amount}</span>):<span style={{color:"var(--muted)"}}>—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // TAB: Recipe Detail + Edit
  // ════════════════════════════════════════════════════════════
  const tabRecipeDetail=()=>{
    const recipe=editMode?editRecipe:recipes.find(r=>r.id===detailId);
    if(!recipe)return null;
    return(
      <div>
        <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <button className="btn b-ghost b-sm" onClick={()=>setTab("dashboard")}>← 戻る</button>
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
            <div style={{width:11,height:11,borderRadius:"50%",background:recipe.color}}/>
            <span style={{fontSize:18,fontWeight:800,color:"var(--text)"}}>{editMode?editRecipe.name:recipe.name}</span>
            <span className={`tag ${recipe.category==="メイン"?"t-amber":recipe.category==="前菜"?"t-green":"t-blue"}`}>{recipe.category}</span>
          </div>
          {!editMode
            ?<button className="btn b-amber" onClick={startEdit}>✏️ 編集</button>
            :<div style={{display:"flex",gap:6}}>
              <button className="btn b-green" onClick={saveEdit}>✓ 保存</button>
              <button className="btn b-ghost" onClick={cancelEdit}>キャンセル</button>
            </div>
          }
        </div>

        {/* ── VIEW MODE ── */}
        {!editMode&&(
          <>
            <div className="rtabs">
              <div className={`rtab ${detailView==="flow"?"on":""}`} onClick={()=>setDetailView("flow")}>🔗 工程フロー</div>
              <div className={`rtab ${detailView==="ingredients"?"on":""}`} onClick={()=>setDetailView("ingredients")}>🧅 全体材料</div>
            </div>
            {detailView==="flow"&&(
              <div>
                {(recipe.steps||[]).map((step,idx)=>{
                  const isLast=idx===recipe.steps.length-1;
                  const c=step.hands_on?"var(--amber)":"var(--green)";
                  return(
                    <div key={step.id} className="step-flow-item">
                      <div className="step-flow-left">
                        <div className="step-flow-num" style={{background:`${step.hands_on?"rgba(180,100,0,.15)":"rgba(30,120,70,.12)"}`,color:c,border:`1.5px solid ${c}`}}>{step.id}</div>
                        {!isLast&&<div className="step-flow-line"/>}
                      </div>
                      <div className="step-flow-body">
                        <div className="step-flow-header"><span className="step-flow-title">{step.description}</span></div>
                        <div className="step-flow-meta">
                          <span className="tag t-muted">{step.duration_min}分</span>
                          <span className={`tag ${step.hands_on?"t-amber":"t-green"}`}>{step.hands_on?"⚠ 要注意":"✓ 放置可"}</span>
                          {(step.requires_equipment||[]).map(e=><span key={e} className="tag t-blue">{EQUIP_META[e]?.icon} {EQUIP_META[e]?.label}</span>)}
                          {(step.depends_on||[]).length>0&&<span className="tag t-muted">工程{step.depends_on.join("・")}の後</span>}
                        </div>
                        {(step.ingredients||[]).length>0?(
                          <div className="step-flow-ings">
                            <div style={{fontSize:9,color:"var(--muted)",fontFamily:"var(--mono)",letterSpacing:"1px",marginBottom:5,fontWeight:700}}>📦 この工程で投入する食材</div>
                            {step.ingredients.map((ing,i)=>(
                              <div key={i} className="step-ing-row">
                                <div className="step-ing-name"><div style={{width:5,height:5,borderRadius:"50%",background:recipe.color}}/>{ing.name}</div>
                                <div className="step-ing-amt">{ing.amount}</div>
                              </div>
                            ))}
                          </div>
                        ):(
                          <div className="step-flow-ings"><div style={{fontSize:10,color:"var(--muted)"}}>食材投入なし（前工程から続く）</div></div>
                        )}
                        {step.note&&<div className="step-note">💡 {step.note}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {detailView==="ingredients"&&(
              <div className="card">
                <div className="ch"><div className="ct">🧅 全体材料一覧</div><span className="tag t-muted">{(recipe.ingredients||[]).length}種類</span></div>
                <table className="ing-table">
                  <thead><tr><th>食材名</th><th>全体量</th></tr></thead>
                  <tbody>
                    {(recipe.ingredients||[]).map((ing,i)=>(
                      <tr key={i}>
                        <td><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:7,height:7,borderRadius:"50%",background:recipe.color}}/><span style={{fontWeight:600,color:"var(--text)"}}>{ing.name}</span></div></td>
                        <td><span className="ing-amount">{ing.amount}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── EDIT MODE ── */}
        {editMode&&editRecipe&&(
          <div>
            {/* 基本情報 */}
            <div className="edit-section">
              <div className="edit-section-title">基本情報</div>
              <div className="edit-row">
                <div className="edit-field">
                  <label className="edit-label">料理名</label>
                  <input className="inp" value={editRecipe.name} onChange={e=>setER(r=>({...r,name:e.target.value}))}/>
                </div>
                <div className="edit-field" style={{minWidth:100,maxWidth:130}}>
                  <label className="edit-label">カテゴリ</label>
                  <select className="sel" value={editRecipe.category} onChange={e=>setER(r=>({...r,category:e.target.value}))}>
                    {["前菜","スープ","メイン","デザート"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="edit-field" style={{minWidth:80,maxWidth:100}}>
                  <label className="edit-label">カラー</label>
                  <input type="color" style={{height:36,width:"100%",padding:2,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",cursor:"pointer"}} value={editRecipe.color} onChange={e=>setER(r=>({...r,color:e.target.value}))}/>
                </div>
              </div>
            </div>

            {/* 材料 */}
            <div className="edit-section">
              <div className="edit-section-title">全体材料</div>
              {(editRecipe.ingredients||[]).map((ing,i)=>(
                <div key={i} className="edit-ing-row">
                  <input className="inp" style={{flex:2}} placeholder="食材名" value={ing.name} onChange={e=>setER(r=>{const ings=[...r.ingredients];ings[i]={...ings[i],name:e.target.value};return{...r,ingredients:ings};})}/>
                  <input className="inp" style={{flex:1}} placeholder="分量" value={ing.amount} onChange={e=>setER(r=>{const ings=[...r.ingredients];ings[i]={...ings[i],amount:e.target.value};return{...r,ingredients:ings};})}/>
                  <button className="btn b-red b-sm" onClick={()=>setER(r=>({...r,ingredients:r.ingredients.filter((_,j)=>j!==i)}))}>✕</button>
                </div>
              ))}
              <button className="btn b-ghost b-sm" onClick={()=>setER(r=>({...r,ingredients:[...(r.ingredients||[]),{name:"",amount:""}]}))}>+ 材料を追加</button>
            </div>

            {/* 工程 */}
            <div className="edit-section">
              <div className="edit-section-title">調理工程</div>
              {(editRecipe.steps||[]).map((step,si)=>(
                <div key={step.id} className="edit-step-card">
                  <div className="edit-step-hdr">
                    <div className="edit-step-num" style={{background:`${step.hands_on?"rgba(180,100,0,.15)":"rgba(30,120,70,.12)"}`,color:step.hands_on?"var(--amber)":"var(--green)",border:`1.5px solid ${step.hands_on?"var(--amber)":"var(--green)"}`}}>{step.id}</div>
                    <input className="inp" style={{flex:1}} placeholder="工程の説明" value={step.description}
                      onChange={e=>setER(r=>{const steps=[...r.steps];steps[si]={...steps[si],description:e.target.value};return{...r,steps};})}/>
                    <button className="btn b-red b-sm" onClick={()=>setER(r=>({...r,steps:r.steps.filter((_,j)=>j!==si)}))}>✕</button>
                  </div>
                  <div className="edit-row">
                    <div className="edit-field" style={{minWidth:80,maxWidth:100}}>
                      <label className="edit-label">所要時間(分)</label>
                      <input className="inp" type="number" min="1" value={step.duration_min}
                        onChange={e=>setER(r=>{const steps=[...r.steps];steps[si]={...steps[si],duration_min:parseInt(e.target.value)||1};return{...r,steps};})}/>
                    </div>
                    <div className="edit-field" style={{minWidth:120}}>
                      <label className="edit-label">使用設備</label>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:4}}>
                        {Object.entries(EQUIP_META).map(([k,v])=>(
                          <label key={k} className="edit-check">
                            <input type="checkbox" checked={(step.requires_equipment||[]).includes(k)}
                              onChange={e=>setER(r=>{const steps=[...r.steps];const eq=steps[si].requires_equipment||[];steps[si]={...steps[si],requires_equipment:e.target.checked?[...eq,k]:eq.filter(x=>x!==k)};return{...r,steps};})}/>
                            {v.icon}{v.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="edit-field" style={{minWidth:100}}>
                      <label className="edit-label">タイプ</label>
                      <label className="edit-check" style={{paddingTop:4}}>
                        <input type="checkbox" checked={step.hands_on}
                          onChange={e=>setER(r=>{const steps=[...r.steps];steps[si]={...steps[si],hands_on:e.target.checked};return{...r,steps};})}/>
                        ⚠ 手が離せない
                      </label>
                    </div>
                  </div>
                  {/* 工程の投入食材 */}
                  <div style={{marginTop:8}}>
                    <div className="edit-label">この工程で投入する食材</div>
                    {(step.ingredients||[]).map((ing,ii)=>(
                      <div key={ii} className="edit-ing-row" style={{marginBottom:4}}>
                        <input className="inp" style={{flex:2}} placeholder="食材名" value={ing.name}
                          onChange={e=>setER(r=>{const steps=[...r.steps];const ings=[...steps[si].ingredients];ings[ii]={...ings[ii],name:e.target.value};steps[si]={...steps[si],ingredients:ings};return{...r,steps};})}/>
                        <input className="inp" style={{flex:1}} placeholder="分量" value={ing.amount}
                          onChange={e=>setER(r=>{const steps=[...r.steps];const ings=[...steps[si].ingredients];ings[ii]={...ings[ii],amount:e.target.value};steps[si]={...steps[si],ingredients:ings};return{...r,steps};})}/>
                        <button className="btn b-red b-sm" onClick={()=>setER(r=>{const steps=[...r.steps];steps[si]={...steps[si],ingredients:steps[si].ingredients.filter((_,j)=>j!==ii)};return{...r,steps};})}>✕</button>
                      </div>
                    ))}
                    <button className="btn b-ghost b-sm" onClick={()=>setER(r=>{const steps=[...r.steps];steps[si]={...steps[si],ingredients:[...(steps[si].ingredients||[]),{name:"",amount:""}]};return{...r,steps};})}>+ 食材</button>
                  </div>
                  {/* コツ */}
                  <div style={{marginTop:8}}>
                    <label className="edit-label">調理のコツ（任意）</label>
                    <input className="inp" placeholder="例：焦げないよう時々混ぜる" value={step.note||""}
                      onChange={e=>setER(r=>{const steps=[...r.steps];steps[si]={...steps[si],note:e.target.value};return{...r,steps};})}/>
                  </div>
                </div>
              ))}
              <button className="btn b-ghost b-sm" onClick={()=>setER(r=>{const newId=(Math.max(0,...(r.steps||[]).map(s=>s.id)))+1;return{...r,steps:[...(r.steps||[]),{id:newId,description:"",duration_min:5,requires_equipment:[],hands_on:false,depends_on:[],ingredients:[],note:""}]};})}>+ 工程を追加</button>
            </div>

            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button className="btn b-green" onClick={saveEdit}>✓ 保存</button>
              <button className="btn b-ghost" onClick={cancelEdit}>キャンセル</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // NAV + LAYOUT
  // ════════════════════════════════════════════════════════════
  const NAV=[
    {id:"dashboard",icon:"⊞",label:"ダッシュボード"},
    {id:"week",     icon:"📅",label:"週間プランナー"},
    {id:"shopping", icon:"🛒",label:"買い物リスト"},
    {id:"schedule", icon:"📊",label:"スケジュール"},
    {id:"equipment",icon:"🔧",label:"設備管理"},
  ];

  const tabEquip=()=>(
    <div>
      <div style={{marginBottom:16}}><div style={{fontSize:20,fontWeight:800,marginBottom:3,color:"var(--text)"}}>キッチン設備</div><div className="muted sm">同時使用数をスケジューラが制約として利用します</div></div>
      <div className="card">
        <div className="ch"><div className="ct">設備管理</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
          {Object.entries(EQUIP_META).map(([key,meta])=>(
            <div key={key} style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:6,padding:12,textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:4}}>{meta.icon}</div>
              <div style={{fontSize:11,fontWeight:700,marginBottom:6,color:"var(--text)"}}>{meta.label}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <button style={{background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",width:22,height:22,borderRadius:3,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setEquip(e=>({...e,[key]:Math.max(0,(e[key]||1)-1)}))}>−</button>
                <div style={{fontFamily:"var(--mono)",fontSize:17,fontWeight:700,color:"var(--amber)",minWidth:20,textAlign:"center"}}>{equip[key]||0}</div>
                <button style={{background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",width:22,height:22,borderRadius:3,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setEquip(e=>({...e,[key]:(e[key]||0)+1}))}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return(
    <div className="app">
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <header className="hdr">
        <div className="logo" onClick={()=>setTab("dashboard")}>
          <span style={{fontSize:20}}>🍳</span>
          <span className="logo-txt">Kitchen<span>OS</span></span>
          <span style={{fontSize:9,fontFamily:"var(--mono)",color:"var(--muted)",marginLeft:2}}>v4</span>
        </div>
        <div className="hdr-r">
          <div className="theme-btns">
            {Object.entries(THEMES).map(([k,v])=>(
              <button key={k} className={`theme-btn ${themeName===k?"on":""}`} onClick={()=>setThemeName(k)}>{v.label}</button>
            ))}
          </div>
          <span style={{fontSize:9,fontFamily:"var(--mono)",color:"var(--muted)"}}>提供 {serveTime}</span>
          {cookMode?<span className="pill pill-red">🔴 調理中</span>:<span className="pill pill-amber">FREE</span>}
        </div>
      </header>

      <div className="body">
        <nav className="side">
          <div className="side-sect">WORKSPACE</div>
          {NAV.map(n=>(
            <div key={n.id} className={`nav-item ${tab===n.id?"on":""}`} onClick={()=>setTab(n.id)}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
          {schedule&&(<><div className="side-sect" style={{marginTop:6}}>COOKING</div><div className="nav-item" onClick={startCook}><span>🔴</span><span>調理モード</span></div></>)}
          {recipes.length>0&&(
            <>
              <div className="side-sect" style={{marginTop:6}}>レシピ</div>
              {recipes.map(r=>(
                <div key={r.id} className={`nav-item ${tab==="recipe-detail"&&detailId===r.id?"on":""}`} onClick={()=>openDetail(r.id)}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:r.color,flexShrink:0}}/>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:11}}>{r.name}</span>
                </div>
              ))}
            </>
          )}
        </nav>

        <main className="content">
          {tab==="dashboard"     && tabDash()}
          {tab==="week"          && tabWeek()}
          {tab==="shopping"      && tabShop()}
          {tab==="schedule"      && tabSched()}
          {tab==="equipment"     && tabEquip()}
          {tab==="recipe-detail" && tabRecipeDetail()}
        </main>
      </div>

      {/* ══ COOKING MODE ══ */}
      {cookMode&&cookStep&&(()=>{
        const stepIng=cookStep.ingredients||[];
        const nextStep=sortedSched[cookIdx+1];
        return(
          <div className="cook-overlay">
            <div className="cook-card">
              <div className="cook-prog"><div className="cook-prog-bar" style={{width:`${(cookIdx/sortedSched.length)*100}%`}}/></div>
              <div className="cook-step-num">STEP {cookIdx+1} / {sortedSched.length}</div>
              <div className="cook-recipe-lbl" style={{color:cookStep.recipeColor}}>{cookStep.recipeName}</div>
              <div className="cook-desc">{cookStep.description}</div>
              <div className="cook-ing-panel">
                <div className="cook-ing-ttl">📦 この工程で投入する食材</div>
                {stepIng.length>0?stepIng.map((ing,i)=>(
                  <div key={i} className="cook-ing-row">
                    <div className="cook-ing-name"><div className="cook-ing-dot" style={{background:cookStep.recipeColor}}/>{ing.name}</div>
                    <div className="cook-ing-amt">{ing.amount}</div>
                  </div>
                )):<div style={{fontSize:11,color:"var(--muted)",textAlign:"center",padding:"6px 0"}}>この工程で新規投入なし</div>}
                {cookStep.note&&<div style={{marginTop:8,fontSize:10,color:"var(--amber)",borderTop:"1px solid var(--border)",paddingTop:6}}>💡 {cookStep.note}</div>}
              </div>
              <div className="cook-timer-ring">
                <svg className="cook-timer-svg" width="110" height="110" viewBox="0 0 100 100">
                  <circle className="cook-timer-bg" cx="50" cy="50" r="42"/>
                  <circle className="cook-timer-fg" cx="50" cy="50" r="42" stroke={cookStep.hands_on?"var(--amber)":"var(--green)"} strokeDasharray={dashCirc} strokeDashoffset={dashOff}/>
                </svg>
                <div className="cook-timer-txt">
                  <div className="cook-timer-num" style={{color:cookStep.hands_on?"var(--amber)":"var(--green)"}}>{fmtSec(secLeft)}</div>
                  <div className="cook-timer-unit">残り時間</div>
                </div>
              </div>
              <div className="cook-badges">
                <span className={`tag ${cookStep.hands_on?"t-amber":"t-green"}`}>{cookStep.hands_on?"⚠ 要注意":"✓ 放置可能"}</span>
                {(cookStep.requires_equipment||[]).map(e=><span key={e} className="tag t-blue">{EQUIP_META[e]?.icon} {EQUIP_META[e]?.label}</span>)}
                <span className="tag t-muted">{cookStep.start} → {cookStep.end}</span>
              </div>
              <div className="cook-actions">
                <button className="btn b-ghost" onClick={goPrev} disabled={cookIdx===0}>← 前</button>
                <button className={`btn ${running?"b-red":"b-amber"}`} onClick={()=>setRunning(r=>!r)}>{running?"⏸ 停止":"▶ 開始"}</button>
                <button className="btn b-green" onClick={goNext}>{cookIdx===sortedSched.length-1?"🎉 完了":"次へ →"}</button>
                <button className="btn b-ghost" onClick={()=>{if(timerRef.current)clearInterval(timerRef.current);setCook(false);}}>✕</button>
              </div>
              {nextStep&&(
                <div className="cook-next">
                  <div className="cook-next-lbl">NEXT STEP</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:600,fontSize:12,color:"var(--text)"}}>{nextStep.description}</span>
                    <span className="tag t-muted">{nextStep.duration_min}m</span>
                  </div>
                  <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{nextStep.recipeName}</div>
                  {(nextStep.ingredients||[]).length>0&&(
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
                      {(nextStep.ingredients||[]).map((ing,i)=><span key={i} className="tag t-amber">{ing.name} {ing.amount}</span>)}
                    </div>
                  )}
                </div>
              )}
              <div style={{marginTop:14}}>{renderGantt(cookIdx)}</div>
            </div>
          </div>
        );
      })()}

      {/* GANTT TOOLTIP */}
      {tip&&(
        <div className="gtip" style={{left:Math.min(tip.x,window.innerWidth-250),top:Math.max(tip.y-150,8)}}>
          <div className="gtip-recipe" style={{color:tip.step.recipeColor}}>{tip.step.recipeName}</div>
          <div className="gtip-desc">{tip.step.description}</div>
          <div className="gtip-row"><span>🕐 {tip.step.start} → {tip.step.end}</span><span>{tip.step.duration_min}分</span></div>
          <div className="gtip-row"><span>{tip.step.hands_on?"⚠ 要注意":"✓ 放置可能"}</span>{tip.step.requires_equipment?.length>0&&<span>{tip.step.requires_equipment.map(e=>EQUIP_META[e]?.icon||e).join(" ")}</span>}</div>
          {(tip.step.ingredients||[]).length>0&&(
            <><hr className="gtip-div"/><div className="gtip-ing-ttl">📦 投入食材</div>
            {(tip.step.ingredients||[]).map((ing,i)=><div key={i} className="gtip-ing"><span style={{color:"var(--text)"}}>{ing.name}</span><span style={{color:"var(--amber)",fontWeight:700}}>{ing.amount}</span></div>)}</>
          )}
          {tip.step.note&&<div style={{marginTop:5,fontSize:9,color:"var(--amber)",borderTop:"1px solid var(--border)",paddingTop:4}}>💡 {tip.step.note}</div>}
        </div>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}
