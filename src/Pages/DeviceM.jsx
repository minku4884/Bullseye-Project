import React, { useState } from "react";
import { DropdownButton, Dropdown } from "react-bootstrap";
import "../styles/DeviceM.css";
import FallBedImg from "../asset/img/FallBedImg.png";
import FallImg from "../asset/img/FallImg.png";
import ApexCharts from "react-apexcharts";
function DeviceM() {
  // 낙상 이미지 임시변수
  const [FallState, setFallState] = useState(0);

  // 샘플 데이터
  const data = [
    {
      name: 1,
      data: [1, 2, 3, 4, 5, 6, 7, 15]
    },
    {
      name: 2,
      data: [8, 7, 6, 5, 4, 3, 2, 1]
    },
    {
      name: 3,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      name: 4,
      data: [1, 2, 3, 4, 5, 6, 7, 8]
    },
  ];

  const colors = ["#008FF", "blue","#008FF","#008FF","#008FF","#008FF","#008FF","#008FF",]; // 각 시리즈에 대한 색상
// #008FF #FF5733
  const options = {
    series: data,
    chart: {
      height: 450,
      type: "heatmap"
    },
    dataLabels: {
      enabled: false
    },
    colors: colors,
    xaxis: {
      type: "category",
      // categories: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '01:00', '01:30']
    },
    grid: {
      padding: {
        right: 20
      }
    }
  };

  function DeviceNum(deviceNumber) {
    const devices = [];
    for (let i = 0; i < deviceNumber; i++) {
      devices.push(
        <div className="Device-Num" key={i}>
          <div className="Device-Content-main">
            <div className="Device-FallBedImg">
              <img src={FallBedImg} alt="FallBed"></img>
            </div>
            {/* 장치 수 만큼 DeviceContainer 생성 시 낙상정보에 따른 이미지 표시 */}
            {FallState === 0 ? (
              <div className="Device-FallImg">
                <img src={FallImg} alt="Fall"></img>
              </div>
            ) : null}
            {/* 불필요한 else 문 제거 */}
        <ApexCharts className="heatmapChart" options={options} series={data} type="heatmap" width={300} height={320} />

          </div>
          <div className="Device-Content-submain">
            <div className="Device-Content-submain-P1">
              <div className="Device-DataValue">심박 :</div>
              <div className="Device-DataValue">상태 :</div>
              <div className="Device-DataValue">거리 :</div>
              <div className="Device-DataValue">파워 :</div>
            </div>
            <div className="Device-Content-submain-P2">
              <div className="Device-DataValue">호흡 :</div>
              <div className="Device-DataValue">위치 :</div>
              <div className="Device-DataValue">바닥 :</div>
              <div className="Device-DataValue">낙상 :</div>
            </div>
          </div>
        </div>
      );
    }
    return devices;
  }

  return (
    <div>
      <div className="Device-Header">
        <div className="Device-Type-DropDown">
          <DropdownButton id="dropdown-basic-button" title="Dropdown button">
            <Dropdown.Item href="#/action-1">HRS_R8A_E_CV</Dropdown.Item>
            <Dropdown.Item href="#/action-2">HRS_R8A_E_FV</Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
      <div className="Device-MainContent">{DeviceNum(6)}</div>
    </div>
  );
}

export default DeviceM;
