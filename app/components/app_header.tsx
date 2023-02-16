export default function AppHeader({
  title,
  description,
  button,
}: {
  title: String;
  description?: String | undefined;
  button?: { title: string; onClick: any } | undefined;
}) {
  return (
    <div className="mb-8 border-b border-slate-900 px-4 py-5 sm:px-6">
      <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="ml-4">
          <h3 className="text-lg font-medium leading-6 text-gray-200">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="ml-4 mt-4 flex-shrink-0">
          {button && (
            <button
              type="button"
              onClick={button.onClick}
              className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {button.title}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
