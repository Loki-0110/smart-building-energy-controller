import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, Building2, Cpu, Gauge, RefreshCw, Zap } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import StatCard from '../components/StatCard'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { getBuildings, getEquipment, getMeterReadings, getPeakEvents, getPendingSchedules } from '../api/endpoints'
import { errorMessage } from '../api/client'
import { dateTime, number, pick, rowsFrom, statusClass } from '../utils/format'

export default function Dashboard() {
  const [data, setData] = useState({ buildings: [], equipment: [], readings: [], events: [], pending: [] })
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const load = async () => {
    setLoading(true); setNotice(null)
    const results = await Promise.allSettled([getBuildings(), getEquipment(), getMeterReadings(), getPeakEvents(), getPendingSchedules()])
    const keys = ['buildings', 'equipment', 'readings', 'events', 'pending']
    const next = {}
    results.forEach((r, i) => { next[keys[i]] = r.status === 'fulfilled' ? rowsFrom(r.value.data) : [] })
    setData(next)
    const failed = results.filter(r => r.status === 'rejected')
    if (failed.length) setNotice({ type: 'error', message: `${failed.length} dashboard data source(s) could not be loaded. Check API routes and backend status.` })
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  const latest = [...data.readings].sort((a,b) => new Date(pick(b,'readingTimestamp','reading_timestamp')) - new Date(pick(a,'readingTimestamp','reading_timestamp')))[0]
  const openEvents = data.events.filter(e => ['OPEN','DETECTED'].includes(String(pick(e,'eventStatus','event_status','status')).toUpperCase()))
  const chartData = useMemo(() => [...data.readings]
    .sort((a,b) => new Date(pick(a,'readingTimestamp','reading_timestamp')) - new Date(pick(b,'readingTimestamp','reading_timestamp')))
    .slice(-20).map(r => ({
      time: new Date(pick(r,'readingTimestamp','reading_timestamp')).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
      demand: Number(pick(r,'demandKw','demand_kw') || 0)
    })), [data.readings])
  const columns = [
    { key:'eventId', label:'Event ID', render:r => pick(r,'eventId','event_id','id') ?? '—' },
    { key:'start', label:'Started', render:r => dateTime(pick(r,'eventStartTime','event_start_time')) },
    { key:'peak', label:'Peak demand', render:r => `${number(pick(r,'peakDemandKw','peak_demand_kw'))} kW` },
    { key:'status', label:'Status', render:r => <span className={statusClass(pick(r,'eventStatus','event_status','status'))}>{pick(r,'eventStatus','event_status','status') || '—'}</span> }
  ]
  return (
    <div className="stack-lg">
      <div className="page-actions"><div><span className="eyebrow">BUILDING MONITORING</span><h2>Energy overview</h2><p className="muted">A live view of data currently available from your backend.</p></div><button className="button secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div>
      <Notice notice={notice} onClose={() => setNotice(null)}/>
      {loading ? <Loading/> : <>
        <div className="stats-grid">
          <StatCard label="Buildings" value={data.buildings.length} note="Registered buildings" icon={Building2}/>
          <StatCard label="Latest demand" value={latest ? `${number(pick(latest,'demandKw','demand_kw'))} kW` : '—'} note={latest ? dateTime(pick(latest,'readingTimestamp','reading_timestamp')) : 'No readings'} icon={Gauge} tone="green"/>
          <StatCard label="Open peak events" value={openEvents.length} note="Detected / open events" icon={AlertTriangle} tone="orange"/>
          <StatCard label="Pending approvals" value={data.pending.length} note="Awaiting operator action" icon={Activity} tone="purple"/>
        </div>
        <div className="content-grid">
          <section className="panel chart-panel">
            <div className="panel-heading"><div><h3>Demand trend</h3><p>Latest 20 meter readings</p></div><span className="mini-tag">kW</span></div>
            {chartData.length ? <div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:12,right:12,left:-18,bottom:0}}><defs><linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f8df7" stopOpacity={0.28}/><stop offset="95%" stopColor="#4f8df7" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf4"/><XAxis dataKey="time" tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8792a5'}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#8792a5'}}/><Tooltip/><Area type="monotone" dataKey="demand" stroke="#3978e8" strokeWidth={2.5} fill="url(#demandFill)" /></AreaChart></ResponsiveContainer></div> : <div className="empty-state"><Gauge size={28}/><p>No meter readings available yet.</p></div>}
          </section>
          <section className="panel side-summary">
            <div className="panel-heading"><div><h3>System snapshot</h3><p>Current registered assets</p></div></div>
            <div className="snapshot-row"><span><Cpu size={17}/> Equipment units</span><strong>{data.equipment.length}</strong></div>
            <div className="snapshot-row"><span><Zap size={17}/> Peak events recorded</span><strong>{data.events.length}</strong></div>
            <div className="snapshot-row"><span><Activity size={17}/> Meter readings</span><strong>{data.readings.length}</strong></div>
            <div className="snapshot-note">Peak reductions shown in this application are theoretical estimates and require operator approval.</div>
          </section>
        </div>
        <section className="panel">
          <div className="panel-heading"><div><h3>Recent peak events</h3><p>Latest events returned by the backend</p></div></div>
          <DataTable columns={columns} rows={[...data.events].sort((a,b) => new Date(pick(b,'eventStartTime','event_start_time')) - new Date(pick(a,'eventStartTime','event_start_time'))).slice(0,6)} empty="No peak events found. If your backend uses a different GET route, update src/api/endpoints.js."/>
        </section>
      </>}
    </div>
  )
}
