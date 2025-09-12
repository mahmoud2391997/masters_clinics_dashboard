import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppSelector } from "./hooks/redux";
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
import MedicalDevicesPage from "./pages/devices";
import LandingPageEditor from "./pages/makingLandingPage/landingPageSingle";
import BlogsDashboard from "./pages/blogs";
import BlogSinglePage from "./pages/blogs/singleBlog";
import TestimonialsDashboard from "./pages/reviews";
import Inquiries from "./pages/inquiries/index";
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
            }
            catch (err) {
                console.error('Auth check failed:', err);
                navigate('/');
            }
        };
        checkToken();
    }, [navigate]);
    // Get user role from sessionStorage
    const role = sessionStorage.getItem("role");
    console.log(role);
    return (_jsxs("div", { dir: "rtl", className: "flex h-screen w-full relative", children: [_jsx(Sidebar, { toggleSidebar: setIsSidebarOpen }), _jsx("div", { className: "flex-grow transition-all duration-300", style: {
                    width: location.pathname === "/"
                        ? "100%"
                        : isSidebarOpen
                            ? "calc(100% - 240px)"
                            : "calc(100% - 64px)",
                    marginRight: location.pathname === "/"
                        ? "0"
                        : isSidebarOpen
                            ? "240px"
                            : "64px",
                }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), isAuthenticated && (_jsxs(_Fragment, { children: [(role === "admin" || role === "mediabuyer") && (_jsx(Route, { path: "/landingPage", element: _jsx(LandingPageForm, {}) })), (role === "admin" || role === "mediabuyer") && (_jsx(Route, { path: "/landingPage/:id", element: _jsx(LandingPageEditor, {}) })), (role === "admin" || role === "customercare") && (_jsx(Route, { path: "/inquiries", element: _jsx(Inquiries, {}) })), _jsx(Route, { path: "/doctors", element: _jsx(DataTableHeaders, {}) }), _jsx(Route, { path: "/testimonials", element: _jsx(TestimonialsDashboard, {}) }), _jsx(Route, { path: "/blogs", element: _jsx(BlogsDashboard, {}) }), _jsx(Route, { path: "/blogs/:id", element: _jsx(BlogSinglePage, {}) }), _jsx(Route, { path: "/doctors/:id", element: _jsx(DoctorSingle, {}) }), _jsx(Route, { path: "/departments", element: _jsx(DepartmentsStatsGrid, {}) }), _jsx(Route, { path: "/branches/:id", element: _jsx(BranchSingle, {}) }), _jsx(Route, { path: "/leads", element: _jsx(DataTable, { userRole: role }) }), _jsx(Route, { path: "/regions&branches", element: _jsx(RegionsBranchesPage, {}) }), _jsx(Route, { path: "/services", element: _jsx(ServicesManager, {}) }), _jsx(Route, { path: "/offers", element: _jsx(OffersPage, {}) }), _jsx(Route, { path: "/devices", element: _jsx(MedicalDevicesPage, {}) })] }))] }) })] }));
}
export default App;
