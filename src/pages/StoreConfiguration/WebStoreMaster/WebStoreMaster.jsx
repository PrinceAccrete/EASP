import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import "./WebStoreMaster.scss";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import API from "../../../utils/axios";
import { useSelector } from "react-redux";
import { MultiSelect } from "primereact/multiselect";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { div, form } from "motion/react-client";
import { Skeleton } from "primereact/skeleton";
function WebStoreMaster() {
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [errors, setErrors] = useState({});

    const [location, setLocation] = useState([]);
    const [menu, setMenu] = useState({
        menuname: "",
        menuid: "",
    });
    // console.log("menu", menu)
    const [charges, setCharges] = useState([]);
    const [city, setCity] = useState({
        cityid: "",
        cityname: "",
    });
    // console.log("city", city);
    // console.log("menu", menu);
    const [pos, setPos] = useState([]);
    // console.log(location);
    const [isPaymentGateway, setIsPaymentGateway] = useState(false);
    const { id } = useParams();

    const [deleteStoreDialog, setDeleteStoreDialog] = useState(false);
    const [notificationDetails, setNotificationDetails] = useState();
    const [notification, setNotification] = useState(false);

    const [selectedChannel, setSelectedChannel] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedPos, setSelectedPos] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [appId, setAppId] = useState(null);
    const [secretKey, setSecretKey] = useState(null);
    const [pgId, setPgId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState([
        { id: 1, name: "Cashfree" },
        { id: 2, name: "Razorpay" },
        { id: 3, name: "Stripe" },
    ]);
    const [channel, setChannel] = useState([
        { name: "Web Store", id: 1 },
        { name: "Zomato & Swiggy", id: 2 },
        { name: "Mobile App", id: 3 },
    ]);
    const token = useSelector((state) => state.auth.token);
    const [selectedPosData, setSelectedPosData] = useState(null);
    const navigate = useNavigate();
    const defaultTime = new Date();
    defaultTime.setHours(0, 0, 0, 0);
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    // Set to 12:00 AM
    // const [time, setTime] = useState(defaultTime);
    const formatTime = (date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };
    const defaultStartTime = formatTime(new Date("1970-01-01T00:00:00"));
    const defaultEndTime = formatTime(new Date("1970-01-01T23:59:00"));
    const JsonTime = [
        { day: "Sunday", start_time: defaultStartTime, end_time: defaultEndTime, isactive: 1 },
        { day: "Monday", start_time: defaultStartTime, end_time: defaultEndTime, isactive: 1 },
        { day: "Tuesday", start_time: defaultStartTime, end_time: defaultEndTime, isactive: 1 },
        { day: "Wednesday", start_time: defaultStartTime, end_time: defaultEndTime, isactive: 1 },
        { day: "Thursday", start_time: defaultStartTime, end_time: defaultEndTime, isactive: 1 },
        { day: "Friday", start_time: defaultStartTime, end_time: defaultEndTime, isactive: 1 },
        { day: "Saturday", start_time: defaultStartTime, end_time: defaultEndTime, isactive: 1 },
    ];
    const handleTimeChange = (index, field, value) => {
        const updatedTimes = [...storeDayTimeJson];
        const formattedTime = formatTime(value);
        updatedTimes[index][field] = formattedTime;
        setStoreDayTimeJson(updatedTimes);
    };

    const convertTo24Hour = (time12h) => {
        if (typeof time12h !== "string") return "00:00";
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");

        if (hours === "12") hours = "00";
        if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);

        return `${hours.padStart(2, "0")}:${minutes}`;
    };

    // Function to toggle active status
    const toggleActiveStatus = (index) => {
        const updatedTimes = [...storeDayTimeJson];
        updatedTimes[index].isactive = updatedTimes[index].isactive ? 0 : 1;
        setStoreDayTimeJson(updatedTimes);
    };
    const [storeDayTimeJson, setStoreDayTimeJson] = useState(JsonTime);
    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            storeDayTimeJson: storeDayTimeJson,
        }));
    }, [storeDayTimeJson]);
    console.log("channel", channel);

    const [formData, setFormData] = useState({
        companyId: 5,
        channelId: null,
        chargeId: [],
        locationId: null,
        posId: null,
        menuId: null,
        cityId: null,
        storeName: "",
        contactNum: "",
        address: "",
        email: "",
        pinCode: "",
        storeDayTimeJson: storeDayTimeJson,
        notificationContact: { notificationNumbers: "" },
        activeStore: true,
        // Fields specific to channelId 1
        pgid: null,
        onlineOrdering: true,
        appid: null,
        secretkey: null,
        isOtpRequired: null,
        isHomeDelivery: null,
        homeDeliveryMinVal: null,
        isPickup: null,
        pickupMinVal: null,
        enablePayLater: null,
        // Fields specific to channelId 2
        platformId: [
            { id: 1, isActive: true },
            { id: 2, isActive: true },
        ],
    });

    // const commonFields = {
    //     companyId: formData.companyId,
    //     channelId: formData.channelId,
    //     locationId: formData.locationId,
    //     posId: formData.posId,
    //     menuId: formData.menuId,
    //     cityId: formData.cityId,
    //     storeName: formData.storeName,
    //     contactNum: formData.contactNum,
    //     address: formData.address,
    //     notificationContact: formData.notificationContact,
    //     email: formData.email,
    //     pinCode: formData.pinCode,
    //     storeDayTimeJson: formData.storeDayTimeJson,
    //     activeStore: formData.activeStore,
    // };

    const isValidEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for email validation
        return emailPattern.test(email);
    };
    function isAlphanumericNoSpaces(str) {
        const regex = /^[a-zA-Z0-9]+$/;
        return regex.test(str);
    }
    const hideDeleteStoreDialog = () => {
        setDeleteStoreDialog(false);
        setNotification(false);
    };
    const deleteStoreDialogFooter = (
        <>
            <Button label="Ok" icon="pi pi-times" outlined onClick={hideDeleteStoreDialog} />
        </>
    );
    const checkValidation = (formData) => {
        let error = {};
        let isValid = true;
        if (!formData.locationId) {
            error.locationId = "Location is required";
            isValid = false;
        }
        if (!formData.channelId) {
            error.channelId = "Channel is required";
            isValid = false;
        }
        if (!formData.contactNum) {
            error.contactNum = "Contact Number is required";
            isValid = false;
        }
        if (!formData.posId) {
            error.posId = "Pos is required";
            isValid = false;
        }
        if (!formData.menuId) {
            error.menuId = "Menu is required";
            isValid = false;
        }
        // if(!formData.chargeId.length){
        //     error.chargeId = "Charge is required"
        //     isValid = false
        // }
        if (!formData.cityId) {
            error.cityId = "City is required";
            isValid = false;
        }
        if (!formData.storeName) {
            error.storeName = "Store Name is required";
            isValid = false;
        }
        if (!formData.address || formData.address?.trim() == "") {
            error.address = "Address is required";
            isValid = false;
        }
        if (!formData.email) {
            error.email = "Email is required";
            isValid = false;
        } else if (!isValidEmail(formData.email)) {
            error.email = "Email is not valid";
            isValid = false;
        }

        // if (!formData.email || formData.email?.trim() == "") {
        //     error.email = "Email is required"
        //     isValid = false
        // }

        if (!formData.pinCode) {
            error.pinCode = "Pin Code is required";
            isValid = false;
        }
        if (formData.isPickup && formData.isHomeDelivery) {
            if (!formData.pickupMinVal) {
                error.pickupMinVal = "Pickup Minimum Value is required";
                isValid = false;
            }
            if (!formData.homeDeliveryMinVal) {
                error.homeDeliveryMinVal = "Home Delivery Minimum Value is required";
                isValid = false;
            }
        }

        if (formData.channelId === 1 && isPaymentGateway) {
            if (!formData.pgid) {
                error.pgid = "Payment Gateway Id is required";
                isValid = false;
            }

            if (!formData.appid) {
                error.appid = "App Id is required";
                isValid = false;
            } else if (!isAlphanumericNoSpaces(formData.appid)) {
                error.appid = "AppId must be alphanumeric and contain no spaces.";
                isValid = false;
            }
            if (!formData.secretkey) {
                error.secretkey = "Secret Key is required";
                isValid = false;
            } else if (!isAlphanumericNoSpaces(formData.secretkey)) {
                error.secretkey = "secretkey  must be alphanumeric and contain no spaces.";
                isValid = false;
            }
        }
        console.log("Validation Errors:", error);
        setErrors(error);
        return isValid;
    };
    const inputChangeHandler = (e) => {
        const { name, value, type } = e.target;
        console.log(e);
        if (name === "notificationContact") {
            setFormData((prevData) => ({
                ...prevData,
                notificationContact: {
                    notificationNumbers: value,
                },
            }));
        } else if (type === "checkbox") {
            setFormData((prevData) => ({ ...prevData, [name]: e.target.checked ? 1 : 0 }));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
        if (name === "locationId" && (!value || value === "")) {
            setFormData((prevData) => ({
                ...prevData,
                cityId: null,
                chargeId: [],
                posId: "",
                menuId: null,
            }));
            setMenu({
                menuname: "",
                menuid: "",
            });
            setCity({
                cityid: "",
                cityname: "",
            });
            setCharges(null);
        }
        if (name === "locationId") {
            setMenu({
                menuname: "",
                menuid: "",
            });
            setFormData((prev) => ({
                ...prev,
                chargeId: [],
                posId: "",
                menuId: "",
            }));
        }
        // if(name === "storeName"){
        //     setFormData((prev) => ({
        //         ...prev,
        //         storeName: value
        //     }))
        // }

        if (name === "isHomeDelivery") {
            setFormData((prev) => ({
                ...prev,
                homeDeliveryMinVal: value ? prev.homeDeliveryMinVal : null,
            }));
        }
        if (name === "posId" && (value === "" || !value)) {
            setMenu((prev) => ({
                ...prev,
                menuid: "",
                menuname: "",
            }));
            setFormData((prev) => ({
                ...prev,
                menuId: "",
            }));
        }
        if (name === "isPickup") {
            setFormData((prev) => ({
                ...prev,
                pickupMinVal: value ? prev.pickupMinVal : null,
            }));
        }
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    const fetchAllLocations = async () => {
        try {
            const response = await API.post(
                "/location/getLocationList",
                {
                    companyId: formData.companyId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.success) {
                setLocation(response?.data.data);
            } else {
                console.log("error", response?.data.message);
            }
        } catch (error) {
            console.log("error", error);
        }
    };
    const fetchPosAndMenu = async () => {
        try {
            const res = await API.post(
                "store/getPosAndMenuList",
                {
                    locationId: formData.locationId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res.data.success) {
                setPos(res?.data.data[0].pos_data);
                console.log("pos", pos);
                const posData = res?.data.data[0].pos_data;
                setSelectedPosData(posData);
                console.log(res.data.data[0].pos_data);
                setCity({
                    cityid: res?.data.data[0].cityid,
                    cityname: res?.data.data[0].cityname,
                });
                setFormData((prev) => ({
                    ...prev,
                    // email: res?.data.data[0].emailid,
                    // notificationContact: {
                    //     notificationNumbers: String(res?.data.data[0].notificationContact) || "" // Fill notification contact
                    // },
                    // menuId: res?.data.data[0].menuid,
                    ...(id
                        ? {}
                        : {
                              // Only set these fields if `id` is not present
                              contactNum: res?.data.data[0].contactno,
                              cityId: res?.data.data[0].cityid,
                              notificationContact: {
                                  notificationNumbers: res?.data.data[0].contactno || "", // Fill notification contact
                              },
                              email: res?.data.data[0].emailid,
                              storeName: res?.data.data[0].locationname,
                              address: res?.data.data[0].address,
                          }),
                    // storeName: res?.data.data[0].locationname,
                }));
            } else {
                console.log("error", res?.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCharges = async () => {
        try {
            const res = await API.post(
                "charge/getChargeList",
                {
                    companyId: formData.companyId,
                    locationId: formData.locationId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        start: 0,
                        length: -1,
                    },
                }
            );
            if (res.data.success) {
                setCharges(res.data.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const AddStore = async () => {
        const valid = checkValidation(formData);

        let data = {
            companyId: formData.companyId,
            locationId: formData.locationId,
            posId: formData.posId,
            menuId: formData.menuId,
            cityId: formData.cityId,
            storeName: formData.storeName,
            contactNum: String(formData.contactNum),
            address: formData.address,
            email: formData.email,
            pinCode: formData.pinCode,
            activeStore: formData.activeStore ? 1 : 0,
            storeDayTimeJson: storeDayTimeJson,
            hideui: formData.hideui ? 1 : 0,
            onlineOrdering: formData.onlineOrdering ? 1 : 0,
            channelId: formData.channelId,
        };
        if (formData.channelId === 1) {
            data = {
                ...data,
                chargeId: formData.chargeId,
                channelId: formData.channelId,
                enablePayLater: formData.enablePayLater ? 1 : 0,
                isOtpRequired: formData.isOtpRequired ? 1 : 0,
                isHomeDelivery: formData.isHomeDelivery ? 1 : 0,
                isPickup: formData.isPickup ? 1 : 0,
                paymentGateAway: isPaymentGateway ? 1 : 0,
                pickupMinVal: formData.isPickup ? formData.pickupMinVal : null,
                homeDeliveryMinVal: formData.isHomeDelivery ? formData.homeDeliveryMinVal : null,
            };
            if (isPaymentGateway) {
                data.pgid = formData.pgid;
                data.appid = formData.appid;
                data.secretkey = formData.secretkey;
            }
        } else if (formData.channelId === 2) {
            data = {
                ...data,
                notificationContact: {
                    notificationNumbers: String(formData.notificationContact.notificationNumbers), // Ensure it's a string
                },
                channelId: formData.channelId,
                platformId: formData.platformId.map((item) => ({
                    id: item.id,
                    isActive: item.isActive ? 1 : 0,
                })),
            };
        }
        console.log("data", data);
        if (!valid) {
            return;
        }
        try {
            const res = await API.post("store/addStore", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.data.success) {
                toast.current.show({ severity: "success", detail: res.data.msg, life: 3000 });
                setFormData({
                    companyId: 5,
                    channelId: null,
                    locationId: null,
                    posId: null,
                    menuId: null,
                    cityId: null,
                    storeName: "",
                    contactNum: "",
                    address: "",
                    email: "",
                    pinCode: "",
                    storeDayTimeJson: JsonTime,
                    activeStore: true,
                    hideui: 0,
                    onlineOrdering: true,
                    pgid: null,
                    appid: null,
                    secretkey: null,
                    isOtpRequired: false,
                    isHomeDelivery: false,
                    homeDeliveryMinVal: 0,
                    isPickup: false,
                    pickupMinVal: 0,
                    enablePayLater: 0,
                    platformId: [
                        { id: 1, isActive: true },
                        { id: 2, isActive: true },
                    ],
                });
                setStoreDayTimeJson(JsonTime);
                setMenu({
                    menuname: "",
                    menuid: "",
                });
                setCity({
                    cityid: "",
                    cityname: "",
                });
            }
        } catch (error) {
            toast.current.show({ severity: "error", detail: error.response.data.msg, life: 3000 });
            console.log(error);
        }
    };
    const fetchStore = async () => {
        console.log("token", token);
        console.log("id", id);

        try {
            setIsInitialLoading(true);
            const res = await API.get(`store/getStore/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.data.success) {
                const fetchedData = res?.data.data;
                console.log("formdata befor fetch ", formData);
                if (res?.data.data.pgId) {
                    setIsPaymentGateway(true);
                }
                const mappedPlatformData = fetchedData.platformData?.map((platform) => ({
                    id: platform.platformId,
                    isActive: platform.isActive === 1, // Convert 1 to true, 0 to false
                }));
                setFormData((prev) => ({
                    ...prev,
                    companyId: 5,
                    locationId: fetchedData.locationId,
                    posId: fetchedData.posId,
                    menuId: fetchedData.menuId,

                    channelId: fetchedData.channelId,
                    storeName: fetchedData.storeName,
                    address: fetchedData.address,
                    contactNum: fetchedData.contactNumber,
                    email: fetchedData.email,
                    notificationContact: fetchedData.notificationContact
                        ? JSON.parse(fetchedData.notificationContact)
                        : {},
                    pinCode: fetchedData.pinCode,
                    cityId: fetchedData.cityId,
                    activeStore: fetchedData.activeStore === 1,
                    hideui: fetchedData.hideui === 1,
                    onlineOrdering: fetchedData.onlineOrdering === 1,
                    pgid: parseInt(fetchedData.pgId),
                    appid: fetchedData.appId,
                    secretkey: fetchedData.secretKey,
                    isOtpRequired: fetchedData.isOtpRequired === 1,
                    isHomeDelivery: fetchedData.isHomeDelivery === 1,
                    homeDeliveryMinVal: fetchedData.homeDeliveryMinVal,
                    isPickup: fetchedData.isPickup === 1,
                    pickupMinVal: fetchedData.pickupMinVal,
                    enablePayLater: fetchedData.enablePayLater === 1,
                    platformId: mappedPlatformData || formData.platformId,
                }));

                console.log("posid", res?.data.data.posId);
                setStoreDayTimeJson(JSON.parse(res?.data.data.storeDayTimeJson));
                setCity({
                    cityid: res?.data.data.cityId,
                    cityname: res?.data.data.cityName,
                });
                setMenu({
                    menuname: res?.data.data.menuName,
                    menuid: res?.data.data.menuId,
                });
                if (fetchedData?.chargeId[0] !== null) {
                    console.log("inside if");
                    setFormData((prev) => ({
                        ...prev,
                        chargeId: fetchedData.chargeId,
                    }));
                } else {
                    console.log("chargeId is null or empty");
                    setFormData((prev) => ({
                        ...prev,
                        chargeId: [], // Set to an empty array if chargeId is null or empty
                    }));
                }
                console.log("chargeId", fetchedData.chargeId);

                console.log("res", res?.data.data);
                console.log("crg", res?.data.data.chargeId);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(() => {
                setIsInitialLoading(false);
            }, 3000);
        }
    };
    const UpdateStore = async () => {
        console.log("UpdateStore function triggered"); // Debugging log
        try {
            let data = {
                companyId: formData.companyId,
                locationId: formData.locationId,
                posId: formData.posId,
                menuId: formData.menuId,
                cityId: formData.cityId,
                storeName: formData.storeName,
                contactNum: String(formData.contactNum),
                address: formData.address,
                email: formData.email,
                pinCode: formData.pinCode,
                activeStore: formData.activeStore ? 1 : 0,
                storeDayTimeJson: storeDayTimeJson,
            };
            if (formData.channelId === 1) {
                data = {
                    ...data,
                    chargeId: formData.chargeId,
                    channelId: formData.channelId,
                    hideui: formData.hideui ? 1 : 0,
                    onlineOrdering: formData.onlineOrdering ? 1 : 0,
                    enablePayLater: formData.enablePayLater ? 1 : 0,
                    isOtpRequired: formData.isOtpRequired ? 1 : 0,
                    isHomeDelivery: formData.isHomeDelivery ? 1 : 0,
                    isPickup: formData.isPickup ? 1 : 0,
                    paymentGateAway: isPaymentGateway ? 1 : 0,
                    pickupMinVal: formData.isPickup ? formData.pickupMinVal : null,
                    homeDeliveryMinVal: formData.isHomeDelivery
                        ? formData.homeDeliveryMinVal
                        : null,
                };
                if (isPaymentGateway) {
                    data.pgid = formData.pgid;
                    data.appid = formData.appid;
                    data.secretkey = formData.secretkey;
                }
            } else if (formData.channelId === 2) {
                data = {
                    ...data,
                    notificationContact: {
                        notificationNumbers: String(
                            formData.notificationContact.notificationNumbers
                        ), // Ensure it's a string
                    },
                    hideui: formData.hideui ? 1 : 0,
                    onlineOrdering: formData.onlineOrdering ? 1 : 0,
                    channelId: formData.channelId,
                    platformId: formData.platformId.map((item) => ({
                        id: item.id,
                        isActive: item.isActive ? 1 : 0,
                    })),
                };
            }
            console.log("formData in update", data);
            const valid = checkValidation(data);
            if (!valid) {
                console.log("Validation failed");
                return;
            }
            const res = await API.post(`store/updateStore/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("res", res);
            if (res.data.success) {
                toast.current.show({ severity: "success", detail: res.data.msg, life: 3000 });
                setTimeout(() => {
                    navigate("/web-store-list");
                }, 2000);
            }
            if (res.data?.notification) {
                setNotification(true);
                setNotificationDetails(res.data.notificationDetails);
            }
        } catch (error) {
            console.log(error);
            toast.current.show({ severity: "error", detail: error.response.data.msg, life: 3000 });
        }
    };
    useEffect(() => {
        if (id && token) {
            fetchStore();
        }
    }, [id]);
    useEffect(() => {
        //     // if (!formData.posId || formData.posId === "" || formData.posId === null) {
        //     //     setMenu((prev) => ({
        //     //         ...prev,
        //     //         menuname: undefined,
        //     //         menuid: undefined
        //     //     }));
        //     //     setFormData(prev => ({
        //     //         ...prev,
        //     //         menuId: null
        //     //     }));
        //     // }
        if (formData.posId) {
            const selectedPos = selectedPosData?.find((pos) => pos.posid === formData.posId);
            if (selectedPos) {
                setMenu({
                    menuname: selectedPos.menuname,
                    menuid: selectedPos.menuid,
                });
                console.log("if selectedPos", menu);
                setFormData((prev) => ({
                    ...prev,
                    menuId: selectedPos.menuid,
                }));
            }
        }
    }, [formData.posId]);
    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            channelId: formData.channelId,
        }));
    }, [formData.channelId]);

    console.log("formData", formData);
    useEffect(() => {
        if (formData.locationId) {
            fetchPosAndMenu();
            fetchCharges();
        }
        if (formData.posId) {
            // fetchMenuOnPos()
        }
    }, [formData.locationId, formData.posId]);
    // useEffect(() => {
    //     setFormData({
    //         ...formData,
    //         posId: "",
    //         menuId: "",
    //         cityId: "",
    //         chargeId: [],

    //     })
    //     setSelectedPosData(null)

    //     setCity({
    //         cityid: "",
    //         cityname: ""
    //     })

    // }, [formData.locationId])

    // useEffect(() => {
    //     if (!isPaymentGateway) {
    //         setFormData(prev => ({
    //             ...prev,
    //             pgid: "",
    //             appid: "",
    //             secretkey: ""
    //         }))
    //     }
    // }, [isPaymentGateway])
    useEffect(() => {
        fetchAllLocations();
    }, []);
    // useEffect(() => {
    //     if(formData.channelId === 2){
    //         setFormData({...formData, platformId: [{ id: 1, isActive: true }, { id: 2, isActive: false }]})
    //     }
    //     else if(formData.channelId === 1){
    //         setFormData({ ...formData, isOtpRequired: 0, isHomeDelivery: 0,  homeDeliveryMinVal: 0, isPickup: 0, pickupMinVal: 0, pgId: "", appId: "", secretKey :""})
    //     }
    // }, [formData.channelId])

    const renderSkeleton = () => (
        <div className="grid">
            <div className="col-12 md:col-6">
                <div className="grid ">
                    <div className="col-12 md:col-12">
                        <div className="card field">
                            <div className="grid p-fluid">
                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-1" />
                                    <Skeleton height="3rem" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-1" />
                                    <Skeleton height="3rem" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-1" />
                                    <Skeleton height="3rem" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                    <Skeleton height="3rem" />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                    <Skeleton height="3rem" />
                                </div>
                                <div className="field col-12 md:col-12">
                                    <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                    <Skeleton height="3rem" />
                                </div>

                                <div className="field col-12 md:col-12">
                                    <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                    <Skeleton height="5.5rem" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-1" />
                                    <Skeleton height="3rem" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-1" />
                                    <Skeleton height="3rem" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-1" />
                                    <Skeleton height="3rem" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                    <Skeleton height="3rem" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {formData.channelId != 3 && formData.channelId ? (
                        <>
                            <div className="col-12 md:col-12 p-fluid">
                                <div className="card">
                                    {formData.channelId === 2 && (
                                        <>
                                            <div className="font-bold my-2 text-black">
                                                <Skeleton
                                                    width="15%"
                                                    height="1.5rem"
                                                    className="mb-2"
                                                />
                                            </div>

                                            <div className="font-bold py-3">
                                                <Skeleton
                                                    width="30%"
                                                    height="1.5rem"
                                                    className="mb-2"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="platform flex px-2 gap-1 flex-column">
                                        {formData?.channelId === 2 &&
                                            formData?.platformId?.length > 0 && (
                                                <>
                                                    <div className="platform-item border-bottom-1 border-gray-300 py-2 flex justify-content-between align-items-center">
                                                        <div className="platform-label flex gap-2 align-items-center">
                                                            <Skeleton
                                                                width="20%"
                                                                height="1.5rem"
                                                                className="mb-1"
                                                            />
                                                            <Skeleton
                                                                width="25%"
                                                                height="1.5rem"
                                                                className="mb-1"
                                                            />
                                                        </div>
                                                        <div className="platform-img">
                                                            <Skeleton
                                                                width="40px"
                                                                height="40px"
                                                                className="mb-1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="platform-item flex justify-content-between align-items-center border-bottom-1 border-gray-300 py-2">
                                                        <div className="platform-label flex gap-2">
                                                            <Skeleton
                                                                width="20%"
                                                                height="1.5rem"
                                                                className="mb-1"
                                                            />
                                                            <Skeleton
                                                                width="25%"
                                                                height="1.5rem"
                                                                className="mb-1"
                                                            />
                                                        </div>
                                                        <div className="platform-img">
                                                            <Skeleton
                                                                width="40px"
                                                                height="40px"
                                                                className="mb-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                    </div>

                                    {/* Skeleton for 'Hide Name From UI' switch */}
                                    <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton width="3rem" height="1.5rem" />
                                    </div>

                                    {/* Skeleton for 'Online Ordering' switch */}
                                    <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton width="3rem" height="1.5rem" />
                                    </div>
                                    <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton width="3rem" height="1.5rem" />
                                    </div>
                                    <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton width="3rem" height="1.5rem" />
                                    </div>
                                    <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton width="3rem" height="1.5rem" />
                                    </div>
                                    <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton width="3rem" height="1.5rem" />
                                    </div>
                                    <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton width="3rem" height="1.5rem" />
                                    </div>
                                    <div className="field">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton height="3rem" />
                                    </div>
                                    <div className="field">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton height="3rem" />
                                    </div>
                                    <div className="field">
                                        <Skeleton width="30%" height="1.5rem" className="mb-2" />
                                        <Skeleton height="3rem" />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="card product-master-card">
                    <Skeleton width="15%" height="1.5rem" className="mb-1" />

                    <div className="timejson">
                        {/* Skeleton for multiple days */}
                        {[...Array(7)].map((_, index) => (
                            <div key={index} className={`sun field`}>
                                <div className="time-heading flex my-1 gap-3">
                                    <Skeleton width="1.5rem" height="1.5rem" className="mb-1" />
                                    <Skeleton width="15%" height="1.5rem" className="mb-1" />
                                </div>
                                <div className="time grid p-fluid">
                                    <div className="col-6">
                                        <Skeleton width="20%" height="1.5rem" className="mb-1" />
                                        <Skeleton height="2.8rem" />
                                    </div>
                                    <div className="col-6">
                                        <Skeleton width="20%" height="1.5rem" className="mb-1" />
                                        <Skeleton height="2.8rem" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Skeleton for the "Is Store Active" section */}
                        <div className="field flex-1 gap-4 flex justify-between items-center mt-1">
                            <Skeleton width="6rem" height="2rem" className="mb-1" />
                            <Skeleton width="3.5rem" height="2rem" />
                        </div>

                        {/* Skeleton for buttons */}
                        <div className="flex justify-end">
                            <Skeleton width="8rem" height="2.5rem" />
                            {/* <Skeleton width="8rem" height="2.5rem" className="ml-3" /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <div className="card-action-menu  flex justify-content-between align-items-center">
                <div>Store</div>
                <div className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer">
                    <i
                        className="pi pi-list"
                        style={{ fontSize: "1.6rem" }}
                        onClick={() => {
                            navigate("/web-store-list");
                        }}
                    />
                </div>
            </div>

            {isInitialLoading ? (
                renderSkeleton()
            ) : (
                <>
                    <div className="">
                        <div className="grid">
                            {/* ================================================================================================================== */}
                            <div className="   col-12 md:col-6">
                                <div className="grid ">
                                    <div className="col-12 md:col-12">
                                        <div className="card field">
                                            <div className="grid p-fluid">
                                                <div className="field col-12 md:col-6">
                                                    <label>Channels</label>
                                                    <Dropdown
                                                        filter
                                                        disabled={id ? true : false}
                                                        showClear
                                                        showFilterClear
                                                        name="channelId"
                                                        value={formData.channelId || null}
                                                        onChange={inputChangeHandler}
                                                        options={channel}
                                                        placeholder="- Please Select Channel-"
                                                        optionLabel="name"
                                                        optionValue="id"
                                                        className={
                                                            errors.channelId ? "p-invalid" : ""
                                                        }
                                                    />
                                                    {errors.channelId && (
                                                        <small className="p-error">
                                                            {errors.channelId}
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="field col-12 md:col-6">
                                                    <label>Location</label>
                                                    <Dropdown
                                                        filter
                                                        showFilterClear
                                                        disabled={id ? true : false}
                                                        showClear
                                                        value={formData.locationId || null}
                                                        options={location}
                                                        name="locationId"
                                                        optionLabel="locationname"
                                                        optionValue="locationid"
                                                        // options={categories}
                                                        onChange={inputChangeHandler}
                                                        placeholder="- Please Select -"
                                                        className={
                                                            errors.locationId ? "p-invalid" : ""
                                                        }
                                                    />
                                                    {errors.locationId && (
                                                        <small className="p-error">
                                                            {errors.locationId}
                                                        </small>
                                                    )}
                                                </div>
                                                {formData.channelId === 1 && (
                                                    <>
                                                        <div className="field col-12 md:col-6">
                                                            <label>Charges</label>
                                                            <MultiSelect
                                                                display="chip"
                                                                value={formData.chargeId}
                                                                options={charges}
                                                                name="chargeId"
                                                                optionLabel="chargename"
                                                                optionValue="chargeid"
                                                                // options={categories}
                                                                onChange={inputChangeHandler}
                                                                placeholder="- Please Select -"
                                                                className={
                                                                    errors.chargeId
                                                                        ? "p-invalid"
                                                                        : ""
                                                                }
                                                            />
                                                            {errors.chargeId && (
                                                                <small className="p-error">
                                                                    {errors.chargeId}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                                <div className="field col-12 md:col-6">
                                                    <label>POS</label>
                                                    <Dropdown
                                                        filter
                                                        showClear
                                                        showFilterClear
                                                        value={formData.posId || null}
                                                        name="posId"
                                                        onChange={inputChangeHandler}
                                                        options={pos}
                                                        optionLabel="posname"
                                                        optionValue="posid"
                                                        placeholder="- Please Select -"
                                                        className={errors.posId ? "p-invalid" : ""}
                                                    />
                                                    {errors.posId && (
                                                        <small className="p-error">
                                                            {errors.posId}
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="field col-12 md:col-6">
                                                    <label>Menu</label>
                                                    <InputText
                                                        readOnly
                                                        value={menu.menuname || ""}
                                                        name="menuId"
                                                        label={menu.menuname || ""}
                                                        // onChange={inputChangeHandler}
                                                        // options={menu}
                                                        // optionLabel="menuname"
                                                        // optionValue="menuid"
                                                        // options={categories}
                                                        placeholder="- Please Select -"
                                                        className={errors.menu ? "p-invalid" : ""}
                                                    />
                                                    {errors.menu && (
                                                        <small className="p-error">
                                                            {errors.menu}
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="field col-12 md:col-12">
                                                    <label>Name</label>
                                                    <InputText
                                                        filter
                                                        showClear
                                                        name="storeName"
                                                        value={formData.storeName}
                                                        onChange={inputChangeHandler}
                                                        // options={categories}
                                                        placeholder="- Please Enter Define Name "
                                                        className={
                                                            errors.storeName ? "p-invalid" : ""
                                                        }
                                                    />
                                                    {errors.storeName && (
                                                        <small className="p-error">
                                                            {errors.storeName}
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="field col-12 md:col-12">
                                                    <label>Adress</label>
                                                    <InputTextarea
                                                        filter
                                                        showClear
                                                        rows={3}
                                                        cols={30}
                                                        value={formData.address}
                                                        name="address"
                                                        maxLength={100}
                                                        onChange={inputChangeHandler}
                                                        // options={categories}
                                                        placeholder="- Please Enter Define Address"
                                                        className={`${
                                                            errors.address ? "p-invalid" : ""
                                                        } no-resize`}
                                                    />
                                                    {errors.address && (
                                                        <small className="p-error">
                                                            {errors.address}
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="field col-12 md:col-6">
                                                    <label>City</label>
                                                    <InputText
                                                        readOnly
                                                        value={city.cityname}
                                                        name="cityId"
                                                        // label ={city.cityname}

                                                        placeholder="- Please Select -"
                                                        className={errors.city ? "p-invalid" : ""}
                                                    />
                                                </div>
                                                <div className="field col-12 md:col-6">
                                                    <label>Contact Number</label>
                                                    <InputNumber
                                                        useGrouping={false}
                                                        maxLength={10}
                                                        value={formData.contactNum}
                                                        name="contactNum"
                                                        onValueChange={inputChangeHandler}
                                                        // options={categories}
                                                        placeholder="- Please Enter Define Contact Number"
                                                        className={`errors.contactNumber ? "p-invalid" : ""  custom-placeholder-input  `}
                                                    />
                                                    {errors.contactNum && (
                                                        <small className="p-error">
                                                            {errors.contactNum}
                                                        </small>
                                                    )}
                                                </div>
                                                {formData.channelId !== 1 && (
                                                    <>
                                                        <div className="field col-12 md:col-6">
                                                            <label>Notification Number</label>
                                                            <InputNumber
                                                                value={
                                                                    formData.notificationContact
                                                                        ?.notificationNumbers ||
                                                                    null
                                                                }
                                                                name="notificationContact"
                                                                maxLength={10}
                                                                useGrouping={false}
                                                                onValueChange={inputChangeHandler}
                                                                // options={categories}
                                                                placeholder="- Please Define No (Use , for separate )"
                                                                className={`custom-placeholder-input ${
                                                                    errors.notificationContact
                                                                        ? "p-invalid"
                                                                        : ""
                                                                } custom-placeholder-input`}
                                                                // style={{ fontSize: '0.8em'   }}
                                                            />
                                                            {errors.notificationContact && (
                                                                <small className="p-error">
                                                                    {errors.notificationContact}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </>
                                                )}

                                                <div className="field col-12 md:col-6">
                                                    <label>Email</label>
                                                    <InputText
                                                        filter
                                                        showClear
                                                        value={formData.email}
                                                        name="email"
                                                        onChange={inputChangeHandler}
                                                        // options={categories}
                                                        placeholder="- Please Define Email "
                                                        className={errors.email ? "p-invalid" : ""}
                                                    />
                                                    {errors.email && (
                                                        <small className="p-error">
                                                            {errors.email}
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="field col-12 md:col-6">
                                                    <label>Pincode</label>
                                                    <InputNumber
                                                        // min={6}
                                                        maxLength={6}
                                                        min={6}
                                                        defaultValue={0}
                                                        useGrouping={false}
                                                        value={formData.pinCode}
                                                        name="pinCode"
                                                        onValueChange={inputChangeHandler}
                                                        // options={categories}
                                                        placeholder="- Please Define Pincode "
                                                        className={
                                                            errors.pinCode ? "p-invalid" : ""
                                                        }
                                                    />
                                                    {errors.pinCode && (
                                                        <small className="p-error">
                                                            {errors.pinCode}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.channelId != 3 && formData.channelId && (
                                        <>
                                            <div className="col-12 md:col-12 p-fluid ">
                                                <div className="card">
                                                    {formData.channelId === 2 && (
                                                        <>
                                                            <div className="font-bold my-2 text-black">
                                                                Store Configuration
                                                            </div>

                                                            <div className="font-bold py-3">
                                                                Platform Association
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="platform flex px-2 gap-1 flex-column">
                                                        {formData?.channelId === 2 &&
                                                            formData?.platformId?.length > 0 && (
                                                                <>
                                                                    <div className="platform-item border-bottom-1 border-gray-300 py-2 flex justify-content-between align-items-center">
                                                                        <div className="platform-label flex gap-2 align-items-center">
                                                                            <Checkbox
                                                                                checked={
                                                                                    formData
                                                                                        ?.platformId[0]
                                                                                        ?.isActive
                                                                                }
                                                                                onChange={(e) => {
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        platformId:
                                                                                            formData?.platformId?.map(
                                                                                                (
                                                                                                    item
                                                                                                ) =>
                                                                                                    item.id ===
                                                                                                    1
                                                                                                        ? {
                                                                                                              ...item,
                                                                                                              isActive:
                                                                                                                  e.checked,
                                                                                                          }
                                                                                                        : item
                                                                                            ),
                                                                                    });
                                                                                }}
                                                                            ></Checkbox>
                                                                            <span>Swiggy</span>
                                                                        </div>
                                                                        <div className="platform-img  align-content-center">
                                                                            <svg
                                                                                height="40"
                                                                                viewBox="-7.3 3.6 2520.1 3702.8"
                                                                                width="40"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                                <path
                                                                                    d="m1255.2 3706.3c-2.4-1.7-5-4-7.8-6.3-44.6-55.3-320.5-400.9-601.6-844.2-84.4-141.2-139.1-251.4-128.5-279.9 27.5-74.1 517.6-114.7 668.5-47.5 45.9 20.4 44.7 47.3 44.7 63.1 0 67.8-3.3 249.8-3.3 249.8 0 37.6 30.5 68.1 68.2 68 37.7 0 68.1-30.7 68-68.4l-.7-453.3h-.1c0-39.4-43-49.2-51-50.8-78.8-.5-238.7-.9-410.5-.9-379 0-463.8 15.6-528-26.6-139.5-91.2-367.6-706-372.9-1052-7.5-488 281.5-910.5 688.7-1119.8 170-85.6 362-133.9 565-133.9 644.4 0 1175.2 486.4 1245.8 1112.3 0 .5 0 1.2.1 1.7 13 151.3-820.9 183.4-985.8 139.4-25.3-6.7-31.7-32.7-31.7-43.8-.1-115-.9-438.8-.9-438.8-.1-37.7-30.7-68.1-68.4-68.1-37.6 0-68.1 30.7-68.1 68.4l1.5 596.4c1.2 37.6 32.7 47.7 41.4 49.5 93.8 0 313.1-.1 517.4-.1 276.1 0 392.1 32 469.3 90.7 51.3 39.1 71.1 114 53.8 211.4-154.9 866-1135.9 1939.1-1172.8 1983.8z"
                                                                                    fill="#fc8019"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    <div className="platform-item flex justify-content-between align-items-center border-bottom-1 border-gray-300 py-2 ">
                                                                        <div className="platform-label flex gap-2">
                                                                            <Checkbox
                                                                                checked={
                                                                                    formData
                                                                                        ?.platformId[1]
                                                                                        ?.isActive
                                                                                }
                                                                                onChange={(e) => {
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        platformId:
                                                                                            formData?.platformId?.map(
                                                                                                (
                                                                                                    item
                                                                                                ) =>
                                                                                                    item.id ===
                                                                                                    2
                                                                                                        ? {
                                                                                                              ...item,
                                                                                                              isActive:
                                                                                                                  e.checked,
                                                                                                          }
                                                                                                        : item
                                                                                            ),
                                                                                    });
                                                                                }}
                                                                            ></Checkbox>
                                                                            <span>Zomato</span>
                                                                        </div>
                                                                        <div className="platform-img  ">
                                                                            <svg
                                                                                height="40"
                                                                                viewBox="0 0 2500 887.28"
                                                                                width="60"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                                <path
                                                                                    d="m0 0h2500v887.28h-2500z"
                                                                                    fill="#e23744"
                                                                                />
                                                                                <path
                                                                                    d="m593.17 322.1-1.73 55.55-144.88 157.48c60.52 0 98.89-.59 121.02-1.82-6.41 29.89-11.63 54.32-16.88 90.95-29.1-2.46-74.47-3.07-119.87-3.07-50.6 0-94.83.61-130.32 3.07l1.18-56.18 144.87-156.85c-63.42 0-86.7.6-112.87 1.21 5.8-28.08 9.88-59.2 13.95-90.34 45.96 1.83 64 2.43 123.93 2.43 55.28 0 86.68-.6 121.6-2.43zm164.67-16.5c-94.28 0-166.4 84.24-166.4 184.99 0 75.68 43.63 133.67 128.57 133.67 94.84 0 166.41-84.25 166.41-185.59 0-75.05-42.49-133.07-128.58-133.07zm-28.52 237.69c-20.95 0-33.16-18.95-33.16-56.18 0-55.55 22.69-100.1 50.63-100.1 20.35 0 32.57 18.33 32.57 56.15-.01 54.94-22.1 100.13-50.04 100.13zm1361.13-241.87c-95.49 0-168.57 85.35-168.57 187.37 0 76.71 44.2 135.47 130.26 135.47 96.08 0 168.59-85.36 168.59-188.01 0-76.06-43.01-134.83-130.28-134.83zm-30.69 241.55c-20.96 0-33.16-18.95-33.16-56.18 0-55.55 22.7-100.09 50.63-100.09 20.34 0 32.58 18.31 32.58 56.14-.01 54.96-22.12 100.13-50.05 100.13zm-684.04-127.48c7.57-51.87 3.5-98.88-54.09-98.88-41.9 0-87.28 35.41-119.28 94.62 6.99-48.85 2.9-94.62-54.11-94.62-43.05 0-89.6 37.23-121.61 98.88 8.15-40.29 6.41-86.08 4.08-95.84-33.16 5.5-62.24 8.54-102.98 9.76 1.17 28.09-.58 64.69-5.82 99.51l-13.38 91.55c-5.24 36.03-11.06 77.54-16.88 103.79h108.22c.59-15.89 4.67-40.91 7.57-62.88l9.31-62.86c7.56-40.92 40.13-89.12 65.15-89.12 14.55 0 13.98 14.03 9.9 40.28l-10.48 70.79c-5.25 36.03-11.05 77.54-16.88 103.79h109.38c.59-15.89 4.08-40.91 6.98-62.88l9.3-62.86c7.57-40.92 40.17-89.12 65.17-89.12 14.56 0 13.99 13.41 11.64 31.74l-26.13 183.12h99.83zm522.69 112.93-11.64 72.04c-18.04 9.76-51.79 23.81-90.77 23.81-66.33 0-79.7-35.41-69.24-110.49l16.88-120.87h-32.64l9.22-78.24 35.64-1.72 13.39-56.77 100.63-37.85-12.79 94.62h69.24c-2.32 9.76-10.49 63.5-12.78 79.96h-67.53l-15.13 111.71c-4.07 28.69-1.73 39.07 18.03 39.07 14.58-.01 36.09-8.56 49.49-15.27zm-381.77 38.91c36.63-4.54 61.84-39.85 67.9-75.08l1.02-9.44c-15.74-3.52-38.49-6.2-60.55-3.5-21.01 2.56-38.49 11.29-47.89 23.93-7.09 9.08-10.65 19.94-9.07 32.89 2.39 19.4 23.84 34.22 48.59 31.2zm-31.18 55.8c-51.7 6.35-85.75-14.17-95.97-60.85-6.41-29.37 2.49-62.83 18.06-82.79 20.85-26.11 54.83-42.87 96.3-47.93 33.37-4.14 61.49-2.1 87.79 2.88l1.09-4.51c.75-7.21 1.51-14.41.46-23.03-2.73-22.13-20.18-35.31-63.27-30.01-29.07 3.57-56.73 14.07-78.21 26.02l-20.89-63.13c29.11-16.71 65.8-29.43 107.79-34.59 80.21-9.84 136.57 15.74 143.79 74.54 1.91 15.64 2.14 32.21.17 47.25-10.3 72.71-16.9 127.42-19.79 164.09-.47 5.68-.43 15.43.08 29.26l-99.54-.09c2.12-5.73 4.02-13.5 5.71-23.25 1.12-6.41 1.92-14.5 2.42-24.3-21.03 28.87-49.95 46.01-85.99 50.44z"
                                                                                    fill="#fff"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                        <div className="field flex-1 gap-4 flex justify-between  items-center mt-1">
                                                            <label className="font-semibold mb-0">
                                                                Hide Name From UI
                                                            </label>
                                                            <InputSwitch
                                                                // checked={formData.isOnline}
                                                                // onChange={inputChangeHandler}
                                                                name="hideui"
                                                                id="switch3"
                                                                checked={formData.hideui}
                                                                onChange={inputChangeHandler}
                                                            />
                                                        </div>
                                                        <div className="field flex-1 gap-4 flex justify-between  items-center mt-1">
                                                            <label className="font-semibold mb-0">
                                                                Online Ordering
                                                            </label>
                                                            <InputSwitch
                                                                // checked={formData.isOnline}
                                                                // onChange={inputChangeHandler}
                                                                name="onlineOrdering"
                                                                id="switch3"
                                                                checked={formData.onlineOrdering}
                                                                onChange={inputChangeHandler}
                                                            />
                                                        </div>
                                                        {formData?.channelId === 1 && (
                                                            <>
                                                                <div className="field flex-1 gap-4 flex justify-between  items-center mt-1">
                                                                    <label className="font-semibold mb-0">
                                                                        Otp Required
                                                                    </label>
                                                                    <InputSwitch
                                                                        // checked={formData.isOnline}
                                                                        // onChange={inputChangeHandler}
                                                                        name="isOtpRequired"
                                                                        id="isOtpRequired"
                                                                        checked={
                                                                            formData.isOtpRequired
                                                                        }
                                                                        onChange={
                                                                            inputChangeHandler
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className=" flex justify-content-between align-items-center">
                                                                    <div className="field flex-1  flex justify-between  items-center mt-1 ">
                                                                        <label className="font-semibold mb-0">
                                                                            Home Delivery
                                                                        </label>
                                                                        <InputSwitch
                                                                            name="isHomeDelivery"
                                                                            // name
                                                                            checked={
                                                                                formData.isHomeDelivery
                                                                            }
                                                                            id="switch3"
                                                                            // checked={formData.activeStore}
                                                                            onChange={
                                                                                inputChangeHandler
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {formData?.isHomeDelivery && (
                                                                    <div className="field    items-center ">
                                                                        <InputNumber
                                                                            filter
                                                                            showClear
                                                                            useGrouping={false}
                                                                            name="homeDeliveryMinVal"
                                                                            value={
                                                                                formData?.homeDeliveryMinVal
                                                                            }
                                                                            onValueChange={
                                                                                inputChangeHandler
                                                                            }
                                                                            // options={categories}
                                                                            placeholder="- Please Define Minimum Order Value (For Home Delivery) "
                                                                            // className={errors.storeName ? "p-invalid" : ""}
                                                                        />
                                                                        {errors.homeDeliveryMinVal && (
                                                                            <small className="p-error">
                                                                                {
                                                                                    errors.homeDeliveryMinVal
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className=" flex justify-content-between align-items-center">
                                                                    <div className="field flex-1  flex justify-between  items-center mt-1 ">
                                                                        <label className="font-semibold mb-0">
                                                                            Pick Up
                                                                        </label>
                                                                        <InputSwitch
                                                                            // checked={formData.isOnline}
                                                                            // onChange={inputChangeHandler}
                                                                            name="isPickup"
                                                                            checked={
                                                                                formData.isPickup
                                                                            }
                                                                            // onValueChange={inputChangeHandler}
                                                                            id="switch3"
                                                                            // checked={formData.activeStore}
                                                                            onChange={
                                                                                inputChangeHandler
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {formData?.isPickup && (
                                                                    <div className="field    items-center ">
                                                                        <InputNumber
                                                                            filter
                                                                            showClear
                                                                            useGrouping={false}
                                                                            name="pickupMinVal"
                                                                            value={
                                                                                formData.pickupMinVal
                                                                            }
                                                                            onValueChange={
                                                                                inputChangeHandler
                                                                            }
                                                                            placeholder="- Please Define Minimum Order Value (For Pick Up) "
                                                                        />
                                                                        {errors.pickupMinVal && (
                                                                            <small className="p-error">
                                                                                {
                                                                                    errors.pickupMinVal
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className=" flex justify-content-between align-items-center">
                                                                    <div className="field flex-1  flex justify-between  items-center mt-1 ">
                                                                        <label className="font-semibold mb-0">
                                                                            Enable Pay Later
                                                                        </label>
                                                                        <InputSwitch
                                                                            name="enablePayLater"
                                                                            checked={
                                                                                formData.enablePayLater
                                                                            }
                                                                            onChange={
                                                                                inputChangeHandler
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className=" flex justify-content-between align-items-center">
                                                                    <div className="field flex-1  flex justify-between  items-center mt-1 ">
                                                                        <label className="font-semibold mb-0">
                                                                            Payment Gateway
                                                                        </label>
                                                                        <InputSwitch
                                                                            checked={
                                                                                isPaymentGateway
                                                                            }
                                                                            onChange={() => {
                                                                                setIsPaymentGateway(
                                                                                    !isPaymentGateway
                                                                                );
                                                                                setFormData(
                                                                                    (prevData) => ({
                                                                                        ...prevData,
                                                                                        pgid: null,
                                                                                        appid: null,
                                                                                        secretkey:
                                                                                            null,
                                                                                    })
                                                                                );
                                                                            }}
                                                                            name="paymentGateway"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {isPaymentGateway && (
                                                                    <>
                                                                        <div className=" field">
                                                                            <label className="font-semibold  ">
                                                                                Choose Payment
                                                                                Gateway
                                                                            </label>
                                                                            <Dropdown
                                                                                name="pgid"
                                                                                value={
                                                                                    formData.pgid
                                                                                }
                                                                                onChange={
                                                                                    inputChangeHandler
                                                                                }
                                                                                options={
                                                                                    paymentMethod
                                                                                }
                                                                                optionLabel="name"
                                                                                optionValue="id"
                                                                                placeholder="- Choose Payment Gateway "
                                                                                className={
                                                                                    errors.pgid
                                                                                        ? "p-invalid"
                                                                                        : ""
                                                                                }
                                                                            />
                                                                            {errors.pgid && (
                                                                                <small className="p-error">
                                                                                    {errors.pgid}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                        <div className=" field">
                                                                            <label className="font-semibold  ">
                                                                                App Id
                                                                            </label>
                                                                            <InputText
                                                                                filter
                                                                                showClear
                                                                                name="appid"
                                                                                value={
                                                                                    formData.appid
                                                                                }
                                                                                onChange={
                                                                                    inputChangeHandler
                                                                                }
                                                                                placeholder="- Please Enter App Id "
                                                                                className={
                                                                                    errors.appid
                                                                                        ? "p-invalid"
                                                                                        : ""
                                                                                }
                                                                            />
                                                                            {errors.appid && (
                                                                                <small className="p-error">
                                                                                    {errors.appid}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                        <div className=" field">
                                                                            <label className="font-semibold ">
                                                                                Secret Key
                                                                            </label>
                                                                            <InputText
                                                                                filter
                                                                                showClear
                                                                                name="secretkey"
                                                                                value={
                                                                                    formData.secretkey
                                                                                }
                                                                                onChange={
                                                                                    inputChangeHandler
                                                                                }
                                                                                placeholder="- Please Enter Secret Key "
                                                                                className={
                                                                                    errors.secretkey
                                                                                        ? "p-invalid"
                                                                                        : ""
                                                                                }
                                                                            />
                                                                            {errors.secretkey && (
                                                                                <small className="p-error">
                                                                                    {
                                                                                        errors.secretkey
                                                                                    }
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* ================================================================================================================== */}
                            <div className=" col-12 md:col-6">
                                <div className="card product-master-card">
                                    <div>Store Time</div>

                                    <div className="timejson">
                                        {storeDayTimeJson?.map((time, index) => (
                                            <div
                                                key={index}
                                                className={` ${time.day.toLowerCase()}  field `}
                                            >
                                                <div className="  time-heading flex my-1 gap-3">
                                                    <Checkbox
                                                        onChange={() => toggleActiveStatus(index)}
                                                        checked={time.isactive === 1}
                                                    />
                                                    <span className="font-bold">{time.day}</span>
                                                </div>
                                                <div className="time grid p-fluid">
                                                    <div className="col-6">
                                                        <span>From</span>
                                                        <Calendar
                                                            id={`calendar-timeonly-from-${index}`}
                                                            value={
                                                                time.start_time
                                                                    ? new Date(
                                                                          `1970-01-01T${convertTo24Hour(
                                                                              time.start_time
                                                                          )}`
                                                                      )
                                                                    : null
                                                            } // Convert string to Date for Calendar
                                                            onChange={(e) => {
                                                                handleTimeChange(
                                                                    index,
                                                                    "start_time",
                                                                    e.value
                                                                );
                                                                console.log(e.value); // This will log the full date object
                                                            }}
                                                            timeOnly
                                                            hourFormat="12"
                                                            showTime
                                                        />
                                                    </div>
                                                    <div className="col-6">
                                                        <span>To</span>
                                                        <Calendar
                                                            id={`calendar-timeonly-to-${index}`}
                                                            value={
                                                                time.end_time
                                                                    ? new Date(
                                                                          `1970-01-01T${convertTo24Hour(
                                                                              time.end_time
                                                                          )}`
                                                                      )
                                                                    : null
                                                            } // Convert string to Date for Calendar
                                                            onChange={(e) => {
                                                                handleTimeChange(
                                                                    index,
                                                                    "end_time",
                                                                    e.value
                                                                );
                                                            }}
                                                            timeOnly
                                                            showTime
                                                            hourFormat="12"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* <div className="sun">

                                                <div className="time-heading flex my-1 gap-3">
                                                    <Checkbox onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                                    <span className='font-bold'>Monday</span>
                                                </div>
                                                <div className="time grid p-fluid">
                                                    <div className="col-6">
                                                        <span>From</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>
                                                    <div className="col-6">
                                                        <span>To</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="sun">

                                                <div className="time-heading flex my-1 gap-3">
                                                    <Checkbox onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                                    <span className='font-bold'>Tuesday </span>
                                                </div>
                                                <div className="time grid p-fluid">
                                                    <div className="col-6">
                                                        <span>From</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>
                                                    <div className="col-6">
                                                        <span>To</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="sun">

                                                <div className="time-heading flex my-1 gap-3">
                                                    <Checkbox onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                                    <span className='font-bold'>Wednesday</span>
                                                </div>
                                                <div className="time grid p-fluid">
                                                    <div className="col-6">
                                                        <span>From</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>
                                                    <div className="col-6">
                                                        <span>To</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="sun">

                                                <div className="time-heading flex my-1 gap-3">
                                                    <Checkbox onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                                    <span className='font-bold'>Thursday</span>
                                                </div>
                                                <div className="time grid p-fluid">
                                                    <div className="col-6">
                                                        <span>From</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>
                                                    <div className="col-6">
                                                        <span>To</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="sun">

                                                <div className="time-heading flex my-1 gap-3">
                                                    <Checkbox onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                                    <span className='font-bold'>Friday</span>
                                                </div>
                                                <div className="time grid p-fluid">
                                                    <div className="col-6">
                                                        <span>From</span>
                                                        <Calendar id="calendar-timeonly"  value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>
                                                    <div className="col-6">
                                                        <span>To</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="sun">

                                                <div className="time-heading flex my-1 gap-3">
                                                    <Checkbox onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                                                    <span className='font-bold'>Saturday</span>
                                                </div>
                                                <div className="time grid p-fluid">
                                                    <div className="col-6">
                                                        <span>From</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>
                                                    <div className="col-6">
                                                        <span>To</span>
                                                        <Calendar id="calendar-timeonly" value={time} onChange={(e) => setTime(e.value)} timeOnly hourFormat='12' />
                                                    </div>

                                                </div>
                                            </div> */}
                                        <div className="field flex-1 gap-4 flex justify-between  items-center mt-1">
                                            <label className="font-semibold mb-0">
                                                Is Store Active
                                            </label>
                                            <InputSwitch
                                                // checked={formData.isOnline}
                                                // onChange={inputChangeHandler}
                                                name="activeStore"
                                                checked={formData.activeStore}
                                                onChange={inputChangeHandler}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            {id && (
                                                <Button
                                                    label={"Update Store"}
                                                    onClick={UpdateStore}
                                                    className="p-button-sm p-button-primary  w-fit px-4"
                                                />
                                            )}

                                            {!id && (
                                                <Button
                                                    label={"Add Store"}
                                                    onClick={AddStore}
                                                    className="p-button-sm p-button-primary  w-fit px-4"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Dialog
                        visible={deleteStoreDialog}
                        style={{ width: "32rem" }}
                        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                        header="Confirm"
                        modal
                        footer={deleteStoreDialogFooter}
                        onHide={hideDeleteStoreDialog}
                        draggable={false}
                    >
                        <div className="confirmation-content">
                            <i
                                className="pi pi-exclamation-triangle mr-3"
                                style={{ fontSize: "2rem" }}
                            />
                        </div>
                    </Dialog>
                </>
            )}
        </>
    );
}

export default WebStoreMaster;
