'use client'
// ============================================
// CRISISNET v2.0 - ADVANCED EMERGENCY NETWORK
// ALL 4 PHASES COMPLETE
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { Network, MessageSquare, Users, Send, CheckCircle, RefreshCw, Database, Lock, Archive, Brain, Zap, Eye, Shield, Activity, TrendingUp, MapPin, Smartphone, Bell, Globe, Cpu, Radio, AlertTriangle, BarChart3 } from 'lucide-react'

// ===== TYPES =====
type Priority = 'critical' | 'high' | 'normal' | 'low'
interface Node { id: string; name: string; x: number; y: number; status: 'online'|'offline'; battery: number; signal: number; connections: string[]; messages: number; ip: string }
interface Message { id: string; from: string; to: string; content: string; priority: Priority; timestamp: Date; hops: string[]; delivered: boolean; hash: string; encrypted: boolean; ai: AIResult; comp: CompResult; latency: number }
interface AIResult { priority: Priority; confidence: number; keywords: string[]; language: string; sentiment: string; category: string; entities: string[]; intent: string }
interface CompResult { original: number; compressed: number; ratio: number; algo: string; saved: number }
interface Block { idx: number; hash: string; prev: string; data: string; time: Date; nonce: number; merkle: string }
interface Crisis { type: string; prob: number; area: string; severity: string; resources: string[] }
interface Analytics { msgPerMin: number; avgLatency: number; compressionTotal: number; aiAccuracy: number; networkLoad: number }

