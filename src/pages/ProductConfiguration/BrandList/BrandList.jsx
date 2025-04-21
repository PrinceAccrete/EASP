import { Button } from "primereact/button";
import React, { useRef } from "react";
import { Tooltip } from "primereact/tooltip";
import { useNavigate } from "react-router-dom";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MultiSelect } from "primereact/multiselect";
import { Skeleton } from "primereact/skeleton";
// import { jsPDF } from "jspdf";
// import * as XLSX from "xlsx";
import "jspdf-autotable";
import { Toast } from "primereact/toast";

const BrandList = () => {
    let emptyBrand = {
        id: null,
        name: "",
    };

    const toast = useRef(null);
    const [loading, setLoading] = useState(true);
    const dt = useRef(null);
    const navigate = useNavigate();
    const [brand, setBrand] = useState([]);
    // const [brands, setBrands] = useState(emptyBrand);
    const token = useSelector((state) => state.auth.token);
    const [selectedBrand, setSelectedBrand] = useState(emptyBrand);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [deleteBrandsDialog, setDeleteBrandsDialog] = useState(false);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        brandname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const columnOptions = [
        { field: "brandname", header: "BrandList" },
        { field: "createdby", header: "CreateBy" },
        { field: "createddate", header: "CreatedDate" },
        { field: "modifiedby", header: "ModifiedBy" },
        { field: "modifieddate", header: "ModifiedDate" },
    ];
    const [first, setFirst] = useState(0); // Start index
    const [rows, setRows] = useState(50); // Page size
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records (from API)

    const [visibleFields, setVisibleFields] = useState(
        columnOptions.filter(
            (col) =>
                col.field != "createddate" &&
                col.field != "createdby" &&
                col.field != "modifiedby" &&
                col.field != "modifieddate"
        )
    );
    const exportColumns = visibleFields.map((col) => ({ title: col.header, dataKey: col.field }));

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
                    brand.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                const fileName = "brandList_export_" + new Date().getTime() + ".pdf";
                doc.save(fileName);
                fileExportMessage();
            });
        });
    };

    const exportXLS = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = brand.map((row) => {
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

            saveAsExcelFile(excelBuffer, "brandList");
            module.default.saveAs(
                data,
                fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
            );
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

    const fetchBrandList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${BASE_URL}/brands/getBrands`,
                { companyId: 5 },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        start: start,
                        length: length,
                        ...(search ? { search } : {}),
                        ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                    },
                }
            );

            if (response.data.success === 1) {
                setBrand(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     if (token) {
    //         fetchBrandList(first, rows);
    //     }
    // }, [token]);

    useEffect(() => {
        const sessionState = sessionStorage.getItem("brandListState");
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
            const sessionState = sessionStorage.getItem("brandListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchBrandList(
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
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
        setLoading(true);
        scrollToTop();

        // Fetch new chunk based on page and size
        // fetchBrandList(event.first, event.rows);
    };

    const handleDeleteBrand = async (brandid) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/brands/delete`,
                { companyId: 5, brandId: brandid },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success === 1) {
                const sessionState = sessionStorage.getItem("brandListState");
                let parsed = sessionState ? JSON.parse(sessionState) : {};

                const search = parsed.filters?.global?.value || "";
                const field = parsed.sortField || "";
                const order =
                    parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

                fetchBrandList(
                    first,
                    rows,
                    globalFilterValue || search,
                    sortField || field,
                    sortOrder || order
                ); // Refresh UI
            }
        } catch (error) {}
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

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                {loading ? (
                    <>
                        <div className="flex">
                            <Skeleton shape="circle" size="2.5rem" className="mr-2" />
                            <Skeleton shape="circle" size="2.5rem" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <Button
                                icon="pi pi-pencil"
                                rounded
                                outlined
                                className="p-0 text-xs"
                                style={{ fontSize: "0.7rem", width: "2.5rem", height: "2.5rem" }}
                                onClick={() => editBrand(rowData)}
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                className="p-0 text-xs"
                                style={{ fontSize: "0.7rem", width: "2.5rem", height: "2.5rem" }}
                                onClick={() => {
                                    confirmDeleteBrand(rowData);
                                }}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };

    const editBrand = (rowData) => {
        navigate(`/product-brand/${rowData.brandid}`);
        // alert(`Edit clicked for ${rowData.portion}`);
    };

    const confirmDeleteBrand = (brands) => {
        setSelectedBrand(brands);
        setDeleteBrandsDialog(true);
    };

    const hideDeleteBrandDialog = () => {
        setDeleteBrandsDialog(false);
    };

    const deleteBrand = async () => {
        try {
            await handleDeleteBrand(selectedBrand.brandid);
            setDeleteBrandsDialog(false);
            setSelectedBrand(emptyBrand);
            toast.current.show({
                severity: "success",
                summary: "Successful",
                detail: "Brand Deleted",
                life: 3000,
            });
        } catch (error) {}
    };

    const deleteBrandDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteBrandDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteBrand} />
        </React.Fragment>
    );

    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
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
                            // tooltipOptions={{ position: "top" }}
                        />
                        <Button
                            className="export-icon-tooltip"
                            type="button"
                            icon="pi pi-file-excel"
                            severity="success"
                            rounded
                            onClick={exportXLS}
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
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const blankRow = {
        brandname: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const brandNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="30%" height="1.5rem" />
        ) : (
            <span>{rowData.brandname}</span>
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

    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Brand List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/product-brand");
                    }}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card p-4">
                <DataTable
                    ref={dt}
                    // value={brand}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : brand}
                    paginator
                    header={header}
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    dataKey="brandid"
                    rowClassName={() => "custom-row-class"}
                    // globalFilter={globalFilterValue}
                    removableSort
                    filters={filters}
                    filterDisplay="menu"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    globalFilterFields={["brandname"]}
                    emptyMessage="No brands found."
                    onSort={onSortChange}
                    sortField={sortField}
                    stateStorage="session"
                    stateKey="brandListState"
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                    onFilter={(e) => {
                        setFilters(e.filters);
                    }}
                    // tableStyle={{ minWidth: "50rem" }}
                >
                    <Column
                        header="Sr No."
                        body={(rowData, options) =>
                            loading ? (
                                <Skeleton width="50%" height="1.5rem" />
                            ) : (
                                options.rowIndex + 1
                            )
                        }
                        style={{ width: "2%", textAlign: "center" }}
                    />
                    {visibleFields.some((col) => col.field === "brandname") && (
                        <Column
                            field="brandname"
                            header="Brand Name"
                            style={{ minWidth: "11rem" }}
                            sortable
                            body={brandNameBodyTemplate}
                            sortableDisabled={loading}
                            // filter
                            filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="CreatedBy"
                            style={{ minWidth: "12rem" }}
                            body={createdByBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="CreatedDate"
                            style={{ minWidth: "15rem" }}
                            body={createdDateBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="ModifiedBy"
                            style={{ minWidth: "12rem" }}
                            // body={(rowdata) => (!rowdata.modifiedby ? "-" : rowdata.modifiedby)}
                            sortableDisabled={loading}
                            body={modifiedByBodyTemplate}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifieddate") && (
                        <Column
                            field="modifieddate"
                            header="Modified-Date"
                            style={{ minWidth: "15rem" }}
                            // body={(rowData) =>
                            //     !rowData.modifiedby ? "-" : rowData.modifieddate || "-"
                            // }
                            body={modifiedDateBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    <Column
                        body={actionBodyTemplate}
                        header="Action"
                        style={{ width: "0%" }}
                    ></Column>
                </DataTable>

                <Dialog
                    visible={deleteBrandsDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteBrandDialogFooter}
                    onHide={hideDeleteBrandDialog}
                    draggable={false}
                >
                    <div className="confirmation-content">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {selectedBrand && (
                            <span>
                                Are you sure you want to delete <b>{selectedBrand.brandname}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default BrandList;
