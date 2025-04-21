import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { login } from "../../redux/slice/AuthSlice";
import { Toast } from "primereact/toast";
import axios from "axios";
import "./Login.scss";

function Login() {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: false, password: false });
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const toast = useRef(null);
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    // Refs for input fields and button
    const passwordRef = useRef(null);
    const signInButtonRef = useRef(null);

    useEffect(() => {
        // Check if logout success message exists
        const message = sessionStorage.getItem("logoutSuccess");

        if (message) {
            toast.current.show({
                severity: "success",
                detail: message,
                life: 2000,
            });

            // Clear message after displaying
            sessionStorage.removeItem("logoutSuccess");
        }
    }, []);

    const handleCheckboxChange = () => {
        setChecked(!checked);
    };

    // Email validation function
    const isValidEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for email validation
        return emailPattern.test(email);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Remove validation error when user types
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors, [name]: value.trim() === "" };

            // If the field is email, check if it is valid and update `emailInvalid`
            if (name === "email") {
                newErrors.emailInvalid = !isValidEmail(value) && value.trim() !== "";
            }

            return newErrors;
        });
    };

    // Handle "Enter" key press
    const handleKeyDown = (e, field) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default form submission behavior
            if (field === "email" && passwordRef.current) {
                passwordRef.current.focus(); // Move focus to password input
            } else if (field === "password" && signInButtonRef.current) {
                signInButtonRef.current.click(); // Trigger sign-in button click
            }
        }
    };

    const validateForm = () => {
        let newErrors = { email: false, password: false, emailInvalid: false };
        let isValid = true;

        if (formData.email.trim() === "") {
            newErrors.email = true;
            isValid = false;
        } else if (!isValidEmail(formData.email)) {
            newErrors.emailInvalid = true;
            isValid = false;
        }

        if (formData.password.trim() === "") {
            newErrors.password = true;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        setErrorMessage("");

        // Validate before making API call
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        axios
            .post(`${BASE_URL}/users/userLogin`, formData)
            .then((response) => {
                if (response.data.success === 1) {
                    dispatch(
                        login({
                            token: response?.data?.token || "",
                            userData: response?.data?.userData || {},
                        })
                    );
                    // Store success message in sessionStorage
                    sessionStorage.setItem("loginSuccess", "Logged in successfully");

                    navigate("/"); // Navigate to dashboard
                } else {
                    setErrorMessage(response.data.msg || "Login failed. Please try again.");
                }
            })
            .catch((error) => {
                setErrorMessage(
                    error.response?.data?.msg || "Network error. Please check your connection."
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // const handleSignUpClick = () => {
    //     navigate("/signup");
    // };

    return (
        // <div className="flex align-items-center justify-content-center min-h-screen">
        <div className="login-main-box">
            <Toast ref={toast} />
            <div className="login-image">
                <img src="/layout/images/login.png" className="log-in-img" />
            </div>
            <div className="surface-card p-4 set-login-box">
                <div className="set-center-login">
                    <div className="mb-5">
                        <img
                            src="/layout/images/billberrylogo.png"
                            alt="hyper"
                            height={70}
                            className="mb-3"
                        />
                        <div className="text-900 text-3xl font-medium mb-3">
                            Let’s Get You Signed In
                        </div>
                        {/* <span className="text-600 font-medium line-height-3">
                        Don't have an account?
                    </span>
                    <a className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">
                        Create today!
                    </a> */}
                    </div>

                    <div>
                        <div className="grid p-fluid">
                            <div className="col-12">
                                <label htmlFor="email" className="block text-900 font-medium mb-2">
                                    Email
                                </label>
                                <InputText
                                    id="email"
                                    type="text"
                                    name="email"
                                    placeholder="Email address"
                                    value={formData.email}
                                    className={`w-full mb-1 ${errors.email ? "p-invalid" : ""}`}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => handleKeyDown(e, "email")} // Handle Enter key
                                />
                                {errors.email && (
                                    <small className="p-error">Email is required</small>
                                )}
                                {errors.emailInvalid && (
                                    <small className="p-error">Invalid email format</small>
                                )}
                            </div>
                            <div className="col-12">
                                <label
                                    htmlFor="password"
                                    className="block text-900 font-medium mb-2"
                                >
                                    Password
                                </label>
                                <InputText
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    className={`w-full mb-1 ${errors.password ? "p-invalid" : ""}`}
                                    onChange={handleInputChange}
                                    ref={passwordRef} // Reference for focusing
                                    onKeyDown={(e) => handleKeyDown(e, "password")} // Handle Enter key
                                />
                                {errors.password && (
                                    <small className="p-error">Password is required</small>
                                )}
                            </div>
                        </div>

                        <div className="flex align-items-center justify-content-between mb-5">
                            <div className="flex align-items-center">
                                <Checkbox
                                    id="rememberme"
                                    checked={checked}
                                    className="mr-2"
                                    onChange={() => handleCheckboxChange()}
                                />
                                <label htmlFor="rememberme">Remember me</label>
                            </div>
                            <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">
                                Forgot your password?
                            </a>
                        </div>
                        {errorMessage && <small className="p-error">{errorMessage}</small>}
                        <Button
                            label={loading ? "Signing In..." : "Sign In"}
                            icon="pi pi-user"
                            className="w-full"
                            onClick={handleLogin}
                            disabled={loading}
                            ref={signInButtonRef} // Reference for triggering click
                        />
                    </div>
                </div>
            </div>
        </div>
        // </div>
    );
}

export default Login;
