import {
  isDragSourceExternalFile,
  generateCard,
  dateParser,
  formatBytes,
  readImageFile,
  isPOJO
} from '~/utils/helpers'
import { mountHTMLMixin } from '~/utils/mixins'

const defaultOptionsProps = {
  nodePosition: 'beforeend',
  text: 'Drop files here or click to upload.',
  replace: false,
  insertCallback: null,
  onChooseFileCallback: null,
  onClearCallback: null
}

const dropzoneElementsSnippets = {
  dropzoneHTML: `
    <div class="dropzone" id="dropzone"></div>
  `,
  dropzoneWrapperHTML: `
    <div class="dropzone-container"></div>
  `,
  clearButtonHTML: `
    <button id="dropzoneClearButton" class="dropzone__clear-btn btn btn-secondary">clear</button>
  `
}

const state = {
  files: [],
  activeArea: false,
  options: {},
  $form: null,
  $dropzone: null,
  $fileInput: null,
  $clearButton: null,
  $dropzoneFiles: null,
  $slot: null
}

const createElement = (html) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.firstElementChild
}

const createFileInput = () => {
  const input = document.createElement('input')
  input.classList.add('dropzone-input')
  input.type = 'file'
  input.id = 'dropzoneFileInput'
  input.name = 'file'

  return input
}

const defineDropzone = () => {
  const {
    dropzoneHTML,
    clearButtonHTML,
    dropzoneWrapperHTML
  } = dropzoneElementsSnippets
  state.$dropzone = createElement(dropzoneHTML)
  state.$dropzone.dataset.text = state.options.text

  state.$clearButton = createElement(clearButtonHTML)
  state.$clearButton.addEventListener('click', handlers.clearButtonClick)
  state.$dropzone.appendChild(state.$clearButton)

  const dropzoneWrapper = createElement(dropzoneWrapperHTML)
  dropzoneWrapper.appendChild(state.$dropzone)

  state.$fileInput = createFileInput()

  const form = document.createElement('form')
  form.name = 'DropzoneUploadForm'

  form.appendChild(state.$fileInput)
  form.appendChild(dropzoneWrapper)

  state.$form = form
}

const subscribe = () => {
  window.addEventListener('drop', handlers.drop)
  window.addEventListener('dragleave', handlers.prevent)
  window.addEventListener('dragover', handlers.prevent)

  state.$dropzone.addEventListener('dragenter', handlers.dragenter)
  state.$dropzone.addEventListener('dragleave', handlers.dragleave)
  state.$dropzone.addEventListener('click', handlers.click)
  state.$fileInput.addEventListener('change', handlers.change)
}

const unsubscribe = () => {
  window.removeEventListener('drop', handlers.drop)
  window.removeEventListener('dragleave', handlers.prevent)
  window.removeEventListener('dragover', handlers.prevent)

  state.$dropzone.removeEventListener('dragenter', handlers.dragenter)
  state.$dropzone.removeEventListener('dragleave', handlers.dragleave)
  state.$dropzone.removeEventListener('click', handlers.click)
  state.$fileInput.removeEventListener('change', handlers.change)
}

const showFiles = async () => {
  const getFileInfo = () => {
    return {
      name: file.name,
      size: formatBytes(file.size),
      createdAt: dateParser(file.lastModifiedDate)
    }
  }
  state.$dropzone.classList.add('dropzone--files')
  unsubscribe()

  state.$dropzoneFiles = document.createElement('div')
  state.$dropzoneFiles.id = 'dropzoneFiles'
  state.$dropzoneFiles.classList.add('dropzone__files')
  const file = state.files[0]
  if (/\.(jpe?g|png|gif|bmp)$/i.test(file.name)) {
    const img = await readImageFile(file)
    console.log(img)
    state.$dropzoneFiles.appendChild(img)
  } else {
    const fileMeta = getFileInfo(file)
    state.$dropzoneFiles.innerHTML = generateCard(fileMeta)
  }
  state.$dropzone.appendChild(state.$dropzoneFiles)
}

