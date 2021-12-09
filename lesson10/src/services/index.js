import filesService from './files'
import photosService from './photos'

const servises = {
  files: filesService,
  photos: photosService
}

export default key => servises[key]
