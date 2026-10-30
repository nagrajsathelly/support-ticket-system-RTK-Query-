import { useState } from "react";
import { Link } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  type NewTicket,
  type Ticket,
  type TicketFilters,
} from "../features/tickets/ticketsApi";

const emptyForm: NewTicket = {
  title: "",
  description: "",
  customer: "",
  priority: "Medium",
  status: "Open",
  createdAt: "",
};

const initialFilters: TicketFilters = {
  search: "",
  status: "All",
  priority: "All",
  page: 1,
  limit: 3,
};

export default function TicketList() {
  const [filters, setFilters] = useState<TicketFilters>(initialFilters);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetTicketsQuery(filters, {
      pollingInterval: 30000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();
  const [form, setForm] = useState<NewTicket>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const tickets = data?.tickets ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / filters.limit));
  const isSaving = isCreating || isUpdating;

  function handleFormChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateFilters(changes: Partial<TicketFilters>) {
    setFilters((current) => ({ ...current, ...changes, page: 1 }));
  }

  function startEdit(ticket: Ticket) {
    const { id, ...ticketData } = ticket;
    setForm(ticketData);
    setEditingId(id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingId) {
        await updateTicket({ id: editingId, ...form }).unwrap();
      } else {
        await createTicket({
          ...form,
          createdAt: new Date().toISOString(),
        }).unwrap();
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch {
      alert("Unable to save ticket. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await deleteTicket(id).unwrap();
    } catch {
      alert("Unable to delete ticket. Please try again.");
    }
  }

  if (isLoading) return <p>Loading tickets...</p>;
  if (isError)
    return <p>Unable to load tickets. Check whether JSON Server is running.</p>;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-600">SUPPORT CENTER</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Customer Support Tickets
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage customer issues in one place.
          </p>
        </header>
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border bg-white p-5"
          >
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Ticket" : "Create Ticket"}
            </h2>
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Ticket title"
              required
              className="w-full rounded-lg border p-3"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Ticket description"
              required
              rows={3}
              className="w-full rounded-lg border p-3"
            />
            <input
              name="customer"
              value={form.customer}
              onChange={handleFormChange}
              placeholder="Customer name"
              required
              className="w-full rounded-lg border p-3"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                name="priority"
                value={form.priority}
                onChange={handleFormChange}
                className="rounded-lg border p-3"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="rounded-lg border p-3"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                    ? "Update Ticket"
                    : "Create Ticket"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setEditingId(null);
                  }}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">
              All Tickets ({data?.total ?? 0})
            </h2>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                value={filters.search}
                onChange={(event) =>
                  updateFilters({ search: event.target.value })
                }
                placeholder="Search tickets..."
                className="rounded-lg border bg-white p-3"
              />
              <select
                value={filters.status}
                onChange={(event) =>
                  updateFilters({
                    status: event.target.value as TicketFilters["status"],
                  })
                }
                className="rounded-lg border bg-white p-3"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                value={filters.priority}
                onChange={(event) =>
                  updateFilters({
                    priority: event.target.value as TicketFilters["priority"],
                  })
                }
                className="rounded-lg border bg-white p-3"
              >
                <option value="All">All priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {isFetching && (
              <p className="text-sm text-gray-500">Updating results...</p>
            )}
            {tickets.length === 0 && (
              <p className="rounded-lg border bg-white p-4 text-gray-500">
                No matching tickets found.
              </p>
            )}

            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{ticket.title}</h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {ticket.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>Customer: {ticket.customer}</span>
                  <span>Priority: {ticket.priority}</span>
                  <span>Ticket #{ticket.id}</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => startEdit(ticket)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    disabled={isDeleting}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}

            <div className="flex items-center justify-between gap-3">
              <button
                disabled={filters.page === 1 || isFetching}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {filters.page} of {totalPages}
              </span>
              <button
                disabled={filters.page >= totalPages || isFetching}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
