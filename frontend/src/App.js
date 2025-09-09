import Login from "./pages/Login";
import Home from "./pages/home/Home";
import {Route, Routes} from "react-router-dom";
import ProtectedRoute from "./token/ProtectedRoute";

function App() {
    return (
    <Routes>
      <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />

        </Route>
    </Routes>
  );
}

export default App;
