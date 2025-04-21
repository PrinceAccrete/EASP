import { Button } from 'primereact/button';
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import React, { useEffect, useRef, useState } from 'react'
import API from '../../../utils/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { FilterMatchMode } from 'primereact/api';
import { Skeleton } from 'primereact/skeleton';


const ModifierCategoryList = () => {

    let toast = useRef(null)
    const dt = useRef(null);

 
    let user = useSelector(state => state.auth)
    const [selectedModifierCategories, setSelectedModifierCategories] = useState([]);
    const [modifierCategoriesList, setModifierCategoriesList] = useState([]);
    const [deleteModifierCategoriesDialog, setDeleteModifierCategoriesDialog] = useState(false)
    const [modifierCategory, setModifierCategory] = useState(null)
    const navigate = useNavigate()


    const [globalFilter, setGlobalFilter] = useState('');
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");


    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(50);
    const [totalRecords, setTotalRecords] = useState(0);

    const [loading,setLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    const columnOptions = [
        { field: "modifiercategoryname", header: "Modifier Category Name" },
        { field: "minimumselection", header: "Minimum Selection" },
        { field: "maximumselection", header: "Maximum selection" },
        { field: "displayorder", header: "Display Order" },
        { field: "createdby", header: "Created By" },
        { field: "createddate", header: "Created Date" },
        { field: "modifiedby", header: "Modified By" },
        { field: "modifieddate", header: "Modified Date" },

    ];

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters["global"].value = value;

        setFilters(_filters);
        setGlobalFilter(value);
        setFirst(0);
    };

    const onColumnToggle = (event) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columnOptions?.filter((col) =>
            selectedColumns.some((sCol) => sCol.field === col.field)
        );

        setVisibleFields(orderedSelectedColumns);
    };

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const [visibleFields, setVisibleFields] = useState(
        columnOptions.filter(
            (col) => !["createdby", "createddate", "modifiedby", "modifieddate"].includes(col.field)
        )
    );

    const getModifierCategories = async ( start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = "") => {

        try {
            setIsInitialLoading(true)
            let response = await API.post(
                'modifier/getModifierCategoryList',
                { companyId: 5 },
                {
                    params: {
                        start: start,
                        length: length,
                        ...(search ? { search } : {}),
                        ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                    },
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setModifierCategoriesList(response.data.data.data)
            setTotalRecords(response.data.data.totalRecords)

        } catch (error) {
            console.log(error)
        } finally {
            setIsInitialLoading(false)
        }

    }
    const modifierCateogryNameBodyTemplate = (rowData, options) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />
        }
        return rowData.modifiercategoryname 

    }
    const minimumSelectBodyTemplate = (rowData, options) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />
        }

        return rowData.minimumselection

    }
    const maximumSelectionBodyTemplate = (rowData, options) => {
        if (isInitialLoading) {
            return <Skeleton width="70%" height="1.5rem" />
        }

        return rowData.maximumselection

    }
    const displayOrderBodyTemplate = (rowData, options) => {
        if (isInitialLoading) {
                return <Skeleton width="60%" height="2rem" />
        }


        return rowData.displayorder

    }
    const actionBodyTemplate = (rowData) => {
        if (isInitialLoading) {
            return (
                <div className='flex gap-2'>
                    <Skeleton shape="circle" size="3rem" />
                    <Skeleton shape="circle" size="3rem" />
                </div>
            );
        }
        return (
            <div className='flex gap-2'>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => {
                        navigate(`/modifier-category/edit/${rowData.modifiercategoryid}`)
                    }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    disabled={selectedModifierCategories.length > 0}
                    onClick={() => confirmDeleteModifierCategory(rowData)}
                />
            </div>
        );
    };

    const createdByBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.createdby ? rowData.createdby : "-"}</span>
            </div>
        );
    };

    const createdDateBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.createddate ? rowData.createddate : "-"}</span>
            </div>
        );
    };

    const modifiedByBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.modifiedby ? rowData.modifiedby : "-"}</span>
            </div>
        );
    };

    const modifiedDateBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                <span>{rowData.modifieddate ? rowData.modifieddate : "-"}</span>
            </div>
        );
    };

    const confirmDeleteModifierCategory = (data) => {

        console.log(data)
        setModifierCategory(data)
        setDeleteModifierCategoriesDialog(true)
    }
    const hideDeleteModifierCateogryDialog = () => {
        setDeleteModifierCategoriesDialog(false)
    }
    const deleteModifierCategory = async (selectedModifierCategoriesList) => {
        if (selectedModifierCategoriesList.length > 0) {

            setLoading(true)

            let modifierCategorryIds = []

            for (let i = 0; i < selectedModifierCategoriesList.length; i++) {
                modifierCategorryIds.push(selectedModifierCategoriesList[i].modifiercategoryid)
            }

            try {

                const response = await API.post("modifier/deleteModifierCategory", { modifierCategoryId: modifierCategorryIds }, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });



                if (response.data.success) {
                    toast.current.show({ severity: 'success', detail: response.data.msg, life: 3000 });
                    getModifierCategories(first, rows)
                    setSelectedModifierCategories([])
                    setDeleteModifierCategoriesDialog(false)
                    setModifierCategory(null)
                }

            } catch (error) {
                console.log(error)
                toast.current.show({ severity: 'error',detail: error?.response?.data.msg, life: 3000 });
            } finally {
                setLoading(false)
            }
        }




    }
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

                doc.autoTable(exportColumns, modifierCategoriesList);
                doc.save("modifierCategoriesList.pdf");
            });
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
    const exportExcel = () => {
        import("xlsx").then((xlsx) => {


            const filteredData = modifierCategoriesList.map((row) => {
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

            saveAsExcelFile(excelBuffer, "modifierCategories");
        });
    }

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
                    <div className="flex align-items-center justify-content-end gap-2">
                        <Button
                            className="export-icon-tooltip"
                            type="button"
                            icon="pi pi-file"
                            rounded
                            onClick={() => exportCSV(false)}
                            data-pr-tooltip="Export as CSV"
                            disabled={!modifierCategoriesList.length > 0}
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
                            disabled={!modifierCategoriesList.length > 0}
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
                                   disabled={!modifierCategoriesList.length > 0}
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

                    <MultiSelect
                        value={visibleFields}
                        options={columnOptions}
                        optionLabel="header"
                        onChange={onColumnToggle}
                        className="w-full sm:w-17rem"
                        display="chip"
                        placeholder="Visible Columns"
                    />

                    <Button
                        className={`${selectedModifierCategories.length > 0 ? 'bg-red-500' : 'bg-red-200'} text-white font-medium border-none outline-none rounded-full`}
                        icon="pi pi-trash"
                        label={`Delete (${selectedModifierCategories.length})`}
                        onClick={() => setDeleteModifierCategoriesDialog(true)}
                        disabled={selectedModifierCategories.length === 0}
                    />
                </div>
            </div>
        );
    };

    const deleteModifierDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" disabled={loading}     outlined onClick={hideDeleteModifierCateogryDialog} />
            <Button severity="danger" disabled={loading} onClick={() => {
                deleteModifierCategory(selectedModifierCategories.length > 0 ? selectedModifierCategories : [modifierCategory])
            }} >

