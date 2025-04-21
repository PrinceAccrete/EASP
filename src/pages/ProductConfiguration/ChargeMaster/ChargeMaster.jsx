import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./ChargeMaster.css";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";

function ChargeMaster() {
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;
    const toast = useRef(null);
    const token = useSelector((state) => state.auth.token);
    const { id } = useParams();
    const chargeId = id ? parseInt(id) : null;
        // console.log(typeof(chargeId))


    const navigate = useNavigate();

    // States for loading
    const [isSaving, setIsSaving] = useState(false);

    const [isInitialLoading, setIsInitialLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState({}); // State for error messages

    // States for various dropdowns and fields
    // const [companyData, setCompanyData] = useState([]);
    // const [selectedCompany, setSelectedCompany] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [menuData, setMenuData] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);

    const [productData, setProductData] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState([]);
    const [selectAllProducts, setSelectAllProducts] = useState(false);

    const [fulfillmentData] = useState([
        { label: "Delivery", value: 1 },
        { label: "Pickup", value: 2 },
    ]);
    const [selectedFulfillment, setSelectedFulfillment] = useState([]);
    const [description, setDescription] = useState("");
    const [applicableData] = useState([
        { label: "Per Item Quantity", value: 1 },
        { label: "Order Sub Total", value: 2 },
    ]);
    const [selectedApplicable, setSelectedApplicable] = useState(null);
    const [status, setStatus] = useState(0); // Default as 0 (inactive)
    const [chargeName, setChargeName] = useState("");
    const [chargeValue, setChargeValue] = useState(null);

    const validateForm = () => {
        let errors = {};

        if (!selectedLocation) errors.location = "Location is required.";
        if (!selectedMenu) errors.menu = "Menu is required.";
        if (!selectedProduct.length) errors.products = "Select at least one product.";
        if (!chargeName.trim()) errors.chargeName = "Charge Name is required.";
        if (chargeValue === null) errors.chargeValue = "Charge Value is required.";
        if (!selectedFulfillment.length)
            errors.fulfillment = "Select at least one fulfillment mode.";
        // if (!selectedApplicable) errors.applicable = "Select an application type.";
        // if (!description.trim()) errors.description = "Description is required.";

        setErrorMsg(errors);
        return Object.keys(errors).length === 0; // Returns true if no errors
    };

    const clearError = (field) => {
        setErrorMsg((prevErrors) => ({ ...prevErrors, [field]: "" }));
    };

    // Fetch location data based on selected company
    const fetchLocation = async (selectdCompany) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/location/getLocationList?start=0&length=-1`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.success === 1) {
                const locationOptions = response.data.data.map((item) => ({
                    label: item.locationname,
                    value: item.locationid,
                }));
                setLocationData(locationOptions);
            } else {
                setLocationData([]);
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
        }
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    // Fetch menu data based on selected company and location
    const fetchMenu = async (selectedLocation) => {
        if (!selectedLocation) return;
        try {
            const response = await axios.post(
                `${BASE_URL}/menu/getMenuList?start=0&length=-1`,
                {
                    companyId: 5,
                    locationId: selectedLocation?.value,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success === 1) {
                const menuOptions = response.data.data.data.map((item) => ({
                    label: item.menuname,
                    value: item.menuid,
                }));
                setMenuData(menuOptions);
            }
        } catch (error) {
            console.error("Error fetching menu data:", error);
        }
    };

    useEffect(() => {
        if (selectedLocation) {
            fetchMenu(selectedLocation);
        }
    }, [selectedLocation]);

    // Fetch product data based on selected menu
    useEffect(() => {
        if (selectedMenu) {
            fetchProduct(selectedMenu);
        } else {
            setProductData([]);
            setSelectedProduct([]);
        }
    }, [selectedMenu]);

    const fetchProduct = async (selectedMenu) => {
        try {
            const response = await axios.post(
                `http://192.168.120.117:8002/api/v1/charge/getProductsWithCharge`,
                {
                    menuId: selectedMenu,
                    locationId: selectedLocation,
                    chargeId: chargeId || 0, // If no chargeId, pass 0
                    companyId: 5,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (response.data.success === 1) {
                const data = response.data.data;
    
                const associated = data.associatedProducts?.[0]?.products || [];
                const unassociated = data.unAssociatedProducts || [];
    
                const groupedOptions = [
                    {
                        label: "Associated Products",
                        items: associated.map((item) => ({
                            label: item.productname,
                            value: item.productid,
                        })),
                    },
                    {
                        label: "Unassociated Products",
                        items: unassociated.map((item) => ({
                            label: item.productname,
                            value: item.productid,
                        })),
                    },
                ];
    
                setProductData(groupedOptions);
    
                // 🔥 Only set selected if it's update mode (chargeId exists)
                if (chargeId) {
                    const selected = associated.map((item) => item.productid);
                    setSelectedProduct(selected);
    
                    const allItems = associated.length + unassociated.length;
                    setSelectAllProducts(selected.length === allItems);
                } else {
                    setSelectedProduct([]); // Nothing selected in create mode
                    setSelectAllProducts(false);
                }
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
        }
    };
    

    // Fetch charge data based on chargeId
    const fetchChargeById = async () => {
        if (!chargeId) return;

        try {
            setIsInitialLoading(true);
            const response = await axios.get(`${BASE_URL}/charge/getChargeData/${chargeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success === 1) {
                const chargeData = response.data.data[0]; // Since data is an array, access the first element
                console.log(response.data)

                // Set states for various fields
                // setSelectedCompany(chargeData.companyid);
                setSelectedLocation(chargeData.locationid);
                setSelectedMenu(chargeData.menuid);
                setChargeName(chargeData.chargename);
                setChargeValue(parseFloat(chargeData.chargevalue).toFixed(2));
                setDescription(chargeData.description);
                setSelectedApplicable(chargeData.applicableon); 
                setStatus(chargeData.isactive);

                // Convert productJson and fulfillmentModesJson from string to array
                // setSelectedProduct(chargeData.productjson);
                setSelectedFulfillment(chargeData.fulfillmentmodesjson);
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Charge data not found",
                    life: 3000,
                });
            }
        } catch (error) {
            console.error("Error fetching charge data:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to fetch charge data",
                life: 3000,
            });
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        if (chargeId) {
            setIsInitialLoading(true); // Set loading immediately before fetching data
            fetchChargeById();
        }
    }, [chargeId]);

    // this is addchargefunction
    const createCharge = async () => {
        // Validation
        if (!validateForm()) return;

        setIsSaving(true);

        // const productJson = selectedProduct.join(",");
        // const fulfillmentModesJson = selectedFulfillment.join(",");

        const payload = {
            locationId: selectedLocation,
            menuId: selectedMenu,
            productJson: selectedProduct,
            chargeName: chargeName,
            chargeValue: chargeValue || 0,
            fulfillmentModesJson: selectedFulfillment,
            isActive: status,
            companyId: 5,
            description: description || "",
            applicableOn: selectedApplicable,
        };

        try {
            const response = await axios.post(`${BASE_URL}/charge/createCharge`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.data.success === 1) {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Charge created successfully!",
                    life: 1000,
                });
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to create charge.",
                    life: 3000,
                });
            }
        } catch (error) {
            // console.error("Error saving category:", error);
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

    // this is updateCharge function
    const updateCharge = async () => {
        if (!validateForm()) return;

        setIsSaving(true);

        // const productJson = selectedProduct.join(",");
        // const fulfillmentModesJson = selectedFulfillment.join(",");

        const payload = {
            locationId: selectedLocation,
            menuId: selectedMenu,
            productJson: selectedProduct,
            chargeName: chargeName,
            chargeValue: chargeValue,
            fulfillmentModesJson: selectedFulfillment,
            isActive: status,
            companyId: 5,
            description: description,
            applicableOn: selectedApplicable,
        };

        try {
            const response = await axios.post(
                `${BASE_URL}/charge/updateCharge/${chargeId}`,
                payload,
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
                    summary: "Success",
                    detail: "Charge updated successfully!",
                    life: 3000,
                });
            
                navigate("/charge-list");
            }else {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to update charge.",
                    life: 3000,
                });
            }
        } catch (error) {
            // console.error("Error saving category:", error);
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

    const handleChange = (e) => {
        const { name, value } = e.target || e;

        const regex = /^[a-zA-Z0-9\-&().',@$ ]*$/;

        if (regex.test(value)) {
            if (name === "chargeName") {
                setChargeName(value);
                clearError(name); // Clears error when user types in chargeName
            } else if (name === "description") {
                setDescription(value);
                clearError(name); // Clears error when user types in description
            }
        }
    };
    const renderSkeleton = () => (
        <div className="card">
            <div className="grid p-fluid col-12">
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>

                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="6.5rem" />
                </div>
                <div className="field col-12 md:col-6 flex flex-col  gap-4 mt-5">
                    <Skeleton width="40%" height="2rem" className="mb-2" />
                </div>
            </div>
            <div className="field col-12">
                <div className="flex justify-content-end">
                    <Skeleton width="6rem" height="3.5rem" className="mb-2" />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Charge Master</div>

                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/charge-list");
                    }}
                >
                    <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            {isInitialLoading ? (
                renderSkeleton()
            ) : (
                <div className="card">
                    <div className="grid p-fluid col-12">
                        {/* <div className="field col-12 md:col-6">
                            <label htmlFor="company-dropdown">Company</label>
                            <Dropdown
                                value={selectedCompany}
                                options={companyData}
                                onChange={(e) => setSelectedCompany(e.value)}
                                placeholder="- Select Company -"
                                filter
                                showClear
                            />
                        </div> */}
                        <div className="field col-12 md:col-6">
                            <label htmlFor="location-dropdown">Location <span style={{ color: 'red' }}>*</span></label>
                            <Dropdown
                                value={selectedLocation}
                                options={locationData}
                                onChange={(e) => {
                                    setSelectedLocation(e.value);
                                    clearError("location");
                                }}
                                placeholder="- Select Location -"
                                filter
                                showClear
                                className={errorMsg.location ? "p-invalid border-red-500" : ""}
                            />
                            {errorMsg.location && (
                                <small className="p-error">{errorMsg.location}</small>
                            )}
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="menu-dropdown">Menu <span style={{ color: 'red' }}>*</span></label>
                            <Dropdown
                                value={selectedMenu}
                                options={menuData}
                                onChange={(e) => {
                                    setSelectedMenu(e.value);
                                    clearError("menu");
                                }}
                                placeholder="Select Menu"
                                filter
                                showClear
                                className={errorMsg.menu ? "p-invalid border-red-500" : ""}
                            />
                            {errorMsg.menu && <small className="p-error">{errorMsg.menu}</small>}
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="products-dropdown">Products <span style={{ color: 'red' }}>*</span></label>
                            <MultiSelect
                                value={selectedProduct}
                                options={productData}
                                optionGroupLabel="label"
                                optionGroupChildren="items"
                                onChange={(e) => {
                                    setSelectedProduct(e.value);
                                    const totalItems = productData.flatMap(
                                        (group) => group.items
                                    ).length;
                                    setSelectAllProducts(e.value.length === totalItems);
                                    clearError("products");
                                }}
                                selectAll={selectAllProducts}
                                onSelectAll={(e) => {
                                    const allItems = productData
                                        .flatMap((group) => group.items)
                                        .map((item) => item.value);
                                    setSelectedProduct(e.checked ? [] : allItems);
                                    setSelectAllProducts(!e.checked);
                                }}
                                virtualScrollerOptions={{ itemSize: 50 }}
                                placeholder="- Select Products -"
                                filter
                                showClear
                                multiple
                                display="chip"
                                className={errorMsg.products ? "p-invalid border-red-500" : ""}
                            />
                            {errorMsg.products && (
                                <small className="p-error">{errorMsg.products}</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="charge-name">Charge Name <span style={{ color: 'red' }}>*</span></label>
                            <InputText
                                value={chargeName}
                                name="chargeName"
                                onChange={handleChange}
                                placeholder="Enter Charge Name"
                                className={errorMsg.chargeName ? "p-invalid border-red-500" : ""}
                                maxLength={100}
                            />
                            {errorMsg.chargeName && (
                                <small className="p-error">{errorMsg.chargeName}</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="charge-value">Charge Value <span style={{ color: 'red' }}>*</span></label>
                            <InputNumber
                                value={chargeValue}
                                onChange={(e) => {
                                    setChargeValue(e.value);
                                    clearError("chargeValue");
                                }}
                                placeholder="Enter Charge Value"
                                min={1}
                                max={50000}
                                className={errorMsg.chargeValue ? "p-invalid border-red-500" : ""}
                            />
                            {errorMsg.chargeValue && (
                                <small className="p-error">{errorMsg.chargeValue}</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="fulfillment-modes">Fulfillment Modes <span style={{ color: 'red' }}>*</span></label>
                            <MultiSelect
                                value={selectedFulfillment}
                                options={fulfillmentData}
                                onChange={(e) => {
                                    setSelectedFulfillment(e.value);
                                    clearError("fulfillment");
                                }}
                                placeholder="- Select Fulfillment Mode -"
                                filter
                                showClear
                                display="chip"
                                className={errorMsg.fulfillment ? "p-invalid border-red-500" : ""}
                            />
                            {errorMsg.fulfillment && (
                                <small className="p-error">{errorMsg.fulfillment}</small>
                            )}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="applicable-on">Applicable On</label>
                            <Dropdown
                                value={selectedApplicable}
                                options={applicableData}
                                onChange={(e) => {
                                    setSelectedApplicable(e.value);
                                    clearError("applicable");
                                }}
                                placeholder="- Select Application Type -"
                                // className={errorMsg.applicable ? "p-invalid border-red-500" : ""}
                                showClear
                            />
                            {/* {errorMsg.applicable && (
                                <small className="p-error">{errorMsg.applicable}</small>
                            )} */}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="description">Description</label>
                            <InputTextarea
                                value={description}
                                name="description"
                                onChange={handleChange}
                                placeholder="Enter Description"
                                rows={3}
                                cols={30}
                                // className={errorMsg.description ? "p-invalid border-red-500" : ""}
                            />
                            {/* {errorMsg.description && (
                                <small className="p-error">{errorMsg.description}</small>
                            )} */}
                        </div>

                        <div className="field col-12 md:col-6 flex flex-col  gap-4">
                            <div className="flex gap-3 items-center">
                                <InputSwitch
                                    checked={status === 1} // Convert 1 to true and 0 to false for InputSwitch
                                    onChange={(e) => setStatus(e.value ? 1 : 0)} // Store directly as 1 or 0
                                />
                                <span>Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="field col-12">
                        <div className="flex justify-content-end">
                            <Button
                                className="self-end w-auto"
                                label={
                                    isSaving
                                        ? chargeId
                                            ? "Updating..."
                                            : "Adding..."
                                        : chargeId
                                        ? "Update"
                                        : "Add"
                                }
                                onClick={chargeId ? updateCharge : createCharge}
                                disabled={isSaving} // Prevent multiple clicks while saving
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChargeMaster;
