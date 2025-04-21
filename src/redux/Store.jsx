import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Default storage: localStorage
import { AuthSlice } from "./slice/AuthSlice";

// Redux Persist Config
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"],
};

// Combine reducers
const rootReducer = combineReducers({
    auth: AuthSlice.reducer,
});

// Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure Store
export const reduxstore = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Required for Redux Persist
        }),
});

// Create Persistor
export const persistor = persistStore(reduxstore);
