import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";

function PortionMaster() {
    const toast = useRef(null);
    const [portion, setPortion] = useState("");
    const [portionError, setPortionError] = useState("");
    const [updateError, setUpdateError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const token = useSelector((state) => state.auth.token);
    const { id } = useParams();
    const [isInitalLoading, setIsInitialLoading] = useState(false);
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const portionRegex = /^[a-zA-Z0-9\-&().',@$ ]*$/;

    const handlePortionChange = (e) => {
        const value = e.target.value;
        if (portionRegex.test(value)) {
            setPortion(value);
        }
    };

    const handleAddPortion = async () => {
        if (!portion.trim()) {
            setPortionError("PortionName is Required!");
            return;
        } else {
            setPortionError("");
        }
        setIsSaving(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/portion/create`,
                {
                    portionName: portion,
                    companyId: 5,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success === 1) {
                toast.current.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Portion added Sucessfully!",
                    life: 3000,
                });
                setPortion("");
            }
        } catch (error) {
            if (error.response) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.response.data.msg || "an error occured while saving",
                    life: 3000,
                });
            }
        }
        setIsSaving(false);
    };

    /// it fetch portiondata for update
    const fetchPortionData = async (portionId) => {
        try {
            setIsInitialLoading(true);
            const response = await axios.post(
                `${BASE_URL}/portion/getData/${id}`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success === 1) {
                const fetchedPortion = response.data.data[0].portionname;
                setPortion(fetchedPortion);
            }
        } catch (error) {
        } finally {
            setTimeout(() => {
                setIsInitialLoading(false);
            }, 3000);
        }
    };
    const handleUpdatePortion = async () => {
        if (!portion.trim()) {
            setUpdateError("Portion name is required!");
            return;
        } else {
            setUpdateError("");
        }
        setIsSaving(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/portion/update/${id}`,
                {
                    portionName: portion,
                    companyId: 5,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success === 1) {
                toast.current.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Update succesfully",
                    life: 3000,
                });
                setPortion("");
                setTimeout(() => {
                    navigate("/portion-list");
                }, 2000);
                // updatePortionList();
            }
        } catch (error) {
            if (error.response) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.response.data.msg || "an error occured while saving",
                    life: 3000,
                });
            }
        }
        setIsSaving(false);
    };

    useEffect(() => {
        if (id) {
            fetchPortionData(id);
        } else {
            setPortion("");
        }
    }, [id]);

    const renderSkeleton = () => (
        <div className="card">
            <div className="grid p-fluid col-12">
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
            </div>
            <div className="field col-12">
                <div className="flex justify-content-end">
                    <Skeleton width="6rem" height="3rem" />
                    
                </div>
            </div>
        </div>
        )

    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-black">Portion Master</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/portion-list");
                    }}
                >
                    <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>


            {isInitalLoading ? (
                renderSkeleton()
            ) : (
                <div className="card">
                    <div className="grid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="dropdown">Product-Portion </label>
                            <InputText
                                value={portion}
                                onChange={(e) => {
                                    handlePortionChange(e);
                                    // setPortion(e.target.value);
                                    setPortionError("");
                                    setUpdateError("");
                                }}
                                placeholder="Enter Portion"
                                className={`${portionError || updateError ? "p-invalid" : ""}`}
                                style={{ borderColor: portionError || updateError ? "red" : "" }}
                                maxLength={50}
                            />
                            {portionError && <small className="p-error">{portionError}</small>}
                            {updateError && <small className="p-error">{updateError}</small>}
                        </div>
                        {/* </div> */}
                    </div>
                    <div className="field col-12">
                        <div className="flex justify-content-end">
                            {id ? (
                                <Button
                                    label={isSaving ? "Updating..." : "Update"}
                                    className="w-auto self-end"
                                    onClick={handleUpdatePortion}
                                    disabled={isSaving}
                                />
                            ) : (
                                <Button
                                    label={isSaving ? "Adding..." : "Add"}
                                    className="w-auto self-end"
                                    onClick={handleAddPortion}
                                    disabled={isSaving}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PortionMaster;
