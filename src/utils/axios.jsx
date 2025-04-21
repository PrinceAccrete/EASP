import axios from "axios";

const API = axios.create({
    // baseURL: "http://localhost:8002/api/v1/"
    //  baseURL: "http://192.168.120.117:8002/api/v1/"
     baseURL: "http://192.168.120.117:8002/api/v1/"
});


export default API;
    