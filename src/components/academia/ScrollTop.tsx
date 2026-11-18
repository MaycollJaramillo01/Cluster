'use client';

import { useEffect } from 'react';

let lastPath = '';

// Posición al cambiar de clase: desde la hoja del temario (celular) Next deja la página donde estaba.
// Otra clase: arriba. Misma clase con el resultado de la misión: la misión a la vista.
export function ScrollTop() {
  useEffect(() => {
    const path = window.location.pathname;
    if (lastPath && lastPath !== path) window.scrollTo(0, 0);
    else if (lastPath && new URLSearchParams(window.location.search).has('mision')) {
      document.getElementById('mision')?.scrollIntoView({ block: 'start' });
    }
    lastPath = path;
  }, []);
  return null;
}
