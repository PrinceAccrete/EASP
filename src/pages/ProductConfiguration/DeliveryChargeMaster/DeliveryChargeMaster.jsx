import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { Skeleton } from "primereact/skeleton";
import { MultiSelect } from "primereact/multiselect";

const DeliveryChargeMaster = () => {
    const toast = useRef(null);
    const [locations, setLocations] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { id } = useParams();
    const [taxProfile, setTaxProfile] = useState([]);
    const [deliveryRadius, setDeliveryRadius] = useState("");
    const [selectedLocation, setSelectedLocation] = useState([]);
    const [selectedTaxProfile, setSelectedTaxProfile] = useState(null);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;
    const token = useSelector((state) => state.auth.token);
    const [errorMessages, setErrorMessages] = useState({
        location: "",
        taxProfile: "",
        radius: "",
    });
    const navigate = useNavigate(null);
    const [charges, setCharges] = useState([
        { id: 1, srNo: 1, startKM: 0, endKM: "", charge: "", applyAs: "Per KM", editable: true },
    ]);
    const [rowErrors, setRowErrors] = useState({});

    const handleAddRow = () => {
        const lastCharge = charges[charges.length - 1];

        // Prevent adding a new row if endKM is empty
        if (lastCharge.endKM === "") return;

        setCharges([
            ...charges,
            {
                id: charges.length + 1,
                srNo: charges.length + 1,
                startKM: lastCharge.endKM,
                endKM: "",
                charge: "",
                applyAs: "Per KM",
                editable: true, // Only new row is editable
            },
        ]);
    };

    const handleRemoveRow = (id) => {
        setCharges(charges.filter((charge) => charge.id !== id));
    };

    const handleChange = (id, field, value) => {
        // let newValue = value;

        // if (field === "endKM") {
        //     newValue = Math.min(100, Math.max(0, value || 0));
        // } else if (field === "charge") {
        //     newValue = Math.min(1000, Math.max(0, value || 0));
        // }

        setCharges((prevCharges) =>
            prevCharges.map((charge) => (charge.id === id ? { ...charge, [field]: value } : charge))
        );
        setRowErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (newErrors[id]) {
                delete newErrors[id][field];
                if (Object.keys(newErrors[id]).length === 0) {
                    delete newErrors[id];
                }
            }
            return newErrors;
        });
    };

    const handleToggleApplyAs = (id, selectedType) => {
        setCharges(
            charges.map((charge) =>
                charge.id === id ? { ...charge, applyAs: selectedType } : charge
            )
        );
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

            if (response.data.success === 1) {
                const locationData = response.data.data.map((item) => ({
                    label: item.locationname,
                    value: item.locationid,
                }));
                setLocations(locationData);
            }
        } catch (err) {
            console.log("Error fetching location", err.message);
        }
    };

    const fetchTaxProfile = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/tax/getTaxProfileList?start=0&length=-1`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.data.success === 1) {
                const taxData = response.data.data.data.map((item) => ({
                    label: item.taxprofilename,
                    value: item.taxprofileid,
                }));
                setTaxProfile(taxData);
            }
        } catch (err) {
            console.log("Error fetching tax profiles", err.message);
        }
    };

    const validateFields = () => {
        let errors = { location: "", taxProfile: "", radius: "", chargeJson: "" };
        let rowErrors = {};
        let isValid = true;

        if (!selectedLocation) {
            errors.location = "Please select a location.";
            isValid = false;
        }
        if (!selectedTaxProfile) {
            errors.taxProfile = "Please select a tax profile.";
            isValid = false;
        }
        if (!deliveryRadius) {
            errors.radius = "Please enter a delivery radius.";
            isValid = false;
        }
        charges.forEach((charge) => {
            let rowError = {};
            if (charge.endKM === "") {
                rowError.endKM = "End KM is required.";
                isValid = false;
            }
            if (charge.charge === "") {
                rowError.charge = "Charge is required.";
                isValid = false;
            }
            if (Object.keys(rowError).length > 0) {
                rowErrors[charge.id] = rowError;
            }
        });

        setErrorMessages(errors);
        setRowErrors({ ...rowErrors });
        return isValid;
    };

    const resetFields = () => {
        setSelectedLocation(null);
        setSelectedTaxProfile(null);
        setDeliveryRadius("");
        setCharges([
            {
                id: 1,
                srNo: 1,
                startKM: 0,
                endKM: "",
                charge: "",
                applyAs: "Per KM",
                editable: true,
            },
        ]);
        setErrorMessages({ location: "", taxProfile: "", radius: "" });
        setRowErrors({});
    };

    const handleAddDeliveryCharge = async () => {
        if (!validateFields()) return;
        setIsSaving(true);
        try {
            const chargeJson = charges.map((charge) => ({
                startkm: charge.startKM,
                endkm: charge.endKM,
                charge: charge.charge,
                appyas: charge.applyAs === "Per KM" ? "perkm" : "fixed",
            }));
            const response = await axios.post(
                `${BASE_URL}/charge/createDeliveryCharge`,
                {
                    companyId: 5,
                    locationId: selectedLocation,
                    taxProfileId: selectedTaxProfile,
                    deliveryRadius: parseFloat(deliveryRadius),
                    chargeJson,
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
                    detail: "Delivery Charge added Sucessfully!",
                    life: 3000,
                });
                resetFields();
            }
        } catch (error) {
            if (error.response) {
                toast.current.show({
                    severity: "error",
                    summary: "Successful",
                    detail: error.response.data.msg || error.message,
                    life: 3000,
                });
            }
        } finally {
            setIsSaving(false);
        }
    };
    useEffect(() => {
        fetchLocation();
        fetchTaxProfile();
    }, [id]);

    const fetchDeliveryData = async () => {
        try {
            setIsInitialLoading(true);
            const response = await axios.get(`${BASE_URL}/charge/getDeliveryChargeData/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success === 1) {
                const locationids = response.data.data[0].locationid || [];
                const taxid = response.data.data[0].taxprofileid;
                const deliveryradius = response.data.data[0].deliveryradius;
                const chargejson = response.data.data[0].chargejson;

                const taxProfileObj = taxProfile.find((tax) => tax.value === taxid) || null;
                const locationObj = locations.find((loc) => loc.value === locationids) || null;

                setSelectedLocation(locationObj ? [locationObj.value] : []);
                setSelectedTaxProfile(taxProfileObj?.value || null);

                setDeliveryRadius(deliveryradius);
                if (chargejson && Array.isArray(chargejson)) {
                    setCharges(
                        chargejson.map((charge, index) => ({
                            id: index + 1,
                            srNo: index + 1,
                            startKM: charge.startkm,
                            endKM: charge.endkm,
                            charge: charge.charge,
                            applyAs: charge.appyas === "perkm" ? "Per KM" : "Fixed",
                            editable: true,
                        }))
                    );
                } else {
                    setCharges([]); 
                }
            } else {
                console.error("Invalid response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching delivery charge data:", error.message);
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        if (id && locations.length > 0 && taxProfile.length > 0) {
            fetchDeliveryData();
        }
    }, [locations, taxProfile, id]);

    const updateDeliveryData = async () => {
        if (!validateFields()) return;
        setIsSaving(true);
        try {
            const chargeJson = charges.map((charge) => ({
                startkm: charge.startKM,
                endkm: charge.endKM,
                charge: charge.charge,
                appyas: charge.applyAs === "Per KM" ? "perkm" : "fixed",
            }));

            const response = await axios.post(
                `${BASE_URL}/charge/updateDeliveryCharge/${id}`,
                {
                    companyId: 5,
                    // locationIds: selectedLocation,
                    taxProfileId: selectedTaxProfile,
                    deliveryRadius: parseFloat(deliveryRadius),
                    chargeJson,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success == 1) {
                toast.current.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Delivery Charge updated successfully!",
                    life: 3000,
                });
                resetFields();
                setTimeout(() => {
                    navigate("/deliveryChargeList");
                }, 2000);
            }
        } catch (error) {
            if (error.response) {
                toast.current.show({
                    severity: "error",
                    summary: "Successful",
                    detail: error.response.data.msg || "an error occured while saving",
                    life: 3000,
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const renderSkeleton = () => (
        <div className="card">
            <div className="grid p-fluid col-12">
                <div className="field col-12 md:col-4">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>

                <div className="field col-12 md:col-4">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>

                <div className="field col-12 md:col-4">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
            </div>

            <div className="flex justify-center text-xl font-bold mb-3">
                <Skeleton width="20%" height="2rem" className="mb-2" />
            </div>

            <DataTable value={charges} showGridlines tableStyle={{ minWidth: "50rem" }}>
                <Column
                    field="srNo"
                    header={<Skeleton width="2rem" height="3rem" />}
                    body={() => <Skeleton width="1.5rem" height="2rem" />}
                />
                <Column
                    field="startKM"
                    header={<Skeleton width="6rem" height="2rem" />}
                    style={{ minWidth: "14rem" }}
                    body={() => <Skeleton width="4rem" height="2rem" />}
                />
                <Column
                    field="endKM"
                    header={<Skeleton width="6rem" height="2rem" />}
                    style={{ minWidth: "12rem" }}
                    body={() => <Skeleton width="4rem" height="2rem" />}
                />
                <Column
                    field="charge"
                    header={<Skeleton width="6rem" height="2rem" />}
                    style={{ minWidth: "12rem" }}
                    body={() => <Skeleton width="4rem" height="2rem" />}
                />
                <Column
                    field="applyAs"
                    header={<Skeleton width="6rem" height="2rem" />}
                    style={{ minWidth: "13rem" }}
                    body={() => (
                        <div className="flex gap-2">
                            <Skeleton width="4rem" height="2.7rem" />
                            <Skeleton width="5rem" height="2.7rem" />
                        </div>
                    )}
                />
                <Column
                    field="#"
                    header={<Skeleton width="1.5rem" height="2rem" />}
                    style={{ minWidth: "6rem" }}
                    body={() => <Skeleton width="3rem" height="2.7rem" />}
                />
            </DataTable>

            <div className="field col-12">
                <div className="flex justify-content-end mt-4">
                    <Skeleton width="6rem" height="3rem" />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-black">Delivery Charge Master</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/deliveryChargeList");
                    }}
                >
                    <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            {isInitialLoading ? (
                renderSkeleton()
            ) : (
                <div className="card">
                    <div className="grid p-fluid ">
                        <div className="field col-12 md:col-4">
                            <label>Select Location</label>
                            <MultiSelect
                                filter
                                showClear
                                display="chip"
                                placeholder="- Select Location -"
                                value={selectedLocation}
                                disabled={!!id}
                                options={locations}
                                onChange={(e) => {
                                    setSelectedLocation(e.value);
                                    setErrorMessages((prev) => ({ ...prev, location: "" }));
                                }}
                                optionLabel="label"
                                optionValue="value"
                                className={errorMessages.location ? "p-invalid border-red-500" : ""}
                            />
                            {errorMessages.location && (
                                <small className="p-error">{errorMessages.location}</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-4">
                            <label>Tax Profile</label>
                            <Dropdown
                                filter
                                showClear
                                placeholder="- Select Tax Profile -"
                                value={selectedTaxProfile}
                                options={taxProfile}
                                onChange={(e) => {
                                    setSelectedTaxProfile(e.value);
                                    setErrorMessages((prev) => ({ ...prev, taxProfile: "" }));
                                }}
                                optionLabel="label"
                                optionValue="value"
                                className={
                                    errorMessages.taxProfile ? "p-invalid border-red-500" : ""
                                }
                            />
                            {errorMessages.taxProfile && (
                                <small className="p-error">{errorMessages.taxProfile}</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="dropdown">Delivery Radius</label>
                            <InputNumber
                                min={0}
                                max={100}
                                mode="decimal"
                                value={deliveryRadius || null}
                                onChange={(e) => {
                                    setDeliveryRadius(e.value);
                                    setErrorMessages((prev) => ({ ...prev, radius: "" }));
                                }}
                                placeholder="Enter Delivery Radius"
                                className={errorMessages.radius ? "p-invalid border-red-500" : ""}
                            />
                            {errorMessages.radius && (
                                <small className="p-error">{errorMessages.radius}</small>
                            )}
                        </div>
                    </div>
                    {/* <h3>Delivery Charge Master</h3> */}
                    <div className="flex justify-center text-xl font-bold mb-3">
                        Delivery Charge List
                    </div>

                    <DataTable value={charges} showGridlines tableStyle={{ minWidth: "50rem" }}>
                        <Column field="srNo" header="Sr. No." body={(row) => row.srNo} />
                        <Column
                            field="start KM"
                            header="Start KM"
                            style={{ minWidth: "14rem" }}
                            body={(row) => <InputNumber value={row.startKM} readOnly={true} />}
                        />
                        <Column
                            field="end KM"
                            header="End KM"
                            style={{ minWidth: "12rem" }}
                            body={(row) => (
                                <div>
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        value={row.endKM || null}
                                        onChange={(e) => handleChange(row.id, "endKM", e.value)}
                                        className={
                                            rowErrors[row.id]?.endKM
                                                ? "p-invalid border-red-500"
                                                : ""
                                        }
                                        disabled={!row.editable}
                                    />
                                    {rowErrors[row.id]?.endKM && (
                                        <small className="p-error">
                                            {rowErrors[row.id]?.endKM}
                                        </small>
                                    )}
                                </div>
                            )}
                        />
                        <Column
                            field="charge"
                            header="Charge"
                            style={{ minWidth: "12rem" }}
                            body={(row) => (
                                <div>
                                    <InputNumber
                                        min={0}
                                        max={1000}
                                        value={row.charge || null}
                                        onChange={(e) => handleChange(row.id, "charge", e.value)}
                                        disabled={!row.editable}
                                        className={
                                            rowErrors[row.id]?.charge
                                                ? "p-invalid border-red-500"
                                                : ""
                                        }
                                    />
                                    {rowErrors[row.id] && rowErrors[row.id].charge && (
                                        <small className="p-error">
                                            {rowErrors[row.id].charge}
                                        </small>
                                    )}
                                </div>
                            )}
                        />
                        <Column
                            field="apply as "
                            header="Apply As"
                            style={{ minWidth: "13rem" }}
                            body={(row) => (
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button
                                        style={{
                                            padding: "8px 16px",
                                            fontSize: "16px",
                                            minWidth: "60px",
                                        }}
                                        label="Fixed"
                                        className={
                                            row.applyAs === "Fixed"
                                                ? "p-button-success"
                                                : "p-button-outlined"
                                        }
                                        onClick={() => handleToggleApplyAs(row.id, "Fixed")}
                                        disabled={!row.editable}
                                    />
                                    <Button
                                        style={{
                                            padding: "8px 16px",
                                            fontSize: "16px",
                                            minWidth: "60px",
                                        }}
                                        label="Per KM"
                                        className={
                                            row.applyAs === "Per KM"
                                                ? "p-button-info"
                                                : "p-button-outlined"
                                        }
                                        onClick={() => handleToggleApplyAs(row.id, "Per KM")}
                                        disabled={!row.editable}
                                    />
                                </div>
                            )}
                        />
                        <Column
                            field="#"
                            header="#"
                            style={{ minWidth: "6rem" }}
                            body={(row) => (
                                <div className="flex gap-2">
                                    {row.id === 1 && (
                                        <Button
                                            icon="pi pi-plus"
                                            style={{ fontSize: "0.8rem", padding: "10px 10px" }}
                                            className="p-button-success"
                                            onClick={handleAddRow}
                                        />
                                    )}
                                    {row.id !== 1 && (
                                        <Button
                                            icon="pi pi-minus"
                                            className="p-button-danger"
                                            style={{ fontSize: "0.8rem", padding: "10px 10px" }}
                                            onClick={() => handleRemoveRow(row.id)}
                                        />
                                    )}
                                </div>
                            )}
                        />
                    </DataTable>

                    <div className="field col-12">
                        <div className="flex justify-content-end mt-4">
                            {id ? (
                                <Button
                                    label={isSaving ? "Updating..." : "Update"}
                                    className="w-auto self-end"
                                    onClick={updateDeliveryData}
                                    disabled={isSaving}
                                />
                            ) : (
                                <Button
                                    label={isSaving ? "Adding..." : "Add"}
                                    className="w-auto self-end"
                                    onClick={handleAddDeliveryCharge}
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

export default DeliveryChargeMaster;
