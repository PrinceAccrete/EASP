import React, { useState, useRef } from "react";
import { Steps } from "primereact/steps";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import "./CSVfile.scss";

const FileUploader = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const toast = useRef(null);
    const [newData, setNewData] = useState({
        products: [],
        categories: [],
        subcategories: [],
        portions: [],
    });

    const [errors, setErrors] = useState([]);
    const [sourceExisted, setSourceExisted] = useState([
        { id: 1, name: "Classic Margherita Pizza" },
        { id: 2, name: "Spicy Peri Peri Fries" },
        { id: 3, name: "Cheesy Garlic Bread" },
        { id: 4, name: "Tandoori Paneer Wrap" },
    ]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setTimeout(() => {
                const dummyData = {
                    products: [
                        { name: "Margherita Pizza" },
                        { name: "Veggie Burger" },
                        { name: "Cheese Fries" },
                        { name: "Grilled Chicken Wrap" },
                    ],
                    categories: [{ name: "Pizza" }, { name: "Burgers" }, { name: "Snacks" }],
                    subcategories: [
                        { name: "Vegetarian" },
                        { name: "Non-Vegetarian" },
                        { name: "Spicy" },
                    ],
                    portions: [{ name: "Small" }, { name: "Medium" }, { name: "Large" }],
                };
                setNewData(dummyData);
                setErrors([]);
            }, 500);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getFileIcon = (fileName) => {
        if (fileName.endsWith(".csv")) {
            return (
                <i
                    className="pi pi-file"
                    style={{ fontSize: "1.3rem", color: "#17a2b8", marginRight: "8px" }}
                />
            );
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            return (
                <i
                    className="pi pi-file-excel"
                    style={{ fontSize: "1.3rem", color: "#28a745", marginRight: "8px" }}
                />
            );
        }
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        toast.current.show({
            severity: "success",
            summary: "Import Complete",
            detail: "Product successfully imported!",
            life: 3000,
        });
    };

    const isError = (data) => data && data.length > 0;

    const steps = [
        {
            label: "Import File",
            template: (item, index) => (
                <div className="flex flex-col items-center relative">
                    <span
                        className={`w-2rem h-2rem z-10 flex items-center justify-center rounded-full text-base font-semibold
                  ${activeIndex > 0 ? "bg-green-600 text-white" : "bg-gray-200 text-black"}`}
                    >
                        {activeIndex > 0 ? <i className="pi pi-check" /> : 1}
                    </span>
                    <span className="text-xs sm:text-sm mt-1">{item.label}</span>
                </div>
            ),
        },
        {
            label: "Check Imported File",
            template: (item, index) => (
                <div className="flex flex-col items-center relative">
                    <span
                        className={`w-2rem h-2rem z-10 flex items-center justify-center rounded-full text-base font-semibold
                  ${
                      activeIndex > 1
                          ? "bg-green-500 text-white"
                          : activeIndex === 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                  }`}
                    >
                        {activeIndex > 1 ? <i className="pi pi-check" /> : 2}
                    </span>
                    <span className="text-xs sm:text-sm mt-1">{item.label}</span>
                </div>
            ),
        },
        {
            label: "Complete Import",
            template: (item, index) => (
                <div className="flex flex-col items-center relative">
                    <span
                        className={`w-2rem h-2rem z-10 flex items-center justify-center rounded-full text-base font-semibold
                    ${
                        isSubmitted
                            ? "bg-green-500 text-white"
                            : activeIndex === 2
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-black"
                    }`}
                    >
                        {isSubmitted ? <i className="pi pi-check" /> : 3}
                    </span>
                    <span className="text-xs sm:text-sm mt-1">{item.label}</span>
                </div>
            ),
        },
    ];

    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
                    Product Import
                </h2>

                <Steps
                    model={steps}
                    activeIndex={activeIndex}
                    readOnly
                    className="mb-6 w-full sm:w-auto sm:max-w-[90%] mx-auto overflow-x-auto text-sm sm:text-xs md:text-lg lg:text-xl"
                />

                {/* step-1 */}

                {activeIndex === 0 && (
                    <>
                        <div className="p-6 border rounded-lg shadow-md bg-gray-50 space-y-4">
                            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-4 cursor-pointer">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                {selectedFile ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-4">
                                        <div className="flex items-center flex-wrap break-words max-w-full">
                                            {getFileIcon(selectedFile.name)}
                                            <p className="text-gray-700 font-medium text-sm sm:text-base break-all">
                                                {selectedFile.name}
                                            </p>
                                        </div>
                                        <Button
                                            icon="pi pi-times"
                                            className="p-0 sm:p-1 text-xs sm:text-sm text-red-500 bg-transparent border-none"
                                            onClick={handleRemoveFile}
                                            aria-label="Remove File"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm sm:text-base text-center sm:text-left">
                                        Click to upload CSV or Excel file
                                    </p>
                                )}
                            </label>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                label="Next"
                                icon="pi pi-angle-right"
                                iconPos="right"
                                className="p-button-primary"
                                onClick={() => setActiveIndex((prev) => prev + 1)}
                                disabled={!selectedFile}
                            />
                        </div>
                    </>
                )}

                {/* step-2 */}

                {activeIndex === 1 && (
                    <>
                        <div className="grid-container">
                            <div className="border rounded-lg mb-4 border-gray-200">
                                <DataTable
                                    value={newData.products}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Products to be added (${newData.products.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>

                            <div className="border rounded-md mb-4 border-gray-200">
                                <DataTable
                                    value={newData.categories}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Categories to be added (${newData.categories.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>

                            <div className="border rounded-md mb-4 border-gray-200">
                                <DataTable
                                    value={newData.subcategories}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Subcategories to be added (${newData.subcategories.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>

                            <div className="border rounded-md mb-4 border-gray-200">
                                <DataTable
                                    value={newData.portions}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Portions to be added (${newData.portions.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>
                        </div>

                        <hr className="border-t border-gray-300 my-4 " />

                        <div className="grid-container">
                            <div className="border rounded-md mb-4 border-gray-200">
                                <DataTable
                                    value={sourceExisted}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Exists Products (${sourceExisted.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>

                            <div
                                className={`border rounded-md mb-4 ${
                                    isError(errors) ? "border-red-400" : "border-gray-300"
                                }`}
                            >
                                <DataTable
                                    value={errors}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="message"
                                        header={`Errors (${errors.length})`}
                                        headerClassName={
                                            isError(errors) ? "text-red-400" : "text-gray-700"
                                        }
                                        bodyClassName={
                                            isError(errors) ? "text-red-400" : "text-gray-700"
                                        }
                                    />
                                </DataTable>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Button
                                label="Previous"
                                icon="pi pi-angle-left"
                                className="p-button-secondary"
                                onClick={() => setActiveIndex((prev) => prev - 1)}
                            />
                            <Button
                                label="Next"
                                icon="pi pi-angle-right"
                                iconPos="right"
                                className="p-button-primary"
                                onClick={() => setActiveIndex((prev) => prev + 1)}
                            />
                        </div>
                    </>
                )}

                {/* step-3 */}

                {activeIndex === 2 && (
                    <>
                        <div className="grid-container">
                            <div className="border rounded-md border-gray-200 mb-4">
                                <DataTable
                                    value={newData.products}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Products Created (${newData.products.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>

                            <div className="border rounded-md border-gray-200 mb-4">
                                <DataTable
                                    value={newData.categories}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Categories Created (${newData.categories.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>

                            <div className="border rounded-md border-gray-200 mb-4">
                                <DataTable
                                    value={newData.subcategories}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Subcategories Created (${newData.subcategories.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>

                            <div className="border rounded-md border-gray-200 mb-4">
                                <DataTable
                                    value={newData.portions}
                                    scrollable
                                    scrollHeight="225px"
                                    style={{ width: "100%" }}
                                >
                                    <Column
                                        field="name"
                                        header={`Portions Created (${newData.portions.length})`}
                                        headerClassName="text-sm sm:text-base md:text-lg"
                                    />
                                </DataTable>
                            </div>
                        </div>
                        <div className="flex justify-between mt-6">
                            <Button
                                label="Previous"
                                icon="pi pi-angle-left"
                                className="p-button-secondary"
                                onClick={() => {
                                    setActiveIndex((prev) => prev - 1);
                                    setIsSubmitted(false);
                                }}
                            />
                            <Button
                                label="Submit"
                                className="p-button-success"
                                onClick={handleSubmit}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default FileUploader;
