import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { Skeleton } from "primereact/skeleton";

function ProductChannelMaster() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const { id } = useParams();
  const channelid = id || null;
  const token = useSelector((state) => state.auth.token);

  const [errors, setErrors] = useState({});
  const [channelName, setChannelName] = useState("");
  const [selectedChId, setSelectedChId] = useState(null);
  const [channelGroupId, setChannelGroupId] = useState([]);
  const [secketKey, setSecketKey] = useState("");
  const [secketValue, setSecketValue] = useState();
  const [tokenUrl, setTokenUrl] = useState("");
  const [storeAddUpdateUrl, setStoreAddUpdateUrl] = useState("");
  const [storeAction, setStoreAction] = useState("");
  const [menuAddUpdateUrl, setMenuAddUpdateUrl] = useState("");
  const [itemAction, setItemAction] = useState("");
  const [orderStatusUpdate, setOrderStatusUpdate] = useState("");
  const [riderAddUpdate, setRiderAddUpdate] = useState("");
  const [riderAssign, setRiderAssign] = useState("");
  const [isSeving, setIsSeving] = useState(false);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;

  useEffect(() => {
    if (!token) return;

    const fetchCGId = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/channel/getChannelGroup`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success === 1 && Array.isArray(response.data.data)) {
          setChannelGroupId(
            response.data.data.map((item) => ({
              label: item.cgname,
              value: item.channelgroupid,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching Group Ids:", error.message);
      }
    };

    fetchCGId();
  }, [token]);

  const handleSubmit = async () => {
    const payload = {
      channelName,
      channelGroupId: selectedChId,
      secretkey: secketKey,
      secretvalue: secketValue,
      tokenurl: tokenUrl,
      storeaddupdateurl: storeAddUpdateUrl,
      storeaction: storeAction,
      menuaddupdate: menuAddUpdateUrl,
      itemaction: itemAction,
      orderstatusupdate: orderStatusUpdate,
      rideraddupdate: riderAddUpdate,
      riderassign: riderAssign,
    };

    try {
      let response;
      if (channelid) {
        // Update API
        response = await axios.post(
          `${BASE_URL}/channel/updateChannel/${channelid}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      
        
      } else {
        // Create API
        response = await axios.post(
          `${BASE_URL}/channel/createChannel`,
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
          summary: channelid ? "Updated" : "Added",
          detail: channelid
            ? "Data Updated Successfully"
            : "Data Added Successfully",
          life: 3000,
        });
        setChannelName("");
        setSelectedChId([]);
        setSecketKey("");
        setSecketValue("");
        setTokenUrl("");
        setStoreAddUpdateUrl("");
        setStoreAction("");
        setMenuAddUpdateUrl("");
        setItemAction("");
        setOrderStatusUpdate("");
        setRiderAddUpdate("");
        setRiderAssign("");
        if (channelid) {
          setTimeout(() => {
            navigate("/channel-list");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong.",
      });
    } finally {
      setIsSeving(false);
    }
  };

  useEffect(() => {
    const fetchChannelData = async () => {
      if (channelid) {
        setLoading(true);
        try {
          const response = await axios.get(
            `${BASE_URL}/channel/getChannelData/${channelid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = response.data?.data?.[0];

          if (data) {
            setChannelName(data.channelname || "");
            setSelectedChId(data.channelgroupid || []);
            setSecketKey(data.secretkey || "");
            setSecketValue(data.secretvalue || "");
            setTokenUrl(data.tokenurl || "");
            setStoreAddUpdateUrl(data.storeaddupdateurl || "");
            setStoreAction(data.storeaction || "");
            setMenuAddUpdateUrl(data.menuaddupdate || "");
            setItemAction(data.itemaction || "");
            setOrderStatusUpdate(data.orderstatusupdate || "");
            setRiderAddUpdate(data.rideraddupdate || "");
            setRiderAssign(data.riderassign || "");
          } else {
            toast.current.show({
              severity: "warn",
              summary: "No Data",
              detail: "Channel data not found.",
            });
          }
        } catch (error) {
          console.error("Failed to fetch channel data:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to load channel data.",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchChannelData();
  }, [channelid]);

  const handleAddClick = () => {
    const newErrors = {};

    if (!channelName || channelName.trim() === "") {
      newErrors.channelName = "Please enter a channel name";
    }
    if (!selectedChId) {
      newErrors.channelGroupId = "Please select a channel group id";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const isAlphanumericWithSpaces = (value) => {
    const regex = /^[a-zA-Z0-9 ]*$/; // includes space
    return regex.test(value);
  };

  const URLregex = (value) => {
    const regex = /^[^ {}\[\]()<>\n\r\t]*$/;
    return regex.test(value);
  };

  const secretregex = (value) => {
    const regex = /^[a-zA-Z0-9 @#$&%+\-]*$/;
    return regex.test(value);
  };

  const click = () => {
    if (handleAddClick()) {
      handleSubmit();
      setIsSeving(true);
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="card-action-menu flex justify-content-between align-items-center">
        <div className="text-black">Channel Master</div>
        <div
          className="hover:bg-gray-200 transition-colors p-1 border-round cursor-pointer"
          onClick={() => navigate("/channel-list")}
        >
          <i className="pi pi-list" style={{ fontSize: "1.3rem" }} />
        </div>
      </div>

      <div className="card">
        <div className="grid p-fluid">
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Channel Group Id <span style={{ color: 'red' }}>*</span></label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <Dropdown
                filter
                showClear
                value={selectedChId}
                onChange={(e) => {
                  setSelectedChId(e.value);
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    channelGroupId: "",
                  })); // Clear error dynamically
                }}
                options={channelGroupId}
                placeholder="- Please Select -"
                className={errors.channelGroupId ? "p-invalid" : ""}
              ></Dropdown>
            )}
            {errors.channelGroupId && (
              <small className="p-error">{errors.channelGroupId}</small>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Channel Name <span style={{ color: 'red' }}>*</span></label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={channelName}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setChannelName(e.target.value);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      channelName: "",
                    }));
                  }
                }}
                className={errors.channelName ? "p-invalid" : ""}
                placeholder="Channel Name"
              ></InputText>
            )}
            {errors.channelName && (
              <small className="p-error">{errors.channelName}</small>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Secket Key</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={secketKey}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (secretregex(inputValue)) {
                    setSecketKey(e.target.value);
                  }
                }}
                placeholder="Secket Key"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Secket Value</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputNumber
                value={secketValue}
                type="password"
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (URLregex(inputValue)) {
                    setSecketValue(e.target.value);
                  }
                }}
                placeholder="Secket Value"
              ></InputNumber>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Token URL</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={tokenUrl}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (URLregex(inputValue)) {
                    setTokenUrl(e.target.value);
                  }
                }}
                placeholder="Token URL"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Store Add/Update URL</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={storeAddUpdateUrl}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (URLregex(inputValue)) {
                    setStoreAddUpdateUrl(e.target.value);
                  }
                }}
                placeholder="Store Add/Update URL"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Store Action</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={storeAction}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setStoreAction(e.target.value);
                  }
                }}
                placeholder="Store Action"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Menu Add/Update URL</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={menuAddUpdateUrl}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (URLregex(inputValue)) {
                    setMenuAddUpdateUrl(e.target.value);
                  }
                }}
                placeholder="Menu Add/Update URL"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Item Action</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={itemAction}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setItemAction(e.target.value);
                  }
                }}
                placeholder="Item Action"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Order Status Update</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={orderStatusUpdate}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setOrderStatusUpdate(e.target.value);
                  }
                }}
                placeholder="Order Status Update"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Rider Add/Update</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={riderAddUpdate}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setRiderAddUpdate(e.target.value);
                  }
                }}
                placeholder="Rider Add/Update"
              ></InputText>
            )}
          </div>
          <div className="field col-12 md:col-6 lg:col-4">
            <label>Rider Assign</label>
            {loading ? (
              <Skeleton width="100%" height="2.5rem" />
            ) : (
              <InputText
                value={riderAssign}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isAlphanumericWithSpaces(inputValue)) {
                    setRiderAssign(e.target.value);
                  }
                }}
                placeholder="Rider Assign"
              ></InputText>
            )}
          </div>
        </div>
        <div className="field col-12 flex justify-content-end">
          <Button
            onClick={click}
            label={
              isSeving
                ? channelid
                  ? "Updating Channel"
                  : "Adding Channel"
                : channelid
                ? "Update Channel"
                : "Add Channel"
            }
            disabled={isSeving}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductChannelMaster;
