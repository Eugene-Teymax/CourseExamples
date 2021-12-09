import { mountHTMLMixin } from '~/utils/mixins'

const defaultOptions = {
  nodePosition: 'beforeend'
}


export default class Loader {
  #active = false
  constructor(slot, options = {}) {
    this.slot = slot
    this.options = {
      ...defaultOptions,
      ...options
    }
    this.defineLoader()
  }

  defineLoader() {
    const wrapper = document.createElement('div')
    wrapper.classList.add('loader-wrapper')
    wrapper.innerHTML = `
    <div class="loader">
      <svg viewBox="0 0 80 80">
        <circle id="test" cx="40" cy="40" r="32"></circle>
      </svg>
    </div>

    <div class="loader triangle">
      <svg viewBox="0 0 86 80">
        <polygon points="43 8 79 72 7 72"></polygon>
      </svg>
    </div>

    <div class="loader">
      <svg viewBox="0 0 80 80">
        <rect x="8" y="8" width="64" height="64"></rect>
      </svg>
    </div>
    `
    this.loaderElement = wrapper
    this.mount()
  }
  get active () {
    return this.#active
  }
  get element () {
    return this.loaderElement
  }
  set active (value) {
    if (value) {
      this.loaderElement.classList.add('active')
    } else {
      this.loaderElement.classList.remove('active')
    }
    this.#active = value
  }
  show () {
    this.active = true
  }
  close () {
    this.active = false
  }
}

Object.assign(Loader.prototype, mountHTMLMixin)