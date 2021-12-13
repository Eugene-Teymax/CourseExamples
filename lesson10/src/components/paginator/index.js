

const click = ({ target }) => {
  state.page = +target.innerHTML
  updateRender()
}

const bind = () => {
  const pages = state.$container.getElementsByTagName('a')
  ;[...pages].forEach(page => {
    if (+page.innerHTML === state.page) page.className = 'current'
      page.addEventListener('click', click);
  })
}

const createElement = (html) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.firstElementChild
}
const first = () => {
  state.code += '<a>1</a><i>...</i>'
}

const last = () => {
  state.code += '<i>...</i><a>' + state.size + '</a>';
}

const add = (s, f) => {
  for (let i = s; i < f; i++) {
    state.code += '<a>' + i + '</a>';
  }
}

const finish = () => {
  state.$container.innerHTML = state.code;
  state.code = ''
  bind()
}

const updateRender = (isFirstRender) => {
  if (state.size < state.step * 2 + 6) {
    add(1, state.size + 1)
  }
  else if (state.page < state.step * 2 + 1) {
    add(1, state.step * 2 + 4)
    last()
  }
  else if (state.page > state.size - state.step * 2) {
    first()
    add(state.size - state.step * 2 - 2, state.size + 1)
  }
  else {
    first()
    add(state.page - state.step, state.page + state.step + 1);
    last()
  }
  finish()
  if (isFirstRender) return
  state.onchange(state.page)
}

const prevClick = () => {
  state.page -= state.page === 1 ? 0 : 1
  updateRender()
}

const nextClick = () => {
  state.page += state.page >= state.size ? 0 : 1
  updateRender()
}


const subscribeNavigation = () => {
  state.$prevButton.addEventListener('click', prevClick, false);
  state.$nextButton.addEventListener('click', nextClick, false);
}

const definePaginator = () => {
  state.$el = document.createElement('div')
  state.$el.classList.add('photos__pagination')
  
  state.$prevButton = createElement('<a><</a>')
  state.$nextButton = createElement('<a>></a>')
  state.$container = createElement('<span></span>')
  ;[state.$prevButton, state.$container, state.$nextButton]
    .forEach(el => state.$el.appendChild(el))
}

const state = {
  code: '',
  $el: null,
  $container: null,
  $prevButton: null,
  $nextButton: null,
  size: null,
  page: 1,
  step: 3,
  onchange: () => {}
}

export default (size, onchange) => {
  state.size = size
  state.onchange = onchange

  definePaginator()
  subscribeNavigation()
  updateRender(true)

  return state.$el
}

