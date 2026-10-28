import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customer: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
}

export type TicketFilters = {
  search: string;
  status: Ticket["status"] | "All";
  priority: Ticket["priority"] | "All";
  page: number;
  limit: number;
};

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
}

export type NewTicket = Omit<Ticket, "id">;

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/",
  }),
  tagTypes: ["Ticket"],
  endpoints: (builder) => ({
    getTickets: builder.query<TicketsResponse, TicketFilters>({
      query: ({ search, status, priority, page, limit }) => ({
        url: "tickets",
        params: {
          ...(search.trim() ? { q: search.trim() } : {}),
          ...(status !== "All" ? { status } : {}),
          ...(priority !== "All" ? { priority } : {}),
          _page: page,
          _limit: limit,
        },
      }),
      transformResponse: (response: Ticket[], meta) => ({
        tickets: response,
        total: Number(meta?.response?.headers.get("X-Total-Count") ?? 0),
      }),
      providesTags: ["Ticket"],
    }),
    createTicket: builder.mutation<Ticket, NewTicket>({
      query: (newTicket) => ({
        url: "tickets",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: ["Ticket"],
    }),
    updateTicket: builder.mutation<
      Ticket,
      Partial<Ticket> & Pick<Ticket, "id">
    >({
      query: ({ id, ...changes }) => ({
        url: `tickets/${id}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: ["Ticket"],
    }),
    deleteTicket: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ticket"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
} = ticketsApi;
