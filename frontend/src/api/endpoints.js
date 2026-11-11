import api from './client'

export const getBuildings = () => api.get('/buildings')
export const getBuilding = id => api.get(`/buildings/${id}`)
export const createBuilding = data => api.post('/buildings', data)
export const updateBuilding = (id, data) => api.put(`/buildings/${id}`, data)
export const deleteBuilding = id => api.delete(`/buildings/${id}`)

export const getEquipment = () => api.get('/equipment')
export const createEquipment = data => api.post('/equipment', data)
export const updateEquipment = (id, data) => api.put(`/equipment/${id}`, data)
export const deleteEquipment = id => api.delete(`/equipment/${id}`)

export const getMeterReadings = (page = 0, size = 10) =>
  api.get('/meter-readings', {
    params: { page, size }
  })
export const createMeterReading = data => api.post('/meter-readings', data)
export const updateMeterReading = (id, data) => api.put(`/meter-readings/${id}`, data)
export const deleteMeterReading = id => api.delete(`/meter-readings/${id}`)

export const getOccupancySchedules = () => api.get('/occupancy-schedules')
export const createOccupancySchedule = data => api.post('/occupancy-schedules', data)
export const updateOccupancySchedule = (id, data) => api.put(`/occupancy-schedules/${id}`, data)
export const deleteOccupancySchedule = id => api.delete(`/occupancy-schedules/${id}`)

export const getPeakConfigs = () => api.get('/peak-configs')
export const createPeakConfig = data => api.post('/peak-configs', data)
export const updatePeakConfig = (id, data) => api.put(`/peak-configs/${id}`, data)
export const deletePeakConfig = id => api.delete(`/peak-configs/${id}`)

export const getPeakEvents = () => api.get('/peak-events')
export const runPeakDetection = buildingId => api.post(`/peak-detection/${buildingId}`)

export const getAllLoadSchedules = () => api.get('/load-schedules')
export const getPendingSchedules = () => api.get('/load-schedules/pending')
export const approveSchedule = id => api.put(`/load-schedules/${id}/approve`)
export const rejectSchedule = (id, reason) => api.put(`/load-schedules/${id}/reject`, { reason })
export const overrideSchedule = (id, userId, newAction, reason) =>
  api.put(`/load-schedules/${id}/override`, { userId, newAction, reason })
