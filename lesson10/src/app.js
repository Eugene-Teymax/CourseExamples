import 'regenerator-runtime/runtime';
import * as helpers from './utils/helpers.js'
import filesService from './services/files'
import definePhotosSection from './components/photos'
import createDropzone from './components/dropzone'
import createLoader from './components/loader'


// const gotLocation = (position) => {
//   console.log(position)
//   const lat = position.coords.latitude
//   const lon = position.coords.longitude
//   const apiURL = ''
  
// }

// const navigator = window.navigator.geolocation.getCurrentPosition(gotLocation)

const uploadButton = document.getElementById('uploadButton')
const loaderSlot = document.getElementById('loaderSlot')
const dropzoneSlot = document.getElementById('dropzoneSlot')
const imagesContainer = document.getElementById('imagesContainer')

const dropHandler = (formData, files) => {
  uploadButton.classList.add('active')
}

const clearHandler = () => {
  uploadButton.classList.remove('active')
}

const loader = createLoader(loaderSlot)

const dropzone = createDropzone(dropzoneSlot, {
  onChooseFileCallback: dropHandler,
  onClearCallback: clearHandler
})

definePhotosSection('#imagesContainer', { pagination: true })

const uploadButtonClick = async () => {
  loader.show()
  try {
    const formData = dropzone.getFormData()

    const { data: originData } = await filesService.uploadFile(formData)

    let expectedData

    if (!originData.attachmentURL) {
      console.log('repeat requests block')
      const data = await helpers.repeatRequestUntilDataIsReceived(
        {
          request: filesService.getFileById,
          tries: 10,
          timeout: 1000,
          previousResult: originData.attachmentURL

        },
        originData.id
      )
      expectedData = data
    }
    imagesContainer.innerHTML = helpers.generateCard(expectedData)
    console.log('expectedData', expectedData)
  } catch (err) {
    console.error(err)
  } finally {
    dropzone.clear()
    loader.close()
  }
}

uploadButton.addEventListener('click', uploadButtonClick)