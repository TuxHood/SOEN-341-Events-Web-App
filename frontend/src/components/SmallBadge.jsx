export function SmallBadge({ children, tone = "gray" }) {
const tones = {
gray: "bg-gray-100 text-gray-700",
green: "bg-green-100 text-green-700",
blue: "bg-blue-100 text-blue-700",
};
return (
<span className={`text-[11px] px-2 py-0.5 rounded-md ${tones[tone]}`}>{children}</span>
);
}