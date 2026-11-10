import { useEffect, useState } from 'react'
import { Check, X, Pencil, RefreshCw, ClipboardCheck } from 'lucide-react'
import { approveSchedule, getPendingSchedules, rejectSchedule, overrideSchedule } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { number, pick, rowsFrom, statusClass } from '../utils/format'

export default function Schedules(){
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [notice,setNotice]=useState(null);const [busyId,setBusyId]=useState(null)
  const [dialog,setDialog]=useState(null);const [form,setForm]=useState({reason:'',userId:2,newAction:'MAINTAIN'})
  const load=async()=>{setLoading(true);try{setRows(rowsFrom((await getPendingSchedules()).data));setNotice(null)}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  const action=async(type,row)=>{const id=pick(row,'scheduleId','schedule_id','id');setBusyId(id);try{if(type==='approve')await approveSchedule(id);if(type==='reject')await rejectSchedule(id,form.reason);if(type==='override')await overrideSchedule(id,Number(form.userId),form.newAction,form.reason);setNotice({type:'success',message:`Schedule ${id} updated successfully.`});setDialog(null);setForm({reason:'',userId:2,newAction:'MAINTAIN'});await load()}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setBusyId(null)}}
  const cols=[
    {key:'id',label:'Schedule ID',render:r=>pick(r,'scheduleId','schedule_id','id')},
    {key:'event',label:'Event',render:r=>pick(r,'eventId','event_id')},
    {key:'equipment',label:'Equipment',render:r=>pick(r,'equipmentId','equipment_id')},
    {key:'action',label:'Recommended action',render:r=><strong>{pick(r,'recommendedAction','recommended_action')??'—'}</strong>},
    {key:'reduction',label:'Estimated reduction',render:r=>`${number(pick(r,'expectedReductionKw','expected_reduction_kw'))} kW`},
    {key:'status',label:'Status',render:r=><span className={statusClass(pick(r,'scheduleStatus','schedule_status','status'))}>{pick(r,'scheduleStatus','schedule_status','status')??'—'}</span>},
    {key:'reason',label:'Reason',render:r=><span className="reason-cell">{pick(r,'reason')??'—'}</span>},
    {key:'actions',label:'Operator actions',render:r=><div className="table-actions"><button className="action-button approve" disabled={busyId===pick(r,'scheduleId','schedule_id','id')} onClick={()=>action('approve',r)} title="Approve"><Check size={15}/></button><button className="action-button reject" onClick={()=>{setDialog({type:'reject',row:r});setForm({...form,reason:''})}} title="Reject"><X size={15}/></button><button className="action-button override" onClick={()=>{setDialog({type:'override',row:r});setForm({reason:'',userId:2,newAction:'MAINTAIN'})}} title="Override"><Pencil size={15}/></button></div>}
  ]
  return <div className="stack-lg"><div className="page-actions"><div><span className="eyebrow">OPERATOR WORKFLOW</span><h2>Load schedule approvals</h2><p className="muted">Review recommendations before any simulated load action is approved.</p></div><button className="button secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div><Notice notice={notice} onClose={()=>setNotice(null)}/><div className="info-strip"><ClipboardCheck size={17}/><span>Only pending recommendations appear here. Approve, reject or override each recommendation using the operator workflow.</span></div><section className="panel"><div className="panel-heading"><div><h3>Pending recommendations</h3><p>{rows.length} pending item(s)</p></div></div>{loading?<Loading/>:<DataTable columns={cols} rows={rows}/>}</section>
    {dialog&&<div className="modal-backdrop" onClick={()=>setDialog(null)}><form className="modal" onSubmit={e=>{e.preventDefault();action(dialog.type,dialog.row)}} onClick={e=>e.stopPropagation()}><div className="modal-heading"><h3>{dialog.type==='reject'?'Reject recommendation':'Override recommendation'}</h3><button type="button" className="icon-button" onClick={()=>setDialog(null)}><X size={18}/></button></div><p className="muted">Schedule ID: {pick(dialog.row,'scheduleId','schedule_id','id')}</p>{dialog.type==='override'&&<><label>Operator user ID<input type="number" min="1" required value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})}/></label><label>New action<select value={form.newAction} onChange={e=>setForm({...form,newAction:e.target.value})}><option>MAINTAIN</option><option>REDUCE</option></select></label></>}<label>Reason<textarea required minLength="3" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Enter the reason for this decision"/></label><div className="form-actions"><button className="button primary" disabled={!!busyId}>{busyId?'Saving…':'Confirm'}</button><button type="button" className="button secondary" onClick={()=>setDialog(null)}>Cancel</button></div></form></div>}
  </div>
}
