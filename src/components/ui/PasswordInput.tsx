'use client';

import { useState, type InputHTMLAttributes } from 'react';

// Contraseña con "Mostrar": para revisar lo escrito antes de enviar, sobre todo en el celular.
export function PasswordInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={shown ? 'text' : 'password'} className={`${className} pr-24`} />
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        aria-pressed={shown}
        aria-controls={props.id}
        className="absolute inset-y-1 right-1 px-3 text-sm text-black/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
      >
        {shown ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
