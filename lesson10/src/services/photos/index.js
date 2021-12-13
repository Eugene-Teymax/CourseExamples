import instance from '../core'

const resource = '/photos'

export default {
  getPhotos (start = null, limit = 3) {
    const hasStart = start !== null && start !== undefined
    const hasLimit = limit !== null && limit !== undefined

    return instance.get(`${resource}`, {
      params: {
        ...(hasStart ? { _start: start } : {}),
        ...(hasLimit ? { _limit: limit }:  {})
      }
    })
  },
  uploadPhoto (formData) {
    return instance.post(`${resource}`, formData)
  },
  getPhotoById (id) {
    return instance.get(`${resource}/${id}`)
  }
}
