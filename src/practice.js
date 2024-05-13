import axios from "axios";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const Practice = () => {
  const token = sessionStorage.getItem("authorizeKey");
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://api.hillntoe.com:7810/alarmHub") // SignalR hub URL
      .build();

    connection.start()
      // .then(() => console.log('SignalR 연결 성공'))
      .catch(err => console.error('SignalR 연결 실패', err));

    connection.on("ReceiveMessage", (user, message) => {
      setMessages(prevMessages => [...prevMessages, { user, message }]);
    });

    return () => {
      connection.stop();
    };
  }, []);
  // Signal R 메세지 호출
  // console.log(messages)
}
export default Practice