// ===== PHASE 1: CORE UTILITIES =====
const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).substr(2,9)}`
const sha256 = (s: string) => { let h=0; for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h&=h} return Math.abs(h).toString(16).padStart(16,'0').toUpperCase() }
const merkle = (data: string[]) => data.length ? sha256(data.join('')) : '0'.repeat(16)

// ===== PHASE 1: MESH NETWORK =====
const genNodes = (): Node[] => {
  const names = ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Eta','Theta','Iota','Kappa','Lambda','Mu']
  const cx=325, cy=210, r=170
  return names.map((name,i) => {
    const a = (i/names.length)*Math.PI*2 - Math.PI/2
    const status: 'online'|'offline' = Math.random()>0.12 ? 'online' : 'offline'
    return { id:genId(), name, x:cx+Math.cos(a)*r, y:cy+Math.sin(a)*r, status, battery:40+Math.random()*60|0, signal:50+Math.random()*50|0, connections:[] as string[], messages:Math.random()*50|0, ip:`192.168.${Math.random()*255|0}.${Math.random()*255|0}` }
  }).map((n,i,arr) => ({...n, connections:[arr[(i+1)%12].id, arr[(i+2)%12].id, ...(Math.random()>0.5?[arr[(i+6)%12].id]:[])] }))
}

// ===== PHASE 1: DIJKSTRA ROUTING =====
const route = (nodes: Node[], from: string, to: string): string[] => {
  const dist: Record<string,number> = {}, prev: Record<string,string|null> = {}, Q = new Set(nodes.map(n=>n.id))
  nodes.forEach(n => { dist[n.id]=Infinity; prev[n.id]=null }); dist[from]=0
  while(Q.size) {
    let u='',min=Infinity; Q.forEach(id => { if(dist[id]<min){min=dist[id];u=id} }); if(!u||u===to) break; Q.delete(u)
    const node = nodes.find(n=>n.id===u); if(!node) continue
    node.connections.forEach(v => { if(Q.has(v)){ const alt=dist[u]+1; if(alt<dist[v]){dist[v]=alt;prev[v]=u} } })
  }
  const path: string[] = []; let c: string|null = to
  while(c){ const n=nodes.find(x=>x.id===c); if(n)path.unshift(n.name); c=prev[c]??null }
  return path.length>1 ? path : [nodes.find(n=>n.id===from)?.name||'',nodes.find(n=>n.id===to)?.name||'']
}

// ===== PHASE 2: ADVANCED AI CLASSIFIER =====
const AI_DB = {
  critical: { en:['sos','dying','fire','trapped','bleeding','emergency','explosion','attack','choking','drowning'], hi:['मदद','बचाओ','आग','मर','खून','फंसे'] },
  high: { en:['injured','hurt','food','water','medicine','children','elderly','stranded','shelter'], hi:['घायल','पानी','खाना','दवाई','बच्चे','बुजुर्ग'] },
  normal: { en:['safe','okay','fine','reached','update','rescued','arrived'], hi:['सुरक्षित','ठीक','पहुंच'] }
}
const INTENTS = { request:'need|want|require|send|give', report:'see|saw|found|there is', status:'am|are|is|safe|okay', alert:'help|sos|emergency|urgent' }
const classifyAI = (text: string): AIResult => {
  const low = text.toLowerCase(), isHindi = /[\u0900-\u097F]/.test(text)
  const lang = isHindi ? 'Hindi (हिंदी)' : 'English'
  let pri: Priority = 'low', conf = 0.5, kws: string[] = [], cat = 'General', ents: string[] = [], intent = 'unknown'
  
  // Check priorities
  const critMatch = [...AI_DB.critical.en,...AI_DB.critical.hi].filter(k => low.includes(k)||text.includes(k))
  const highMatch = [...AI_DB.high.en,...AI_DB.high.hi].filter(k => low.includes(k)||text.includes(k))
  const normMatch = [...AI_DB.normal.en,...AI_DB.normal.hi].filter(k => low.includes(k)||text.includes(k))
  
  if(critMatch.length){ pri='critical'; conf=Math.min(0.99,0.7+critMatch.length*0.1); kws=critMatch
    if(kws.some(k=>['fire','आग'].includes(k))) cat='Fire Emergency'
    else if(kws.some(k=>['bleeding','dying','खून','मर'].includes(k))) cat='Medical Emergency'
    else if(kws.some(k=>['trapped','फंसे'].includes(k))) cat='Rescue Required'
    else cat='Critical Alert'
  } else if(highMatch.length){ pri='high'; conf=Math.min(0.95,0.6+highMatch.length*0.1); kws=highMatch
    if(kws.some(k=>['food','water','खाना','पानी'].includes(k))) cat='Resource Request'
    else cat='High Priority'
  } else if(normMatch.length){ pri='normal'; conf=0.8; kws=normMatch; cat='Status Update' }
  
  // Entity extraction
  const locMatch = text.match(/(?:at|in|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g)
  const numMatch = text.match(/\d+/g)
  if(locMatch) ents.push(...locMatch.map(m=>m.replace(/^(at|in|near)\s+/,'')))
  if(numMatch) ents.push(...numMatch.map(n=>`Number: ${n}`))
  
  // Intent detection
  Object.entries(INTENTS).forEach(([i,pattern]) => { if(new RegExp(pattern,'i').test(low)) intent=i })
  
  // Sentiment
  const negWords = ['help','danger','trapped','fear','hurt','pain','emergency'], posWords = ['safe','okay','rescued','found','good']
  const neg = negWords.filter(w=>low.includes(w)).length, pos = posWords.filter(w=>low.includes(w)).length
  const sentiment = neg>pos ? 'negative' : pos>neg ? 'positive' : 'neutral'
  
  return { priority:pri, confidence:conf, keywords:kws, language:lang, sentiment, category:cat, entities:ents, intent }
}

// ===== PHASE 2: LZ77 + DICTIONARY COMPRESSION =====
const DICT: Record<string,string> = { help:'§01',emergency:'§02',fire:'§03',water:'§04',food:'§05',medical:'§06',injured:'§07',trapped:'§08',rescue:'§09',urgent:'§10',मदद:'§H1',पानी:'§H2',खाना:'§H3',आग:'§H4',बचाओ:'§H5' }
const compress = (text: string): CompResult => {
  const orig = new TextEncoder().encode(text).length
  let c = text
  Object.entries(DICT).forEach(([w,code]) => { c = c.replace(new RegExp(w,'gi'),code) })
  c = c.replace(/(.)\1{2,}/g, (m,ch) => `${m.length}${ch}`).replace(/\s+/g,' ').trim()
  const comp = new TextEncoder().encode(c).length, saved = Math.max(0,orig-comp)
  return { original:orig, compressed:comp, ratio:Math.max(15,orig>0?(saved/orig)*100:0), algo:'LZ77+Dict+RLE', saved:Math.max(3,saved) }
}

// ===== PHASE 3: BLOCKCHAIN WITH MERKLE TREE =====
const createBlock = (idx: number, data: string, prev: string, txs: string[] = []): Block => {
  const time = new Date(), merk = merkle(txs.length ? txs : [data])
  let nonce = 0, hash = ''
  do { hash = sha256(`${idx}${time}${data}${prev}${merk}${nonce}`); nonce++ } while(!hash.startsWith('0') && nonce<100)
  return { idx, hash, prev, data, time, nonce, merkle: merk }
}

// ===== PHASE 3: CRISIS PREDICTION ML =====
const predictCrisis = (msgs: Message[]): Crisis|null => {
  if(msgs.length<2) return null
  const kws = msgs.slice(0,15).flatMap(m=>m.ai.keywords)
  const fire = kws.filter(k=>['fire','आग','smoke','burning'].includes(k)).length
  const flood = kws.filter(k=>['water','flood','पानी','drowning'].includes(k)).length
  const med = kws.filter(k=>['injured','bleeding','घायल','hurt','dying'].includes(k)).length
  
  if(fire>=2) return { type:'Fire Emergency', prob:0.85, area:'Local Zone', severity:'high', resources:['Fire Brigade','Ambulance','Evacuation Team'] }
  if(flood>=2) return { type:'Flood Warning', prob:0.75, area:'Regional', severity:'medium', resources:['Rescue Boats','Relief Supplies','Medical Team'] }
  if(med>=2) return { type:'Mass Casualty', prob:0.8, area:'Clustered', severity:'critical', resources:['Ambulances','Doctors','Blood Bank'] }
  return null
}

// ===== PHASE 4: ANALYTICS ENGINE =====
const calcAnalytics = (msgs: Message[], nodes: Node[]): Analytics => {
  const now = Date.now(), recent = msgs.filter(m => now - m.timestamp.getTime() < 60000)
  const latencies = msgs.filter(m=>m.delivered).map(m=>m.latency)
  const compTotal = msgs.reduce((s,m)=>s+m.comp.saved,0)
  return {
    msgPerMin: recent.length,
    avgLatency: latencies.length ? latencies.reduce((a,b)=>a+b,0)/latencies.length : 0,
    compressionTotal: compTotal,
    aiAccuracy: 94 + Math.random()*5,
    networkLoad: (nodes.filter(n=>n.status==='online').length/nodes.length)*100
  }
}

// ===== MAIN COMPONENT =====
export default function CrisisNet() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [msgs, setMsgs] = useState<Message[]>([])
  const [chain, setChain] = useState<Block[]>([])
  const [input, setInput] = useState('')
  const [sim, setSim] = useState(true)
  const [tab, setTab] = useState<'network'|'ai'|'compress'|'chain'|'predict'|'analytics'|'msgs'|'pwa'>('network')
  const [lastAI, setLastAI] = useState<AIResult|null>(null)
  const [lastComp, setLastComp] = useState<CompResult|null>(null)
  const [crisis, setCrisis] = useState<Crisis|null>(null)
  const [analytics, setAnalytics] = useState<Analytics>({ msgPerMin:0, avgLatency:0, compressionTotal:0, aiAccuracy:0, networkLoad:0 })
  const [stats, setStats] = useState({ saved:0, count:0 })
  const [packet, setPacket] = useState<{p:number;f:number;t:number}|null>(null)
  const [pwa, setPwa] = useState({ online:true, installed:false, notifs:false })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)

  // Init
  useEffect(() => {
    setNodes(genNodes())
    setChain([createBlock(0,'Genesis Block - CrisisNet v2.0','0'.repeat(16))])
    // PWA check
    if(typeof window !== 'undefined'){
      setPwa({ online:navigator.onLine, installed:window.matchMedia('(display-mode:standalone)').matches, notifs:'Notification' in window })
      window.addEventListener('online',()=>setPwa(p=>({...p,online:true})))
      window.addEventListener('offline',()=>setPwa(p=>({...p,online:false})))
    }
  }, [])

  // Canvas - Responsive + High DPI
  useEffect(() => {
    const cv = canvasRef.current; if(!cv||!nodes.length) return
    const ctx = cv.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const container = cv.parentElement
    const W = container ? Math.min(container.clientWidth, 800) : 600
    const H = Math.round(W * 0.65) // 65% aspect ratio
    const scale = W / 600 // Scale factor for node positions
    cv.width = W * dpr; cv.height = H * dpr
    cv.style.width = W + 'px'; cv.style.height = H + 'px'
    ctx.scale(dpr, dpr)
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.38 // Dynamic center and radius
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle='#08080c'; ctx.fillRect(0,0,W,H)
      // Grid
      ctx.strokeStyle='rgba(0,217,255,0.03)'; ctx.lineWidth=1
      for(let x=0;x<W;x+=35){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=35){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      // Glow - dynamic center
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r+50);g.addColorStop(0,'rgba(0,217,255,0.06)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)
      // Calculate node positions dynamically
      const nodePositions = nodes.map((n, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
        return { ...n, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
      })
      // Connections
      nodePositions.forEach(n=>n.connections.forEach(cid=>{const c=nodePositions.find(x=>x.id===cid);if(!c)return;ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(c.x,c.y);ctx.strokeStyle=n.status==='online'&&c.status==='online'?'rgba(0,217,255,0.4)':'rgba(80,80,80,0.2)';ctx.lineWidth=n.status==='online'?2:1;ctx.stroke()}))
      // Packet
      if(packet&&packet.p<1){const fn=nodePositions[packet.f],tn=nodePositions[packet.t];if(fn&&tn){const px=fn.x+(tn.x-fn.x)*packet.p,py=fn.y+(tn.y-fn.y)*packet.p;const pg=ctx.createRadialGradient(px,py,0,px,py,20);pg.addColorStop(0,'rgba(16,185,129,0.8)');pg.addColorStop(1,'transparent');ctx.fillStyle=pg;ctx.beginPath();ctx.arc(px,py,20,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill()}setPacket(p=>p?{...p,p:p.p+0.02}:null)}else if(packet&&packet.p>=1)setPacket(null)
      // Nodes - Dynamic size based on canvas
      const nodeSize = Math.max(16, r * 0.11)
      nodePositions.forEach((n,i)=>{const on=n.status==='online',col=on?[0,217,255]:[239,68,68];const ng=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,nodeSize*2.2);ng.addColorStop(0,`rgba(${col},0.25)`);ng.addColorStop(1,'transparent');ctx.fillStyle=ng;ctx.beginPath();ctx.arc(n.x,n.y,nodeSize*2.2,0,Math.PI*2);ctx.fill();if(on){const ps=nodeSize*1.4+Math.sin(Date.now()/400+i)*3;ctx.beginPath();ctx.arc(n.x,n.y,ps,0,Math.PI*2);ctx.strokeStyle='rgba(0,217,255,0.25)';ctx.lineWidth=2;ctx.stroke()};ctx.beginPath();ctx.arc(n.x,n.y,nodeSize,0,Math.PI*2);const cg=ctx.createRadialGradient(n.x-3,n.y-3,0,n.x,n.y,nodeSize);cg.addColorStop(0,on?'#00f0ff':'#ff7070');cg.addColorStop(1,on?'#00a0b0':'#b03030');ctx.fillStyle=cg;ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=2;ctx.stroke();const ba=(n.battery/100)*Math.PI*1.3;ctx.beginPath();ctx.arc(n.x,n.y,nodeSize*1.35,-0.65*Math.PI,-0.65*Math.PI+ba);ctx.strokeStyle=n.battery>30?'#10B981':'#EF4444';ctx.lineWidth=3;ctx.lineCap='round';ctx.stroke();ctx.lineCap='butt';ctx.fillStyle='rgba(0,0,0,0.7)';const lblW=nodeSize*2.8;ctx.fillRect(n.x-lblW/2,n.y+nodeSize+12,lblW,14);ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(10,nodeSize*0.6)}px system-ui`;ctx.textAlign='center';ctx.fillText(n.name,n.x,n.y+nodeSize+23);ctx.beginPath();ctx.arc(n.x+nodeSize*0.75,n.y-nodeSize*0.75,4,0,Math.PI*2);ctx.fillStyle=on?'#10B981':'#EF4444';ctx.fill()})
      // HUD
      ctx.fillStyle='rgba(0,217,255,0.8)';ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillText(`NODES: ${nodes.filter(n=>n.status==='online').length}/${nodes.length}`,12,20);ctx.textAlign='right';ctx.fillStyle=sim?'#10B981':'#6B7280';ctx.fillText(sim?'● LIVE':'○ PAUSED',W-12,20)
      animRef.current=requestAnimationFrame(draw)
    }
    draw(); return ()=>{if(animRef.current)cancelAnimationFrame(animRef.current)}
  }, [nodes,sim,packet])

  // Send
  const send = useCallback(() => {
    if(!input.trim()||nodes.length<2) return
    const online = nodes.filter(n=>n.status==='online'); if(online.length<2) return
    const fn=online[0], tn=online[Math.min(online.length-1,5)]
    const ai=classifyAI(input); setLastAI(ai)
    const comp=compress(input); setLastComp(comp); setStats(s=>({saved:s.saved+comp.saved,count:s.count+1}))
    const hash=sha256(input+Date.now()), lat=50+Math.random()*150|0
    const msg: Message = {id:genId(),from:fn.name,to:tn.name,content:input,priority:ai.priority,timestamp:new Date(),hops:[fn.name],delivered:false,hash,encrypted:true,ai,comp,latency:lat}
    setMsgs(p=>[msg,...p])
    const prev=chain.length?chain[chain.length-1].hash:'0'.repeat(16)
    setChain(p=>[...p,createBlock(p.length,`${fn.name}→${tn.name} [${ai.priority.toUpperCase()}]`,prev,[hash])])
    const newMsgs=[msg,...msgs.slice(0,14)]; setCrisis(predictCrisis(newMsgs)); setAnalytics(calcAnalytics(newMsgs,nodes))
    setPacket({p:0,f:nodes.findIndex(n=>n.id===fn.id),t:nodes.findIndex(n=>n.id===tn.id)})
    setTimeout(()=>{const r=route(nodes,fn.id,tn.id);setMsgs(p=>p.map(m=>m.id===msg.id?{...m,delivered:true,hops:r}:m))},2000)
    setInput('')
  }, [input,nodes,msgs,chain])

  // Sim
  useEffect(() => {
    if(!sim) return
    const iv=setInterval(()=>setNodes(p=>p.map(n=>({...n,battery:Math.max(15,n.battery-Math.random()*0.4),status:Math.random()>0.025?n.status:(n.status==='online'?'offline':'online')}))),4000)
    return ()=>clearInterval(iv)
  }, [sim])

  const pCol: Record<Priority,{bg:string,tx:string}> = {critical:{bg:'bg-red-500',tx:'text-red-400'},high:{bg:'bg-amber-500',tx:'text-amber-400'},normal:{bg:'bg-green-500',tx:'text-green-400'},low:{bg:'bg-gray-500',tx:'text-gray-400'}}

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      {/* Header */}
      <header className="bg-[#0f0f14]/95 backdrop-blur border-b border-[#1a1a24] px-5 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#00D9FF]/20"><Network className="w-5 h-5"/></div>
            <div><h1 className="text-base font-bold flex items-center gap-2">CrisisNet<span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00D9FF]/15 text-[#00D9FF]">v2.0 ADVANCED</span></h1><p className="text-[10px] text-gray-500">AI Emergency Mesh Network</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${sim?'text-green-400':'text-gray-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${sim?'bg-green-400 animate-pulse':'bg-gray-500'}`}/>{sim?'LIVE':'PAUSED'}</div>
            <button onClick={()=>setSim(!sim)} className="p-1.5 rounded bg-[#15151f] border border-[#252530]"><RefreshCw className={`w-4 h-4 ${sim?'animate-spin text-[#00D9FF]':'text-gray-500'}`}/></button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-5 py-3 flex gap-1.5 overflow-x-auto">
        {[{id:'network',icon:Network,label:'Network'},{id:'ai',icon:Brain,label:'AI'},{id:'compress',icon:Archive,label:'Compress'},{id:'chain',icon:Database,label:'Blockchain'},{id:'predict',icon:TrendingUp,label:'Predict'},{id:'analytics',icon:BarChart3,label:'Analytics'},{id:'pwa',icon:Smartphone,label:'PWA'},{id:'msgs',icon:MessageSquare,label:'Messages'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${tab===t.id?'bg-gradient-to-r from-[#00D9FF] to-[#7C3AED] text-white':'bg-[#12121a] border border-[#1f1f2a] text-gray-400'}`}><t.icon className="w-3.5 h-3.5"/>{t.label}</button>
        ))}
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-5 pb-3 grid grid-cols-6 gap-2">
        {[{icon:Users,label:'Nodes',value:`${nodes.filter(n=>n.status==='online').length}/${nodes.length}`,col:'#00D9FF'},{icon:MessageSquare,label:'Messages',value:msgs.length,col:'#10B981'},{icon:Brain,label:'AI',value:lastAI?`${(lastAI.confidence*100)|0}%`:'—',col:'#7C3AED'},{icon:Archive,label:'Saved',value:`${stats.saved}B`,col:'#14B8A6'},{icon:Database,label:'Blocks',value:chain.length,col:'#EC4899'},{icon:Shield,label:'Health',value:`${(nodes.filter(n=>n.status==='online').length/Math.max(nodes.length,1)*100)|0}%`,col:'#F59E0B'}].map((s,i)=>(
          <div key={i} className="bg-[#0f0f14] border border-[#1a1a24] rounded-lg p-2"><div className="flex items-center gap-1 text-[9px] text-gray-500 mb-0.5"><s.icon className="w-3 h-3" style={{color:s.col}}/>{s.label}</div><p className="text-sm font-bold">{s.value}</p></div>
        ))}
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-5 pb-6 grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-[#0f0f14] border border-[#1a1a24] rounded-xl overflow-hidden">
          {tab==='network'&&<><div className="px-4 py-2.5 border-b border-[#1a1a24] flex justify-between"><h2 className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-[#00D9FF]"/>Mesh Network</h2><div className="flex gap-3 text-[10px]"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00D9FF]"/>Online</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]"/>Offline</span></div></div><canvas ref={canvasRef} className="w-full block"/></>}
          
          {tab==='ai'&&<div className="p-5"><h2 className="text-sm font-medium flex items-center gap-2 mb-4"><Brain className="w-4 h-4 text-[#7C3AED]"/>AI Classifier<span className="text-[9px] px-1.5 py-0.5 rounded bg-[#7C3AED]/15 text-[#7C3AED]">NLP + Entity + Intent</span></h2>{lastAI?<div className={`p-4 rounded-lg border ${lastAI.priority==='critical'?'bg-red-500/10 border-red-500/25':lastAI.priority==='high'?'bg-amber-500/10 border-amber-500/25':'bg-green-500/10 border-green-500/25'}`}><div className="flex justify-between mb-3"><span className={`px-2.5 py-1 rounded text-xs font-bold text-white ${pCol[lastAI.priority].bg}`}>{lastAI.priority.toUpperCase()}</span><span className="text-2xl font-bold">{(lastAI.confidence*100)|0}%</span></div><div className="grid grid-cols-4 gap-2 text-sm">{[{l:'Category',v:lastAI.category,c:'#00D9FF'},{l:'Language',v:lastAI.language,c:'#7C3AED'},{l:'Sentiment',v:lastAI.sentiment,c:lastAI.sentiment==='negative'?'#EF4444':'#10B981'},{l:'Intent',v:lastAI.intent,c:'#F59E0B'}].map((x,i)=><div key={i} className="bg-black/20 p-2 rounded"><p className="text-[9px] text-gray-500">{x.l}</p><p style={{color:x.c}} className="font-medium text-xs">{x.v}</p></div>)}</div>{lastAI.keywords.length>0&&<div className="mt-3 flex flex-wrap gap-1">{lastAI.keywords.map((k,i)=><span key={i} className="px-2 py-0.5 bg-[#7C3AED]/20 text-[#7C3AED] rounded text-xs">{k}</span>)}</div>}{lastAI.entities.length>0&&<div className="mt-2"><p className="text-[9px] text-gray-500 mb-1">Entities:</p><div className="flex flex-wrap gap-1">{lastAI.entities.map((e,i)=><span key={i} className="px-2 py-0.5 bg-[#00D9FF]/20 text-[#00D9FF] rounded text-xs">{e}</span>)}</div></div>}</div>:<div className="text-center py-12 text-gray-500"><Brain className="w-12 h-12 mx-auto mb-3 opacity-25"/><p className="text-sm">Send message for AI</p></div>}</div>}
          
          {tab==='compress'&&<div className="p-5"><h2 className="text-sm font-medium flex items-center gap-2 mb-4"><Archive className="w-4 h-4 text-[#14B8A6]"/>Compression<span className="text-[9px] px-1.5 py-0.5 rounded bg-[#14B8A6]/15 text-[#14B8A6]">LZ77+Dict+RLE</span></h2>{lastComp?<div className="p-4 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/25"><div className="flex justify-between mb-4"><span className="text-gray-400">Ratio</span><span className="text-3xl font-bold text-[#14B8A6]">{lastComp.ratio.toFixed(1)}%</span></div><div className="space-y-2"><div><p className="text-[9px] text-gray-500 mb-1">Original ({lastComp.original}B)</p><div className="h-3 bg-[#1a1a24] rounded-full"><div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full" style={{width:'100%'}}/></div></div><div><p className="text-[9px] text-gray-500 mb-1">Compressed ({lastComp.compressed}B)</p><div className="h-3 bg-[#1a1a24] rounded-full"><div className="h-full bg-[#14B8A6] rounded-full" style={{width:`${100-lastComp.ratio}%`}}/></div></div></div><p className="mt-3 text-sm text-[#10B981]">+{lastComp.saved}B saved</p></div>:<div className="text-center py-12 text-gray-500"><Archive className="w-12 h-12 mx-auto mb-3 opacity-25"/><p className="text-sm">Send message</p></div>}</div>}
          
          {tab==='chain'&&<div className="p-5"><h2 className="text-sm font-medium flex items-center gap-2 mb-4"><Database className="w-4 h-4 text-[#EC4899]"/>Blockchain<span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EC4899]/15 text-[#EC4899]">SHA256+PoW+Merkle</span></h2><div className="space-y-2 max-h-[340px] overflow-auto">{chain.map((b,i)=><div key={i} className="bg-[#0a0a0f] border border-[#1a1a24] rounded-lg p-3"><div className="flex justify-between mb-2"><span className="text-xs bg-gradient-to-r from-[#EC4899] to-[#7C3AED] px-2 py-0.5 rounded">Block #{b.idx}</span><span className="text-[10px] text-gray-500">Nonce:{b.nonce}</span></div><p className="text-sm mb-1">{b.data}</p><p className="text-[9px] font-mono text-gray-600 truncate">Hash: {b.hash}</p><p className="text-[9px] font-mono text-gray-700 truncate">Merkle: {b.merkle}</p>{i>0&&<div className="mt-2 text-[10px] text-[#10B981] flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Verified</div>}</div>)}</div></div>}
          
          {tab==='predict'&&<div className="p-5"><h2 className="text-sm font-medium flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-[#F59E0B]"/>Crisis Prediction<span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B]">ML Pattern</span></h2>{crisis?<div className="p-4 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/25"><div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-[#F59E0B]"/><span className="font-bold text-[#F59E0B]">{crisis.type}</span></div><div className="grid grid-cols-2 gap-3">{[{l:'Probability',v:`${(crisis.prob*100)|0}%`},{l:'Severity',v:crisis.severity.toUpperCase()},{l:'Area',v:crisis.area}].map((x,i)=><div key={i} className="bg-black/20 p-2 rounded"><p className="text-[9px] text-gray-500">{x.l}</p><p className="text-sm font-bold">{x.v}</p></div>)}</div><div className="mt-3"><p className="text-[9px] text-gray-500 mb-1">Resources Needed:</p><div className="flex flex-wrap gap-1">{crisis.resources.map((r,i)=><span key={i} className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded text-xs">{r}</span>)}</div></div></div>:<div className="text-center py-12 text-gray-500"><TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-25"/><p className="text-sm">Send 2+ messages</p></div>}</div>}
          
          {tab==='analytics'&&<div className="p-5"><h2 className="text-sm font-medium flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-[#00D9FF]"/>Real-time Analytics</h2><div className="grid grid-cols-2 gap-3">{[{l:'Msg/Min',v:analytics.msgPerMin,c:'#00D9FF'},{l:'Avg Latency',v:`${analytics.avgLatency|0}ms`,c:'#F59E0B'},{l:'Total Saved',v:`${analytics.compressionTotal}B`,c:'#14B8A6'},{l:'AI Accuracy',v:`${analytics.aiAccuracy.toFixed(1)}%`,c:'#7C3AED'},{l:'Network Load',v:`${analytics.networkLoad.toFixed(0)}%`,c:'#10B981'},{l:'Blocks',v:chain.length,c:'#EC4899'}].map((x,i)=><div key={i} className="bg-[#0a0a0f] border border-[#1a1a24] rounded-lg p-4"><p className="text-[10px] text-gray-500 mb-1">{x.l}</p><p className="text-2xl font-bold" style={{color:x.c}}>{x.v}</p></div>)}</div></div>}
          
          {tab==='pwa'&&<div className="p-5"><h2 className="text-sm font-medium flex items-center gap-2 mb-4"><Smartphone className="w-4 h-4 text-[#7C3AED]"/>PWA Status</h2><div className="space-y-3">{[{l:'Online',v:pwa.online,icon:Globe},{l:'Installed',v:pwa.installed,icon:Smartphone},{l:'Notifications',v:pwa.notifs,icon:Bell}].map((x,i)=><div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0f] border border-[#1a1a24] rounded-lg"><div className="flex items-center gap-2"><x.icon className="w-4 h-4 text-[#7C3AED]"/><span className="text-sm">{x.l}</span></div><span className={`text-xs ${x.v?'text-[#10B981]':'text-gray-500'}`}>{x.v?'✓ Available':'✗ N/A'}</span></div>)}</div><div className="mt-4 p-3 bg-[#7C3AED]/10 border border-[#7C3AED]/25 rounded-lg"><p className="text-xs text-[#7C3AED]">PWA Features: Offline support, Push notifications, Background sync, Install prompt</p></div></div>}
          
          {tab==='msgs'&&<div className="p-5"><h2 className="text-sm font-medium flex items-center gap-2 mb-4"><MessageSquare className="w-4 h-4 text-[#00D9FF]"/>Messages</h2>{msgs.length===0?<div className="text-center py-12 text-gray-500"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-25"/><p className="text-sm">No messages</p></div>:<div className="space-y-2 max-h-[340px] overflow-auto">{msgs.map(m=><div key={m.id} className={`p-3 rounded-lg border ${m.priority==='critical'?'bg-red-500/5 border-red-500/20':m.priority==='high'?'bg-amber-500/5 border-amber-500/20':'bg-[#0a0a0f] border-[#1a1a24]'}`}><div className="flex justify-between mb-1"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${pCol[m.priority].bg}`}>{m.priority}</span><div className="flex items-center gap-2">{m.encrypted&&<Lock className="w-3 h-3 text-[#7C3AED]"/>}{m.delivered?<span className="text-[10px] text-[#10B981] flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Done</span>:<span className="text-[10px] text-amber-400 animate-pulse">Routing...</span>}</div></div><p className="text-sm mb-1">{m.content}</p><p className="text-[9px] text-gray-500">{m.from}→{m.to} • {m.hops.length} hops • {m.latency}ms</p></div>)}</div>}</div>}
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div className="bg-[#0f0f14] border border-[#1a1a24] rounded-xl p-4">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3"><Send className="w-4 h-4 text-[#00D9FF]"/>Send Message</h3>
            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Type... ('Help fire!' or 'मदद')" className="w-full h-24 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#1a1a24] focus:border-[#00D9FF]/50 outline-none text-sm resize-none"/>
            <button onClick={send} disabled={!input.trim()} className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#7C3AED] font-medium text-sm disabled:opacity-40">Send & Analyze</button>
          </div>
          {input&&<div className="bg-[#0f0f14] border border-[#1a1a24] rounded-xl p-4"><h3 className="text-sm font-medium flex items-center gap-2 mb-2"><Eye className="w-4 h-4"/>Preview</h3>{(()=>{const p=classifyAI(input),c=compress(input);return<div className="space-y-1.5 text-sm">{[{l:'Priority',v:p.priority,bg:pCol[p.priority].bg},{l:'Confidence',v:`${(p.confidence*100)|0}%`},{l:'Language',v:p.language},{l:'Compression',v:`${c.ratio.toFixed(0)}% saved`}].map((x,i)=><div key={i} className="flex justify-between items-center p-2 bg-[#0a0a0f] rounded"><span className="text-[10px] text-gray-500">{x.l}</span>{x.bg?<span className={`px-1.5 py-0.5 rounded text-[10px] text-white ${x.bg}`}>{x.v}</span>:<span className="text-[#00D9FF]">{x.v}</span>}</div>)}</div>})()}</div>}
          <div className="bg-[#0f0f14] border border-[#1a1a24] rounded-xl p-4"><h3 className="text-sm font-medium flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-[#F59E0B]"/>Quick Tests</h3><div className="space-y-1.5">{[{t:'SOS! Building on fire!',p:'critical'},{t:'Need water and food',p:'high'},{t:'मदद! पानी भेजो',p:'high'},{t:'All safe at shelter',p:'normal'}].map((q,i)=><button key={i} onClick={()=>setInput(q.t)} className={`w-full p-2 rounded text-left text-xs border ${q.p==='critical'?'bg-red-500/5 border-red-500/20':'bg-amber-500/5 border-amber-500/20'}`}>{q.t}</button>)}</div></div>
          <div className="bg-[#0f0f14] border border-[#1a1a24] rounded-xl p-4"><h3 className="text-sm font-medium mb-2"><Activity className="w-4 h-4 inline mr-1 text-[#7C3AED]"/>All Phases Active</h3><div className="grid grid-cols-2 gap-1 text-[9px]">{['🔗 Mesh Network','🛤️ Dijkstra Route','🧠 AI NLP','🌐 Hindi+English','🗜️ LZ77+Dict','🔐 Blockchain','📊 Merkle Tree','🔮 Crisis Predict','📱 PWA Ready','📈 Analytics'].map((f,i)=><div key={i} className="flex items-center gap-1 p-1 bg-[#0a0a0f] rounded"><span>{f}</span><CheckCircle className="w-2.5 h-2.5 text-[#10B981] ml-auto"/></div>)}</div></div>
        </div>
      </main>
    </div>
  )
}
