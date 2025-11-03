import { NavLink } from "react-router-dom";


const tabs = [
{ to: "/student/discover", label: "Discover" },
{ to: "/student/myevents", label: "My Events" },
{ to: "/student/tickets", label: "My Tickets" },
{ to: "/student/calendar", label: "Calendar" },
{ to: "/student/profile", label: "Profile" },
];


export default function TopTabs() {
return (
<div className="w-full border-b bg-white sticky top-0 z-20">
<div className="max-w-6xl mx-auto px-4">
<div className="flex items-center gap-6 h-14">
<div className="font-semibold">Student Dashboard</div>
<nav className="flex gap-4 text-sm">
{tabs.map((t) => (
<NavLink
key={t.to}
to={t.to}
className={({ isActive }) =>
`px-2 py-1 rounded-md hover:bg-gray-100 ${isActive ? "bg-gray-900 text-white" : "text-gray-700"}`
}
>
{t.label}
</NavLink>
))}
</nav>
</div>
</div>
</div>
);
}