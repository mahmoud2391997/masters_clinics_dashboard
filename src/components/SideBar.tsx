import { useLocation, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck,  faCity,   faFileMedicalAlt,   faGift,   faHouseMedical,   faLaptopMedical,   faPager,  faSignOutAlt, faStethoscope, faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Article, ArticleOutlined } from "@mui/icons-material";
export default function Sidebar({ toggleSidebar }: { toggleSidebar: (state: boolean) => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Get role from sessionStorage (or wherever you store it)
    const role = sessionStorage.getItem("role");

    const handleHover = (state: boolean) => {
        setIsExpanded(state);
    };

    const menuItems = [
        ...(role === "admin" || role === "mediabuyer"
            ? [{ label: "انشاء صفحة هبوط", icon: faPager, path: "/landingPage" }]
            : []),
        { label: "الحجوزات", icon: faCalendarCheck, path: "/leads" },
...(role === "admin" ? [
        { label: "المناطق والفروع", icon: faCity, path: "/regions&branches" },
        { label: "الاقسام", icon: faHouseMedical, path: "/departments" },
        { label: "الاطباء", icon: faUserDoctor, path: "/doctors" },
        { label: "الخدمات", icon: faStethoscope, path: "/services" },
        { label: "العروض", icon: faGift, path: "/offers" },
        { label: "الاجهزة", icon: faLaptopMedical, path: "/devices" },
        { label: "المقالات", icon: faFileMedicalAlt, path: "/blogs" },
        
    ] : []),
        { label: "تسجيل الخروج", icon: faSignOutAlt, path: "/logout", isLogout: true },
    ];

    function handleLogout() {
        sessionStorage.removeItem("token");
        navigate("/");
    }

    if (location.pathname === "/") return null;

    return (
        <div
            dir="rtl"
            className={`bg-[#f6eecd]  h-full fixed right-0 transition-all duration-300 ${
                isExpanded ? "w-60" : "w-16"
            }`}
            onMouseEnter={() => {
                toggleSidebar(true);
                handleHover(true);
            }}
            onMouseLeave={() => {
                toggleSidebar(false);
                handleHover(false);
            }}
        >
            <Link to="/leads">
                <div className=" h-16 flex items-center justify-center">
                    <img src="https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/dEYvd/lBmMUm3zZyt94KtrsYYdL6UrUEOoncu4UJnK9VhR.png" className="h-10 w-10" alt="logo" />
                    <span
                        className={`mr-2 font-bold text-xl text-black transition-opacity duration-1000 ${
                            isExpanded ? "opacity-100" : "opacity-0 w-0"
                        }`}
                        style={{ visibility: isExpanded ? "visible" : "hidden" }}
                    >
                        لوحة المشرف
                    </span>
                </div>
            </Link>

            <ul className="px-2 flex flex-col justify-start" style={{ height: "calc(100vh - 64px)" }}>
                {menuItems.map((item, index) => (
                    <li key={index}>
                        {item.isLogout ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-3 h-12 text-red-400 hover:text-red-600 transition-all duration-300 w-full text-left"
                            >
                                <FontAwesomeIcon icon={item.icon} className="text-2xl min-w-[24px]" />
                                <span
                                    className={`ml-2 transition-opacity duration-300 ${
                                        isExpanded ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        ) : (
                            <Link
                                to={item.path}
                                className={`flex items-center px-3 gap-2 h-11 hover:text-gray-600 transition-all duration-300 ${
                                    location.pathname === item.path ? "text-[#dec06a] font-semibold" : "text-black"
                                }`}
                            >
                                <FontAwesomeIcon icon={item.icon} className="text-2xl min-w-[24px]" />
                                <span
                                    className={`transition-opacity duration-300 ${
                                        isExpanded ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
