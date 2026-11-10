import { Cpu } from 'lucide-react'
import CrudPage from '../components/CrudPage'
import { createEquipment, getEquipment, updateEquipment, deleteEquipment, getBuildings } from '../api/endpoints'
import { number, pick, statusClass } from '../utils/format'
export default function Equipment(){return <CrudPage title="Equipment" singular="Equipment" eyebrow="ASSET MANAGEMENT" description="Manage equipment attributes used by the eligibility and load recommendation engine." icon={Cpu} idKey="equipmentId" api={{list:getEquipment,create:createEquipment,update:updateEquipment,remove:deleteEquipment}} lookup={[{name:'buildings',load:getBuildings}]} fields={[
{name:'buildingId',label:'Building',type:'select',optionsFrom:'buildings',optionValue:'buildingId',optionLabel:'buildingName',default:'',required:true,options:[]},
{name:'equipmentName',label:'Equipment name'},
{name:'equipmentType',label:'Equipment type',type:'select',options:['HVAC','LIGHTING','FAN','PUMP','OTHER'],default:'HVAC'},
{name:'areaName',label:'Area name',required:false},
{name:'priorityLevel',label:'Priority',type:'select',options:['LOW','MEDIUM','HIGH'],default:'MEDIUM'},
{name:'ratedPowerKw',label:'Rated power (kW)',type:'number',min:'0',step:'0.1',default:'5'},
{name:'currentStatus',label:'Current status',type:'select',options:['ON','OFF'],default:'ON'},
{name:'critical',label:'Critical equipment',type:'checkbox',default:false},
{name:'controllable',label:'Controllable equipment',type:'checkbox',default:true}
]} columns={[
{key:'id',label:'ID',render:r=>pick(r,'equipmentId')},
{key:'name',label:'Equipment',render:r=><strong>{pick(r,'equipmentName')}</strong>,searchValue:r=>pick(r,'equipmentName')},
{key:'building',label:'Building ID',render:r=>pick(r,'buildingId')},
{key:'type',label:'Type',render:r=>pick(r,'equipmentType')},
{key:'area',label:'Area',render:r=>pick(r,'areaName')},
{key:'power',label:'Rated power',render:r=>`${number(pick(r,'ratedPowerKw'))} kW`},
{key:'priority',label:'Priority',render:r=>pick(r,'priorityLevel')},
{key:'critical',label:'Critical',render:r=><span className={statusClass(String(pick(r,'critical')))}>{String(pick(r,'critical'))}</span>},
{key:'status',label:'Status',render:r=><span className={statusClass(pick(r,'currentStatus'))}>{pick(r,'currentStatus')}</span>}
]}/>}
