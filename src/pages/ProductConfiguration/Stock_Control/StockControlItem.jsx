import { Column } from "jspdf-autotable";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { InputSwitch } from "primereact/inputswitch";
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

    const [toggleStatus, setToggleStatus] = useState(null);

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

    const [stockItemList, setStockItemsList] = React.useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    // States for Location
    const [allLocations, setAllLocations] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // State for Franchise Type
    const [selectedFranchise, setSelectedFranchise] = useState(null);

    // State for ProductCategory
    const [productCategory, setProductCategory] = useState([]);
    const [selectedProductCategory, setSelectedProductCategory] = useState([]);

    // State for productCateogry
    const [product, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectAll, setSelectAll] = useState(false);

    // State for Status
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [originalStockItemList, setOriginalStockItemList] = useState([]);

    // State for Toggle Switch

    const categoryRegex = /^[a-zA-Z0-9\-&().',@$ ]*$/;
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (categoryRegex.test(value)) {
            setProductCategory(value);
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
        fetchProduct();
        fetchProductByCategory();
    }, [token]);

    const handleFranchiseChange = (value) => {
        setSelectedFranchise(value);

        if (value === null || value === undefined) {
            setLocations(allLocations); // Show all
        } else {
            const filtered = allLocations.filter((loc) => loc.franchisetype === value);
            setLocations(filtered);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/product/fetchProducts?start=0&length=-1`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.success === 1) {
                const ProductData = response.data.data.data.map((item) => ({
                    label: item.productname,
                    value: item.productid,
                }));
                setProducts(ProductData);
            }
        } catch (err) {
            console.log("Error fetching Product", err.message);
        }
    };

    const fetchProductByCategory = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/productCategory/getProductCategoryList?start=0&length=-1`,
                { companyId: 5 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data.success === 1) {
                const ProductCategoryData = response.data.data.data.map((item) => ({
                    label: item.productcategoryname,
                    value: item.productcategoryid,
                }));
                setProductCategory(ProductCategoryData); // Ensure it's an array
            }
        } catch (err) {
            console.log("Error fetching Product", err.message);
        }
    };

    const fetchStockControlItems = async (
        selectedLocation,
        selectedProduct,
        selectedProductCategory
        // selectedStatus
    ) => {
        setLoading(true);

        // 🔍 Log selected values
        console.log("📍 Selected Location:", selectedLocation);
        console.log("📦 Selected Product(s):", selectedProduct);
        console.log("🗂️ Selected Product Category:", selectedProductCategory);
        console.log("📊 Selected Status:", selectedStatus);

        try {
            const payload = {
                companyId: 5,
                locationId: selectedLocation || null,
                productCategoryIds: selectedProductCategory || [],
                productIds: selectedProduct || [],
            };

            const response = await axios.post(
                `${BASE_URL}/stockControl/getStockControlItem?start=0&length=-1`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success === 1 && response.data.data.data) {
                const rawItems = response.data.data.data;
                setOriginalStockItemList(rawItems); // Keep original for filtering
                filterStockByStatus(rawItems, selectedStatus);
            } else {
                setStockItemsList([]);
                console.error("Error Stock item list:", response.data);
            }
        } catch (error) {
            setStockItemsList([]);
            console.error("Error fetching stock control items:", error);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    };

    const filterStockByStatus = (items, status) => {
        if (status === null || status === undefined) {
            console.log("if yes");
            setStockItemsList(items);
        } else {
            console.log("else yes");
            const filtered = items.filter((item) => item.stockinout === status);
            setStockItemsList(filtered);
        }
    };

    useEffect(() => {
        filterStockByStatus(originalStockItemList, selectedStatus);
    }, [selectedStatus]);

    const toggleStockItemAvailability = async (rowData) => {
        const updatedStockInOut = rowData.stockinout === 1 ? 0 : 1;

        setStockItemsList((prevItems) =>
            prevItems.map((item) =>
                item.onlinemenuid === rowData.onlinemenuid
                    ? { ...item, stockinout: updatedStockInOut }
                    : item
            )
        );

        try {
            await axios.post(
                `${BASE_URL}/stockControl/updateStockControlItem`,
                {
                    onlineStockData: [
                        {
                            onlineMenuId: rowData.onlinemenuid,
                            stockInOut: updatedStockInOut,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Stock updated for item",
                life: 3000,
            });
            console.log("Stock updated for single item");
        } catch (err) {
            console.error("Error updating stock status:", err);
        }
    };

    const handleStockItemStatusChange = async (status) => {
        const updatedStockInOut = status === "on" ? 1 : 0;

        const updatedItems = stockItemList.map((item) =>
            selectedRows.some((row) => row.onlinemenuid === item.onlinemenuid)
                ? { ...item, stockinout: updatedStockInOut }
                : item
        );

        setStockItemsList(updatedItems);
        // setToggleStatus(status);

        const payload = {
            onlineStockData: selectedRows.map((row) => ({
                onlineMenuId: row.onlinemenuid,
                stockInOut: updatedStockInOut,
            })),
        };

        try {
            await axios.post(`${BASE_URL}/stockControl/updateStockControlItem`, payload, {
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

            console.log("Bulk stock status updated");
        } catch (err) {
            console.error("Error updating bulk stock status:", err);
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

    const handleFilter = async () => {
        const isValid = validateFilters();

        if (!isValid) {
            // Clear the list if location is missing
            setStockItemsList([]);
            return;
        }
    

        setIsFiltering(true); // Show "Filtering..."

        try {
            await fetchStockControlItems(
                selectedLocation,
                selectedProduct,
                selectedProductCategory
                // selectedStatus
            );
        } finally {
            setIsFiltering(false); // End "Filtering..." state
        }
    };

    const clearError = (field) => {
        setErrorMsg((prev) => ({ ...prev, [field]: "" }));
    };

    const validateFilters = () => {
        const errors = {};

        if (!selectedLocation) {
            errors.location = "Location is required.";
        }

        setErrorMsg(errors);
        return Object.keys(errors).length === 0;
    };

    // Skeleton here
    const productPortionBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="80%" height="2rem" />
        ) : (
            <span>{rowData.productPortionName ? rowData.productPortionName : "-"}</span>
        );
    };

    const productCateogryNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="2rem" />
        ) : (
            <span>{rowData.productcategoryname ? rowData.productcategoryname : "-"}</span>
        );
    };

    const subCategoryNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="2rem" />
        ) : (
            <span>{rowData.subcategoryname ? rowData.subcategoryname : "-"}</span>
        );
    };

    const stockStatusBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="3rem" height="2rem" borderRadius="15px" />
        ) : (
            <InputSwitch
                checked={rowData.stockinout === 1}
                onChange={() => toggleStockItemAvailability(rowData)}
                disabled={selectedRows.length > 0}
            />
        );
    };

    return (
        <div>
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-black">Stock Control On - Off (Item)</div>
            </div>

            <div className="card">
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
                        <label>Location <span style={{ color: 'red' }}>*</span></label>
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

                    <div className="field col-12 md:col-4 ">
                        <label>Product Category</label>
                        <MultiSelect
                            filter
                            showClear
                            placeholder="- Select Product Category -"
                            value={selectedProductCategory}
                            options={productCategory}
                            optionLabel="label"
                            optionValue="value"
                            display="chip"
                            onChange={(e) => {
                                setSelectedProductCategory(e.value);
                            }}
                            disabled={loading}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label>Product</label>
                        <MultiSelect
                            value={selectedProduct}
                            options={product}
                            onChange={(e) => {
                                setSelectedProduct(e.value);
                                setSelectAll(e.value.length === product.length);
                            }}
                            selectAll={selectAll}
                            onSelectAll={(e) => {
                                setSelectedProduct(
                                    e.checked ? [] : product.map((item) => item.value)
                                );
                                setSelectAll(!e.checked);
                            }}
                            virtualScrollerOptions={{ itemSize: 50 }}
                            placeholder="- Select Product -"
                            filter
                            showClear
                            disabled={loading}
                            display="chip"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label>Status</label>
                        <Dropdown
                            filter
                            showClear
                            disabled={loading}
                            placeholder="- Select Status -"
                            value={selectedStatus}
                            options={statusOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => {
                                setSelectedStatus(e.value); 
                                filterStockByStatus(stockItemList, e.value); 
                            }}
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
                            options={[
                                { label: "ON", value: "on" },
                                { label: "OFF", value: "off" },
                            ]}
                            onChange={(e) => handleStockItemStatusChange(e.value)}
                            placeholder="Select Status"
                            showClear
                        />
                    </div>
                )}

                <DataTable
                    value={stockItemList}
                    paginator
                    rows={50}
                    rowsPerPageOptions={[10, 25, 50]}
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    className="datatable-responsive"
                    emptyMessage="No products found."
                    selectionMode={"checkbox"}
                    selection={selectedRows}
                    onSelectionChange={(e) => setSelectedRows(e.value)}
                >
                    {/* Multi-Select Column */}
                    <Column selectionMode="multiple" style={{ width: "3rem" }} />

                    {/* Serial Number Column */}
                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minWidth: "6rem", textAlign: "left" }}
                        // bodyStyle={{ textAlign: "center" }}
                    />

                    {/* Other Columns */}
                    <Column
                        field="productPortionName"
                        header="Product Name"
                        style={{ minWidth: "40rem" }}
                        body={productPortionBodyTemplate}
                    />
                    <Column
                        field="productcategoryname"
                        header="Category"
                        style={{ minWidth: "13rem" }}
                        body={productCateogryNameBodyTemplate}
                    />
                    <Column
                        field="subcategoryname"
                        header="Subcategory"
                        style={{ minWidth: "13rem" }}
                        body={subCategoryNameBodyTemplate}
                    />
                    <Column header="Availability" body={stockStatusBodyTemplate} />
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