const getFormData = () => {
  if (state.files.length) {
    const formData = new FormData()
    formData.append('file', state.files[0])
    return formData
  }
  return new FormData(state.$form)
}

const chooseFile = () => {
  const formData = getFormData()
  const fn = state.options.onChooseFileCallback
  fn instanceof Function && fn.call(fn, formData, state.files)
}

const handlers = {
  prevent: (e) => {
    e.preventDefault()
    return false
  },
  change: ({ target }) => {
    state.files = target.files
    showFiles()
    chooseFile()
  },
  drop: (e) => {
    if (!state.activeArea) {
      console.log('out of area', e)
      return
    }
    const IsFile = isDragSourceExternalFile(e.dataTransfer);
    if (IsFile) e.preventDefault();
    state.files = e.dataTransfer.files
    state.activeArea = false
    state.$dropzone.classList.remove('active')
    showFiles()
    chooseFile()
  },
  dragenter: (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('dragenterHandler')
    state.activeArea = true
    state.$dropzone.classList.add('active')
  },
  dragleave: (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('dragleaveHandler')
    state.activeArea = false
    state.$dropzone.classList.remove('active')
  },
  clearButtonClick: (e) => {
    e && e.preventDefault()
    e && e.stopPropagation()
    console.log('click', e)
    state.files = []
    state.$dropzone.classList.remove('dropzone--files')
    state.$dropzoneFiles.remove()
    state.$dropzoneFiles = null
    state.$fileInput.value = ''
    subscribe()
    state.options.onClearCallback()
  },
  click: (e) => {
    e.preventDefault();
    e.stopPropagation();
    state.$fileInput.click()
  }
}

