import React, { useEffect, useRef, useState } from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { data, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Skeleton } from "primereact/skeleton";
import axios from "axios";

const DeliveryChargeList = () => {
    let emptyDelivery = {
        id: null,
        name: "",
        location: "",
        deliveryradius: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };
    const [deliveryCharge, setDeliveryCharge] = useState([]);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState(50);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const toast = useRef(null);
    const dt = useRef(null);

    const [selectedDelivery, setselectedDelivery] = useState(emptyDelivery);
    const [deleteDelieveryDialog, setDeleteDeliveryDialog] = useState(false);
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(false);
    const [selectedDeliveryCharge, setSelectedDeliveryCharge] = useState([]);
    const [delivery, setdelivery] = useState(null);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        companyname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        locationname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        deliveryradius: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const columnOptions = [
        { field: "companyname", header: "Company" },
        { field: "locationname", header: "Location" },
        { field: "deliveryradius", header: "Delivery Radius" },
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
    );
    const exportColumns = visibleFields.map((col) => ({ title: col.header, dataKey: col.field }));

    const fetchDeliveryChargeList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/charge/getDeliveryChargeList`, {
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
            });

            if (response.data.success === 1) {
                setDeliveryCharge(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords || response.data.totalRecords || 0);
            } else {
                console.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching delivery charge list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionState = sessionStorage.getItem("deliveryChargeListState");
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
            const sessionState = sessionStorage.getItem("deliveryChargeListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchDeliveryChargeList(
                first,
                rows,
                globalFilterValue || search,
                sortField || field,
                sortOrder || order
            );
        }, 500); // debounce delay in ms

        return () => clearTimeout(delayDebounce);
    }, [first, rows, filters, globalFilterValue, sortField, sortOrder, token]);

    const editDeliveryChargeList = (rowData) => {
        navigate(`/deliveryChargeMaster/${rowData.deliverychargeid}`);
    };

    const handleDeleteDelivery = async (selectedDeliverys) => {
        if (selectedDeliverys.length > 0) {
            let deliveryIds = [];
            for (let i = 0; i < selectedDeliverys.length; i++) {
                deliveryIds.push(selectedDeliverys[i].deliverychargeid);
            }

            try {
                const response = await axios.post(
                    `${BASE_URL}/charge/deleteDeliveryCharge`,
                    { deliveryId: deliveryIds },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response?.data.success === 1) {
                    const sessionState = sessionStorage.getItem("portionListState");
                    let parsed = sessionState ? JSON.parse(sessionState) : {};

                    const search = parsed.filters?.global?.value || "";
                    const field = parsed.sortField || "";
                    const order =
                        parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";
                    await fetchDeliveryChargeList(
                        first,
                        rows,
                        globalFilterValue || search,
                        sortField || field,
                        sortOrder || order
                    );
                    setDeleteDeliveryDialog(false);
                    setselectedDelivery(emptyDelivery);
                    setSelectedDeliveryCharge([]);
                    setIsDeleteDisabled(false);
                    setdelivery(null);

                    // setDeleteDeliveryDialog(false)
                    toast.current.show({
                        severity: "success",
                        summary: "Successful",
                        detail: "Delivery Data Deleted",
                        life: 3000,
                    });
                }
            } catch (error) {
                console.error("Error in Delete Delivery:", error);
            }
        }
    };

    const confirmDeleteDelivery = (data) => {
        setdelivery(data);
        setDeleteDeliveryDialog(true);
    };

    const hideDeleteDeliveryDialog = () => {
        setDeleteDeliveryDialog(false);
    };

    const hideDeleteDeliveryDialogs = () => {
        setIsDeleteDisabled(false);
    };

    const deleteDeliveryDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDeliveryDialog} />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={() => handleDeleteDelivery([delivery])}
            />
        </>
    );

    const deleteDeliveryDialogsFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDeliveryDialogs} />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={() => handleDeleteDelivery(selectedDeliveryCharge)}
            />
        </>
    );

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
                    deliveryCharge.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                const fileName = "deliveryChargeList_export_" + new Date().getTime() + ".pdf";
                doc.save(fileName);

                fileExportMessage();
            });
        });
    };

    const exportXLS = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = deliveryCharge.map((row) => {
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

            saveAsExcelFile(excelBuffer, "Delivery Charge");
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
                                onClick={() => editDeliveryChargeList(rowData)}
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                className="p-0 text-xs"
                                style={{ fontSize: "0.7rem", width: "2.5rem", height: "2.5rem" }}
                                onClick={() => {
                                    confirmDeleteDelivery(rowData);
                                }}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };

    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
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
        // fetchDeliveryChargeList(event.first, event.rows);
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
                        />
                        <Button
                            className={`${
                                selectedDeliveryCharge.length > 0 ? "bg-red-500" : "bg-red-200"
                            } text-white font-medium border-none outline-none rounded-full`}
                            disabled={loading}
                            icon="pi pi-trash"
                            label={`Delete (${selectedDeliveryCharge.length})`}
                            onClick={() => setIsDeleteDisabled(true)}
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
        companyname: "",
        locationname: "",
        deliveryradius: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const companyNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="6rem" height="1.5rem" />
        ) : (
            <span>{rowData.companyname}</span>
        );
    };

    const locationBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="8rem" height="1.5rem" />
        ) : (
            <div className="flex align-items-center gap-2">
                <span>{rowData.locationname}</span>
            </div>
        );
    };

    const deliveryradiusBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center ">
                {loading ? (
                    <Skeleton shape="circle" size="2.5rem" />
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
                        {rowData.deliveryradius}
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
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Delivery Charge List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/deliveryChargeMaster");
                    }}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card p-4">
                <DataTable
                    ref={dt}
                    // value={deliveryCharge}
                    value={loading ? Array.from({ length: rows }, () => blankRow) : deliveryCharge}
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
                    selection={selectedDeliveryCharge}
                    onSelectionChange={(e) => setSelectedDeliveryCharge(e.value)}
                    dataKey="deliverychargeid"
                    // globalFilter={globalFilterValue}
                    removableSort
                    filters={filters}
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    filterDisplay="menu"
                    globalFilterFields={["companyname", "locationname", "deliveryradius"]}
                    emptyMessage="No data found."
                    stateStorage="session"
                    stateKey="deliveryChargelistState"
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                    onFilter={(e) => {
                        setFilters(e.filters);
                    }}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
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
                        style={{ width: "6rem" }}
                    />

                    {visibleFields.some((col) => col.field === "companyname") && (
                        <Column
                            field="companyname"
                            header="Company"
                            style={{ minWidth: "10rem" }}
                            sortable
                            body={companyNameBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "locationname") && (
                        <Column
                            field="locationname"
                            header="Location"
                            style={{ minWidth: "15rem" }}
                            sortable
                            body={locationBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "deliveryradius") && (
                        <Column
                            field="deliveryradius"
                            header="Delivery Radius"
                            style={{ minWidth: "10rem" }}
                            sortable
                            body={deliveryradiusBodyTemplate}
                            sortableDisabled={loading}
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="CreatedBy"
                            style={{ minWidth: "12rem" }}
                            sortable
                            body={createdByBodyTemplate}
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
                            sortableDisabled={loading}
                            body={modifiedDateBodyTemplate}
                        ></Column>
                    )}

                    <Column
                        body={actionBodyTemplate}
                        header="Action"
                        style={{ width: "8rem" }}
                    ></Column>
                </DataTable>

                <Dialog
                    visible={deleteDelieveryDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteDeliveryDialogFooter}
                    onHide={hideDeleteDeliveryDialog}
                    draggable={false}
                >
                    <div className="confirmation-content">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {delivery && (
                            <span>
                                Are you sure you want to delete <b>{delivery.companyname}</b>?
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
                    footer={deleteDeliveryDialogsFooter}
                    onHide={hideDeleteDeliveryDialogs}
                    draggable={false}
                >
                    <div className="confirmation-content flex  items-center">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />

                        {selectedDelivery.length > 0 ? (
                            <span>
                                Are you sure you want to delete {selectedDelivery.length} store(s)?
                            </span>
                        ) : (
                            <span>Please select at least one store to delete.</span>
                        )}
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default DeliveryChargeList;
