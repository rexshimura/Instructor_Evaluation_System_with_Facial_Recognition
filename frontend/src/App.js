import Login from "./pages/Login";
import Home from "./pages/home/Home";
import {Route, Routes} from "react-router-dom";

function App() {
    return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
