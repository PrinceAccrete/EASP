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
import "jspdf-autotable";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";

const ProductModifiersMappingList = () => {
    let emptyBrand = {
        id: null,
        name: "",
    };
    const token = useSelector((state) => state.auth.token);
    const toast = useRef(null);

    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const dt = useRef(null);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [ModifiersMappingList, setModifiersMappingList] = useState([]);
    const [selectedModifier, setSelectedModifier] = useState([]);
    const [deleteBrandsDialog, setDeleteBrandsDialog] = useState(false);
    const [Modifier, setModifier] = useState(null);

    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        productcategoryname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        productname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        portionname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        modifiername: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        modifiercategoryname: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const columnOptions = [
        { field: "productcategoryname", header: "Product Category" },
        { field: "productname", header: "Product" },
        { field: "portionname", header: "Portion " },
        { field: "modifiername", header: "Modifier " },
        { field: "modifiercategoryname", header: "Modifier Category " },
        { field: "isdefault", header: "Default " },
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
                    ModifiersMappingList.map((row) =>
                        exportColumns.map((col) => row[col.dataKey] ?? "")
                    )
                );
                const fileName = "ModifierMapping_List" + new Date().getTime() + ".pdf";

                doc.save(fileName);
                fileExportMessage();
            });
        });
    };

    const exportXLS = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = ModifiersMappingList.map((row) => {
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

            saveAsExcelFile(excelBuffer, "ModifierMapping_List");
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

    const fetchModifierList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${BASE_URL}/modifier/getProductModifierList`,
                { companyId: 5 },
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
            // console.log("API Response:", response?.data.data.data);
            if (response.data.success === 1) {
                setModifiersMappingList(response.data.data.data);
                setTotalRecords(response.data.data.totalRecords);
            }
        } catch (error) {
            console.log("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionState = sessionStorage.getItem("ModifierListState");
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
            const sessionState = sessionStorage.getItem("ModifierListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            fetchModifierList(
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
    };

    const handleDeleteProduct = async (selectedModifierList) => {
        if (selectedModifierList.length > 0) {
            let ModifierIds = [];

            for (let i = 0; i < selectedModifierList.length; i++) {
                ModifierIds.push(selectedModifierList[i].productmodifierid);
            }

            try {
                const response = await axios.post(
                    `${BASE_URL}/modifier/deleteProductModifier`,
                    { productModifierId: ModifierIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success === 1) {
                    toast.current.show({
                        severity: "success",
                        detail: "Product Modifier(s) deleted successfully",
                        life: 3000,
                    });

                    const sessionState = sessionStorage.getItem("ModifierListState");
                    let parsed = sessionState ? JSON.parse(sessionState) : {};

                    const search = parsed.filters?.global?.value || "";
                    const field = parsed.sortField || "";
                    const order =
                        parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

                    fetchModifierList(
                        first,
                        rows,
                        globalFilterValue || search,
                        sortField || field,
                        sortOrder || order
                    );
                    setSelectedModifier([]);
                    setDeleteBrandsDialog(false);
                    setModifier(null);
                } else {
                    console.error("Delete API failed:", response.data);
                }
            } catch (error) {
                console.error("Error in Delete Brand:", error);
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
                <div className="flex">
                    {loading ? (
                        <>
                            <div className="flex">
                                <Skeleton shape="circle" size="3rem" />
                            </div>
                        </>
                    ) : (
                        <>
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                disabled={selectedModifier.length > 0}
                                onClick={() => confirmDeleteBrand(rowData)}
                            />
                        </>
                    )}
                </div>
            </>
        );
    };

    const editBrand = (rowData) => {
        navigate(`/product-brand/${rowData.brandid}`);
        // alert(`Edit clicked for ${rowData.portion}`);
    };

    const confirmDeleteBrand = (data) => {
        setModifier(data);
        setDeleteBrandsDialog(true);
    };

    const hideDeleteBrandDialog = () => {
        setDeleteBrandsDialog(false);
    };

    // const deleteBrand = async () => {
    //     try {
    //         await handleDeleteBrand(.productModifierId);
    //         setDeleteBrandsDialog(false);
    //         setSelectedModifier(emptyBrand);
    //         // fetchModifierList();
    //         toast.current.show({
    //             severity: "success",
    //             summary: "Successful",
    //             detail: "Modifier Deleted",
    //             life: 3000,
    //         });
    //     } catch (error) {
    //         console.error("Error deleting Brand:", error);
    //     }
    // };

    const deleteBrandDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteBrandDialog} />
            <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                onClick={() =>
                    handleDeleteProduct(selectedModifier.length > 0 ? selectedModifier : [Modifier])
                }
            />
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
                        // disabled={loading}
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
                    <Button
                        className={`${
                            selectedModifier.length > 0 ? "bg-red-500" : "bg-red-200"
                        } text-white font-medium border-none outline-none rounded-full`}
                        icon="pi pi-trash"
                        label={`Delete (${selectedModifier.length})`}
                        onClick={() => setDeleteBrandsDialog(true)}
                        disabled={loading}
                    />
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const blankRow = {
        productcategoryname: "",
        productname: "",
        portionname: "",
        modifiername: "",
        modifiercategoryname: "",
        isdefault: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
    };

    const productCategoryNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="80%" height="1.5rem" />
        ) : (
            <span>{rowData.productcategoryname}</span>
        );
    };

    const productNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.productname ? rowData.productname : "Not Specified"}</span>
        );
    };

    const portionNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.portionname ? rowData.portionname : "Not Specified"}</span>
        );
    };

    const modifierNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>{rowData.modifiername ? rowData.modifiername : "Not Specified"}</span>
        );
    };

    const modifierCategoryNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="70%" height="1.5rem" />
        ) : (
            <span>
                {rowData.modifiercategoryname ? rowData.modifiercategoryname : "Not Specified"}
            </span>
        );
    };

    const isDeaultBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="40%" height="1.5rem" />
        ) : (
            <span>{rowData.isdefault ? "Yes" : "No"}</span>
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
                    rowData.createdby
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
                <div>Product Modifiers Mapping List</div>
                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/product-modifiers-mapping");
                    }}
                >
                    <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card p-4">
                <DataTable
                    ref={dt}
                    // value={ModifiersMappingList}
                    value={
                        loading
                            ? Array.from({ length: rows }, () => blankRow)
                            : ModifiersMappingList
                    }
                    paginator
                    header={header}
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPage={onPageChange}
                    dataKey="productmodifierid"
                    tableStyle={{ minWidth: "50rem" }}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    // dataKey="brandid"
                    rowClassName={() => "custom-row-class"}
                    // globalFilter={globalFilterValue}
                    removableSort
                    filters={filters}
                    filterDisplay="menu"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    globalFilterFields={[
                        "productcategoryname",
                        "productname",
                        "portionname",
                        "modifiername",
                        "modifiercategoryname",
                        "isdefault",
                    ]}
                    emptyMessage="No brands found."
                    onSort={onSortChange}
                    sortField={sortField}
                    stateStorage="session"
                    stateKey="ModifierListState"
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                    onFilter={(e) => {
                        setFilters(e.filters);
                    }}
                    // tableStyle={{ minWidth: "50rem" }}
                    selection={selectedModifier}
                    onSelectionChange={(e) => setSelectedModifier(e.value)}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>

                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minWidth: "5rem", textAlign: "center" }}
                    />
                    {visibleFields.some((col) => col.field === "productcategoryname") && (
                        <Column
                            field="productcategoryname"
                            header="Product Category"
                            style={{ minWidth: "15rem" }}
                            body={productCategoryNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "productname") && (
                        <Column
                            field="productname"
                            header="Product"
                            style={{ minWidth: "11rem" }}
                            body={productNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "portionname") && (
                        <Column
                            field="portionname"
                            header="Portion"
                            style={{ minWidth: "11rem" }}
                            body={portionNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifiername") && (
                        <Column
                            field="modifiername"
                            header="Modifier"
                            style={{ minWidth: "11rem" }}
                            body={modifierNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "modifiercategoryname") && (
                        <Column
                            field="modifiercategoryname"
                            header="Modifier Category"
                            style={{ minWidth: "15rem" }}
                            body={modifierCategoryNameBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
                        ></Column>
                    )}

                    {visibleFields.some((col) => col.field === "isdefault") && (
                        <Column
                            field="isdefault"
                            header="Default"
                            style={{ minWidth: "11rem" }}
                            body={isDeaultBodyTemplate}
                            sortableDisabled={loading}
                            sortable
                            // filter
                            // filterPlaceholder="Search by brand"
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
                            // body={(rowdata)=>(!rowdata.modifiedby ? "-":rowdata.modifiedby)}
                            body={modifiedByBodyTemplate}
                            sortableDisabled={loading}
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
                        {Modifier && (
                            <span>
                                Are you sure you want to delete <b>{Modifier.modifiername}</b>?
                            </span>
                        )}

                        {selectedModifier?.length > 0 && (
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

export default ProductModifiersMappingList;
