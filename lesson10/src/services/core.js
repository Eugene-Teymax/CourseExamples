import axios from 'axios'

// const baseURL = 'http://185.233.36.116:8080'
const baseURL = 'https://jsonplaceholder.typicode.com'
// const baseURL = 'http://api.openweathermap.org/data/2.5'

const instance = axios.create({
  baseURL
})


export default instance
