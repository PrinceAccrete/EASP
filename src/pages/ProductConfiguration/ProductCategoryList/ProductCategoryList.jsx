import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { IconField } from "primereact/iconfield";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";

// import "./ProductCategory.css";

const ProductCategoryList = () => {
    const [categoryList, setCategoryList] = useState([]);

    const token = useSelector((state) => state.auth.token);
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    // This state is for skeleton
    const [loading, setLoading] = useState(true);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const dt = useRef(null);
    const toast = useRef(null);

    // pagiatnation states
    const [first, setFirst] = useState(0); // Start index
    const [rows, setRows] = useState(50); // Page size
    const [totalRecords, setTotalRecords] = useState(0);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        productcategoryname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        displayorder: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        backcolor: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        brandname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    // visible fields states

    const columnOptions = [
        { field: "productcategoryname", header: "Product Category" },
        { field: "displayorder", header: "Display Order" },
        { field: "backcolor", header: "Product Color" },
        { field: "brandname", header: "Brand" },
        { field: "status", header: "Status" },
        { field: "createdby", header: "Created By" },
        { field: "createddate", header: "Created Date" },
        { field: "modifiedby", header: "Modified By" },
        { field: "modifieddate", header: "Modified Date" },
    ];
    const [visibleFields, setVisibleFields] = useState(
        columnOptions.filter(
            (col) =>
                col.field !== "createdby" &&
                col.field !== "createddate" &&
                col.field !== "modifiedby" &&
                col.field !== "modifieddate"
        )
    );

    const exportColumns = visibleFields.map((col) => ({ title: col.header, dataKey: col.field }));

    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
    };

    // Fetch category list from API on component mount

    const fetchCategoryList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${BASE_URL}/productCategory/getProductCategoryList`,
                { companyId: 5 },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        start: start,
                        length: length,
                        ...(search ? { search } : {}),
                        ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                    },
                }
            );
            if (response.data.success === 1 && response.data.data.data) {
                setCategoryList(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
            } else {
                console.error("Error fetching category list:", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch category list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionState = sessionStorage.getItem("productCategoryList");
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
            const sessionState = sessionStorage.getItem("productCategoryList");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchCategoryList(
                first,
                rows,
                globalFilterValue || search,
                sortField || field,
                sortOrder || order
            );
        }, 500); // debounce delay in ms

        return () => clearTimeout(delayDebounce);
    }, [first, rows, filters, globalFilterValue, sortField, sortOrder, token]);

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

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
        setLoading(true);
        scrollToTop();

        // Fetch new chunk based on page and size
        // fetchCategoryList(event.first, event.rows);
    };

    // Global filter change handler
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters["global"].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
        setFirst(0);
        setLoading(true);
    };

    const hideDialog = () => {
        // setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const confirmDeleteProduct = (product) => {
        setSelectedProduct(product);
        setDeleteProductDialog(true);
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;

        try {
            const response = await axios.post(
                `${BASE_URL}/productCategory/delete`,
                { companyId: 5, productCategoryIds: [selectedProduct.productcategoryid] },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1) {
                toast.current.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Category Deleted",
                    life: 3000,
                });
                const sessionState = sessionStorage.getItem("productCategoryList");
                let parsed = sessionState ? JSON.parse(sessionState) : {};

                const search = parsed.filters?.global?.value || "";
                const field = parsed.sortField || "";
                const order =
                    parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

                fetchCategoryList(
                    first,
                    rows,
                    globalFilterValue || search,
                    sortField || field,
                    sortOrder || order
                );
                hideDeleteProductDialog();
            } else {
                alert("Failed to delete category.");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("An error occurred while deleting.");
        }
    };

    // Custom body template to display a circle for the product color
    const colorBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center justify-content-left">
                {loading ? (
                    <Skeleton shape="circle" size="2rem" />
                ) : (
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: rowData.backcolor || "gray",
                            borderRadius: "50%",
                            display: "inline-block",
                            border: "1px solid #ddd",
                        }}
                    ></div>
                )}
            </div>
        );
    };

    // Action column template with edit/delete buttons.
    // The edit button uses navigate to redirect to the edit route with the product ID.
    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <div className="flex">
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
                                onClick={() =>
                                    navigate(`/product-category/${rowData.productcategoryid}`)
                                }
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                onClick={() => confirmDeleteProduct(rowData)}
                            />
                        </>
                    )}
                </div>
            </>
        );
    };

    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" />
        </React.Fragment>
    );

    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={handleDeleteProduct}
            />
        </React.Fragment>
    );

    // export to CSV

    const exportCSV = () => {
        if (dt.current) {
            dt.current.exportCSV({
                selectionOnly: false,
                filename: "ProductCategory_List",
                Column: visibleFields.map((col) => ({
                    field: col.field,
                    header: col.header,
                })),
            });
            fileExportMessage();
        }
    };

    const fileExportMessage = () => {
        toast.current.show({
            severity: "success",
            detail: "File Exported Successfully",
            life: 3000,
        });
    };

    const exportPdf = () => {
        import("jspdf").then((jsPDF) => {
            import("jspdf-autotable").then(() => {
                const doc = new jsPDF.default(0, 0);

                doc.autoTable(
                    exportColumns,
                    categoryList.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                const fileName = "ProductCategory_List_export_" + new Date().getTime() + ".pdf";

                doc.save(fileName);
                fileExportMessage();
            });
        });
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = categoryList.map((row) => {
                const filteredRow = {};
                visibleFields.forEach((col) => {
                    filteredRow[col.header] = row[col.field];
                });
                return filteredRow;
            });

            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            saveAsExcelFile(excelBuffer, "ProductCategory_List");
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

    const renderHeader = () => {
        const value = filters["global"] ? filters["global"].value : "";
        return (
            <div className="flex flex-column sm:flex-row gap-3 sm:gap-2 justify-content-between align-items-start sm:align-items-center flex-wrap">
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
                    <MultiSelect
                        value={visibleFields}
                        options={columnOptions}
                        optionLabel="header"
                        onChange={onColumnToggle}
                        className="w-full sm:w-18rem"
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
                        />
                    </div>
                    <Tooltip
                        target=".export-icon-tooltip"
                        position="top"
                        style={{ fontSize: "12px" }}
                        showDelay={100}
                        hideDelay={100}
                    />
                </div>
            </div>
        );
    };
    const header = renderHeader();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const blankRow = {
        productcategoryname: "",
        displayorder: "",
        backcolor: "",
        brandname: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const productCategoryNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="80%" height="1.5rem" />
        ) : (
            <span>{rowData.productcategoryname ? rowData.productcategoryname : "-"}</span>
        );
    };

    const displayOrderBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="30%" height="1.5rem" />
        ) : (
            <span>{rowData.displayorder ? rowData.displayorder : "-"}</span>
        );
    };

    const brandNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.brandname ? rowData.brandname : "-"}</span>
        );
    };

    const StatusBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.status === 1 ? "Active" : "Inactive"}</span>
        );
    };

    const createdByBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? (
                    <Skeleton width="70%" height="1.5rem" />
                ) : !rowData.createdby ? (
                    "-"
                ) : (
                    rowData.createdby
                )}
            </span>
        );
    };

    const createdDateBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? (
                    <Skeleton width="70%" height="1.5rem" />
                ) : !rowData.createdby ? (
                    "-"
                ) : (
                    rowData.createddate
                )}
            </span>
        );
    };

    const modifiedByBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? (
                    <Skeleton width="70%" height="1.5rem" />
                ) : !rowData.modifiedby ? (
                    "-"
                ) : (
                    rowData.modifiedby
                )}
            </span>
        );
    };

    const modifiedDateBodyTemplate = (rowData) => {
        return (
            <span className="flex align-items-center gap-2">
                {loading ? (
                    <Skeleton width="70%" height="1.5rem" />
                ) : !rowData.modifiedby ? (
                    "-"
                ) : (
                    rowData.modifieddate || "-"
                )}
            </span>
        );
    };

    return (
        <div>
            {/* <ConfirmDialog /> */}
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Category List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/product-category");
                    }}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card ">
                <DataTable
                    ref={dt}
                    // value={categoryList}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : categoryList}
                    paginator
                    header={header}
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    rowClassName={() => "custom-row-class"}
                    tableStyle={{ minWidth: "50rem" }}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    globalFilterFields={[
                        "productcategoryname",
                        "displayorder",
                        "backcolor",
                        "brandname",
                    ]}
                    dataKey="productcategoryid"
                    filters={filters}
                    filterDisplay="menu"
                    emptyMessage="No products found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    removableSort
                    stateStorage="session"
                    stateKey="productCategoryList"
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
                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minWidth: "6rem", textAlign: "left" }}
                        // bodyStyle={{ textAlign: "center" }}
                    />

                    {visibleFields.some((col) => col.field === "productcategoryname") && (
                        <Column
                            field="productcategoryname"
                            header="Product Category"
                            style={{ minWidth: "17rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={productCategoryNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "displayorder") && (
                        <Column
                            field="displayorder"
                            header="Display Order"
                            style={{ minWidth: "13rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={displayOrderBodyTemplate}
                            // bodyStyle={{textAlign:"center"}}
                            sortableDisabled={loading}
                            sortable
                            // bodyStyle={{ textAlign: "center" }}
                            // filter
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "backcolor") && (
                        <Column
                            field="backcolor"
                            header="Product Color"
                            style={{ minWidth: "10rem", maxWidth: "10rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={colorBodyTemplate}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "brandname") && (
                        <Column
                            field="brandname"
                            header="Brand"
                            style={{ minWidth: "10rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => rowData.brandname || "-"}
                            body={brandNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        ></Column>
                    )}
                    {visibleFields.some((col) => col.field === "status") && (
                        <Column
                            field="status"
                            header="Status"
                            style={{ minWidth: "10rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => rowData.brandname || "-"}
                            body={StatusBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="Created By"
                            sortable
                            filterField="createdby"
                            style={{ minWidth: "15rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => (!rowData.createdby ? "-" : rowData.createdby)}
                            body={createdByBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="Created Date"
                            sortable
                            filterField="createddate"
                            style={{ minWidth: "15rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => (!rowData.createdby ? "-" : rowData.createddate)}
                            body={createdDateBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="Modified By"
                            sortable
                            filterField="modifiedby"
                            style={{ minWidth: "12rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => (!rowData.modifiedby ? "-" : rowData.modifiedby)}
                            body={modifiedByBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifieddate") && (
                        <Column
                            field="modifieddate"
                            header="Modified Date"
                            sortable
                            filterField="modifieddate"
                            style={{ minWidth: "15rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) =>
                            //     !rowData.modifiedby ? "-" : rowData.modifieddate || "-"
                            // }
                            body={modifiedDateBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    <Column
                        header="Action"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{ width: "0%", textAlign: "center" }}
                        headerStyle={{ textAlign: "center" }}
                    ></Column>
                </DataTable>
                {/* dialog */}
                {/* Delete Confirmation Dialog */}
                <Dialog
                    visible={deleteProductDialog}
                    style={{ width: "32rem" }}
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
                        {selectedProduct && (
                            <span>
                                Are you sure you want to delete{" "}
                                <b>{selectedProduct.productcategoryname}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>

                {/* Render your category list here */}
            </div>
        </div>
    );
};

export default ProductCategoryList;
