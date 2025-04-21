import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";

function ProductSubCategoryMaster() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Loading state
  const [isSaving, setIsSaving] = useState(false); // Saving state
  const token = useSelector((state) => state.auth.token);
  const { id } = useParams();
  const subcategoryid = id || null;

  // Fetch categories list
  useEffect(() => {
    if (!token) return;

    const fetchCategories = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/productCategory/getProductCategoryList?start=0&length=-1`,
          { companyId: 5 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          response.data?.success === 1 &&
          Array.isArray(response.data.data.data)
        ) {
          setCategories(
            response.data.data.data.map((item) => ({
              label: item.productcategoryname,
              value: item.productcategoryid,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
  }, [token]);

  // Fetch existing data if id is present
  useEffect(() => {
    if (!token || !subcategoryid) return;
    setLoading(true); // Set loading state to true
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/productSubCategory/getData/${subcategoryid}`,
          { companyId: 5 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          response.data?.success === 1 &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const subcategory = response.data.data[0]; // Access first item in the array

          setSelectedCategory(subcategory.productcategoryid);
          setSubcategories(subcategory.subcategoryname);
          setDisplayOrder(subcategory.displayorder); // Ensure it's a string for input field
        } else {
          toast.current.show({
            severity: "warn",
            summary: "Warning",
            detail: "Data not found for this ID.",
            life: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.response.data.msg || error.message,
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, subcategoryid]);

  const AddSubCatclick = async () => {
    if (!token) {
      console.warn("Token is not available");
      return;
    }

    try {
      const payload = {
        companyId: 5,
        productCatId: selectedCategory,
        productSubCatName: subcategories,
        displayOrder: displayOrder,
      };

      let response;
      if (subcategoryid) {
        response = await axios.post(
          `${BASE_URL}/productSubCategory/updateProductSubcategory/${subcategoryid}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.post(
          `${BASE_URL}/productSubCategory/addProductSubcategory/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.data.success === 1) {
        toast.current.show({
          severity: "success",
          summary: subcategoryid ? "Updated" : "Added",
          detail: subcategoryid
            ? "Data Updated Successfully"
            : "Data Added Successfully",
          life: 3000,
        });

        setSelectedCategory(null);
        setSubcategories("");
        setDisplayOrder("");

        if (subcategoryid) {
          setTimeout(() => {
            navigate("/product-subcategorylist");
          }, 1000);
        }
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Save failed. Please try again.",
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
      setIsSaving(false);
    }
  };

  const handleAddClick = () => {
    const newErrors = {};

    if (!selectedCategory) {
      newErrors.category = "Please select a product category";
    }
    if (!subcategories || subcategories.trim() === "") {
      newErrors.subcategory = "Please enter a product sub-category";
    }
    if (subcategories.length < 2) {
      newErrors.subcategory =
        "Product sub-category name should be more than 2 characters";
    }
    if (!displayOrder || displayOrder.toString().trim() === "") {
      newErrors.displayOrder = "Please enter a display code";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const Click = () => {
    if (handleAddClick()) {
      AddSubCatclick();
      setIsSaving(true);
    }
  };
  const isAlphanumericWithSpaces = (value) => {
    const regex = /^[a-zA-Z0-9 ]*$/; // includes space
    return regex.test(value);
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="card-action-menu flex justify-content-between align-items-center">
        <div className="text-black">Product Sub-Category Master</div>
        <div
          className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
          onClick={() => navigate("/product-subcategorylist")}
        >
          <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
        </div>
      </div>

      <div className="card">
        <div className="grid p-fluid">
          <div className="field col-12 md:col-4">
            <label>Product Category <span style={{ color: 'red' }}>*</span></label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <Dropdown
                filter
                showClear
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.value);
                  setErrors((prevErrors) => ({ ...prevErrors, category: "" })); // Clear error dynamically
                }}
                options={categories}
                placeholder="- Please Select -"
                className={errors.category ? "p-invalid" : ""}
              />
            )}
            {errors.category && (
              <small className="p-error">{errors.category}</small>
            )}
          </div>

          <div className="field col-12 md:col-4">
            <label>Product Sub-Category <span style={{ color: 'red' }}>*</span></label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                maxLength={50}
                placeholder="Enter Product Sub-Category"
                value={subcategories}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setSubcategories(e.target.value);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      subcategory: "",
                    }));
                  } // Clear error dynamically
                }}
                className={errors.subcategory ? "p-invalid" : ""}
              />
            )}
            {errors.subcategory && (
              <small className="p-error">{errors.subcategory}</small>
            )}
          </div>

          <div className="field col-12 md:col-4">
            <label>Display Order <span style={{ color: 'red' }}>*</span></label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                keyfilter="int"
                maxLength={5}
                placeholder="Enter Display Code"
                value={displayOrder}
                onChange={(e) => {
                  setDisplayOrder(e.target.value);
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    displayOrder: "",
                  })); // Clear error dynamically
                }}
                className={errors.displayOrder ? "p-invalid" : ""}
              />
            )}
            {errors.displayOrder && (
              <small className="p-error">{errors.displayOrder}</small>
            )}
          </div>
        </div>

        <div className="field col-12 flex justify-content-end">
          <Button
            label={
              isSaving
                ? subcategoryid
                  ? "Updating Product-SubCategory..."
                  : "Adding Product-SubCategory..."
                : subcategoryid
                ? "Update Product-SubCategory"
                : "Add Product-SubCategory"
            }
            onClick={Click}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductSubCategoryMaster;
