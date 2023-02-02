import { Content } from "../header";

export default function TosPage() {
  return (
    <main className="-mt-24 h-screen pb-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Main 3 column grid */}
        <div className="grid  grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          {/* Left column */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            <section>
              <div className="overflow-hidden rounded-lg bg-slate-800 p-6 text-white shadow">
                <h1>Terms Of Services</h1>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
