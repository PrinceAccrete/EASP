import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import { TabView, TabPanel } from "primereact/tabview";
import { logout } from "../../../redux/slice/AuthSlice";
import { Skeleton } from "primereact/skeleton";
import { ProductService } from "../../../services/ProductService";
import axios from "axios";
import "./ProductList.scss";
import API from "../../../utils/axios";

const ProductList = () => {
    let emptyProduct = {
        id: null,
        name: "",
        image: null,
        description: "",
        category: null,
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: "INSTOCK",
    };
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const [first, setFirst] = useState(0); // Start index
    const [rows, setRows] = useState(50); // Page size
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records (from API)

    // States for Tabs Data
    const [menuPrices, setMenuPrices] = useState([]); // Data for Header I
    const [menuMappings, setMenuMappings] = useState([]); // Data for Header II
    const [onlineMappings, setOnlineMappings] = useState([]); // Data for Header III


    const [isLoading, setIsLoading] = useState(false);


    const [selectedProduct, setSelectedProduct] = useState([]);

    // States for Selection in Multi-Select Columns
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [selectedOnlineMappings, setSelectedOnlineMappings] = useState([]);
    const [originalMenuPrices, setOriginalMenuPrices] = useState([]);

    const dt = useRef(null);
    const toast = useRef(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        productname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        brandname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        productcode: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        productcategoryname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        // representative: { value: null, matchMode: FilterMatchMode.IN },
        // date: {
        //     operator: FilterOperator.AND,
        //     constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
        // },
        unitprice: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        isveg: {
            operator: FilterOperator.OR,
            constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
    });
    const [priceUpdateFilters, setPriceUpdateFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [menuAssDeassFilters, setMenuAssDeassFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [onlineAssDeassFilters, setOnlineAssDeassFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    const [representatives] = useState([
        { name: "Amy Elsner", image: "amyelsner.png" },
        { name: "Anna Fali", image: "annafali.png" },
        { name: "Asiya Javayant", image: "asiyajavayant.png" },
        { name: "Bernardo Dominic", image: "bernardodominic.png" },
        { name: "Elwin Sharvill", image: "elwinsharvill.png" },
        { name: "Ioni Bowcher", image: "ionibowcher.png" },
        { name: "Ivan Magalhaes", image: "ivanmagalhaes.png" },
        { name: "Onyama Limba", image: "onyamalimba.png" },
        { name: "Stephen Shaw", image: "stephenshaw.png" },
        { name: "XuXue Feng", image: "xuxuefeng.png" },
    ]);
    const [statuses] = useState(["Veg", "Non-Veg"]);

    const cols = [
        { field: "productname", header: "Product Name" },
        { field: "brandname", header: "Brand Name" },
        { field: "productcode", header: "Product Code" },
        { field: "productcategoryname", header: "Category Name" },
        { field: "unitprice", header: "Unit Price" },
        { field: "backcolor", header: "Product Color" },
        { field: "isveg", header: "Is Veg" },
        { field: "ignoretax", header: "Ignore Tax" },
        { field: "ignorediscount", header: "Ignore Discount" },
    ];

    const editProductCol1 = [
        { field: "menuname", header: "Menu Name" },
        { field: "portionname", header: "Portion Name" },
        { field: "price", header: "POS Price" },
        { field: "onlineprice", header: "Online Price" },
    ];

    const editProductCol2 = [
        { field: "code", header: "Code" },
        { field: "name", header: "Name" },
        { field: "quantity", header: "Quantity" },
        { field: "price", header: "Price" },
    ];

    const editProductCol3 = [
        { field: "code", header: "Code" },
        { field: "name", header: "Name" },
        { field: "quantity", header: "Quantity" },
        { field: "price", header: "Price" },
    ];

    const columnOptions = [
        { field: "productname", header: "Product Name" },
        { field: "brandname", header: "Brand" },
        { field: "productcode", header: "Product Code" },
        { field: "productcategoryname", header: "Category Name" },
        { field: "unitprice", header: "Unit Price" },
        { field: "backcolor", header: "Product Color" },
        { field: "isveg", header: "Veg/Non-Veg" },
        { field: "ignoretax", header: "Ignore Tax" },
        { field: "ignorediscount", header: "Ignore Discount" },
        { field: "createdby", header: "Created By" },
        { field: "createddate", header: "Created Date" },
        { field: "modifiedby", header: "Modified By" },
        { field: "modifieddate", header: "Modified Date" },
    ];

    const [visibleFields, setVisibleFields] = useState(
        columnOptions.filter(
            (col) => !["createdby", "createddate", "modifiedby", "modifieddate"].includes(col.field)
        )
    );

    const exportColumns = visibleFields.map((col) => ({ title: col.header, dataKey: col.field }));

    const getSeverity = (status) => {
        switch (status) {
            case "Veg":
                return "success";
            case "Non-Veg":
                return "danger";

            // case "new":
            //     return "info";

            // case "negotiation":
            //     return "warning";

            // case "renewal":
            //     return null;
        }
    };

    // useEffect(() => {
    //     ProductService.getProductsSmall().then((data) => setProducts(getProducts(data)));
    // }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchProducts = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${BASE_URL}/product/fetchProducts`,
                { companyId: 5 }, // Body (only companyId)
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    params: {
                        start: start,
                        length: length,
                        ...(search ? { search } : {}),
                        ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                    },
                }
            );

            if (response.data.success) {
                setProducts(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
            }
        } catch (error) {
            console.error("Error fetching products:", error);

            const message = error?.response?.data?.msg || "";

            if (message.toLowerCase().includes("expired token")) {
                dispatch(logout());
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if (token) {
    //         fetchProducts(first, rows); // Load first chunk
    //     }
    // }, [token]);

    useEffect(() => {
        const sessionState = sessionStorage.getItem("productListState");
        if (sessionState) {
            const parsed = JSON.parse(sessionState);

            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            setSortField(field);
            setSortOrder(order);
            setRows(50);
        }
    }, []);

    useEffect(() => {
        if (!token) return;

        const delayDebounce = setTimeout(() => {
            const sessionState = sessionStorage.getItem("productListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchProducts(
                first,
                rows,
                globalFilterValue || search,
                sortField || field,
                sortOrder || order
            );
        }, 500); // debounce delay in ms

        return () => clearTimeout(delayDebounce);
    }, [first, rows, filters, globalFilterValue, sortField, sortOrder, token]);

    const scrollToTop = () => {
        console.log("scrolling")
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const onPageChange = (event) => {
        console.log("page changinf")
        setFirst(event.first);
        setRows(event.rows);
        setLoading(true);
        scrollToTop();

        // Fetch new chunk based on page and size
        // fetchProducts(event.first, event.rows, globalFilterValue, sortField, sortOrder);
    };

    const getProducts = (data) => {
        return [...(data || [])].map((d) => {
            d.date = new Date(d.date);

            return d;
        });
    };

    const formatDate = (value) => {
        return value.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) {
            return "₹ 0.00"; // Default or fallback value
        }
        return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
    };

    const fileExportMessage = () => {
        toast.current.show({
            severity: "success",
            detail: "File Exported Successfully",
            life: 3000,
        });
    };

    const exportCSV = () => {
        if (dt.current) {
            dt.current.exportCSV({
                selectionOnly: false,
                columns: visibleFields.map((col) => ({
                    field: col.field,
                    header: col.header,
                })),
            });

            fileExportMessage();
        }
    };

    const exportPdf = () => {
        import("jspdf").then((jsPDF) => {
            import("jspdf-autotable").then(() => {
                const doc = new jsPDF.default({
                    orientation: "portrait",
                    unit: "pt",
                    format: "A4", // standard page size
                });

                const tableColumnStyles = exportColumns.reduce((acc, col) => {
                    acc[col.dataKey] = { cellWidth: "wrap" };
                    return acc;
                }, {});

                doc.autoTable({
                    head: [exportColumns.map((col) => col.title)],
                    body: products.map((row) => exportColumns.map((col) => row[col.dataKey] ?? "")),
                    startY: 20,
                    styles: {
                        fontSize: 8,
                        cellPadding: 4,
                    },
                    headStyles: {
                        fillColor: [42, 61, 146],
                        textColor: 255,
                    },

                    margin: { top: 30, bottom: 20, left: 10, right: 10 },
                    theme: "grid",
                });

                doc.save("products.pdf");
                fileExportMessage();
            });
        });
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = products.map((row) => {
                const filteredRow = {};
                visibleFields.forEach((col) => {
                    filteredRow[col.header] = row[col.field];
                });
                return filteredRow;
            });

            console.log("filtereData", filteredData)

            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            saveAsExcelFile(excelBuffer, "products");
            fileExportMessage();
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import("file-saver").then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE =
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
                let EXCEL_EXTENSION = ".xlsx";
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE,
                });

                module.default.saveAs(
                    data,
                    fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
                );
            }
        });
    };

    const isPositiveInteger = (val) => {
        let str = String(val);

        str = str.trim();

        if (!str) {
            return false;
        }

        str = str.replace(/^0+/, "") || "0";
        let n = Math.floor(Number(str));

        return n !== Infinity && String(n) === str && n >= 0;
    };

    const onCellEditComplete = (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;

        switch (field) {
            case "price":
            case "onlineprice":
            case "markupprice":
                if (isPositiveInteger(newValue)) rowData[field] = newValue;
                else event.preventDefault();
                break;

            default:
                if (newValue.trim().length > 0) rowData[field] = newValue;
                else event.preventDefault();
                break;
        }
    };

    const cellEditor = (options) => {
        if (
            options.field === "price" ||
            options.field === "onlineprice" ||
            options.field === "markupprice"
        ) {
            return priceEditor(options);
        }
        return textEditor(options);
    };

    const textEditor = (options) => {
        return (
            <InputText
                type="text"
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
            />
        );
    };

    const priceEditor = (options) => {
        return (
            <InputNumber
                value={options.value}
                onValueChange={(e) => options.editorCallback(e.value)}
                mode="decimal"
                useGrouping={false}
                minFractionDigits={0} // Allows integers
                maxFractionDigits={5}
                onKeyDown={(e) => e.stopPropagation()}
            />
        );
    };

    const priceBodyTemplate = (rowData, column) => {
        const field = column.field; // Dynamically get the field name (price or onlineprice)
        const value = rowData[field]; // Access the corresponding value

        if (value === null || value === undefined) {
            return 0; // Default value as an integer
        }

        return Number(value); // Ensure it's always a number, not a string
    };

    // Function to fetch Menu Prices (Header I)
    const fetchMenuPrices = async (productId) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/product/getMenuPrice/${productId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (response.data.success) {
                setMenuPrices(response.data.data);
                setOriginalMenuPrices(JSON.parse(JSON.stringify(response.data.data))); // Deep clone
            }
        } catch (error) {
            toast.current.show({
                severity: "error",
                detail: `Error fetching menu prices: ${error}`,
                life: 3000,
            });
        }
    };

    // Function to fetch Product Menu Mapping (Header II)
    const fetchMenuMappings = async (productId) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/product/getProductMenuMapping/${productId}`,
                { companyId: 5 }, // Body (only companyId)
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (response.data.success) {
                setMenuMappings(response.data.data);

                // Pre-select items where `is_associated === 1`
                const preSelectedMenus = response.data.data.filter(
                    (item) => item.is_associated === 1
                );
                setSelectedMenus(preSelectedMenus);
            }
        } catch (error) {
            toast.current.show({
                severity: "error",
                detail: `Error fetching menu mappings: ${error}`,
                life: 3000,
            });
        }
    };

    // Function to fetch Product Online Mapping (Header III)
    const fetchOnlineMappings = async (productId) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/product/getProductOnlineMapping/${productId}`,
                { companyId: 5, locations: [5, 14, 15] }, // Body (only companyId)
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (response.data.success) {
                setOnlineMappings(response.data.data);

                // Pre-select items where `is_associated === 1`
                const preSelectedOnline = response.data.data.filter(
                    (item) => item.is_associated === 1
                );
                setSelectedOnlineMappings(preSelectedOnline);
            }
        } catch (error) {
            toast.current.show({
                severity: "error",
                detail: `Error fetching online mappings: ${error}`,
                life: 3000,
            });
        }
    };

    const editProduct = (product) => {
        // setProduct({ ...product });
        setProductDialog(true);
        setProduct(product);

        //Always open first tab (Price Update)
        setActiveTabIndex(0);

        //clear filters for all tabs
        setPriceUpdateFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setMenuAssDeassFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setOnlineAssDeassFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });

        // Fetch tab data based on productId
        fetchMenuPrices(product.productid);
        fetchMenuMappings(product.productid);
        fetchOnlineMappings(product.productid);
    };

    const hideDialog = () => {
        // setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };


    const deleteProduct = async (products) => {


        if (products.length > 0) {

            setIsLoading(true)

            let productIds = []

            for (let i = 0; i < products.length; i++) {
                productIds.push(products[i].productid)
            }

            try {

                const response = await API.post("product/deleteProducts", { productId: productIds , companyId: 5 }, {
                    headers: { Authorization: `Bearer ${token}` },
                });



                if (response.data.success) {
                    toast.current.show({ severity: 'success', detail: response.data.msg, life: 3000 });
                    fetchProducts(first, rows, globalFilterValue, sortField, sortOrder === 1 ? "asc" : "desc")
                    setSelectedProduct([])
                    setDeleteProductDialog(false)
                    setProduct(emptyProduct)
                }

            } catch (error) {
                console.log(error)
                toast.current.show({ severity: 'error',detail: error?.response?.data.msg, life: 3000 });
            }finally{
                setIsLoading(false)
            }
        }

  
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters["global"].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
        setFirst(0);
        setLoading(true);
    };

    const onPriceUpdateGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _priceUpdateFilters = { ...priceUpdateFilters };

        _priceUpdateFilters["global"].value = value;
        setPriceUpdateFilters(_priceUpdateFilters);
    };

    const onMenuAssDeassGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _menuAssDeassFilters = { ...menuAssDeassFilters };

        _menuAssDeassFilters["global"].value = value;
        setPriceUpdateFilters(_menuAssDeassFilters);
    };

    const onOnlineAssDeassGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _onlineAssDeassFilters = { ...onlineAssDeassFilters };

        _onlineAssDeassFilters["global"].value = value;
        setPriceUpdateFilters(_onlineAssDeassFilters);
    };

    const onSortChange = (e) => {
        const { sortField, sortOrder } = e;

        setFirst(0);
        setLoading(true);

        if (!sortField || sortOrder == null) {
            setSortField("");
            setSortOrder("");
        } else {
            setSortField(sortField);
            setSortOrder(sortOrder === 1 ? "asc" : "desc");
        }

        // fetchProducts(first, rows, globalFilterValue, sortField, sortOrder === 1 ? "asc" : "desc");
    };

    const renderHeader = () => {
        const value = filters["global"] ? filters["global"].value : "";

        return (
            <div className="flex flex-column sm:flex-row gap-3 sm:gap-2 justify-content-between align-items-start sm:align-items-center flex-wrap">
                {/* <h6 className="m-0">Products</h6> */}
                <IconField iconPosition="left" className="w-full sm:w-auto">
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        value={value || ""}
                        onChange={onGlobalFilterChange}
                        placeholder="Keyword Search"
                        className="w-full sm:w-15rem"
                    />
                </IconField>
                <div className="flex flex-column sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto items-stretch sm:items-center">
                    {/* <MultiSelect
                        value={visibleFields}
                        options={columnOptions}
                        optionLabel="header"
                        onChange={(e) => setVisibleFields(e.value)}
                        display="chip"
                        placeholder="Toggle Columns"
                        style={{ width: "250px" }}
                    /> */}

                    <MultiSelect
                        value={visibleFields}
                        options={columnOptions}
                        optionLabel="header"
                        onChange={onColumnToggle}
                        className="w-full sm:w-17rem"
                        display="chip"
                        placeholder="Visible Columns"
                        disabled={loading}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            className="export-icon-tooltip"
                            type="button"
                            icon="pi pi-file"
                            rounded
                            onClick={exportCSV}
                            data-pr-tooltip="Export as CSV"
                            disabled={loading}
                            // tooltip="Export as CSV"
                            // tooltipOptions={{ position: 'top' }}
                        />
                        <Button
                            className="export-icon-tooltip"
                            type="button"
                            icon="pi pi-file-excel"
                            severity="success"
                            rounded
                            onClick={exportExcel}
                            data-pr-tooltip="Export as XLS"
                            disabled={loading}
                            // tooltip="Export as XLS"
                            // tooltipOptions={{ position: 'top' }}
                        />
                        <Button
                            className="export-icon-tooltip"
                            type="button"
                            icon="pi pi-file-pdf"
                            severity="warning"
                            rounded
                            onClick={exportPdf}
                            data-pr-tooltip="Export as PDF"
                            disabled={loading}
                            // tooltip="Export as PDF"
                            // tooltipOptions={{ position: 'top'}}
                        />
                    </div>
                    <Tooltip
                        target=".export-icon-tooltip"
                        position="top"
                        style={{ fontSize: "12px" }}
                        showDelay={100}
                        hideDelay={100}
                    />

                    <Button
                        className={`${selectedProduct.length > 0 ? 'bg-red-500' : 'bg-red-200'} text-white font-medium border-none outline-none rounded-full`}
                        icon="pi pi-trash"
                        label={`Delete (${selectedProduct.length})`}
                        onClick={() => setDeleteProductDialog(true)}
                        disabled={selectedProduct.length === 0}
                    />
                </div>
            </div>
        );
    };

    const productCategoryBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <div className="flex align-items-center gap-2">
                <span>{rowData.productcategoryname}</span>
            </div>
        );
    };

    const productColorBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center justify-content-center">
                {loading ? (
                    <Skeleton shape="circle" size="2rem" />
                ) : (
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: rowData?.backcolor || "gray",
                            borderRadius: "50%",
                            display: "inline-block",
                            border: "1px solid #ddd",
                        }}
                    />
                )}
            </div>
        );
    };

    const representativeFilterTemplate = (options) => {
        return (
            <React.Fragment>
                <div className="mb-3 font-bold">Agent Picker</div>
                <MultiSelect
                    value={options.value}
                    options={representatives}
                    itemTemplate={representativesItemTemplate}
                    onChange={(e) => options.filterCallback(e.value)}
                    optionLabel="name"
                    placeholder="Any"
                    className="p-column-filter"
                />
            </React.Fragment>
        );
    };

    const representativesItemTemplate = (option) => {
        return (
            <div className="flex align-items-center gap-2">
                <img
                    alt={option.name}
                    src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`}
                    width="32"
                />
                <span>{option.name}</span>
            </div>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return formatDate(rowData.date);
    };

    const dateFilterTemplate = (options) => {
        return (
            <Calendar
                value={options.value}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                dateFormat="mm/dd/yy"
                placeholder="mm/dd/yyyy"
                mask="99/99/9999"
            />
        );
    };

    const unitPriceBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="60%" height="1.5rem" />
        ) : (
            formatCurrency(Number(rowData.unitprice))
        );
    };

    const unitPriceFilterTemplate = (options) => {
        return (
            <InputNumber
                value={options.value ?? null}
                onChange={(e) => options.filterCallback(e.value ?? null, options.index)}
                mode="decimal"
                useGrouping={false}
                minFractionDigits={0}
                maxFractionDigits={5}
            />
        );
    };

    const foodTypeBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center justify-content-center">
                {loading ? (
                    <Skeleton width="2rem" height="1.5rem" />
                ) : (
                    <Tag
                        value={rowData?.isveg ? "Veg" : "Non-Veg"}
                        severity={getSeverity(rowData?.isveg ? "Veg" : "Non-Veg")}
                    />
                )}
            </div>
        );
    };

    const foodTypeFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                itemTemplate={statusItemTemplate}
                placeholder="Select One"
                className="p-column-filter"
                showClear
            />
        );
    };

    const booleanBodyTemplate = (rowData, column) => {
        const field = column.field;
        const value = rowData[field];

        return (
            <div
                className="flex justify-content-center align-items-center"
                style={{ height: "100%" }}
            >
                {loading ? (
                    <Skeleton width="2rem" height="1.5rem" />
                ) : (
                    <span>{value === 1 ? "Yes" : "No"}</span>
                )}
            </div>
        );
    };

    const statusItemTemplate = (option) => {
        return <Tag value={option} severity={getSeverity(option)} />;
    };

    const actionBodyTemplate = (rowData) => {



        return (
            <>
                {loading ? (
                    <>
                        <div className="flex">
                            <Skeleton shape="circle" size="3rem" className="mr-2" />
                            <Skeleton shape="circle" size="3rem" />
                        </div>
                    </>
                ) : (
                    <>
                        <Button
                            icon="pi pi-pencil"
                            rounded
                            outlined
                            className="mr-2"
                            onClick={() => navigate(`/product-master/${rowData.productid}`)}
                        />
                        <Button
                            icon="pi pi-trash"
                            rounded
                            outlined
                            severity="danger"
                            disabled={selectedProduct.length > 0}
                            onClick={() => confirmDeleteProduct(rowData)}
                        />
                    </>
                )}
            </>
        );
    };

    const productNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="80%" height="1.5rem" />
        ) : (
            <span style={{ color: "blue", cursor: "pointer" }} onClick={() => editProduct(rowData)}>
                {rowData.productname}
            </span>
        );
    };

    const brandNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.brandname ? rowData.brandname : "Not Specified"}</span>
        );
    };

    const productCodeBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.productcode ? rowData.productcode : "-"}</span>
        );
    };

    const createdByBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? <Skeleton width="70%" height="1.5rem" /> : rowData?.createdby || "-"}
            </span>
        );
    };

    const createdDateBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? <Skeleton width="70%" height="1.5rem" /> : rowData?.createddate || "-"}
            </span>
        );
    };

    const modifiedByBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? <Skeleton width="70%" height="1.5rem" /> : rowData?.modifiedby || "-"}
            </span>
        );
    };

    const modifiedDateBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? <Skeleton width="70%" height="1.5rem" /> : rowData?.modifieddate || "-"}
            </span>
        );
    };

    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button
                label={isSaving ? "Saving..." : "Save"}
                icon="pi pi-check"
                onClick={() => handleSave()}
                disabled={isSaving}
                loading={isSaving}
            />
        </React.Fragment>
    );

    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" disabled={isLoading} outlined onClick={hideDeleteProductDialog} >
                
            </Button>
            <Button severity="danger" disabled={isLoading} onClick={()=>{
                  deleteProduct(selectedProduct.length > 0 ? selectedProduct : [product])
            }} >

                {
                !isLoading &&  <i className='pi pi-check mr-2'></i>
            }
{isLoading ? (
                <>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                    <span className="ml-2">Deleting...</span>
                </>
            ) : (
                "Yes"
            )}
            </Button>
        </React.Fragment>
    );

    const handleSave = async () => {
        document.activeElement?.blur();
        setIsSaving(true);

        try {
            if (activeTabIndex === 0) {
                // Price Update Tab - send only modified items
                const updatedItems = menuPrices.filter((item, index) => {
                    const original = originalMenuPrices[index];
                    return (
                        Number(item.price) !== Number(original.price) ||
                        Number(item.onlineprice) !== Number(original.onlineprice) ||
                        Number(item.markupprice) !== Number(original.markupprice)
                    );
                });

                if (updatedItems.length === 0) {
                    return;
                }

                const payload = {
                    companyId: 5,
                    products: updatedItems.map((item) => ({
                        menuId: item.menuid,
                        productPortionId: item.productportionid,
                        price: Number(item.price),
                        onlinePrice: Number(item.onlineprice),
                        markupPrice: Number(item.markupprice),
                    })),
                };

                try {
                    const response = await axios.post(
                        `${BASE_URL}/product/updateMenuPrice`,
                        payload,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                        }
                    );

                    if (response.data.status === 200) {
                        toast.current.show({
                            severity: "success",
                            detail: "Price update completed successfully",
                            life: 3000,
                        });
                    } else {
                        toast.current.show({
                            severity: "error",
                            detail: "Price not updated",
                            life: 3000,
                        });
                    }
                } catch (error) {
                    const err = error?.response?.data?.msg || `Price not updated: ${error}`;

                    toast.current.show({
                        severity: "error",
                        detail: err,
                        life: 3000,
                    });
                }
            } else if (activeTabIndex === 1) {
                try {
                    // Menu Assoc / Deasso Tab
                    const payload = {
                        companyId: 5,
                        menuArray: selectedMenus.map((menu) => ({
                            menuId: menu.menuid,
                        })),
                    };

                    const response = await axios.post(
                        `${BASE_URL}/product/updateProductMenuMapping/${product.productid}`,
                        payload,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                        }
                    );

                    if (response.data.status === 200) {
                        toast.current.show({
                            severity: "success",
                            detail: "Menu mapping updated successfully",
                            life: 3000,
                        });
                    } else {
                        toast.current.show({
                            severity: "error",
                            detail: "Menu mapping not updated",
                            life: 3000,
                        });
                    }
                } catch (error) {
                    const err = error?.response?.data?.msg || `Menu mapping not updated: ${error}`;

                    toast.current.show({
                        severity: "error",
                        detail: err,
                        life: 3000,
                    });
                }
            } else if (activeTabIndex === 2) {
                try {
                    // Online Assoc / Deasso Tab
                    const payload = {
                        companyId: 5,
                        locationArray: selectedOnlineMappings.map((item) => ({
                            locationId: item.locationid,
                            channelId: item.channelid,
                        })),
                    };

                    const response = await axios.post(
                        `${BASE_URL}/product/updateProductOnlineMapping/${product.productid}`,
                        payload,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                        }
                    );

                    if (response.data.status === 200) {
                        toast.current.show({
                            severity: "success",
                            detail: "Online mapping updated successfully",
                            life: 3000,
                        });
                    } else {
                        toast.current.show({
                            severity: "error",
                            detail: "Online mapping not updated",
                            life: 3000,
                        });
                    }
                } catch (error) {
                    const err =
                        error?.response?.data?.msg || `Online mapping not updated: ${error}`;

                    toast.current.show({
                        severity: "error",
                        detail: err,
                        life: 3000,
                    });
                }
            }

            hideDialog();
        } catch (error) {
            toast.current.show({
                severity: "error",
                detail: `Save failed: ${error}`,
                life: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
    };

    const customRowsPerPageDropdown = (options) => {
        const dropdownOptions = [
            { label: 10, value: 10 },
            { label: 25, value: 25 },
            { label: 50, value: 50 },
            { label: "All", value: options.totalRecords },
        ];

        return (
            <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />
        );
    };

    const priceSearchHeader = () => {
        const value = priceUpdateFilters["global"] ? priceUpdateFilters["global"].value : "";

        return (
            <IconField iconPosition="left" className="w-full sm:w-auto">
                <InputIcon className="pi pi-search" />
                <InputText
                    type="search"
                    value={value || ""}
                    onChange={onPriceUpdateGlobalFilterChange}
                    placeholder="Keyword Search"
                    className="w-full sm:w-15rem"
                />
            </IconField>
        );
    };

    const menuAssDeassSearchHeader = () => {
        const value = menuAssDeassFilters["global"] ? menuAssDeassFilters["global"].value : "";

        return (
            <IconField iconPosition="left" className="w-full sm:w-auto">
                <InputIcon className="pi pi-search" />
                <InputText
                    type="search"
                    value={value || ""}
                    onChange={onMenuAssDeassGlobalFilterChange}
                    placeholder="Keyword Search"
                    className="w-full sm:w-15rem"
                />
            </IconField>
        );
    };

    const onlineAssDeassSearchHeader = () => {
        const value = onlineAssDeassFilters["global"] ? onlineAssDeassFilters["global"].value : "";

        return (
            <IconField iconPosition="left" className="w-full sm:w-auto">
                <InputIcon className="pi pi-search" />
                <InputText
                    type="search"
                    value={value || ""}
                    onChange={onOnlineAssDeassGlobalFilterChange}
                    placeholder="Keyword Search"
                    className="w-full sm:w-15rem"
                />
            </IconField>
        );
    };

    const blankRow = {
        productname: "",
        brandname: "",
        productcode: "",
        productcategoryname: "",
        unitprice: 0,
        backcolor: "",
        isveg: 1,
        ignoretax: 0,
        ignorediscount: 0,
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const header = renderHeader();

    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-lg font-semibold">Product List</div>
                <div className="p-1 border-round cursor-pointer">
                    <i onClick={() => navigate("/product-master")} className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
                {/* <div className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"> */}
            </div>
            <div className="card">
                <DataTable
                    ref={dt}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : products}
                    paginator
                    header={header}
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    rowClassName={() => "custom-row-class"}
                    selection={selectedProduct}
                    onSelectionChange={(e) => setSelectedProduct(e.value)}
                    paginatorTemplate={{
                        layout: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown",
                        RowsPerPageDropdown: (options) =>
                            customRowsPerPageDropdown({ ...options, totalRecords }),
                    }}
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    dataKey="productid"
                    filters={filters}
                    filterDisplay="menu"
                    globalFilterFields={[
                        "productname",
                        "productcode",
                        "productcategoryname",
                        "brandname",
                        "unitprice",
                        "backcolor",
                    ]}
                    emptyMessage="No products found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    removableSort
                    stateStorage="session"
                    stateKey="productListState"
                    onFilter={(e) => {
                        setFilters(e.filters);

                        // Optionally also update globalFilterValue separately
                        // const globalVal = e.filters?.global?.value || "";
                        // setGlobalFilterValue(globalVal);
                    }}
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minWidth: "5rem", textAlign: "center" }}
                    />
                    {visibleFields.some((col) => col.field === "productname") && (
                        <Column
                            field="productname"
                            header="Product Name"
                            sortable
                            sortableDisabled={loading}
                            // filter
                            // filterPlaceholder="Search by name"
                            style={{ minWidth: "13rem" }}
                            body={productNameBodyTemplate}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "brandname") && (
                        <Column
                            field="brandname"
                            header="Brand"
                            sortable
                            sortableDisabled={loading}
                            // filter
                            // filterPlaceholder="Search by brand"
                            style={{ minWidth: "12rem" }}
                            body={brandNameBodyTemplate}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "productcode") && (
                        <Column
                            field="productcode"
                            header="Product Code"
                            sortable
                            sortableDisabled={loading}
                            // filter
                            // filterPlaceholder="Search by code"
                            style={{ minWidth: "13rem" }}
                            body={productCodeBodyTemplate}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "productcategoryname") && (
                        <Column
                            field="productcategoryname"
                            header="Product Category"
                            sortable
                            sortableDisabled={loading}
                            // filterField="productcategoryname"
                            style={{ minWidth: "15rem" }}
                            body={productCategoryBodyTemplate}
                            // filter
                            // filterPlaceholder="Search by product category"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "unitprice") && (
                        <Column
                            field="unitprice"
                            header="Unit Price"
                            sortable
                            sortableDisabled={loading}
                            dataType="numeric"
                            style={{ minWidth: "11rem" }}
                            body={unitPriceBodyTemplate}
                            // filter
                            // filterElement={unitPriceFilterTemplate}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "backcolor") && (
                        <Column
                            field="backcolor"
                            header="Product Color"
                            // sortable
                            // sortField="representative.name"
                            // filterField="representative"
                            // showFilterMatchModes={false}
                            // filterMenuStyle={{ width: "14rem" }}
                            style={{ minWidth: "9rem" }}
                            body={productColorBodyTemplate}
                            // filter
                            // filterElement={representativeFilterTemplate}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "isveg") && (
                        <Column
                            field="isveg"
                            header="Veg/Non-Veg"
                            sortable
                            sortableDisabled={loading}
                            // filterMenuStyle={{ width: "14rem" }}
                            style={{ minWidth: "13rem" }}
                            body={foodTypeBodyTemplate}
                            // filter
                            // filterElement={foodTypeFilterTemplate}
                        />
                    )}
                    {/* <Column
                        field="date"
                        header="Date"
                        sortable
                        filterField="date"
                        dataType="date"
                        style={{ minWidth: "12rem" }}
                        body={dateBodyTemplate}
                        filter
                        filterElement={dateFilterTemplate}
                    /> */}
                    {/* <Column
                        field="status"
                        header="Status"
                        sortable
                        filterMenuStyle={{ width: "14rem" }}
                        style={{ minWidth: "10rem" }}
                        body={statusBodyTemplate}
                        filter
                        filterElement={statusFilterTemplate}
                    /> */}
                    {visibleFields.some((col) => col.field === "ignoretax") && (
                        <Column
                            field="ignoretax"
                            header="Ignore Tax"
                            // sortable
                            // filter
                            // filterPlaceholder="Search by name"
                            body={(rowData) => booleanBodyTemplate(rowData, { field: "ignoretax" })}
                            style={{ minWidth: "8rem", textAlign: "center" }}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "ignorediscount") && (
                        <Column
                            field="ignorediscount"
                            header="Ignore Discount"
                            // sortable
                            // filter
                            // filterPlaceholder="Search by name"
                            body={(rowData) =>
                                booleanBodyTemplate(rowData, { field: "ignorediscount" })
                            }
                            style={{ minWidth: "10rem", textAlign: "center" }}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="Created By"
                            sortable
                            sortableDisabled={loading}
                            // filterField="createdby"
                            style={{ minWidth: "12rem" }}
                            body={createdByBodyTemplate}
                            // filter
                            // filterPlaceholder="Search by Created By"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="Created Date"
                            sortable
                            sortableDisabled={loading}
                            // filterField="createddate"
                            style={{ minWidth: "15rem" }}
                            body={createdDateBodyTemplate}
                            // filter
                            // filterPlaceholder="Search by Created Date"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="Modified By"
                            sortable
                            sortableDisabled={loading}
                            // filterField="modifiedby"
                            style={{ minWidth: "12rem" }}
                            body={modifiedByBodyTemplate}
                            // filter
                            // filterPlaceholder="Search by Modified By"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "modifieddate") && (
                        <Column
                            field="modifieddate"
                            header="Modified Date"
                            sortable
                            sortableDisabled={loading}
                            // filterField="modifieddate"
                            style={{ minWidth: "15rem" }}
                            body={modifiedDateBodyTemplate}
                            // filter
                            // filterPlaceholder="Search by Modified Date"
                        />
                    )}
                    <Column
                        header="Action"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{ minWidth: "10rem" }}
                    />
                </DataTable>
                <Dialog
                    visible={productDialog}
                    // style={{ minWidth: "50rem", maxWidth: "50rem" }}
                    // breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    style={{ width: "50rem" }} // Default width for large screens
                    breakpoints={{
                        "960px": "75vw", // 75% of the viewport width for screens <= 960px
                        "641px": "90vw", // 90% of the viewport width for screens <= 641px
                        "480px": "95vw", // 95% of the viewport width for screens <= 480px
                    }}
                    contentStyle={{ height: "600px" }}
                    header={`Product Details - ${product.productname}`}
                    modal
                    className="p-fluid product-dialogue"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    draggable={false}
                >
                    <div className="custom-tabview">
                        <TabView
                            activeIndex={activeTabIndex}
                            onTabChange={(e) => setActiveTabIndex(e.index)}
                        >
                            <TabPanel header="Price Update">
                                <AnimatePresence>
                                    <motion.div
                                        key="price-update"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        <div className="p-fluid">
                                            <DataTable
                                                header={priceSearchHeader}
                                                value={menuPrices}
                                                editMode="cell"
                                                paginator
                                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                                rows={50}
                                                rowsPerPageOptions={[10, 25, 50]}
                                                filters={priceUpdateFilters}
                                                globalFilterFields={[
                                                    "menuname",
                                                    "portionname",
                                                    "price",
                                                    "onlineprice",
                                                    "markupprice",
                                                ]}
                                                onFilter={(e) => {
                                                    setPriceUpdateFilters(e.filters);
                                                }}
                                                scrollable
                                                scrollHeight="400px"
                                                // tableStyle={{ maxWidth: "50rem" }}
                                            >
                                                <Column
                                                    header="No."
                                                    body={(rowData, options) =>
                                                        options.rowIndex + 1
                                                    }
                                                    style={{
                                                        minWidth: "5rem",
                                                        textAlign: "center",
                                                    }}
                                                />
                                                {/* {editProductCol1.map(({ field, header }) => {
                                            return (
                                                <Column
                                                    key={field}
                                                    field={field}
                                                    header={header}
                                                    style={{ width: "5rem" }}
                                                    body={field === "price" && priceBodyTemplate}
                                                    editor={(options) => cellEditor(options)}
                                                    onCellEditComplete={onCellEditComplete}
                                                />
                                            );
                                        })} */}
                                                <Column
                                                    key="menuname"
                                                    field="menuname"
                                                    header="Menu Name"
                                                    style={{ width: "25%" }}
                                                />
                                                <Column
                                                    key="portionname"
                                                    field="portionname"
                                                    header="Portion Name"
                                                    style={{ minWidth: "9rem", maxWidth: "12rem" }}
                                                />
                                                <Column
                                                    key="price"
                                                    field="price"
                                                    header="POS Price"
                                                    style={{ minWidth: "7rem", cursor: "pointer" }}
                                                    body={(rowData) =>
                                                        priceBodyTemplate(rowData, {
                                                            field: "price",
                                                        })
                                                    }
                                                    editor={(options) => cellEditor(options)}
                                                    onCellEditComplete={onCellEditComplete}
                                                />
                                                <Column
                                                    key="onlineprice"
                                                    field="onlineprice"
                                                    header="Online Price"
                                                    style={{ minWidth: "8rem", cursor: "pointer" }}
                                                    body={(rowData) =>
                                                        priceBodyTemplate(rowData, {
                                                            field: "onlineprice",
                                                        })
                                                    }
                                                    editor={(options) => cellEditor(options)}
                                                    onCellEditComplete={onCellEditComplete}
                                                />
                                                <Column
                                                    key="markupprice"
                                                    field="markupprice"
                                                    header="Markup Price"
                                                    style={{ minWidth: "9rem", cursor: "pointer" }}
                                                    body={(rowData) =>
                                                        priceBodyTemplate(rowData, {
                                                            field: "markupprice",
                                                        })
                                                    }
                                                    editor={(options) => cellEditor(options)}
                                                    onCellEditComplete={onCellEditComplete}
                                                />
                                            </DataTable>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </TabPanel>
                            <TabPanel header="Menu Assoc / Deasso">
                                <AnimatePresence>
                                    <motion.div
                                        key="price-update"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        <div className="p-fluid">
                                            <DataTable
                                                header={menuAssDeassSearchHeader}
                                                value={menuMappings}
                                                paginator
                                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                                rows={50}
                                                rowsPerPageOptions={[10, 25, 50]}
                                                filters={menuAssDeassFilters}
                                                globalFilterFields={["menuname"]}
                                                onFilter={(e) => {
                                                    setMenuAssDeassFilters(e.filters);
                                                }}
                                                scrollable
                                                scrollHeight="400px"
                                                selectionMode={null} //selectionMode={rowClick ? null : 'checkbox'}
                                                selection={selectedMenus}
                                                onSelectionChange={(e) => setSelectedMenus(e.value)}
                                                // tableStyle={{ maxWidth: "50rem" }}
                                            >
                                                <Column
                                                    header="No."
                                                    body={(rowData, options) =>
                                                        options.rowIndex + 1
                                                    }
                                                    style={{ width: "5rem" }}
                                                    bodyStyle={{ textAlign: "center" }}
                                                />
                                                <Column
                                                    field="menuname"
                                                    header="Menu Name"
                                                ></Column>
                                                <Column
                                                    // field="is_associated"
                                                    selectionMode="multiple"
                                                    headerStyle={{ width: "3rem" }}
                                                    bodyStyle={{ textAlign: "right" }}
                                                ></Column>
                                            </DataTable>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </TabPanel>
                            <TabPanel header="Online Assoc / Deasso">
                                <AnimatePresence>
                                    <motion.div
                                        key="price-update"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        <div className="p-fluid">
                                            <DataTable
                                                header={onlineAssDeassSearchHeader}
                                                value={onlineMappings}
                                                paginator
                                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                                rows={50}
                                                rowsPerPageOptions={[10, 25, 50]}
                                                filters={onlineAssDeassFilters}
                                                globalFilterFields={["storename", "channelname"]}
                                                onFilter={(e) => {
                                                    setOnlineAssDeassFilters(e.filters);
                                                }}
                                                scrollable
                                                scrollHeight="400px"
                                                selectionMode={null} //selectionMode={rowClick ? null : 'checkbox'}
                                                selection={selectedOnlineMappings}
                                                onSelectionChange={(e) =>
                                                    setSelectedOnlineMappings(e.value)
                                                }
                                                // tableStyle={{ maxWidth: "50rem" }}
                                            >
                                                <Column
                                                    header="No."
                                                    body={(rowData, options) =>
                                                        options.rowIndex + 1
                                                    }
                                                    style={{ width: "5rem" }}
                                                    bodyStyle={{ textAlign: "center" }}
                                                />
                                                <Column
                                                    field="storename"
                                                    header="Location Name"
                                                ></Column>
                                                <Column
                                                    field="channelname"
                                                    header="Channel"
                                                ></Column>
                                                <Column
                                                    selectionMode="multiple"
                                                    headerStyle={{ width: "3rem" }}
                                                    bodyStyle={{ textAlign: "right" }}
                                                ></Column>
                                            </DataTable>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </TabPanel>
                        </TabView>
                    </div>
                </Dialog>
                {/* <Dialog
                    visible={deleteProductDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteProductDialogFooter}
                    onHide={hideDeleteProductDialog}
                    draggable={false}
                >
                    <div className="confirmation-content">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {product && (
                            <span>
                                Are you sure you want to delete <b>{product.productname}</b>?
                            </span>
                        )}
                    </div>
                </Dialog> */}

                <Dialog
                    visible={deleteProductDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteProductDialogFooter}
                    onHide={hideDeleteProductDialog}
                    draggable={false}>

                    <div className="confirmation-content flex  items-center">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />

                       {product.productname && (
                            <span>
                                Are you sure you want to delete <b>{product.productname}</b>?
                            </span>
                        )}

                        {
                            selectedProduct?.length > 0 && (
                                <span>
                                    Are you sure you want to delete the selected Product?
                                </span>
                            )
                        } 
                    </div>

                </Dialog>
            </div>
        </div>
    );
};

export default ProductList;
