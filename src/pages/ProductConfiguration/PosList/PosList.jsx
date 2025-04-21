import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import { TabView, TabPanel } from "primereact/tabview";
import { logout } from "../../../redux/slice/AuthSlice";
import { Skeleton } from "primereact/skeleton";
import { ProductService } from "../../../services/ProductService";
import axios from "axios";

function PosList() {
  const [PosList, setPosList] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false); // State for delete confirmation dialog
  const [rowToDelete, setRowToDelete] = useState(null); // State to store the row to delete
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [first, setFirst] = useState(0); // Start index
  const [rows, setRows] = useState(50); // Page size
  const [totalRecords, setTotalRecords] = useState(0); // Total number of records (from API)
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

  const dt = useRef(null);
  const toast = useRef(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    posName: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    locationName: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    menuName: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const columnOptions = [
    { field: "posname", header: "Pos Name" },
    { field: "locationname", header: "location Name" },
    { field: "menuname", header: "Menu Name" },
    { field: "createdby", header: "Created By" },
    { field: "createddate", header: "Created Date" },
    { field: "modifiedby", header: "Modified By" },
    { field: "modifieddate", header: "Modified Date" },
  ];

  const [visibleFields, setVisibleFields] = useState(
    columnOptions.filter(
      (col) =>
        !["createdby", "createddate", "modifiedby", "modifieddate"].includes(
          col.field
        )
    )
  );

  const exportColumns = visibleFields.map((col) => ({
    title: col.header,
    dataKey: col.field,
  }));

  const fetchPosList = async (
    start = 0,
    length = 50,
    search = "",
    sortField = "",
    sortOrder = ""
  ) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/pos/getPosList/?`,
        { companyId: 5 },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          params: {
            start: start,
            length: length,
            ...(search ? { search } : {}),
            ...(sortField && sortOrder ? { sortField, sortOrder } : {}),
          },
        }
      );

      if (response.data.success) {
        setPosList(response.data.data.data);
        setTotalRecords(response.data.data.totalRecords);
      }
    } catch (error) {
      console.error("Error fetching pos list:", error);

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
    const sessionState = sessionStorage.getItem("PosListState");
    if (sessionState) {
      const parsed = JSON.parse(sessionState);

      const field = parsed.sortField || "";
      const order =
        parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

      setSortField(field);
      setSortOrder(order);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const delayDebounce = setTimeout(() => {
      const sessionState = sessionStorage.getItem("PosListState");
      let parsed = sessionState ? JSON.parse(sessionState) : {};

      const search = parsed.filters?.global?.value || "";
      const field = parsed.sortField || "";
      const order =
        parsed.sortOrder === 1 ? "asc" : parsed.sortOrder === -1 ? "desc" : "";

      fetchPosList(
        first,
        rows,
        globalFilterValue || search,
        sortField || field,
        sortOrder || order
      );
    }, 500); // debounce delay in ms

    return () => clearTimeout(delayDebounce);
  }, [first, rows, filters, globalFilterValue, sortField, sortOrder, token]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
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
          PosList.map((row) =>
            exportColumns.map((col) => row[col.dataKey] ?? "")
          )
        );
        doc.save("PosList.pdf");
        fileExportMessage();
      });
    });
  };

  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const filteredData = PosList.map((row) => {
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

      saveAsExcelFile(excelBuffer, "PosList");
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

  const editSubCategory = (rowData) => {
    navigate(`/pos-master/${rowData.posid}`);
  };

  const confirmDeletePosList = (rowData) => {
    setRowToDelete(rowData); // Set the row to delete
    setDeleteDialogVisible(true); // Show the confirmation dialog
  };

  const deletePosList = async () => {
    setIsDeleting(true); // Set loading state for deletion
    try {
      const response = await axios.post(
        `${BASE_URL}/pos/deletePos`,
        { posId: [rowToDelete.posid] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success === 1) {
        setPosList((prev) =>
          prev.filter((item) => item.posid !== rowToDelete.posid)
        );
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "pos deleted successfully",
          life: 3000,
        });
        fetchPosList(first, rows, globalFilterValue, sortField, sortOrder);
        setIsDeleting(false); // Reset loading state after deletion
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

  // const editSubCategory = (rowData) => {
  //     navigate(`/product-subcategory/${rowData.subcategoryid}`);
  //   };

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
                onClick={() => editSubCategory(rowData)}
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
                onClick={() => confirmDeletePosList(rowData)}
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
              // tooltip="Export as CSV"
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

  const posnameBodyTemplate = (rowData) => {
    return loading ? (
      <Skeleton width="70%" height="1.5rem" />
    ) : (
      <span>{rowData.posname ? rowData.posname : "Not Specified"}</span>
    );
  };
  const locationnameBodyTemplate = (rowData) => {
    return loading ? (
      <Skeleton width="70%" height="1.5rem" />
    ) : (
      <span>
        {rowData.locationname ? rowData.locationname : "Not Specified"}
      </span>
    );
  };
  const menunameBodyTemplate = (rowData) => {
    return loading ? (
      <Skeleton width="70%" height="1.5rem" />
    ) : (
      <span>{rowData.menuname ? rowData.menuname : "Not Specified"}</span>
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
      <span>
        {rowData.modifieddate ? rowData.modifieddate : "Not Specified"}
      </span>
    );
  };

  const blankRow = {
    posname: "",
    locationname: "",
    menuname: "",
    createdby: "",
    createddate: "",
    modifiedby: "",
    modifieddate: "",
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
              onClick={deletePosList}
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
              Are you sure you want to delete{" "}
              <b>{rowToDelete.subcategoryname}</b>?
            </span>
          )}
        </div>
      </Dialog>
      <div className="card-action-menu flex justify-content-between align-items-center">
        <div>Pos List</div>
        <div
          className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
          onClick={() => navigate("/pos-master")}
        >
          <i className="pi pi-plus" style={{ fontSize: "1.3rem" }} />
        </div>
      </div>
      <div>
        <div className="card">
          <DataTable
            first={first}
            value={
              loading ? Array.from({ length: rows }, () => blankRow) : PosList
            }
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
            //  globalFilter={globalFilterValue}
            removableSort
            filterDelay="manu"
            filters={filters}
            globalFilterFields={[
              "",
              "productcategoryname ",
              "subcategoryname",
              "displayorder",
            ]}
            emptyMessage="No pos list found."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            onPage={onPageChange}
            dataKey="posId"
            stateStorage="session"
            stateKey="PosListState"
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
            <Column
              header="Sr No."
              body={(rowData, options) => options.rowIndex + 1}
              style={{ minwidth: "5rem", textAlign: "center" }}
            ></Column>
            {visibleFields.some((col) => col.field === "posname") && (
              <Column
                field="posname"
                header="Pos Name"
                sortable
                sortableDisabled={loading}
                body={posnameBodyTemplate}
                style={{ minWidth: "11rem" }}
              ></Column>
            )}
            {visibleFields.some((col) => col.field === "locationname") && (
              <Column
                field="locationname"
                header="Location Name"
                sortable
                sortableDisabled={loading}
                body={locationnameBodyTemplate}
                style={{ minWidth: "13rem" }}
              ></Column>
            )}
            {visibleFields.some((col) => col.field === "menuname") && (
              <Column
                field="c"
                header="Menu Name"
                sortable
                sortableDisabled={loading}
                body={menunameBodyTemplate}
                style={{ minWidth: "13rem" }}
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
                filterField="modifieddate"
                style={{ minWidth: "15rem" }}
                headerStyle={{ textAlign: "center" }}
                body={modifieddateBodyTemplate}
                filter
                filterPlaceholder="Search by Modified Date"
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
}

export default PosList;
