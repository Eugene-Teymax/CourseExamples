import instance from '../core'

const resource = '/forecast'

export default {
  getWeatherByCoords: (lat, lon) => {
    return instance.get(`${resource}`, {
      lat,
      lon,
      units: 'metric',
      apiid: '8025a16eff45bba3f9f1156f91bb1190'
    })
  }
}