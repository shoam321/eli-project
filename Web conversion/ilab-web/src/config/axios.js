import axios from 'axios';

class axiosClient {
  constructor() {
    this.token = null;
    this.axios = axios.create();
    this.axios.defaults.timeout = 15000;
    this.axios.defaults.transformRequest = this.requestMiddleware.bind(this);
    this.axios.defaults.transformResponse = Array.prototype.concat(
      axios.defaults.transformResponse, axiosClient.responseMiddleware,
    );
  }

  static responseMiddleware(data) {
    if (data.success === 1) return data;
    else throw (data);
  }

  requestMiddleware(data) {
    const formData = new FormData();
    formData.append('data', JSON.stringify({ token: this.token, ...data }));
    return formData;
  }

  setToken(token) {
    this.token = token;
  }

  getAxios() {
    return this.axios;
  }
}

const restClient = new axiosClient();

export default restClient;
