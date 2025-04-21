import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { DataTable } from "primereact/datatable";
import { Column } from "jspdf-autotable";
import axios from "axios";
import "./MenuMaster.scss";

function MenuMaster() {
    const [selectedMenuType, setSelectedMenuType] = useState("fresh");
    const [orderLevelTaxOptions, setOrderLevelTaxOptions] = useState([]);
    const [selectedOrderLevelTax, setSelectedOrderLevelTax] = useState(null);
    const [taxSlabOptions, setTaxSlabOptions] = useState([]);
    const [selectedTaxSlab, setSelectedTaxSlab] = useState(null);
    const [menuListOptions, setMenuListOptions] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [selectAllProducts, setSelectAllProducts] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(null);

    // Inside component state
    const [copiedMenuProducts, setCopiedMenuProducts] = useState([]);

    const token = useSelector((state) => state.auth.token);
    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const menuOptions = [
        { label: "Create A Fresh Menu", value: "fresh" },
        { label: "Copy From Existing Menu", value: "copy" },
        { label: "Upload From Excel", value: "upload" },
    ];

    // Editable Dropdown values
    const tagOptions = [
        { label: "Goods", value: "Goods" },
        { label: "Service", value: "Service" },
    ];
    const yesNoOptions = [
        { label: "Yes", value: 1 },
        { label: "No", value: 0 },
    ];

    useEffect(() => {
        const fetchOrderLevelTax = async () => {
            try {
                const response = await axios.post(
                    `${BASE_URL}/menu/getOrderLevelTax`,
                    { companyId: 5 },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    }
                );
                if (response.data.success) {
                    setOrderLevelTaxOptions(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch Order Level Tax:", error);
            }
        };

        const fetchTaxSlabs = async () => {
            try {
                const response = await axios.post(
                    `${BASE_URL}/tax/getTaxProfileList`,
                    { companyId: 5 },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        params: {
                            start: 0,
                            length: -1,
                        },
                    }
                );

                if (response.data.success) {
                    setTaxSlabOptions(response.data.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch Tax Slabs:", error);
            }
        };

        const fetchMenuList = async () => {
            try {
                const response = await axios.post(
                    `${BASE_URL}/menu/getMenuList`,
                    { companyId: 5 },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        params: {
                            start: 0,
                            length: -1,
                        },
                    }
                );

                if (response.data.success) {
                    const formattedMenus = response.data.data.data.map((menu) => ({
                        label: menu.menuname,
                        value: menu.menuid,
                    }));
                    setMenuListOptions(formattedMenus);
                }
            } catch (error) {
                console.error("Failed to fetch menu list:", error);
            }
        };

        const fetchProductCategories = async () => {
            try {
                const response = await axios.post(
                    `${BASE_URL}/productCategory/getProductCategoryList`,
                    { companyId: 5 },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        params: {
                            start: 0,
                            length: -1,
                        },
                    }
                );

                if (response.data.success) {
                    const formattedCategories = response.data.data.data.map((cat) => ({
                        label: cat.productcategoryname,
                        value: cat.productcategoryid,
                    }));
                    setCategoryOptions(formattedCategories);
                }
            } catch (error) {
                console.error("Failed to fetch product categories:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await axios.post(
                    `${BASE_URL}/product/fetchProducts`,
                    { companyId: 5 },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        params: {
                            start: 0,
                            length: -1,
                        },
                    }
                );

                if (response.data.success) {
                    const formattedProducts = response.data.data.data.map((product) => ({
                        label: product.productname,
                        value: product.productid,
                    }));
                    setProductOptions(formattedProducts);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        fetchOrderLevelTax();
        fetchTaxSlabs();
        fetchMenuList();
        fetchProductCategories();
        fetchProducts();
    }, []);

    // Load product function (called on Load Product button click in 'copy')
    const handleLoadCopiedMenuProducts = async () => {
        if (!selectedMenu) return;
        try {
            const response = await axios.post(
                `${BASE_URL}/menu/loadProductFromMenu`,
                { companyId: 5, menuId: selectedMenu },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    params: {
                        start: 0,
                        length: -1,
                    },
                }
            );

            if (response.data.success) {
                setCopiedMenuProducts(response.data.data.data);
            }
        } catch (err) {
            console.error("Failed to load products from menu:", err);
        }
    };

    // Tax Profile Dropdown Renderer
    const taxProfileEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={taxSlabOptions.map((tax) => ({
                    label: `${tax.taxprofilename} - ${tax.taxpercentage}%`,
                    value: tax.taxprofileid,
                }))}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select Tax Profile"
                className="w-full"
            />
        );
    };

    const dropdownEditor = (options, values) => (
        <Dropdown
            value={options.value}
            options={values}
            onChange={(e) => options.editorCallback(e.value)}
            placeholder="Select"
            className="w-full"
        />
    );

    const inputTextEditor = (options) => (
        <InputText
            value={options.value}
            onChange={(e) => options.editorCallback(e.target.value)}
            className="w-full"
        />
    );

    const inputNumberEditor = (options) => (
        <InputNumber
            value={parseFloat(options.value)}
            onValueChange={(e) => options.editorCallback(e.value)}
            mode="decimal"
            className="w-full"
        />
    );

    const renderTaxItemTemplate = (option) => {
        if (!option) return "";
        return (
            <div>
                {option.taxprofilename}
                {option.taxpercentage ? ` - ${option.taxpercentage}%` : ""}
            </div>
        );
    };

    const renderTaxSlabItem = (option) => {
        if (!option) return "";
        return (
            <div>
                {option.taxprofilename}
                {option.taxpercentage ? ` - ${option.taxpercentage}%` : ""}
            </div>
        );
    };

    return (
        <div>
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-lg font-semibold">Menu Master</div>
                <div className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer">
                    <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>
            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="card p-fluid menu-master-card">
                        <div className="grid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="menu-option-dropdown">Create Menu By</label>
                                <Dropdown
                                    value={selectedMenuType}
                                    name="selectedMenuType"
                                    options={menuOptions}
                                    onChange={(e) => setSelectedMenuType(e.value)}
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Select Menu Type"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="menu-name">Menu Name</label>
                                <InputText
                                    value={""}
                                    placeholder="Enter Menu Name"
                                    // onChange={inputChangeHandler}
                                    name="menuName"
                                    // disabled={loading}
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="order-level-tax">Order Level Tax</label>
                                <Dropdown
                                    value={selectedOrderLevelTax}
                                    valueTemplate={(option, props) =>
                                        option
                                            ? `${option.taxprofilename}${
                                                  option.taxpercentage
                                                      ? ` - ${option.taxpercentage}%`
                                                      : ""
                                              }`
                                            : props.placeholder
                                    }
                                    itemTemplate={renderTaxItemTemplate}
                                    name="orderLevelTax"
                                    options={orderLevelTaxOptions}
                                    optionLabel="taxprofilename"
                                    optionValue="taxprofileid"
                                    placeholder="Select an Order Level Tax"
                                    onChange={(e) => setSelectedOrderLevelTax(e.value)}
                                    className="w-full"
                                    showClear
                                    filter
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="tax-slabs">Tax Slabs</label>
                                <Dropdown
                                    value={selectedTaxSlab}
                                    name="taxSlabs"
                                    onChange={(e) => setSelectedTaxSlab(e.value)}
                                    options={taxSlabOptions}
                                    optionLabel="taxprofilename"
                                    optionValue="taxprofileid"
                                    placeholder="Select a Tax Slab"
                                    className="w-full"
                                    showClear
                                    filter
                                    itemTemplate={renderTaxSlabItem}
                                    valueTemplate={(option, props) =>
                                        option
                                            ? `${option.taxprofilename}${
                                                  option.taxpercentage
                                                      ? ` - ${option.taxpercentage}%`
                                                      : ""
                                              }`
                                            : props.placeholder
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {selectedMenuType === "fresh" && (
                    <div className="col-12 md:col-6">
                        <div className="card p-fluid menu-master-card">
                            <div className="text-lg font-bold mb-3">Create A Fresh Menu</div>
                            <div className="grid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="brand-dropdown">Brand</label>
                                    <Dropdown
                                        value={""}
                                        name="brand"
                                        optionLabel="productcategoryname"
                                        optionValue="productcategoryid"
                                        placeholder="Select a Brand"
                                        className="w-full"
                                        showClear
                                        filter
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="product-category-dropdown">
                                        Product Category
                                    </label>
                                    <MultiSelect
                                        value={selectedCategories}
                                        onChange={(e) => setSelectedCategories(e.value)}
                                        name="selectedCategories"
                                        options={categoryOptions}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Select a Product Category"
                                        className="w-full"
                                        display="chip"
                                        showClear
                                        showSelectAll
                                        filter
                                    />
                                </div>
                                <div className="field col-12">
                                    <label htmlFor="product-dropdown">Product</label>
                                    <MultiSelect
                                        value={selectedProducts}
                                        onChange={(e) => {
                                            setSelectedProducts(e.value);
                                            setSelectAllProducts(
                                                e.value.length === productOptions.length
                                            );
                                        }}
                                        selectAll={selectAllProducts}
                                        onSelectAll={(e) => {
                                            setSelectedProducts(
                                                e.checked
                                                    ? []
                                                    : productOptions.map((product) => product.value)
                                            );
                                            setSelectAllProducts(!e.checked);
                                        }}
                                        virtualScrollerOptions={{ itemSize: 50 }}
                                        name="selectedProducts"
                                        options={productOptions}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Select a Product"
                                        className="w-full"
                                        display="chip"
                                        showClear
                                        showSelectAll
                                        filter
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="flex justify-content-end">
                                    <Button className="self-end w-auto" label="Load Product" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedMenuType === "copy" && (
                    <div className="col-12 md:col-6">
                        <div className="card p-fluid menu-master-card">
                            <div className="text-lg font-bold mb-3">Copy From Existing Menu</div>
                            <div className="grid">
                                <div className="field col-12">
                                    <label htmlFor="menu-list-dropdown">Menu List</label>
                                    <Dropdown
                                        value={selectedMenu}
                                        name="selectedMenu"
                                        onChange={(e) => setSelectedMenu(e.value)}
                                        options={menuListOptions}
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Select a Menu"
                                        className="w-full"
                                        showClear
                                        filter
                                    />
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="flex justify-content-end">
                                    <Button
                                        className="self-end w-auto"
                                        label="Load Product"
                                        disabled={!selectedMenu}
                                        onClick={handleLoadCopiedMenuProducts}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedMenuType === "upload" && (
                    <div className="col-12 md:col-6">
                        <div className="card p-fluid menu-master-card flex flex-col justify-content-between">
                            <div className="text-lg font-bold mb-3">Upload From Excel</div>
                            <div className="grid">
                                <div className="field col-12">
                                    <div className="flex items-center gap-2">
                                        <InputText
                                            id="product-category-image"
                                            // value={formData.fileName}
                                            readOnly
                                            className="w-full border rounded px-3 py-2.5 text-gray-600"
                                        />
                                        <FileUpload
                                            mode="basic"
                                            accept="image/*"
                                            maxFileSize={500000}
                                            // onSelect={onUpload}
                                            chooseLabel="Browse"
                                            className="p-button-primary"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label
                                        htmlFor="sample-file-download"
                                        className="flex align-items-center gap-3 cursor-pointer"
                                    >
                                        Download Sample File
                                        <span className="p-1 rounded bg-gray-400 hover:bg-gray-500 transition-colors cursor-pointer text-white">
                                            <i className="pi pi-download" />
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="flex justify-content-end">
                                    <Button className="self-end w-auto" label="Load Product" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="card">
                
            </div>
        </div>
    );
}

export default MenuMaster;
