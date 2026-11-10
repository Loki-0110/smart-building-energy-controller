import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Building2 } from 'lucide-react'
import { createBuilding, getBuildings } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { pick, rowsFrom, dateTime } from '../utils/format'

export default function Buildings() {
  const [rows,setRows] = useState([]); const [loading,setLoading] = useState(true)
  const [notice,setNotice] = useState(null); const [show,setShow] = useState(false)
  const [form,setForm] = useState({buildingName:'',location:''})
  const load = async () => { setLoading(true); try { setRows(rowsFrom((await getBuildings()).data)); setNotice(null) } catch(e) { setNotice({type:'error',message:errorMessage(e)}) } finally { setLoading(false) } }
  useEffect(()=>{load()},[])
  const submit = async (e) => { e.preventDefault(); try { await createBuilding(form); setNotice({type:'success',message:'Building created successfully.'}); setForm({buildingName:'',location:''}); setShow(false); load() } catch(e) { setNotice({type:'error',message:errorMessage(e)}) } }
  const cols = [
    {key:'id',label:'Building ID',render:r=>pick(r,'buildingId','building_id','id')},
    {key:'name',label:'Building name',render:r=>pick(r,'buildingName','building_name','name')},
    {key:'location',label:'Location',render:r=>pick(r,'location')},
    {key:'created',label:'Created at',render:r=>dateTime(pick(r,'createdAt','created_at'))}
  ]
  return <div className="stack-lg">
    <div className="page-actions"><div><span className="eyebrow">ASSET MANAGEMENT</span><h2>Buildings</h2><p className="muted">View and register buildings connected to the controller.</p></div><div className="button-row"><button className="button secondary" onClick={load}><RefreshCw size={16}/> Refresh</button><button className="button primary" onClick={()=>setShow(!show)}><Plus size={16}/> Add building</button></div></div>
    <Notice notice={notice} onClose={()=>setNotice(null)}/>
    {show && <form className="panel form-panel" onSubmit={submit}><h3>Register building</h3><div className="form-grid"><label>Building name<input required value={form.buildingName} onChange={e=>setForm({...form,buildingName:e.target.value})} placeholder="e.g. Main Office"/></label><label>Location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="City / area"/></label></div><div className="form-actions"><button className="button primary">Save building</button><button type="button" className="button secondary" onClick={()=>setShow(false)}>Cancel</button></div></form>}
    <section className="panel"><div className="panel-heading"><div><h3>Registered buildings</h3><p>{rows.length} record(s)</p></div><Building2 size={20} className="muted-icon"/></div>{loading?<Loading/>:<DataTable columns={cols} rows={rows}/>}</section>
  </div>
}
