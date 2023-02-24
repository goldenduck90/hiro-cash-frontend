import { SHOW_ROADMAP } from "~/utils";

export default function Roadmap({ children }: { children: any }) {
  if (!SHOW_ROADMAP) return null;

  return (
    <div className="border-t-1 relative mt-4 -mb-6 border-slate-900 bg-slate-900 pt-4 pb-6">
      <div className="absolute inset-0 z-10 hidden bg-slate-800 bg-opacity-75 px-4 pt-3 text-right "></div>
      <h3 className="pt-4 pb-4 text-center font-medium leading-6 text-slate-200 text-gray-400">
        Soon
      </h3>
      {children}
    </div>
  );
}
