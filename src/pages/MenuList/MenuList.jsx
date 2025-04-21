import { FilterMatchMode } from 'primereact/api'
import { Button } from 'primereact/button'
import { IconField } from 'primereact/iconfield'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Skeleton } from 'primereact/skeleton'
import { Toast } from 'primereact/toast'
import { Tooltip } from 'primereact/tooltip'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import "jspdf-autotable";
import { InputIcon } from 'primereact/inputicon'
import { DataTable } from 'primereact/datatable'
import { Column } from 'jspdf-autotable'
import { Dialog } from 'primereact/dialog'
import API from '../../utils/axios'

function MenuList() {
    let emptyMenu = {
        id: null,
        name: "",
    };
    const [first, setFirst] = useState(0); 
    const [loading, setLoading] = useState(false);
    const dt = useRef(null);
   const [isDeleteDisabled, setIsDeleteDisabled] = useState(false);
    const toast = useRef(null);// Start index
    const [rows, setRows] = useState(50); // Page size
    const [totalRecords, setTotalRecords] = useState(0); 
    const [menu, setMenu] = useState([]);
    const token = useSelector((state) => state.auth.token);
    const [selectedMenu, setSelectedMenu] = useState(emptyMenu);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [deleteMenusDialog, setDeleteMenusDialog] = useState(false);
    console.log("menus", menu)
    console.log("selectedMenus", selectedMenus)
    console.log("totalRecords", totalRecords)
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        // brandname: {
        //     operator: FilterOperator.AND,
        //     constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        // },

    });
    const columnOptions = [
        { field: "menuname", header: "MenuName" },
        { field: "locationname", header: "Location" },
        {field: "modifierprice", header: "Modifier Price"},
        { field: "companyname", header: "Company" },
        { field: "createdby", header: "Create By" },
        { field: "createddate", header: "Created Date" },
        { field: "modifiedby", header: "Modified By" },
        { field: "modifieddate", header: "Modified Date" },
    ];
    const blankRow = {
        menuname: "",
        locationname: "",
        modifierprice: "",
        createdby: "",
        createddate: "",
        modifiedby: "",
        modifieddate: "",
        companyname: "",
    };

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
    const onSortChange = (e) => {
        const { sortField, sortOrder } = e;

        setFirst(0);
        // setLoading(true);

        if (!sortField || sortOrder == null) {
            setSortField("");
            setSortOrder("");
        } else {
            setSortField(sortField);
            setSortOrder(sortOrder === 1 ? "asc" : "desc");
        }

        // fetchMenuList(first, rows, globalFilterValue, sortField, sortOrder === 1 ? "asc" : "desc");
    };
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters["global"].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
        setFirst(0);
        // setLoading(true);
    };
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
                    menu.map((row) => exportColumns.map((col) => row[col.dataKey] ?? ""))
                );
                const fileName = "MenuList_export_" + new Date().getTime() + ".pdf";
                doc.save(fileName);
                fileExportMessage();
            });
        });
    };

    const exportXLS = () => {
        import("xlsx").then((xlsx) => {
            const filteredData = menu.map((row) => {
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

            saveAsExcelFile(excelBuffer, "MenuList");
            module.default.saveAs(
                data,
                fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
            );
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
                    <Button
                            className={`${selectedMenus.length > 0 ? 'bg-red-500' : 'bg-red-200'} text-white font-medium border-none outline-none rounded-full`}
                            icon="pi pi-trash"
                            label={`Delete (${selectedMenus.length})`}
                            onClick={() => setIsDeleteDisabled(true)}
                    />
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




    const menuNameBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="30%" height="1.5rem" />
        ) : (
            <span>{rowData.menuname}</span>
        );
    };
    const locationBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="30%" height="1.5rem" />
        ) : (
                <span>{rowData.locationname}</span>
        );
    };
    const modifierPriceBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="30%" height="1.5rem" />
        ) : (
            <span>{rowData.modifierprice}</span>
        );
    };
    const companyBodyTemplate = (rowData) => {
        return loading ? (
            <Skeleton width="30%" height="1.5rem" />
        ) : (
                <span>{rowData.companyname}</span>
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
    const confirmDeleteMenu = (menus) => {
        setSelectedMenu(menus);
        setDeleteMenusDialog(true);
    };
    const hideDeleteMenuDialog = () => {
        setDeleteMenusDialog(false);
    };
    const deleteMenusDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={() => setIsDeleteDisabled(false)} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={() => handleDeleteMenu(selectedMenus)} />
        </>
    );
    const deleteMenuDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteMenuDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={() => handleDeleteMenu([selectedMenu])} />
        </React.Fragment>
    )


    const fetchMenuList = async (
        start = 0,
        length = 50,
        search = "",
        sortField = "",
        sortOrder = ""
    ) => {  
        try {
            const response = await API.post(`/menu/getMenuList`, {companyId: 5}, {
                params: {
                    start: start,
                    length: length,
                    ...(search ? { search } : {}),
                    ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data.data.data)
            setMenu(response.data.data.data);
            setTotalRecords(response.data.data.totalRecords || 0);
        } catch (error) {
            console.error("Error fetching menu list:", error);
            toast.current.show({
                severity: "error",
                detail: "Error fetching menu list",
                life: 3000,
            });
        }
    };
    const handleDeleteMenu = async (menus) => {
        // console.log(storeIds)
        console.log("menus delete", menus)
        if (menus.length > 0) {
            // console.log("_stores" , _stores)
            let menuIds = []
            for (let i = 0; i < menus.length; i++) {
                menuIds.push(menus[i].menuid)
            }
            console.log("menuIds", menuIds)

            try {
                const response = await API.post(`/menu/deleteMenu`, { menuId: menuIds }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.data.success) {
                    // console.log("response" , response)
                    // let _stores = storeList.filter((val) => val.storeid !== storeIds);
                    const sessionState = sessionStorage.getItem("menuListState");
                    let parsed = sessionState ? JSON.parse(sessionState) : {};

                    const search = parsed.filters?.global?.value || "";
                    const field = parsed.sortField || "";
                    const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";
                    // setStoreList(_stores);
                    await fetchMenuList(
                        first,
                        rows,
                        globalFilterValue || search,
                        sortField || field,
                        sortOrder || order
                    );
                    setDeleteMenusDialog(false);
                    setSelectedMenu(emptyMenu);
                    setSelectedMenus([])
                    setIsDeleteDisabled(false)
                    // setStore(null)
                    // setDeleteMenusDialog(false)

                    toast.current.show({
                        severity: "success",
                        summary: "Successful",
                        detail: "Menu Deleted",
                        life: 3000,
                    });
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
        // setLoading(true);
        scrollToTop();

        // Fetch new chunk based on page and size
        // fetchMenuList(event.first, event.rows);
    };





    const editMenu = (rowData) => {
        // navigate(`/menu/${rowData.menuid}`);
        // alert(`Edit clicked for ${rowData.portion}`);
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
                                onClick={() => editMenu(rowData)}
                            />
                            <Button
                                icon="pi pi-trash"
                                rounded
                                outlined
                                severity="danger"
                                className="p-0 text-xs"
                                style={{ fontSize: "0.7rem", width: "2.5rem", height: "2.5rem" }}
                                onClick={() => {
                                    confirmDeleteMenu(rowData);
                                }}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };



    useEffect(() => {

        const sessionState = sessionStorage.getItem("menuListState");
        if (sessionState) {
            const parsed = JSON.parse(sessionState);

            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

            setSortField(field);
            setSortOrder(order);
            setRows(50)
        }
    }, []);
    
    useEffect(() => {
        if (!token) return;
        
        const delayDebounce = setTimeout(() => {
            const sessionState = sessionStorage.getItem("menuListState");
            let parsed = sessionState ? JSON.parse(sessionState) : {};

            const search = parsed.filters?.global?.value || "";
            const field = parsed.sortField || "";
            const order = parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";
            
            fetchMenuList(
                first,
                rows,
                globalFilterValue || search,
                sortField || field,
                sortOrder || order
            );
        }, 500); // debounce delay in ms
        
        return () => clearTimeout(delayDebounce);
    }, [first, rows, filters, globalFilterValue, sortField, sortOrder, token]);



    const header = renderHeader();
  return (
    <>
          <div>
              <Toast ref={toast} />
              <div className="card-action-menu flex justify-content-between align-items-center">
                  <div>Menu List</div>
                  <div
                      className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                      onClick={() => {
                        //   navigate("/product-menu");
                      }}
                  >
                      <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
                  </div>
              </div>

              <div className="card p-4">
                  <DataTable
                      ref={dt}
                      // value={brand}
                      value={loading ? Array.from({ length: rows }, () => blankRow) : menu}
                      paginator
                      header={header}
                      lazy
                      first={first}
                      rows={rows}
                      totalRecords={totalRecords}
                      onPage={onPageChange}
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                      rowsPerPageOptions={[10, 25, 50, totalRecords]}
                      dataKey="menuid"
                      rowClassName={() => "custom-row-class"}
                    //   globalFilter={globalFilterValue}
                      removableSort
                      filters={filters}
                      filterDisplay="menu"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                      globalFilterFields={["menuname"]}
                      emptyMessage="No menus found."
                      onSort={onSortChange}
                      sortField={sortField}
                      stateStorage="session"
                      stateKey="menuListState"
                      sortOrder={sortOrder === "asc" ? 1 : -1}
                      onFilter={(e) => {
                          setFilters(e.filters);
                      }}
                      selection={selectedMenus}

                      onSelectionChange={(e) => setSelectedMenus(e.value)}
                  // tableStyle={{ minWidth: "50rem" }}
                  >
                      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                      <Column

                          header="Sr No."
                          body={(rowData, options) => loading ? <Skeleton width="50%" height="1.5rem" /> : options.rowIndex + 1}
                          style={{ width: "2%", textAlign: "center" }}
                      />
                      {visibleFields.some((col) => col.field === "menuname") && (
                          <Column
                              field="menuname"
                              header="Menu Name"
                              style={{ minWidth: "11rem" }}
                              sortable
                              body={menuNameBodyTemplate}
                              sortableDisabled={loading}
                              // filter
                              filterPlaceholder="Search by menu"
                          ></Column>
                      )}
                      {visibleFields.some((col) => col.field === "locationname") && (
                          <Column
                              field="locationname"
                              header="Location"
                              
                              style={{ minWidth: "11rem" }}
                              sortable
                              body={locationBodyTemplate}
                              sortableDisabled={loading}
                              // filter
                              filterPlaceholder="Search by location"
                          ></Column>
                      )}
                      {visibleFields.some((col) => col.field === "modifierprice") && (
                          <Column
                              field="modifierprice"
                              header="Modifier Price"
                              style={{ minWidth: "11rem" }}
                              sortable
                              body={modifierPriceBodyTemplate}
                              sortableDisabled={loading}
                              // filter
                              filterPlaceholder="Search by modifier price"
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
                              sortableDisabled={loading}
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
                              // body={(rowdata) => (!rowdata.modifiedby ? "-" : rowdata.modifiedby)}
                              sortableDisabled={loading}
                              body={modifiedByBodyTemplate}
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
                      {visibleFields.some((col) => col.field === "company") && (
                          <Column
                              field="company"
                              header="Company"
                              style={{ minWidth: "15rem" }}
                              // body={(rowData) =>
                              //     !rowData.modifiedby ? "-" : rowData.modifieddate || "-"
                              // }
                              body={companyBodyTemplate}
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
                      visible={deleteMenusDialog}
                      style={{ width: "32rem" }}
                      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                      header="Confirm"
                      modal
                      footer={deleteMenuDialogFooter}
                      onHide={hideDeleteMenuDialog}
                      draggable={false}
                  >
                      <div className="confirmation-content">
                          <i
                              className="pi pi-exclamation-triangle mr-3"
                              style={{ fontSize: "2rem" }}
                          />
                          {selectedMenu && (
                              <span>
                                  Are you sure you want to delete <b>{selectedMenu.menuname}</b>?
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
                      footer={deleteMenusDialogFooter}
                      onHide={hideDeleteMenuDialog}
                      draggable={false}>

                      <div className="confirmation-content flex  items-center">
                          <i
                              className="pi pi-exclamation-triangle mr-3"
                              style={{ fontSize: "2rem" }}
                          />

                          {
                              selectedMenus.length > 0 ? (
                                  <span>
                                      Are you sure you want to delete {selectedMenus.length} menu(s)?
                                  </span>
                              ) : (
                                  <span>Please select at least one menu to delete.</span>
                              )
                          }

                      </div>

                  </Dialog>
              </div>
          </div>
    
    </>
  )
}

export default MenuList