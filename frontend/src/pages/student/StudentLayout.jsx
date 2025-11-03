import { Outlet, NavLink } from "react-router-dom";
import TopTabs from "../../components/TopTabs";


export default function StudentLayout() {
return (
<div className="min-h-screen bg-gray-50">
<TopTabs />
<main className="max-w-6xl mx-auto px-4 py-6">
<Outlet />
</main>
<footer className="text-xs text-gray-400 text-center py-6">UI/UX only • reads existing APIs</footer>
</div>
);
}