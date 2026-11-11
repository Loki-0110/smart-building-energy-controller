
import { Gauge } from 'lucide-react'
import CrudPage from '../components/CrudPage'
import {
  createMeterReading,
  getMeterReadings,
  updateMeterReading,
  deleteMeterReading,
  getBuildings
} from '../api/endpoints'
import {
  dateTime,
  number,
  pick,
  statusClass
} from '../utils/format'

export default function Readings() {
  return (
    <CrudPage
      title="Meter readings"
      singular="Meter reading"
      eyebrow="METERING"
      description="Inspect and maintain validated demand readings. Simulator-ingested records remain identifiable by source."
      icon={Gauge}
      idKey="readingId"
      paginated={true}
      pageSize={10}
      api={{
        list: getMeterReadings,
        create: createMeterReading,
        update: updateMeterReading,
        remove: deleteMeterReading
      }}
      lookup={[
        {
          name: 'buildings',
          load: getBuildings
        }
      ]}
      fields={[
        {
          name: 'buildingId',
          label: 'Building',
          type: 'select',
          optionsFrom: 'buildings',
          optionValue: 'buildingId',
          optionLabel: 'buildingName',
          default: ''
        },
        {
          name: 'readingTimestamp',
          label: 'Reading timestamp',
          type: 'datetime-local'
        },
        {
          name: 'demandKw',
          label: 'Demand (kW)',
          type: 'number',
          min: '0',
          step: '0.01'
        },
        {
          name: 'sourceName',
          label: 'Source name',
          default: 'MANUAL'
        },
        {
          name: 'dataQualityStatus',
          label: 'Data quality',
          type: 'select',
          options: ['VALID', 'EXCLUDED', 'LEGACY_REVIEW'],
          default: 'VALID'
        }
      ]}
      columns={[
        {
          key: 'id',
          label: 'Reading ID',
          render: r => pick(r, 'readingId')
        },
        {
          key: 'building',
          label: 'Building',
          render: r => pick(r, 'buildingId')
        },
        {
          key: 'time',
          label: 'Timestamp',
          render: r => dateTime(pick(r, 'readingTimestamp'))
        },
        {
          key: 'demand',
          label: 'Demand',
          render: r => (
            <strong>{number(pick(r, 'demandKw'))} kW</strong>
          )
        },
        {
          key: 'source',
          label: 'Source',
          render: r => pick(r, 'sourceName')
        },
        {
          key: 'quality',
          label: 'Quality',
          render: r => (
            <span className={statusClass(pick(r, 'dataQualityStatus'))}>
              {pick(r, 'dataQualityStatus')}
            </span>
          )
        }
      ]}
    />
  )
}
