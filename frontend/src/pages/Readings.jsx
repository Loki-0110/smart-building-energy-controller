import { useEffect, useState } from 'react'
import { RefreshCw, Gauge } from 'lucide-react'
import { getMeterReadings } from '../api/endpoints'
import { errorMessage } from '../api/client'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'
import { dateTime, number, pick, rowsFrom, statusClass } from '../utils/format'

export default function Readings(){
  const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [notice,setNotice]=useState(null)
  const load=async()=>{setLoading(true);try{setRows(rowsFrom((await getMeterReadings()).data).sort((a,b)=>new Date(pick(b,'readingTimestamp','reading_timestamp'))-new Date(pick(a,'readingTimestamp','reading_timestamp'))));setNotice(null)}catch(e){setNotice({type:'error',message:errorMessage(e)})}finally{setLoading(false)}}
  useEffect(()=>{load()},[])
  const cols=[
    {key:'id',label:'Reading ID',render:r=>pick(r,'readingId','reading_id','id')},
    {key:'time',label:'Timestamp',render:r=>dateTime(pick(r,'readingTimestamp','reading_timestamp'))},
    {key:'demand',label:'Demand',render:r=><strong>{number(pick(r,'demandKw','demand_kw'))} kW</strong>},
    {key:'source',label:'Source',render:r=>pick(r,'sourceName','source_name')},
    {key:'quality',label:'Data quality',render:r=><span className={statusClass(pick(r,'dataQualityStatus','data_quality_status'))}>{pick(r,'dataQualityStatus','data_quality_status')??'—'}</span>}
  ]
  return <div className="stack-lg"><div className="page-actions"><div><span className="eyebrow">METERING</span><h2>Meter readings</h2><p className="muted">Validated readings ingested by the Python simulator.</p></div><button className="button secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div><Notice notice={notice} onClose={()=>setNotice(null)}/><section className="panel"><div className="panel-heading"><div><h3>Reading history</h3><p>{rows.length} record(s) returned</p></div><Gauge size={20} className="muted-icon"/></div>{loading?<Loading/>:<DataTable columns={cols} rows={rows}/>}</section></div>
}
