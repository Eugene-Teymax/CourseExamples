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

const defaultEventHandlers = {
  drop: null,
  dragenter: null,
  dragleave: null,
  click: null,
  change: null
}
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
  #dropzoneHTML = `
    <div class="dropzone" id="dropzone"></div>
  `
  #dropzoneWrapperHTML = `
    <div class="dropzone-container"></div>
  `
  #clearButtonHTML = `
    <button id="dropzoneClearButton" class="dropzone__clear-btn btn btn-secondary">clear</button>
  `

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
