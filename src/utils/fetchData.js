import axios from 'axios';
const token = sessionStorage.getItem("authorizeKey");
const axiosInstance = axios.create({
  baseURL: 'http://api.hillntoe.com:7810/api/', // API의 기본 URL
  timeout: 5000, // 요청 시간 초과 시간
  headers: {
    Authorization:token,
    'Content-Type': 'application/json', // JSON 형식의 요청을 보냄
  },
});

export const FetchData = {
    get: (url) => axiosInstance.get(url),
    post: (url, data) => axiosInstance.post(url, data),
    // 필요한 경우에 따라 다른 HTTP 메서드를 추가할 수 있습니다.
  };

export default axiosInstance;