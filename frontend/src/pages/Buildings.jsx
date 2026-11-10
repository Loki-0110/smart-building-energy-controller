import { Building2 } from 'lucide-react'
import CrudPage from '../components/CrudPage'
import { createBuilding, getBuildings, updateBuilding, deleteBuilding } from '../api/endpoints'
import { dateTime, pick } from '../utils/format'
export default function Buildings(){return <CrudPage title="Buildings" singular="Building" eyebrow="ASSET MANAGEMENT" description="Create, update and remove buildings registered with the controller." icon={Building2} idKey="buildingId" api={{list:getBuildings,create:createBuilding,update:updateBuilding,remove:deleteBuilding}} fields={[
{name:'buildingName',label:'Building name',placeholder:'e.g. Main Office'},
{name:'location',label:'Location',placeholder:'City / area'}
]} columns={[
{key:'id',label:'Building ID',render:r=>pick(r,'buildingId')},
{key:'name',label:'Building',render:r=><strong>{pick(r,'buildingName')}</strong>,searchValue:r=>pick(r,'buildingName')},
{key:'location',label:'Location',render:r=>pick(r,'location')},
{key:'created',label:'Created',render:r=>dateTime(pick(r,'createdAt'))}
]}/>}
