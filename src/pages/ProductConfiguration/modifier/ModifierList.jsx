import { Column } from 'jspdf-autotable'
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable'
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import API from '../../../utils/axios';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Skeleton } from 'primereact/skeleton';

const ModifierList = () => {

    let toast = useRef(null)
    const dt = useRef(null);

    let user = useSelector(state => state.auth)
    const [modifierList, setModifierList] = useState([])
    const [modifier, setModifier] = useState(null)
    const [deleteModifierDialog, setDeleteModifierDialog] = useState(false)
    const [selectedModifiers, setSelectedModifiers] = useState([]);

    const [globalFilter, setGlobalFilter] = useState('');
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");

    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(50);
    const [totalRecords, setTotalRecords] = useState(0);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    const columnOptions = [
        { field: "modifiername", header: "Modifier Name" },
        { field: "foodtype", header: "Food Type" },
        { field: "price", header: "Offline Price" },
        { field: "isonline", header: "Is Online" },
        { field: "createdby", header: "Created By" },
        { field: "createddate", header: "Created Date" },
        { field: "modifiedby", header: "Modified By" },
        { field: "modifieddate", header: "Modified Date" },
    ];

    const blankRow = {
        modifiername:'',
        foodtype:'',
        price:0,
        isonline:false,
        createdby:'',
        createddate:'',
        modifiedby:'',
        modifieddate:''
    };



    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions?.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
    };

    const [visibleFields, setVisibleFields] = useState(
        columnOptions.filter(
            (col) => !["createdby", "createddate", "modifiedby", "modifieddate"].includes(col.field)
        )
    );


    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters["global"].value = value;

        setFilters(_filters);
        setGlobalFilter(value);
        setFirst(0);
    };

    const navigate = useNavigate()

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
                        className="w-full sm:w-17rem"
                        display="chip"
                        placeholder="Visible Columns"
                    />

                    <div className="flex align-items-center justify-content-end gap-2">
                        <Button
                            className="export-icon-tooltip"
                            type="button"
                            icon="pi pi-file"
                            rounded
                            onClick={() => exportCSV(false)}
                            disabled={!modifierList.length > 0}
                            data-pr-tooltip="Export as CSV"
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
                            disabled={!modifierList.length > 0}
                            data-pr-tooltip="Export as XLS"
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
                            disabled={!modifierList.length > 0}
                            data-pr-tooltip="Export as PDF"
                        // tooltip="Export as PDF"
                        // tooltipOptions={{ position: 'top'}}
                        />
                        <Tooltip
                            target=".export-icon-tooltip"
                            position="top"
                            style={{ fontSize: "12px" }}
                            showDelay={100}
                            hideDelay={100}
                        />
                    </div>
                    <Button
                        className={`${selectedModifiers.length > 0 ? 'bg-red-500' : 'bg-red-200'} text-white font-medium border-none outline-none rounded-full`}
                        icon="pi pi-trash"
                        label={`Delete (${selectedModifiers.length})`}
                        onClick={() => setDeleteModifierDialog(true)}
                    />
                </div>
            </div>
        );
    };


    const getModifierList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = "") => {    

        try {
            setIsInitialLoading(true)
            const response = await API.post("modifier/getModifierList", { companyId: 5 }, {
                params: {
                    start: start,
                    length: length,
                    ...(search ? { search } : {}),
                    ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                }
    
                ,
                headers: { Authorization: `Bearer ${user.token}` },
            });
            
            if(response.data.success){
                setModifierList(response.data.data.data)
                setTotalRecords(response.data.data.totalRecords)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsInitialLoading(false)
        }


    }

    const actionBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return (
                <div className="flex gap-2">
                    <Skeleton shape="circle" size="3rem" className="mr-2" />
                    <Skeleton shape="circle" size="3rem" />
                </div>
            );
        }
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => navigate(`/modifier/edit/${rowData.modifierid}`)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    disabled={selectedModifiers.length > 0}
                    onClick={() => confirmDeleteModifier(rowData)}
                />
            </div>
        );
    };

    const foodTypeBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }

        let foodType = rowData.foodtype;
        if (foodType === 1) {
            return <div>Vegetarian</div>;
        } else if (foodType === 2) {
            return <div>Non-Vegetarian</div>;
        } else if (foodType === 3) {
            return <div>Eggetarian</div>;
        } else {
            return <div>Not Specified</div>;
        }
    };

    const isOnlineBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return <div>{rowData.isonline ? "Yes" : "No"}</div>;
    };

    const parentModifierBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return <div>{rowData.parentmodifierid > 0 ? rowData.parentmodifierid : 0}</div>;
    };

    const priceBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return <span>{rowData.price ? rowData.price : "-"}</span>;
    };

    const createdByBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.createdby ? rowData.createdby : "-"}</span>
            </div>
        );
    };

    const createdDateBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.createddate ? rowData.createddate : "-"}</span>
            </div>
        );
    };

    const modifierNameBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return <span>{rowData.modifiername ? rowData.modifiername : "-"}</span>;
    };

    const modifiedByBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.modifiedby ? rowData.modifiedby : "-"}</span>
            </div>
        );
    };

    const modifiedDateBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />;
        }
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.modifieddate ? rowData.modifieddate : "-"}</span>
            </div>
        );
    };

    const confirmDeleteModifier = (modifier) => {
        setModifier(modifier);
        setDeleteModifierDialog(true);
    };

    const hideDeleteModifierDialog = () => {
        setDeleteModifierDialog(false);
    };

    const deleteModifier = async (selectedModifiers) => {

        if (selectedModifiers.length > 0) {

            let modifierIds = []

            for (let i = 0; i < selectedModifiers.length; i++) {
                modifierIds.push(selectedModifiers[i].modifierid)
            }

            try {

                setIsLoading(true)
                const response = await API.post("modifier/deleteModifier", { modifierId: modifierIds }, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });


                if (response.data.success) {
                    toast.current.show({ severity: 'success', detail: response.data.msg, life: 3000 });
                    getModifierList(first, rows)
                    setSelectedModifiers([])
                    setModifier(null)
                    setDeleteModifierDialog(false)
                }
            } catch (error) {
                console.log(error)
                toast.current.show({ severity: 'error', detail: error?.response?.data.msg, life: 3000 });
            } finally {
                setIsLoading(false)
            }
        }

    }

    const deleteModifierDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteModifierDialog} disabled={isLoading} />
            <Button severity="danger" onClick={() => deleteModifier(selectedModifiers.length > 0 ? selectedModifiers : [modifier])} disabled={isLoading} >
                {
                    !isLoading && <i className='pi pi-check mr-2'></i>
                }
                {isLoading ? (
                    <>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                        <span className="ml-2">Deleting...</span>
                    </>
                ) : (
                    "Yes"
                )}
            </Button>
        </React.Fragment>
    );


    const exportCSV = () => {
        if (dt.current) {
            dt.current.exportCSV({
                selectionOnly: false,
                columns: visibleFields.map((col) => ({
                    field: col.field,
                    header: col.header,
                })),
            });

        }
    };

    const exportColumns = visibleFields.map((col) => ({ title: col.header, dataKey: col.field }));

    const exportPdf = () => {
        import("jspdf").then((jsPDF) => {
            import("jspdf-autotable").then(() => {
                const doc = new jsPDF.default(0, 0);

                doc.autoTable(exportColumns, modifierList);
                doc.save("products.pdf");
            });
        });
    };
    const exportExcel = () => {
        import("xlsx").then((xlsx) => {

            const filteredData = modifierList.map((row) => {
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

    const onSortChange = (e) => {
        const { sortField, sortOrder } = e;

        setFirst(0);

        if (!sortField || sortOrder == null) {
            setSortField("");
            setSortOrder("");
        } else {
            setSortField(sortField);
            setSortOrder(sortOrder === 1 ? "asc" : "desc");
        }

    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    useEffect(() => {
        const sessionState = sessionStorage.getItem("modifierListState");
        if (sessionState) {
            const parsed = JSON.parse(sessionState);

            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            setSortField(field);
            setSortOrder(order);
        }
    }, []);

    useEffect(() => {

        if (!user?.token) return;

        const delayDebounce = setTimeout(() => {
            const sessionState = sessionStorage.getItem("modifierListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};
            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            getModifierList(
                first,
                rows,
                globalFilter || search,
                sortField || field,
                sortOrder || order
            );
        }, 500);

        return () => clearTimeout(delayDebounce);


    }, [first, rows, globalFilter, sortField, sortOrder, user?.token]);

    const header = renderHeader();


    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className='font-bold'>Modifier List</div>
                <div className="p-1 border-round cursor-pointer">
                    <i onClick={() => navigate("/modifier")} className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className='card'>
                <DataTable
             tableStyle={{ minWidth: '50rem' }}
                    removableSort
                    header={header}
                    value={isInitialLoading ? Array.from({ length: rows }, () => ({
                        modifiername: "",
                        foodtype: "",
                        price: 0,
                        isonline: false,
                        createdby: "",
                        createddate: "",
                        modifiedby: "",
                        modifieddate: "",
                        action: ""
                    })) : modifierList}
                    paginator
                    lazy
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50, totalRecords]}
                    // tableStyle={{ minWidth: '50rem' }}
                    sortMode="single" emptyMessage="No Modifiers found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    selection={selectedModifiers}
                    onSelectionChange={(e) => setSelectedModifiers(e.value)}
                    ref={dt}
                    onPage={onPageChange}
                    filters={filters}
                    onFilter={(e) => {
                        setFilters(e.filters)
                    }}
                    stateStorage="session"
                    stateKey="modifierListState"
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                >

                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>


                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minWidth: "5rem", textAlign: "center" }}
                    />


                    {visibleFields.some((col) => col.field === "modifiername") &&
                        <Column field="modifiername" header="Modifier Name" style={{ width: '25%' }} body={modifierNameBodyTemplate} sortable ></Column>
                    }
                    {visibleFields.some((col) => col.field === "price") &&
                        <Column field="price" header="Offline Price" body={priceBodyTemplate} style={{ width: '25%' }} sortable></Column>
                    }
                    {visibleFields.some((col) => col.field === "foodtype") &&
                        <Column field="foodtype" body={foodTypeBodyTemplate} header="Food Type" style={{ width: '25%' }}></Column>
                    }

                    {visibleFields.some((col) => col.field === "isonline") &&
                        <Column field="isonline" header="Is Online Modifier" body={isOnlineBodyTemplate} style={{ width: '25%' }} ></Column>
                    }
                    {visibleFields.some((col) => col.field === "parentmodifier") &&
                        <Column field="parentmodifier" body={parentModifierBodyTemplate} header="Parent Modifier" style={{ width: '25%' }} ></Column>
                    }

                    {visibleFields.some((col) => col.field === "createdby") && (
                        <Column
                            field="createdby"
                            header="Created By"
                            sortable
                            filterField="createdby"
                            style={{ minWidth: "12rem" }}
                            body={createdByBodyTemplate}
                            filter
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
                            filterPlaceholder="Search by Modified Date"
                        />
                    )}
                    <Column field="action" header="Action" style={{ width: '25%' }} body={actionBodyTemplate} exportable={false} ></Column>
                </DataTable>

                {/* <Dialog
                    visible={deleteModifierDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteModifierDialogFooter}
                    onHide={hideDeleteModifierDialog}
                    draggable={false}>

                    <div className="confirmation-content flex  items-center">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {modifier && (
                            <span>
                                Are you sure you want to delete Modifier <b>{modifier.modifiername}</b>?
                            </span>
                        )}
                    </div>

                </Dialog> */}

                {/* <Dialog
                    visible={isDeleteDisabled}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteModifiersDialogFooter}
                    onHide={hideDeleteModifiersDialog}
                    draggable={false}>

                    <div className="confirmation-content flex  items-center">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />

                        {
                            selectedModifiers.length > 0 ? (
                                <span>
                                    Are you sure you want to delete {selectedModifiers.length} modifier(s)?
                                </span>
                            ) : (
                                <span>Please select at least one modifier to delete.</span>
                            )
                        }

                    </div>

                </Dialog> */}


                <Dialog
                    visible={deleteModifierDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteModifierDialogFooter}
                    onHide={hideDeleteModifierDialog}
                    draggable={false}>

                    <div className="confirmation-content flex  items-center">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        {modifier && (
                            <span>
                                Are you sure you want to delete Modifier <b>{modifier.modifiername}</b>?
                            </span>
                        )}

                        {
                            selectedModifiers?.length > 0 && (
                                <span>
                                    Are you sure you want to delete the selected Modifier?
                                </span>
                            )
                        }
                    </div>

                </Dialog>

            </div>
        </div>
    )
}

export default ModifierList
