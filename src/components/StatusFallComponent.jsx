// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Line } from "react-chartjs-2";
// import API_timestamp from "../store/timestamps";
// import ApiClient, { api_method } from "../utils/ApiClient";
// function StatusFallComponent(props){

//     const token = sessionStorage.getItem("authorizeKey");
//     const client = new ApiClient();
//     const api_timestamp = new API_timestamp();
//     let [fall, setFall] = useState([]);
//     let [stateArray, setStateArray] = useState([]);
//     let [fallArray, setFallArray] = useState([]);
//     let [exist, setExist] = useState([]);
//     const [StartDate, setStartDate] = useState(null);
//     const [endDate, setEndDate] = useState(null);
//     console.log(props)


//     const fetchStatusAndFallData = async () => {
//         try {
//           for (const deviceId of props.deviceId) {
//             setStartDate(api_timestamp.oneHoursdate);
//             setEndDate(api_timestamp.date);
//             const response = await axios.get(
//               `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=E&start_date=${api_timestamp.oneHoursdate}&end_date=${api_timestamp.date}`,
//               { headers: { Authorization: token } }
//             );
            
//             const data = response.data;
//             let FallArr, statusArr;
//             if (data.length > 0) {
//               // DeviceType마다 데이터 크기가 다르므로 펌웨어에 따른 낙상, 존재 구분 로직
//               if (data[0].datas.length === 9) {
//                 FallArr = data[0].datas[8].max_value;
//               } else if (data[0].datas.length === 13) {
//                 FallArr = data[0].datas[4].max_value;
//               } else return null;
//               if (data[0].datas.length === 9) {
//                 statusArr = data[0].datas[6].data_value;
//               } else if (data[0].datas.length === 13) {
//                 statusArr = data[0].datas[0].data_value;
//               } else return null;
//             }
    
//             stateArray.push(statusArr);
//             fallArray.push(FallArr);
//           }
//           const stateresult = stateArray.some((value) => value == 1); // 배열에 1이 하나라도 포함되어 있는지 확인
//           const fallresult = fallArray.some((value) => value == 1);
//           if (fallresult) {
//             fall.push(1); // 1이 하나라도 포함되어 있으면 1 출력
//           } else {
//             fall.push(0); // 모두 0이면 0 출력
//           }
    
//           if (stateresult) {
//             exist.push(1); // 1이 하나라도 포함되어 있으면 1 출력
//           } else {
//             exist.push(0); // 모두 0이면 0 출력
//           }
          
//           // console.log(exist.slice(0,60),fall.slice(0,60))
    
//           localStorage.setItem("fall", JSON.stringify(fall));
//           localStorage.setItem("exist", JSON.stringify(exist));
//         } catch (error) {
//           console.error(error);
//         }
//       };
    
//       useEffect(() => {
//         // Initial call to fetchStatusAndFallData
//         if (props.deviceId.length > 0) {
//           fetchStatusAndFallData();
//         }
//         const intervalId = setInterval(() => {
//           fetchStatusAndFallData();
//         }, 60000);
//         return () => clearInterval(intervalId);
//       }, [props.deviceId, token]);

//     return(
//         <div>
//             ss
//         </div>
//     )
// }
// export default StatusFallComponent;