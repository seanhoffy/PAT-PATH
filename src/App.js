import HomePage from "./routes/HomePage";
import LandingPage from "./routes/LandingPage";
import LoginPage from "./routes/LoginPage";
import Register from "./routes/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PDFPage from "./routes/research_paper";
import HistoryPage from "./routes/HistoryPage";
import TerminologyPage from "./routes/TerminologyPage";
import AboutUsPage from "./routes/AboutUsPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/researchpaper" element={<PDFPage />} />
        <Route path="/terminology" element={<TerminologyPage />} />
        <Route path="/about" element={<AboutUsPage />} />
      </Routes>
    </Router>
  );
}

export default App;