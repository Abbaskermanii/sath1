import { NavLink } from "react-router-dom";
import useCategories from "../../hooks/useCategories";

export default function Menue() {
  const { categories, loading } = useCategories(10);

  const baseClass = "shrink-0 whitespace-nowrap border-b-2 pb-1 transition";
  const inactiveClass = "border-transparent text-white hover:text-gray-300";
  const activeClass = "border-red-500 text-red-400";

  return (
    <div className="bg-neutral-800" dir="rtl">
      <ul className="max-w-7xl mx-auto flex gap-6 text-sm font-md py-4 overflow-x-auto px-4">
        <li className="shrink-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            خانه
          </NavLink>
        </li>

        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((item) => (
              <li
                key={item}
                className="h-4 w-16 shrink-0 animate-pulse rounded bg-neutral-600"
              />
            ))}
          </>
        ) : (
          categories.map((category) => (
            <li key={category.id || category.slug} className="shrink-0">
              <NavLink
                to={`/category/${category.slug}`}
                className={({ isActive }) =>
                  `${baseClass} ${isActive ? activeClass : inactiveClass}`
                }
              >
                {category.title}
              </NavLink>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
