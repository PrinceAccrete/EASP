import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import "jspdf-autotable";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { MultiSelect } from "primereact/multiselect";
import { Skeleton } from "primereact/skeleton";
// import { jsPDF } from "jspdf";
// import * as XLSX from "xlsx";
import { Dialog } from "primereact/dialog";

function PortionList() {
    let emptyPortion = {
        id: null,
        name: "",
    };
    const toast = useRef(null);
    const [portions, setPortions] = useState([]); // API Data
    const [loading, setLoading] = useState(true);
    const [portion, setPortion] = useState(emptyPortion);
    const [deletePortionsDialog, setDeletePortionsDialog] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const token = useSelector((state) => state.auth.token);
    const navigate = useNavigate();
    const dt = useRef(null);
    const [first, setFirst] = useState(0); // Start index
    const [rows, setRows] = useState(50); // Page size
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records (from API)
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        portionname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const columnOptions = [
        { field: "portionname", header: "Portion List" },
        { field: "totalassociatedproducts", header: "Associated Products" },
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
    //

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
                    portions.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                const fileName = "portionList_export_" + new Date().getTime() + ".pdf";
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
            const filteredData = portions.map((row) => {
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

            saveAsExcelFile(excelBuffer, "portionList");
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

    const fetchPortionList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/portion/getPortionList`,
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
                setPortions(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };
  
    useEffect(() => {
        const sessionState = sessionStorage.getItem("portionListState");
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
            const sessionState = sessionStorage.getItem("portionListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchPortionList(
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
        // fetchPortionList(event.first, event.rows);
    };

    const editPortion = (rowData) => {
        // setSelectedPortion(rowData)
        navigate(`/product-portion/${rowData.portionid}`);
        // alert(`Edit clicked for ${rowData.portion}`);
    };

    const handleDeletePortion = async (portionid) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/portion/delete`,
                { portionId: portionid },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success === 1) {
                const sessionState = sessionStorage.getItem("portionListState");
                let parsed = sessionState ? JSON.parse(sessionState) : {};

                const search = parsed.filters?.global?.value || "";
                const field = parsed.sortField || "";
                const order =
                    parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";
                fetchPortionList(
                    first,
                    rows,
                    globalFilterValue || search,
                    sortField || field,
                    sortOrder || order
                );
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
                                onClick={() => editPortion(rowData)}
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                className="p-0 text-xs"
                                style={{ fontSize: "0.7rem", width: "2.5rem", height: "2.5rem" }}
                                onClick={() => {
                                    confirmDeletePortion(rowData);
                                }}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };

    const confirmDeletePortion = (portion) => {
        setPortion(portion);
        setDeletePortionsDialog(true);
    };

    const hideDeletePortionDialog = () => {
        setDeletePortionsDialog(false);
    };

    const deletePortion = async () => {
        try {
            await handleDeletePortion(portion.portionid);
            setDeletePortionsDialog(false);
            setPortion(emptyPortion);
            toast.current.show({
                severity: "success",
                summary: "Successful",
                detail: "Portion Deleted",
                life: 3000,
            });
        } catch (error) {}
    };

    const deletePortionDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletePortionDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deletePortion} />
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
        portionname: "",
        totalassociatedproducts:"",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const portionNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="11rem" height="1.5rem" />
        ) : (
            <span>{rowData.portionname}</span>
        );
    };

    const associatedProductBodyTemplate = (rowData) => {
               return (
                   <div className="flex align-items-center ">
                       {loading ? (
                           <Skeleton shape="circle" size="2.5rem"/>
                       ) : (
                           <div
                               style={{
                                   width: "40px",
                                   height: "40px",
                                   backgroundColor: "#d1e7dd",
                                   borderRadius: "50%",
                                   display: "flex",
                                   alignItems: "center",
                                   justifyContent: "center",
                                   border: "1px solid #ddd",
                                   color: "#0f5132",
                               
                               }}
                           >
                               {rowData.totalassociatedproducts}
                           </div>
                       )}
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
            {/* <ConfirmDialog /> */}
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Portion List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/product-portion");
                    }}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card p-4">
                <DataTable
                    ref={dt}
                    // value={portions}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : portions}
                    paginator
                    header={header}
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    rowClassName={() => "custom-row-class"}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    dataKey="portionid"
                    // globalFilter={globalFilterValue}
                    removableSort
                    filters={filters}
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    filterDisplay="menu"
                    globalFilterFields={["portionname"]}
                    emptyMessage="No portions found."
                    stateStorage="session"
                    stateKey="portionListState"
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                    onFilter={(e) => {
                        setFilters(e.filters);
                    }}
                    // scrollable
                    // scrollHeight="calc(100vh - 200px)"
                    // scrollHeight=" 500px"
                    // className="custom-scrollbar"
                >
                    <Column
                        header="Sr No."
                        body={(rowData, options) => loading ? <Skeleton width="40%" height="1.5rem"  /> : options.rowIndex + 1}
                        style={{ width: "2%", textAlign: "center" }}
                    />
                    {visibleFields.some((col) => col.field === "portionname") && (
                        <Column
                            field="portionname"
                            header="Portion"
                            style={{ minWidth: "11rem" }}
                            body={portionNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            filterPlaceholder="Search by portion"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "totalassociatedproducts") && (
                        <Column
                            field="totalassociatedproducts"
                            header="Associated Products"
                            sortableDisabled={loading}
                            body={associatedProductBodyTemplate}
                            style={{ minWidth: "15rem" }}
                            // bodyStyle={{textAlign:"center"}}
                            sortable
                            filterPlaceholder="Search by portion"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="CreatedBy"
                            body={createdByBodyTemplate}
                            sortableDisabled={loading}
                            style={{ minWidth: "12rem" }}
                            sortable
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="CreatedDate"
                            body={createdDateBodyTemplate}
                            sortableDisabled={loading}
                            style={{ minWidth: "15rem" }}
                            sortable
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="ModifiedBy"
                            style={{ minWidth: "12rem" }}
                            sortableDisabled={loading}
                            body={modifiedByBodyTemplate}
                            sortable
                            // body={(rowData) => (!rowData.modifiedby ? "-" : rowData.modifiedby)}
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
                    visible={deletePortionsDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deletePortionDialogFooter}
                    onHide={hideDeletePortionDialog}
                    draggable={false}
                >
                    <div className="confirmation-content">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {portion && (
                            <span>
                                Are you sure you want to delete <b>{portion.portionname}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>
            </div>
        </div>
    );
}

export default PortionList;
