import React, { useContext, forwardRef, useImperativeHandle, useRef } from "react";
import { Link } from "react-router-dom";
import { classNames } from "primereact/utils";
import { LayoutContext } from "../../../layout/context/layoutcontent";
import { logout } from "../../redux/slice/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import axios from "axios";

const AppTopbar = forwardRef((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } =
        useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const dispatch = useDispatch();
    const toast = useRef(null);
    const token = useSelector((state) => state.auth.token);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current,
    }));

    const handleLogout = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/users/userLogout`, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (response.data.success === 1) {
                dispatch(logout()); // Clear Redux auth state
                // Store logout message in sessionStorage
                sessionStorage.setItem("logoutSuccess", "Logged out successfully");

                navigate("/login"); // Redirect to login
            } else {
                throw new Error(response.data.msg || "Logout failed. Please try again.");
            }
        } catch (error) {
            toast.current.show({
                severity: "error",
                detail: error.response?.data?.msg || "Logout failed. Please try again.",
                life: 2000,
            });
        }
    };

    return (
        <div className="layout-topbar">
            <Toast ref={toast} />
            {/* <Link to="/" className="layout-topbar-logo">
                <img
                    src={`/layout/images/Accretelogo.jpg`}
                    width="120px"
                    height={"35px"}
                    alt="company logo"
                />
            </Link> */}

            <button
                ref={menubuttonRef}
                type="button"
                className="p-link layout-menu-button layout-topbar-button"
                onClick={onMenuToggle}
            >
                <i className="pi pi-bars" />
            </button>

            <button
                ref={topbarmenubuttonRef}
                type="button"
                className="p-link layout-topbar-menu-button layout-topbar-button"
                onClick={showProfileSidebar}
            >
                <i className="pi pi-ellipsis-v" />
            </button>

            <div
                ref={topbarmenuRef}
                className={classNames("layout-topbar-menu", {
                    "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible,
                })}
            >
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
                <button
                    type="button"
                    className="p-link layout-topbar-button"
                    onClick={handleLogout}
                >
                    <i className="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
});

export default AppTopbar;
