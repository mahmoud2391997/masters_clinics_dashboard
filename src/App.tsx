import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {  useAppSelector } from "./hooks/redux";
import Login from "./pages/Login";
import LandingPageForm from "./pages/makingLandingPage/contentForm";
import DataTable from "./pages/appoinments";
import Sidebar from "./components/SideBar";
import RegionsBranchesPage from "./pages/Regions_Branches";
import BranchSingle from "./pages/Regions_Branches/branchSingle";
import DepartmentsStatsGrid from "./pages/departments";
import DataTableHeaders from "./pages/doctors/table";
import ServicesManager from "./pages/services";
import DoctorSingle from "./pages/doctors/doctorSingle";
import OffersPage from "./pages/offers";
import CategorySinglePage from "./pages/services/singleService";
import MedicalDevicesPage from "./pages/devices";
import LandingPageEditor from "./pages/makingLandingPage/landingPageSingle";
import BlogsDashboard from "./pages/blogs";

function App() {

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = sessionStorage.getItem('token'); // or get from cookie

      if (!token) {
        navigate('/');
        return;
      }

      try {
        const res = await fetch('https://www.ss.mastersclinics.com/protected', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        // Token is valid, do nothing or load user info
        const data = await res.json();
        console.log('User info:', data.user);
      } catch (err) {
        console.error('Auth check failed:', err);
        navigate('/');
      }
    };

    checkToken();
  }, [navigate]);
  // Get user role from sessionStorage
  const role = sessionStorage.getItem("role");
console.log(role);

  return (
    <div dir="rtl" className="flex h-screen w-full relative">
      <Sidebar toggleSidebar={setIsSidebarOpen} />
      <div
        className="flex-grow transition-all duration-300"
        style={{
          width:
            location.pathname === "/"
              ? "100%"
              : isSidebarOpen
              ? "calc(100% - 240px)"
              : "calc(100% - 64px)",
          marginRight:
            location.pathname === "/"
              ? "0"
              : isSidebarOpen
              ? "240px"
              : "64px",
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          {isAuthenticated && (
            <>
              {(role === "admin" || role === "mediabuyer") && (
                <Route path="/landingPage" element={<LandingPageForm />} />
              )}
              {(role === "admin" || role === "mediabuyer") && (
                <Route path="/landingPage/:id" element={<LandingPageEditor />} />
              )}
              <Route path="/doctors" element={<DataTableHeaders />} />
              <Route path="/blogs" element={<BlogsDashboard />} />
              <Route path="/doctors/:id" element={<DoctorSingle />} />
              <Route path="/departments" element={<DepartmentsStatsGrid />} />
              <Route path="/branches/:id" element={<BranchSingle />} />
              <Route path="/leads" element={<DataTable userRole={role as 'customercare' | 'mediabuyer' | "admin"} />} />
              <Route path="/regions&branches" element={<RegionsBranchesPage />} />
              <Route path="/services" element={<ServicesManager />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/services/:id" element={<CategorySinglePage />} />
              <Route path="/devices" element={<MedicalDevicesPage />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;