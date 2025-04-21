import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
// import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";

const MainContent = () => {
    // const [products, setProducts] = useState<Demo.Product[]>([]);
    const menu1 = useRef < Menu > null;
    const menu2 = useRef < Menu > null;
    const toast = useRef(null);
    // const { layoutConfig } = useContext(LayoutContext);

    // const applyLightTheme = () => {
    //     const lineOptions: ChartOptions = {
    //         plugins: {
    //             legend: {
    //                 labels: {
    //                     color: "#495057",
    //                 },
    //             },
    //         },
    //         scales: {
    //             x: {
    //                 ticks: {
    //                     color: "#495057",
    //                 },
    //                 grid: {
    //                     color: "#ebedef",
    //                 },
    //             },
    //             y: {
    //                 ticks: {
    //                     color: "#495057",
    //                 },
    //                 grid: {
    //                     color: "#ebedef",
    //                 },
    //             },
    //         },
    //     };

    //     setLineOptions(lineOptions);
    // };

    // const applyDarkTheme = () => {
    //     const lineOptions = {
    //         plugins: {
    //             legend: {
    //                 labels: {
    //                     color: "#ebedef",
    //                 },
    //             },
    //         },
    //         scales: {
    //             x: {
    //                 ticks: {
    //                     color: "#ebedef",
    //                 },
    //                 grid: {
    //                     color: "rgba(160, 167, 181, .3)",
    //                 },
    //             },
    //             y: {
    //                 ticks: {
    //                     color: "#ebedef",
    //                 },
    //                 grid: {
    //                     color: "rgba(160, 167, 181, .3)",
    //                 },
    //             },
    //         },
    //     };

    //     setLineOptions(lineOptions);
    // };

    // useEffect(() => {
    //     ProductService.getProductsSmall().then((data) => setProducts(data));
    // }, []);

    // useEffect(() => {
    //     if (layoutConfig.colorScheme === "light") {
    //         applyLightTheme();
    //     } else {
    //         applyDarkTheme();
    //     }
    // }, [layoutConfig.colorScheme]);

    // const formatCurrency = (value: number) => {
    //     return value?.toLocaleString("en-US", {
    //         style: "currency",
    //         currency: "USD",
    //     });
    // };

    useEffect(() => {
        // Check if login success message exists
        const message = sessionStorage.getItem("loginSuccess");

        if (message) {
            toast.current.show({
                severity: "success",
                detail: message,
                life: 2000,
            });

            // Clear message after displaying
            sessionStorage.removeItem("loginSuccess");
        }
    }, []);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Bills</span>
                            <div className="text-900 font-medium text-xl">132</div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-blue-100 border-round"
                            style={{ width: "2.5rem", height: "2.5rem" }}
                        >
                            <i className="pi pi-shopping-cart text-blue-500 text-xl" />
                        </div>
                    </div>
                    {/* <span className="text-green-500 font-medium">24 new </span>
                    <span className="text-500">since last visit</span> */}
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Income</span>
                            <div className="text-900 font-medium text-xl">$265.132</div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-orange-100 border-round"
                            style={{ width: "2.5rem", height: "2.5rem" }}
                        >
                            <i className="pi pi-map-marker text-orange-500 text-xl" />
                        </div>
                    </div>
                    {/* <span className="text-green-500 font-medium">%52+ </span>
                    <span className="text-500">since last week</span> */}
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Purchase</span>
                            <div className="text-900 font-medium text-xl">$35.132</div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-cyan-100 border-round"
                            style={{ width: "2.5rem", height: "2.5rem" }}
                        >
                            <i className="pi pi-inbox text-cyan-500 text-xl" />
                        </div>
                    </div>
                    {/* <span className="text-green-500 font-medium">520 </span>
                    <span className="text-500">newly registered</span> */}
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Expense</span>
                            <div className="text-900 font-medium text-xl">152</div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-purple-100 border-round"
                            style={{ width: "2.5rem", height: "2.5rem" }}
                        >
                            <i className="pi pi-comment text-purple-500 text-xl" />
                        </div>
                    </div>
                    {/* <span className="text-green-500 font-medium">85 </span>
                    <span className="text-500">responded</span> */}
                </div>
            </div>
        </div>
    );
};

export default MainContent;
