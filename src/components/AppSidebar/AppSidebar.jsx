import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppMenuitem from "../../../layout/AppMenuitem";
import { MenuProvider } from "../../../layout/context/menucontext";
import "./AppSidebar.scss";

const AppSidebar = () => {
    const [openMenu, setOpenMenu] = useState({});
    const model = [
        {
            label: "Home",
            items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
        },
     
        // {
        //     label: "Product",
        //     items: [
        //         {
        //             label: "Product Configuration",
        //             icon: "pi pi-fw pi-user",
        //             items: [
        //                 { label: 'Product List', icon: 'pi pi-fw pi-sign-in', to: '/product-list' },
        //                 { label: 'Product Subcategory', icon: 'pi pi-fw pi-times-circle', to: '/product-subcategory' },
        //                 { label: "Portion", icon: "pi pi-fw pi-lock", to: "/product-portion" },
        //                 { label: 'Modifier', icon: 'pi pi-fw pi-pen-to-square', to: '/modifier' },
        //                 { label: 'Modifier List',  icon: 'pi pi-fw pi-sign-in', to: '/modifier-list' },
        //                 { label: 'Modifier Category',  icon: 'pi pi-pw pi-clone', to: '/modifier-category' },
        //                 { label: 'Modifier Cateogry List',  icon: 'pi pi-fw pi-list', to: '/modifier-category-list' },
        //                 { label: "Brand Master", icon: "pi pi-fw pi-lock", to: "/product-brand" },
        //                 { label: "Table Master", icon: "pi pi-fw pi-sign-in", to: "/product-table" },
        //                 { label: "Delivery Charge Master", icon: "pi pi-fw pi-sign-in", to: "/deliveryChargeMaster" },
        //                 { label: 'Product Category', icon: 'pi pi-fw pi-sign-in', to: '/product-category' },
        //                 { label: 'Product Modifiers Mapping', icon: 'pi pi-fw pi-sign-in', to: '/product-modifiers-mapping' },
        //                 { label: 'Charge Master', icon: 'pi pi-fw pi-sign-in', to: '/charge-master' },
        //                 { label: 'POS Master', icon: 'pi pi-fw pi-list', to: '/pos-master' },
        //                 { label: 'channel Master', icon: 'pi pi-fw pi-list', to: '/channel-master' },
        //                 { label: 'tags Master', icon: 'pi pi-fw pi-list', to: '/tags-master' },
        //                 { label: 'Online Menu List', icon: 'pi pi-fw pi-list', to: '/online-menu-list' },
        //                 { label: 'Stock Control(Item)', icon: 'pi pi-fw pi-lock', to: '/stockcontrol-item' },
        //                 { label: 'Stock Control(Modifier)', icon: 'pi pi-fw pi-lock', to: '/stockcontrol-modifier' },
        //                 { label: 'Product Import', icon: 'pi pi-fw pi-lock', to: '/product-import' },
        //                 { label: 'Scheduler', icon: 'pi pi-fw pi-list', to: '/scheduler' },
                       
        //             ]
        //         },
        //         {
        //             label: "Store Configuration", icon: "pi pi-fw pi-pencil", items: [
        //                 { label: 'Web Store Master', icon: 'pi pi-fw pi-sign-in', to: '/web-store' },
        //                 { label: 'Web Store List', icon: 'pi pi-fw pi-sign-in', to: '/web-store-list' },
                        
        //             ]
        //         },
        //         // { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/pages/timeline' },
        //     ],
        // },
    ];

    // Function to toggle a menu's open/close state
    const toggleMenu = (label) => {
        setOpenMenu((prevState) => ({
            ...prevState,
            [label]: !prevState[label],
        }));
    };

    // Recursive function to render menu items
    const renderMenuItems = (items) => {
        return items.map((item) => {
            const hasSubItems = item.items && item.items.length > 0;
            return (
                <div key={item.label}>
                    {/* If the item has subitems, render the toggle logic */}
                    <div
                        className={`sidebar-item ${hasSubItems ? "sidebar-item-has-children" : ""}`}
                        onClick={hasSubItems ? () => toggleMenu(item.label) : undefined}
                    >
                        <span className="sidebar-icon">
                            <i className={item.icon}></i>
                        </span>
                        <span className="sidebar-label">
                            {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
                        </span>
                        {hasSubItems && (
                            <span className="sidebar-toggle-icon">
                                <i
                                    className={`pi ${
                                        openMenu[item.label] ? "pi-chevron-up" : "pi-chevron-down"
                                    }`}
                                ></i>
                            </span>
                        )}
                    </div>

                    {/* If the item has subitems, render them recursively */}
                    {hasSubItems && openMenu[item.label] && (
                        <div className="sidebar-submenu">{renderMenuItems(item.items)}</div>
                    )}
                </div>
            );
        });
    };

    return (
        <MenuProvider>
            <div className="sidebar">
                <div  className="sidebar-header-image">
                    <img src="/layout/images/EASPLogo.png" />
                    
                </div>
                <ul className="layout-menu">
                    {model.map((item, i) => {
                        return !item?.seperator ? (
                            <AppMenuitem item={item} root={true} index={i} key={item.label} />
                        ) : (
                            <li className="menu-separator"></li>
                        );
                    })}
                </ul>
                {/* <ul className="layout-menu">
                    {model.map((section, index) => (
                        <div key={index} className="sidebar-section">
                            <h3 className="sidebar-section-title">{section.label}</h3>
                            <div className="sidebar-items">
                                {renderMenuItems(section.items)}
                            </div>
                        </div>
                    ))}
                </ul> */}
            </div>
        </MenuProvider>
    );
};

export default AppSidebar;
