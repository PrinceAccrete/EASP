import Login from "./pages/Login/Login";
import HomeLayout from "./pages/HomeLayout/HomeLayout";
import MainContent from "./pages/MainContent/MainContent";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import ProtectedRoute from "./components/RouteProtection/ProtectedRoute";
// import PublicRoute from "./components/RouteProtection/PublicRoute";
import "./App.css";
import { Navigate } from "react-router-dom";



function App() {

    return (
        <div>
            <BrowserRouter>
                <Routes>
                
                    <Route 
                    // element={<PublicRoute />}
                    >
                        <Route path="/login" element={<Login />} />
                    </Route>

                   
                    <Route 
                    // element={<ProtectedRoute />}
                    >
                   
                        <Route path="/" element={<HomeLayout />}>
                            <Route path="/" element={<MainContent />} />
                          
                        </Route>
                    </Route>

                    {/* Redirect unknown routes to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
