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

// table imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import { CustomerService } from './service/CustomerService';
import { Skeleton } from "primereact/skeleton";

const TagList = () => {
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const dt = useRef(null);
    const navigate = useNavigate(); // Initialize useNavigate
    const [taglist, setTaglist] = useState([]);
    const [image, setimage] = useState();
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false); // State for delete confirmation dialog
    const [rowToDelete, setRowToDelete] = useState(null); // State to store the row to delete
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records (from API)
    const [first, setFirst] = useState(0); // Start index
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;
    const [rows, setRows] = useState(50); // Page size
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const toast = useRef(null); // Toast reference for notifications
    const [loading, setLoading] = useState(true);
    const [isdeleting, setIsDeleting] = useState(false); // State to manage loading state

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        tagname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const columnOptions = [
        { field: "tagname", header: "Tag Name" },
        { field: "tagImage", header: "Icons" },
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

    // funtions
    const token = useSelector((state) => state.auth.token);
    const fetchTagslist = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${BASE_URL}/productTag/getProductTagList?`,

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
                setTaglist(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
                setimage(response.data.data.data.tagImage);
            } else {
                console.error("Error fetching Tags list:", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch Tags list:", error);
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
        const sessionState = sessionStorage.getItem("TagList");
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
            const sessionState = sessionStorage.getItem("TagList");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchTagslist(
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
        //fetchCategoryList(event.first, event.rows);
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
                    taglist.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                doc.save("Tags List.pdf");
                fileExportMessage();
            });
        });
    };

    const exportExcel = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = taglist.map((row) => {
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

    const editTagList = (rowData) => {
        navigate(`/tags-master/${rowData.tid}`);
    };

    const confirmDeleteSubCategory = (rowData) => {
        setRowToDelete(rowData); // Set the row to delete
        setDeleteDialogVisible(true); // Show the confirmation dialog
    };

    const deletetag = async () => {
        setIsDeleting(true); // Set loading state to true
        try {
            const response = await axios.post(
                `${BASE_URL}/productTag/deleteProductTag`,
                { productTagId: [rowToDelete.tid] },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1) {
                setTaglist((prev) => prev.filter((item) => item.taglist !== rowToDelete.tid));
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Tag deleted successfully",
                    life: 3000,
                });
                fetchTagslist(first, rows); // Refresh the list after deletion
                // Reset loading state
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to delete Tags",
                    life: 3000,
                });
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
            setIsDeleting(false);
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
                                onClick={() => editTagList(rowData)}
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
                            onClick={() => exportCSV(false)}
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

    const tagnameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.tagname ? rowData.tagname : "Not Specified"}</span>
        );
    };
    // const productcategorynameBodyTemplate = (rowData) => {
    //   return loading ? (
    //     <Skeleton width="70%" height="1.5rem" />
    //   ) : (
    //     <span>
    //       {rowData.productcategoryname
    //         ? rowData.productcategoryname
    //         : "Not Specified"}
    //     </span>
    //   );
    // };

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
        tagname: "",
        tagImage: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const images = (rowData) => {
        return(

        <img
            src={rowData.tagImage}
            alt="imag not avilable"
            style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "contain",
                backgroundColor: "#f0f0f0",
            }}
        />
      )
    };

    const header = renderHeader();

    return (
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
                        <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDialog} />
                        <Button
                            label={isdeleting ? "Deleting" : "Yes"}
                            icon={isdeleting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                            severity="danger"
                            onClick={deletetag}
                            disabled={isdeleting}
                        />
                    </div>
                }
                onHide={hideDeleteDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle  mr-3" style={{ fontSize: "2rem" }} />
                    {rowToDelete && (
                        <span>
                            Are you sure you want to delete <b>{rowToDelete.tagname}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Tags List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => navigate("/tags-master")}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>
            <div className="card">
                <div>
                    <DataTable
                        first={first}
                        value={loading ? Array.from({ length: rows }, () => blankRow) : taglist}
                        ref={dt}
                        totalRecords={totalRecords}
                        header={header}
                        paginator
                        lazy
                        rows={rows}
                        rowClassName={() => "custom-row-class"}
                        rowsPerPageOptions={[10, 25, 50, totalRecords]}
                        tableStyle={{ minWidth: "50rem" }}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        globalFilter={globalFilterValue}
                        removableSort
                        filterDelay="manu"
                        filters={filters}
                        globalFilterFields={["tagnme"]}
                        emptyMessage="No Tags found."
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                        onPage={onPageChange}
                        dataKey="subcategoryid"
                        stateStorage="session"
                        stateKey="productSubListState"
                        onFilter={(e) => {
                            setFilters(e.filters);
                            // Optionally also update globalFilterValue separately
                            const globalVal = e.filters?.global?.value || "";
                            setGlobalFilterValue(globalVal);
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
                        {visibleFields.some((col) => col.field === "tagname") && (
                            <Column
                                header="Tags"
                                field="tagImage"
                                sortable
                                sortableDisabled={loading}
                                body={tagnameBodyTemplate}
                                style={{ minWidth: "11rem" }}
                            ></Column>
                        )}
                        {visibleFields.some((col) => col.field === "tagImage") && (
                            <Column
                                header="Icons"
                                sortable
                                body={images}
                                style={{ minWidth: "13rem" }}
                                sortableDisabled={loading}
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
                                style={{ minWidth: "13rem", textAlign: "center" }}
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
                </div>
            </div>
        </div>
    );
};

export default TagList;
