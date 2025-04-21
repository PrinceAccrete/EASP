import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const OnlineMenuDetailsPage = () => {
    const [onlineMenuList, setOnlineMenuList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryError, setCategoryError] = useState("");

    const productCategories = [
        { label: "Beverages", value: "beverages" },
        { label: "Snacks", value: "snacks" },
        { label: "Desserts", value: "desserts" },
        { label: "Main Course", value: "main_course" }
    ];

    // Sample Data (Replace this with API response)
    useEffect(() => {
        const sampleData = [
            {
                productcategory: "Beverages",
                product: "Coffee",
                portion: "Medium",
                price: 2.99,
                tax: 0.25,
                stockinout: 1,
                recommended: true,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
            {
                productcategory: "Desserts",
                product: "Chocolate Cake",
                portion: "Slice",
                price: 4.99,
                tax: 0.35,
                stockinout: 0,
                recommended: false,
            },
        ];
        setOnlineMenuList(sampleData);
    }, []);

    // Toggle Availability Switch
    const toggleAvailability = (rowData) => {
        const updatedList = onlineMenuList.map((item) =>
            item.product === rowData.product
                ? { ...item, stockinout: item.stockinout === 1 ? 0 : 1 }
                : item
        );
        setOnlineMenuList(updatedList);
    };

    return (
        <div>
             <div className="card-action-menu flex justify-content-between align-items-center">
                <div>Online Menu Details List</div>
              

                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        // navigate("/product-category-list");
                    }}
                >
                    <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>
       
        <div className="card">

        <div className="field col-12 md:col-6 flex gap-2 items-center">
            <label htmlFor="product-category-dropdown mb-0">Product Category</label>
            <Dropdown
                value={selectedCategory} // Selected category
                options={productCategories} // Static categories
                onChange={(e) => {
                    setSelectedCategory(e.value);
                    setCategoryError(""); // Clear error when selection changes
                }}
                placeholder="Select Category"
                filter
                showClear
                className={categoryError ? "p-invalid" : ""}
            />
            {categoryError && <small style={{ color: "red" }}>{categoryError}</small>}
        </div>

            <DataTable
                value={onlineMenuList}
                selection={selectedItems}
                onSelectionChange={(e) => setSelectedItems(e.value)}
                paginator
                rows={5}
                rowsPerPageOptions={[10, 25, 50]}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                scrollable
                // scrollHeight="400px"
                className="datatable-responsive"
                emptyMessage="No products found."
            >
                {/* Multi-Select Column */}
                <Column selectionMode="multiple" style={{ width: "3rem" }} />

                {/* Serial Number Column */}
                <Column
                    header="Sr No."
                    body={(rowData, options) => options.rowIndex + 1}
                    style={{ minWidth: "6rem", textAlign: "left" }}
                />

                {/* Other Columns */}
                <Column field="productcategory" header="Category" style={{ minWidth: "200px" }} />
                <Column field="product" header="Product Name" style={{ minWidth: "200px" }} />
                <Column field="portion" header="Portion" style={{ minWidth: "150px" }} />
                <Column field="price" header="Price ($)" style={{ minWidth: "100px" }} />
                <Column field="tax" header="Tax ($)" style={{ minWidth: "100px" }} />

                {/* Availability Switch */}
                <Column
                    header="Availability"
                    body={(rowData) => (
                        <InputSwitch
                            checked={rowData.stockinout === 1}
                            onChange={() => toggleAvailability(rowData)}
                        />
                    )}
                />

                {/* Recommended Product Switch */}
                <Column
                    header="Recommended"
                    body={(rowData) => (
                        <InputSwitch
                            checked={rowData.recommended}
                            onChange={() => {
                                const updatedList = onlineMenuList.map((item) =>
                                    item.product === rowData.product
                                        ? { ...item, recommended: !item.recommended }
                                        : item
                                );
                                setOnlineMenuList(updatedList);
                            }}
                        />
                    )}
                />
            </DataTable>
            <div className="field col-12">
                <div className="flex justify-content-end">
                    <Button label="Push" className="w-auto self-end" />
                </div>
            </div>
        </div>
        </div>
    );
};

export default OnlineMenuDetailsPage;
