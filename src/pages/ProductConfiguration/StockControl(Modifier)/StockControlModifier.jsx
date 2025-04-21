import { Column } from "jspdf-autotable";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { Skeleton } from "primereact/skeleton";

const StockControlItem = () => {
    const token = useSelector((state) => state.auth.token);

    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const toast = useRef(null);
    const dropdownRef = useRef(null);

    const [errorMsg, setErrorMsg] = useState({});

    const [toggleStatus, setToggleStatus] = useState(null); // Initially no selection

    const toggleStatusOptions = [
        { label: "ON", value: true },
        { label: "OFF", value: false },
    ];

    const [franchiseType, setFranchiseType] = useState([
        { label: "COCO", value: 1 },
        { label: "FOFO", value: 2 },
        { label: "N/A", value: 0 },
    ]);

    const [statusOptions, setStatusOptions] = useState([
        { label: "Stock In", value: 1 },
        { label: "Stock Out", value: 0 },
    ]);

    const [loading, setLoading] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [StockModifiers, setStockModifiers] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    const [allLocations, setAllLocations] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [modifierCategory, setModifierCategory] = useState([]);
    const [selectedModiferCateogry, setselectedModiferCateogry] = useState([]);

    const [modifiier, setModifier] = useState([]);
    const [selectedModifier, setselectedModifier] = useState([]);

    const [selectedFranchise, setSelectedFranchise] = useState(null);

    const [selectedStatus, setSelectedStatus] = useState(null);

    const [originalStockItemList, setOriginalStockItemList] = useState([]);

    // State for Toggle Switch

    const categoryRegex = /^[a-zA-Z0-9\-&().',@$ ]*$/;
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (categoryRegex.test(value)) {
            setModifierCategory(value);
        }
    };

    const fetchLocation = async () => {
        try {
            // First API call to get all locations
            const response = await axios.post(
                `${BASE_URL}/location/getLocationList`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    params: {
                        start: 0,
                        length: -1,
                    },
                }
            );
    
            if (response.data.success === 1) {
                const locationIds = response.data.data.map((loc) => loc.locationid);
    
                // Second API call to get only franchisee locations
                const response2 = await axios.post(
                    `${BASE_URL}/location/getFranchiseeLocationList`,
                    {
                        companyId: 5,
                        locationIds: locationIds,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
    
                const rawData = response2?.data?.data || [];
    
                const formattedData = rawData.map((item) => ({
                    label: item.locationname,
                    value: item.locationid,
                    franchisetype: item.franchisetype,
                }));
    
                setAllLocations(formattedData);
                setLocations(formattedData); // initially show all
            }
        } catch (err) {
            console.log("Error fetching location", err.message);
        }
    };
    

    useEffect(() => {
        fetchLocation();
        fetchModifier();
        fetchModifierCategory();
    }, []);

    const handleFranchiseChange = (value) => {
        setSelectedFranchise(value);

        if (value === null || value === undefined) {
            setLocations(allLocations);
        } else {
            const filtered = allLocations.filter((loc) => loc.franchisetype === value);
            setLocations(filtered);
        }
    };

    const fetchModifier = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/modifier/getModifierList?start=0&length=-1`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.success === 1) {
                console.log("modifiers", response.data);
                const ModifierData = response.data.data.data.map((item) => ({
                    label: item.modifiername,
                    value: item.modifierid,
                }));
                setModifier(ModifierData);
            }
        } catch (err) {
            console.log("Error fetching Product", err.message);
        }
    };

    const fetchModifierCategory = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/modifier/getModifierCategoryList?start=0&length=-1`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.success === 1) {
                console.log(response.data);
                const ModifierData = response.data.data.data.map((item) => ({
                    label: item.modifiercategoryname,
                    value: item.modifiercategoryid,
                }));
                setModifierCategory(ModifierData);
            }
        } catch (err) {
            console.log("Error fetching Product", err.message);
        }
    };

    const fetchStockData = async (
        selectedLocation,
        selectedModiferCateogry,
        selectedModifier
        // selectedStatus
    ) => {
        setLoading(true);
        try {
            const requestData = {
                companyId: 5,
                locationId: selectedLocation || null,
                modifierCategoryIds: selectedModiferCateogry,
                modifierIds: selectedModifier,
            };

            console.log("Sending Payload:", requestData); // Debugging log

            const response = await axios.post(
                `${BASE_URL}/stockControl/getStockControlModifiers?start=0&length=-1`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success === 1) {
                const rawItems = response.data.data.data;
                setOriginalStockItemList(rawItems);
                filterStockByStatus(rawItems, selectedStatus);
                // let filteredModifiers = response.data.data.data;

                // if (selectedStatus !== null) {
                //     filteredModifiers = filteredModifiers.filter(
                //         (item) => item.instock === selectedStatus
                //     );
                // }

                // console.log("Stock Data:", response.data.data.data);
                // setStockModifiers(filteredModifiers);
            } else {
                setStockModifiers([]);
                console.log("Error fetching stock Modifier list:", response.data);
            }
        } catch (err) {
            setStockModifiers([]);
            console.error("Error fetching stock control data:", err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    };

    const filterStockByStatus = (items, status) => {
        if (status === null || status === undefined) {
            console.log("if yes");
            setStockModifiers(items);
        } else {
            console.log("else yes");
            const filtered = items.filter((item) => item.instock === status);
            setStockModifiers(filtered);
        }
    };

    useEffect(() => {
        filterStockByStatus(originalStockItemList, selectedStatus);
    }, [selectedStatus]);

    const toggleAvailability = async (rowData) => {
        const updatedStockModifiers = StockModifiers.map((item) =>
            item.omid === rowData.omid ? { ...item, instock: item.instock === 1 ? 0 : 1 } : item
        );

        setStockModifiers(updatedStockModifiers);

        const payload = {
            onlineStockModifiersData: [
                {
                    omid: rowData.omid,
                    inStock: rowData.instock === 1 ? 0 : 1,
                },
            ],
        };

        try {
            await axios.post(`${BASE_URL}/stockControl/updateStockControlModifiers`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Stock updated for Modifier",
                life: 3000,
            });
            console.log("Single modifier updated");
        } catch (error) {
            console.error("Error updating single modifier:", error);
        }
    };

    const handleToggleStatusChange = async (status) => {
        const updatedModifiers = StockModifiers.map((item) =>
            selectedRows.some((row) => row.omid === item.omid)
                ? { ...item, instock: status === "on" ? 1 : 0 }
                : item
        );

        setStockModifiers(updatedModifiers);
        // setToggleStatus(status);

        const payload = {
            onlineStockModifiersData: selectedRows.map((row) => ({
                omid: row.omid,
                inStock: status === "on" ? 1 : 0,
            })),
        };

        try {
            await axios.post(`${BASE_URL}/stockControl/updateStockControlModifiers`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setSelectedRows([]);
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Bulk stock status updated",
                life: 3000,
            });
            console.log("Bulk modifier update successful");
        } catch (error) {
            console.error("Error updating modifiers:", error);
        }
    };

    useEffect(() => {
        if (selectedRows.length > 0 && dropdownRef.current) {
            dropdownRef.current.focus();
            setTimeout(() => {
                dropdownRef.current.overlayVisible = true;
                dropdownRef.current.show();
            }, 0);
        }
    }, [selectedRows]);

    const validateFilters = () => {
        const errors = {};

        if (!selectedLocation) {
            errors.location = "Location is required.";
        }

        setErrorMsg(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFilter = async () => {
        const isValid = validateFilters();

        if (!isValid) {
            // Clear the list if location is missing
            setStockModifiers([]);
            return;
        }

        setIsFiltering(true); // Start "Filtering..." state

        try {
            await fetchStockData(selectedLocation, selectedModiferCateogry, selectedModifier);
        } finally {
            setIsFiltering(false); // End loading
        }
    };

    // Skaletan Here

    const modifierNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="80%" height="2rem" />
        ) : (
            <span>{rowData.modifiername ? rowData.modifiername : "-"}</span>
        );
    };

    const modifierCategoryNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="2rem" />
        ) : (
            <span>{rowData.modifiercategoryname ? rowData.modifiercategoryname : "-"}</span>
        );
    };

    const stockStatusBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="3rem" height="2rem" borderRadius="15px" />
        ) : (
            <InputSwitch
                checked={rowData.instock === 1}
                onChange={() => toggleAvailability(rowData)}
                disabled={selectedRows.length > 0}
            />
        );
    };

    return (
        <div>
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-black">Stock Control On - Off (Modifier)</div>
            </div>

            <div className="card mb-[1rem]">
                <Toast ref={toast} />
                <div className="grid p-fluid">
                    <div className="field col-12 md:col-4">
                        <label>Franchise Type</label>
                        <Dropdown
                            filter
                            showClear
                            placeholder="- Select Franchise -"
                            value={selectedFranchise}
                            options={franchiseType}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => handleFranchiseChange(e.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="location-dropdown">Location <span style={{ color: 'red' }}>*</span></label>
                        <Dropdown
                            id="location-dropdown"
                            value={selectedLocation}
                            options={locations}
                            onChange={(e) => {
                                setSelectedLocation(e.value);
                                clearError("location");
                            }}
                            placeholder="- Select Location -"
                            filter
                            showClear
                            disabled={loading}
                            className={errorMsg.location ? "p-invalid border-red-500" : ""}
                        />
                        {errorMsg.location && (
                            <small className="p-error">{errorMsg.location}</small>
                        )}
                    </div>

                    <div className="field col-12 md:col-4">
                        <label>Modifier Category</label>
                        <MultiSelect
                            filter
                            showClear
                            disabled={loading}
                            placeholder="- Select Modifiers Category -"
                            value={selectedModiferCateogry} // Now an array
                            options={modifierCategory}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => {
                                setselectedModiferCateogry(e.value);
                                console.log("selected Modifier Category", e.value);
                            }}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label>Modifier</label>
                        <MultiSelect
                            filter
                            showClear
                            disabled={loading}
                            placeholder="- Select Modifiers -"
                            value={selectedModifier} // Now an array
                            options={modifiier}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => {
                                setselectedModifier(e.value); // Store selected values array
                                console.log("Selected Modifiers:", e.value);
                            }}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label>Status</label>
                        <Dropdown
                            filter
                            showClear
                            placeholder="- Select Status -"
                            value={selectedStatus}
                            options={statusOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => {
                                setSelectedStatus(e.value);
                                filterStockByStatus(StockModifiers, e.value);
                            }}
                            disabled={loading}
                        />
                    </div>
                </div>
                <div className="field col-12">
                    <div className="flex justify-content-end mt-2">
                        <Button
                            label={isFiltering ? "Filtering..." : "Filter"}
                            icon="pi pi-filter"
                            onClick={handleFilter}
                            className="p-button-primary"
                            disabled={isFiltering || loading}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                {selectedRows.length > 0 && (
                    <div className="flex justify-end">
                        <Dropdown
                            // ref={dropdownRef}
                            // value={toggleStatus}
                            options={[
                                { label: "ON", value: "on" },
                                { label: "OFF", value: "off" },
                            ]}
                            onChange={(e) => handleToggleStatusChange(e.value)}
                            placeholder="Select Status"
                            showClear
                        />
                    </div>
                )}

                <DataTable
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50]}
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    value={StockModifiers}
                    paginator
                    rows={50}
                    // scrollHeight="400px"
                    className="datatable-responsive"
                    rowClassName={() => "custom-row-class"}
                    emptyMessage="No products found."
                    selection={selectedRows}
                    selectionMode={"checkbox"}
                    onSelectionChange={(e) => setSelectedRows(e.value)}
                >
                    <Column selectionMode="multiple" style={{ width: "3rem" }} />
                    <Column
                        field="modifiername"
                        header="Product Name"
                        style={{ minWidth: "200px" }}
                        body={modifierNameBodyTemplate}
                    />
                    <Column
                        field="modifiercategoryname"
                        header="Category"
                        style={{ minWidth: "250px" }}
                        body={modifierCategoryNameBodyTemplate}
                    />
                    <Column
                        header="Availability"
                        body={stockStatusBodyTemplate}
                        //     <InputSwitch
                        //     checked={rowData.instock === 1}
                        //     onChange={() => toggleAvailability(rowData)}
                        //     disabled={selectedRows.length > 0}
                        // />
                    />
                </DataTable>
                {/* <div className="field col-12">
                    <div className="flex justify-content-end">
                        <Button label="Push" className="w-auto self-end" />
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default StockControlItem;
