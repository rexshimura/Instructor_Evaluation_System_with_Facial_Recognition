// --- Header/NavBar (no changes) ---
import {FaArrowLeft} from "react-icons/fa";

export const RegisterInstructorNavBar = ({ onReturn }) => (
  <nav className="bg-blue-800 text-white p-4 flex justify-between items-center rounded-b-md">
    <h1 className="font-bold text-lg">Instructor Registration</h1>
    <button
      onClick={onReturn}
      className="py-2 px-4 rounded-md text-white border border-white hover:bg-white hover:text-blue-800 transition-colors duration-200 flex items-center gap-2"
    >
      <FaArrowLeft />
      Return
    </button>
  </nav>
);