import { isFunction } from './helpers'

export const mountHTMLMixin = ({ slot, element, options }) => {

  const defaultPositions = ['beforebegin', 'afterbegin', 'beforeend', 'afterend']

  const isCorrectPosition = (position) => {
    return defaultPositions.includes(position)
  }
  
  const defaultMount = (slot, element) => {
    slot.insertAdjacentElement('beforeend', element)
  }
  

  let isInsertCallback = false

  const isInsertCallbackFunction = isFunction(options.insertCallback)
  if (isInsertCallbackFunction) {
    if (options.insertCallback.length === 0) {
      throw new Error('At least one argument is expected in the insertCallback function')
    }
    isInsertCallback = true
    options.insertCallback(element)

  }
  if (slot) {
    if (typeof slot !== 'string') {
      const notHTML = !(slot instanceof HTMLElement)
      switch (true) {
        case notHTML: throw new TypeError('Slot is not a selector or html element')
      }
    } else {
      const selector = document.querySelector(slot)
      if (!selector) {
        throw new Error(`An element by the passed selector "${selector}" was not found`)
      }
      slot = selector
    }
    if (isInsertCallback) {
      return slot
    }

    if (options.replace) {
      slot.replaceWith(element)
      return slot
    }

    const correctPosition = isCorrectPosition(options.nodePosition)
    if (correctPosition) {
      const insertFn = 'insertAdjacentElement'
      const insertArgs = [options.nodePosition, element]
      slot[insertFn].apply(slot, insertArgs)
    } else {
      console.warn(`Position "${options.nodePosition}" is not correct, maybe you meant one of these "${defaultPositions.join(', ')}"?`)
      defaultMount(slot, element)
    }
    return slot
  }
}
