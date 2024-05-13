// import ApiClient, { api_method } from "../utils/ApiClient";
// const token = sessionStorage.getItem("authorizeKey");
// const client = new ApiClient


// const fetchDeviceInfo = async () => {
//   try {
//     const response = await client.RequestAsync(
//       api_method.get,
//       "/api/config/device/info",
//       null,
//       null,
//       token
//     );
//     if (response?.status === 200) {
//       // API 렉시컬 밖 호출
//     } else {
//       throw new Error(`Failed to fetch device info (${response?.status})`);
//     }
//   } catch (error) {
//     console.error("Error fetching device info:", error);
//   }
// };
  

// export default{fetchDeviceInfo}