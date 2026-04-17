'use client'

import { useState, useEffect, useRef } from 'react'

/* ============================================================
   KitchenOS v2  —  Next.js / Vercel production build
   - Cooking Mode (live countdown, step-by-step)
   - AI Recipe Generation (via /api/ai-recipe server route)
   - URL Import (AI-assisted)
   - Deploy tab removed (not needed in production)
   ============================================================ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0d0f0e; --surface:#151918; --surface2:#1c211f; --border:#2a332f;
    --amber:#f5a623; --green:#3dffa0; --red:#ff4d4d; --blue:#5bc8ff; --purple:#c084fc;
    --text:#e8ede9; --muted:#6b7c72;
    --ui:'Syne',sans-serif; --mono:'JetBrains Mono',monospace;
  }
  body { background:var(--bg); color:var(--text); font-family:var(--ui); overflow-x:hidden; }
  .app { min-height:100vh; display:flex; flex-direction:column; }

  .hdr { border-bottom:1px solid var(--border); padding:0 24px; height:56px;
    display:flex; align-items:center; justify-content:space-between;
    background:var(--surface); position:sticky; top:0; z-index:100; }
  .logo { display:flex; align-items:center; gap:10px; cursor:pointer; }
  .logo-txt { font-size:16px; font-weight:800; letter-spacing:-0.5px; }
  .logo-txt span { color:var(--amber); }
  .hdr-r { display:flex; align-items:center; gap:10px; }
  .pill { font-size:10px; font-weight:700; padding:3px 8px; border-radius:3px;
    font-family:var(--mono); letter-spacing:1px; }
  .pill-amber { background:linear-gradient(135deg,#f5a623,#e87c0a); color:#000; }
  .pill-red { background:var(--red); color:#fff; animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }

  .body { display:flex; flex:1; }
  .side { width:220px; min-width:220px; border-right:1px solid var(--border);
    background:var(--surface); padding:16px 0; }
  .side-sect { font-size:10px; font-weight:700; color:var(--muted);
    letter-spacing:2px; padding:16px 20px 6px; font-family:var(--mono); }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 20px;
    cursor:pointer; font-size:13px; font-weight:600; color:var(--muted);
    border-left:3px solid transparent; transition:all .15s; }
  .nav-item:hover { color:var(--text); background:var(--surface2); }
  .nav-item.on { color:var(--amber); border-left-color:var(--amber); background:rgba(245,166,35,.06); }
  .content { flex:1; padding:24px; overflow-y:auto; max-height:calc(100vh - 56px); }

  .card { background:var(--surface); border:1px solid var(--border);
    border-radius:8px; padding:20px; margin-bottom:16px; }
  .ch { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .ct { font-size:14px; font-weight:700; letter-spacing:.5px; }

  .btn { font-family:var(--ui); font-size:12px; font-weight:700;
    padding:8px 16px; border-radius:4px; border:none; cursor:pointer;
    letter-spacing:.5px; transition:all .15s;
    display:inline-flex; align-items:center; gap:6px; }
  .btn:disabled { opacity:.4; cursor:not-allowed; }
  .b-amber { background:var(--amber); color:#000; }
  .b-amber:not(:disabled):hover { background:#ffbc45; transform:translateY(-1px); }
  .b-ghost { background:transparent; color:var(--muted); border:1px solid var(--border); }
  .b-ghost:hover { color:var(--text); border-color:var(--muted); }
  .b-red { background:transparent; color:var(--red); border:1px solid var(--red); }
  .b-red:hover { background:rgba(255,77,77,.1); }
  .b-green { background:var(--green); color:#000; }
  .b-green:not(:disabled):hover { filter:brightness(1.1); }
  .b-purple { background:var(--purple); color:#000; }
  .b-sm { padding:5px 10px; font-size:11px; }
  .w100 { width:100%; justify-content:center; }

  .inp,.sel,.ta {
    background:var(--surface2); border:1px solid var(--border);
    color:var(--text); font-family:var(--mono); font-size:13px;
    padding:8px 12px; border-radius:4px; width:100%;
    transition:border-color .15s; outline:none; }
  .inp:focus,.sel:focus,.ta:focus { border-color:var(--amber); }
  .ta { resize:vertical; min-height:80px; }
  .sel option { background:var(--surface2); }

  .tag { font-size:10px; font-weight:700; padding:2px 7px; border-radius:3px;
    font-family:var(--mono); letter-spacing:.5px; }
  .t-amber { background:rgba(245,166,35,.15); color:var(--amber); border:1px solid rgba(245,166,35,.3); }
  .t-green { background:rgba(61,255,160,.12); color:var(--green); border:1px solid rgba(61,255,160,.3); }
  .t-blue  { background:rgba(91,200,255,.12); color:var(--blue);  border:1px solid rgba(91,200,255,.3); }
  .t-muted { background:rgba(107,124,114,.15); color:var(--muted); border:1px solid var(--border); }
  .t-purple{ background:rgba(192,132,252,.12); color:var(--purple); border:1px solid rgba(192,132,252,.3); }

  .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
  .stat { background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:16px; }
  .stat-n { font-size:28px; font-weight:800; font-family:var(--mono); color:var(--amber); }
  .stat-l { font-size:11px; color:var(--muted); margin-top:2px; }

  .gantt-wrap { overflow-x:auto; }
  .gantt-box { min-width:680px; }
  .gantt-hdr { display:flex; margin-bottom:4px; padding-left:190px; }
  .gantt-tm { font-size:10px; font-family:var(--mono); color:var(--muted); flex:1; text-align:center; }
  .gantt-row { display:flex; align-items:center; margin-bottom:5px; min-height:30px; }
  .gantt-lbl { width:190px; min-width:190px; font-size:11px; font-family:var(--mono);
    color:var(--muted); padding-right:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .gantt-track { flex:1; height:26px; background:var(--surface2); border-radius:3px;
    position:relative; border:1px solid var(--border); }
  .gbar { position:absolute; top:2px; height:22px; border-radius:3px;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700; font-family:var(--mono);
    white-space:nowrap; overflow:hidden; padding:0 4px; transition:filter .15s; cursor:default; }
  .gbar:hover { filter:brightness(1.2); }
  .gbar.active-step { box-shadow:0 0 0 2px var(--green); }
  .gbar.ho { background:linear-gradient(135deg,#f5a623,#e87c0a); color:#000; }
  .gbar.ps { background:linear-gradient(135deg,#1a5c3a,#2a8c5a); color:var(--green); }
  .gbar.done { opacity:.35; }
  .glegend { display:flex; gap:16px; margin-top:10px; }

  .cook-overlay { position:fixed; inset:0; background:rgba(0,0,0,.92); z-index:500;
    display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; }
  .cook-card { background:var(--surface); border:2px solid var(--amber);
    border-radius:16px; width:100%; max-width:560px; padding:36px;
    animation:cookIn .3s ease; max-height:90vh; overflow-y:auto; }
  @keyframes cookIn { from{transform:scale(.9);opacity:0} to{transform:scale(1);opacity:1} }
  .cook-progress { height:4px; background:var(--border); border-radius:2px; margin-bottom:28px; overflow:hidden; }
  .cook-progress-bar { height:100%; background:var(--amber); border-radius:2px; transition:width .5s; }
  .cook-step-num { font-size:11px; font-family:var(--mono); color:var(--muted); letter-spacing:2px; margin-bottom:8px; }
  .cook-recipe { font-size:12px; font-weight:700; margin-bottom:6px; }
  .cook-desc { font-size:22px; font-weight:800; line-height:1.3; margin-bottom:20px; }
  .cook-timer-ring { position:relative; width:140px; height:140px; margin:0 auto 24px; }
  .cook-timer-svg { transform:rotate(-90deg); }
  .cook-timer-bg { fill:none; stroke:var(--border); stroke-width:6; }
  .cook-timer-fg { fill:none; stroke-width:6; stroke-linecap:round; transition:stroke-dashoffset .9s linear; }
  .cook-timer-txt { position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; }
  .cook-timer-num { font-size:32px; font-weight:800; font-family:var(--mono); }
  .cook-timer-unit { font-size:11px; color:var(--muted); font-family:var(--mono); }
  .cook-badges { display:flex; gap:8px; justify-content:center; margin-bottom:24px; flex-wrap:wrap; }
  .cook-actions { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
  .cook-next-preview { background:var(--surface2); border:1px solid var(--border);
    border-radius:8px; padding:14px; margin-top:20px; font-size:12px; }
  .cook-next-lbl { font-size:10px; color:var(--muted); font-family:var(--mono); letter-spacing:1px; margin-bottom:4px; }

  .eq-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:12px; }
  .eq-card { background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:14px; text-align:center; }
  .eq-ico { font-size:28px; margin-bottom:6px; }
  .eq-name { font-size:12px; font-weight:700; margin-bottom:8px; }
  .eq-cnt { display:flex; align-items:center; justify-content:center; gap:8px; }
  .eq-btn { background:var(--surface); border:1px solid var(--border); color:var(--text);
    width:24px; height:24px; border-radius:3px; cursor:pointer; font-size:14px;
    display:flex; align-items:center; justify-content:center; transition:all .1s; }
  .eq-btn:hover { border-color:var(--amber); color:var(--amber); }
  .eq-num { font-family:var(--mono); font-size:18px; font-weight:700; color:var(--amber); min-width:24px; }

  .price-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .price-card { background:var(--surface2); border:1px solid var(--border);
    border-radius:8px; padding:24px; position:relative; overflow:hidden; }
  .price-card.feat { border-color:var(--amber); background:rgba(245,166,35,.05); }
  .price-card.feat::before { content:'POPULAR'; position:absolute; top:14px; right:-22px;
    background:var(--amber); color:#000; font-size:9px; font-weight:800;
    letter-spacing:2px; padding:3px 32px; transform:rotate(45deg); font-family:var(--mono); }
  .price-plan { font-size:11px; font-weight:700; color:var(--muted); letter-spacing:2px; font-family:var(--mono); margin-bottom:8px; }
  .price-amt { font-size:32px; font-weight:800; margin-bottom:4px; }
  .price-amt span { font-size:14px; font-weight:400; color:var(--muted); }
  .price-desc { font-size:12px; color:var(--muted); margin-bottom:20px; }
  .price-ul { list-style:none; margin-bottom:24px; }
  .price-ul li { font-size:12px; padding:5px 0; border-bottom:1px solid var(--border);
    display:flex; gap:8px; }
  .price-ul li::before { content:'→'; color:var(--amber); font-family:var(--mono); flex-shrink:0; }

  .shop-row { display:flex; align-items:center; justify-content:space-between;
    padding:8px 0; border-bottom:1px solid var(--border); }
  .shop-row:last-child { border-bottom:none; }
  .chk { width:16px; height:16px; border:2px solid var(--border); border-radius:3px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:all .15s; flex-shrink:0; }
  .chk.on { background:var(--green); border-color:var(--green); }

  .rec-item { background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:14px; margin-bottom:8px; }

  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:200;
    display:flex; align-items:center; justify-content:center; padding:20px; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:10px;
    width:100%; max-width:560px; padding:28px; animation:mIn .2s ease; max-height:90vh; overflow-y:auto; }
  @keyframes mIn { from{transform:scale(.95);opacity:0} to{transform:scale(1);opacity:1} }
  .modal-t { font-size:16px; font-weight:800; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

  .toast { position:fixed; bottom:24px; right:24px; z-index:999;
    background:var(--surface); border:1px solid var(--amber); border-radius:6px;
    padding:12px 20px; font-size:13px; font-weight:600;
    display:flex; align-items:center; gap:10px;
    animation:slideIn .3s ease; max-width:320px; }
  @keyframes slideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }

  .muted { color:var(--muted); }
  .sm { font-size:12px; }
  .mono { font-family:var(--mono); }

  @media(max-width:768px) {
    .side { display:none; }
    .stats { grid-template-columns:repeat(2,1fr); }
    .price-grid { grid-template-columns:1fr; }
    .cook-card { padding:20px; }
  }
`

// ── types ──────────────────────────────────────────────────
interface Step {
  id: number
  description: string
  duration_min: number
  requires_equipment: string[]
  hands_on: boolean
  depends_on: number[]
}
interface Ingredient { name: string; amount: string }
interface Recipe {
  id: string
  name: string
  category: string
  color: string
  ingredients: Ingredient[]
  steps: Step[]
}
interface ScheduledStep extends Step {
  gid: string
  recipeName: string
  recipeColor: string
  recipeIdx: number
  start: string
  end: string
  startMin: number
  endMin: number
}

// ── helpers ──────────────────────────────────────────────────
const t2m = (t: string) => { const [h,m]=t.split(':').map(Number); return h*60+m }
const m2t = (m: number) => {
  const v=((m%1440)+1440)%1440
  return `${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`
}
const fmtSec = (s: number) =>
  `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

// ── scheduler ────────────────────────────────────────────────
function buildSchedule(recipes: Recipe[], equipment: Record<string,number>, serveTime: string): ScheduledStep[] {
  const serveMin = t2m(serveTime)
  const all: (Step & {gid:string;recipeName:string;recipeColor:string;recipeIdx:number})[] = []
  recipes.forEach((r,ri) => {
    (r.steps||[]).forEach(step => {
      all.push({...step, gid:`${ri}_${step.id}`, recipeName:r.name, recipeColor:r.color||'#f5a623', recipeIdx:ri})
    })
  })
  const dep: Record<string,string[]> = {}
  all.forEach(s => { dep[s.gid]=(s.depends_on||[]).map(d=>`${s.recipeIdx}_${d}`) })
  const vis=new Set<string>(), order: string[]=[]
  function visit(gid: string){ if(vis.has(gid))return; vis.add(gid); (dep[gid]||[]).forEach(visit); order.push(gid) }
  all.forEach(s=>visit(s.gid))
  const byGid = Object.fromEntries(all.map(s=>[s.gid,s]))
  const endT: Record<string,number>={}, startT: Record<string,number>={}
  ;[...order].reverse().forEach(gid=>{
    const step=byGid[gid]
    const succs=all.filter(s=>(dep[s.gid]||[]).includes(gid))
    let latestEnd=serveMin
    if(succs.length) latestEnd=Math.min(...succs.map(s=>startT[s.gid]??serveMin))
    endT[gid]=latestEnd; startT[gid]=latestEnd-step.duration_min
  })
  const equipSlots: Record<string,{start:number;end:number;gid:string}[]>={}
  Object.keys(equipment).forEach(k=>{equipSlots[k]=[]})
  ;[...order].sort((a,b)=>startT[a]-startT[b]).forEach(gid=>{
    const step=byGid[gid]
    ;(step.requires_equipment||[]).forEach(eq=>{
      const maxC=equipment[eq]||1, slots=equipSlots[eq]||[]
      let ok=false, tries=0
      while(!ok&&tries<60){
        const ov=slots.filter(s=>s.end>startT[gid]&&s.start<endT[gid])
        if(ov.length<maxC) ok=true; else { startT[gid]-=1; endT[gid]-=1 }
        tries++
      }
      slots.push({start:startT[gid],end:endT[gid],gid})
      equipSlots[eq]=slots
    })
  })
  return all.map(s=>({...s, start:m2t(startT[s.gid]), end:m2t(endT[s.gid]),
    startMin:startT[s.gid], endMin:endT[s.gid]}))
}

// ── static data ───────────────────────────────────────────────
const TEMPLATES: Record<string, Omit<Recipe,'id'>> = {
  curry:{ name:'チキンカレー', category:'メイン', color:'#f5a623',
    ingredients:[{name:'鶏もも肉',amount:'400g'},{name:'玉ねぎ',amount:'2個'},{name:'にんじん',amount:'1本'},{name:'じゃがいも',amount:'2個'},{name:'カレールー',amount:'1箱'},{name:'水',amount:'800ml'}],
    steps:[
      {id:1,description:'玉ねぎをみじん切り',duration_min:5,requires_equipment:[],hands_on:true,depends_on:[]},
      {id:2,description:'玉ねぎを飴色に炒める',duration_min:15,requires_equipment:['stove'],hands_on:false,depends_on:[1]},
      {id:3,description:'鶏肉・野菜を切る',duration_min:10,requires_equipment:[],hands_on:true,depends_on:[]},
      {id:4,description:'鶏肉を炒める',duration_min:5,requires_equipment:['stove'],hands_on:true,depends_on:[2,3]},
      {id:5,description:'水を加えて煮込む',duration_min:20,requires_equipment:['stove'],hands_on:false,depends_on:[4]},
      {id:6,description:'ルーを溶かして仕上げ',duration_min:5,requires_equipment:['stove'],hands_on:true,depends_on:[5]},
    ]},
  salad:{ name:'シーザーサラダ', category:'前菜', color:'#3dffa0',
    ingredients:[{name:'ロメインレタス',amount:'1玉'},{name:'ベーコン',amount:'100g'},{name:'クルトン',amount:'適量'},{name:'パルメザン',amount:'30g'},{name:'ドレッシング',amount:'適量'}],
    steps:[
      {id:1,description:'レタスを洗って乾かす',duration_min:5,requires_equipment:[],hands_on:true,depends_on:[]},
      {id:2,description:'ベーコンを炒める',duration_min:5,requires_equipment:['stove'],hands_on:true,depends_on:[]},
      {id:3,description:'盛り付け・ドレッシング',duration_min:3,requires_equipment:[],hands_on:true,depends_on:[1,2]},
    ]},
  soup:{ name:'コーンスープ', category:'スープ', color:'#5bc8ff',
    ingredients:[{name:'コーン缶',amount:'1缶'},{name:'牛乳',amount:'400ml'},{name:'バター',amount:'20g'},{name:'塩・胡椒',amount:'適量'}],
    steps:[
      {id:1,description:'コーンをミキサー撹拌',duration_min:3,requires_equipment:['microwave'],hands_on:true,depends_on:[]},
      {id:2,description:'バターでコーンを炒める',duration_min:3,requires_equipment:['stove'],hands_on:true,depends_on:[1]},
      {id:3,description:'牛乳を加えて温める',duration_min:8,requires_equipment:['stove'],hands_on:false,depends_on:[2]},
    ]},
}
const EQUIP_META: Record<string,{icon:string;label:string}> = {
  stove:{icon:'🔥',label:'コンロ'},
  oven:{icon:'🫙',label:'オーブン'},
  microwave:{icon:'📡',label:'電子レンジ'},
  mixer:{icon:'🌀',label:'ミキサー'},
}
const COLORS = ['#f5a623','#3dffa0','#5bc8ff','#c084fc','#ff9f9f','#ffd700']

// ════════════════════════════════════════════════════════════
export default function KitchenOS() {
  const [tab, setTab]         = useState('dashboard')
  const [recipes, setRecipes] = useState<Recipe[]>([
    {...TEMPLATES.salad, id:'r1'},
    {...TEMPLATES.curry, id:'r2'},
  ])
  const [equip, setEquip]     = useState<Record<string,number>>({stove:2,oven:1,microwave:1})
  const [serveTime, setServe] = useState('18:00')
  const [schedule, setSched]  = useState<ScheduledStep[]|null>(null)
  const [checked, setChecked] = useState<Record<string,boolean>>({})
  const [toast, setToast]     = useState<string|null>(null)
  const [planTier, setPlan]   = useState<'free'|'pro'|'team'>('free')

  const [aiModal, setAiModal] = useState(false)
  const [aiMode, setAiMode]   = useState<'name'|'url'>('name')
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoad]= useState(false)
  const [aiResult, setAiRes]  = useState<Omit<Recipe,'id'>|{error:string}|null>(null)

  const [cookMode, setCook]   = useState(false)
  const [cookIdx, setCookIdx] = useState(0)
  const [secLeft, setSecLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef              = useRef<ReturnType<typeof setInterval>|null>(null)

  const sortedSched = schedule ? [...schedule].sort((a,b)=>a.startMin-b.startMin) : []

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const genSchedule = () => {
    if(!recipes.length){ showToast('⚠ レシピを追加してください'); return }
    setSched(buildSchedule(recipes,equip,serveTime))
    setTab('schedule')
    showToast('✓ スケジュール生成完了')
  }

  const startCook = () => {
    if(!schedule){ showToast('⚠ まずスケジュールを生成してください'); return }
    setCookIdx(0)
    setSecLeft((sortedSched[0]?.duration_min||0)*60)
    setRunning(false)
    setCook(true)
  }

  useEffect(()=>{
    if(timerRef.current) clearInterval(timerRef.current)
    if(running && cookMode){
      timerRef.current = setInterval(()=>{
        setSecLeft(s=>{
          if(s<=1){ clearInterval(timerRef.current!); setRunning(false); showToast('⏱ タイマー終了！'); return 0 }
          return s-1
        })
      },1000)
    }
    return ()=>{ if(timerRef.current) clearInterval(timerRef.current) }
  },[running,cookMode])

  const cookStep = sortedSched[cookIdx]
  const totalSec = cookStep ? cookStep.duration_min*60 : 1
  const dashCirc = 2*Math.PI*54
  const dashOff  = dashCirc*(1-(totalSec-secLeft)/totalSec)

  const goNext = () => {
    if(timerRef.current) clearInterval(timerRef.current); setRunning(false)
    const ni=cookIdx+1
    if(ni>=sortedSched.length){ setCook(false); showToast('🎉 全工程完了！お料理の完成'); return }
    setCookIdx(ni); setSecLeft(sortedSched[ni].duration_min*60)
  }
  const goPrev = () => {
    if(timerRef.current) clearInterval(timerRef.current); setRunning(false)
    const pi=Math.max(0,cookIdx-1); setCookIdx(pi); setSecLeft(sortedSched[pi].duration_min*60)
  }

  // AI call → server route (keeps API key safe)
  const runAI = async () => {
    if(!aiInput.trim()) return
    if(planTier==='free'){ showToast('🔒 AI機能はProプラン以上'); return }
    setAiLoad(true); setAiRes(null)
    const prompt = aiMode==='url'
      ? `URLのレシピページを想定して料理工程をJSONで出力してください。URL: ${aiInput}\n（スクレイピング不可のためURLからレシピ名を推測）\n\n`
      : `以下の料理名から調理工程を生成してください。料理: ${aiInput}\n\n`
    try {
      const res = await fetch('/api/ai-recipe',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prompt: prompt+`
JSONのみを出力（説明・バッククォート不要）:
{"name":"料理名","category":"前菜/スープ/メイン/デザートのいずれか",
"ingredients":[{"name":"食材名","amount":"量"}],
"steps":[{"id":1,"description":"工程","duration_min":数値,
"requires_equipment":["stove"/"oven"/"microwave"/"mixer"を0個以上],
"hands_on":true/false,"depends_on":[前工程id]}]}`})
      })
      const data = await res.json()
      if(data.error) setAiRes({error: data.error})
      else setAiRes(data.recipe)
    } catch(e){ setAiRes({error:'通信エラー。再試行してください'}) }
    setAiLoad(false)
  }

  const addAiRec = () => {
    if(!aiResult||'error' in aiResult) return
    setRecipes(p=>[...p,{...aiResult, id:`r_${Date.now()}`, color:COLORS[p.length%COLORS.length]}])
    setAiModal(false); setAiInput(''); setAiRes(null)
    showToast('✓ レシピを追加しました')
  }

  const shopList = (() => {
    const m: Record<string,{name:string;amounts:string[]}>={}
    recipes.forEach(r=>(r.ingredients||[]).forEach(ing=>{
      if(!m[ing.name]) m[ing.name]={name:ing.name,amounts:[]}
      m[ing.name].amounts.push(ing.amount)
    }))
    return Object.values(m)
  })()

  const renderGantt = (highlight: number|null=null) => {
    if(!schedule||!schedule.length) return null
    const minS=Math.min(...schedule.map(s=>s.startMin))
    const maxE=Math.max(...schedule.map(s=>s.endMin))
    const total=maxE-minS
    const marks: number[]=[]; for(let m=minS;m<=maxE;m+=15) marks.push(m)
    const doneGids=new Set(sortedSched.slice(0,highlight??0).map(s=>s.gid))
    return (
      <div className="gantt-wrap"><div className="gantt-box">
        <div className="gantt-hdr">{marks.map(m=><div key={m} className="gantt-tm">{m2t(m)}</div>)}</div>
        {schedule.map(step=>{
          const l=((step.startMin-minS)/total)*100
          const w=(step.duration_min/total)*100
          const isActive=highlight!=null&&sortedSched[highlight]?.gid===step.gid
          const isDone=doneGids.has(step.gid)
          return(
            <div key={step.gid} className="gantt-row">
              <div className="gantt-lbl" title={`[${step.recipeName}] ${step.description}`}>
                {step.recipeName.slice(0,8)} › {step.description.slice(0,12)}
              </div>
              <div className="gantt-track">
                <div className={`gbar ${step.hands_on?'ho':'ps'} ${isActive?'active-step':''} ${isDone?'done':''}`}
                  style={{left:`${l}%`,width:`${Math.max(w,2)}%`}}
                  title={`${step.start}〜${step.end} (${step.duration_min}分)`}>
                  {w>6?`${step.duration_min}m`:''}
                </div>
              </div>
            </div>
          )
        })}
        <div className="glegend">
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--muted)'}}>
            <div style={{width:12,height:12,borderRadius:2,background:'#f5a623'}}/> 要注意（手が離せない）
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--muted)'}}>
            <div style={{width:12,height:12,borderRadius:2,background:'#2a8c5a'}}/> 放置可能
          </div>
        </div>
      </div></div>
    )
  }

  // ── tabs ─────────────────────────────────────────────────────
  const tabDash = () => (
    <div>
      <div style={{marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>ダッシュボード</div>
          <div className="muted sm">料理をプロジェクト管理として扱う</div>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <input type="time" className="inp" style={{width:130}} value={serveTime} onChange={e=>setServe(e.target.value)}/>
          <button className="btn b-amber" onClick={genSchedule}>⚡ スケジュール生成</button>
          {schedule&&<button className="btn b-purple" onClick={startCook}>🔴 調理モード</button>}
        </div>
      </div>
      <div className="stats">
        {[
          {n:recipes.length,l:'レシピ数'},
          {n:recipes.reduce((s,r)=>s+(r.steps?.length||0),0),l:'総工程数'},
          {n:recipes.reduce((s,r)=>s+(r.steps?.reduce((a,st)=>a+st.duration_min,0)||0),0),l:'合計調理時間(分)'},
          {n:shopList.length,l:'食材種類'},
        ].map((x,i)=>(
          <div key={i} className="stat"><div className="stat-n">{x.n}</div><div className="stat-l">{x.l}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="ch">
          <div className="ct">🍽 今日のメニュー</div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn b-ghost b-sm" onClick={()=>{
              const keys=Object.keys(TEMPLATES)
              const t=TEMPLATES[keys[Math.floor(Math.random()*keys.length)]]
              setRecipes(p=>[...p,{...t,id:`r_${Date.now()}`,color:COLORS[p.length%COLORS.length]}])
              showToast('✓ テンプレート追加')
            }}>+ テンプレ</button>
            <button className="btn b-ghost b-sm" onClick={()=>{setAiModal(true);setAiMode('name')}}>✨ AI</button>
            <button className="btn b-ghost b-sm" onClick={()=>{setAiModal(true);setAiMode('url')}}>🌐 URL</button>
          </div>
        </div>
        {!recipes.length&&<div style={{textAlign:'center',padding:'40px 0',color:'var(--muted)'}}>レシピを追加してください</div>}
        {recipes.map(r=>(
          <div key={r.id} className="rec-item">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:r.color}}/>
                <span style={{fontWeight:700,fontSize:14}}>{r.name}</span>
                <span className={`tag ${r.category==='メイン'?'t-amber':r.category==='前菜'?'t-green':r.category==='デザート'?'t-purple':'t-blue'}`}>{r.category}</span>
              </div>
              <button className="btn b-red b-sm" onClick={()=>setRecipes(p=>p.filter(x=>x.id!==r.id))}>削除</button>
            </div>
            <div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
              {(r.steps||[]).map(s=>(
                <span key={s.id} className={`tag ${s.hands_on?'t-amber':'t-muted'}`} title={s.description}>
                  {s.description.slice(0,10)}… {s.duration_min}m
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {schedule&&(
        <div className="card" style={{borderColor:'var(--green)'}}>
          <div className="ch">
            <div className="ct" style={{color:'var(--green)'}}>✓ スケジュール生成済み</div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn b-ghost b-sm" onClick={()=>setTab('schedule')}>詳細 →</button>
              <button className="btn b-purple b-sm" onClick={startCook}>🔴 調理開始</button>
            </div>
          </div>
          <div className="sm muted">開始: {sortedSched[0]?.start} ／ 提供: {serveTime} ／ {schedule.length}工程</div>
        </div>
      )}
    </div>
  )

  const tabSched = () => (
    <div>
      <div style={{marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>調理スケジュール</div>
          <div className="muted sm">提供時間 {serveTime} への逆算スケジュール</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn b-amber" onClick={genSchedule}>⚡ 再生成</button>
          {schedule&&<button className="btn b-purple" onClick={startCook}>🔴 調理モード</button>}
        </div>
      </div>
      {!schedule?(
        <div className="card" style={{textAlign:'center',padding:'60px 0'}}>
          <div style={{fontSize:40,marginBottom:12}}>📋</div>
          <div style={{marginBottom:16,color:'var(--muted)'}}>スケジュール未生成</div>
          <button className="btn b-amber" onClick={genSchedule}>⚡ 今すぐ生成</button>
        </div>
      ):(
        <>
          <div className="card">
            <div className="ch"><div className="ct">ガントチャート</div><span className="tag t-green">提供 {serveTime}</span></div>
            {renderGantt()}
          </div>
          <div className="card">
            <div className="ch"><div className="ct">工程一覧（時系列順）</div></div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--mono)'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)',color:'var(--muted)'}}>
                    {['料理','工程','開始','終了','時間','タイプ'].map(h=>(
                      <th key={h} style={{padding:'6px 10px',textAlign:'left',fontWeight:700}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedSched.map(s=>(
                    <tr key={s.gid} style={{borderBottom:'1px solid var(--border)'}}>
                      <td style={{padding:'7px 10px'}}><span style={{color:s.recipeColor,fontWeight:700}}>{s.recipeName}</span></td>
                      <td style={{padding:'7px 10px'}}>{s.description}</td>
                      <td style={{padding:'7px 10px',color:'var(--amber)'}}>{s.start}</td>
                      <td style={{padding:'7px 10px',color:'var(--muted)'}}>{s.end}</td>
                      <td style={{padding:'7px 10px'}}>{s.duration_min}m</td>
                      <td style={{padding:'7px 10px'}}><span className={`tag ${s.hands_on?'t-amber':'t-muted'}`}>{s.hands_on?'要注意':'放置可'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const tabEquip = () => (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>キッチン設備</div>
        <div className="muted sm">スケジューラが同時使用数を制約として利用します</div>
      </div>
      <div className="card">
        <div className="ch"><div className="ct">設備管理</div></div>
        <div className="eq-grid">
          {Object.entries(EQUIP_META).map(([key,meta])=>(
            <div key={key} className="eq-card">
              <div className="eq-ico">{meta.icon}</div>
              <div className="eq-name">{meta.label}</div>
              <div className="eq-cnt">
                <button className="eq-btn" onClick={()=>setEquip(e=>({...e,[key]:Math.max(0,(e[key]||1)-1)}))}>−</button>
                <div className="eq-num">{equip[key]||0}</div>
                <button className="eq-btn" onClick={()=>setEquip(e=>({...e,[key]:(e[key]||0)+1}))}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const tabShop = () => (
    <div>
      <div style={{marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>買い物リスト</div>
          <div className="muted sm">{shopList.length}種類の食材</div>
        </div>
        <button className="btn b-ghost b-sm" onClick={()=>setChecked({})}>リセット</button>
      </div>
      <div className="card">
        {!shopList.length
          ?<div style={{textAlign:'center',padding:'40px 0',color:'var(--muted)'}}>レシピを追加すると表示されます</div>
          :shopList.map((item,i)=>(
          <div key={i} className="shop-row">
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div className={`chk ${checked[item.name]?'on':''}`}
                onClick={()=>setChecked(c=>({...c,[item.name]:!c[item.name]}))}>
                {checked[item.name]&&<span style={{fontSize:10,color:'#000',fontWeight:700}}>✓</span>}
              </div>
              <span style={{textDecoration:checked[item.name]?'line-through':'none',
                color:checked[item.name]?'var(--muted)':'var(--text)',fontWeight:600}}>
                {item.name}
              </span>
            </div>
            <span className="tag t-muted">{item.amounts.join(' + ')}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const tabPrice = () => (
    <div>
      <div style={{marginBottom:20,textAlign:'center'}}>
        <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>プランを選ぶ</div>
        <div className="muted sm">あなたの規模に合わせて</div>
      </div>
      <div className="price-grid">
        {([
          {id:'free' as const,plan:'FREE',price:'¥0',per:'/月',desc:'個人の家庭料理に',
            feats:['レシピ5件まで','基本スケジューラ','ガントチャート','買い物リスト','✗ AI機能'],cta:'現在のプラン'},
          {id:'pro' as const,plan:'PRO',price:'¥980',per:'/月',desc:'料理好き・ホームパーティに',feat:true,
            feats:['レシピ無制限','AIレシピ自動分解 ✨','URLインポート 🌐','調理モード 🔴','優先サポート'],cta:'Proにアップグレード'},
          {id:'team' as const,plan:'TEAM',price:'¥3,980',per:'/月',desc:'飲食店・ケータリングに',
            feats:['チームメンバー10人','複数キッチン管理','原価計算・利益管理','在庫API連携','専任サポート'],cta:'Teamを開始'},
        ] as const).map(t=>(
          <div key={t.id} className={`price-card ${(t as {feat?:boolean}).feat?'feat':''}`}>
            <div className="price-plan">{t.plan}</div>
            <div className="price-amt">{t.price}<span>{t.per}</span></div>
            <div className="price-desc">{t.desc}</div>
            <ul className="price-ul">{t.feats.map((f,i)=><li key={i}>{f}</li>)}</ul>
            <button className={`btn w100 ${t.id===planTier?'b-ghost':(t as {feat?:boolean}).feat?'b-amber':'b-green'}`}
              onClick={()=>{if(t.id!==planTier){setPlan(t.id);showToast(`✓ ${t.plan}プランに変更`)}}}>
              {t.id===planTier?'✓ '+t.cta:t.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const NAV = [
    {id:'dashboard',icon:'⊞',label:'ダッシュボード'},
    {id:'schedule', icon:'📊',label:'スケジュール'},
    {id:'equipment',icon:'🔧',label:'設備管理'},
    {id:'shopping', icon:'🛒',label:'買い物リスト'},
    {id:'pricing',  icon:'💎',label:'プラン'},
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      <div className="app">

        <header className="hdr">
          <div className="logo" onClick={()=>setTab('dashboard')}>
            <span style={{fontSize:22}}>🍳</span>
            <span className="logo-txt">Kitchen<span>OS</span></span>
            <span className="tag t-muted mono" style={{fontSize:9,marginLeft:4}}>v2</span>
          </div>
          <div className="hdr-r">
            <span className="tag t-muted mono" style={{fontSize:10}}>提供 {serveTime}</span>
            {cookMode
              ?<span className="pill pill-red">🔴 調理中</span>
              :<span className="pill pill-amber">{planTier.toUpperCase()}</span>
            }
          </div>
        </header>

        <div className="body">
          <nav className="side">
            <div className="side-sect">WORKSPACE</div>
            {NAV.map(n=>(
              <div key={n.id} className={`nav-item ${tab===n.id?'on':''}`} onClick={()=>setTab(n.id)}>
                <span>{n.icon}</span><span>{n.label}</span>
                {n.id==='pricing'&&planTier==='free'&&
                  <span className="tag t-amber" style={{marginLeft:'auto',fontSize:9}}>UP</span>}
              </div>
            ))}
            {schedule&&(
              <>
                <div className="side-sect" style={{marginTop:8}}>COOKING</div>
                <div className="nav-item" onClick={startCook}>
                  <span>🔴</span><span>調理モード</span>
                </div>
              </>
            )}
          </nav>

          <main className="content">
            {tab==='dashboard' && tabDash()}
            {tab==='schedule'  && tabSched()}
            {tab==='equipment' && tabEquip()}
            {tab==='shopping'  && tabShop()}
            {tab==='pricing'   && tabPrice()}
          </main>
        </div>

        {/* COOKING MODE */}
        {cookMode&&cookStep&&(
          <div className="cook-overlay">
            <div className="cook-card">
              <div className="cook-progress">
                <div className="cook-progress-bar" style={{width:`${(cookIdx/sortedSched.length)*100}%`}}/>
              </div>
              <div className="cook-step-num">STEP {cookIdx+1} / {sortedSched.length}</div>
              <div className="cook-recipe" style={{color:cookStep.recipeColor}}>{cookStep.recipeName}</div>
              <div className="cook-desc">{cookStep.description}</div>
              <div className="cook-timer-ring">
                <svg className="cook-timer-svg" width="140" height="140" viewBox="0 0 120 120">
                  <circle className="cook-timer-bg" cx="60" cy="60" r="54"/>
                  <circle className="cook-timer-fg"
                    cx="60" cy="60" r="54"
                    stroke={cookStep.hands_on?'var(--amber)':'var(--green)'}
                    strokeDasharray={dashCirc}
                    strokeDashoffset={dashOff}/>
                </svg>
                <div className="cook-timer-txt">
                  <div className="cook-timer-num" style={{color:cookStep.hands_on?'var(--amber)':'var(--green)'}}>
                    {fmtSec(secLeft)}
                  </div>
                  <div className="cook-timer-unit">残り時間</div>
                </div>
              </div>
              <div className="cook-badges">
                <span className={`tag ${cookStep.hands_on?'t-amber':'t-green'}`}>
                  {cookStep.hands_on?'⚠ 要注意':'✓ 放置可能'}
                </span>
                {(cookStep.requires_equipment||[]).map(e=>(
                  <span key={e} className="tag t-blue">{EQUIP_META[e]?.icon} {EQUIP_META[e]?.label}</span>
                ))}
                <span className="tag t-muted">{cookStep.start} → {cookStep.end}</span>
              </div>
              <div className="cook-actions">
                <button className="btn b-ghost" onClick={goPrev} disabled={cookIdx===0}>← 前</button>
                <button className={`btn ${running?'b-red':'b-amber'}`} onClick={()=>setRunning(r=>!r)}>
                  {running?'⏸ 一時停止':'▶ タイマー開始'}
                </button>
                <button className="btn b-green" onClick={goNext}>
                  {cookIdx===sortedSched.length-1?'🎉 完了':'次へ →'}
                </button>
                <button className="btn b-ghost" onClick={()=>{if(timerRef.current)clearInterval(timerRef.current);setCook(false)}}>✕</button>
              </div>
              {sortedSched[cookIdx+1]&&(
                <div className="cook-next-preview">
                  <div className="cook-next-lbl">NEXT STEP</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:600,fontSize:13}}>{sortedSched[cookIdx+1].description}</span>
                    <span className="tag t-muted">{sortedSched[cookIdx+1].duration_min}m</span>
                  </div>
                  <div className="muted sm" style={{marginTop:4}}>{sortedSched[cookIdx+1].recipeName}</div>
                </div>
              )}
              <div style={{marginTop:16}}>{renderGantt(cookIdx)}</div>
            </div>
          </div>
        )}

        {/* AI MODAL */}
        {aiModal&&(
          <div className="overlay" onClick={()=>setAiModal(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-t">
                {aiMode==='url'?'🌐 URLからレシピ取込':'✨ AIレシピ自動生成'}
                {planTier==='free'&&<span className="tag t-amber">Pro限定</span>}
              </div>
              {planTier==='free'?(
                <>
                  <p className="sm muted" style={{marginBottom:16}}>AI機能はProプラン以上でご利用いただけます。</p>
                  <div style={{display:'flex',gap:10}}>
                    <button className="btn b-amber" onClick={()=>{setPlan('pro');setAiModal(false);showToast('✓ Proプランに変更')}}>Proにアップグレード</button>
                    <button className="btn b-ghost" onClick={()=>setAiModal(false)}>閉じる</button>
                  </div>
                </>
              ):(
                <>
                  <div style={{display:'flex',gap:8,marginBottom:14}}>
                    {([{id:'name',l:'料理名から'},{id:'url',l:'URLから'}] as const).map(m=>(
                      <button key={m.id} className={`btn b-sm ${aiMode===m.id?'b-amber':'b-ghost'}`}
                        onClick={()=>{setAiMode(m.id);setAiInput('');setAiRes(null)}}>
                        {m.l}
                      </button>
                    ))}
                  </div>
                  <textarea className="ta" style={{marginBottom:12}}
                    placeholder={aiMode==='url'?'https://cookpad.com/recipe/...':'例：ビーフシチュー、パスタカルボナーラ…'}
                    value={aiInput} onChange={e=>setAiInput(e.target.value)}/>
                  {aiLoading&&<div style={{color:'var(--amber)',fontSize:13,marginBottom:12}}>⏳ AI生成中...</div>}
                  {aiResult&&!('error' in aiResult)&&(
                    <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,
                      padding:12,marginBottom:12,fontSize:12,fontFamily:'var(--mono)',maxHeight:200,overflowY:'auto'}}>
                      <strong style={{color:'var(--green)'}}>{aiResult.name}</strong> — {aiResult.steps?.length}工程<br/>
                      {aiResult.steps?.map(s=>(
                        <div key={s.id} style={{marginTop:4,color:'var(--muted)'}}>
                          • {s.description} ({s.duration_min}m) {s.hands_on?'⚠':''}
                        </div>
                      ))}
                    </div>
                  )}
                  {'error' in (aiResult||{})&&<div style={{color:'var(--red)',fontSize:12,marginBottom:12}}>{(aiResult as {error:string})?.error}</div>}
                  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                    <button className="btn b-amber" onClick={runAI} disabled={aiLoading}>
                      {aiLoading?'生成中…':'✨ 生成'}
                    </button>
                    {aiResult&&!('error' in aiResult)&&(
                      <button className="btn b-green" onClick={addAiRec}>+ レシピに追加</button>
                    )}
                    <button className="btn b-ghost" onClick={()=>setAiModal(false)}>閉じる</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {toast&&<div className="toast">{toast}</div>}
      </div>
    </>
  )
}
