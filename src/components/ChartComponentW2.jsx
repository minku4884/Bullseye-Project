import { useEffect } from "react";
import axios from "axios";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import API_timestamp from "../store/timestamps";
function ChartComponentW2(props) {
  const token = sessionStorage.getItem("authorizeKey");
  const [AvgHRData, setAvgHRData] = useState([]);
  const [AvgBRData, setAvgBRData] = useState([]);
  const [timestamp, setTimestamp] = useState([]);
  const [chartdata, setChartData] = useState([]);
  const api_timestamp = new API_timestamp()
  const maxDataValueWithPadding = Math.ceil(
    Math.max(...AvgHRData, ...AvgBRData) * 1.29
  );
  const HRBRData = async (deviceId) => {
    try {
      const response = await axios.get(
        `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=H&start_date=${api_timestamp.getSevenDayAgo()}&end_date=${api_timestamp.endTime}`,
        { headers: { Authorization: token } }
      );
      const response2 = await axios.get(`http://api.hillntoe.com:7810/api/config/device/radar/info?device_id=${deviceId}`,
      {headers:{Authorization : token}});
      const data2 = response2.data
      const devicedataType = data2[0].deviceType
      const data = response.data;
      data.reverse();
      data.map((value)=>{console.log(value.datas)})
      setTimestamp(data.map((value, index) => value.timestamp));
      // 24.05.09 이 부분 수정필요HR,BR DeviceType에 따른 데이터가 맞는지
      // 이거 때문에 양 끝단 라벨 기준bpm도 낮아짐
      if (devicedataType === 14101) {
        const avgHRValues = data.map((value) => value.datas[3].avg_value);
        const avgBRValues = data.map((value) => value.datas[2].avg_value);
        setAvgHRData(avgHRValues);
        setAvgBRData(avgBRValues);
      } else if (devicedataType === 14201) {
        const avgHRValues = data.map((value) => value.datas[12].avg_value);
        const avgBRValues = data.map((value) => value.datas[10].avg_value);
        setAvgHRData(avgHRValues);
        setAvgBRData(avgBRValues);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // map 비동기 함수 동기화 시켜주는 함수
  const fetchData = async (timestamps) => {
    try {
      const results = await Promise.all(
        timestamps.map(async (timestamp) => {
          const response = await axios.get(
            `http://api.hillntoe.com:7810/api/timestamp/tostring?timestamp=${timestamp}`
          );
          return response.data;
        })
      );
      console.log(results)
      setChartData(results.filter((data) => data !== null));
    } catch (error) {
      console.error(error);
    }
  };

  // 차트 Label function
  useEffect(() => {
    // const fetchAllData = async () => {
    //   await Promise.all(deviceIds.map((value) => HRBRData(value)));
    // };

    // fetchAllData();
    HRBRData(props.dropDown)
  }, [props.dropDown]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData(timestamp);
  }, [timestamp]);

  const formattedLabels = chartdata.map((data) => {
    const dateObject = new Date(data);
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // 월을 두 자리로 만들기
    const day = dateObject.getDate().toString().padStart(2, '0'); // 일을 두 자리로 만들기
    const formattedDate = `${month}/${day}`;
    return formattedDate;
  });

  console.log(chartdata)



  let data = {
    labels: formattedLabels,

    datasets: [
      {
        label: "  심박수   ",
        data: AvgHRData,
        fill: false,
        borderColor: "#d60225",
        tension: 0.01,
        yAxisID: "y1",
      },
      {
        label: "  호흡수",
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
       {AvgHRData.length || AvgBRData.length > 0 ? (<Line data={data} options={chartOptions} />) : <div style={{fontSize:'18px',fontWeight:500 ,lineHeight:11}}>감지된 데이터가 없습니다</div>}
    </div>
  );
}

export default ChartComponentW2;