import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import "react-color-palette/css";
import "./ProductCategory.css";
import { ColorPicker, useColor } from "react-color-palette";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import { Skeleton } from "primereact/skeleton";

function ProductCategory() {
    // Get the category id from the URL; if id exists, we're editing
    const { id } = useParams();

    // Use the id as the categoryId (null if not present)
    const categoryId = id ? id : null;

    const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;
    // Loader states
    const [isSaving, setIsSaving] = useState(false);

    const [isInitialLoading, setIsInitialLoading] = useState(false);

    const [categoryData, setCategoryData] = useState(null);
    const [formData, setFormData] = useState({
        productCatName: "",
        displayOrder: 0,
        onlineDisplayName: "",
        descriptions: "",
        // backcolor: "#ffffff",
        status: true,
        hideFromPOS: false,
        hideFromOnlineOrdering: false,
        productCatAppearance: 1,
        fileName: "No image selected",
        file: null, // Add file state
    });

    const navigate = useNavigate();
    const toast = useRef(null);

    // error state  
    const [productError, setProductError] = useState(""); // Stores error message
    const [BrandError, setBrandError] = useState(""); // Stores error message

    // const [fileName, setFileName] = useState("No image selected"); // Default file name
    const [previewImage, setPreviewImage] = useState(null); // State for preview image

    const [color, setColor] = useColor("#000000"); // Ensures a valid color object
    const [showPicker, setShowPicker] = useState(false);

    // brand
    const [brands, setBrands] = useState([]); // Store fetched brands
    const [selectedBrand, setSelectedBrand] = useState(null); // Store selected brand

    const token = useSelector((state) => state.auth.token); // Get token from Redux state

    const [switch1, setSwitch1] = useState(true);
    const [switch2, setSwitch2] = useState(true);
    const [switch3, setSwitch3] = useState(true);

    const hexToRgbHsv = (hex) => {
        // Remove '#' if present
        hex = hex.replace(/^#/, "");

        // Convert HEX to RGB
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;

        // Normalize RGB
        let rNorm = r / 255,
            gNorm = g / 255,
            bNorm = b / 255;

        let max = Math.max(rNorm, gNorm, bNorm),
            min = Math.min(rNorm, gNorm, bNorm);
        let h,
            s,
            v = max;

        let delta = max - min;

        if (delta === 0) {
            h = 0;
        } else if (max === rNorm) {
            h = ((gNorm - bNorm) / delta) % 6;
        } else if (max === gNorm) {
            h = (bNorm - rNorm) / delta + 2;
        } else {
            h = (rNorm - gNorm) / delta + 4;
        }

        h = Math.round(h * 60);
        if (h < 0) h += 360;

        s = max === 0 ? 0 : delta / max;
        v = max;

        return {
            rgb: { r, g, b, a: 1 }, // RGB format
            hsv: { h, s: s * 100, v: v * 100, a: 1 }, // HSV format
        };
    };

    // Fetch category data only if a categoryId is provided (edit mode)
    useEffect(() => {
        if (!token) {
            console.warn("Token is not available");
            return;
        }
        if (categoryId && brands.length > 0) {
            const fetchCategoryById = async () => {
                try {
                    setIsInitialLoading(true);
                    const response = await axios.post(
                        `${BASE_URL}/productCategory/getData/${categoryId}`,
                        { companyId: 5 },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (response.data.success === 1 && response.data.data.length > 0) {
                        const data = response.data.data[0];
                        // Convert RGB to HEX before setting
                        // const hexColor = rgbToHex(data.backcolor || "rgb(0,0,0)");

                        setCategoryData(data);

                        setFormData({
                            productCatName: data.productcategoryname || "",
                            displayOrder: data.displayorder || 0,
                            onlineDisplayName: data.onlinedisplyname || "",
                            descriptions: data.descriptions || "",
                            // backcolor: hexColor, // Set hex format
                            status: data.status === 1,
                            hideFromPOS: data.hidefrompos === 1,
                            hideFromOnlineOrdering: data.hidefromonlineordering === 1,
                            productCatAppearance: data.productcatappearance || 1,
                            fileName: data.productimgpath || "No file selected",
                        });

                        if (data.backcolor) {
                            const { rgb, hsv } = hexToRgbHsv(data.backcolor);

                            setColor({
                                hex: data.backcolor,
                                rgb: rgb,
                                hsv: hsv,
                            });
                        } else {
                            setColor({
                                hex: "#000000",
                                rgb: { r: 0, g: 0, b: 0, a: 1 },
                                hsv: { h: 0, s: 0, v: 0, a: 1 },
                            });
                        }

                        if (data.productimgpath) {
                            setPreviewImage(data.productimgpath); // Directly store the image path
                        } else {
                            setPreviewImage(null); // No image available
                        }

                        if (data.brandid) {
                            const matchingBrand = brands.find(
                                (brand) => brand.value === data.brandid
                            );

                            if (matchingBrand) {
                                setSelectedBrand(matchingBrand.value); // ✅ Fix: Set entire object, not just value
                            } else {
                                console.warn("Brand not found in options:", data.brandid);
                            }
                        }

                        // setColor(hexColor);
                    } else {
                        console.error("Error:", response.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch category by ID", err);
                } finally {
                    setTimeout(() => {
                        setIsInitialLoading(false);
                    }, 3000);
                }
            };

            fetchCategoryById();
        }
    }, [token, categoryId, brands]);

    // Fetch brands list from API
    useEffect(() => {
        if (!token) {
            console.warn("Token is not available");
            return;
        }

        const fetchBrands = async () => {
            try {
                // setIsInitialLoading(true);
                const response = await axios.post(
                    `${BASE_URL}/brands/getBrands?start=0&length=-1`,
                    { companyId: 5 },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success === 1 && response.data.data && response.data.data.data) {
                    const brandOptions = response.data.data.data.map((brand) => ({
                        label: brand.brandname, // Display name
                        value: brand.brandid, // Actual value
                    }));

                    setBrands(brandOptions);
                } else {
                    console.error("Error fetching brands:", response.data);
                }
            } catch (err) {
                console.error("Failed to fetch brands", err);
            }
            // finally {
            //     setIsInitialLoading(false);
            // }
        };

        fetchBrands();
    }, [token]);

    // Update color in formData when user picks a color
    const handleColorChange = (newColor) => {
        setColor(newColor);
        setFormData((prev) => ({
            ...prev,
            backcolor: newColor, // Ensure this updates
        }));
    };

    // File upload handler (kept the same as your code)
    const onUpload = (event) => {
        const file = event.files[0]; // Get uploaded file
        if (file.size > 500 * 1024) {
            alert("File size exceeds 500 KB!");
            return;
        }

        setFormData((prevData) => ({
            ...prevData,
            fileName: file.name,
            file: file, // Store file
        }));

        // Create a preview of the image
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result); // Set the image preview
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        const { name, value } = e.target || e;

        // Regex to allow only letters, numbers, and spaces (NO special characters)
        const regex = /^[a-zA-Z0-9\-&().',@$ ]*$/;

        if (regex.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSwitchChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const appearanceOptions = [
        { label: "Text Only", value: 1 },
        { label: "Image Only", value: 2 },
        { label: "Image with Text", value: 3 },
    ];

    // Save function: if categoryId exists, update; otherwise, add new category
    const handleSave = async () => {
        setIsSaving(true); // Start loading
        let hasError = false;

        if (!formData.productCatName.trim()) {
            setProductError("Product Category is required");
            hasError = true;
        } else {
            setProductError("");
        }


        if (hasError) {
            setIsSaving(false); // Stop loading if there's an error
            return;
        }

        if (!token) {
            console.warn("Token is not available");
            setIsSaving(false); // Stop loading if token is missing
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("companyId", 5);
            formDataToSend.append("productCatName", formData.productCatName);
            formDataToSend.append("displayOrder", Number(formData.displayOrder));
            formDataToSend.append("onlineDispName", formData.onlineDisplayName);
            formDataToSend.append("backcolor", color?.hex || "");
            formDataToSend.append("productCatAppearance", formData.productCatAppearance);
            formDataToSend.append("descriptions", formData.descriptions);
            formDataToSend.append("status", formData.status ? 1 : 0);
            formDataToSend.append("hideFromPos", formData.hideFromPOS ? 1 : 0);
            formDataToSend.append(
                "hideFromOnlineOrdering",
                formData.hideFromOnlineOrdering ? 1 : 0
            );

            if (selectedBrand) {
                formDataToSend.append("brandId", selectedBrand); // ✅ Sending the selected brandId
            }

            if (formData.file) {
                formDataToSend.append("image", formData.file); // Send new image if selected
            } else if (categoryId && formData.fileName !== "No file selected") {
                formDataToSend.append("image", formData.fileName); // Send existing image path
            }

            const headers = {
                Authorization: `Bearer ${token}`, // Do not manually set "Content-Type"
            };

            const response = await axios.post(
                categoryId
                    ? `${BASE_URL}/productCategory/updateProductCategory/${categoryId}`
                    : `${BASE_URL}/productCategory/addProductCategory`,
                formDataToSend,
                { headers }
            );

            if (response.data.success === 1) {
                toast.current.show({
                    severity: "success",
                    summary: categoryId ? "Updated" : "Added",
                    detail: categoryId ? "Data Updated Successfully" : "Data Added Successfully",
                    life: 3000,
                });

                // ✅ Reset form after successful add or update
                setFormData({
                    productCatName: "",
                    displayOrder: 0,
                    onlineDisplayName: "",
                    productCatAppearance: 1,
                    descriptions: "",
                    status: true,
                    hideFromPOS: false,
                    hideFromOnlineOrdering: false,
                    file: null,
                    fileName: "No file selected",
                });
                
                setSelectedBrand(null);
                setColor("#000000");
                setPreviewImage(null);

                // Only redirect if updating (categoryId exists)
                if (categoryId) {
                    setTimeout(() => {
                        navigate("/product-category-list");
                    }, 1000);
                }
            } else {
                console.error("Save failed:", response.data);
                alert("Save failed. Please try again.");
            }
        } catch (error) {
            // console.error("Error saving category:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.msg || "An error occurred while saving.",
                life: 2000,
            });
        } finally {
            setIsSaving(false); // Stop loading
        }
    };

    const renderSkeleton = () => (
        <div className="card">
            <div className="grid p-fluid col-12">
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>

                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="3rem" />
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="6.5rem" />
                </div>

                <div className="field col-12 md:col-6 flex flex-col justify-center gap-3 ">
                    <div className="flex items-center gap-3">
                        <Skeleton width="40%" height="1.8rem" className="mb-2" />
                        {/* <Skeleton height="2.5rem" /> */}
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton width="40%" height="1.8rem" className="mb-2" />
                        {/* <Skeleton height="2.5rem" /> */}
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton width="40%" height="1.8rem" className="mb-2" />
                        {/* <Skeleton height="2.5rem" /> */}
                    </div>
                </div>
                <div className="field col-12 md:col-6">
                    <Skeleton width="20%" height="5rem" className="mb-1" />
                </div>
            </div>
            <div className="field col-12">
                <div className="flex justify-content-end">
                    <Skeleton width="6rem" height="3.5rem" className="mb-2" />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div
                className="card-action-menu flex justify-content-between align-items-center border-round"
                style={{
                    border: "1px solid rgba(255, 255, 255, 0.2)", // Subtle border with transparency
                    // backgroundColor: "rgba(255, 255, 255, 0.2)", // Slight transparency for glass effect
                    // backdropFilter: "blur(10px)", // Adds blur effect behind the element for a frosted glass look
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Optional subtle shadow for depth
                }}
            >
                <div className="font-bold ">Product Category</div>

                <div
                    className="flex align-items-center justify-content-center hover:bg-gray-100 p-1 border-round cursor-pointer transition-all"
                    onClick={() => {
                        navigate("/product-category-list");
                    }}
                    title="View Category List"
                >
                    <i className="pi pi-list " style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            {isInitialLoading ? (
                renderSkeleton()
            ) : (
                <div className="card">
                    <div className="grid p-fluid col-12">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-category-dropdown">Select Brand </label>
                            <Dropdown
                                value={selectedBrand} // Selected value
                                options={brands} // Fetched brands list
                                onChange={(e) => {
                                    setSelectedBrand(e.value);
                                    // setBrandError("");
                                }}
                                placeholder="Select Brand"
                                filter
                                showClear
                                // optionLabel="label"
                                // className={BrandError ? "p-invalid" : ""}
                            />
                            {/* {BrandError && <small style={{ color: "red" }}>{BrandError}</small>} */}
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-category">
                                Product Category <span style={{ color: "red" }}>*</span>
                            </label>
                            <InputText
                                name="productCatName"
                                value={formData.productCatName}
                                onChange={(e) => {
                                    handleChange(e);

                                    setProductError(""); // Clear error when the user types
                                }}
                                placeholder="Enter Product Category"
                                className={productError ? "p-invalid" : ""}
                                maxLength={100}
                            />
                            {productError && <small style={{ color: "red" }}>{productError}</small>}
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-code">Display Order</label>
                            <InputNumber
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={(e) =>
                                    handleChange({ name: "displayOrder", value: e.value })
                                }
                                placeholder="Enter Product Code"
                                useGrouping={false}
                                min={0}
                                max={5000}
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-category">Online Display Name</label>
                            <InputText
                                name="onlineDisplayName"
                                value={formData.onlineDisplayName}
                                onInput={handleChange}
                                placeholder="Enter Online Display Name"
                                maxLength={100}
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-appearances">
                                Product Category Appearances
                            </label>
                            <Dropdown
                                options={appearanceOptions}
                                value={formData.productCatAppearance}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        productCatAppearance: e.value,
                                    }))
                                }
                                placeholder="- Please Select Product Appearances -"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-category-image">
                                Product Category Image: (max Size: 500 KB)
                            </label>
                            <div className="flex items-center gap-2">
                                <InputText
                                    id="product-category-image"
                                    value={formData.fileName}
                                    readOnly
                                    className="w-full border rounded px-3 py-2.5 text-gray-600"
                                />
                                <FileUpload
                                    mode="basic"
                                    accept="image/*"
                                    maxFileSize={500000}
                                    onSelect={onUpload}
                                    chooseLabel="Browse"
                                    className="p-button-primary"
                                />
                            </div>
                            {previewImage && (
                                <div className="mt-3">
                                    <img
                                        src={previewImage}
                                        alt="Selected"
                                        className="w-32 h-32 rounded border border-gray-300"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-description">Product Description</label>
                            <InputTextarea
                                id="product-description"
                                name="descriptions"
                                rows={3}
                                cols={30}
                                className="no-resize"
                                value={formData.descriptions}
                                onChange={handleChange}
                                placeholder="Enter product description..."
                                style={{ width: "100%" }}
                                maxLength={400}
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="product-color">Product Color</label>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    backgroundColor: color.hex, // remains unchanged
                                    cursor: "pointer",
                                    border: "1px solid #ccc",
                                }}
                                onClick={() => setShowPicker(!showPicker)}
                            ></div>
                            {showPicker && (
                                <div style={{ position: "absolute", zIndex: 100 }}>
                                    <ColorPicker
                                        height={140}
                                        color={color}
                                        onChange={setColor}
                                        hideInput={["hsv"]}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="field col-12 md:col-6 flex flex-col justify-center gap-3 ">
                            <div className="flex items-center gap-3">
                                <InputSwitch
                                    checked={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.value }))
                                    }
                                />
                                <span>Active</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <InputSwitch
                                    checked={formData.hideFromPOS}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            hideFromPOS: e.value,
                                        }))
                                    }
                                />
                                <span>Hide From POS</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <InputSwitch
                                    checked={formData.hideFromOnlineOrdering}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            hideFromOnlineOrdering: e.value,
                                        }))
                                    }
                                />
                                <span>Hide From Online Ordering</span>
                            </div>
                        </div>
                    </div>
                    <div className="field col-12">
                        <div className="flex justify-content-end mt-2">
                            <Button
                                className={`self-end w-auto `}
                                label={
                                    isSaving
                                        ? categoryId
                                            ? "Updating..."
                                            : "Adding..."
                                        : categoryId
                                        ? "Update"
                                        : "Add"
                                }
                                onClick={handleSave}
                                disabled={isSaving}
                                loading={isSaving}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductCategory;
