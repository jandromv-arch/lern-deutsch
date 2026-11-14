import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Accueil", icon: "🏠" },
  { to: "/review", label: "Révision", icon: "🔁" },
  { to: "/progress", label: "Progrès", icon: "📈" },
];

export function Layout() {
  return (
    <div className="mx-auto max-w-app min-h-full flex flex-col bg-amber-50">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t flex">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === "/"}
            className={({ isActive }) =>
              `flex-1 py-2 text-center text-xs ${isActive ? "text-accent font-bold" : "text-neutral-500"}`}>
            <div className="text-lg">{t.icon}</div>{t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
