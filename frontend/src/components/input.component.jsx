import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Key,
  AtSign,
  Globe,
  Link as LinkIcon
} from 'lucide-react';

const iconMap = {
  user: User,
  envelope: Mail,
  mail: Mail,
  at: AtSign,
  key: Key,
  lock: Key,
  globe: Globe,
  link: LinkIcon,
};

export default function InputBox({ name, type, id, value, placeholder, icon, disable = false, label, helperText }) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const LucideIcon = typeof icon === 'string' ? iconMap[icon.toLowerCase()] : icon;

  return (
    <div className='w-full mb-5'>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-muted-foreground block mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          name={name}
          type={type === 'password' ? (passwordVisible ? "text" : "password") : type}
          placeholder={placeholder}
          defaultValue={value}
          id={id}
          className={`input-box ${icon ? 'pl-11' : ''} ${type === 'password' ? 'pr-11' : ''}`}
          disabled={disable}
        />

        {LucideIcon ? (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
            {typeof LucideIcon === 'function' || typeof LucideIcon === 'object' ? (
              <LucideIcon className="w-4 h-4" />
            ) : null}
          </span>
        ) : icon ? (
          <i className={`fi fi-rr-${icon} input-icon`}></i>
        ) : null}

        {type === "password" && (
          <button
            type="button"
            onClick={() => setPasswordVisible((prev) => !prev)}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {helperText && (
        <p className="text-[11px] text-muted-foreground mt-1.5 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
