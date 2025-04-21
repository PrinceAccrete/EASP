import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/slice/AuthSlice";
import API from "../../../utils/axios";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";

function WebStoreList() {
    let emptyStore = {
        id: null,
        storename: "",
        locationname: "",
        cityname: "",
        posname: "",
        activestore: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };
    const toast = useRef(null);
    const dt = useRef(null);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("");
    const [storeDialog, setStoreDialog] = useState(false);
    const [sortOrder, setSortOrder] = useState("");
    const [storeList, setStoreList] = useState([]);
    const [store, setStore] = useState(null);
    console.log("store", store);
    const [storeId, setStoreId] = useState([]);
    const [selectedStore, setSelectedStore] = useState(emptyStore);
    const [deleteStoreDialog, setDeleteStoreDialog] = useState(false);
    const [deleteStoresDialog, setDeleteStoresDialog] = useState(false);
    const [first, setFirst] = useState(0); // Start index
    const [rows, setRows] = useState(50); // Page size
    const [totalRecords, setTotalRecords] = useState(0);
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(false);
    const [selectedStores, setSelectedStores] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    console.log("selectedStore", selectedStore);
    // Total number of records (from API)
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const columnOptions = [
        { field: "storename", header: "Store Name" },
        { field: "locationname", header: "Location" },
        { field: "channelname", header: "Channel" },
        { field: "cityname", header: "City" },
        { field: "posname", header: "POS" },
        { field: "activestore", header: "Active" },
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
        console.log("sorting");
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
        // Fetch new chunk based on page and size
        // fetchProducts(event.first, event.rows, globalFilterValue, sortField, sortOrder);
    };
    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
    };
    const hideDeleteStoresDialog = () => {
        setIsDeleteDisabled(false);
    };
    const confirmDeleteStore = (store) => {
        setStore(store);
        setDeleteStoreDialog(true);
    };
    const booleanBodyTemplate = (rowData, column) => {
        const field = column.field;
        // const value = rowData[field];

        return rowData.activestore === 1 ? "Yes" : "No";
    };

    const hideDialog = () => {
        // setSubmitted(false);
        setStoreDialog(false);
    };
    const editStore = (rowData) => {
        navigate(`/web-store/${rowData.storeid}`);
    };
    const hideDeleteStoreDialog = () => {
        setDeleteStoreDialog(false);
    };
    const handleDeleteStore = async (selectedStores) => {
        // console.log(storeIds)
        if (selectedStores.length > 0) {
            // console.log("_stores" , _stores)
            let storeIds = [];
            for (let i = 0; i < selectedStores.length; i++) {
                storeIds.push(selectedStores[i].storeid);
            }

            try {
                const response = await API.post(
                    `/store/deleteStore`,
                    { storeId: storeIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.data.success) {
                    // console.log("response" , response)
                    // let _stores = storeList.filter((val) => val.storeid !== storeIds);
                    const sessionState = sessionStorage.getItem("storeListState");
                    let parsed = sessionState ? JSON.parse(sessionState) : {};

                    const search = parsed.filters?.global?.value || "";
                    const field = parsed.sortField || "";
                    const order =
                        parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";
                    // setStoreList(_stores);
                    await FetchAllStore(
                        first,
                        rows,
                        globalFilterValue || search,
                        sortField || field,
                        sortOrder || order
                    );
                    setDeleteStoreDialog(false);
                    setSelectedStore(emptyStore);
                    setSelectedStores([]);
                    setIsDeleteDisabled(false);
                    // setStore(null)
                    setDeleteStoreDialog(false);

                    toast.current.show({
                        severity: "success",
                        summary: "Successful",
                        detail: "Store Deleted",
                        life: 3000,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    // const deleteStore = async (selectedStores) => {

    //     if(selectedStores.length > 0){
    //         // console.log("_stores" , _stores)
    //     let storeIds = []
    //     for(let i = 0; i < selectedStores.length; i++){
    //         storeIds.push(selectedStores[i].storeid)
    //     }
    //     console.log("selected store for delete", storeIds)
    //     try {
    //         // setStoreId(selectedStore.storeid)
    //          handleDeleteStore(storeIds)
    //         // setStoreList(_stores);
    //         setDeleteStoreDialog(false);
    //         setSelectedStore(emptyStore);
    //         setSelectedStores([])
    //         setIsDeleteDisabled(false)
    //         // setStore(null)
    //         setDeleteStoreDialog(false)

    //         toast.current.show({
    //             severity: "success",
    //             summary: "Successful",
    //             detail: "Store Deleted",
    //             life: 3000,
    //         });
    //     } catch (error) {
    //         console.log(error)
    //     }
    //     };
    // }

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
                                onClick={() => editStore(rowData)}
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                className="p-0 text-xs"
                                style={{ fontSize: "0.7rem", width: "2.5rem", height: "2.5rem" }}
                                onClick={() => {
                                    confirmDeleteStore(rowData);
                                }}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };

    const FetchAllStore = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        console.log("fetching data");
        setLoading(true);
        try {
            const response = await API.post(
                `/store/listStore`,
                { companyId: 5 },
                {
                    params: {
                        start: start,
                        length: length,
                        ...(search ? { search } : {}),
                        ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                    },
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (response.data) {
                console.log(response.data.data.data);
                console.log("totalRecords", response.data.data.totalRecords);
                setTotalRecords(response.data.data.totalRecords || 0);
                setStoreList(response.data.data.data);
                // Handle the store data here
                // You might want to set it to a state variable
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
    useEffect(() => {
        const sessionState = sessionStorage.getItem("storeListState");
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
            const sessionState = sessionStorage.getItem("storeListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            FetchAllStore(
                first,
                rows,
                globalFilterValue || search,
                sortField || field,
                sortOrder || order
            );
        }, 500); // debounce delay in ms

        return () => clearTimeout(delayDebounce);
    }, [first, rows, filters, globalFilterValue, sortField, sortOrder, token]);
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
                        <Button
                            className={`${
                                selectedStores.length > 0 ? "bg-red-500" : "bg-red-200"
                            } text-white font-medium border-none outline-none rounded-full`}
                            icon="pi pi-trash"
                            label={`Delete (${selectedStores.length})`}
                            onClick={() => setIsDeleteDisabled(true)}
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
                    store.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                doc.save("store.pdf");
                fileExportMessage();
            });
        });
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = store.map((row) => {
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

            saveAsExcelFile(excelBuffer, "store");
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

    const deleteStoreDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteStoreDialog} />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={() => handleDeleteStore([store])}
            />
        </>
    );
    const deleteStoresDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteStoresDialog} />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={() => handleDeleteStore(selectedStores)}
            />
        </React.Fragment>
    );

    const blankRow = {
        storename: "",
        locationname: "",
        channelname: "",
        cityname: "",
        posname: "",
        activestore: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const storeNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="3rem" height="1.5rem" />
        ) : (
            <span>{rowData.storename ? rowData.storename : "Not Specified"}</span>
        );
    };

    const locationBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="40%" height="1.5rem" />
        ) : (
            <span>{rowData.locationname ? rowData.locationname : "Not Specified"}</span>
        );
    };

    const channelBodyTemplate = (rowData) => {
       return loading ? (
            <Skeleton width="40%" height="1.5rem" />
        ) : (
            <span>{rowData.channelname ? rowData.channelname : "Not Specified"}</span>
        );
    };

    const cityBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="40%" height="1.5rem" />
        ) : (
            <span>{rowData.cityname ? rowData.cityname : "Not Specified"}</span>
        );
    };

    const posBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="40%" height="1.5rem" />
        ) : (
            <span>{rowData.posname ? rowData.posname : "Not Specified"}</span>
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

    const header = renderHeader();
    return (
        <>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Store List</div>
                <div className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer">
                    <i
                        className="pi pi-plus"
                        style={{ fontSize: "1.3rem" }}
                        onClick={() => {
                            navigate("/web-store");
                        }}
                    />
                </div>
            </div>
            <div className="card">
                <DataTable
                    ref={dt}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : storeList}
                    paginator
                    header={header}
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    // scrollable scrollHeight="295px"
                    rowClassName={() => "custom-row-class"}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    dataKey="storeid"
                    filters={filters}
                    filterDisplay="menu"
                    globalFilterFields={[
                        "storename",
                        "locationname",
                        "channelname",
                        "cityname",
                        "posname",
                        "activestore",
                        "createdby",
                        "createddate",
                        "modifiedby",
                        "modifieddate",
                    ]}
                    emptyMessage="No products found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    removableSort
                    stateStorage="session"
                    stateKey="storeListState"
                    selection={selectedStores}
                    onSelectionChange={(e) => setSelectedStores(e.value)}
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
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                    <Column
                        header="Sr No."
                        body={(rowData, options) =>
                            loading ? (
                                <Skeleton
                                    width="30%"
                                    height="1.5rem"
                                    style={{ textAlign: "center" }}
                                />
                            ) : (
                                options.rowIndex + 1
                            )
                        }
                        style={{ minWidth: "5rem", textAlign: "center" }}
                    />
                    {visibleFields.some((col) => col.field === "storename") && (
                        <Column
                            field="storename"
                            header="Store Name"
                            sortable
                            // filter
                            filterPlaceholder="Search by name"
                            style={{ minWidth: "13rem" }}
                            body={storeNameBodyTemplate}
                            sortableDisabled={loading}
                        />
                    )}

                    {visibleFields.some((col) => col.field === "locationname") && (
                        <Column
                            field="locationname"
                            header="Location"
                            sortable
                            filterField="Location"
                            style={{ minWidth: "15rem" }}
                            body={locationBodyTemplate}
                            // filter
                            filterPlaceholder="Search by Location"
                            sortableDisabled={loading}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "channelname") && (
                        <Column
                            field="channelname"
                            header="Channel"
                            sortable
                            filterField="Channel"
                            style={{ minWidth: "15rem" }}
                            body={channelBodyTemplate}
                            // filter
                            filterPlaceholder="Search by Channel"
                            sortableDisabled={loading}
                        />
                    )}

                    {visibleFields.some((col) => col.field === "cityname") && (
                        <Column
                            field="cityname"
                            header="City"
                            sortable
                            filterMenuStyle={{ width: "14rem" }}
                            style={{ minWidth: "13rem" }}
                            body={cityBodyTemplate}
                            // filter
                            sortableDisabled={loading}
                            // filterElement={cityFilterTemplate}
                        />
                    )}
                    {visibleFields.some((col) => col.field === "posname") && (
                        <Column
                            field="posname"
                            header="POS"
                            sortable
                            filterMenuStyle={{ width: "14rem" }}
                            style={{ minWidth: "13rem" }}
                            body={posBodyTemplate}
                            // filter
                            sortableDisabled={loading}
                            // filterElement={cityFilterTemplate}
                        />
                    )}

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="Created By"
                            sortable
                            filterField="createdby"
                            style={{ minWidth: "12rem" }}
                            body={createdByBodyTemplate}
                            filter
                            sortableDisabled={loading}
                            filterPlaceholder="Search by Created By"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "createddate") && (
                        <Column
                            field="createddate"
                            header="Created Date"
                            sortable
                            filterField="createddate"
                            style={{ minWidth: "15rem" }}
                            body={createdDateBodyTemplate}
                            filter
                            sortableDisabled={loading}
                            filterPlaceholder="Search by Created Date"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "modifiedby") && (
                        <Column
                            field="modifiedby"
                            header="Modified By"
                            sortable
                            filterField="modifiedby"
                            style={{ minWidth: "12rem" }}
                            body={modifiedByBodyTemplate}
                            filter
                            sortableDisabled={loading}
                            filterPlaceholder="Search by Modified By"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "modifieddate") && (
                        <Column
                            field="modifieddate"
                            header="Modified Date"
                            sortable
                            filterField="modifieddate"
                            style={{ minWidth: "15rem" }}
                            body={modifiedDateBodyTemplate}
                            filter
                            sortableDisabled={loading}
                            filterPlaceholder="Search by Modified Date"
                        />
                    )}
                    {visibleFields.some((col) => col.field === "activestore") && (
                        <Column
                            field="activestore"
                            header="Active"
                            // sortable
                            // filter
                            // filterPlaceholder="Search by name"
                            body={(rowData) => booleanBodyTemplate(rowData, { field: "Active" })}
                            style={{ minWidth: "8rem", textAlign: "center" }}
                            sortableDisabled={loading}
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
                    visible={deleteStoreDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteStoreDialogFooter}
                    onHide={hideDeleteStoreDialog}
                    draggable={false}
                >
                    <div className="confirmation-content">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {store && (
                            <span>
                                Are you sure you want to delete <b>{store.storename}</b>?
                            </span>
                        )}
                    </div>
                </Dialog>
                <Dialog
                    visible={isDeleteDisabled}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteStoresDialogFooter}
                    onHide={hideDeleteStoresDialog}
                    draggable={false}
                >
                    <div className="confirmation-content flex  items-center">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />

                        {selectedStores.length > 0 ? (
                            <span>
                                Are you sure you want to delete {selectedStores.length} store(s)?
                            </span>
                        ) : (
                            <span>Please select at least one store to delete.</span>
                        )}
                    </div>
                </Dialog>
            </div>
        </>
    );
}

export default WebStoreList;
