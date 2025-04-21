import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";

const SECRET_KEY = "user_data_encryption"; // Replace with a secure key

const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (cipherText) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
        console.error("Decryption error:", error);
        return {}; // Return empty object if decryption fails
    }
};

const initialState = {
    isAuthenticated: false,
    token: "",
    userData: {},
};

export const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            const { token, userData } = action.payload;
            state.isAuthenticated = !!token;
            state.token = token;
            state.userData = encryptData(userData);
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.token = "";
            state.userData = {};
        },
    },
});

export const { login, logout } = AuthSlice.actions;
export default AuthSlice.reducer;

export const selectUserData = (state) => decryptData(state.auth.userData);