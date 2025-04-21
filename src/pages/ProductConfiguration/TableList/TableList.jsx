import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { useNavigate } from "react-router-dom";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { MultiSelect } from "primereact/multiselect";
import { useSelector } from "react-redux";
import axios from "axios";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";

const TableList = () => {
    let emptyTable = {
        id: null,
        name: "",
        location: "",
        isactive: "",
        QRcode: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };
    const navigate = useNavigate();
    const [table, setTable] = useState(emptyTable);
    const [loading, setLoading] = useState(true);
    const [tables, setTables] = useState([]);
    const [deleteTablesDialog, setDeleteTablesDialog] = useState(false);
    const toast = useRef(null);
    const token = useSelector((state) => state.auth.token);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const dt = useRef(null);
    const [first, setFirst] = useState(0); // Start index
    const [rows, setRows] = useState(50); // Page size
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        tablename: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        location: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        isactive: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const columnOptions = [
        { field: "tablename", header: "Table Name" },
        { field: "locationname", header: "Location" },
        { field: "isactive", header: "isActive" },
        { field: "", header: "QRCode" },
        { field: "createdby", header: "Create By" },
        { field: "createddate", header: "Created Date" },
        { field: "modifiedby", header: "Modified By" },
        { field: "modifieddate", header: "Modified Date" },
    ];
    //
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
                    tables.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                const fileName = "tableList_export_" + new Date().getTime() + ".pdf";
                doc.save(fileName);
                fileExportMessage();
            });
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

    const exportXLS = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = tables.map((row) => {
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

            saveAsExcelFile(excelBuffer, "table");
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

    const fetchTableList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${BASE_URL}/table/getTableList`,
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
                setTables(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionState = sessionStorage.getItem("tableListState");
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
            const sessionState = sessionStorage.getItem("tableListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchTableList(
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
        // fetchTableList(event.first, event.rows);
    };

    const editTable = (rowData) => {
        navigate(`/product-table/${rowData.tableid}`);
    };

    const handleDeleteTable = async (tableid) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/table/deletetable`,
                { tableId: [tableid] },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success === 1) {
                const sessionState = sessionStorage.getItem("tableListState");
                let parsed = sessionState ? JSON.parse(sessionState) : {};

                const search = parsed.filters?.global?.value || "";
                const field = parsed.sortField || "";
                const order =
                    parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";
                fetchTableList(
                    first,
                    rows,
                    globalFilterValue || search,
                    sortField || field,
                    sortOrder || order
                );
            }
        } catch (error) {}
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
                                onClick={() => editTable(rowData)}
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                className="p-0 text-xs"
                                style={{ fontSize: "0.7rem", width: "2.5rem", height: "2.5rem" }}
                                onClick={() => {
                                    confirmDeleteTable(rowData);
                                }}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };

    const confirmDeleteTable = (table) => {
        setTable(table);
        setDeleteTablesDialog(true);
    };

    const hideDeleteTableDialog = () => {
        setDeleteTablesDialog(false);
    };

    const deleteTable = async () => {
        try {
            await handleDeleteTable(table.tableid);
            setDeleteTablesDialog(false);
            setTable(emptyTable);
            toast.current.show({
                severity: "success",
                summary: "Successful",
                detail: "Table Deleted",
                life: 3000,
            });
        } catch (error) {}
    };

    const deleteTableDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteTableDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteTable} />
        </React.Fragment>
    );

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
        setLoading(true);
        setFirst(0);

        if (!sortField || sortOrder == null) {
            setSortField("");
            setSortOrder("");
        } else {
            setSortField(sortField);
            setSortOrder(sortOrder === 1 ? "asc" : "desc");
        }
    };

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

    const blankRow = {
        tablename: "",
        locationname: "",
        isactive: "",
        QRcode: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const tableNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="40%" height="1.5rem" />
        ) : (
            <span>{rowData.tablename}</span>
        );
    };

    const locationBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="40%" height="1.5rem" />
        ) : (
            <div className="flex align-items-center gap-2">
                <span>{rowData.locationname}</span>
            </div>
        );
    };

    const isactiveBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="3rem" height="1.5rem" />
        ) : (
            <div className="flex align-items-center gap-2">
                <span>{rowData.isactive}</span>
            </div>
        );
    };

    const qrcodeBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="3rem" height="1.5rem" />
        ) : (
            <div className="flex align-items-center gap-2">
                <span>{rowData.qrname ? rowData.qrname : "-"}</span>
            </div>
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
                <div>Table List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/product-table");
                    }}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card p-4">
                <DataTable
                    ref={dt}
                    // value={tables}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : tables}
                    paginator
                    lazy
                    header={header}
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    dataKey="tableid"
                    rowClassName={() => "custom-row-class"}
                    // globalFilter={globalFilterValue}
                    removableSort
                    filters={filters}
                    filterDisplay="menu"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    emptyMessage="No tableData found"
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                    globalFilterFields={["tablename", "locationname", "isactive"]}
                    stateStorage="session"
                    stateKey="tableListState"
                    onFilter={(e) => {
                        setFilters(e.filters);
                    }}
                    // tableStyle={{ minWidth: "50rem" }}
                >
                    <Column
                        header="Sr No."
                        body={(rowData, options) =>   loading ? <Skeleton width="50%" height="1.5rem" /> : options.rowIndex + 1}
                        style={{ width: "2%", textAlign: "center" }}
                    />

                    {visibleFields.some((col) => col.field === "tablename") && (
                        <Column
                            field="tablename"
                            header="Table Name"
                            style={{ minWidth: "11rem" }}
                            body={tableNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "locationname") && (
                        <Column
                            field="locationname"
                            header="Location"
                            body={locationBodyTemplate}
                            sortableDisabled={loading}
                            style={{ minWidth: "11rem" }}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "isactive") && (
                        <Column
                            field="isactive"
                            header="Is Active"
                            style={{ minWidth: "11rem" }}
                            sortable
                            body={isactiveBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "") && (
                        <Column
                            field=""
                            header="QR Code"
                            style={{ minWidth: "11rem" }}
                            body={qrcodeBodyTemplate}
                            sortable
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="CreatedBy"
                            style={{ minWidth: "12rem" }}
                            sortablebody={createdByBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="CreatedDate"
                            style={{ minWidth: "15rem" }}
                            sortable
                            body={createdDateBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="ModifiedBy"
                            style={{ minWidth: "15rem" }}
                            // body={(rowdata) => (!rowdata.modifiedby ? "-" : rowdata.modifiedby)}
                            sortable
                            sortableDisabled={loading}
                            body={modifiedByBodyTemplate}
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
                            sortable
                            body={modifiedDateBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    <Column
                        body={actionBodyTemplate}
                        header="Action"
                        style={{ width: "10%" }}
                    ></Column>
                </DataTable>

                <Dialog
                    visible={deleteTablesDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteTableDialogFooter}
                    onHide={hideDeleteTableDialog}
                    draggable={false}
                >
                    <div className="confirmation-content">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {table && (
                            <span>
                                Are you sure you want to delete <b>{table.tablename}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default TableList;
