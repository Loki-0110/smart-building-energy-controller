import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Cpu } from 'lucide-react'
import { createEquipment, getEquipment } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { pick, rowsFrom, statusClass } from '../utils/format'

export default function Equipment() {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true); const [notice,setNotice]=useState(null); const [show,setShow]=useState(false)
  const [form,setForm]=useState({buildingId:1,equipmentName:'',equipmentType:'HVAC',priorityLevel:'MEDIUM',isCritical:false,isControllable:true,ratedPowerKw:5,currentStatus:'ON',areaName:''})
  const load=async()=>{setLoading(true);try{setRows(rowsFrom((await getEquipment()).data));setNotice(null)}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  const submit=async(e)=>{e.preventDefault();try{await createEquipment({...form,buildingId:Number(form.buildingId),ratedPowerKw:Number(form.ratedPowerKw)});setNotice({type:'success',message:'Equipment registered.'});setShow(false);load()}catch(e){setNotice({type:'error',message:errorMessage(e)})}}
  const cols=[
    {key:'id',label:'ID',render:r=>pick(r,'equipmentId','equipment_id','id')},
    {key:'name',label:'Equipment',render:r=>pick(r,'equipmentName','equipment_name','name')},
    {key:'type',label:'Type',render:r=>pick(r,'equipmentType','equipment_type')},
    {key:'area',label:'Area',render:r=>pick(r,'areaName','area_name')},
    {key:'power',label:'Rated power',render:r=>`${pick(r,'ratedPowerKw','rated_power_kw')??'—'} kW`},
    {key:'priority',label:'Priority',render:r=>pick(r,'priorityLevel','priority_level')},
    {key:'status',label:'Status',render:r=><span className={statusClass(pick(r,'currentStatus','current_status'))}>{pick(r,'currentStatus','current_status')??'—'}</span>}
  ]
  return <div className="stack-lg">
    <div className="page-actions"><div><span className="eyebrow">ASSET MANAGEMENT</span><h2>Equipment</h2><p className="muted">Review equipment properties used by the eligibility engine.</p></div><div className="button-row"><button className="button secondary" onClick={load}><RefreshCw size={16}/> Refresh</button><button className="button primary" onClick={()=>setShow(!show)}><Plus size={16}/> Add equipment</button></div></div>
    <Notice notice={notice} onClose={()=>setNotice(null)}/>
    {show&&<form className="panel form-panel" onSubmit={submit}><h3>Register equipment</h3><div className="form-grid">
      <label>Building ID<input type="number" min="1" required value={form.buildingId} onChange={e=>setForm({...form,buildingId:e.target.value})}/></label>
      <label>Equipment name<input required value={form.equipmentName} onChange={e=>setForm({...form,equipmentName:e.target.value})}/></label>
      <label>Equipment type<select value={form.equipmentType} onChange={e=>setForm({...form,equipmentType:e.target.value})}><option>HVAC</option><option>LIGHTING</option><option>FAN</option><option>PUMP</option><option>OTHER</option></select></label>
      <label>Area name<input value={form.areaName} onChange={e=>setForm({...form,areaName:e.target.value})}/></label>
      <label>Priority<select value={form.priorityLevel} onChange={e=>setForm({...form,priorityLevel:e.target.value})}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
      <label>Rated power (kW)<input type="number" min="0.1" step="0.1" required value={form.ratedPowerKw} onChange={e=>setForm({...form,ratedPowerKw:e.target.value})}/></label>
      <label>Current status<select value={form.currentStatus} onChange={e=>setForm({...form,currentStatus:e.target.value})}><option>ON</option><option>OFF</option></select></label>
      <label className="check-label"><input type="checkbox" checked={form.isCritical} onChange={e=>setForm({...form,isCritical:e.target.checked})}/> Critical equipment</label>
      <label className="check-label"><input type="checkbox" checked={form.isControllable} onChange={e=>setForm({...form,isControllable:e.target.checked})}/> Controllable</label>
    </div><div className="form-actions"><button className="button primary">Save equipment</button><button type="button" className="button secondary" onClick={()=>setShow(false)}>Cancel</button></div></form>}
    <section className="panel"><div className="panel-heading"><div><h3>Registered equipment</h3><p>{rows.length} record(s)</p></div><Cpu size={20} className="muted-icon"/></div>{loading?<Loading/>:<DataTable columns={cols} rows={rows}/>}</section>
  </div>
}
