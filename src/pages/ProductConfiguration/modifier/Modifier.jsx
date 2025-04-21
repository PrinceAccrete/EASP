import React, { useEffect, useRef, useState } from 'react'
import { InputText } from "primereact/inputtext";
import './Modifier.css'
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { FileUpload } from 'primereact/fileupload';
import { useSelector } from 'react-redux';
import API from '../../../utils/axios';
import FileUploader from '../FileUpload';
import { useParams, useNavigate } from 'react-router-dom';
import { Chips } from 'primereact/chips';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';

const Modifier = () => {

    let user = useSelector(state => state.auth)
    let ref = useRef(null)
    const toast = useRef(null)
    const navigate = useNavigate()

    let { id } = useParams()

    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isRemoveImage,setIsRemoveImage] = useState(null)

    const [formData, setFormData] = useState({
        modifierName: null,
        modifierCategoryId: null,
        parentModifierId: null,
        foodType: null,
        offlinePrice: null,
        onlinePrice: null,
        maxQtyAllow: null,
        afterMaxQtyPrice: null,
        isOnline: null,
        modifierTags: []
    })

    const [loading, setLoading] = useState(false);
    const [modifierCategories, setModifierCategories] = useState(null);

    const [parentModifiers, setParentModifiers] = useState(null)

    const [tagInput, setTagInput] = useState("");

    const [preview, setPreview] = useState(null)

    const [fileDetails, setFileDetails] = useState({
        name: null,
        size: null
    })

    const [modifierImage, setModifierImage] = useState(null);

    const [errors, setErrors] = useState({})

    const foodTypes = [
        { foodType: "1 - Vegetarian" },
        { foodType: "2 - Non vegetarian" },
        { foodType: "3 - Eggetarian" },
        { foodType: "4 - Not specified" },
    ];

    const getModifierCategories = async () => {

        try {
            let response = await API.post(
                'modifier/getModifierCategoryList',
                { companyId: 5 },
                {
                    params: {
                        start: 0,
                        length: -1,
                    },
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setModifierCategories(response.data.data.data)

        } catch (error) {
            console.log(error)
        }

    }
    const getParentModifiers = async () => {

        try {
            let response = await API.post(
                'modifier/getModifierOfCategory',
                {
                    companyId: 5,
                    modifierCategoryId: [formData?.modifierCategoryId]
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setParentModifiers(response.data.data)

        } catch (error) {
            console.log(error)
        }

    }

    const checkValidation = ({ 
        modifierName, 
        modifierCategoryId, 
        offlinePrice, 
        maxQtyAllow, 
    }) => {
        let errors = {};
        let isValid = true;
        
        if (!modifierName || modifierName.trim() === "") {
            errors.modifierName = "Modifier Name is required";
            isValid = false;
        }
    
        if (!modifierCategoryId) {
            errors.modifierCategoryId = "Modifier Category is required";
            isValid = false;
        }
    
        if (offlinePrice === null || offlinePrice === "") {
            errors.offlinePrice = "Offline Price is required";
            isValid = false;
        }

        if (maxQtyAllow === null || maxQtyAllow === "") {
            errors.maxQtyAllow = "Max Qty Allowed is required";
            isValid = false;
        } 

    
        setErrors(errors);
        return isValid;
    };
    
    const getModifierById = async () => {
        try {
            setIsInitialLoading(true);
            let response = await API.get(
                `modifier/getModifierData/${id}`,
                { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setFormData({
                    modifierName: response?.data?.data[0]?.modifiername,
                    modifierCategoryId: response?.data?.data[0]?.modifiercategoryid,
                    parentModifierId: parseInt(response?.data?.data[0]?.parentmodifierid),
                    foodType: giveFoodType(response?.data?.data[0]?.foodtype),
                    offlinePrice: response?.data?.data[0]?.price,
                    onlinePrice: response?.data?.data[0]?.onlineprice,
                    maxQtyAllow: response?.data?.data[0]?.maxqtyallowed,
                    afterMaxQtyPrice: response?.data?.data[0]?.aftermaxqtyprice,
                    isOnline: response?.data?.data[0]?.isonline ? true : false,
                    modifierTags: response?.data?.data[0]?.modifiertags?.split(","),
                })

                setPreview(response?.data?.data[0]?.modifierimage)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsInitialLoading(false);
        }
    }

    function giveFoodType(foodType) {
        if (foodType === 1) {
            return "1 - Vegetarian"
        }
        else if (foodType === 2) {
            return "2 - Non vegetarian"
        }
        else if (foodType === 3) {
            return "3 - Eggetarian"
        }
        else {
            return "4 - Not specified"
        }
    }
    const handleAddModifier = async () => {


        try {

            let { modifierName, modifierCategoryId, offlinePrice, maxQtyAllow, onlinePrice, foodType, parentModifierId, afterMaxQtyPrice, isOnline, modifierTags } = formData

            const isValid = checkValidation({ modifierName, modifierCategoryId, offlinePrice, maxQtyAllow,onlinePrice,afterMaxQtyPrice })

            if (!isValid) {
                return;
            }
         
            const formDataSubmit = new FormData();

            const requiredFields = { companyId: 5, modifierCategoryId, modifierName, offlinePrice, maxQtyAllow };
            Object.entries(requiredFields).forEach(([key, value]) => formDataSubmit.append(key, value));

            const optionalFields = { parentModifierId, afterMaxQtyPrice, isOnline: isOnline ? 1 : 0, onlinePrice };
            Object.entries(optionalFields).forEach(([key, value]) => value != null && value != '' && formDataSubmit.append(key, value));

            if (foodType) formDataSubmit.append("foodType", foodType[0]);

            [preview, modifierImage].forEach(image => image && formDataSubmit.append("image", image));
;
            if(modifierTags?.length>0) modifierTags?.forEach(tag => formDataSubmit.append("tag[]", tag))

            if(isRemoveImage && id) formDataSubmit.append("removeImage",true)

            setLoading(true)

            const response = await API.post(`modifier/${id ? "updateModifier/" + id : "addModifier"}`, formDataSubmit, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${user.token}`, },
            });


            if (response.data.success) {
                
                toast.current.show({severity:'success', detail:response.data.msg, life: 2000});

                if(id){
                    setTimeout(() => {
                        navigate("/modifier-list")
                    }, 2000);
                }

                // setFormData({
                //     modifierName: '',
                //     modifierCategoryId: null,
                //     parentModifierId: null,
                //     foodType: null,
                //     offlinePrice: null,
                //     onlinePrice: null,
                //     maxQtyAllowed: null,
                //     afterMaxQtyPrice: null,
                //     isOnline: null,
                // })

                // removeImage()
                // setPreview(null)
                // setModifierImage(null)
                // setTagInput("")
            }


        } catch (error) {
            console.log(error)
            return  toast.current.show({severity:'error', summary: 'Error', detail:error?.response?.data.msg, life: 3000});
        }
        finally{
            setLoading(false)
        }
       

    }
    const inputChangeHandler = (e) => {


        const { name, value, type } = e.target;

        const newValue = type === 'checkbox' ? e.target.checked : value;

        setFormData((prev) => ({ ...prev, [name]: newValue }))
        setErrors((prev) => ({ ...prev, [name]: null }))

        
        if (name === "modifierCategoryId" && (!value || value === "")) {
            setFormData((prev) => ({ ...prev, parentModifierId: null }));
            setParentModifiers(null)
        }

    }
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsRemoveImage(false)
            setModifierImage(file);
            setPreview(URL.createObjectURL(file));
            setFileDetails({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
        }
    };
    const removeImage = () => {
        setIsRemoveImage(true)
        setModifierImage(null);
        setPreview(null);
        setFileDetails({ name: null, size: null })
    };


    useEffect(() => {
        getModifierCategories();
        if (id) {
            getModifierById();
        }
    }, [id]); 

    useEffect(() => {
        if (formData?.modifierCategoryId) {
            getParentModifiers();
        }
    }, [formData?.modifierCategoryId]);  
    

    const renderSkeleton = () => (
        <div className="card px-4 p-fluid product-master-card">
            <div className="flex flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field flex-1">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                <div className="field flex-1/3">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
                <div className="field flex-2/3">
                    <Skeleton width="40%" height="1.5rem" className="mb-2" />
                    <Skeleton height="6rem" />
                </div>
            </div>
            <div className="gap-4 w-full flex justify-end mt-2">
                <Skeleton width="8rem" height="2.5rem" />
            </div>
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />

            <div className="card-action-menu  flex justify-content-between align-items-center">
                <div className='font-bold'>Modifier</div>
                <div className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer">
                    <i onClick={() => navigate("/modifier-list")} className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            {isInitialLoading && id ? renderSkeleton() : (
                <div className='card px-4 p-fluid product-master-card'>
                                <div className="flex  flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                    <div className="field flex-1">
                            <label className='font-semibold' htmlFor="modifierCategory">Modifier Category</label>
                            <Dropdown
                                value={formData?.modifierCategoryId}
                                name="modifierCategoryId"
                                onChange={inputChangeHandler}
                                options={modifierCategories || []}
                                optionLabel="modifiercategoryname"
                                optionValue="modifiercategoryid"
                                filter
                                placeholder="Select Modifier Category"
                                showClear
                                disabled={loading}
                            />

                            {errors?.modifierCategoryId && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.modifierCategoryId}</p>}
                        </div>
                        <div className="field flex-1">
                            <label className='font-semibold' htmlFor="modifierName">Modifier</label>
                            <InputText name="modifierName" value={formData.modifierName} onChange={inputChangeHandler} className="w-full" disabled={loading} />
                            {errors?.modifierName && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.modifierName}</p>}
                        </div>
                        <div className="field flex-1">
                            <label className='font-semibold' htmlFor="parentModifier">Parent Modifier</label>
                            <Dropdown
                                value={formData?.parentModifierId}
                                name="parentModifierId"
                                onChange={inputChangeHandler}
                                options={parentModifiers || []}
                                optionLabel="modifiername"
                                optionValue="modifierid"
                                placeholder='Select Parent Modifier'
                                filter
                                showClear
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="flex  flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                        <div className="field flex-1">
                            <label className='font-semibold' htmlFor="">Select Food Type </label>
                            <Dropdown
                                value={formData.foodType}
                                onChange={inputChangeHandler}
                                name="foodType"
                                options={foodTypes}
                                optionLabel="foodType"
                                optionValue="foodType"
                                placeholder='- Please Select -'
                                filter
                                showClear
                                disabled={loading}
                            />
                        </div>
                        <div className="field flex-1">
                            <label className='font-semibold' htmlFor="offlinePrice">Offline Price</label>
                            <InputNumber min={1} max={1000000} name="offlinePrice" defaultValue={0.00} value={formData.offlinePrice} onValueChange={inputChangeHandler} className="w-full" disabled={loading} />
                            {errors?.offlinePrice && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.offlinePrice}</p>}
                        </div>
                        <div className="field flex-1 ">
                            <label className='font-semibold' htmlFor="onlinePrice">Online Price</label>
                            <InputNumber min={1} max={1000000}  name="onlinePrice" defaultValue={0.00} value={formData.onlinePrice} onValueChange={inputChangeHandler} className="w-full" disabled={loading} />
                            {errors?.onlinePrice && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.onlinePrice}</p>}
                        </div>
                    </div>
                    <div className="flex  flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                        <div className="field flex-1">
                            <label className='font-semibold' htmlFor="maxQtyAllow">Max Qty Allowed</label>
                            <InputNumber min={1} max={1000000}  name="maxQtyAllow" defaultValue={0.00} value={formData.maxQtyAllow} onValueChange={inputChangeHandler} className="w-full" disabled={loading} />
                            {errors?.maxQtyAllow && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.maxQtyAllow}</p>}
                        </div>
                        <div className="field flex-1">
                            <label className='font-semibold' htmlFor="afterMaxQtyPrice">After Max Qty Price</label>
                            <InputNumber min={1} max={1000000}  name="afterMaxQtyPrice" value={formData.afterMaxQtyPrice} onValueChange={inputChangeHandler} className="w-full" disabled={loading} />
                            {errors?.afterMaxQtyPrice && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {errors?.afterMaxQtyPrice}</p>}
                        </div>
                        <div className="field flex-1 gap-4 flex  items-center">
                            <label className='font-semibold mb-0'>Is Online Modifier</label>
                            <InputSwitch
                                checked={formData.isOnline}
                                onChange={inputChangeHandler}
                                name="isOnline"
                                id="switch3"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="flex  flex-col lg:flex-row lg:gap-5 gap-1 w-full">
                        <div className="field flex-1/3">
                            <label className='font-semibold' htmlFor="modifierTags">Modifier Tags</label>
                            <Chips value={formData.modifierTags} onChange={(e) => {
                                setFormData((prev) => ({ ...prev, modifierTags: e.value }))
                            }} disabled={loading} />
                        </div>
                        <div className="field flex-2/3">
                            <div className="flex items-center w-full gap-4 p-3 bg-white shadow-md rounded-lg border border-gray-200">
                                {!preview && <div
                                    className="w-1/4 min-h-[80px] bg-gray-100 flex flex-col justify-center items-center cursor-pointer rounded-lg border-2 border-dashed border-gray-400 hover:bg-gray-200 transition flex-1"
                                    onClick={() => ref.current.click()}
                                >
                                    <h1 className="text-center text-gray-500 text-lg font-medium m-0">Click or Drag to Upload Modifier image</h1>
                                </div>}

                                <input className="hidden" ref={ref} type="file" name="image" accept="image/*" onChange={handleImageChange} disabled={loading} />

                                {preview && (
                                    <div className="w-3/4 flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200  flex-1">
                                        <img src={preview} alt="Preview" className="h-14 w-14 object-cover rounded-md shadow-sm border border-gray-300" />

                                        {id && (
                                            <div>
                                                <p className="text-gray-700 text-md font-medium truncate mb-1">{preview?.split("/").pop()}</p>
                                            </div>
                                        )}

                                        {!id && <div className="ml-3 flex-1 flex flex-col justify-center">
                                            <p className="text-gray-700 text-md font-medium truncate mb-1">{fileDetails?.name}</p>
                                            <p className="text-gray-500 text-[10px] mt-0">{fileDetails?.size}</p>
                                        </div>}

                                        <button
                                            className=" text-red-500  text-2xl px-2 py-1 rounded-md ml-3 cursor-pointer "
                                            onClick={removeImage}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="gap-4 w-full flex justify-end mt-2">
                        <Button onClick={handleAddModifier} className="p-button-sm p-button-primary w-fit px-4 font-bold" disabled={loading}>
                            {id ? "Update Modifier" : "Add Modifier"}
                            {loading && <i className="pi pi-spin pi-spinner ml-2" style={{ fontSize: '1rem' }}></i>}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Modifier
