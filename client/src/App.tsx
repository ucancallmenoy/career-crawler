import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Briefcase, LayoutGrid, Building2 } from "lucide-react";
import JobsPage from "./pages/JobsPage";
import CompaniesPage from "./pages/CompaniesPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <div className="nav__inner">
            <NavLink to="/" className="nav__brand">
              <span className="nav__logo-icon">
                <Briefcase size={16} strokeWidth={2.5} />
              </span>
              <span className="nav__brand-name">CareerCrawler</span>
            </NavLink>

            <div className="nav__links">
              <NavLink to="/" end className={({ isActive }) => `nav__link${isActive ? " active" : ""}`}>
                <LayoutGrid size={15} strokeWidth={2} />
                Jobs
              </NavLink>
              <NavLink to="/companies" className={({ isActive }) => `nav__link${isActive ? " active" : ""}`}>
                <Building2 size={15} strokeWidth={2} />
                Companies
              </NavLink>
            </div>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<JobsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
