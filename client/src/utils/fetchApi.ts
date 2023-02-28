import axios from "axios"
const API_URL = "https://auto-attend-api.onrender.com";
axios.defaults.withCredentials = true;


export const getAPI = async (url: string, token?: any) => {
    const res = await axios.get(`${API_URL}/api/${url}`, {
        headers: {
            Authorization: token
        }
    })
    return res;
}

export const postAPI = async (url: string, body?: object, token?: any) => {
    const res = await axios.post(`${API_URL}/api/${url}`, body, {
        headers: {
            Authorization: token
        }
    })
    return res;
}

export const putAPI = async (url: string, body?: object, token?: any) => {
    const res = await axios.put(`${API_URL}/api/${url}`, body, {
        headers: {
            Authorization: token
        }
    })
    return res;
}

export const deleteAPI = async (url: string, token?: any) => {
    const res = await axios.delete(`${API_URL}/api/${url}`, {
        headers: {
            Authorization: token
        }
    })
    return res;
}
