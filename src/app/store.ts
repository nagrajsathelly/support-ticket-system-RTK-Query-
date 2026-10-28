import { configureStore } from "@reduxjs/toolkit";
import { ticketsApi } from "../features/tickets/ticketsApi";

export const store = configureStore({
  reducer: {
    [ticketsApi.reducerPath]: ticketsApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ticketsApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;