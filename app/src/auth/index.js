import axios from 'axios'

class apiCalls {

  constructor() {
    this.api = axios.create({
      baseURL: `${import.meta.env.VITE_API_URL}/api/`
    })
  }

  signInWithEmailAndPassword = async (email, password) => {
    await api.post(`/auth/signin`, {
        email: email,
        password: password
    }, {
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(({data}) => data)
        .then((data) => {
          console.log(data);
    })
        .catch((error) => {
            console.log(error)
    })
    }
}

export default apiCalls