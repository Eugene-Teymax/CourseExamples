import { isPOJO } from '~/utils/helpers'
import { mountHTMLMixin } from '~/utils/mixins'

const defaultOptionsProps = {
  nodePosition: 'beforeend',
  replace: false,
  insertCallback: null
}

const loaderHTML = `
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

const defineLoader = () => {
  const wrapper = document.createElement('div')
  wrapper.classList.add('loader-wrapper')
  wrapper.innerHTML = loaderHTML
  state.$loader = wrapper
}

const state = {
  active: false,
  $slot: null,
  $loader: null
}

export default (slot, options) => { // '.class, #id', HTMLElement, 
  try {
    state.options = {
      ...defaultOptionsProps,
      ...((isPOJO(options) && options) || {})
    }
    defineLoader()
    state.$slot = mountHTMLMixin({ slot, element: state.$loader, options: state.options })

    return {
      active: state.active,
      element: state.$loader,
      show () {
        state.active = true
        state.$loader.classList.add('active')
      },
      close () {
        state.active = false
        state.$loader.classList.remove('active')
      }
    }
  } catch (err) {
    throw err
  }
}
