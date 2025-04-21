import React, { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import "./ProductModifiersMapping.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { Dropdown } from "primereact/dropdown";
import { Chip } from "primereact/chip";
import { Toast } from "primereact/toast";
import { useRef } from "react";

// import { Link } from "react-router-dom";

function ProductModifiersMapping() {
    // user Token
    const token = useSelector((state) => state.auth.token);

    const navigate = useNavigate();

    const toast = useRef(null); // Toast reference

    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

    const [errorMsg, setErrorMsg] = useState({});

    // State for Loading
    const [isSaving, setIsSaving] = useState(false);

    // State for categories (Fetched from API)
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // State for prOducts (Fetched from API)
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // State for Portions (Fetched from API)
    const [Portions, setPortions] = useState([]);
    const [selectedPortions, setSelectedPortions] = useState([]);

    // State for Modifiers (Fetched from API)
    const [modifiers, setModifiers] = useState([]);
    const [selectedModifiers, setSelectedModifiers] = useState([]);

    // State for deafult modifier (Fetched from API)
    const [defaultModifierOptions, setDefaultModifierOptions] = useState([]); // Only selected ones
    const [selectedDefaultModifiers, setSelectedDefaultModifiers] = useState([]); // Selected default

    // State for Menu (Fetched from API)
    const [menuList, setMenuList] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState([]);

    const validateForm = () => {
        const errors = {};

        if (!selectedCategories.length) errors.categories = "Select at least one category.";
        if (!selectedProducts.length) errors.products = "Select at least one product.";
        if (!selectedPortions.length) errors.portions = "Select at least one product portion.";
        if (!selectedModifiers.length) errors.modifiers = "Select at least one modifier.";
        if (!selectedMenu.length) errors.menu = "Select at least one menu.";

        setErrorMsg(errors);
        return Object.keys(errors).length === 0;
    };

    // Product Category Listing api
    const fetchProductCategory = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/productCategory/getProductCategoryList?start=0&length=-1`,
                { companyId: 5 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1 && response.data.data.data) {
                const categoryOptions = response.data.data.data.map((item) => ({
                    label: item.productcategoryname,
                    value: item.productcategoryid,
                }));

                setCategories(categoryOptions);
            } else {
                console.error("Unexpected API response format.");
            }
        } catch (error) {
            console.error("Error fetching product categories:", error);
        }
    };
    useEffect(() => {
        if (!token) {
            alert("Login for Token");
            return;
        }

        fetchProductCategory();
    }, [token]);

    // product listing api
    const fetchproduct = async () => {
        if (selectedCategories.length === 0) {
            setProducts([]);
            return;
        }

        try {
            const response = await axios.post(
                `${BASE_URL}/product/getProductFromCategory`,
                { productCategoryId: selectedCategories },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1 && response.data.data) {
                const productOptions = response.data.data.map((item) => ({
                    label: item.productname,
                    value: item.productid,
                }));

                setProducts(productOptions);
            } else {
                console.error("Unexpected API response format.");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    useEffect(() => {
        if (selectedCategories.length > 0) {
            fetchproduct();
        } else {
            setProducts([]);
            setSelectedProducts([]);
        }
        setSelectedProducts((prevSelected) =>
            prevSelected.filter((prodId) => {
                const product = products.find((p) => p.value === prodId);
                return product && selectedCategories.includes(product.categoryId);
            })
        );
    }, [selectedCategories]);

    const fetchportion = async () => {
        if (selectedProducts.length === 0) {
            setPortions([]);

            return;
        }

        try {
            const response = await axios.post(
                `${BASE_URL}/portion/getProductPortionList`,
                { productIds: selectedProducts },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1 && response.data.data) {
                const portionOptions = response.data.data.map((item) => ({
                    productId: item.productid,
                    productPortionId: item.productportionid,
                    label: item.productportionname,
                    value: item.productportionid,
                }));

                setPortions(portionOptions);
            } else {
                console.error("Unexpected API response format.");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    useEffect(() => {
        if (selectedProducts.length > 0) {
            fetchportion();
        } else {
            setPortions([]);
            setSelectedPortions([]);
        }
          setSelectedPortions((prevSelected) =>
        prevSelected.filter((portionId) => {
            // Find portion corresponding to the selected product
            const portion = Portions.find((p) => p.value === portionId);
            return portion && selectedProducts.includes(portion.productId);
        })
    );
    }, [selectedProducts]);

    const fetchModifiers = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/modifier/getModifierWithCategoryDropdown`,
                { companyId: 5 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1 && response.data.data) {
                console.log("Fetched Modifiers:", response.data.data);

                // Convert API data into PrimeReact Dropdown format
                const formattedModifiers = response.data.data.map((category) => ({
                    label: category.modifiercategoryname,
                    items: category.modifiers.map((modifier) => ({
                        label: modifier.modifiername,
                        value: modifier.modifierid,
                    })),
                }));

                setModifiers(formattedModifiers);
            } else {
                console.error("Unexpected API response format.");
            }
        } catch (error) {
            console.error("Error fetching modifiers:", error);
        }
    };
    useEffect(() => {
        fetchModifiers();
    }, [token]);

    // Handle Modifier Selection
    const handleModifierChange = (e) => {
        const newSelectedModifiers = e.value;

        const updatedDefaultModifiers = newSelectedModifiers.map((modifierId) => {
            const modifier = modifiers
                .flatMap((category) => category.items)
                .find((mod) => mod.value === modifierId);

            return modifier;
        });

        setSelectedModifiers(newSelectedModifiers);
        setDefaultModifierOptions(updatedDefaultModifiers);
        setSelectedDefaultModifiers((prev) =>
            prev.filter((mod) => newSelectedModifiers.includes(mod.value))
        );
    };

    // Handle Default Modifier Selection
    const handleDefaultModifierChange = (e) => {
        setSelectedDefaultModifiers(e.value);
    };

    const fetchMenu = async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/menu/getMenuList?start=0&length=-1`,
                { companyId: 5 }, // Payload
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === 1 && response.data.data?.data) {
                const extractedMenus = response.data.data.data.map((menu) => ({
                    label: menu.menuname,
                    value: menu.menuid,
                }));

                console.log("Filtered Menu List:", extractedMenus);
                setMenuList(extractedMenus);
            } else {
                console.error("Unexpected API response format.");
            }
        } catch (error) {
            console.error("Error fetching menu list:", error);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [token]);

    const handleAddClick = async () => {
        if (!token) {
            toast.current.show({
                severity: "warn",
                summary: "Authentication Required",
                detail: "Please log in to continue.",
                life: 3000,
            });
            return;
        }

        if (!validateForm()) return;

        setIsSaving(true);

        // Constructing the payload
        const payload = {
            companyId: 5,
            productPortionIds: Portions.map(({ productId, productPortionId }) => ({
                productId,
                productPortionId,
            })),
            modifierIds: selectedModifiers,
            defaultModifierIds: selectedDefaultModifiers,
            menuIds: selectedMenu,
        };

        try {
            const response = await axios.post(`${BASE_URL}/modifier/addProductModifier`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success === 1) {
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Product Modifier Added Successfully!",
                    life: 3000,
                });

                // Reset Selections after successful API call
                setSelectedModifiers([]);
                setSelectedDefaultModifiers([]);
                setSelectedMenu([]);
                setSelectedProducts([]);
                setSelectedCategories([]);
            } else {
                console.error("Unexpected API response:", response.data);
                toast.current.show({
                    severity: "error",
                    summary: "Failed",
                    detail: "Failed to add Product Modifier.",
                    life: 3000,
                });
            }
        } catch (error) {
            console.error("Error adding product modifier:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Error occurred while adding Product Modifier.",
                life: 3000,
            });
        } finally {
            setIsSaving(false);
        }
        console.log("clicks");
        console.log("Selected Categories:", selectedCategories);
        console.log("Selected Products:", selectedProducts);
        console.log("Selected Portions:", selectedPortions);
        console.log("Selected Modifiers:", selectedModifiers);
        console.log("Selected Default Modifiers:", selectedDefaultModifiers);
        console.log("Selected Menu:", selectedMenu);
    };
    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="text-black">Product Modifier Mapping</div>

                <div
                    className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
                    onClick={() => {
                        navigate("/product-modifiers-mapping-list");
                    }}
                >
                    <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            <div className="card">
                <div className="grid p-fluid">
                    <div className="field col-12 md:col-4">
                        <label>Product Category <span style={{ color: 'red' }}>*</span></label>
                        <MultiSelect
                            value={selectedCategories}
                            options={categories}
                            optionLabel="label"
                            placeholder="- Please Select -"
                            onChange={(e) => {
                                setSelectedCategories(e.value);
                                setErrorMsg((prev) => ({ ...prev, categories: null }));
                            }}
                            display="chip"
                            showClear
                            className={errorMsg.categories ? "p-invalid border-red-500" : ""}
                        />
                        {errorMsg.categories && (
                            <small className="p-error">{errorMsg.categories}</small>
                        )}
                    </div>

                    <div className="field col-12 md:col-4">
                        <label>Products <span style={{ color: 'red' }}>*</span></label>
                        <MultiSelect
                            value={selectedProducts}
                            options={products}
                            optionLabel="label"
                            placeholder="- Please Select -"
                            onChange={(e) => {
                                setSelectedProducts(e.value);
                                setErrorMsg((prev) => ({ ...prev, products: null }));
                            }}
                            display="chip"
                            showClear
                            className={errorMsg.products ? "p-invalid border-red-500" : ""}
                        />
                        {errorMsg.products && (
                            <small className="p-error">{errorMsg.products}</small>
                        )}
                    </div>

                    <div className="field col-12 md:col-4">
                        <label>Product Portions <span style={{ color: 'red' }}>*</span></label>
                        <MultiSelect
                            value={selectedPortions}
                            options={Portions}
                            placeholder="- Please Select -"
                            onChange={(e) => {
                                setSelectedPortions(e.value);
                                setErrorMsg((prev) => ({ ...prev, portions: null }));
                            }}
                            display="chip"
                            showClear
                            className={errorMsg.portions ? "p-invalid border-red-500" : ""}
                        />
                        {errorMsg.portions && (
                            <small className="p-error">{errorMsg.portions}</small>
                        )}
                    </div>

                    {/* Modifiers MultiSelect */}
                    {/* Modifiers MultiSelect */}
                    <div className="field col-12 md:col-4">
                        <label>Modifiers <span style={{ color: 'red' }}>*</span></label>
                        <MultiSelect
                            value={selectedModifiers}
                            onChange={(e) => {
                                handleModifierChange(e);
                                setErrorMsg((prev) => ({ ...prev, modifiers: null }));
                            }}
                            options={modifiers}
                            optionGroupLabel="label"
                            optionGroupChildren="items"
                            placeholder="Select Modifiers"
                            display="chip"
                            showClear
                            className={`w-full ${
                                errorMsg.modifiers ? "p-invalid border-red-500" : ""
                            }`}
                        />
                        {errorMsg.modifiers && (
                            <small className="p-error">{errorMsg.modifiers}</small>
                        )}
                    </div>

                    {/* Default Modifiers MultiSelect */}
                    <div className="field col-12 md:col-4">
                        <label>Default Modifiers</label>
                        <MultiSelect
                            value={selectedDefaultModifiers} // Only selected ones
                            options={defaultModifierOptions} // Only show selected modifier names
                            onChange={handleDefaultModifierChange} // Handle removing from main MultiSelect
                            placeholder="- Please Select -"
                            display="chip"
                            showClear
                            className="w-full"
                            // disabled={defaultModifierOptions.length === 0}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label>Menu <span style={{ color: 'red' }}>*</span></label>
                        <MultiSelect
                            value={selectedMenu}
                            onChange={(e) => {
                                setSelectedMenu(e.value);
                                setErrorMsg((prev) => ({ ...prev, menu: null }));
                            }}
                            options={menuList}
                            placeholder="Select Menus"
                            optionLabel="label"
                            display="chip"
                            showClear
                            className={`w-full ${errorMsg.menu ? "p-invalid border-red-500" : ""}`}
                        />
                        {errorMsg.menu && <small className="p-error">{errorMsg.menu}</small>}
                    </div>
                </div>

                <div className="field col-12">
                    <div className="flex justify-content-end">
                        <Button
                            label={isSaving ? "Adding..." : "Add"}
                            className="w-auto self-end"
                            onClick={handleAddClick}
                            disabled={isSaving} // Disable button while saving
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductModifiersMapping;
