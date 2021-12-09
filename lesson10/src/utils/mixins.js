import { isFunction } from './helpers'

export const mountHTMLMixin = {
  isCorrectPosition (position) {
    return ['beforebegin', 'afterbegin', 'beforeend', 'afterend'].includes(position)
  },
  mount () {
    const isInsertCallbackFunction = isFunction(this.options.insertCallback)
    if (isInsertCallbackFunction) {
      if (this.options.insertCallback.length === 0) {
        throw new Error('At least one argument is expected in the insertCallback function')
      }
      this.options.insertCallback(this.element)
      return
    }
    if (this.slot) {
      if (typeof this.slot !== 'string') {
        const notHTML = !(this.slot instanceof HTMLElement)
        switch (true) {
          case notHTML: throw new TypeError('Slot is not a selector or html element')
        }
      } else {
        const selector = document.querySelector(this.slot)
        if (!selector) {
          throw new Error(`An element by the passed selector "${selector}" was not found`)
        }
        this.slot = selector
      }
      if (this.options.replace) {
        this.slot.replaceWith(this.element)
        return
      }
      const correctPosition = this.isCorrectPosition(this.options.nodePosition)
      if (correctPosition) {
        const insertFn = 'insertAdjacentElement'
        const insertArgs = [this.options.nodePosition, this.element]
        this.slot[insertFn].apply(this.slot, insertArgs)
      } else {
        console.warn(`Position "${this.options.nodePosition}" is not correct, maybe you meant one of these "${this.defaultPositions.join(', ')}"?`)
        this.defaultMount(this.slot, this.element)
      }
    }
  },
  defaultMount () {
    this.slot.insertAdjacentElement('beforeend', this.element)
  }
}