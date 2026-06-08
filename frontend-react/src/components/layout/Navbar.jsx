export default function Navbar() {
  const menuItems = [
    "مصاحبه",
    "یادداشت",
    "خبر",
    "تحلیل",
    "گفتگوهای شاخص",
    "گزارش",
    "نمودار",
  ];

  return (
    <div className="bg-black h-12" dir="rtl">
      <div className="max-w-7xl mx-auto pt-3 flex">
        <ul className="flex text-amber-50 text-xs font-semibold divide-x divide-gray-600">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`px-5 cursor-pointer hover:text-white ${
                item === "گفتگوهای شاخص" ? "text-yellow-400" : ""
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
