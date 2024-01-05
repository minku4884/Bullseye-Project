import { useEffect } from "react";
import axios from "axios";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";

function ChartComponent2(props) {
  const token = sessionStorage.getItem("authorizeKey");
  const [AvgHRData, setAvgHRDate] = useState([]);
  const [AvgBRData, setAvgBRData] = useState([]);
  const [timestamp, setTimestamp] = useState([]);
  const [chartdata, setChartData] = useState([]);
  const [deviceType, setDeviceType] = useState(0)
  const maxDataValue = Math.max(...[...AvgHRData, ...AvgBRData]);
  const maxDataValueWithPadding = Math.ceil(maxDataValue * 1.29);

  const generateHourlyLabels = () => {
    const labels = [];
    const currentHour = new Date().getHours();
  
    for (let i = 23; i >= 0; i--) {
      const hour = (currentHour - i + 24) % 24; // 시간이 [0, 23] 범위 내에 있도록 보장
      labels.push(`${hour}시`);
    }
  
    return labels;
  };
   // SEARCH YYYYMMDDHHmm
   const today = new Date();
   const year = today.getFullYear();
   const month = (today.getMonth() + 1).toString().padStart(2, "0");
   const day = today.getDate().toString().padStart(2, "0");
   const Hours = today.getHours().toString().padStart(2, "0");
   const end_date = `${year}${month}${day}${Hours}00`;
   
   
   // Calculate start_date (1 day ago)
   const yesterday = new Date(today);
   yesterday.setDate(today.getDate() - 1);
   const start_year = yesterday.getFullYear();
   const start_month = (yesterday.getMonth() + 1).toString().padStart(2, "0");
   const start_day = yesterday.getDate().toString().padStart(2, "0");
   const start_date = `${start_year}${start_month}${start_day}${Hours}00`;
 
  const HRBRData = async (deviceId) => {
    try {
      // 첫 번째 Axios 요청
      const response1 = await axios.get(
        `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=H&start_date=${start_date}&end_date=${end_date}`,
        { headers: { Authorization: token } }
      );
  
      // 첫 번째 Axios 요청의 응답을 이용하여 두 번째 Axios 요청 실행
      const response2 = await axios.get(
        `http://api.hillntoe.com:7810/api/config/device/radar/info?device_id=${deviceId}`,
        { headers: { Authorization: token } }
      );
  
      // 두 번째 Axios 요청의 응답에서 deviceType을 추출하여 상태 업데이트
      const deviceTypeResponse = response2.data;
      if (deviceTypeResponse && deviceTypeResponse.length > 0) {
        setDeviceType(deviceTypeResponse[0].deviceType);
  
        // 첫 번째 Axios 요청의 응답을 이용하여 나머지 로직 실행
        const data = response1.data;
        const devicedataType = deviceTypeResponse[0].deviceType;
        data.reverse();
        setTimestamp(data.map((value, index) => value.timestamp));
        if (devicedataType === 14101) {
          const avgHRValues = data.map((value) => value.datas[3].avg_value);
          const avgBRValues = data.map((value) => value.datas[2].avg_value);
          setAvgHRDate(avgHRValues);
          setAvgBRData(avgBRValues);
        } else if (devicedataType === 14201) {
          const avgHRValues = data.map((value) => value.datas[12].avg_value);
          const avgBRValues = data.map((value) => value.datas[10].avg_value);
          setAvgHRDate(avgHRValues);
          setAvgBRData(avgBRValues);
        }
      } else {
        // deviceType이 없는 경우에 대한 처리
        console.error("deviceType not found");
      }
    } catch (error) {
      console.error(error);
    }

  };

  const fetchData = async (timestamps) => {
    const results = await Promise.all(
      timestamps.map(async (timestamp) => {
        return await axios
          .get(`http://api.hillntoe.com:7810/api/timestamp/tostring?timestamp=${timestamp}`)
          .then((response) => response.data)
          .catch((error) => {
            console.error(error);
            return null;
          });
      })
    );
    setChartData(results.filter((data) => data !== null));
  };

  useEffect(() => {
    HRBRData(props.dropDown);
  }, [props.dropDown]); // props.dropDown 값이 변경될 때마다 실행

  useEffect(() => {
    fetchData(timestamp);
  }, [timestamp]);

  const labels = chartdata.map(dateString => {
    const dateObj = new Date(dateString);
    const hours = dateObj.getHours().toString().padStart(2, '0'); // 시간을 2자리로 만듦
    const minutes = dateObj.getMinutes().toString().padStart(2, '0'); // 분을 2자리로 만듦
    return `${hours}:${minutes}`;
  });


  let data = {
    labels: labels,
    datasets: [
      {
        label: "심박수",
        data: AvgHRData,
        fill: false,
        borderColor: "#d60225",
        tension: 0.01,
        yAxisID: "y1",
      },
      {
        label: "호흡수",
        data: AvgBRData,
        fill: false,
        borderColor: "#0041b9",
        tension: 0.01,
        yAxisID: "y1",
      },
    ],
  };
  

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false, // x축 그리드 라인 숨기기
        },
      },
  
      y1: {
        beginAtZero: true,
        min: 0,
        max: maxDataValueWithPadding, // 수정: BRArr 데이터의 최대값을 고려하여 적절한 값으로 변경
        position: "left",
        ticks: {
          callback: function (value) {
            return value + "bpm";
          },
        },
        grid: {
          display: true,
          borderDash: [4, 4], // y2 축 그리드 라인 숨기기
        },
      },
      
      y2: {
        beginAtZero: true,
        min: 0,
        max: maxDataValueWithPadding, // 수정: BRArr 데이터의 최대값을 고려하여 적절한 값으로 변경
        position: "right",
        ticks: {
          callback: function (value) {
            return value + "bpm";
          },
        },
        grid: {
          display: false,
          borderDash: [4, 4], // y2 축 그리드 라인 숨기기
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#191919",
          boxHeight: 1,
          boxWidth: 20,
          font: {
            weight: "bold",
            size: 13.5,
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 1,
        tension: 0.1, // 수정: 뾰족한 그래프를 만들기 위해 tension 조정
      },
      point: {
        radius: 2.5,
      },
    },
  };


  return (
    <div style={{ width: "694px", height: "240px", margin: "auto" }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
}

export default ChartComponent2;
