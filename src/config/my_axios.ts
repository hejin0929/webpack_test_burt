// 项目的axios请求封装

// 引入axios
import axios, { AxiosRequestConfig } from "axios";

// 添加axios的基地址
// axios.defaults.baseURL = 'demo01.nextsls';

// 创建一个Axios函数并导出
export default function Axios(options: AxiosRequestConfig) {
  // url, data
  // let rudexData = store.getState()
  if (localStorage.getItem("token")) {
    var axios_requset = axios.create({
      baseURL: "http://127.0.0.1:8080", // http://127.0.0.1:8080 http://127.0.0.1:8080
      timeout: 3000,
      headers: { Authorization: localStorage.getItem("token") },
    });
  } else {
    // 添加基地址
    axios.defaults.baseURL = "http://127.0.0.1:8080";
    axios_requset = axios;
  }
  // 添加请求拦截器
  axios_requset.interceptors.request.use(
    function (config: any) {
      // console.log(config);
      return config;
    },
    function (error: Error) {
      // 对请求错误做些什么
      return Promise.reject(error);
    }
  );

  // 添加响应拦截器
  axios_requset.interceptors.response.use(
    function (response: any) {
      if (!response.data) {
        console.log("还没有登录");
        setTimeout(() => {
          window.location.href = "/#/login";
        }, 1000);
      } else if (response.data.status === 404) {
        window.location.href = "/#/login";
        console.log("还没有登录");
      }
      // 对响应数据做点什么
      return response;
    },
    function (error: Error) {
      // 对响应错误做点什么
      return Promise.reject(error);
    }
  );

  return new Promise((resolve, reject) => {
    if (options.data) {
      axios_requset
        .post(options.url, options.data)
        .then((res: { data: unknown }) => {
          resolve(res.data);
        })
        .catch((err: Error) => {
          reject(err);
        });
    } else {
      // 请求失败再发送一次请求
      axios_requset
        .get(options.url)
        .then((res: { data: unknown }) => {
          resolve(res.data);
        })
        .catch((err: Error) => {
          reject(err);
        });
    }
  });
}
