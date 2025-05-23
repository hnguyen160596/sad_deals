import type React from 'react';
import { useState } from 'react';

export interface DropdownItem {
  label: string;
  href: string;
  iconUrl?: string;
}

export interface DropdownProps {
  label: string;
  items: DropdownItem[];
}

const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="text-primary font-semibold">{label}</button>
      {open && (
        <div className="absolute top-full left-0 bg-white shadow-lg p-4 w-64 z-50">
          <ul>
            {items.map((item) => (
              <li key={item.href} className="py-1 flex items-center space-x-2">
                {item.iconUrl && <img src={item.iconUrl} alt={item.label} loading="lazy" decoding="async" className="w-4 h-4" />}
                <a href={item.href} className="text-sm text-gray-700 hover:text-primary">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
