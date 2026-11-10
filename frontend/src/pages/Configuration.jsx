import { SlidersHorizontal } from 'lucide-react'
import CrudPage from '../components/CrudPage'
import { createPeakConfig, getPeakConfigs, updatePeakConfig, deletePeakConfig, getBuildings } from '../api/endpoints'
import { dateTime, number, pick, statusClass } from '../utils/format'
export default function Configuration(){return <CrudPage title="Peak configurations" singular="Peak configuration" eyebrow="SYSTEM SETTINGS" description="Set the demand threshold and active date-time window used by peak detection." icon={SlidersHorizontal} idKey="configId" api={{list:getPeakConfigs,create:createPeakConfig,update:updatePeakConfig,remove:deletePeakConfig}} lookup={[{name:'buildings',load:getBuildings}]} fields={[
{name:'buildingId',label:'Building',type:'select',optionsFrom:'buildings',optionValue:'buildingId',optionLabel:'buildingName',default:''},
{name:'peakThresholdKw',label:'Peak threshold (kW)',type:'number',min:'0',step:'0.1'},
{name:'configStartTime',label:'Configuration start',type:'datetime-local'},
{name:'configEndTime',label:'Configuration end',type:'datetime-local'},
{name:'active',label:'Active configuration',type:'checkbox',default:true}
]} columns={[
{key:'id',label:'Config ID',render:r=>pick(r,'configId')},
{key:'building',label:'Building',render:r=>pick(r,'buildingId')},
{key:'threshold',label:'Threshold',render:r=>`${number(pick(r,'peakThresholdKw'))} kW`},
{key:'start',label:'Start',render:r=>dateTime(pick(r,'configStartTime'))},
{key:'end',label:'End',render:r=>dateTime(pick(r,'configEndTime'))},
{key:'active',label:'Active',render:r=><span className={statusClass(String(pick(r,'active')))}>{String(pick(r,'active'))}</span>}
]}/>}
