import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import "./PosMaster.scss";
import { selectUserData } from "../../../redux/slice/AuthSlice";
import { MultiSelect } from "primereact/multiselect";
import { InputNumber } from "primereact/inputnumber";
import { Skeleton } from "primereact/skeleton";

function PosMaster() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const userData = useSelector(selectUserData);
  const roleid = userData.userDetails.roleId;
  const useLoc = userData.availLocPermission;
  const { id } = useParams();
  const posid = id;
  const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

  const [pos, setPos] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLoc, setSelectedLoc] = useState(); //contains location id
  const [defaultMenu, setDefaultMenu] = useState(""); // contains menu id
  const [selectedMenu, setSelectedMenu] = useState();
  const [invoiceMessages, setInvoiceMessages] = useState("");
  const [isActive, setisActive] = useState("");
  const [allowOTPrintBill, setAllowOTPrintBill] = useState([]);
  const [allowPTPrintBIll, setAllowPTPrintBill] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedPosMenu,setSelectedPosMenu] = useState([])
  const [isSeving, setIsSeving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sqlPass, setSqlPass] = useState(""); 
  const [posMenu, setPosMenu] = useState([]);
  const displayScreen = [
    { label: "Customer Screen", id: "1" },
    { label: "Table Screen", id: "2" },
    { label: "Mix Mode", id: "3" },
  ];

  const [formData, setFormData] = useState({
    selectedDS: null,
    displayScreen: false,
    touchscreen: false,
    showcashbal: false,
    cashnote: false,
    dayposallow: false,
    itemwisesalesreport: false,
    categorywisereport: false,
    billsummaryreports: false,
    customerselc: false,
    discompulsry: false,
    isfreeofcostbtnenabled: false,
    cashdifference: false,
    editsaveorders: false,
    canceledkotprint: false,
    sendkotprintonbiller: false,
    companynameonbill: false,
    mergeitemqtybillkot: false,
    zomatointgrtion: false,
    amounttoqty: false,
    iscashsettlebtnenabled: false,
    defaultprintqty: null,
    kotprintqty: null,
    maxbillprintqty: null,
    maxkotprintqty: null,
    maxdiscount: null,
    printwithoutsettlement: false,
    kotprint: false,
    reasonforbillprint: false,
    logoprint: false,
    portionprint: false,
    complimentoryordersreason: false,
    totalwoutroundoff: false,
    allowedordertypeprint: [],
    allowedordertypekot: [],
    allowedpaymenttypeprint: [],
    allowedpaymenttypekot: [],
  });

  useEffect(() => {
    if (!token) return;

    if (roleid === 0) {
      const fetchLocation = async () => {
        try {
          const response = await axios.post(
            `${BASE_URL}/location/getLocationList`,
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
            Array.isArray(response.data.data)
          ) {
            setLocation(
              response.data.data.map((item) => ({
                label: item.locationname,
                value: item.locationid,
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching Location:", error.message);
        }
      };

      fetchLocation();
    } else {
      setLocation(
        useLoc.map((item) => ({
          label: item.locationname,
          value: item.locationid,
        }))
      );
    }
  }, [token]);
  
  useEffect(() => {
    if (!token) return;

    if (roleid === 0) {
      const fetchPosMenu = async () => {
        try {
          const response = await axios.post(
            `${BASE_URL}/menu/getMenuList?start=0&length=-1`,
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
            setPosMenu(response.data.data.data)
          }
        } catch (error) {
          console.error("Error fetching pos menu:", error.message);
        }
      };

      fetchPosMenu();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!selectedLoc) return;

    const fetchMenu = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/menu/getMenuList?start=0&length=-1`,
          { companyId: 5, locationId: [selectedLoc] },
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
          setDefaultMenu(
            response.data.data.data.map((item) => ({
              label: item.menuname,
              value: item.menuid,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching Menu:", error.message);
      }
    };

    fetchMenu();
  }, [token, selectedLoc]);

  useEffect(() => {
    if (!token) return;

    const fetchOrderTypePrintBill = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/pos/getOrderType`,
          { companyId: 5 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success === 1 && Array.isArray(response.data.data)) {
          setAllowOTPrintBill(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error fetching Order Type To Print Bill:",
          error.message
        );
      }
    };

    fetchOrderTypePrintBill();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (roleid === 0) {
      const fetchPosmenu = async () => {
        try {
          const response = await axios.post(
            `${BASE_URL}/menu/getMenuList?start=0&length=-1`,
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
            setPosMenu(
              response.data.data.data.map((item) => ({
                label: item.locationname,
                value: item.locationid,
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching pos menu:", error.message);
        }
      };

      fetchPosmenu();
    } 
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchPaymentTypeToPrintBill = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/pos/getPaymentType`,
          { companyId: 5 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success === 1 && Array.isArray(response.data.data)) {
          setAllowPTPrintBill(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching Get Payment Type:", error.message);
      }
    };

    fetchPaymentTypeToPrintBill();
  }, [token]);
  
  const selectedOrderTypeBillIds = formData.allowedordertypeprint?.map(
    (item) => item.ordertypeid
  );
  const selectedorderTypeKOTIds = formData.allowedordertypekot?.map(
    (item) => item.ordertypeid
  );
  const selectedPaymentTypeBillIds = formData.allowedpaymenttypeprint?.map(
    (item) => item.paymentid
  );
  const selectedPaymentTypeKOTIds = formData.allowedpaymenttypekot?.map(
    (item) => item.paymentid
  );

  console.log(selectedPosMenu)

  const createPOS = async () => {
    if (!token) {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "Authentication token is missing!",
        life: 3000,
      });
      return;
    }

    const payload = {
      companyId: 5,
      posName: pos, // POS Name
      locationId: selectedLoc, // Location ID
      defaultMenuId: selectedMenu, // Default Menu ID
      invoiceMsg: invoiceMessages, // Invoice Messages
      isActive: isActive ? 1 : 0, // Convert boolean to 1 or 0
      posMappingMenu: selectedPosMenu  ,
      ...(posid ? {} : { mysqlPass: sqlPass }),
      posOptions: {
        displayscreen: formData.selectedDS.id,
        touchscreen: formData.touchscreen ? "1" : "0",
        showcashbal: formData.showcashbal ? "1" : "0",
        cashnote: formData.cashnote ? "1" : "0",
        dayposallow: formData.dayposallow ? "1" : "0",
        itemwisesalesreport: formData.itemwisesalesreport ? "1" : "0",
        categorywisereport: formData.categorywisereport ? "1" : "0",
        billsummaryreports: formData.billsummaryreports ? "1" : "0",
        customerselc: formData.customerselc ? "1" : "0",
        discompulsry: formData.discompulsry ? "1" : "0",
        isfreeofcostbtnenabled: formData.isfreeofcostbtnenabled ? "1" : "0",
        cashdifference: formData.cashdifference ? "1" : "0",
        editsaveorders: formData.editsaveorders ? "1" : "0",
        canceledkotprint: formData.canceledkotprint ? "1" : "0",
        sendkotprintonbiller: formData.sendkotprintonbiller ? "1" : "0",
        companynameonbill: formData.companynameonbill ? "1" : "0",
        mergeitemqtybillkot: formData.mergeitemqtybillkot ? "1" : "0",
        zomatointgrtion: formData.zomatointgrtion ? "1" : "0",
        amounttoqty: formData.amounttoqty ? "1" : "0",
        iscashsettlebtnenabled: formData.iscashsettlebtnenabled ? "1" : "0",
        defaultprintqty: formData.defaultprintqty || "1",
        kotprintqty: formData.kotprintqty || "1",
        maxbillprintqty: formData.maxbillprintqty || "1",
        maxkotprintqty: formData.maxkotprintqty || "0",
        maxdiscount: formData.maxdiscount || "0",
        printwithoutsettlement: formData.printwithoutsettlement ? "1" : "0",
        kotprint: formData.kotprint ? "1" : "0",
        reasonforbillprint: formData.reasonforbillprint ? "1" : "0",
        logoprint: formData.logoprint ? "1" : "0",
        portionprint: formData.portionprint ? "1" : "0",
        complimentoryordersreason: formData.complimentoryordersreason
          ? "1"
          : "0",
        totalwoutroundoff: formData.totalwoutroundoff ? "1" : "0",
        allowedordertypeprint: selectedOrderTypeBillIds?.join(","),
        allowedordertypekot: selectedorderTypeKOTIds?.join(","),
        allowedpaymenttypeprint: selectedPaymentTypeBillIds?.join(","),
        allowedpaymenttypekot: selectedPaymentTypeKOTIds?.join(","),
      },
    };

   

    let response;
    try {
      if (posid) {
        response = await axios.post(
          `${BASE_URL}/pos/updatePos/${posid}`,
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
          `${BASE_URL}/pos/createPos`,
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
          summary: posid ? "Updated" : "Added",
          detail: posid
            ? "Data Updated Successfully"
            : "Data Added Successfully",
          life: 3000,
        });

        setPos("");
        setSelectedLoc("");
        setSelectedMenu("");
        setInvoiceMessages("");
        setisActive("");
        setSelectedPosMenu([])
        setSqlPass("")
        
        setFormData({
          selectedDS: [],
          displayScreen: false,
          touchscreen: false,
          showcashbal: false,
          cashnote: false,
          dayposallow: false,
          itemwisesalesreport: false,
          categorywisereport: false,
          billsummaryreports: false,
          customerselc: false,
          discompulsry: false,
          isfreeofcostbtnenabled: false,
          cashdifference: false,
          editsaveorders: false,
          canceledkotprint: false,
          sendkotprintonbiller: false,
          companynameonbill: false,
          mergeitemqtybillkot: false,
          zomatointgrtion: false,
          amounttoqty: false,
          iscashsettlebtnenabled: false,
          defaultprintqty: null,
          kotprintqty: null,
          maxbillprintqty: null,
          maxkotprintqty: null,
          maxdiscount: null,
          printwithoutsettlement: false,
          kotprint: false,
          reasonforbillprint: false,
          logoprint: false,
          portionprint: false,
          complimentoryordersreason: false,
          totalwoutroundoff: false,
          allowedordertypeprint: [],
          allowedordertypekot: [],
          allowedpaymenttypeprint: [],
          allowedpaymenttypekot: [],
        });
        if (posid) {
          setTimeout(() => {
            navigate("/pos-list");
          }, 1000);
        }
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.msg || error.message,
        life: 3000,
      });
    }finally{
      setIsSeving(false);
    }
  };

  const handleAddClick = () => {
    const newErrors = {};

    if (!pos || pos.trim() === "") {
      newErrors.pos = "Please Enter POS Name";
    }
    if (!selectedLoc) {
      newErrors.location = "Please Select A Loaction";
    }
    if (!selectedMenu) {
      newErrors.defaultMenu = "Please Select A Default Menu";
    }
    if (!formData.selectedDS) {
      newErrors.selectedDS = "Please Select A Disply";
    }
    if (!invoiceMessages) {
      newErrors.invoiceMessages = "please enter a invoice message";
    }
    if (invoiceMessages.length < 2) {
      newErrors.invoiceMessageso = "Please enter more than  2 character";
    }
    if (!formData.defaultprintqty) {
      newErrors.defaultprintqty = "Please Enter A Default Print Quantity";
    }
    if (!formData.kotprintqty) {
      newErrors.kotprintqty = "Please Enter A Default KOT Quantity";
    }
    if (!formData.maxbillprintqty) {
      newErrors.maxbillprintqty = "Please Enter A Maximum Bill Print Quantity";
    }
    if (!formData.maxkotprintqty) {
      newErrors.maxkotprintqty = "Please Enter A Maximum KOT Print Quantity";
    }
    if (!formData.maxdiscount) {
      newErrors.maxdiscount = "Please Enter A Maximum Discount";
    }
    if (formData.allowedordertypeprint?.length <= 0) {
      newErrors.allowedordertypeprint =
        "Please select Order Type To Print Bill";
    }
    if (formData.allowedordertypekot?.length <= 0) {
      newErrors.allowedordertypekot = "Please select Order Type To Print KOT";
    }
    if (formData.allowedpaymenttypeprint?.length <= 0) {
      newErrors.allowedpaymenttypeprint =
        "Please select payment Type To Print Bill";
    }
    if (formData.allowedpaymenttypeprint?.length <= 0) {
      newErrors.allowedpaymenttypeprint =
        "Please select payment Type To Print Bill";
    }
    if (formData.allowedpaymenttypekot?.length <= 0) {
      newErrors.allowedpaymenttypekot =
        "Please select payment Type To Print KOT";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const Click = () => {
    if (handleAddClick()) {
      createPOS();
      setIsSeving(true);
    }
  };
  useEffect(() => {
    if (posid) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    fetchPOSData();
  }, [token, posid, allowOTPrintBill, allowPTPrintBIll]);
  const fetchPOSData = async () => {
    if (
      !token ||
      !posid ||
      !allowOTPrintBill.length ||
      !allowPTPrintBIll.length
    )
      return;

    try {
      const response = await axios.post(
        `${BASE_URL}/pos/getPosData/${posid}`,
        { companyId: 5 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success === 1 && response.data.data.length > 0) {
        const posData = response.data.data[0];

        // Parse posOptions JSON
        const options = JSON.parse(posData.posoptions);

        setFormData((prev) => ({
          ...prev,
          selectedDS: displayScreen.find(
            (d) => d.id === options.displayscreen?.toString()
          ),
          touchscreen: options.touchscreen === 1,
          showcashbal: options.showcashbal === 1,
          cashnote: options.cashnote === 1,
          dayposallow: options.dayposallow === 1,
          itemwisesalesreport: options.itemwisesalesreport === 1,
          categorywisereport: options.categorywisereport === 1,
          billsummaryreports: options.billsummaryreports === 1,
          customerselc: options.customerselc === 1,
          discompulsry: options.discompulsry === 1,
          isfreeofcostbtnenabled: options.isfreeofcostbtnenabled === 1,
          cashdifference: options.cashdifference === 1,
          editsaveorders: options.editsaveorders === 1,
          canceledkotprint: options.canceledkotprint === 1,
          sendkotprintonbiller: options.sendkotprintonbiller === 1,
          companynameonbill: options.companynameonbill === 1,
          mergeitemqtybillkot: options.mergeitemqtybillkot === 1,
          zomatointgrtion: options.zomatointgrtion === 1,
          amounttoqty: options.amounttoqty === 1,
          iscashsettlebtnenabled: options.iscashsettlebtnenabled === 1,
          defaultprintqty: Number(options.defaultprintqty),
          kotprintqty: Number(options.kotprintqty),
          maxbillprintqty: Number(options.maxbillprintqty),
          maxkotprintqty: Number(options.maxkotprintqty),
          maxdiscount: Number(options.maxdiscount),
          printwithoutsettlement: options.printwithoutsettlement === 1,
          kotprint: options.kotprint === 1,
          reasonforbillprint: options.reasonforbillprint === 1,
          logoprint: options.logoprint === 1,
          portionprint: options.portionprint === 1,
          complimentoryordersreason: options.complimentoryordersreason === 1,
          totalwoutroundoff: options.totalwoutroundoff === 1,
          allowedordertypeprint: allowOTPrintBill?.filter(
            (ot) =>
              (options.allowedordertypeprint || "") // Fallback to an empty string
                .split(",") // Convert string to array
                .includes(ot.ordertypeid?.toString()) // Match IDs
          ),
          allowedordertypekot: allowOTPrintBill?.filter((ot) =>
            (options.allowedordertypekot || "") // Fallback to an empty string
              .split(",")
              .includes(ot.ordertypeid?.toString())
          ),
          allowedpaymenttypeprint: allowPTPrintBIll?.filter((pt) =>
            (options.allowedpaymenttypeprint || "") // Fallback to an empty string
              .split(",")
              .includes(pt.paymentid?.toString())
          ),
          allowedpaymenttypekot: allowPTPrintBIll?.filter((pt) =>
            (options.allowedpaymenttypekot || "") // Fallback to an empty string
              .split(",")
              .includes(pt.paymentid?.toString())
          ),
        }));

        // Set top-level states
        setPos(posData.posname);
        setSelectedLoc(posData.locationid);
        setSelectedMenu(posData.defaultmenuid);
        setInvoiceMessages(posData.invoicemsg);
        setisActive(posData.isactive === 1);
        setSelectedPosMenu(posData.mappedMenus.map(menu => menu.menuid));
        setSqlPass(posData.mysqlpass)

      }
    } catch (error) {
      console.error("Error fetching POS details:", error.message);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.msg || error.message,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const isAlphanumericWithSpaces = (value) => {
    const regex = /^[a-zA-Z0-9 ]*$/; // includes space
    return regex.test(value);
  };


  return (
    <div>
      <div className="card-action-menu flex justify-content-between align-items-center">
        <div>Pos Master</div>
        <div
          className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
          onClick={() => navigate("/pos-list")}
        >
          <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
        </div>
      </div>
      <div className="card">
        <div className="grid p-fluid">
          <div className="field col-12 md:col-6  lg:col-3">
            <label>POS</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                placeholder="Define POS"
                value={pos}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setPos(inputValue);
                    setErrors((prevErrors) => ({ ...prevErrors, pos: "" }));
                  } // Clear error dynamically
                }}
                className={errors.pos ? "p-invalid" : ""}
              />
            )}
            {errors.pos && <small className="p-error">{errors.pos}</small>}
          </div>

          <div className="field col-12 md:col-6  lg:col-3">
            <label>Location</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <Dropdown
                placeholder="-please select-"
                filter
                showClear
                options={location}
                value={selectedLoc}
                onChange={(e) => {
                  setSelectedLoc(e.value);
                  setErrors((prevErrors) => ({ ...prevErrors, location: "" }));
                }}
                className={errors.location ? "p-invalid" : ""}
              />
            )}
            {errors.location && (
              <small className="p-error">{errors.location}</small>
            )}
          </div>

          <div className="field col-12 md:col-6  lg:col-3">
            <label>Default Menu</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <Dropdown
                placeholder="-please select-"
                filter
                showClear
                options={defaultMenu || []}
                emptyMessage="Please Select A Location First"
                value={selectedMenu}
                onChange={(e) => {
                  setSelectedMenu(e.value);
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    defaultMenu: "",
                  }));
                }}
                className={errors.defaultMenu ? "p-invalid" : ""}
              />
            )}
            {errors.defaultMenu && (
              <small className="p-error">{errors.defaultMenu}</small>
            )}
          </div>
          <div className="field col-12 md:col-6  lg:col-3">
            <label>Default Display screen</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <Dropdown
                filter
                placeholder="-please select-"
                options={displayScreen || []}
                value={formData.selectedDS}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, selectedDS: e.value }));
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    selectedDS: "",
                  }));
                }}
                className={errors.selectedDS ? "p-invalid" : ""}
                showClear
              />
            )}
            {errors.selectedDS && (
              <small className="p-error">{errors.selectedDS}</small>
            )}
          </div>
          {!roleid ?(
          <div className="field col-12 md:col-6  lg:col-6">
            <lable>pos menu</lable>
            <MultiSelect
            filter
            showClear
            options={posMenu}
            value={selectedPosMenu}
            onChange={(e)=> setSelectedPosMenu(e.value)}
            optionLabel="menuname"
            optionValue="menuid"
            display="chip"
            placeholder="-please select-"
            
            >
           </MultiSelect>
          </div>
          ) : null}
           {!roleid ?(
          <div className="field col-12 md:col-6  lg:col-6">
            <lable>My SQL Password</lable>
            <InputText 
            placeholder="Please Enter Password"
            type="password"
            value={sqlPass}
            onChange={(e)=> setSqlPass(e.target.value)}
            />
          </div>
          ) : null}
          <div className="field col-12 md:col-6  lg:col-6">
            <label>Invoice Messages</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputTextarea
                rows={5}
                cols={30}
                className={
                  errors.invoiceMessages ? "p-invalid" : "" || "no-resize"
                }
                placeholder="Please define Invoice Message"
                value={invoiceMessages}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setInvoiceMessages(e.target.value);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      invoiceMessages: "",
                    }));
                  }
                }}
              />
            )}
            {errors.invoiceMessages && (
              <small className="p-error">{errors.invoiceMessages}</small>
            )}
          </div>

          <div className="col-12 md:col-6  lg:col-6 flex gap-4 items-center ">
            <label htmlFor="switch1" className="switch-label">
              Is Active?
            </label>

            <div>
              <div className="flex align-items-center">
                <InputSwitch
                  name="isActive"
                  onChange={(e) => setisActive(e.target.value)}
                  checked={isActive}
                  id="switch1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid formgrid p-fluid">
        <div className="col-12 md:col-6 mb-4 md:mb-0">
          <div className="card  pos-master-card ">
            <div className="flex  align-items-center  p-2">
              <div className="flex-1 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  POS Touch Screen
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, touchscreen: e.value }));
                  }}
                  checked={formData.touchscreen}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center flex-wrap p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Show Cash Balance
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, showcashbal: e.value }));
                  }}
                  checked={formData.showcashbal}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Cash Domination Compulsory
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, cashnote: e.value }));
                  }}
                  checked={formData.cashnote}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Is Day End Allowed Through This POS ?
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, dayposallow: e.value }));
                  }}
                  checked={formData.dayposallow}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  At End Of Day Print Item Wise Sales Report
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      itemwisesalesreport: e.value,
                    }));
                  }}
                  checked={formData.itemwisesalesreport}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  At End Of Day Print Category Wise Sales Report
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      categorywisereport: e.value,
                    }));
                  }}
                  checked={formData.categorywisereport}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  At End Of Day Print Bill Summary Report
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      billsummaryreports: e.value,
                    }));
                  }}
                  checked={formData.billsummaryreports}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Allow Customer Selection Before Placing Order
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, customerselc: e.value }));
                  }}
                  checked={formData.customerselc}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Is Reason Compulsory For Discount
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, discompulsry: e.value }));
                  }}
                  checked={formData.discompulsry}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Allow Customer Selection Complimentary Order (Free Of Cost)
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      isfreeofcostbtnenabled: e.value,
                    }));
                  }}
                  checked={formData.isfreeofcostbtnenabled}
                  id="S1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 md:col-6 ">
          <div className="card p-fluid pos-master-card  ">
            <div className="flex align-items-center p-2 ">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Specify Cash Difference In Settlement Recipt
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      cashdifference: e.value,
                    }));
                  }}
                  checked={formData.cashdifference}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Allow Edit After Bill Print
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      editsaveorders: e.value,
                    }));
                  }}
                  checked={formData.editsaveorders}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Cancelled KOT Print
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      canceledkotprint: e.value,
                    }));
                  }}
                  checked={formData.canceledkotprint}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Send KOT Print On Bill Printer
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      sendkotprintonbiller: e.value,
                    }));
                  }}
                  checked={formData.sendkotprintonbiller}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Print Company Name In Bill
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      companynameonbill: e.value,
                    }));
                  }}
                  checked={formData.companynameonbill}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Merge Item Qty & KOT
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      mergeitemqtybillkot: e.value,
                    }));
                  }}
                  checked={formData.mergeitemqtybillkot}
                  id="S1"
                />
              </div>
            </div>

            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Enable Weighting Scale Integration
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      zomatointgrtion: e.value,
                    }));
                  }}
                  checked={formData.zomatointgrtion}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Allow Amount to Quantity Conversion
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, amounttoqty: e.value }));
                  }}
                  checked={formData.amounttoqty}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Is Cash Settle Button Enable
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      iscashsettlebtnenabled: e.value,
                    }));
                  }}
                  checked={formData.iscashsettlebtnenabled}
                  id="S1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-action-menu flex justify-content-between align-items-center mt-5 ">
        <div>Print Configuration</div>
      </div>
      <div className="grid formgrid p-fluid ">
        <div className="col-12 md:col-6 mb-4 md:mb-0">
          <div className="card p-fluid  pos-master-card ">
            <div className="field col-12 p-2 " style={{ marginBottom: "1px" }}>
              <label>Default Bill Print Quality</label>
              {loading ? (
                <Skeleton width="100%" height="2.5rem" />
              ) : (
                <InputNumber
                  value={formData.defaultprintqty}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      defaultprintqty: e.value,
                    }));
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      defaultprintqty: "",
                    }));
                  }}
                  className={errors.defaultprintqty ? "p-invalid" : ""}
                  placeholder="Bill Print Quality"
                />
              )}
              {errors.defaultprintqty && (
                <small className="p-error">{errors.defaultprintqty}</small>
              )}
            </div>
            <div className="field col-12 p-2" style={{ marginBottom: "1px" }}>
              <label>Default KOT Print Quality</label>
              {loading ? (
                <Skeleton width="100%" height="2.5rem" />
              ) : (
                <InputNumber
                  value={formData.kotprintqty}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, kotprintqty: e.value }));
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      kotprintqty: "",
                    }));
                  }}
                  placeholder="KOT Print Quality"
                  className={errors.kotprintqty ? "p-invalid" : ""}
                />
              )}
              {errors.kotprintqty && (
                <small className="p-error">{errors.kotprintqty}</small>
              )}
            </div>
            <div className="field col-12 p-2" style={{ marginBottom: "1px" }}>
              <label>Maximum Bill Reprint Quality</label>
              {loading ? (
                <Skeleton width="100%" height="2.5rem" />
              ) : (
                <InputNumber
                  value={formData.maxbillprintqty}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      maxbillprintqty: e.value,
                    }));
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      maxbillprintqty: "",
                    }));
                  }}
                  placeholder="Maximum Bill Print Quality"
                  className={errors.maxbillprintqty ? "p-invalid" : ""}
                />
              )}
              {errors.maxbillprintqty && (
                <small className="p-error">{errors.maxbillprintqty}</small>
              )}
            </div>
            <div className="field col-12 p-2 " style={{ marginBottom: "1px" }}>
              <label>Maximum KOT Reprint Quality</label>
              {loading ? (
                <Skeleton width="100%" height="2.5rem" />
              ) : (
                <InputNumber
                  value={formData.maxkotprintqty}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      maxkotprintqty: e.value,
                    }));
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      maxkotprintqty: "",
                    }));
                  }}
                  placeholder="Maximum KOT Print Quality"
                  className={errors.maxkotprintqty ? "p-invalid" : ""}
                />
              )}
              {errors.maxkotprintqty && (
                <small className="p-error">{errors.maxkotprintqty}</small>
              )}
            </div>
            <div className="field col-12 p-2">
              <label>Maximum Discount(%)</label>
              {loading ? (
                <Skeleton width="100%" height="2.5rem" />
              ) : (
                <InputNumber
                  value={formData.maxdiscount}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, maxdiscount: e.value }));
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      maxdiscount: "",
                    }));
                  }}
                  placeholder="Maximum Discount"
                  className={errors.maxdiscount ? "p-invalid" : ""}
                />
              )}
              {errors.maxdiscount && (
                <small className="p-error">{errors.maxdiscount}</small>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 ">
          <div className="card p-fluid pos-master-card ">
            <div className="flex align-items-center p-2 ">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Bill Print On Settlement
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      printwithoutsettlement: e.value,
                    }));
                  }}
                  checked={formData.printwithoutsettlement}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  KOT Print
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, kotprint: e.value }));
                  }}
                  checked={formData.kotprint}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Specify Reason For Bill Print
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      reasonforbillprint: e.value,
                    }));
                  }}
                  checked={formData.reasonforbillprint}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Logo Print In Bill
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, logoprint: e.value }));
                  }}
                  checked={formData.logoprint}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Need To Print Portion In Bill
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, portionprint: e.value }));
                  }}
                  checked={formData.portionprint}
                  id="S1"
                />
              </div>
            </div>
            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Specify Reason Selection For Complimentory Orders
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      complimentoryordersreason: e.value,
                    }));
                  }}
                  checked={formData.complimentoryordersreason}
                  id="S1"
                />
              </div>
            </div>

            <div className="flex align-items-center p-2">
              <div className="flex-2 basis-3/4">
                <label htmlFor="S1" className="switch-label">
                  Final Amount In Bill (Without Round Off)
                </label>
              </div>
              <div className="flex-1 basis-1/4 flex justify-content-end">
                <InputSwitch
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      totalwoutroundoff: e.value,
                    }));
                  }}
                  checked={formData.totalwoutroundoff}
                  id="S1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card mt-5">
        <div className="field col-12 md:col-6">
          <div className="flex flex-column md:flex-row md:align-items-center gap-2 m-2">
            <label className="w-full md:w-17rem flex-shrink-0">
              Allow Order Type To Print Bill
            </label>
            <div className="flex flex-column w-full">
              <MultiSelect
                style={{ width: "250px" }}
                placeholder="-please select-"
                options={allowOTPrintBill}
                value={formData.allowedordertypeprint}
                onChange={(e) => {
                  setFormData({ ...formData, allowedordertypeprint: e.value });
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    allowedordertypeprint: "",
                  }));
                }}
                optionLabel="ordertype"
                display="chip"
                className={errors.allowedordertypeprint ? "p-invalid" : ""}
              ></MultiSelect>
              {errors.allowedordertypeprint && (
                <small className="p-error">
                  {errors.allowedordertypeprint}
                </small>
              )}
            </div>
          </div>
        </div>
        <div className="field col-12 md:col-12">
          <div className="grid w-full gap-2">
            {formData.allowedordertypeprint &&
              formData.allowedordertypeprint.map((item) => (
                <Chip
                  key={item.ordertypeid} // Ensure React can track items correctly
                  label={item.ordertype}
                  removable
                  onRemove={() =>
                    setFormData((prev) => ({
                      ...prev,
                      allowedordertypeprint: prev.allowedordertypeprint.filter(
                        (i) => i.ordertypeid !== item.ordertypeid
                      ),
                    }))
                  }
                />
              ))}
          </div>
        </div>

        <div className="field col-12 md:col-6">
          <div className="flex flex-column md:flex-row md:align-items-center gap-2 m-2">
            <label className="w-full md:w-17rem flex-shrink-0">
              Allow Order Type To Print KOT
            </label>
            <div className="flex flex-column w-full">
              <MultiSelect
                style={{ width: "250px" }}
                placeholder="-please select-"
                options={allowOTPrintBill}
                value={formData.allowedordertypekot}
                onChange={(e) => {
                  setFormData({ ...formData, allowedordertypekot: e.value });
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    allowedordertypekot: "",
                  }));
                }}
                optionLabel="ordertype"
                display="chip"
                className={errors.allowedordertypekot ? "p-invalid" : ""}
              ></MultiSelect>
              {errors.allowedordertypekot && (
                <small className="p-error">{errors.allowedordertypekot}</small>
              )}
            </div>
          </div>
        </div>
        <div className="field col-12 md:col-12 w-full">
          <div className="flex flex-wrap gap-2 w-full">
            {formData.allowedordertypekot &&
              formData.allowedordertypekot.map((item, index) => (
                <Chip
                  key={item.ordertypeid} // Ensure React can track items correctly
                  label={item.ordertype}
                  removable
                  onRemove={() =>
                    setFormData((prev) => ({
                      ...prev,
                      allowedordertypekot: prev.allowedordertypekot.filter(
                        (i) => i.ordertypeid !== item.ordertypeid
                      ),
                    }))
                  }
                />
              ))}
          </div>
        </div>

        <div className="field col-12 md:col-6">
          <div className="flex flex-column md:flex-row md:align-items-center gap-2 m-2">
            <label className="w-full md:w-17rem flex-shrink-0">
              Allow Payment Type To Print Bill
            </label>
            <div className="flex flex-column w-full">
              <MultiSelect
                style={{ width: "250px" }}
                placeholder="-please select-"
                options={allowPTPrintBIll}
                optionLabel="paymentmodename"
                value={formData.allowedpaymenttypeprint}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    allowedpaymenttypeprint: e.value,
                  });
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    allowedpaymenttypeprint: "",
                  }));
                }}
                display="chip"
                className={errors.allowedpaymenttypeprint ? "p-invalid" : ""}
              ></MultiSelect>
              {errors.allowedpaymenttypeprint && (
                <small className="p-error">
                  {errors.allowedpaymenttypeprint}
                </small>
              )}
            </div>
          </div>
        </div>
        <div className="field col-12 md:col-12">
          <div className="flex flex-wrap gap-2">
            {formData.allowedpaymenttypeprint &&
              formData.allowedpaymenttypeprint.map((item, index) => (
                <Chip
                  key={item.paymentid} // Ensure React can track items correctly
                  label={item.paymentmodename}
                  removable
                  onRemove={() =>
                    setFormData((prev) => ({
                      ...prev,
                      allowedpaymenttypeprint:
                        prev.allowedpaymenttypeprint.filter(
                          (i) => i.paymentid !== item.paymentid
                        ),
                    }))
                  }
                />
              ))}
          </div>
        </div>

        <div className="field col-12 md:col-6">
          <div className="flex flex-column md:flex-row md:align-items-center gap-2 m-2">
            <label className="w-full md:w-17rem flex-shrink-0">
              Allow Payment Type To Print KOT
            </label>
            <div className="flex flex-column w-full">
              <MultiSelect
                style={{ width: "250px" }}
                placeholder="-please select-"
                options={allowPTPrintBIll}
                optionLabel="paymentmodename"
                value={formData.allowedpaymenttypekot}
                onChange={(e) => {
                  setFormData({ ...formData, allowedpaymenttypekot: e.value });
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    allowedpaymenttypekot: "",
                  }));
                }}
                display="chip"
                className={errors.allowedpaymenttypekot ? "p-invalid" : ""}
              ></MultiSelect>
              {errors.allowedpaymenttypekot && (
                <small className="p-error">
                  {errors.allowedpaymenttypekot}
                </small>
              )}
            </div>
          </div>
        </div>
        <div className="field col-12 md:col-12 ">
          <div className="flex flex-wrap gap-2">
            {formData.allowedpaymenttypekot &&
              formData.allowedpaymenttypekot.map((item, index) => (
                <Chip
                  key={item.paymentid} // Ensure React can track items correctly
                  label={item.paymentmodename}
                  removable
                  onRemove={() =>
                    setFormData((prev) => ({
                      ...prev,
                      allowedpaymenttypekot: prev.allowedpaymenttypekot.filter(
                        (i) => i.paymentid !== item.paymentid
                      ),
                    }))
                  }
                />
              ))}
          </div>
        </div>

        <Toast ref={toast} />
        <div className="field col-12 flex justify-content-end">
          <Button
            onClick={Click}
            label={
              isSeving
                ? posid
                  ? "Updating POS..."
                  : "Adding POS..."
                : posid
                ? "Update POS"
                : "Add POS"
            }
            disabled={isSeving}
          />
        </div>
      </div>
    </div>
  );
}

export default PosMaster;
