const HttpClient = require('../helpers/create-http-client');
const logger = require('../helpers/create-logger');

const iikoBiz = HttpClient({
  baseURL: 'https://iiko.biz:9900/api/0'
})

class ServiceAPI {
  #token = '';
  #username = null;
  #password = null;
  #organizationId = [];

  constructor({username, password}){
    this.#username = username;
    this.#password = password;

    return new Promise(async (resolve, reject) => {
      try {
        await this.#setToken();
      } catch (error) {
        resolve(null);
      }
      resolve(this);
    })
  }
  getToken = () =>  this.#token;

  getOrganization = (idx) => this.#organizationId[idx];

  #setToken = async () => {
    try {
      const res = await iikoBiz.get(`/auth/access_token?user_id=${this.#username}&user_secret=${this.#password}`);
      this.#token = res.data;
    } catch (e) {
      logger.error(`${e} get token for ${this.#username}`);
      throw e;
    }
  }

  getStopList = async (organizationID) => {
    try {
      const {data} = await iikoBiz.get(`/stopLists/getDeliveryStopList?access_token=${this.#token}&organization=${organizationID}`);
      return data;
    } catch (e) {
      this.#loggerError(e);
    }
  }

  getNomenclatures = async () => {
    try {
      const nomenclaturePromise = this.#organizationId.map(async id => {
        const {data} = await iikoBiz.get(`/nomenclature/${id}?access_token=${this.#token}`);
        return data;
      });
      const nomenclature = await Promise.all(nomenclaturePromise);
      return nomenclature;
    } catch (e) {
      this.#loggerError(e);
    }
  }

  getOnceNomenclatureJSON = async (organizationID) => {
    try {
      const {data} = await iikoBiz.get(`/nomenclature/${organizationID}?access_token=${this.#token}`);
      return data;
    } catch (e) {
      this.#loggerError(e);
    }
  }

  getOrganizationListJSON = async () => {
    try {
      const organizationListPromise = this.#organizationId.map(async () => {
        const {data} = await iikoBiz.get(`/organization/list?access_token=${this.#token}`);
        return data;
      });
      const organizationList = await Promise.all(organizationListPromise);
      return organizationList;
    } catch (e) {
      this.#loggerError(e);
    }
  }

  getDiscounts = async (organizationID) => {
    try {
      const {data} = await iikoBiz.get(`/deliverySettings/deliveryDiscounts?access_token=${this.#token}&organization=${organizationID}`);
      return data;
    } catch (e) {
      this.#loggerError(e);
    }
  }

  setOrganizationId = async () => {
    try {
      const {data} = await iikoBiz.get(`/organization/list?access_token=${this.#token}`);
      data.forEach((org) => this.#organizationId.push(org.id));
      return data;
    } catch (e) {
      this.#loggerError(e);
    }
  }

  checkCreateOrder = async (order) => {
    try {
      const {data} = await iikoBiz.post(`/orders/checkCreate?access_token=${this.#token}&request_timeout=00%3A01%3A00`, JSON.stringify(order));
      return data;
    } catch (e) {
      this.#loggerError(e);
    }
  }

  sendOrder = async (order, retry = 3) => {
    try {
      const {data} = await iikoBiz.post(`/orders/add?access_token=${this.#token}`, JSON.stringify(order), {
        headers: {'Content-Type': 'application/json'}
      });
      return {...data};
    } catch (e) {

      // client received an error response (5xx, 4xx) //
      if (e.response) {
        const error_data = e.response.data;
        if (retry <= 0) return {isError: true, error: "processing_error", ...error_data};
        logger.error(`Response error - [Create Order] - ${JSON.stringify(error_data)}`);
        await new Promise(resolve => setTimeout(resolve, 2500));
        return await this.sendOrder(order, retry - 1);
      }

      // client never received a response, or request never left //
      if (e.request) {
        logger.error(`Server iikoBiz not response - ${JSON.stringify(e.request)}`)
        return {isError: true, error: "request_error",...e.request}
      }

      // Something happened in setting up the request that triggered an Error //
      logger.error(`Request error - [Create Order] - ${JSON.stringify(e.message)}`)
      return {isError: true, error: "request_error", ...e.message}
    }
  }

  #loggerError(e){
    e.response
      ? logger.error(`${JSON.stringify(e.response.data)}`)
      : e.request
        ? logger.error(`Server iikoBiz not response -${JSON.stringify(e.request)}`)
        : logger.error(`Request error - ${JSON.stringify(e.message)}`)
  }
}

module.exports = ServiceAPI;
