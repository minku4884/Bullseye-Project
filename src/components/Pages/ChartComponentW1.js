import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

function ChartComponentW1(props) {
  const token = sessionStorage.getItem("authorizeKey");

  const [HRArr, setHRArr] = useState([]);
  const [BRArr, setBRArr] = useState([]);
  const [chartLabel,setChartLabel] = useState([])
  const maxDataValue = Math.max(...[...HRArr, ...BRArr]);
  const maxDataValueWithPadding = Math.ceil(maxDataValue * 1.29);


  // SEARCH YYYYMMDDHHmm
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 1을 더하고 2자리로 패딩
  const day = today.getDate().toString().padStart(2, "0"); // 일자를 2자리로 패딩

  const end_date = `${year}${month}${day}2359`;


  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 6);

  const fiveDaysAgoYear = fiveDaysAgo.getFullYear();
  const fiveDaysAgoMonth = (fiveDaysAgo.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const fiveDaysAgoDay = fiveDaysAgo.getDate().toString().padStart(2, "0");

  const start_date = `${fiveDaysAgoYear}${fiveDaysAgoMonth}${fiveDaysAgoDay}0000`;


 
  const fetchDataForDevice = (deviceId) => {
    return axios.get(
      `http://api.hillntoe.com:7810/api/acqdata/section?device_id=${deviceId}&acq_type=H&start_date=${start_date}&end_date=${end_date}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
  };

  const searchData = () => {
    const deviceIds = props.deviceId;
    const promises = [];
  
    const dateCounts = {
      hrCount: {},
      brCount: {},
    };


    
    deviceIds.forEach((deviceId) => {
      promises.push(fetchDataForDevice(deviceId));
    });
    Promise.all(promises)
      .then((responses) => {
        const combinedData = responses.flatMap((response) => response.data);
        combinedData.map((value, index) => {
          const date = new Date(value.timestamp * 1000);
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const formattedDate = `${month}${day}`;
          // Check if the date exists in dateCounts, if not, initialize count to 0
          if (!dateCounts.hrCount[formattedDate]) {
            dateCounts.hrCount[formattedDate] = 0;
          }
  
          if (!dateCounts.brCount[formattedDate]) {
            dateCounts.brCount[formattedDate] = 0;
          }

          let BR, HR
          if(value.datas.length == 9) {
           BR = value.datas[2].max_value;
           HR = value.datas[3].max_value;
          } else if(value.datas.length == 13) {
           BR = value.datas[10].max_value;
           HR = value.datas[12].max_value;
          }
          dateCounts.hrCount[formattedDate] += HR != 0 &&(HR > 95 || HR < 40)  ? 1 : 0;
          dateCounts.brCount[formattedDate] += BR != 0 &&(BR > 11 || BR < 5)  ? 1 : 0;
  

          const lab = Object.keys(dateCounts.hrCount)
          setChartLabel(lab)
        });
        // Log the counts for each date
        const HRarr = Object.values(dateCounts.hrCount)
        setHRArr(HRarr)
        const BRarr = Object.values(dateCounts.brCount)
        setBRArr(BRarr)
        // Additional processing for combined data
      })
      .catch((error) => {
        console.error("Error fetching device info:", error);
      });
  };
  
  useEffect(() => {
    // 데이터 요청 함수 호출
    searchData();
  },[props.deviceId]);


  const data = {
    labels: chartLabel,
    datasets: [
      {
        label: "  심박수   ",
        data: HRArr,
        fill: false,
        borderColor: "#d60225",
        tension: 0.01,
      },
      {
        label: "  호흡수",
        data: BRArr,
        fill: false,
        borderColor: "#0041b9",
        tension: 0.01,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        max: maxDataValueWithPadding,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + "회";
          },
        },
        grid: {
          borderDash: [4, 4],
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
      },
      point: {
        radius: 2.5,
      },
    },
  };

  return (
    <div style={{ width: "694px", height: "240px", margin: "auto" }}>
      <Line type="line" data={data} options={chartOptions} />
    </div>
  );
}

export default ChartComponentW1;
