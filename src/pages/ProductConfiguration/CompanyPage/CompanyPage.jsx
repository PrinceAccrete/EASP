import React, { useState } from "react";
import CompanyHeader from "../../../components/CompanyHeader/CompanyHeader";
import { InputText } from "primereact/inputtext";

const CompanyPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const companies = [
        { id: 1, name: "Billberry" },
        { id: 2, name: "Accrete Accrete Accrete" },
        { id: 3, name: "Prince" },
        { id: 4, name: "Dhrumil" },
        { id: 5, name: "Amit" },
        { id: 6, name: "tuple" },
        { id: 7, name: "Company 7" },
        { id: 8, name: "Company 7" },
        { id: 9, name: "Company 7" },
        { id: 10, name: "Company 7" },
        { id: 11, name: "Company 7" },
        { id: 12, name: "Company 7" },
        { id: 13, name: "Company 7" },
        { id: 14, name: "Company 7" },
        { id: 15, name: "Company 7" },
        { id: 16, name: "Company 7" },
    ];

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-[#e9eaf5] to-[#f5f6fc] p-4">
            <div className="absolute top-0 left-0 w-full z-10">
                <CompanyHeader />
            </div>

            <div className="relative w-full h-auto flex justify-center items-center">
                <div className="w-[90%] sm:w-[90%] md:w-[90%] lg:w-[50%] bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-2xl mt-16 shadow-xl border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold m-0 text-gray-900 text-center sm:text-left">
                            Select a Business
                        </h1>
                        <p className="mt-1 sm:mt-0 text-sm sm:text-sm md:text-base text-gray-700 text-center sm:text-right">
                            <span className="font-semibold text-gray-800">Your Businesses:</span>{" "}
                            {filteredCompanies.length}
                        </p>
                    </div>

                    <div className="mt-4 w-full md:w-64 mx-auto sm:mx-0">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search text-gray-500 ml-3" />
                            <InputText
                                type="text"
                                className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                                text-sm sm:text-base md:text-lg pl-6 shadow-sm"
                                placeholder="Search for a business..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ borderRadius: "30px" }}
                            />
                        </span>
                    </div>

                    <hr className="my-5 border-gray-300" />

                    <div
                        className={`flex flex-col gap-4 transition-all duration-300 ${
                            filteredCompanies.length === 0
                                ? "min-h-[100px] justify-center items-center"
                                : ""
                        }`}
                    >
                        {filteredCompanies.length > 0 ? (
                            filteredCompanies.map((company) => (
                                <div
                                    key={company.id}
                                    className="group flex items-center bg-zinc-100 p-3 sm:p-3 md:p-3 lg:p-4 shadow-sm rounded-xl transition-all duration-300 hover:bg-zinc-2    00 hover:shadow-md w-full"
                                >
                                    <div className="flex justify-center items-center p-2 rounded-lg bg-zinc-300/30">
                                        <i className="pi pi-building text-3xl sm:text-4xl md:text-5xl text-gray-700 transition duration-300" />
                                    </div>

                                    <div className="flex flex-1 justify-between items-center w-full px-2">
                                        <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 m-0">
                                            {company.name}
                                        </h2>

                                        <div className="text-zinc-500 group-hover:text-zinc-800 transition duration-500 transform group-hover:scale-110">
                                            <i className="pi pi-arrow-right text-lg sm:text-xl md:text-2xl" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 text-sm sm:text-base md:text-lg italic">
                                No businesses found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyPage;
