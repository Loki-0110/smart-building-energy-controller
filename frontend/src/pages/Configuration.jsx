import { useEffect, useState } from 'react'
import { Plus, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { createPeakConfig, getPeakConfigs } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { pick, rowsFrom, statusClass } from '../utils/format'

export default function Configuration(){
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [notice,setNotice]=useState(null);const [show,setShow]=useState(false)
  const [form,setForm]=useState({buildingId:1,peakThresholdKw:180,configStartTime:'00:00:00',configEndTime:'23:59:59',isActive:true})
  const load=async()=>{setLoading(true);try{setRows(rowsFrom((await getPeakConfigs()).data));setNotice(null)}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  const submit=async(e)=>{e.preventDefault();try{await createPeakConfig({...form,buildingId:Number(form.buildingId),peakThresholdKw:Number(form.peakThresholdKw)});setNotice({type:'success',message:'Peak configuration saved.'});setShow(false);load()}catch(e){setNotice({type:'error',message:errorMessage(e)})}}
  const cols=[
    {key:'id',label:'Config ID',render:r=>pick(r,'configId','config_id','id')},
    {key:'building',label:'Building',render:r=>pick(r,'buildingId','building_id')},
    {key:'threshold',label:'Peak threshold',render:r=>`${pick(r,'peakThresholdKw','peak_threshold_kw')??'—'} kW`},
    {key:'start',label:'Start time',render:r=>pick(r,'configStartTime','config_start_time')},
    {key:'end',label:'End time',render:r=>pick(r,'configEndTime','config_end_time')},
    {key:'active',label:'Active',render:r=><span className={statusClass(pick(r,'isActive','is_active')?'VALID':'INACTIVE')}>{String(pick(r,'isActive','is_active'))}</span>}
  ]
  return <div className="stack-lg"><div className="page-actions"><div><span className="eyebrow">SYSTEM SETTINGS</span><h2>Peak configuration</h2><p className="muted">Configure the threshold and daily time window used by peak detection.</p></div><div className="button-row"><button className="button secondary" onClick={load}><RefreshCw size={16}/> Refresh</button><button className="button primary" onClick={()=>setShow(!show)}><Plus size={16}/> Add configuration</button></div></div><Notice notice={notice} onClose={()=>setNotice(null)}/>{show&&<form className="panel form-panel" onSubmit={submit}><h3>New peak configuration</h3><div className="form-grid"><label>Building ID<input type="number" min="1" required value={form.buildingId} onChange={e=>setForm({...form,buildingId:e.target.value})}/></label><label>Threshold (kW)<input type="number" min="1" step="0.1" required value={form.peakThresholdKw} onChange={e=>setForm({...form,peakThresholdKw:e.target.value})}/></label><label>Start time<input type="time" step="1" required value={form.configStartTime} onChange={e=>setForm({...form,configStartTime:e.target.value})}/></label><label>End time<input type="time" step="1" required value={form.configEndTime} onChange={e=>setForm({...form,configEndTime:e.target.value})}/></label><label className="check-label"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/> Active configuration</label></div><div className="form-actions"><button className="button primary">Save configuration</button><button type="button" className="button secondary" onClick={()=>setShow(false)}>Cancel</button></div></form>}<section className="panel"><div className="panel-heading"><div><h3>Configured thresholds</h3><p>{rows.length} configuration(s)</p></div><SlidersHorizontal size={20} className="muted-icon"/></div>{loading?<Loading/>:<DataTable columns={cols} rows={rows}/>}</section></div>
}
