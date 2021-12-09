import instance from '../core'

const resource = '/files'

export default {
  uploadFile (payload) {
    return instance.post(`${resource}`, payload)
  },
  getFileById (id) {
    return instance.get(`${resource}/${id}`)
  }
}
