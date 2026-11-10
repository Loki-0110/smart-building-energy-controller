import { useEffect, useState } from 'react'
import { RefreshCw, Zap, Play } from 'lucide-react'
import { getBuildings, getPeakEvents, runPeakDetection } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { dateTime, number, pick, rowsFrom, statusClass } from '../utils/format'

export default function PeakEvents(){
  const [rows,setRows]=useState([]);const [buildings,setBuildings]=useState([]);const [buildingId,setBuildingId]=useState('1');const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [notice,setNotice]=useState(null)
  const load=async()=>{setLoading(true);try{const [e,b]=await Promise.all([getPeakEvents(),getBuildings()]);setRows(rowsFrom(e.data));setBuildings(rowsFrom(b.data));if(rowsFrom(b.data)[0])setBuildingId(String(pick(rowsFrom(b.data)[0],'buildingId','building_id','id')));setNotice(null)}catch(err){setNotice({type:'error',message:errorMessage(err)})}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  const detect=async()=>{setBusy(true);try{const r=await runPeakDetection(buildingId);setNotice({type:'success',message:typeof r.data==='string'?r.data:'Peak detection request completed.'});await load()}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setBusy(false)}}
  const cols=[
    {key:'id',label:'Event ID',render:r=>pick(r,'eventId','event_id','id')},
    {key:'building',label:'Building',render:r=>pick(r,'buildingId','building_id')},
    {key:'start',label:'Start time',render:r=>dateTime(pick(r,'eventStartTime','event_start_time'))},
    {key:'end',label:'End time',render:r=>dateTime(pick(r,'eventEndTime','event_end_time'))},
    {key:'peak',label:'Peak demand',render:r=><strong>{number(pick(r,'peakDemandKw','peak_demand_kw'))} kW</strong>},
    {key:'threshold',label:'Threshold',render:r=>`${number(pick(r,'thresholdKw','threshold_kw'))} kW`},
    {key:'status',label:'Status',render:r=><span className={statusClass(pick(r,'eventStatus','event_status','status'))}>{pick(r,'eventStatus','event_status','status')??'—'}</span>}
  ]
  return <div className="stack-lg"><div className="page-actions"><div><span className="eyebrow">PEAK MANAGEMENT</span><h2>Peak events</h2><p className="muted">Monitor event creation, demand peaks and resolution.</p></div><div className="button-row"><button className="button secondary" onClick={load}><RefreshCw size={16}/> Refresh</button><select className="compact-select" value={buildingId} onChange={e=>setBuildingId(e.target.value)}>{buildings.length?buildings.map(b=><option key={pick(b,'buildingId','building_id','id')} value={pick(b,'buildingId','building_id','id')}>{pick(b,'buildingName','building_name','name')||`Building ${pick(b,'buildingId','building_id','id')}`}</option>):<option value="1">Building 1</option>}</select><button className="button primary" disabled={busy} onClick={detect}><Play size={15}/>{busy?'Running…':'Run detection'}</button></div></div><Notice notice={notice} onClose={()=>setNotice(null)}/><div className="info-strip"><Zap size={17}/><span>An event starts when a valid reading exceeds its active threshold and no active event already exists for that building. Further high readings update the active event.</span></div><section className="panel"><div className="panel-heading"><div><h3>Peak event history</h3><p>{rows.length} event(s)</p></div></div>{loading?<Loading/>:<DataTable columns={cols} rows={rows}/>}</section></div>
}
