import api from './client'

export const getBuildings = () => api.get('/buildings')
export const getEquipment = () => api.get('/equipment')
export const getMeterReadings = () => api.get('/meter-readings')
export const getPeakConfigs = () => api.get('/peak-configs')
export const getOccupancySchedules = () => api.get('/occupancy-schedules')

// The pending endpoint is confirmed in the current backend.
export const getPendingSchedules = () => api.get('/load-schedules/pending')

// These GET-all routes are used if exposed by the backend controllers.
export const getPeakEvents = () => api.get('/peak-events')
export const getAllLoadSchedules = () => api.get('/load-schedules')

export const runPeakDetection = (buildingId) =>
  api.post(`/peak-detection/${buildingId}`)

export const approveSchedule = (scheduleId) =>
  api.put(`/load-schedules/${scheduleId}/approve`)

export const rejectSchedule = (scheduleId, reason) =>
  api.put(`/load-schedules/${scheduleId}/reject`, { reason })

export const overrideSchedule = (scheduleId, userId, newAction, reason) =>
  api.put(`/load-schedules/${scheduleId}/override`, { userId, newAction, reason })

export const createBuilding = (data) => api.post('/buildings', data)
export const createEquipment = (data) => api.post('/equipment', data)
export const createPeakConfig = (data) => api.post('/peak-configs', data)
