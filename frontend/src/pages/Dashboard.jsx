import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowRight, Building2, Cpu, Gauge, RefreshCw, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import StatCard from '../components/StatCard'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { getBuildings,getEquipment,getMeterReadings,getPeakEvents,getPendingSchedules,getOccupancySchedules } from '../api/endpoints'
import { errorMessage } from '../api/client'
import { dateTime,number,pick,rowsFrom,statusClass } from '../utils/format'
export default function Dashboard(){
 const [data,setData]=useState({buildings:[],equipment:[],readings:[],events:[],pending:[],occupancy:[]}),[loading,setLoading]=useState(true),[notice,setNotice]=useState(null)
 const load=async()=>{setLoading(true);const tasks=[getBuildings,getEquipment,getMeterReadings,getPeakEvents,getPendingSchedules,getOccupancySchedules];const keys=['buildings','equipment','readings','events','pending','occupancy'];const res=await Promise.allSettled(tasks.map(fn=>fn()));const next={};res.forEach((r,i)=>next[keys[i]]=r.status==='fulfilled'?rowsFrom(r.value.data):[]);setData(next);const failed=res.filter(r=>r.status==='rejected');setNotice(failed.length?{type:'error',message:`${failed.length} data source(s) failed. Check Spring Boot and the API URL.`}:null);setLoading(false)}
 useEffect(()=>{load()},[])
 const latest=[...data.readings].sort((a,b)=>new Date(pick(b,'readingTimestamp'))-new Date(pick(a,'readingTimestamp')))[0]
 const open=data.events.filter(e=>['OPEN','DETECTED','ACTIVE'].includes(String(pick(e,'eventStatus')||'').toUpperCase()))
 const chart=useMemo(()=>[...data.readings].sort((a,b)=>new Date(pick(a,'readingTimestamp'))-new Date(pick(b,'readingTimestamp'))).slice(-30).map(r=>({time:new Date(pick(r,'readingTimestamp')).toLocaleString([], {month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'}),demand:Number(pick(r,'demandKw')||0)})),[data.readings])
 const cols=[{key:'id',label:'Event',render:r=>`#${pick(r,'eventId')}`},{key:'building',label:'Building',render:r=>pick(r,'buildingId')},{key:'time',label:'Started',render:r=>dateTime(pick(r,'eventStartTime'))},{key:'peak',label:'Peak',render:r=>`${number(pick(r,'peakDemandKw'))} kW`},{key:'status',label:'Status',render:r=><span className={statusClass(pick(r,'eventStatus'))}>{pick(r,'eventStatus')||'—'}</span>}]
 return <div className="stack-lg"><div className="page-actions"><div><span className="eyebrow">BUILDING MONITORING</span><h2>Energy overview</h2><p className="muted">Operational snapshot from the connected Spring Boot APIs.</p></div><button className="button secondary" onClick={load} disabled={loading}><RefreshCw size={16}/> Refresh data</button></div><Notice notice={notice} onClose={()=>setNotice(null)}/>
 {loading?<Loading/>:<><div className="stats-grid">
 <StatCard label="Buildings" value={data.buildings.length} note="Registered buildings" icon={Building2}/>
 <StatCard label="Equipment" value={data.equipment.length} note="Registered assets" icon={Cpu} tone="green"/>
 <StatCard label="Latest demand" value={latest?`${number(pick(latest,'demandKw'))} kW`:'—'} note={latest?dateTime(pick(latest,'readingTimestamp')):'No readings'} icon={Gauge}/>
 <StatCard label="Open peak events" value={open.length} note={`${data.events.length} total events`} icon={AlertTriangle} tone="orange"/>
 <StatCard label="Pending approvals" value={data.pending.length} note="Awaiting operator action" icon={Activity} tone="purple"/>
 <StatCard label="Occupancy windows" value={data.occupancy.length} note="Configured schedules" icon={Users}/>
 </div>
 <div className="content-grid"><section className="panel"><div className="panel-heading"><div><h3>Demand trend</h3><p>Most recent 30 readings returned by the API</p></div><span className="mini-tag">kW</span></div>{chart.length?<div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{top:12,right:12,left:-18,bottom:0}}><defs><linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3978e8" stopOpacity={.25}/><stop offset="95%" stopColor="#3978e8" stopOpacity={.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={25}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Area type="monotone" dataKey="demand" name="Demand (kW)" stroke="#3978e8" strokeWidth={2.5} fill="url(#demandFill)"/></AreaChart></ResponsiveContainer></div>:<div className="empty-state"><Gauge size={28}/><p>No meter readings available yet.</p></div>}</section>
 <section className="panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Navigate to operational modules</p></div></div><div className="quick-links"><Link to="/buildings"><Building2/> Manage buildings <ArrowRight/></Link><Link to="/equipment"><Cpu/> Manage equipment <ArrowRight/></Link><Link to="/readings"><Gauge/> View meter readings <ArrowRight/></Link><Link to="/events"><Zap/> Peak events <ArrowRight/></Link><Link to="/schedules"><Activity/> Review recommendations <ArrowRight/></Link></div><div className="snapshot-note">All demand and reduction values are based on simulation or stored meter data. Recommendations require operator approval and do not control physical equipment.</div></section></div>
 <section className="panel"><div className="panel-heading"><div><h3>Recent peak events</h3><p>Latest events returned by the backend</p></div><Link className="text-link" to="/events">View all <ArrowRight size={14}/></Link></div><DataTable columns={cols} rows={[...data.events].sort((a,b)=>new Date(pick(b,'eventStartTime'))-new Date(pick(a,'eventStartTime'))).slice(0,6)}/></section></>}
 </div>
}
