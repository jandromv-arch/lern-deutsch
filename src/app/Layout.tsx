import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Accueil", icon: "🏠" },
  { to: "/review", label: "Révision", icon: "🔁" },
  { to: "/progress", label: "Progrès", icon: "📈" },
];

export function Layout() {
  return (
    <div className="mx-auto max-w-app min-h-full flex flex-col bg-amber-50 dark:bg-neutral-900">
      <main className="safe-top flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      <nav className="safe-bottom fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white dark:bg-neutral-800 border-t dark:border-neutral-700 flex">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === "/"}
            className={({ isActive }) =>
              `flex-1 py-2 text-center text-xs ${isActive ? "text-accent font-bold" : "text-neutral-500 dark:text-neutral-400"}`}>
            <div className="text-lg">{t.icon}</div>{t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
