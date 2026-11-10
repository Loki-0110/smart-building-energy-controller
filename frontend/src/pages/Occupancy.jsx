import { Users } from 'lucide-react'
import CrudPage from '../components/CrudPage'
import { createOccupancySchedule, getOccupancySchedules, updateOccupancySchedule, deleteOccupancySchedule, getBuildings } from '../api/endpoints'
import { dateTime, pick, statusClass } from '../utils/format'
export default function Occupancy(){return <CrudPage title="Occupancy schedules" singular="Occupancy schedule" eyebrow="OCCUPANCY" description="Maintain occupancy windows used by equipment eligibility safeguards." icon={Users} idKey="occupancyId" api={{list:getOccupancySchedules,create:createOccupancySchedule,update:updateOccupancySchedule,remove:deleteOccupancySchedule}} lookup={[{name:'buildings',load:getBuildings}]} fields={[
{name:'buildingId',label:'Building',type:'select',optionsFrom:'buildings',optionValue:'buildingId',optionLabel:'buildingName',default:''},
{name:'areaName',label:'Area name'},
{name:'startTime',label:'Start time',type:'datetime-local'},
{name:'endTime',label:'End time',type:'datetime-local'},
{name:'occupancyStatus',label:'Occupancy status',type:'select',options:['OCCUPIED','UNOCCUPIED','UNKNOWN'],default:'OCCUPIED'},
{name:'expectedOccupancy',label:'Expected people',type:'number',min:'0',step:'1',default:'0'}
]} columns={[
{key:'id',label:'ID',render:r=>pick(r,'occupancyId')},
{key:'building',label:'Building',render:r=>pick(r,'buildingId')},
{key:'area',label:'Area',render:r=>pick(r,'areaName')},
{key:'start',label:'Start',render:r=>dateTime(pick(r,'startTime'))},
{key:'end',label:'End',render:r=>dateTime(pick(r,'endTime'))},
{key:'occupancy',label:'Status',render:r=><span className={statusClass(pick(r,'occupancyStatus'))}>{pick(r,'occupancyStatus')}</span>},
{key:'people',label:'Expected people',render:r=>pick(r,'expectedOccupancy')??'—'}
]}/>}
