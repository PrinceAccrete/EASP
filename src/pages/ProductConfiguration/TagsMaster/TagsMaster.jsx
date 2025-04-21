import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { FileUpload } from "primereact/fileupload";

function TagsMaster() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const { id } = useParams();
  const TagsId = id || null;
  const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;
  const [tagname, setTagName] = useState("");
  const [tagImage, setTagImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const [tagImagePreview, setTagImagePreview] = useState(null);
  const [removeImageTag,setRemoveImageTag]= useState(false)

  const AddSubCatclick = async () => {
    if (!token) {
      console.warn("Token is not available");
      return;
    }

    try {
  
      const formdata = new FormData()

      formdata.append('tagName', tagname)
      
      if(tagImage){
        formdata.append('image', tagImage)
      }

      if(removeImageTag){
        formdata.append('removeImage', true)
      }

      let response;
      if (TagsId) {
        response = await axios.post(
          `${BASE_URL}/productTag/updateProductTag/${TagsId}`,
          formdata,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${BASE_URL}/productTag/createProductTag`,
          formdata,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success === 1) {
        toast.current.show({
          severity: "success",
          summary: TagsId ? "Updated" : "Added",
          detail: TagsId
            ? "Data Updated Successfully"
            : "Data Added Successfully",
          life: 3000,
        });

        setTagImage("");

        if (TagsId) {
          setTimeout(() => {
            navigate("/tags-list");
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
      console.error("API Error:", error);
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

  useEffect(() => {
    if (!token || !TagsId) return;
    setLoading(true); // Set loading state to true
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/productTag/getProductTagData/${TagsId}`,

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
          const tags = response.data.data[0]; // Access first item in the array

          setTagName(tags.tagname || ""); // Set tag name from the response
          setTagImagePreview(tags.tagImage); // Set tag image preview from the response
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
  }, [token, TagsId]);

  const isAlphanumericWithSpaces = (value) => {
    const regex = /^[a-zA-Z0-9 ]*$/; // includes space
    return regex.test(value);
  };

  const handleAddClick = () => {
    const newErrors = {};

    if (!tagname || tagname.trim() === "") {
      newErrors.tagname = "Please enter a tag name";
    }
    if (tagname.length < 2) {
      newErrors.tagname = "Tag name should be more than 2 characters";
    }
    if (!tagImage){
      newErrors.tagImage = "Please upload a tag image";
    }

    setError(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const Click = () => {
    if (handleAddClick()) {
      AddSubCatclick();
      setIsSaving(true);
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="card-action-menu flex justify-content-between align-items-center">
        <div className="text-black">Tags Master</div>
        <div
          className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
          onClick={() => navigate("/tags-list")}
        >
          <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
        </div>
      </div>
      <div className="card">
        <div className="grid p-fluid">
          <div className="field col-12 md:col-6">
            <label>Tags Name</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={tagname}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setTagName(e.target.value);
                    setError((prevErrors) => ({
                      ...prevErrors,
                      tagname: "",
                    }));
                  } // Clear error dynamically
                }}
                className={error.tagname ? "p-invalid" : ""}
                placeholder="Please Enter Tag Name"
              ></InputText>
            )}
            {error.tagname && <small className="p-error">{error.tagname}</small>}
          </div>
          <div className="field col-12 md:col-6">
          <div className="border border-slate-200 rounded-md p-4">
                                    <label htmlFor="product-image" className="font-bold">Product Image</label>
                                    <div className="flex flex-wrap items-start md:items-center gap-4 mt-2">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                                    <FileUpload
                                        mode="basic"
                                        accept="image/*"
                                        onSelect={(e) => {
                                          setTagImage(e.files[0]);
                                          setError((prevErrors) => ({
                                            ...prevErrors,
                                            tagImage: "",
                                          }));
                                                setTagImagePreview(URL.createObjectURL(e.files[0]));
                                            setRemoveImageTag(false)
                                            if (e?.files[0]?.size > 50000) {
                                                setError((prev) => ({ ...prev, tagImage: "File size should be less than 50kb" }));
                                                setTagImage(null)
                                            } else {
                                                setError((prev) => ({ ...prev, tagImage: null }));
                                                setTagImage(e.files[0]);
                                                setTagImagePreview(URL.createObjectURL(e.files[0]));
                                            }
                                        }}
                                        auto
                                        disabled={loading}
                                          className={error.tagImage ? "p-invalid" : ""}
 
                                    />
                             {error.tagImage && <small className="p-error">{error.tagImage}</small>}
                                    {tagImagePreview && (
                                        <div className="flex items-center mt-1 justify-between overflow-hidden w-full">
                                            <div className="flex items-center gap-4">
 
                                                <img
                                                    className="w-18 h-18 object-contain"
                                                    src={tagImagePreview}
                                                    alt="Product Image"
                                                    style={{width: "50px", height: "50px", objectFit:'contain'}}
                                                />
 
                                                <div className="flex flex-col gap-1">
                                                    <span>{tagImage?.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {tagImage?.size && !isNaN(tagImage.size)
                                                            ? (tagImage.size / 1024).toFixed(2) + " KB"
                                                            : ""}
                                                    </span>
 
 
                                                </div>
                                           
 
 
                                            <i
                                                className="pi pi-times-circle text-red-500 cursor-pointer"
                                                onClick={() => {
                                                    setTagImage(null)
                                                    setTagImagePreview(null)
                                                    setRemoveImageTag(true)
                                                }}
                                            ></i>
                                             </div>
                                        </div>
                                    )}
                                    </div>
                                    </div>
                                    {/* {error?.productImage && (
                                        <p className='text-red-500 text-sm flex items-center gap-2 mt-3 bg-red-50 px-2 py-2 rounded-lg font-bold'>
                                            <i className='pi pi-times-circle text-sm'></i> {error?.productImage}
                                        </p>
                                    )} */}
                                </div>

                                </div>
        </div>
        <div className="field col-12 flex justify-content-end">
          <Button
            label={
              isSaving
                ? TagsId
                  ? "Updating Tag Name"
                  : "Adding Tag Name"
                : TagsId
                ? "Update Tag Name"
                : "Add Tag Name"
            }
            onClick={Click}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

export default TagsMaster;
