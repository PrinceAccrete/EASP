import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { Skeleton } from "primereact/skeleton";

const TableMaster = () => {
    const toast = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
     const [isSaving, setIsSaving] = useState(false);
     const [isInitalLoading, setIsInitialLoading] = useState(false);
     const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;
    const [formData, setFormData] = useState({
        table: "",
        selectedLocation: "",
        isActive: "",
    });

    const tableRegex = /^[a-zA-Z0-9\-&().',@$ ]*$/;
    const handleTableChange = (e) => {
        const value = e.target.value;
        if (tableRegex.test(value)) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                table: value,
            }));
        }
    };
    // const [locationName,setLocationName] = useState("");

    // const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationOptions, setLocationOptions] = useState([]);

    // const [isActive, setIsActive] = useState(false);
    // const [table, setTable] = useState("");
    const [tableError, setTableError] = useState("");
    // const [updateError, setUpdateError] = useState("");
    const [locationError, setLocationError] = useState("");

    const handleValidation = (table, selectedLocation) => {
        let isValid = true;
        if (!table.trim()) {
            setTableError("Table Name is required!");
            isValid = false;
        }
        if (!selectedLocation) {
            setLocationError("Location is required!");
            isValid = false;
        }
        return isValid;
    };

    const handleAddTable = async () => {
        if (!handleValidation(formData.table, formData.selectedLocation)) return;
        setIsSaving(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/table/createTable`,

                {
                    tableName: formData.table,
                    locationId: formData.selectedLocation,
                    isActive: formData.isActive ? 1 : 0,
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
                    detail: "Table added Sucessfully!",
                    life: 3000,
                });
                setFormData({
                    table: "",
                    selectedLocation: "",
                    isActive: false,
                });
            }
        } catch (error) {
            if (error.response) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.response.data.msg || "An error occured while saving",
                    life: 3000,
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const fetchTableData = async () => {
        try {
            setIsInitialLoading(true);
            const response = await axios.get(
                `${BASE_URL}/table/getTableData/${id}`,
                // { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setFormData((prev) => ({
                ...prev,
                table: response.data.data[0].tablename,
                selectedLocation: response.data.data[0].locationid,
                isActive: response.data.data[0].isactive === 1 ? true : false,
            }));

            if (response.data?.success === 1 && Array.isArray(response.data.data.data)) {
                setCategories(
                    response.data.data.data.map((item) => ({
                        label: item.locationname,
                        value: item.locationid,
                    }))
                );
            }
        } catch (error) {
        } finally {
            setTimeout(() => {
                setIsInitialLoading(false);
            }, 3000);
        }
    };

    const handleUpdateTable = async () => {
        if (!handleValidation(formData.table, formData.selectedLocation)) return;
        setIsSaving(true);
        if (!formData.table.trim()) {
            setTableError("Table Name is required!");
        } else {
            setTableError("");
        }
        try {
            const response = await axios.post(
                `${BASE_URL}/table/updateTable/${id}`,
                {
                    tableName: formData.table,
                    companyId: 5,
                    locationId: formData.selectedLocation,
                    isActive: formData.isActive ? 1 : 0,
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
                    detail: "Table updated successfully!",
                    life: 3000,
                });
                setFormData({
                    table: "",
                    selectedLocation: "",
                    isActive: false,
                });
                setTimeout(() => {
                    navigate("/table-list");
                }, 2000);
            }
        } catch (error) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.msg || "An error occurred while saving.",
                life: 2000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const fetchLocation = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/location/getLocationList`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            let arr = response.data.data.filter(
                (table) => table.locationid == formData.selectedLocation
            );

            if (response.data.success === 1) {
                const locations = response.data.data.map((item) => ({
                    label: item.locationname,
                    value: item.locationid,
                }));
                setLocationOptions(locations);
            }
        } catch (error) {}
    };

    // useEffect(() => {
    //     fetchLocation();
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            await fetchLocation();
            if (id) {
                setIsInitialLoading(true);
                fetchTableData();
            } else {
                setIsInitialLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const renderSkeleton = () => (
        <div className="card">
            <div className="grid p-fluid col-12">
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="8rem" height="2rem" className="mb-2" />
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
                <div className="text-black">Table Master</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/table-list");
                    }}
                >
                    <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            {isInitalLoading ? (
                renderSkeleton()
            ) : (
                <div className="card">
                    <div className="grid p-fluid ">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="dropdown">Table Name</label>
                            <InputText
                                onChange={(e) => {
                                    // setFormData({ ...formData, table: e.target.value });
                                    handleTableChange(e);
                                    if (e.target.value.trim()) {
                                        setTableError("");
                                    }
                                }}
                                value={formData.table}
                                className={`${tableError ? "p-invalid" : ""}`}
                                style={{ borderColor: tableError ? "red" : "" }}
                                placeholder="Enter Table Name"
                                maxLength={50}
                            />
                            {tableError && <small className="p-error">{tableError}</small>}
                            {/* {updateError && <small className="p-error">{updateError}</small>} */}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold whitespace-nowrap self-center">
                                Location
                            </label>
                            <Dropdown
                                filter
                                // showClear
                                placeholder="- Select Location -"
                                className={locationError ? "p-invalid" : ""}
                                style={{ borderColor: locationError ? "red" : "" }}
                                value={formData.selectedLocation}
                                options={locationOptions}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => {
                                    setFormData({ ...formData, selectedLocation: e.value });
                                    if (e.value) {
                                        setLocationError("");
                                    }
                                }}
                            />
                            {locationError && <small className="p-error">{locationError}</small>}
                        </div>

                        <div className="field col-12 md:col-4 flex align-items-center gap-3 flex-wrap md:flex-nowrap">
                            <label className="font-semibold whitespace-nowrap self-center">
                                Is Active
                            </label>
                            <InputSwitch
                                checked={formData.isActive}
                                onChange={(e) => {
                                    setFormData({ ...formData, isActive: e.value });
                                }}
                            />
                        </div>
                    </div>

                    <div className="field col-12">
                        <div className="flex justify-content-end">
                            {id ? (
                                <Button
                                    label={isSaving ? "Updating..." : "Update"}
                                    className="w-auto self-end"
                                    onClick={handleUpdateTable}
                                    disabled={isSaving}
                                />
                            ) : (
                                <Button
                                    label={isSaving ? "Adding..." : "Add"}
                                    className="w-auto self-end"
                                    onClick={handleAddTable}
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

export default TableMaster;
