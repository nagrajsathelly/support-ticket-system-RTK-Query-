import TicketList from "./components/TicketList";

export default function App() {
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
        <TicketList />
      </div>
    </main>
  );
}