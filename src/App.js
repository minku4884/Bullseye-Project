/*eslint-disabled*/
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // BrowserRouter와 Link 추가
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import MainLayout from "./routes/MainLayout";
function App() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    
    <div className="hillntoe-container">

        <Routes>
          <Route exact path="*" element={<Login />}  />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
    </div>
  );
}

export default App;