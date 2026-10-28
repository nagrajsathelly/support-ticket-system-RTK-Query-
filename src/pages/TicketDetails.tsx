
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useGetTicketByIdQuery,
  useGetCommentsQuery,
  useAddCommentMutation
} from "../features/tickets/ticketsApi";

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");

  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError
  } = useGetTicketByIdQuery(id ?? "", { skip: !id });

  const {
    data: comments,
    isLoading: areCommentsLoading,
    isError: areCommentsError
  } = useGetCommentsQuery(id ?? "", { skip: !id });

  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !message.trim()) return;

    try {
      await addComment({
        ticketId: id,
        author: "Support Agent",
        message: message.trim(),
        createdAt: new Date().toISOString()
      }).unwrap();

      setMessage("");
    } catch {
      alert("Unable to add reply. Please try again.");
    }
  }

  if (isTicketLoading) return <main className="p-8">Loading ticket...</main>;
  if (isTicketError || !ticket) {
    return (
      <main className="p-8">
        <p>Unable to load ticket. It may not exist.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600">Back to tickets</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to tickets
        </Link>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Ticket #{ticket.id}</p>
              <h1 className="mt-1 text-2xl font-bold">{ticket.title}</h1>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              {ticket.status}
            </span>
          </div>

          <p className="mt-4 text-gray-700">{ticket.description}</p>

          <div className="mt-5 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
            <p><span className="text-gray-500">Customer:</span> {ticket.customer}</p>
            <p><span className="text-gray-500">Priority:</span> {ticket.priority}</p>
            <p>
              <span className="text-gray-500">Created:</span>{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Conversation</h2>

          {areCommentsLoading && <p>Loading conversation...</p>}
          {areCommentsError && (
            <p className="text-red-600">Unable to load conversation.</p>
          )}

          {!areCommentsLoading && !areCommentsError && comments?.length === 0 && (
            <p className="text-gray-500">No replies yet. Start the conversation below.</p>
          )}

          {comments?.map((comment) => (
            <article key={comment.id} className="rounded-lg bg-gray-50 p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-medium">{comment.author}</h3>
                <time className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {comment.message}
              </p>
            </article>
          ))}

          <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
            <label htmlFor="reply" className="block font-medium">Add a reply</label>
            <textarea
              id="reply"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your reply..."
              rows={4}
              required
              className="w-full rounded-lg border p-3"
            />
            <button
              type="submit"
              disabled={isAddingComment || !message.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {isAddingComment ? "Sending..." : "Send Reply"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
