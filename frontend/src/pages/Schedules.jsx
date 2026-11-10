import { useEffect, useMemo, useState } from 'react'
import { Check, ClipboardCheck, Pencil, RefreshCw, X, Search } from 'lucide-react'
import { approveSchedule, getAllLoadSchedules, rejectSchedule, overrideSchedule } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { number, pick, rowsFrom, statusClass } from '../utils/format'

export default function Schedules(){
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[notice,setNotice]=useState(null),[busyId,setBusyId]=useState(null)
  const [dialog,setDialog]=useState(null),[filter,setFilter]=useState('ALL'),[search,setSearch]=useState('')
  const [form,setForm]=useState({reason:'',userId:'',newAction:'MAINTAIN'})
  const load=async({preserveNotice=false}={})=>{setLoading(true);try{setRows(rowsFrom((await getAllLoadSchedules()).data));if(!preserveNotice)setNotice(null)}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  const action=async(type,row)=>{const id=pick(row,'scheduleId','schedule_id','id');if(type==='approve'&&!window.confirm(`Approve recommendation ${id}? This records an operator approval; it does not control physical equipment.`))return
    setBusyId(id);try{
      if(type==='approve')await approveSchedule(id)
      if(type==='reject')await rejectSchedule(id,form.reason.trim())
      if(type==='override')await overrideSchedule(id,Number(form.userId),form.newAction,form.reason.trim())
      setNotice({type:'success',message:`Recommendation ${id} updated.`});setDialog(null);setForm({reason:'',userId:'',newAction:'MAINTAIN'});await load({preserveNotice:true})
    }catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setBusyId(null)}}
  const visible=useMemo(()=>rows.filter(r=>(filter==='ALL'||String(pick(r,'scheduleStatus')).toUpperCase()===filter)&&(!search||JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))),[rows,filter,search])
  const cols=[
    {key:'id',label:'Schedule',render:r=>pick(r,'scheduleId')},
    {key:'event',label:'Event',render:r=>pick(r,'eventId')},
    {key:'equipment',label:'Equipment',render:r=>pick(r,'equipmentId')},
    {key:'action',label:'Recommended action',render:r=><strong>{pick(r,'recommendedAction')||'—'}</strong>},
    {key:'reduction',label:'Estimated reduction',render:r=>`${number(pick(r,'expectedReductionKw'))} kW`},
    {key:'status',label:'Status',render:r=><span className={statusClass(pick(r,'scheduleStatus'))}>{pick(r,'scheduleStatus')||'—'}</span>},
    {key:'reason',label:'Reason',render:r=><span className="reason-cell">{pick(r,'reason')||'—'}</span>},
    {key:'actions',label:'Operator actions',render:r=>{const status=String(pick(r,'scheduleStatus')||'').toUpperCase();const id=pick(r,'scheduleId');return <div className="table-actions">{status==='PENDING'&&<><button className="action-button approve" title="Approve" disabled={busyId===id} onClick={()=>action('approve',r)}><Check size={15}/></button><button className="action-button reject" title="Reject" disabled={busyId===id} onClick={()=>{setDialog({type:'reject',row:r});setForm({reason:'',userId:'',newAction:'MAINTAIN'})}}><X size={15}/></button></>}{['PENDING','APPROVED'].includes(status)&&<button className="action-button override" title="Override" disabled={busyId===id} onClick={()=>{setDialog({type:'override',row:r});setForm({reason:'',userId:'',newAction:'MAINTAIN'})}}><Pencil size={15}/></button>}</div>}}
  ]
  return <div className="stack-lg">
    <div className="page-actions"><div><span className="eyebrow">OPERATOR WORKFLOW</span><h2>Load schedule approvals</h2><p className="muted">Review recommendations. Actions are recorded only; no physical equipment is controlled.</p></div><button className="button secondary" onClick={load} disabled={loading}><RefreshCw size={16}/> Refresh</button></div>
    <Notice notice={notice} onClose={()=>setNotice(null)}/>
    <div className="info-strip"><ClipboardCheck size={17}/><span>Approve or reject pending recommendations. Overrides require an active ADMIN or OPERATOR user ID that exists in your backend database.</span></div>
    <section className="panel"><div className="panel-heading"><div><h3>Recommendation history</h3><p>{visible.length} of {rows.length} schedule(s)</p></div></div>
      <div className="toolbar"><div className="filter-tabs">{['ALL','PENDING','APPROVED','REJECTED','OVERRIDDEN'].map(x=><button key={x} className={filter===x?'filter-tab active':'filter-tab'} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schedules"/></div></div>
      {loading?<Loading/>:<DataTable columns={cols} rows={visible}/>}
    </section>
    {dialog&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDialog(null)}}><form className="modal" onSubmit={e=>{e.preventDefault();action(dialog.type,dialog.row)}}><div className="modal-heading"><h3>{dialog.type==='reject'?'Reject recommendation':'Override recommendation'}</h3><button type="button" className="icon-button" onClick={()=>setDialog(null)}><X size={18}/></button></div>
      <p className="muted">Schedule ID: {pick(dialog.row,'scheduleId')}</p>
      {dialog.type==='override'&&<label>Active operator user ID<input type="number" min="1" required value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})} placeholder="Enter an ADMIN / OPERATOR user ID"/></label>}
      {dialog.type==='override'&&<label>New action<select value={form.newAction} onChange={e=>setForm({...form,newAction:e.target.value})}><option value="MAINTAIN">MAINTAIN</option><option value="REDUCE">REDUCE</option></select></label>}
      <label>{dialog.type==='reject'?'Rejection reason':'Override reason'}<textarea required minLength="3" maxLength="255" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Explain the operator decision"/></label>
      <div className="form-actions"><button className="button secondary" type="button" onClick={()=>setDialog(null)}>Cancel</button><button className="button primary" disabled={!!busyId}>{busyId?'Saving…':'Confirm action'}</button></div>
    </form></div>}
  </div>
}
