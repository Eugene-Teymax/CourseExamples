import photosService from '~/services/photos'
import { mountHTMLMixin } from '~/utils/mixins'
import { generateImageCard, isPOJO } from '~/utils/helpers'
import createLoader from '../loader'
import createPaginator from '../paginator'

const defaultOptionsProps = {
  nodePosition: 'beforeend',
  pagination: false,
  replace: false,
  insertCallback: null
}

const changePage = async (page) => {
  state.currentPage = page
  await loadMore()
  console.log(state)
}

const defineSection = () => {
  const container = document.createElement('div')
  container.classList.add('photos')

  const photosEl = document.createElement('div')
  photosEl.classList.add('photos__list')
  state.$photos = photosEl

  const loaderContainer = document.createElement('div')
  loaderContainer.classList.add('photos__loader')
  state.$loader = createLoader()
  loaderContainer.appendChild(state.$loader.element)

  container.appendChild(state.$photos)
  container.appendChild(loaderContainer)

  if (state.options.pagination) {
    container.classList.add('photos--pagination')
    photosEl.classList.add('photos__list--pagination')
    loaderContainer.classList.add('photos__loader--pagination')
    state.$paginator = createPaginator(state.pagesQuantity, changePage)
    container.appendChild(state.$paginator)
  }

  state.$element = container
}


const scrollHandler = async () => {
  const el = state.$photos
  if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
    await loadMore()
  }
  console.log(state)
}

const subscribe = () => {
  state.$photos.addEventListener('scroll', scrollHandler);
}

const addPhotos = (photos) => {
  photos.forEach(photo => {
    const el = document.createElement('div')
    el.innerHTML = generateImageCard(photo)
    const photoEl = el.firstElementChild
    state.$photos.appendChild(photoEl)
  })
}



const loadMore = async () => {
  if (state.options.pagination) {
    state.$photos.innerHTML = ''
    if (state.photosMap.has(state.currentPage)) {
      const photos = state.photosMap.get(state.currentPage)
      addPhotos(photos)
      return
    }
  }
  try {
    if (state.lastPhotoNumber >= state.maxPhotos) return
    state.$loader.show()
    const { data: photos } = await photosService.getPhotos(state.lastPhotoNumber)
    if (state.options.pagination) {
      state.photosMap.set(state.currentPage, photos)
    } else {
      state.photos = [...state.photos, ...photos]
    }
    addPhotos(photos)
  } catch (err) {
    console.error(err)
  } finally {
    state.$loader.close()
  }
}

const state = {
  loading: false,
  options: {},
  pagination: false,
  infiniteScroll: false,
  $slot: null,
  $element: null,
  $loader: null,
  $photos: null,
  $paginator: null,
  photosMap: new Map(),
  maxPhotos: 500,
  photos: [],
  currentPage: 1,
  photosPerPage: 3,
  get pagesQuantity () {
    return Math.ceil(this.maxPhotos / this.photosPerPage) // 163
  },
  get lastPhotoNumber () {
    return this.options.pagination ?
      (this.currentPage * this.photosPerPage) - this.photosPerPage :
      this.photos.length
  }
}


export default async (slot, options = {}) => {
  state.options = {
    ...defaultOptionsProps,
    ...((isPOJO(options) && options) || {})
  }

  defineSection()
  console.log(state)
  state.$slot = mountHTMLMixin({ slot, element: state.$element, options: state.options })
  await loadMore()
  if (!state.options.pagination) {
    subscribe()
  }
}