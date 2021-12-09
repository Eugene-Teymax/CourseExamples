export const repeatRequestUntilDataIsReceived = async ({
  request,
  tries = 10,
  timeout = 500,
  previousResult,
  checkProperty = 'attachmentURL'
}, ...requestArguments) => {
 
}

export const generateCard = ({ name, createdAt, size, attachmentURL }) => {
  const attachmentLink = `
    <a href="http://${attachmentURL}">
      download
    </a>
  `

  return `
    <li>
      <div class="card p-4">
          <div class="d-flex align-items-center">
              <div class="ml-3 w-100">
                  <h4 class="mb-0 mt-0">${name}</h4> 
                  <hr/>
                  <p>name: <b>${name}</b></p>
                  <p>created at: <b>${createdAt}</b></p>
                  <p>size: <b>${size}</b></p>
                  ${attachmentURL ? attachmentLink : ''}
              </div>
          </div>
      </div>
    </li>
  `
};

export const generateImageCard = ({ url, title, albumId, id }) => {
  return `
    <div class="col-3 mb-2">
      <div class="card" id="photo_${id}" style="width: 18rem;">
        <img class="card-img-top" src="${url}" alt="Card image cap" style="width: 100%; height: 150px;">
        <div class="card-body">
          <h5 class="card-title">album id #${albumId} - #${id}</h5>
          <p class="card-text">${title}</p>
        </div>
      </div>
    </div>
  `
}


export const isDragSourceExternalFile = (dataTransfer) => {
  // Source detection for Safari v5.1.7 on Windows.
  if (typeof Clipboard !== 'undefined') {
      if (dataTransfer.constructor == Clipboard) {
          if (dataTransfer.files.length > 0)
              return true;
          else
              return false;
      }
  }

  // Source detection for Firefox on Windows.
  if (typeof DOMStringList !== 'undefined'){
      var DragDataType = dataTransfer.types;
      if (DragDataType.constructor == DOMStringList){
          if (DragDataType.contains('Files'))
              return true;
          else
              return false;
      }
  }

  // Source detection for Chrome on Windows.
  if (typeof Array !== 'undefined'){
      var DragDataType = dataTransfer.types;
      if (DragDataType.constructor == Array){
          if (DragDataType.indexOf('Files') != -1)
              return true;
          else
              return false;
      }
  }
}

export const dateParser = (val) => {
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  const date = new Date(val)
  return date.toLocaleDateString('en-US', options)
}

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const readImageFile = async (file) => {
  const readURL = () => {
    return new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = e => res(e.target.result)
        reader.onerror = e => rej(e)
        reader.readAsDataURL(file)
    });
  }

  const img = new Image()
  const url = await readURL(file);
  img.src = url;

  img.onload = () => {
    let w = 300
    let h = 300

    const maxWidth = 300
    const originWidth = img.width ? img.width : img.naturalWidth
    const originHeight = img.height ? img.height : img.naturalHeight
    w = originWidth
    h = originHeight

    if (w > maxWidth) {
      h = Math.floor(h * (maxWidth / w))
      w = maxWidth
    }

    if (w < h && h > maxWidth) {
      const ratio = w / h
      h = maxWidth
      w = Math.floor(maxWidth * ratio)
    }

    img.width = originWidth
    img.height = originHeight
    img.style.width = w + 'px'
    img.style.height = h + 'px'

    img.onload = null
  }

  return img
}

export const isPOJO = (obj) => {
  return !Array.isArray(obj) && obj?.toString() === ({}).toString()
}

export const isFunction = (fn) => {
  return fn && typeof fn === 'function'
}