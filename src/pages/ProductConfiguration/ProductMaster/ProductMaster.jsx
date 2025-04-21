import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { ColorPicker, useColor } from "react-color-palette";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Message } from 'primereact/message';
import { Skeleton } from 'primereact/skeleton';
import "react-color-palette/css";
import "./ProductMaster.scss";
import API from "../../../utils/axios";
import { useSelector } from "react-redux";
import { MultiSelect } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { useNavigate, useParams } from "react-router-dom";
import { Chip } from "primereact/chip";



function ProductMaster() {

    const { id } = useParams()
    const token = useSelector((state) => state.auth.token);
    const toast = useRef(null);
    const navigate = useNavigate()
    const [error, setError] = useState({});

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        selectedCategory: null,
        selectedSubCategory: null,
        productCode: null,
        productName: null,
        selectedAppearances: null,
        foodCost: null,
        productDescription: null,
        selectedSellingItem: null,
        code: null,
        selectedFoodType: 1,
        isActive: true,
        isOnlineSell: false,
        productImage: null,
        onlineImage: null,
        selectedMenuList: [],
        selectedLocationList: [],
        selectedChannelList: [],
        selectedTaxProfile: null,
        surveingInformation: null,
        nutritionInformation: null

    })
    const [configuration, setConfiguration] = useState({
        dispplayOnDashboard: false,
        iMandatoryModifierSelection: false,
        ignoreTax: false,
        ignoreDiscount: false,
        isRecommend: false
    })
    const [color, setColor] = useColor("rgb(0, 0, 0)");

    const [showPicker, setShowPicker] = useState(false);

    const [categories, setCategories] = useState([])

    const [subCategories, setSubCategories] = useState([])

    const [taxProfiles, setTaxProfiles] = useState([])

    const [menuList, setMenuList] = useState([])

    const [locationList, setLocationList] = useState([])

    const [channelList, setChannelList] = useState([])

    const [portionList, setPortionList] = useState([])


    const [previewImage, setPreviewImage] = useState({
        onlineImage: false,
        productImage: false
    })

    const [removeImageProduct, setRemoveImageProduct] = useState(false)
    const [removeImageOnline, setRemoveImageOnline] = useState(false)

    const appearances = [
        { appearance: "Image With Text", code: 1 },
        { appearance: "Image Text", code: 2 },
        { appearance: "Text Only", code: 3 },
    ];

    const sellingItems = [{ sellingItem: "Goods", code: 1 }, { sellingItem: "Service", code: 2 }];
    const foodTypes = [{ foodType: "Veg", code: 1 }, { foodType: "Non Veg", code: 0 }];

    const [rows, setRows] = useState([
        {
            portion: null,
            editable: true,
            default: false,
            posPrice: null,
            onlinePrice: null,
            markupPrice: null,
            productCode: "",
        },
    ]);

    const [selectedRow, setSelectedRow] = useState(null);

    const colorPickerRef = useRef(null);

    const handleClickOutside = (event) => {
        if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
            setShowPicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const isLastRowValid = () => {

        const regexValidate = /^[a-zA-Z0-9\-\&()+.,'@[\]$ ]+$/



        const lastRow = rows[rows.length - 1];
        const error = {};
        let isValid = true;

        console.log(lastRow)

        if (!lastRow.portion) {
            error.portionName = "Portion Name is  required";
            isValid = false;
        }

        if (!lastRow.posPrice) {
            error.posPrice = "POS Price is required";
            isValid = false;
        }

        if (formData.selectedMenuList.length > 0) {
            if (lastRow.onlinePrice === null) {
                error.onlinePrice = "Online Price is required";
                isValid = false;
            }
            if (lastRow.markupPrice === null) {
                error.markupPrice = "Markup Price is required";
                isValid = false;
            }
            if (!lastRow.productCode) {
                error.productCodeTwo = "Required Field";
                isValid = false;
            }

            if (!lastRow.productCode) {
                error.productCodeTwo = "Required Field";
                isValid = false;
            }
            if (!regexValidate.test(lastRow.productCode)) {
                error.productCodeTwo = "Product Code Invalid characters. Allowed: letters, numbers, spaces, -, &, (), +, ., ',', @, [, ], $.";
                isValid = false;
            }



        }

        // Check for duplicate portion names
        if (rows.some(row => row?.portion?.portionname === rows[rows.length - 1]?.portion?.portionname && row.editable !== true)) {
            error.portion = "Portion Name already exists";
            isValid = false;
        }

        // Check for duplicate product codes (only if menu is selected)
        if (formData.selectedMenuList.length > 0 && rows.some(row => row.productCode === rows[rows.length - 1].productCode && row.editable !== true)) {
            error.productCodeTwo = "Product Code already exists";
            isValid = false;
        }

        setError(error);
        return isValid;
    };

    const handleAddRow = () => {
        if (!isLastRowValid()) return;
    
        setError((prev) => ({ ...prev, rows: null }));
    
        const isFirstRow = rows.length === 0;
        const updatedRows = [...rows];
    
        // Make previous row non-editable
        if (!isFirstRow) {
            updatedRows[updatedRows.length - 1].editable = false;
        }
    
        // Add new row
        updatedRows.push({
            editable: true,
            default: isFirstRow, // only first one gets default
            posPrice: null,
            onlinePrice: null,
            markupPrice: null,
            productCode: "",
            portion: null,
        });
    
        setRows(updatedRows);
    };
    



const handleRemoveRow = (rowIndex) => {
    const isDefaultRow = rows[rowIndex]?.default;

    const updatedRows = rows.filter((_, index) => index !== rowIndex);

    if (isDefaultRow && updatedRows.length > 0) {
        updatedRows[0].default = true;
    }

    setRows(updatedRows);

    if (selectedRow === rowIndex) {
        setSelectedRow(null);
    }
};



    const selectedFoodTypeTemplate = (option, props) => {


        if (option) {
            return <div>{option.foodType}</div>;
        }

        return <span>{props.placeholder}</span>;
    };

    const foodTypeOptionTemplate = (option) => {
        return <div>{option.foodType}</div>;
    };

    const defaultRadioBodyTemplate = (rowData, props) => {
        const isLastRow = props.rowIndex === rows.length - 1;
        if (isLastRow) return <span></span>; 
    
        return (
            <RadioButton
                inputId={`default-${props.rowIndex}`}
                name="defaultSelection"
                value={props.rowIndex}
                checked={rows[props.rowIndex]?.default}
                onChange={() => {
                    setRows(
                        rows.map((row, index) => ({
                            ...row,
                            default: index === props.rowIndex,
                        }))
                    );
                    setError({ ...error, rows: null });
                }}
            />
        );
    };
    
    



    const nameDropdownBodyTemplate = (rowData, options) => {

        if (rowData.editable) {
            return (
                <>
                    <Dropdown
                        value={rowData.portion}
                        options={[
                            rowData.portion,
                            ...portionList.filter(portion =>
                                !rows.some(row => row.portion?.portionname === portion.portionname)
                            ),
                        ].filter(Boolean)}
                        onChange={(e) => {
                            const updatedRows = [...rows];
                            updatedRows[options.rowIndex].portion = e.value;
                            setRows(updatedRows);
                            setError({ ...error, rows: null, portionName: null });
                        }}
                        optionLabel="portionname"
                        optionValue=""
                        placeholder="Select Name"
                        showClear
                        filter
                        disabled={loading}
                        className={error?.portionName ? 'border-red-500' : ''}
                    />
                    {error.portionName && (
                        <p className='mt-2 w-fit text-red-500 font-semibold flex flex-row items-center gap-2'>
                            <i className='pi pi-times-circle text-sm'></i> {error.portionName}
                        </p>
                    )}
                    {error.portion && (
                        <p className='mt-2 w-fit text-red-500 font-semibold flex flex-row items-center gap-2'>
                            <i className='pi pi-times-circle text-sm'></i> Portion Name already exists
                        </p>
                    )}
                </>
            );
        }

        return <span>{rowData?.portion?.portionname || rowData.name}</span>;
    };


    const defaultRadioTemplate = (rowData, options) => {

        const isLastRow = options.rowIndex === rows.length - 1;
        if (!isLastRow) return rowData?.default ? 'true' : 'false'

        return <div className="flex align-items-center gap-4">
            <InputSwitch
                checked={rowData?.default}
                onChange={(e) => {
                    const updatedRows = [...rows];
                    updatedRows[options.rowIndex].default = e.value;
                    setRows(updatedRows);
                }}
                id="switch1"
                disabled={loading}
            />
        </div>



    }


    const posPriceInputTemplate = (rowData, options) => {
        if (rowData.editable) {
            return (
                <>
                    <InputNumber
                        value={rowData.posPrice}
                        useGrouping={false}
                        maxFractionDigits={3}
                        onValueChange={(e) => {
                            const updatedRows = [...rows];
                            updatedRows[options.rowIndex].posPrice = e.value;
                            setRows(updatedRows);
                            setError({ ...error, posPrice: null });
                        }}
                        placeholder="Enter POS Price"
                        disabled={loading}

                        min={1}
                        max={1000000}
                        className={error?.posPrice ? 'border-red-500' : ''}
                    />
                    {error.posPrice && (
                        <p className='mt-2 w-fit text-red-500 font-semibold flex flex-row items-center gap-2'>
                            <i className='pi pi-times-circle text-sm'></i> {error.posPrice}
                        </p>
                    )}
                </>
            );
        }
        return <span>{rowData.posPrice}</span>;
    };

    const onlinePriceInputTemplate = (rowData, options) => {
        if (rowData.editable) {
            return (
                <>
                    <InputNumber
                        value={rowData.onlinePrice}
                        useGrouping={false}
                        maxFractionDigits={3}
                        onValueChange={(e) => {
                            const updatedRows = [...rows];
                            updatedRows[options.rowIndex].onlinePrice = e.value;
                            setRows(updatedRows);
                            setError({ ...error, onlinePrice: null });
                        }}
                        placeholder="Enter Online Price"
                        min={1}
                        max={1000000}
                        disabled={loading}
                        className={error?.onlinePrice ? 'border-red-500' : ''}
                    />
                    {error.onlinePrice && (
                        <p className='mt-2 w-fit text-red-500 font-semibold flex flex-row items-center gap-2'>
                            <i className='pi pi-times-circle text-sm'></i> Online Price is required
                        </p>
                    )}
                </>
            );
        }
        return <span>{rowData.onlinePrice}</span>;
    };


    const markupPriceInputTemplate = (rowData, options) => {
        if (rowData.editable) {
            return (
                <>
                    <InputNumber
                        value={rowData.markupPrice}
                        useGrouping={false}
                        maxFractionDigits={3}
                        onValueChange={(e) => {
                            const updatedRows = [...rows];
                            updatedRows[options.rowIndex].markupPrice = e.value;
                            setRows(updatedRows);
                            setError({ ...error, markupPrice: null });
                        }}
                        placeholder="Enter Markup Price"
                        min={1}
                        max={1000000}
                        disabled={loading}
                        className={error?.markupPrice ? 'border-red-500' : ''}
                    />
                    {error.markupPrice && (
                        <p className='mt-2 w-fit text-red-500 font-semibold flex flex-row items-center gap-2'>
                            <i className='pi pi-times-circle text-sm'></i> Markup Price is required
                        </p>
                    )}
                </>
            );
        }
        return <span>{rowData.markupPrice}</span>;
    };

    const productCodeInputTemplate = (rowData, options) => {
        if (rowData.editable) {
            return (
                <>
                    <InputText
                        value={rowData.productCode}
                        onChange={(e) => {
                            const updatedRows = [...rows];
                            updatedRows[options.rowIndex].productCode = e.target.value;
                            setRows(updatedRows);
                            setError({ ...error, productCodeTwo: null, ProductCode: null });
                        }}
                        maxLength={10}
                        placeholder="Enter Product Code"
                        disabled={loading}
                        className={error?.productCodeTwo && 'border-red-500'}
                    />

                    {error.productCodeTwo && (
                        <p className='mt-2 w-fit text-red-500 font-semibold flex flex-row items-center gap-2'>
                            <i className='pi pi-times-circle text-sm'></i> {error.productCodeTwo}
                        </p>
                    )}

                </>
            );
        }
        return <span>{rowData.productCode}</span>;
    };

    const actionButtonTemplate = (rowData, options) => {


        const isLastRow = options.rowIndex === rows.length - 1;


        return isLastRow ? (
            <Button
                label="Add Portion"
                onClick={handleAddRow}
                className="p-button-sm p-button-primary"
                disabled={loading}
            />
        ) : (
            <Button
                label="Remove"
                onClick={() => handleRemoveRow(options.rowIndex)}
                className="p-button-sm p-button-danger"
                disabled={loading}
            />
        );
    };


    const getProductCategories = async () => {


        try {

            let response = await API.post('productCategory/getProductCategoryList', {
                companyId: 5
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            })

            if (response.data.success) {
                setCategories(response?.data?.data.data)
            }

        } catch (error) {
            console.log(error)
        }


    }
    const getProductSubCategories = async () => {

        try {

            let response = await API.post('productSubCategory/getProductSubcategoryList', {
                companyId: 5,
                categoryId: [formData.selectedCategory]
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            })

            if (response.data.success) {
                setSubCategories(response?.data?.data?.data)
            }

        } catch (error) {
            console.log(error)
        }

    }
    const getTaxProfileList = async () => {
        try {

            let response = await API.post('tax/getTaxProfileList', {
                companyId: 5
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            })
            if (response.data.success) {
                setTaxProfiles(response.data.data.data)
            }

        } catch (error) {
            console.log(error)
        }

    }

    const getMenuList = async () => {
        try {

            let response = await API.post('menu/getMenuList', {
                companyId: 5
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            })
            if (response.data.success) {
                setMenuList(response.data.data.data)
            }

        } catch (error) {
            console.log(error)
        }

    }
    const getChannelList = async () => {
        try {

            let response = await API.get('channel/getChannelList', {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            })
            if (response.data.success) {
                setChannelList(response.data.data.data)
            }

        } catch (error) {
            console.log(error)
        }

    }
    const getLocationList = async () => {
        try {

            let response = await API.post('location/getLocationList', {
                companyId: 5
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            })
            if (response.data.success) {

                let response2 = await API.post('location/getFranchiseeLocationList', {
                    companyId: 5, locationIds: response?.data.data.map((location) => location.locationid)
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                })
                setLocationList(response2?.data?.data)
            }

        } catch (error) {
            console.log(error)
        }

    }
    const getPortionList = async () => {

        try {

            let response = await API.post('portion/getPortionList', {
                companyId: 5
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            })
            if (response.data.success) {
                setPortionList(response.data.data.data)
            }

        } catch (error) {
            console.log(error)
        }


    }




    const checkValidation =
        (selectedCategory, productCode, productName, selectedAppearances, foodCost, selectedTaxProfile, selectedSellingItem, rows, selectedFoodType, selectedChannelList, selectedLocationList, isOnlineSell, surveingInformation, nutritionInformation, productDescription, code) => {

            let error = {}
            let isValid = true
            const regexValidate = /^[a-zA-Z0-9\-\&()+.,'@[\]$ ]+$/;
            const allowedCharsMsg = "Invalid characters. Allowed: letters, numbers, spaces, -, &, (), +, ., ',', @, [, ], $.";



            if (!selectedCategory) {
                error.selectedCategory = "Product Category is required"
                isValid = false
            }
            if (!productCode || productCode?.trim() === "") {
                error.productCode = "Product Code is required"
                isValid = false
            } else if (!regexValidate.test(productCode)) {
                error.productCode = "Product Code " + allowedCharsMsg
                isValid = false
            }
            if (!productName || productName?.trim() == "") {
                error.productName = "Product Name is required"
                isValid = false
            } else if (!regexValidate.test(productName)) {
                error.productName = "Product Name " + allowedCharsMsg
                isValid = false
            }

            if (!selectedAppearances) {
                error.selectedAppearances = "Product Appearances is required"
                isValid = false
            }

            if (!foodCost) {
                error.foodCost = "Food Cost is required"
                isValid = false
            }
            if (!selectedTaxProfile) {
                error.selectedTaxProfile = "Tax Profile is required"
                isValid = false
            }

            if (selectedSellingItem == null || selectedSellingItem == undefined) {
                error.selectedSellingItem = "Selling Item is required"
                isValid = false
            }

            if (rows.length === 1) {
                error.rows = "Please add at least one Portion"
                isValid = false
            }

            if (rows.length > 1 && !rows.some(row => row.default)) {
                error.rows = "Select Default Portion"
                isValid = false
            }

            if (selectedFoodType === null || selectedFoodType === undefined) {
                error.selectedFoodType = "Food Type is required";
                isValid = false;
            }


            if (isOnlineSell && selectedChannelList.length === 0) {
                error.selectedChannelList = "Channel is required"
                isValid = false
            }

            if (isOnlineSell && selectedLocationList.length === 0) {
                error.selectedLocationList = "Location is required"
                isValid = false
            }


            if (!regexValidate.test(productDescription)) {
                error.productDescription = "Product Description " + allowedCharsMsg
                isValid = false
            }



            if (!regexValidate.test(surveingInformation)) {
                error.surveingInformation = "Serving Information " + allowedCharsMsg
                isValid = false
            }

            if (!regexValidate.test(nutritionInformation)) {
                error.nutritionInformation = "Nutrition Information " + allowedCharsMsg
                isValid = false
            }

            if (!regexValidate.test(code)) {
                error.code = "code " + allowedCharsMsg
                isValid = false
            }
            

            setError(error)
            return isValid
        }


    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    console.log(error)

    const scrollToBottom = () => {
        window.scrollTo({
            bottom: 0,
            behavior: "smooth",
        });
    };



    const addProductHandler = async () => {
        try {
            setLoading(true);

            const {
                selectedCategory, selectedSubCategory, productCode, productName, selectedAppearances,
                foodCost, selectedTaxProfile, productDescription, productImage,
                onlineImage, selectedSellingItem, code, selectedFoodType, isActive, isOnlineSell,
                selectedMenuList, selectedLocationList, selectedChannelList, surveingInformation, nutritionInformation
            } = formData;

            if (!checkValidation(
                selectedCategory, productCode, productName, selectedAppearances,
                foodCost, selectedTaxProfile, selectedSellingItem,
                rows, selectedFoodType, selectedChannelList, selectedLocationList, isOnlineSell, surveingInformation, nutritionInformation, productDescription, code
            )) {


                const isInvalid =
                    selectedChannelList.length === 0 && isOnlineSell ||
                    selectedLocationList.length === 0 && isOnlineSell ||
                    rows.length <= 1 || error.rows;

                if (isInvalid) {
                    return;
                }

                scrollToTop();



                return;
            }

            const formData2 = new FormData();
            const config = configuration || {};

            const productData = {
                companyId: 5,
                prodCatId: selectedCategory,
                prodSubCatId: selectedSubCategory ? Number(selectedSubCategory) : '',
                prodCode: productCode,
                prodName: productName,
                prodAppearances: selectedAppearances,
                foodCost: Number(foodCost),
                taxProfileId: selectedTaxProfile,
                dispOnDashboard: config.dispplayOnDashboard ? 1 : 0,
                isMandModSel: config.iMandatoryModifierSelection ? 1 : 0,
                ignoreTax: config.ignoreTax ? 1 : 0,
                ignoreDisc: config.ignoreDiscount ? 1 : 0,
                isRecommend: config.isRecommend ? 1 : 0,
                prodDesc: productDescription || '',
                sellItemAs: selectedSellingItem,
                hsnSecCode: code || '',
                vegNonveg: selectedFoodType ? 1 : 0,
                isActive: isActive ? 1 : 0,
                color: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
                isOnlineSell: isOnlineSell ? 1 : 0,
                surveingInformation: surveingInformation || '',
                nutritionInformation: nutritionInformation || '',
            };

            if (productImage) {
                formData2.append('prodImg', productImage);
            }
            if (onlineImage) {
                formData2.append('onlineImg', onlineImage);
            }

            if (id) {
                if (removeImageProduct) {
                    productData.removeImageProd = true;
                }
                if (removeImageOnline) {
                    productData.removeImageOnline = true;
                }
            }

            Object.entries(productData).forEach(([key, value]) => {
                formData2.append(key, value);
            });

            const submitRows = rows.filter((row) => !row.editable);
            submitRows.forEach((row, index) => {
                formData2.append(`portions[${index}][portionId]`, row?.portion?.portionid);
                formData2.append(`portions[${index}][isDefault]`, row.default ? 1 : 0);
                formData2.append(`portions[${index}][posPrice]`, Number(row.posPrice));
                if (row.productPortionId) {
                    formData2.append(`portions[${index}][productPortionId]`, row.productPortionId);
                }
                if (row.onlinePrice && formData.selectedMenuList.length > 0) {
                    formData2.append(`portions[${index}][onlinePrice]`, Number(row.onlinePrice));
                }
                if (row.markupPrice && formData.selectedMenuList.length > 0) {
                    formData2.append(`portions[${index}][markupPrice]`, Number(row.markupPrice));
                }
                if (row.productCode) {
                    formData2.append(`portions[${index}][prodCode]`, row.productCode);
                }
            });

            if (!id) {
                if (selectedMenuList.length > 0) {
                    selectedMenuList.forEach((menu) => {
                        formData2.append('menuId[]', menu);
                    });
                }

                selectedLocationList.forEach((location) => {
                    formData2.append('locationId[]', location);
                });




                selectedChannelList.forEach((channel) => {
                    formData2.append('channelId[]', channel);
                });
            }


            if (selectedTags.length > 0) {
                selectedTags?.forEach((tagId) => {
                    formData2.append('productTagIds[]', tagId);
                });
            }


            const endpoint = id ? `product/updateProduct/${id}` : 'product/insertProduct';
            const response = await API.post(endpoint, formData2, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {

                scrollToTop()

                toast.current.show({
                    severity: 'success',
                    detail: response.data.msg,
                    life: 3000
                });

                // setFormData({
                //     selectedCategory: null,
                //     selectedSubCategory: null,
                //     productCode: '',
                //     productName: '',
                //     selectedAppearances: null,
                //     foodCost: null,
                //     productDescription: '',
                //     selectedSellingItem: null,
                //     code: '',
                //     selectedFoodType: null,
                //     isActive: false,
                //     isOnlineSell: true,
                //     productImage: null,
                //     onlineImage: null,
                //     selectedMenuList: [],
                //     selectedLocationList: [],
                //     selectedChannelList: [],
                //     selectedTaxProfile: null,
                //     surveingInformation: '',
                //     nutritionInformation: ''
                // });
                // setRows([{
                //     portion: null,
                //     editable: true,
                //     default: false,
                //     posPrice: null,
                //     onlinePrice: null,
                //     markupPrice: null,
                //     productCode: "",
                // }]);

                // setConfiguration({
                //     dispplayOnDashboard: false,
                //     iMandatoryModifierSelection: false,
                //     ignoreTax: false,
                //     ignoreDiscount: false,
                //     isRecommend: false,
                // })

                // setColor({
                //     rgb: { r: 0, g: 0, b: 0 },
                //     hsv: { h: 0, s: 0, v: 0, a: 1 },
                //     hex: '#000000'
                // })

                // setPreviewImage({
                //     onlineImage: null,
                //     productImage: null
                // })

                // setTimeout(() => {
                //     navigate('/product-list');
                // }, 2000);
            }

        } catch (error) {
            console.error('Error in addProductHandler:', error);
            toast.current.show({
                severity: 'error',
                detail: error?.response?.data?.msg || 'An error occurred while saving the product',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    }

    console.log(formData)

    const inputChangeHandler = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;





        setFormData((prev) => {
            const updatedData = { ...prev, [name]: newValue };

            if (name === "selectedCategory") {
                updatedData.selectedSubCategory = null;
                setSubCategories(null);
            }

            return updatedData;
        });

        setError((prev) => ({ ...prev, [name]: null }));
    };

    // const inputChangeHandler = (e) => {

    //     const { name, value, type } = e.target;

    //     const newValue = type === 'checkbox' ? e.target.checked : value;



    //     setFormData((prev) => ({ ...prev, [name]: newValue }))
    //     setError((prev) => ({ ...prev, [name]: null }))


    //     console.log(name,value)


    //     if (name === "selectedCategory" && (!newValue || newValue === "")) {
    //         setFormData((prev) => ({    ...prev, selectedSubCategory: null }));
    //         setSubCategories(null)
    //     }

    //     if(name === "selectedCategory"){
    //         setFormData((prev) => ({ ...prev, selectedSubCategory: null }));
    //         setSubCategories(null)

    //     }


    // }



    const renderSkeleton = () => (
        <div className="grid">
            <div className="col-12 xl:col-4 lg:col-6">
                <div className="card p-fluid product-master-card">
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                </div>
            </div>
            <div className="col-12 xl:col-4 lg:col-6">
                <div className="card p-fluid product-master-card">
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                </div>
            </div>
            <div className="col-12 xl:col-4 lg:col-12">
                <div className="card p-fluid product-master-card">
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div className="field col-12">
                        <Skeleton width="40%" height="1.5rem" className="mb-2" />
                        <Skeleton height="2.5rem" />
                    </div>
                </div>
            </div>
        </div>
    );

    const parseRgbColor = (colorString) => {
        const rgbMatch = colorString?.match(/\d+(\.\d+)?/g);

        if (!rgbMatch || rgbMatch.length < 3) return null;

        const [r, g, b] = rgbMatch.slice(0, 3).map(Number).map(Math.round);

        const toHex = (val) => val.toString(16).padStart(2, '0');
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        const rgbToHsv = (r, g, b) => {
            r /= 255;
            g /= 255;
            b /= 255;

            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const delta = max - min;

            let h = 0;
            if (delta !== 0) {
                if (max === r) {
                    h = ((g - b) / delta) % 6;
                } else if (max === g) {
                    h = (b - r) / delta + 2;
                } else {
                    h = (r - g) / delta + 4;
                }
                h = Math.round(h * 60);
                if (h < 0) h += 360;
            }

            const s = max === 0 ? 0 : (delta / max);
            const v = max;

            return {
                h,
                s: Math.round(s * 100),
                v: Math.round(v * 100),
                a: 1
            };
        };

        return {
            rgb: { r, g, b },
            hex,
            hsv: rgbToHsv(r, g, b)
        };
    };


    const getProductById = async () => {
        try {
            setIsInitialLoading(true);
            let response = await API.get(`product/getProductData/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log(response.data.data.tags)

            if (response.data.success) {
                setFormData({
                    selectedCategory: response.data.data.productCategoryId,
                    selectedSubCategory: response.data.data.subCategory ? response.data.data.subCategory : null,
                    productCode: response.data.data.productCode,
                    productName: response.data.data.productName,
                    selectedAppearances: response.data.data.appearancesId,
                    foodCost: response.data.data.unitPrice,
                    selectedTaxProfile: response.data.data.taxProfileId,
                    productDescription: response.data.data.description,
                    selectedSellingItem: response.data.data.sellingProductAsValue == 'Goods' ? 1 : 2,
                    code: response.data.data.hsnSecCode,
                    selectedFoodType: response.data.data.isVeg ? 1 : 0,
                    isActive: response.data.data.isActive == 1 ? true : false,
                    isOnlineSell: response.data.data.isOnlineSell == 1 ? true : false,
                    selectedMenuList: response.data.data.menuIds || [],
                    selectedLocationList: response.data.data.locationIds || [],
                    selectedChannelList: response.data.data.channelIds || [],
                    surveingInformation: response.data.data.surveingInformation || '',
                    nutritionInformation: response.data.data.nutritionInformation || ''
                });

                setPreviewImage({
                    onlineImage: response.data.data.onlineImg,
                    productImage: response.data.data.productImg,
                });

                setConfiguration({
                    dispplayOnDashboard: response.data.data.isVisible ? true : false,
                    iMandatoryModifierSelection: response.data.data.isModifierMandatory ? true : false,
                    ignoreTax: response.data.data.ignoreTax ? true : false,
                    ignoreDiscount: response.data.data.ignoreDiscount ? true : false,
                    isRecommend: response.data.data.recommendedProduct ? true : false,
                });

                setRows([
                    ...response.data.data.portionDetails.map(portion => ({
                        portion: { portionid: portion.portionId, portionname: portion.portionName },
                        editable: false,
                        default: portion.isDefault,
                        posPrice: portion.price,
                        onlinePrice: portion.onlinePrice,
                        markupPrice: portion.markupPrice,
                        productCode: portion.productCode,
                        productPortionId: portion.productPortionId
                    })),
                    {
                        portion: null,
                        editable: true,
                        default: false,
                        posPrice: null,
                        onlinePrice: null,
                        markupPrice: null,
                        productCode: "",
                    }
                ]);

                let arr = response.data.data.tags.map((t) => t.tid)
                setSelectedTags(arr)

                const rgbMatch = response.data?.data?.backColor?.match(/\d+(\.\d+)?/g);


                if (rgbMatch) {

                    const colorData = parseRgbColor(response.data?.data?.backColor);

                    if (colorData) {
                        const { rgb, hsv, hex } = colorData;

                        setColor({
                            rgb,
                            hsv,
                            hex
                        });
                    }

                }




            }
        } catch (error) {
            console.log(error)
            console.error('Error fetching product:', error);
        } finally {
            setIsInitialLoading(false);
        }
    };



    const [productTags, setProductTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    console.log(selectedTags)


    const getProductTags = async () => {
        try {
            let response = await API.get('productTag/getProductTagList', {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    start: 0,
                    length: -1
                }
            });
            if (response.data.success) {
                setProductTags(response.data.data.data);
            }
        } catch (error) {
            console.error('Error fetching product tags:', error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    getProductCategories(),
                    getTaxProfileList(),
                    getMenuList(),
                    getLocationList(),
                    getChannelList(),
                    getPortionList(),
                    getProductTags()
                ]);

                if (id) {
                    await getProductById();
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };

        loadInitialData();
    }, [id]);

    useEffect(() => {
        if (formData?.selectedCategory) {
            getProductSubCategories()
        }
    }, [formData.selectedCategory])

    // useEffect(() => {
    //     if(formData?.isOnlineSell){
    //         getLocationList(),
    //         getChannelList()
    //     }
    // }, [formData?.isOnlineSell]);3
    console.log(selectedTags)


    return (
        <div>
            <Toast ref={toast} />
            <div className="card-action-menu flex justify-content-between align-items-center">
                <div className="font-bold text-[1.2rem]" >   {id ? "Update Product" : "Product"}</div>
                <div className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer">
                    <i onClick={() => navigate("/product-list")} className="pi pi-list" style={{ fontSize: "1.3rem" }} />
                </div>
            </div>

            {isInitialLoading && id ? (
                renderSkeleton()
            ) : (
                <div className="grid">
                    <div className="col-12 xl:col-4 lg:col-6">
                        <div className="card p-fluid product-master-card">
                            <div className="field col-12">
                                <label htmlFor="product-category-dropdown" className="font-bold">Product Category</label>
                                <Dropdown
                                    value={formData.selectedCategory}
                                    onChange={inputChangeHandler}
                                    name="selectedCategory"
                                    options={categories}
                                    optionLabel="productcategoryname"
                                    optionValue="productcategoryid"
                                    placeholder="Select a Category"
                                    className={`w-full ${error?.selectedCategory ? 'border-red-500' : ''}`}
                                    showClear
                                    filter
                                    disabled={loading}
                                />
                                {error?.selectedCategory && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.selectedCategory}</p>}
                            </div>
                            <div className="field col-12">
                                <label htmlFor="product-subcategory-dropdown" className="font-bold">Product Sub Category</label>
                                <Dropdown
                                    value={formData.selectedSubCategory}
                                    onChange={inputChangeHandler}
                                    name="selectedSubCategory"
                                    options={subCategories}
                                    optionLabel="subcategoryname"
                                    optionValue="subcategoryid"
                                    placeholder="Select a SubCategory"
                                    className="w-full "
                                    showClear
                                    filter
                                    disabled={loading}
                                />
                            </div>
                            <div className="field col-12">
                                <label htmlFor="product-code" className="font-bold">Product Code</label>
                                <InputText
                                    value={formData.productCode}
                                    placeholder="Enter Product Code"
                                    onChange={(e) => {
                                        inputChangeHandler(e);
                                    }}
                                    name="productCode"
                                    disabled={loading}
                                    maxLength={100}
                                    className={error?.productCode ? 'border-red-500' : ''}
                                />
                                {error?.productCode && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.productCode}</p>}
                            </div>
                            <div className="field col-12">
                                <label htmlFor="product-name" className="font-bold">Product Name</label>
                                <InputText
                                    value={formData.productName}
                                    placeholder="Enter Product Name"
                                    onChange={(e) => {
                                        inputChangeHandler(e)
                                    }}
                                    maxLength={100}
                                    name="productName"
                                    disabled={loading}
                                    className={error?.productName ? 'border-red-500' : ''}
                                />
                                {error?.productName && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.productName}</p>}
                            </div>
                            <div className="field col-12">
                                <label htmlFor="product-appearances" className="font-bold">Product Appearances</label>

                                <Dropdown
                                    value={formData.selectedAppearances}
                                    onChange={inputChangeHandler}
                                    name="selectedAppearances"
                                    options={appearances}
                                    optionLabel="appearance"
                                    optionValue="code"
                                    placeholder="Select Product Appearances"
                                    filter
                                    showClear
                                    disabled={loading}
                                    className={error?.selectedAppearances ? 'border-red-500' : ''}
                                />
                                {error?.selectedAppearances && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.selectedAppearances}</p>}
                            </div>

                            <div className="field col-12">
                                <label htmlFor="surveingInformation" className="font-bold">Serving Information</label>

                                <InputText
                                    value={formData.surveingInformation}
                                    onChange={(e) => {
                                        inputChangeHandler(e);
                                    }}
                                    maxLength={100}
                                    name="surveingInformation"
                                    placeholder="Enter Serving Information"
                                    disabled={loading}
                                    className={error?.surveingInformation ? 'border-red-500' : ''}

                                />

                                {error?.surveingInformation && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.surveingInformation}</p>}


                            </div>

                        </div>
                    </div>
                    <div className="col-12 xl:col-4 lg:col-6">
                        <div className="card p-fluid product-master-card">
                            <div className="field col-12">
                                <label htmlFor="standard-food-cost" className="font-bold">Standard Food Cost</label>
                                <InputNumber
                                    value={formData.foodCost}
                                    onValueChange={(e) => {
                                        inputChangeHandler(e)

                                    }}
                                    name="foodCost"
                                    placeholder="Enter Food Cost"
                                    min={1}
                                    max={100000}
                                    disabled={loading}
                                    useGrouping={false}
                                    maxFractionDigits={3}
                                    inputClassName={`w-full rounded-md ${error?.foodCost ? 'border border-red-500' : 'border border-gray-300'}`}
                                />
                                {error?.foodCost && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.foodCost}</p>}
                            </div>
                            <div className="field col-12">
                                <label htmlFor="tax-profile" className="font-bold">Tax Profile</label>
                                <Dropdown
                                    value={formData.selectedTaxProfile}
                                    onChange={inputChangeHandler}
                                    name="selectedTaxProfile"
                                    options={taxProfiles}
                                    optionLabel="taxprofilename"
                                    optionValue="taxprofileid"
                                    placeholder="Select Tax Profile"
                                    filter
                                    showClear
                                    disabled={loading}
                                    className={error?.selectedTaxProfile ? 'border-red-500' : ''}
                                />
                                {error?.selectedTaxProfile && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.selectedTaxProfile}</p>}
                            </div>
                            <div className="field col-12">
                                <label htmlFor="configuration" className="font-bold mb-2" >Configuration</label>
                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center gap-3">
                                        <div className="flex align-items-center">
                                            <InputSwitch
                                                checked={configuration.dispplayOnDashboard}
                                                onChange={(e) => setConfiguration(prev => ({ ...prev, dispplayOnDashboard: e.value }))}
                                                id="switch1"
                                                disabled={loading}
                                            />

                                        </div>
                                        <div>
                                            <label htmlFor="switch1" className="switch-label font-medium">
                                                Want to display this Product on DashBoard?
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex align-items-center gap-3">
                                        <div className="flex align-items-center">
                                            <InputSwitch
                                                checked={configuration.iMandatoryModifierSelection}
                                                onChange={(e) => setConfiguration(prev => ({ ...prev, iMandatoryModifierSelection: e.value }))}
                                                id="switch1"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="switch2" className="switch-label font-medium">
                                                Is Modifier Selection Mandatory?
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex align-items-center gap-3">
                                        <div className="flex align-items-center">
                                            <InputSwitch
                                                checked={configuration.ignoreTax}
                                                onChange={(e) => setConfiguration(prev => ({ ...prev, ignoreTax: e.value }))}
                                                id="switch1"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="switch3" className="switch-label font-medium">
                                                Ignore Tax
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex align-items-center gap-3">
                                        <div className="flex align-items-center">
                                            <InputSwitch
                                                checked={configuration.ignoreDiscount}
                                                onChange={(e) => setConfiguration(prev => ({ ...prev, ignoreDiscount: e.value }))}
                                                id="switch1"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="switch4" className="switch-label font-medium">
                                                Ignore Discount
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex align-items-center gap-3">
                                        <div className="flex align-items-center">
                                            <InputSwitch
                                                checked={configuration.isRecommend}
                                                onChange={(e) => setConfiguration(prev => ({ ...prev, isRecommend: e.value }))}
                                                id="switch1"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="switch5" className="switch-label font-medium  ">
                                                Is Recomended Product
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="field col-12">
                                <label htmlFor="product-description" className="font-bold">Product Description</label>
                                <InputTextarea
                                    value={formData.productDescription}
                                    onChange={(e) => {
                                        inputChangeHandler(e)
                                    }}
                                    maxLength={100}
                                    name="productDescription"
                                    placeholder="Enter Product Description"
                                    rows={3}
                                    cols={30}
                                    className={`no-resize ${error?.productDescription ? 'border-red-500' : ''}`}
                                    disabled={loading}
                                />

                                {error?.productDescription && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.productDescription}</p>}

                            </div>
                            <div className="field col-12">
                                <label htmlFor="product-tags" className="font-bold">Product Tags</label>
                                <MultiSelect
                                    value={selectedTags}
                                    onChange={(e) => {
                                        setSelectedTags(e.value);
                                    }}
                                    options={productTags}
                                    optionLabel="tagname"
                                    optionValue="tid"
                                    placeholder="- Please Select Tags -"
                                    className="w-full"
                                    filter
                                    showClear
                                />

                                {
                                    selectedTags.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTags.map(tagId => {
                                                    const tag = productTags.find(t => t.tid === tagId);
                                                    return (
                                                        <Chip
                                                            key={tagId}
                                                            label={tag?.tagname}
                                                            removable
                                                            image={tag?.tagimage}
                                                            onRemove={() => {
                                                                setSelectedTags(prev => prev.filter(id => id !== tagId));
                                                            }}
                                                        >

                                                        </Chip>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-12 xl:col-4 lg:col-12">
                        <div className="card p-fluid product-master-card">

                            <div className="field flex gap-3 flex-col">


                                <div className="border border-slate-200 rounded-md p-4">
                                    <label htmlFor="product-image" className="font-bold">Product Image</label>
                                    <FileUpload
                                        mode="basic"
                                        className="mt-2"
                                        accept="image/*"
                                        onSelect={(e) => {
                                            setRemoveImageProduct(false)
                                            if (e?.files[0]?.size > 5000000) {
                                                setError((prev) => ({ ...prev, productImage: "File size should be less than 5 MB" }));
                                                setFormData((prev) => ({ ...prev, productImage: null }));
                                                setPreviewImage((prev) => ({ ...prev, productImage: null }));
                                            } else {
                                                setError((prev) => ({ ...prev, productImage: null }));
                                                setFormData((prev) => ({ ...prev, productImage: e.files[0] }));
                                                setPreviewImage((prev) => ({ ...prev, productImage: URL.createObjectURL(e.files[0]) }));
                                            }
                                        }}
                                        auto
                                        chooseLabel="Browse"
                                        disabled={loading}

                                    />

                                    {previewImage?.productImage && (
                                        <div className="flex items-center mt-4 justify-between">
                                            <div className="flex items-center gap-4">

                                                <img
                                                    className="w-18 h-18 object-contain"
                                                    src={previewImage?.productImage}
                                                    alt="Product Image"
                                                />

                                                <div className="flex flex-col gap-1">
                                                    <span className="truncate w-40">{formData.productImage?.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {formData?.productImage?.size && !isNaN(formData.productImage.size)
                                                            ? (formData.productImage.size / 1024).toFixed(2) + " KB"
                                                            : ""}
                                                    </span>


                                                </div>
                                            </div>


                                            <i
                                                className="pi pi-times-circle text-red-500 cursor-pointer"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, productImage: null }));
                                                    setPreviewImage((prev) => ({ ...prev, productImage: null }));
                                                    setRemoveImageProduct(true)
                                                }}
                                            ></i>
                                        </div>
                                    )}

                                    {error?.productImage && (
                                        <p className='text-red-500 text-sm flex items-center gap-2 mt-3 bg-red-50 px-2 py-2 rounded-lg font-bold'>
                                            <i className='pi pi-times-circle text-sm'></i> {error?.productImage}
                                        </p>
                                    )}
                                </div>

                                <div className="border border-slate-200 rounded-md p-4">
                                    <label htmlFor="product-image" className="font-bold">Online Image</label>
                                    <FileUpload
                                        mode="basic"
                                        className="mt-2"
                                        accept="image/*"
                                        onSelect={(e) => {
                                            setRemoveImageOnline(false)
                                            if (e?.files[0]?.size > 1000000) {
                                                setError((prev) => ({ ...prev, onlineImage: "File size should be less than 5 MB" }));
                                                setFormData((prev) => ({ ...prev, onlineImage: null }));
                                                setPreviewImage((prev) => ({ ...prev, onlineImage: null }));
                                            } else {
                                                setError((prev) => ({ ...prev, onlineImage: null }));
                                                setFormData((prev) => ({ ...prev, onlineImage: e.files[0] }));
                                                setPreviewImage((prev) => ({ ...prev, onlineImage: URL.createObjectURL(e.files[0]) }));
                                            }
                                        }}
                                        auto
                                        chooseLabel="Browse"
                                        disabled={loading}

                                    />


                                    {previewImage?.onlineImage && (
                                        <div className="flex items-center mt-4 justify-between">
                                            <div className="flex items-center gap-4">

                                                <img
                                                    className="w-18 h-18 object-contain"
                                                    src={previewImage?.onlineImage}
                                                    alt="Product Image"
                                                />

                                                <div className="flex flex-col gap-1">
                                                    <span className="truncate w-40">{formData.onlineImage?.name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {formData?.onlineImage?.size && !isNaN(formData.onlineImage.size)
                                                            ? (formData.onlineImage.size / 1024).toFixed(2) + " KB"
                                                            : ""}
                                                    </span>

                                                </div>
                                            </div>


                                            <i
                                                className="pi pi-times-circle text-red-500 cursor-pointer"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, onlineImage: null }));
                                                    setPreviewImage((prev) => ({ ...prev, onlineImage: null }));
                                                    setRemoveImageOnline(true)
                                                }}
                                            ></i>
                                        </div>
                                    )}

                                    {error?.onlineImage && (
                                        <p className='text-red-500 text-sm flex items-center gap-2 mt-3 bg-red-50 px-2 py-2 rounded-lg font-bold'>
                                            <i className='pi pi-times-circle text-sm'></i> {error?.onlineImage}
                                        </p>
                                    )}
                                </div>


                                <div className="field">
                                    <label htmlFor="nutritionInformation" className="font-bold">Nutrition Information</label>

                                    <InputText
                                        value={formData.nutritionInformation}
                                        onChange={(e) => {
                                            inputChangeHandler(e)
                                        }}
                                        maxLength={100}
                                        name="nutritionInformation"
                                        placeholder="Enter Nutrition Information"
                                        disabled={loading}
                                        className={error?.nutritionInformation ? 'border-red-500' : ''}
                                    />


                                    {error?.nutritionInformation && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.nutritionInformation}</p>}
                                </div>


                            </div>

                            <div className="grid">
                                <div className="col-6">
                                    <div className="field">
                                        <label htmlFor="selling-item" className="font-bold">Selling Item As</label>
                                        <Dropdown
                                            value={formData.selectedSellingItem}
                                            onChange={inputChangeHandler}
                                            name="selectedSellingItem"
                                            options={sellingItems}
                                            optionLabel="sellingItem"
                                            optionValue="code"
                                            placeholder="Select Preference"
                                            showClear
                                            disabled={loading}
                                            className={error?.selectedSellingItem ? 'border-red-500' : ''}
                                        />
                                        {error?.selectedSellingItem && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.selectedSellingItem}</p>}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="field">
                                        <label htmlFor="hsn-sac-code" className="font-bold">{
                                        }   {
                                                formData.selectedSellingItem == '2' && formData.selectedSellingItem ? 'SAC CODE' : 'HSN CODE'
                                            }</label>
                                        <InputText
                                            value={formData.code}
                                            placeholder={formData.selectedSellingItem == '2' && formData.selectedSellingItem ? 'Enter SAC CODE' : 'Enter HSN CODE'}
                                            onChange={(e) => {
                                                inputChangeHandler(e)
                                            }}
                                            maxLength={10}
                                            name="code"
                                            disabled={loading}
                                            className={error?.code ? 'border-red-500' : ''}


                                        />

                                        {error?.code && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.code}</p>}


                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="field">
                                        <label htmlFor="product-color" className="font-bold">Product Color</label>
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                backgroundColor: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
                                                cursor: "pointer",
                                                border: "1px solid #ccc",
                                            }}
                                            onClick={() => setShowPicker(!showPicker)}
                                        ></div>

                                        {showPicker && (
                                            <div ref={colorPickerRef} style={{ position: "absolute", zIndex: 100 }}>
                                                <ColorPicker
                                                    height={140}
                                                    color={color}
                                                    onChange={setColor}
                                                    hideInput={["hsv", "hex"]}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="field">
                                        <label htmlFor="veg-nonveg" className="font-bold">Veg / Non-Veg</label>
                                        <Dropdown
                                            value={formData.selectedFoodType}
                                            onChange={inputChangeHandler}
                                            name="selectedFoodType"
                                            options={foodTypes}
                                            optionLabel="foodType"
                                            optionValue="code"
                                            placeholder="Select Food Type"
                                            filter
                                            valueTemplate={selectedFoodTypeTemplate}
                                            itemTemplate={foodTypeOptionTemplate}
                                            showClear
                                            disabled={loading}
                                        />
                                        {error?.selectedFoodType && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.selectedFoodType}</p>}

                                    </div>
                                </div>

                                <div className="col-12 flex gap-4 items-center">

                                    <div className="flex align-items-center">
                                        <InputSwitch
                                            checked={formData.isActive}
                                            onChange={inputChangeHandler}
                                            name="isActive"
                                            id="switch1"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="switch1" className="switch-label font-bold">
                                            Is Active?
                                        </label>
                                    </div>

                                    {error?.isActive && <p className='text-red-500 text-sm flex items-center gap-2'><i className='pi pi-times-circle text-sm'></i> {error?.isActive}</p>}

                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            )}
            <div className="grid">
                <div className="col-12">

                    <div className="card p-fluid flex flex-col ">
                        <h1 className="font-bold text-xl">Portion Details</h1>


                        {
                            !id && <div className="mb-4">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="field col-12 lg:col-3">
                                        <label htmlFor="menu-dropdown" className="font-bold">Menu</label>
                                        <MultiSelect
                                            value={formData.selectedMenuList}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, selectedMenuList: e.value }))
                                                setRows([
                                                    {
                                                        portion: null,
                                                        editable: true,
                                                        default: false,
                                                        posPrice: null,
                                                        onlinePrice: null,
                                                        markupPrice: null,
                                                        productCode: "",
                                                    },
                                                ])
                                            }}
                                            options={menuList}
                                            optionLabel="menuname"
                                            optionValue="menuid"
                                            placeholder="- Please Select Menu -"
                                            className="w-full"
                                            filter
                                            disabled={id ? true : false}

                                            showClear
                                        />
                                    </div>
                                    <div className="field col-12 lg:col-3 flex mt-auto gap-4">
                                    <InputSwitch
    checked={formData.isOnlineSell}
    onChange={(e) => {
        setFormData((prev) => ({ ...prev, isOnlineSell: e.value }));
        setError((prev) => ({ ...prev, selectedLocationList: null, selectedChannelList: null }));
        setFormData((prev) => ({ ...prev, selectedLocationList: [], selectedChannelList: [] }));
    }}
    disabled={id ? true : false}
/>
<label htmlFor="online-selling" className="font-bold">Online Selling</label>
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="field col-12 lg:col-3">
                                        <label htmlFor="location-dropdown" className={`${loading || !formData.isOnlineSell || id ? "text-gray-400" : "font-bold"}`}>Location</label>
                                        <MultiSelect
                                            value={formData.selectedLocationList}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, selectedLocationList: e.value }))
                                                setError((error) => ({ ...error, selectedLocationList: null }))
                                            }}

                                            options={locationList}
                                            optionLabel="locationname"
                                            optionValue="locationid"
                                            placeholder="- Please Select Location -"
                                            className={error?.selectedLocationList ? 'border-red-500 w-full' : 'w-full'}
                                            filter
                                            showClear
                                            disabled={loading || !formData.isOnlineSell || id ? true : false}

                                        />
                                        {error?.selectedLocationList && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.selectedLocationList}</p>}
                                    </div>
                                    <div className="field col-12 lg:col-3">
                                        <label htmlFor="channel-dropdown" className={`${loading || !formData.isOnlineSell || id ? "text-gray-400" : "font-bold"}`}>Channel</label>
                                        <MultiSelect
                                            value={formData.selectedChannelList}
                                            onChange={(e) => {
                                                setFormData((prev) => ({ ...prev, selectedChannelList: e.value }))
                                                setError((error) => ({ ...error, selectedChannelList: null }))
                                            }}
                                            filter
                                            options={channelList}
                                            optionLabel="channelname"
                                            optionValue="channelid"
                                            placeholder="- Please Select Channel -"
                                            className={error?.selectedChannelList ? 'border-red-500 w-full' : 'w-full'}
                                            showClear
                                            disabled={loading || !formData.isOnlineSell || id ? true : false}

                                        />
                                        {error?.selectedChannelList && <p className='text-red-500 text-sm flex items-center gap-2 mt-2'><i className='pi pi-times-circle text-sm'></i> {error?.selectedChannelList}</p>}
                                    </div>
                                </div>
                            </div>
                        }



                        <div className="">
                            <DataTable showGridlines tableStyle={{ minWidth: "50rem" }} value={rows} headerClassName="custom-header">
                                <Column
                                    field="default"
                                    header="Default"
                                    body={defaultRadioBodyTemplate}
                                    headerStyle={{ backgroundColor: "#8b5cf6", color: "white" }}
                                ></Column>
                                <Column
                                    field="name"
                                    header="Portion Name"
                                    body={nameDropdownBodyTemplate}
                                    style={{ minWidth: "14rem", maxWidth: "12rem" }}
                                    headerStyle={{ backgroundColor: "#8b5cf6", color: "white" }}

                                ></Column>
                                <Column
                                    field="posPrice"
                                    header="POS Price"
                                    body={posPriceInputTemplate}
                                    style={{ minWidth: "12rem" }}
                                    headerStyle={{ backgroundColor: "#8b5cf6", color: "white" }}


                                ></Column>

                                {
                                    formData.selectedMenuList.length > 0 && (
                                        <Column
                                            field="onlinePrice"
                                            header="Online Price"
                                            body={onlinePriceInputTemplate}
                                            style={{ minWidth: "12rem" }}
                                            headerStyle={{ backgroundColor: "#8b5cf6", color: "white" }}

                                        ></Column>
                                    )
                                }



                                {
                                    formData.selectedMenuList.length > 0 && (
                                        <Column
                                            field="markupPrice"
                                            header="Mark-up Price"
                                            body={markupPriceInputTemplate}
                                            style={{ minWidth: "13rem" }}
                                            headerStyle={{ backgroundColor: "#8b5cf6", color: "white" }}

                                        ></Column>
                                    )
                                }


                                {
                                    formData.selectedMenuList.length > 0 && (
                                        <Column
                                            field="productCode"
                                            header="Product Code"
                                            body={productCodeInputTemplate}
                                            style={{ minWidth: "13rem" }}
                                            headerStyle={{ backgroundColor: "#8b5cf6", color: "white" }}

                                        ></Column>
                                    )
                                }


                                <Column
                                    field="Action"
                                    header="Action"
                                    body={actionButtonTemplate}
                                    headerStyle={{ backgroundColor: "#8b5cf6", color: "white" }}

                                ></Column>


                            </DataTable>




                        </div>

                        {
                            error.rows && <p className='text-red-500 text-sm flex items-center gap-2 mt-2 font-bold text-[1.4rem]  ml-1'><i className='pi pi-times-circle text-sm'></i> {error.rows}</p>
                        }

                        <Button
                            label={id ? "Update Product" : "Add Product"}
                            onClick={addProductHandler}
                            className="w-fit self-end mt-6 px-6"
                            disabled={loading}
                        >
                            {loading && <i className="pi pi-spin pi-spinner ml-2" style={{ fontSize: '1rem' }}></i>}
                        </Button>

                    </div>


                </div>
            </div>

        </div>
    );
}

export default ProductMaster;


