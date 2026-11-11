
import { useEffect, useMemo, useState } from 'react'

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Cpu,
  Gauge,
  RefreshCw,
  Users,
  Zap
} from 'lucide-react'

import { Link } from 'react-router-dom'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import StatCard from '../components/StatCard'
import Loading from '../components/Loading'
import Notice from '../components/Notice'
import DataTable from '../components/DataTable'

import {
  getBuildings,
  getEquipment,
  getMeterReadings,
  getPeakEvents,
  getPendingSchedules,
  getOccupancySchedules
} from '../api/endpoints'

import {
  dateTime,
  number,
  pick,
  rowsFrom,
  statusClass
} from '../utils/format'


export default function Dashboard() {

  const [data, setData] = useState({
    buildings: [],
    equipment: [],
    readings: [],
    events: [],
    pending: [],
    occupancy: []
  })

  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)


  // Load dashboard data from Spring Boot APIs.
  const load = async () => {

    setLoading(true)

    const tasks = [
      getBuildings,
      getEquipment,
      getMeterReadings,
      getPeakEvents,
      getPendingSchedules,
      getOccupancySchedules
    ]

    const keys = [
      'buildings',
      'equipment',
      'readings',
      'events',
      'pending',
      'occupancy'
    ]

    const res = await Promise.allSettled(
      tasks.map(fn => fn())
    )

    const next = {}

    res.forEach((result, index) => {
      next[keys[index]] =
        result.status === 'fulfilled'
          ? rowsFrom(result.value.data)
          : []
    })

    setData(next)

    const failed = res.filter(
      result => result.status === 'rejected'
    )

    setNotice(
      failed.length
        ? {
            type: 'error',
            message: `${failed.length} data source(s) failed. Check Spring Boot and the API URL.`
          }
        : null
    )

    setLoading(false)
  }


  useEffect(() => {
    load()
  }, [])


  // Select the latest reading using its database ID.
  // This avoids incorrect ordering caused by older records
  // containing inconsistent timestamps.
  const latest = useMemo(() => {

    return [...data.readings].sort(
      (a, b) => Number(b.readingId) - Number(a.readingId)
    )[0]

  }, [data.readings])


  // Identify open peak events.
  const open = data.events.filter(event =>
    ['OPEN', 'DETECTED', 'ACTIVE'].includes(
      String(pick(event, 'eventStatus') || '').toUpperCase()
    )
  )


  // Prepare the demand trend using the latest 30 inserted readings.
  // Sort by reading ID to avoid historical timestamp inconsistencies.
  const chart = useMemo(() => {

    return [...data.readings]
      .sort(
        (a, b) => Number(a.readingId) - Number(b.readingId)
      )
      .slice(-30)
      .map(reading => ({
        time: dateTime(
          pick(reading, 'readingTimestamp')
        ),
        demand: Number(
          pick(reading, 'demandKw') || 0
        )
      }))

  }, [data.readings])


  // Peak events table columns.
  const cols = [
    {
      key: 'id',
      label: 'Event',
      render: row => `#${pick(row, 'eventId')}`
    },
    {
      key: 'building',
      label: 'Building',
      render: row => pick(row, 'buildingId')
    },
    {
      key: 'time',
      label: 'Started',
      render: row => dateTime(
        pick(row, 'eventStartTime')
      )
    },
    {
      key: 'peak',
      label: 'Peak',
      render: row => `${number(
        pick(row, 'peakDemandKw')
      )} kW`
    },
    {
      key: 'status',
      label: 'Status',
      render: row => (
        <span className={statusClass(
          pick(row, 'eventStatus')
        )}>
          {pick(row, 'eventStatus') || '—'}
        </span>
      )
    }
  ]


  return (

    <div className="stack-lg">

      {/* Page heading and refresh button */}
      <div className="page-actions">

        <div>
          <span className="eyebrow">
            BUILDING MONITORING
          </span>

          <h2>Energy overview</h2>

          <p className="muted">
            Operational snapshot from the connected Spring Boot APIs.
          </p>
        </div>

        <button
          className="button secondary"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh data
        </button>

      </div>


      <Notice
        notice={notice}
        onClose={() => setNotice(null)}
      />


      {loading ? (

        <Loading />

      ) : (

        <>

          {/* Dashboard statistics */}
          <div className="stats-grid">

            <StatCard
              label="Buildings"
              value={data.buildings.length}
              note="Registered buildings"
              icon={Building2}
            />

            <StatCard
              label="Equipment"
              value={data.equipment.length}
              note="Registered assets"
              icon={Cpu}
              tone="green"
            />

            <StatCard
              label="Latest demand"
              value={
                latest
                  ? `${number(pick(latest, 'demandKw'))} kW`
                  : '—'
              }
              note={
                latest
                  ? dateTime(
                      pick(latest, 'readingTimestamp')
                    )
                  : 'No readings'
              }
              icon={Gauge}
            />

            <StatCard
              label="Open peak events"
              value={open.length}
              note={`${data.events.length} total events`}
              icon={AlertTriangle}
              tone="orange"
            />

            <StatCard
              label="Pending approvals"
              value={data.pending.length}
              note="Awaiting operator action"
              icon={Activity}
              tone="purple"
            />

            <StatCard
              label="Occupancy windows"
              value={data.occupancy.length}
              note="Configured schedules"
              icon={Users}
            />

          </div>


          {/* Demand chart and quick actions */}
          <div className="content-grid">

            <section className="panel">

              <div className="panel-heading">

                <div>
                  <h3>Demand trend</h3>

                  <p>
                    Most recent 30 readings returned by the API
                  </p>
                </div>

                <span className="mini-tag">
                  kW
                </span>

              </div>


              {chart.length ? (

                <div className="chart">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <AreaChart
                      data={chart}
                      margin={{
                        top: 12,
                        right: 12,
                        left: -18,
                        bottom: 0
                      }}
                    >

                      <defs>

                        <linearGradient
                          id="demandFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopColor="#3978e8"
                            stopOpacity={0.25}
                          />

                          <stop
                            offset="95%"
                            stopColor="#3978e8"
                            stopOpacity={0.02}
                          />

                        </linearGradient>

                      </defs>


                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />


                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={25}
                      />


                      <YAxis
                        tickLine={false}
                        axisLine={false}
                      />


                      <Tooltip />


                      <Area
                        type="monotone"
                        dataKey="demand"
                        name="Demand (kW)"
                        stroke="#3978e8"
                        strokeWidth={2.5}
                        fill="url(#demandFill)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </div>

              ) : (

                <div className="empty-state">
                  <Gauge size={28} />
                  <p>No meter readings available yet.</p>
                </div>

              )}

            </section>


            {/* Quick actions */}
            <section className="panel">

              <div className="panel-heading">

                <div>
                  <h3>Quick actions</h3>

                  <p>
                    Navigate to operational modules
                  </p>
                </div>

              </div>


              <div className="quick-links">

                <Link to="/buildings">
                  <Building2 />
                  Manage buildings
                  <ArrowRight />
                </Link>

                <Link to="/equipment">
                  <Cpu />
                  Manage equipment
                  <ArrowRight />
                </Link>

                <Link to="/readings">
                  <Gauge />
                  View meter readings
                  <ArrowRight />
                </Link>

                <Link to="/events">
                  <Zap />
                  Peak events
                  <ArrowRight />
                </Link>

                <Link to="/schedules">
                  <Activity />
                  Review recommendations
                  <ArrowRight />
                </Link>

              </div>


              <div className="snapshot-note">

                All demand and reduction values are based on simulation
                or stored meter data. Recommendations require operator
                approval and do not control physical equipment.

              </div>

            </section>

          </div>


          {/* Recent peak events */}
          <section className="panel">

            <div className="panel-heading">

              <div>
                <h3>Recent peak events</h3>

                <p>
                  Latest events returned by the backend
                </p>
              </div>

              <Link
                className="text-link"
                to="/events"
              >
                View all
                <ArrowRight size={14} />
              </Link>

            </div>


            <DataTable
              columns={cols}
              rows={
                [...data.events]
                  .sort((a, b) =>
                    String(
                      pick(b, 'eventStartTime') || ''
                    ).localeCompare(
                      String(
                        pick(a, 'eventStartTime') || ''
                      )
                    )
                  )
                  .slice(0, 6)
              }
            />

          </section>

        </>

      )}

    </div>

  )
}
