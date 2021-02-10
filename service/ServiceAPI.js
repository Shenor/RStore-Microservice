const colors = require('colors');
const rp = require('request-promise');

class ServiceAPI {
    _token = '';
    _organizationID = [];
    //https://iiko.biz:9900/api/0/auth/access_token?user_id=morkovme@hotmail.com&user_secret=Nne0KMZp

    getToken = async (username, password) =>  {
        try {
            this._token = this.transformToken(await rp(`https://iiko.biz:9900/api/0/auth/access_token?user_id=${username}&user_secret=${password}`));
            return true;
        } catch (err) {
            console.error(`Error message: ${err.error}`.red);
            return false;
        }
    }

    getStopList = async (organizationID) => {
        try {
            const res = await rp(`https://iiko.biz:9900/api/0/stopLists/getDeliveryStopList?access_token=${this._token}&organization=${organizationID}`)
            return res
        } catch (e) {
           return JSON.parse(e.error)
        }
    }

    getNomenclatureJSON = async () => {
        const nomenclaturePromise = this._organizationID.map(async (id) => {
            const res = await rp(`https://iiko.biz:9900/api/0/nomenclature/${ id }?access_token=${ this._token }`);
            return res;
        });

        const nomenclature = await Promise.all(nomenclaturePromise);
        return nomenclature;
    }

    getOnceNomenclatureJSON = async (organizationID) => {
        const res = await rp(`https://iiko.biz:9900/api/0/nomenclature/${ organizationID }?access_token=${ this._token }`);
        return res;
    }
    
    getOrganizationListJSON = async () => {
        const organizationListPromise = this._organizationID.map(async () => {
            const res = await rp(`https://iiko.biz:9900/api/0/organization/list?access_token=${ this._token }`);
            return res;
        });
        const organizationList = await Promise.all(organizationListPromise);
        return organizationList;
    }

    getDiscounts = async (organizationID) => {
        const res = await rp(`https://iiko.biz:9900/api/0/deliverySettings/deliveryDiscounts?access_token=${ this._token }&organization=${organizationID}`);
        return JSON.parse(res);
    }

    setOrganizationID = async () => {
        const organizationListJSON = await rp(`https://iiko.biz:9900/api/0/organization/list?access_token=${ this._token }`);
        const organizationList = JSON.parse(organizationListJSON);

        organizationList.forEach((org) => this._organizationID.push(org.id));
    }

    checkCreateOrder = async (order) => {
        const createOrder = await rp(`https://iiko.biz:9900/api/0/orders/checkCreate?access_token=${ this._token }&request_timeout=00%3A01%3A00`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });
        const response = JSON.parse(createOrder);
        return response;
    }
    
    sendOrder = async (order) => {
        try {
            const createOrder = await rp(`https://iiko.biz:9900/api/0/orders/add?access_token=${ this._token }`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(order)
            });
            const response = JSON.parse(createOrder);
            return response;
        } catch (e) {
            const error= JSON.parse(e.error);
            console.error(error);
            return {isError: true, error};
        }
    }

    transformToken(token){
        return token.slice(1).slice(0, -1);
    }

}

module.exports = ServiceAPI;