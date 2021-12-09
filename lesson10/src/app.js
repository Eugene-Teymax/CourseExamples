import 'regenerator-runtime/runtime';
import * as helpers from './utils/helpers.js'
// import photosService from './services/photos'
import filesService from './services/files'
import Dropzone from './components/dropzone'
import Loader from './components/loader'


const uploadButton = document.getElementById('uploadButton')
const dropzoneSlot = document.getElementById('dropzoneSlot')
const imagesContainer = document.getElementById('imagesContainer')

const dropHandler = (formData, files) => {
  uploadButton.classList.add('active')
}

const clearHandler = () => {
  uploadButton.classList.remove('active')
}

const loader = new Loader('#loaderSlot')

const dropzone = new Dropzone(dropzoneSlot, {
  onChooseFileCallback: dropHandler,
  onClearCallback: clearHandler
})

// const insertImages = async () => {
//   const { data } = await photosService.getPhotos(0, 8)

//   const html = data.reduce((acc, img) => {
//     const imgCardHTML = helpers.generateImageCard(img)
//     acc += imgCardHTML
//     return acc
//   }, '')
//   imagesContainer.innerHTML = html
// }

// insertImages()

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