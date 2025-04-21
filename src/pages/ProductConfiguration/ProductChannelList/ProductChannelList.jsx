import React from "react";
import { useState, useEffect, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import axios from "axios";
import { IconField } from "primereact/iconfield";
import { Tooltip } from "primereact/tooltip";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "jspdf-autotable";
import { Toast } from "primereact/toast"; // Import Toast for notifications
import { Skeleton } from "primereact/skeleton";

// table imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import { CustomerService } from './service/CustomerService';
function ProductChannelList() {
    const token = useSelector((state) => state.auth.token);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const dt = useRef(null);
    const navigate = useNavigate(); // Initialize useNavigate
    const [channelList, setchannelList] = useState([]);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const toast = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    // State for dialog
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    const [companyList, setCompanyList] = useState([]);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);

    const [selectError, setSelectError] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    // Function to open dialog
    const openDialog = (channel) => {
        setSelectedChannel(channel);
        setShowDialog(true);
    };

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        channelname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        cgname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        inoutbound: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const columnOptions = [
        { field: "channelname", header: "Channel Name" },
        { field: "cgname", header: "Channel Group Name " },
        { field: "inoutbound", header: "In Out Bound" },
        { field: "createdby", header: "Created By" },
        { field: "createddate", header: "Created Date" },
        { field: "modifiedby", header: "Modified By" },
        { field: "modifieddate", header: "Modified Date" },
    ];

    const [visibleFields, setVisibleFields] = useState(
        columnOptions.filter(
            (col) =>
                col.field != "createddate" &&
                col.field != "createdby" &&
                col.field != "modifiedby" &&
                col.field != "modifieddate"
        )
    ); // Visible columns
    const exportColumns = visibleFields.map((col) => ({
        title: col.header,
        dataKey: col.field,
    }));

    const fetchChannelList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/channel/getChannelList?`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    start: start,
                    length: length,
                    ...(search ? { search } : {}),
                    ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                },
            });
            if (response.data.success === 1 && response.data.data.data) {
                setchannelList(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
            } else {
                console.error("Error fetching category list:", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch channel list:", error);
            const message = error?.response?.data?.msg || "";

            if (message.toLowerCase().includes("expired token")) {
                dispatch(logout());
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionState = sessionStorage.getItem("productChannelListState");
        if (sessionState) {
            const parsed = JSON.parse(sessionState);

            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            setSortField(field);
            setSortOrder(order);
        }
    }, []);

    useEffect(() => {
        if (!token) return;

        const delayDebounce = setTimeout(() => {
            const sessionState = sessionStorage.getItem("productChannelListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchChannelList(
                first,
                rows,
                globalFilterValue || search,
                sortField || field,
                sortOrder || order
            );
        }, 500); // 0.5 second delay

        return () => clearTimeout(delayDebounce);
    }, [first, rows, filters, globalFilterValue, sortField, sortOrder, token]);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
        // Fetch new chunk based on page and size
        // fetchChannelList(event.first, event.rows);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        if (!_filters["global"]) {
            _filters["global"] = { value: "" };
        }
        _filters.global.value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
        setFirst(0); // Reset to first page
        setLoading(true);
    };

    const onSortChange = (e) => {
        const { sortField, sortOrder } = e;

        setFirst(0); // Reset to first page
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
                const doc = new jsPDF.default(0, 0);

                doc.autoTable(
                    exportColumns,
                    channelList.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                doc.save("products.pdf");
                fileExportMessage();
            });
        });
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = channelList.map((row) => {
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

            saveAsExcelFile(excelBuffer, "products");
            fileExportMessage();
        });
    };

    useEffect(() => {
        if (showDialog) {
            document.body.style.overflow = "hidden"; // Disable background scroll
        } else {
            document.body.style.overflow = "auto"; // Enable scroll back
        }

        // Clean up when component unmounts
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showDialog]);

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

    const editChannel = (rowData) => {
        navigate(`/channel-master/${rowData.channelid}`);
    };

    const confirmDeleteSubCategory = (rowData) => {
        setRowToDelete(rowData); // Set the row to delete
        setDeleteDialogVisible(true); // Show the confirmation dialog
    };

    const deletechannelList = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/channel/deleteChannel/${rowToDelete.channelid}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1) {
                setchannelList((prev) =>
                    prev.filter((item) => item.channelList !== rowToDelete.channelid)
                );
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Channel-List deleted successfully",
                    life: 3000,
                });
                setIsDeleting(false);
                fetchChannelList(first, rows); // Fetch updated data after deletion
            }
        } catch (error) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response.data.msg || error.message,
                life: 3000,
            });
        } finally {
            setDeleteDialogVisible(false); // Hide the confirmation dialog
        }
    };

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false); // Hide the confirmation dialog
        setRowToDelete(null); // Clear the row to delete
    };

    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );
        setVisibleFields(orderedSelectedColumns);
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const filteredCompanies = companyList.filter((company) =>
        company.companyname.toLowerCase().includes(searchValue.toLowerCase())
    );

    const searchBodyTemplate = (
        <IconField iconPosition="left" className="w-full sm:w-auto">
            <InputIcon className="pi pi-search" />
            <InputText
                type="search"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Keyword Search"
                className="w-full sm:w-15rem"
            />
        </IconField>
    );

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
                                style={{
                                    fontSize: "0.7rem",
                                    width: "2.5rem",
                                    height: "2.5rem",
                                }}
                                onClick={() => editChannel(rowData)}
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                className="p-0 text-xs"
                                style={{
                                    fontSize: "0.7rem",
                                    width: "2.5rem",
                                    height: "2.5rem",
                                }}
                                onClick={() => confirmDeleteSubCategory(rowData)}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };

    const handleMappingSubmit = async () => {
        if (selectedCompanyIds.length === 0) {
            setSelectError("Please select at least one company.");
            return;
        }

        setSelectError(""); // Clear error if validation passes

        const payload = {
            channelId: selectedChannel?.channelid,
            companyId: selectedCompanyIds,
        };

        setIsAdding(true);

        try {
            const response = await axios.post(
                `${BASE_URL}/channel/channelComapanyMapping`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`, // if needed
                    },
                }
            );

            if (response.data.success) {
                toast.current.show({
                    severity: "success",
                    detail: "Company mapping successful!",
                    life: 3000,
                });
                hideDialog(); // Close modal
                setSelectedCompanyIds([]); // Reset selection
            } else {
                toast.current.show({
                    severity: "warn",
                    detail: "Mapping failed. Try again!",
                    life: 3000,
                });
            }
        } catch (error) {
            toast.current.show({
                severity: "error",
                detail: `Error: ${error.message}`,
                life: 3000,
            });
        }finally {
            setIsAdding(false);
        }
    };

    const hideDialog = () => {
    
        setShowDialog(false);
    };

    const ChannelDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button
            label={isAdding ? "Adding..." : "Add"}
            icon="pi pi-check"
            onClick={handleMappingSubmit}
            disabled={isAdding}
            loading={isAdding}
            autoFocus
        />
        </React.Fragment>
    );

    useEffect(() => {
        if (selectedChannel?.channelid) {
            fetchCompanyList(selectedChannel.channelid);
        }
    }, [selectedChannel]);

    const fetchCompanyList = async (channelId) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/company/getCompany?start=0&length=-1&channelId=${channelId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );
    
            if (response.data.success) {
                const companies = response.data.data;
                setCompanyList(companies);
    
              
                const associatedIds = companies
                    .filter((c) => c.isassociated === 1)
                    .map((c) => c.companyid);
                setSelectedCompanyIds(associatedIds);
            }
        } catch (err) {
            console.error("Failed to fetch company list:", err);
        }
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
                            //  tooltip="Export as CSV"
                            tooltipOptions={{ position: "top" }}
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
                            // tooltip="Export as XLS"
                            // tooltipOptions={{ position: 'top' }}
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
                            // tooltip="Export as PDF"
                            // tooltipOptions={{ position: 'top'}}
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
    const channelnameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span
                className="text-primary cursor-pointer font-medium"
                onClick={() => openDialog(rowData)}
                title="Click to view details"
            >
                {rowData.channelname ? rowData.channelname : "Not Specified"}
            </span>
        );
    };
    const cgnameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.cgname ? rowData.cgname : "Not Specified"}</span>
        );
    };
    const inoutboundBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.inoutbound ? rowData.inoutbound : "Not Specified"}</span>
        );
    };
    const createdbyBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.createdby ? rowData.createdby : "Not Specified"}</span>
        );
    };
    const createddateBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.createddate ? rowData.createddate : "Not Specified"}</span>
        );
    };
    const modifiedbyBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.modifiedby ? rowData.modifiedby : "Not Specified"}</span>
        );
    };
    const modifieddateBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.modifieddate ? rowData.modifieddate : "Not Specified"}</span>
        );
    };

    const blankRow = {
        channelname: "",
        cgname: "",
        inoutbound: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const header = renderHeader();

    return (
        <div>
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Channel List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => navigate("/channel-master")}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>
            <div>
                <Toast ref={toast} /> {/* Toast for notifications */}
                <Dialog
                    visible={deleteDialogVisible}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={
                        <div>
                            <Button
                                label="No"
                                icon="pi pi-times"
                                outlined
                                onClick={hideDeleteDialog}
                            />
                            <Button
                                label={isDeleting ? "Deleting..." : "Yes"}
                                icon={isDeleting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                                severity="danger"
                                onClick={deletechannelList}
                                disabled={isDeleting}
                            />
                        </div>
                    }
                    onHide={hideDeleteDialog}
                >
                    <div className="confirmation-content">
                        <i
                            className="pi pi-exclamation-triangle  mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {rowToDelete && (
                            <span>
                                Are you sure you want to delete <b>{rowToDelete.channelname}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>
            </div>
            <div className="card">
                <DataTable
                    first={first}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : channelList}
                    header={header}
                    ref={dt}
                    totalRecords={totalRecords}
                    paginator
                    lazy
                    rows={rows}
                    rowClassName={() => "custom-row-class"}
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    tableStyle={{ minWidth: "50rem" }}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    // globalFilter={globalFilterValue}
                    removableSort
                    filters={filters}
                    globalFilterFields={["channalname"]}
                    // globalFilterFields={["brandname", "productcategoryname", "subcategoryname", "displayorder"]}
                    emptyMessage="No Channel List found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    onPage={onPageChange}
                    dataKey="channelid"
                    stateStorage="session"
                    stateKey="productChannelListState"
                    onFilter={(e) => {
                        setFilters(e.filters);
                    }}
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                >
                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minwidth: "5rem", textAlign: "center" }}
                    ></Column>
                    {visibleFields.some((col) => col.field === "channelname") && (
                        <Column
                            field="channelname"
                            header="Channel Name"
                            sortable
                            sortableDisabled={loading}
                            body={channelnameBodyTemplate}
                            style={{ minWidth: "13rem" }}
                        ></Column>
                    )}
                    {visibleFields.some((col) => col.field === "cgname") && (
                        <Column
                            field="cgname"
                            header="Channel Group Name"
                            sortable
                            sortableDisabled={loading}
                            body={cgnameBodyTemplate}
                            style={{ minWidth: "18rem" }}
                        ></Column>
                    )}
                    {visibleFields.some((col) => col.field === "inoutbound") && (
                        <Column
                            field="inoutbound"
                            header="In Out Bound"
                            sortable
                            sortableDisabled={loading}
                            body={inoutboundBodyTemplate}
                            style={{ minWidth: "12rem" }}
                        ></Column>
                    )}
                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="Created By"
                            sortable
                            sortableDisabled={loading}
                            body={createdbyBodyTemplate}
                            style={{ minWidth: "12rem", textAlign: "center" }}
                        ></Column>
                    )}
                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="Created Date"
                            sortable
                            sortableDisabled={loading}
                            body={createddateBodyTemplate}
                            style={{ minWidth: "14rem", textAlign: "center" }}
                        ></Column>
                    )}
                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="Modified By"
                            sortable
                            sortableDisabled={loading}
                            style={{ minWidth: "12rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={modifiedbyBodyTemplate}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifieddate") && (
                        <Column
                            field="modifieddate"
                            header="Modified Date"
                            sortable
                            sortableDisabled={loading}
                            style={{ minWidth: "15rem" }}
                            headerStyle={{ textAlign: "center" }}
                            body={modifieddateBodyTemplate}
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
                <Dialog
                    header={`Channel Name - ${selectedChannel?.channelname}` || "Channel Details"}
                    visible={showDialog}
                    style={{ width: "60rem" }}
                    breakpoints={{
                        "960px": "75vw",
                        "641px": "90vw",
                        "480px": "95vw",
                    }}
                    contentStyle={{ height: "600px" }}
                    modal
                    className="card p-fluid product-dialogue"
                    footer={ChannelDialogFooter}
                    onHide={hideDialog}
                    draggable={false}
                    resizable={false}
                >
                    
                    {selectError && (
                        <small style={{ color: "red", marginTop: "0.5rem", display: "block" }}>
                            {selectError}
                        </small>
                    )}

                    <DataTable
                        header={searchBodyTemplate}
                        value={filteredCompanies}
                        selection={companyList.filter((c) =>
                            selectedCompanyIds.includes(c.companyid)
                        )}
                        onSelectionChange={(e) => {
                            const ids = e.value.map((c) => c.companyid);
                            setSelectedCompanyIds(ids);

                            if (ids.length > 0) {
                                setSelectError("");
                            }

                            console.log(ids);
                        }}
                        dataKey="companyid"
                        emptyMessage="No details available for this channel."
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[10, 25, 50]}
                    >
                        <Column
                            header="Sr No."
                            body={(rowData, options) => options.rowIndex + 1}
                            style={{ minWidth: "2rem" }}
                        />
                        <Column field="companyname" header="Company Name" />
                        <Column
                            // field="is_associated"
                            selectionMode="multiple"
                            headerStyle={{ width: "3rem" }}
                            bodyStyle={{ textAlign: "right" }}
                        ></Column>
                    </DataTable>

                </Dialog>
            </div>
        </div>
    );
}

export default ProductChannelList;