export default (slot, options) => {
  try {
    state.options = {
      ...defaultOptionsProps,
      ...((isPOJO(options) && options) || {})
    }
    defineDropzone()
    subscribe()

    state.$slot = mountHTMLMixin({ slot, element: state.$form, options: state.options })
    return {
      files: state.files,
      element: state.$form,
      getFormData,
      clear: handlers.clearButtonClick
    }
  } catch (err) {
    console.error(err)
  }
}
/*
export default class Dropzone {
  files = []
  activeArea = false
  #hidden = false
  #eventHandlers = defaultEventHandlers
  #form = null
  #dropzone = null
  #fileInput = null
  #clearButton = null
  #dropzoneFiles = null
  #clearButtonClickHandler = null
  

  constructor (slot = null, options = {}) {
    this.slot = slot
    this.options = {
      ...defaultOptionsProps,
      ...((isPOJO(options) && options) || {})
    }

    this.onChooseFileCallback = this.options.onChooseFileCallback
    this.onClearCallback = this.options.onClearCallback
    this.#defineDropzone()
  }

  get element () {
    return this.#form
  }

  getFormData () {
    if (this.files.length) {
      const formData = new FormData()
      formData.append('file', this.files[0])
      return formData
    }
    return new FormData(this.#form)
  }

  #defineDropzone () {
    this.#dropzone = this.#createElement(this.#dropzoneHTML)
    this.#dropzone.dataset.text = this.options.text

    this.#clearButton = this.#createElement(this.#clearButtonHTML)
    this.#clearButtonClickHandler = this.clear.bind(this)
    this.#clearButton.addEventListener('click', this.#clearButtonClickHandler)
    this.#dropzone.appendChild(this.#clearButton)

    const dropzoneWrapper = this.#createElement(this.#dropzoneWrapperHTML)
    dropzoneWrapper.appendChild(this.#dropzone)

    this.#fileInput = this.#createFileInput()

    const form = document.createElement('form')
    form.name = '_DropzoneUploadForm'

    form.appendChild(this.#fileInput)
    form.appendChild(dropzoneWrapper)

    this.#form = form

    this.#subscribeDropzoneEvents()

    this.mount()
  }
  #prevent (e) {
    e.preventDefault()
    return false
  }
  #createElement (html) {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.firstElementChild
  }
  #createFileInput () {
    const input = document.createElement('input')
    input.classList.add('dropzone-input')
    input.type = 'file'
    input.id = 'dropzoneFileInput'
    input.name = 'file'

    return input
  }

  #bindDropzoneEventHandlers () {
    this.#eventHandlers.drop = this.#drop.bind(this)
    this.#eventHandlers.dragenter = this.#dragenter.bind(this)
    this.#eventHandlers.dragleave = this.#dragleave.bind(this)
    this.#eventHandlers.click = this.#click.bind(this)
    this.#eventHandlers.change = this.#change.bind(this)
  }

  #subscribeDropzoneEvents () {
    this.#bindDropzoneEventHandlers()

    window.addEventListener('drop', this.#eventHandlers.drop)
    window.addEventListener('dragleave', this.#prevent)
    window.addEventListener('dragover', this.#prevent)

    this.#dropzone.addEventListener('dragenter', this.#eventHandlers.dragenter)
    this.#dropzone.addEventListener('dragleave', this.#eventHandlers.dragleave)
    this.#dropzone.addEventListener('click', this.#eventHandlers.click)
    this.#fileInput.addEventListener('change', this.#eventHandlers.change)
  }

  #unsubscribeDropzoneEvents () {
    window.removeEventListener('drop', this.#eventHandlers.drop)
    window.removeEventListener('dragleave', this.#prevent)
    window.removeEventListener('dragover', this.#prevent)

    this.#dropzone.removeEventListener('dragenter', this.#eventHandlers.dragenter)
    this.#dropzone.removeEventListener('dragleave', this.#eventHandlers.dragleave)
    this.#dropzone.removeEventListener('click', this.#eventHandlers.click)
    this.#fileInput.removeEventListener('change', this.#eventHandlers.change)
    this.#eventHandlers = defaultEventHandlers
  }

  #drop (e) {
    if (!this.activeArea) {
      return
    }
    const IsFile = isDragSourceExternalFile(e.dataTransfer);
    if (IsFile) e.preventDefault();
    this.files = e.dataTransfer.files
    this.activeArea = false
    this.#dropzone.classList.remove('active')
    this.#showFiles()
    this.#chooseFileHandler()
  }

  #chooseFileHandler () {
    const formData = this.getFormData()
    this.onChooseFileCallback instanceof Function &&
      this.onChooseFileCallback.call(this.onChooseFileCallback, formData, this.files)
  }

  #dragenter (e) {
    e.preventDefault();
    e.stopPropagation();
    this.activeArea = true
    this.#dropzone.classList.add('active')
  }

  #dragleave (e) {
    e.preventDefault();
    e.stopPropagation();
    this.activeArea = false
    this.#dropzone.classList.remove('active')
  }

  #click (e) {
    e.preventDefault();
    e.stopPropagation();
    this.#fileInput.click()
  }

  #change ({ target }) {
    this.files = target.files
    this.#showFiles()
    this.#chooseFileHandler()
  }
  #getFileInfo (file) {
    return {
      name: file.name,
      size: formatBytes(file.size),
      createdAt: dateParser(file.lastModifiedDate)
    }
  }

  clear (e) {
    e && e.preventDefault()
    e && e.stopPropagation()
    this.files = []
    this.#dropzone.classList.remove('dropzone--files')
    this.#dropzoneFiles.remove()
    this.#dropzoneFiles = null
    this.#fileInput.value = ''
    this.#subscribeDropzoneEvents()
    this.options.onClearCallback()
  }

  async #showFiles () {
    this.#dropzone.classList.add('dropzone--files')
    this.#unsubscribeDropzoneEvents()

    this.#dropzoneFiles = document.createElement('div')
    this.#dropzoneFiles.id = 'dropzoneFiles'
    this.#dropzoneFiles.classList.add('dropzone__files')
    const file = this.files[0]
    if (/\.(jpe?g|png|gif|bmp)$/i.test(file.name)) {
      const img = await readImageFile(file)
      this.#dropzoneFiles.appendChild(img)
    } else {
      const fileMeta = this.#getFileInfo(file)
      this.#dropzoneFiles.innerHTML = generateCard(fileMeta)
    }
    this.#dropzone.appendChild(this.#dropzoneFiles)
  }
}

Object.assign(Dropzone.prototype, mountHTMLMixin)

*/