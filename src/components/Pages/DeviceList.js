import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "./DeviceList.css";
import HRImg from "/HillnToe/hillntoe/src/asset/HRImg.png";
import BRImg from "/HillnToe/hillntoe/src/asset/BRImg.png";
import DisableImg from "/HillnToe/hillntoe/src/asset/DisabledDevice.png";
import MovingImg from "/HillnToe/hillntoe/src/asset/MovingImg.png";
import ReadyImg from "/HillnToe/hillntoe/src/asset/ReadyImg.png";
import CVFall from "/HillnToe/hillntoe/src/asset/CV_Fall.png";
import CV_STATUS1 from "/HillnToe/hillntoe/src/asset/CV_Status_1.png";
import CV_STATUS0 from "/HillnToe/hillntoe/src/asset/CV_Status_0.png";
import FVFall from "/HillnToe/hillntoe/src/asset/FV_Fall.png";
import FV_STATUS1 from "/HillnToe/hillntoe/src/asset/FV_Status_1.png";
import FV_STATUS0 from "/HillnToe/hillntoe/src/asset/FV_Status_0.png";
import FV_Edge from "/HillnToe/hillntoe/src/asset/FV_Edge.png";
import { SyncLoader } from "react-spinners";
function DeviceList() {
  const token = sessionStorage.getItem("authorizeKey");

  const [deviceInfo, setDeviceInfo] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [HRData, setHRData] = useState(null);
  const [BRData, setBRData] = useState(null);
  const [deviceType, setDeviceType] = useState([14101, 14201]);
  const [edgeState, setEdgeState] = useState(0)

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const response = await axios.get(
          "http://api.hillntoe.com:7810/api/config/device/info",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (response?.status === 200) {
          const data = response.data;
          setDeviceInfo(data);
        } else {
          throw new Error(`Failed to fetch device info (${response?.status})`);
        }
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };

    fetchDeviceInfo();
  }, [token]);

  const clickDeviceHandler = async (deviceId) => {
    setSelectedDevice(deviceId);
    setTimeout(() => {
      setShowModal(true);
    }, 800);

    try {
      const response = await axios.get(
        `http://api.hillntoe.com:7810/api/acqdata/count?device_id=${deviceId}&acq_type=E&count=1`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response?.status === 200) {
        const selectedDeviceInfo = response.data.find(
          (device) => device.device_id === deviceId
        );

        const deviceInfoResponse = await axios.get(
          `http://api.hillntoe.com:7810/api/config/device/info?device_id=${deviceId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        const deviceInfoData = deviceInfoResponse.data;
        setEdgeState(selectedDeviceInfo.datas[3].data_value)
        setDeviceData(deviceInfoData[0].device_type);
        setDeviceType(deviceInfoData[0].device_type);
        if (deviceInfoData[0].device_type === 14101) {
          setBRData(selectedDeviceInfo.datas[2]?.avg_value);
          setHRData(selectedDeviceInfo.datas[3]?.avg_value);
        } else if (deviceInfoData[0].device_type === 14201) {
          setBRData(selectedDeviceInfo.datas[10]?.avg_value);
          setHRData(selectedDeviceInfo.datas[12]?.avg_value);
        }
      } else {
        throw new Error(`Failed to fetch device data (${response?.status})`);
      }
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };

  useEffect(() => {
    // console.log("Device Data:", deviceData);
  }, [deviceData]);

  useEffect(() => {
    // console.log("BR Data:", BRData);
  }, [BRData]);

  useEffect(() => {
    // console.log("HR Data:", HRData);
  }, [HRData]);

  const renderDeviceRectangles = () => {
    return deviceInfo.map((device) => (
      <div
        className="device-rectangle"
        key={device.device_id}
        onClick={() => clickDeviceHandler(device.device_id)}
        style={{
          width: "76px",
          height: "76px",
          backgroundColor: `${device.is_enabled === 1 ? "#d2e6fa" : "#d60225"}`,
          borderRadius: "9px",
          cursor: "pointer",
          textAlign: "center",
          justifyContent: "center",
          lineHeight: "76px",
          fontWeight: "bold",
          position: "relative",
          color: `${device.is_enabled === 1 ? "#191919" : "#ffffff"}`,
          overflow: "hidden",
          margin: "9px",
        }}
      >
        {device.device_name}
      </div>
    ));
  };

  const errorDeviceCount = deviceInfo.reduce((count, device) => {
    if (device.is_enabled === 1) {
      return count + 1;
    }
    return count;
  }, 0);

  const renderDeviceData = () => {
    if (deviceData.length === 0) {
      return <div>{/* 데이터가 없을 때의 처리를 여기에 추가하세요. */}</div>;
    } else {
      return (
        <div className="HR-BR-container">
          <div className="HR-container">
            <img src={HRImg} alt="HRImage" className="HRimage" />
            <span>{HRData === 0 ? "-- --" : HRData?.toFixed(2)}</span>
            <span className="bpm-title">BPM</span>
          </div>

          <div className="BR-container">
            <img src={BRImg} alt="BRImage" className="BRimage" />
            <span>{BRData === 0 ? "-- --" : BRData?.toFixed(2)}</span>
            <span className="bpm-title">BPM</span>
          </div>
        </div>
      );
    }
  };


  return (
    <div className="MainContents">
      <Container fluid style={{ marginLeft: 0, padding: 0 }}>
        <Row style={{ marginLeft: "30px" }}>
          <div
            style={{
              width: "1028px",
              height: "276px",
              padding: "0px",
              marginTop: "26px",
              background: "#ffffff",
            }}
          >
            <h6
              style={{
                fontWeight: "bold",
                fontSize: "18.5px",
                background: "#ffffff",
                padding: "11px 0px 0px 20px",
                width: "100%",
                height: "8%",
              }}
            >
              장치 목록
            </h6>
            <div
              className="device-rectangle-container"
              style={{
                background: "#fff",
                width: "95%",
                height: "76%",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                marginLeft: "30px",
                paddingTop: "10px",
                overflowY: "auto",
              }}
            >
              <div
                className="device-rectangle"
                style={{
                  display: "flex",
                  alignItems: "center",
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {renderDeviceRectangles()}
              </div>
            </div>
          </div>
          <div
            style={{
              width: "536px",
              margin: "26px 31px 0px 32px",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "18.5px",
                margin: "11px 0px 10px 10px  ",
              }}
            >
              장치 정보
            </div>
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "20px 0px",
                  borderBottom: "1px solid #ededed",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#ededed",
                    margin: "0px 0px 0px 58px",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  style={{
                    marginLeft: "94px",
                    fontWeight: "500",
                    fontSize: "18px",
                  }}
                >
                  전체 장치 수
                </div>
                <div
                  style={{
                    marginLeft: "160px",
                    fontWeight: "500",
                    fontSize: "19px",
                  }}
                >
                  {deviceInfo.length} 개
                </div>
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "20px 0px",
                  borderBottom: "1px solid #ededed",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#d2e6fa",
                    margin: "0px 0px 0px 58px",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  style={{
                    marginLeft: "94px",
                    fontWeight: "500",
                    fontSize: "18px",
                  }}
                >
                  정상 장치 수
                </div>
                <div
                  style={{
                    marginLeft: "160px",
                    fontWeight: "500",
                    fontSize: "19px",
                  }}
                >
                  {errorDeviceCount} 개
                </div>
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "20px 0px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#d60225",
                    margin: "0px 0px 0px 58px",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  style={{
                    marginLeft: "94px",
                    fontWeight: "500",
                    fontSize: "18px",
                  }}
                >
                  불량 장치 수
                </div>
                <div
                  style={{
                    marginLeft: "160px",
                    fontWeight: "500",
                    fontSize: "19px",
                  }}
                >
                  {deviceInfo.length - errorDeviceCount} 개
                </div>
              </div>
            </div>
          </div>
        </Row>
      </Container>
      {/* 모달 */}
      <Modal
        style={{ borderRadius: "10px" }}
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <div className="header-title">장치 정보</div>
        </Modal.Header>
        <Modal.Body>
          <div className="Modal-container">
            <div className="deviceImg">
              {deviceType === 14101 ? (
                <img src={HRData === 0 ? CV_STATUS0 : CV_STATUS1} />
              ) : deviceType === 14201 ? (
                <img src={
                  HRData === 0
                    ? FV_STATUS0
                    : (edgeState === 0
                      ? FV_Edge
                      : FV_STATUS1)
                } />
              ) : null}
            </div>
            <div className="deviceInfo">
              <h4>
                {
                  deviceInfo.find(
                    (device) => device.device_id === selectedDevice
                  )?.device_name
                }
              </h4>
              <h5>
                {deviceType == 14101
                  ? "HRS_R8A_E_CV"
                  : deviceType === 14201
                  ? "HRS_R8A_E_FV"
                  : null}
              </h5>
              <div className="STATE-container">
                {HRData === 0 && BRData === 0 ? (
                  <img src={DisableImg} alt="DisableImg" />
                ) : (
                  <img src={ReadyImg} alt="ReadyImg" />
                )}
              </div>
              {renderDeviceData()}
              <button className="closeBtn" onClick={() => setShowModal(false)}>
                닫기
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DeviceList;
