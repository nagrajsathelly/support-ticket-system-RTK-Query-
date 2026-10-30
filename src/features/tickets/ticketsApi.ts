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

export interface TicketComment {
  id: string;
  ticketId: string;
  author: string;
  message: string;
  createdAt: string;
}

export type NewComment = Omit<TicketComment, "id">;

export type NewTicket = Omit<Ticket, "id">;

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/",
  }),
  tagTypes: ["Ticket", "Comment"],
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
      providesTags: (result) =>
        result
          ? [
              ...result.tickets.map(({ id }) => ({
                type: "Ticket" as const,
                id,
              })),
              { type: "Ticket" as const, id: "LIST" },
            ]
          : [{ type: "Ticket" as const, id: "LIST" }],
    }),
    createTicket: builder.mutation<Ticket, NewTicket>({
      query: (newTicket) => ({
        url: "tickets",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: [{ type: "Ticket", id: "LIST" }],
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
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
      async onQueryStarted({ id, ...changes }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          ticketsApi.util.updateQueryData("getTicketById", id, (draft) => {
            Object.assign(draft, changes);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    deleteTicket: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),
    getTicketById: builder.query<Ticket, string>({
      query: (id) => `tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Ticket", id }],
    }),
    getComments: builder.query<TicketComment[], string>({
      query: (ticketId) => ({
        url: "comments",
        params: { ticketId },
      }),
      providesTags: (result, _error, ticketId) => [
        ...(result ?? []).map(({ id }) => ({
          type: "Comment" as const,
          id,
        })),
        { type: "Comment", id: `LIST-${ticketId}` },
      ],
    }),
    addComment: builder.mutation<TicketComment, NewComment>({
      query: (comment) => ({
        url: "comments",
        method: "POST",
        body: comment,
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: "Comment", id: `LIST-${ticketId}` },
      ],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useGetTicketByIdQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
} = ticketsApi;
