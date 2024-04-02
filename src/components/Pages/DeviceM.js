import React from "react";
import { DropdownButton, Dropdown } from "react-bootstrap";
import "../styles/DeviceM.css";
function DeviceM() {
  // 샘플 데이터
  
  function DeviceNum(deviceNumber) {
    const devices = [];
    for (let i = 0; i < deviceNumber; i++) {
      devices.push(
        <div className="Device-Num" key={i}>
          <div className="Device-Content-main">
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
