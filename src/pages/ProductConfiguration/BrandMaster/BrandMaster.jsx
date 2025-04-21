import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";

const BrandMaster = () => {
    const toast = useRef(null);
    const navigate = useNavigate();
    const [brand, setBrand] = useState("");
    const [brandError, setBrandError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [updateError, setUpdateError] = useState("");
    const token = useSelector((state) => state.auth.token);
    const [isInitalLoading, setIsInitialLoading] = useState(false);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;
    const { id } = useParams();

    const brandRegex = /^[a-zA-Z0-9\-&().',@$ ]*$/;

    const handleBrandChange = (e) => {
        const value = e.target.value;
        if (brandRegex.test(value)) {
            setBrand(value);
        }
    };

    const handleAddBrand = async () => {
        if (!brand.trim()) {
            setBrandError("Brand Name is required");
            return;
        } else {
            setBrandError("");
        }
        setIsSaving(true);

        try {
            const response = await axios.post(
                `${BASE_URL}/brands/create`,
                {
                    brandName: brand,
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
                    detail: "Brand added Sucessfully!",
                    life: 3000,
                });
                // updateBrandList()
                setBrand("");
            }
        } catch (error) {
            if (error.response) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.response.data.msg || error.message,
                    life: 3000,
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const fetchBrandData = async (brandId) => {
        try {
            // setIsInitialLoading(true)
            const response = await axios.post(
                `${BASE_URL}/brands/getData/${id}`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success === 1) {
                const fetchedBrand = response.data.data[0].brandname;
                setBrand(fetchedBrand);
            }
        } catch (error) {
        } finally {
            setIsInitialLoading(false);
        }
    };

    const handleUpdateBrand = async () => {
        if (!brand.trim()) {
            setBrandError("Brand Name is required");
            return;
        } else {
            setUpdateError("");
        }
        setIsSaving(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/brands/update/${id}`,
                {
                    brandName: brand,
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
                setTimeout(() => {
                    navigate("/brand-list");
                }, 2000);
                setBrand("");
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
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (id) {
            setIsInitialLoading(true);
            fetchBrandData(id);
        } else {
            setIsInitialLoading(false);
            setBrand("");
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
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-black">Brand Master</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/brand-list");
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
                            <label htmlFor="dropdown">Brand Name </label>
                            <InputText
                                value={brand}
                                onChange={(e) => {
                                    // setBrand(e.target.value);
                                    handleBrandChange(e);
                                    setBrandError("");
                                }}
                                placeholder="Enter Brand"
                                className={`${brandError || updateError ? "p-invalid" : ""}`}
                                style={{ borderColor: brandError || updateError ? "red" : "" }}
                                maxLength={50}
                            />
                            {brandError && <small className="p-error">{brandError}</small>}
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
                                    onClick={handleUpdateBrand}
                                    disabled={isSaving}
                                />
                            ) : (
                                <Button
                                    label={isSaving ? "Adding..." : "Add"}
                                    className="w-auto self-end"
                                    onClick={handleAddBrand}
                                    disabled={isSaving}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandMaster;
