import { useEffect, useMemo, useState } from 'react'
import { Play, RefreshCw, Search, Zap } from 'lucide-react'
import { getBuildings, getPeakEvents, runPeakDetection } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { dateTime, number, pick, rowsFrom, statusClass } from '../utils/format'
export default function PeakEvents(){
  const [rows,setRows]=useState([]),[buildings,setBuildings]=useState([]),[buildingId,setBuildingId]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState(null),[search,setSearch]=useState('')
  const load=async({preserveNotice=false}={})=>{setLoading(true);try{const [e,b]=await Promise.all([getPeakEvents(),getBuildings()]);setRows(rowsFrom(e.data));const bs=rowsFrom(b.data);setBuildings(bs);if(!buildingId&&bs[0])setBuildingId(String(pick(bs[0],'buildingId')));if(!preserveNotice)setNotice(null)}catch(err){setNotice({type:'error',message:errorMessage(err)})}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  const detect=async()=>{if(!buildingId){setNotice({type:'error',message:'Select a building before running peak detection.'});return}if(!window.confirm(`Run peak detection for building ${buildingId}?`))return;setBusy(true);try{const r=await runPeakDetection(buildingId);setNotice({type:'success',message:r.status===204?'No new peak event was detected.': 'Peak detection completed. Refreshing event history.'});await load({preserveNotice:true})}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setBusy(false)}}
  const visible=useMemo(()=>rows.filter(r=>!search||JSON.stringify(r).toLowerCase().includes(search.toLowerCase())),[rows,search])
  const cols=[
    {key:'id',label:'Event ID',render:r=>pick(r,'eventId')},
    {key:'building',label:'Building',render:r=>{const b=buildings.find(x=>String(pick(x,'buildingId'))===String(pick(r,'buildingId')));return b?pick(b,'buildingName'):pick(r,'buildingId')}},
    {key:'start',label:'Start time',render:r=>dateTime(pick(r,'eventStartTime'))},
    {key:'end',label:'End time',render:r=>dateTime(pick(r,'eventEndTime'))},
    {key:'peak',label:'Peak demand',render:r=><strong>{number(pick(r,'peakDemandKw'))} kW</strong>},
    {key:'threshold',label:'Threshold',render:r=>`${number(pick(r,'thresholdKw'))} kW`},
    {key:'status',label:'Status',render:r=><span className={statusClass(pick(r,'eventStatus'))}>{pick(r,'eventStatus')||'—'}</span>}
  ]
  return <div className="stack-lg"><div className="page-actions"><div><span className="eyebrow">PEAK MANAGEMENT</span><h2>Peak events</h2><p className="muted">Monitor detected demand peaks and their lifecycle.</p></div><div className="button-row"><button className="button secondary" onClick={load} disabled={loading}><RefreshCw size={16}/> Refresh</button><select className="compact-select" value={buildingId} onChange={e=>setBuildingId(e.target.value)}><option value="">Select building</option>{buildings.map(b=><option key={pick(b,'buildingId')} value={pick(b,'buildingId')}>{pick(b,'buildingName')} · #{pick(b,'buildingId')}</option>)}</select><button className="button primary" disabled={busy||!buildingId} onClick={detect}><Play size={15}/>{busy?'Running…':'Run detection'}</button></div></div>
    <Notice notice={notice} onClose={()=>setNotice(null)}/><div className="info-strip"><Zap size={17}/><span>Detection evaluates stored meter readings against the active peak configuration. It does not control equipment. A 204 response means no new event was created.</span></div>
    <section className="panel"><div className="panel-heading"><div><h3>Peak event history</h3><p>{visible.length} event(s)</p></div></div><div className="toolbar"><div className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events"/></div></div>{loading?<Loading/>:<DataTable columns={cols} rows={visible}/>}</section></div>
}
