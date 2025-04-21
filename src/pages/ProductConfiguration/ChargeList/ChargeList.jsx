import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import axios from "axios";
import { Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Tooltip } from "primereact/tooltip";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";

const ChargeList = () => {
    const token = useSelector((state) => state.auth.token);
    const toast = useRef(null);
    const dt = useRef(null);

    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const [loading, setLoading] = useState(true);

    const [chargeList, setChargeList] = useState([]);
    const [selectedCharge, setSelectedCharge] = useState([]);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [Charge, setCharge] = useState(null);
    const navigate = useNavigate();

    // const [productDialog, setProductDialog] = useState(false);
    // pagiatnation states
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(50);
    const [totalRecords, setTotalRecords] = useState(0);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        chargename: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        chargevalue: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        menuname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        companyname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    // coloum options
    const columnOptions = [
        { field: "chargename", header: "Charge Name" },
        { field: "chargevalue", header: "Charge Value" },
        { field: "menuname", header: "Menu Name" },
        { field: "companyname", header: "Company Name" },
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

    // columns Statea Toggle
    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
    };

    const exportColumns = visibleFields.map((col) => ({ title: col.header, dataKey: col.field }));

    const fetchChargeList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${BASE_URL}/charge/getChargeList`,
                { companyId: 5, locationId: 5    },

                {
                    headers: {
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

            if (response.data.success === 1 && response.data.data.data) {
                const chargeData = response.data.data.data;
                setTotalRecords(response.data.data.totalRecords);
                setChargeList(chargeData);
            } else {
                console.error("Error fetching charge list:", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch charge list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionState = sessionStorage.getItem("ChargeList");
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
            const sessionState = sessionStorage.getItem("ChargeList");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchChargeList(
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
        // fetchCategoryList(event.first, event.rows);
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

    // All exports Function assembled here
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
                Column: visibleFields.map((col) => ({
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
                const doc = new jsPDF.default(0, 0);

                doc.autoTable(
                    exportColumns,
                    chargeList.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                const fileName = "Charge_List_export_" + new Date().getTime() + ".pdf";
 
                doc.save(fileName);
                fileExportMessage();
            });
        });
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = chargeList.map((row) => {
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

            saveAsExcelFile(excelBuffer, "Charge_List");
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
                    <Button
                        className={`${
                            selectedCharge.length > 0 ? "bg-red-500" : "bg-red-200"
                        } text-white font-medium border-none outline-none rounded-full`}
                        icon="pi pi-trash"
                        label={`Delete (${selectedCharge.length})`}
                        onClick={() => setDeleteProductDialog(true)}
                        disabled={loading}
                    />
                </div>
            </div>
        );
    };
    const header = renderHeader();

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
                            onClick={() => {
                                navigate(`/charge-master/${rowData.chargeid}`);
                            }}
                        />
                        <Button
                            icon="pi pi-trash"
                            rounded
                            outlined
                            severity="danger"
                            disabled={selectedCharge.length > 0}
                            
                            onClick={() => confirmDeleteProduct(rowData)}
                        />
                    </>
                )}
                </div>
            </>
        );
    };

    const handleDeleteProduct = async (selectedChargeList) => {
        if (selectedChargeList.length > 0) {
            let ChargeIds = [];

            for (let i = 0; i < selectedChargeList.length; i++) {
                ChargeIds.push(selectedChargeList[i].chargeid);
            }

            try {
                const response = await axios.post(
                    `${BASE_URL}/charge/deleteCharge`,
                    { chargeId: ChargeIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success === 1) {
                    toast.current.show({
                        severity: "success",
                        summary: "Successful",
                        detail: "Category Deleted",
                        life: 3000,
                    });
                    const sessionState = sessionStorage.getItem("ChargeList");
                    let parsed = sessionState ? JSON.parse(sessionState) : {};
        
                    const search = parsed.filters?.global?.value || "";
                    const field = parsed.sortField || "";
                    const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";
        
                    fetchChargeList(
                        first,
                        rows,
                        globalFilterValue || search,
                        sortField || field,
                        sortOrder || order
                    );
                    setSelectedCharge([]);
                    setDeleteProductDialog(false);
                    setCharge(null);
                } else {
                    alert("Failed to delete category.");
                }
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("An error occurred while deleting.");
            }
        }
    };

    const confirmDeleteProduct = (data) => {
        setCharge(data);
        setDeleteProductDialog(true);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={() =>
                    handleDeleteProduct(selectedCharge.length > 0 ? selectedCharge : [Charge])
                }
            />
        </React.Fragment>
    );

    const blankRow = {
        chargename: "",
        chargevalue: "",
        menuname: "",
        companyname: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const chargeNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="80%" height="1.5rem" />
        ) : (
            <span>{rowData.chargename}</span>
        );
    };

    const chargeValueBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.chargevalue ? rowData.chargevalue : "-"}</span>
        );
    };

    const menuNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.menuname ? rowData.menuname : "-"}</span>
        );
    };

    const companyNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.companyname ? rowData.companyname : "-"}</span>
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
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Charge List</div>

                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/charge-master");
                    }}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card">
                <DataTable
                    ref={dt}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : chargeList}
                    paginator
                    header={header}
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    dataKey="chargeid"
                    tableStyle={{ minWidth: "50rem" }}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    rowClassName={() => "custom-row-class"}
                    removableSort
                    filters={filters}
                    filterDisplay="menu"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    globalFilterFields={["chargename", "chargevalue", "menuname", "companyname"]}
                    emptyMessage="No charges found."
                    stateStorage="session"
                    stateKey="ChargeList"
                    onFilter={(e) => {
                        setFilters(e.filters);
                    }}
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                    selection={selectedCharge}
                    onSelectionChange={(e) => setSelectedCharge(e.value)}
                >
                    <Column
                        selectionMode="multiple"
                        headerStyle={{ width: "3rem" }}
                        
                    ></Column>

                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minWidth: "6rem", textAlign: "left" }}
                    />
                    {visibleFields.some((col) => col.field === "chargename") && (
                        <Column
                            field="chargename"
                            header="Charge Name"
                            style={{ minWidth: "17rem", maxWidth: "17rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={chargeNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}

                    {visibleFields.some((col) => col.field === "chargevalue") && (
                        <Column
                            field="chargevalue"
                            header="Charge Value"
                            style={{ minWidth: "13rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={chargeValueBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}

                    {visibleFields.some((col) => col.field === "menuname") && (
                        <Column
                            field="menuname"
                            header="Menu"
                            style={{ minWidth: "10rem", maxWidth: "10rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={menuNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}

                    {visibleFields.some((col) => col.field === "companyname") && (
                        <Column
                            field="companyname"
                            header="Company Value"
                            style={{ minWidth: "12rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={companyNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="Created By"
                            style={{ minWidth: "15rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => (!rowData.createdby ? "-" : rowData.createdby)}
                            body={createdByBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}

                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="Created Date"
                            style={{ minWidth: "15rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => (!rowData.createdby ? "-" : rowData.createddate)}
                            body={createdDateBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}

                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="Modified By"
                            style={{ minWidth: "12rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) => (!rowData.modifiedby ? "-" : rowData.modifiedby)}
                            body={modifiedByBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}

                    {visibleFields.some((col) => col.field === "modifieddate") && (
                        <Column
                            field="modifieddate"
                            header="Modified Date"
                            style={{ minWidth: "15rem" }}
                            headerStyle={{ textAlign: "center" }}
                            // body={(rowData) =>
                            //     !rowData.modifiedby ? "-" : rowData.modifieddate || "-"
                            // }
                            body={modifiedDateBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                        />
                    )}
                    <Column
                        header="Action"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{ width: "0%", textAlign: "center" }}
                        headerStyle={{ textAlign: "center" }}
                    ></Column>
                </DataTable>

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
                        {Charge && (
                            <span>
                                Are you sure you want to delete <b>{Charge.chargename}</b>?
                            </span>
                        )}

                        {selectedCharge?.length > 0 && (
                            <span>
                                Are you sure you want to delete the selected Modifier Categories?
                            </span>
                        )}
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default ChargeList;
