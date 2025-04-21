import React from "react";
import { classNames } from "primereact/utils";

const CompanyHeader = () => {
    return (
        <div className="layout-topbar company-header">
           
            {/* <Link to="/" className="layout-topbar-logo">
            <img
                src={`/layout/images/Accretelogo.jpg`}
                width="120px"
                height={"35px"}
                alt="company logo"
            />
        </Link> */}

               {/* <Link to="/" className="layout-topbar-logo"> */}
           {/* <div className="sidebar-header-image"> */}
                    <img  width="140px" src="/layout/images/billberrylogo.png" />
                {/* </div> */}
              {/* <img  src="/layout/images/billberrylogo.png" /> */}
          

            <div
              
                className={classNames("layout-topbar-menu")}
            >
                <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
                <button
                    type="button"
                    className="p-link layout-topbar-button"
                   
                >
                    <i className="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
        // <nav className="h-21 w-full bg-gray-300 border-b-5 border-gray-400 py-4 px-10 flex justify-between item-center">
        //     <img className="h-10" src="/layout/images/billberrylogo.png" />

        //     <button className="text-xl">Logout</button>
        // </nav>
    );
};

export default CompanyHeader;