{
                    !loading && <i className='pi pi-check mr-2'></i>
                }
                {loading ? (
                    <>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                        <span className="ml-2">Deleting...</span>
                    </>
                ) : (
                    "Yes"
                )}

            </Button>
        </React.Fragment>
    )
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
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


    useEffect(() => {
        const sessionState = sessionStorage.getItem("modifierCategoryList");
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
            const sessionState = sessionStorage.getItem("modifierCategoryList");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            getModifierCategories(
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
                <div className='font-bold'>Modifier Category List</div>
                <div className="p-1 border-round cursor-pointer">
                    <i onClick={() => navigate("/modifier-category")} className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className='card'>

                <DataTable
                    removableSort
                    lazy
                    header={header}
                    value={isInitialLoading ? Array.from({ length: rows }, () => ({
                        modifiercategoryname: "",
                        minimumselection: "",
                        maximumselection: "",
                        displayorder: "",
                        createdby: "",
                        createddate: "",
                        modifiedby: "",
                        modifieddate: "",
                        action: ""
                    })) : modifierCategoriesList}                    paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rowsPerPageOptions={[10, 25, 50,totalRecords]}
                    tableStyle={{ minWidth: '50rem' }}
                    sortMode="single" 
                    emptyMessage="No Modifiers found."
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    selection={selectedModifierCategories}
                    onSelectionChange={(e) => setSelectedModifierCategories(e.value)} 
                    ref={dt}
                    onPage={onPageChange}
                    filters={filters}
                    onFilter={(e) => {  
                        setFilters(e.filters)
                    }}
                    stateStorage="session"
                    stateKey="modifierCategoryList" 
                    onSort={onSortChange}
                    sortField={sortField}
                    sortOrder={sortOrder === "asc" ? 1 : -1}
                    
                >

                    {/* globalFilterFields={['modifiercategoryname', 'minimumselection', 'maximumselection', 'displayorder']} */}

                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column
                        header="Sr No."
                        body={(rowData, options) => options.rowIndex + 1}
                        style={{ minWidth: "5rem", textAlign: "center" }}
                    />

                    {visibleFields.some((col) => col.field === "modifiercategoryname") &&
                        <Column field="modifiercategoryname"  body={modifierCateogryNameBodyTemplate} header="Modifier Category" style={{ width: '25%' }} sortable ></Column>
                    }

                    {visibleFields.some((col) => col.field === "minimumselection") &&
                        <Column field='minimumselection' body={minimumSelectBodyTemplate} header="Minimum Selection" style={{ width: '25%' }} sortable ></Column>}

                    {visibleFields.some((col) => col.field === "maximumselection") &&
                        <Column field='maximumselection' body={maximumSelectionBodyTemplate} header="Maximum Selection" style={{ width: '25%' }} sortable ></Column>
                    }

                    {visibleFields.some((col) => col.field === "displayorder") &&
                        <Column field='displayorder'  displayorder='displayorder' body={displayOrderBodyTemplate} header="Display Order" style={{ width: '25%' }} ></Column>
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
                    <Column field="action" header="Action" style={{ width: '25%' }} body={actionBodyTemplate}      exportable={false} ></Column>
                </DataTable>

                <Dialog
                    visible={deleteModifierCategoriesDialog}
                    style={{ width: "32rem" }}
                    breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                    header="Confirm"
                    modal
                    footer={deleteModifierDialogFooter}
                    onHide={hideDeleteModifierCateogryDialog}
                    draggable={false}>

                    <div className="confirmation-content flex  items-center">
                        <i
                            className="pi pi-exclamation-triangle mr-3"
                            style={{ fontSize: "2rem" }}
                        />
                        
                        {modifierCategory && (
                            <span>
                                Are you sure you want to delete Modifier <b>{modifierCategory.modifiercategoryname}</b>?
                            </span>
                        )}

                        {
                            selectedModifierCategories?.length > 0 && (
                                <span>
                                    Are you sure you want to delete the selected Modifier Categories?
                                </span>
                            )
                        }
                    </div>

                </Dialog>


            </div>
        </div>
    )
}

export default ModifierCategoryList
