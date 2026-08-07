import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar({ toggleSidebar, sidebarOpen }) {
  return (
    <header className="bg-white shadow lg:hidden">
      <div className="px-4 mx-auto max-w-7xl">

        <nav className="flex items-center justify-between h-16" aria-label="Mobile navigation">

          {/* Hamburger menu — only rendered where a sidebar exists (mobile + tablet) */}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={sidebarOpen}
            className="p-2.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

        </nav>

      </div>
    </header>
  );
}
