'use client';

import Honduras from '@react-map/honduras';

// Departamentos donde Ruta Local ya ejecutó producciones.
// (Santa Rosa → Copán · San Juan → Intibucá · San Marcos → Ocotepeque)
const activeDepts = ['Copán', 'Intibucá', 'Ocotepeque'];
// Cian Marca País Honduras
const accent = '#2EB8E0';

const cityColors = Object.fromEntries(
  activeDepts.map((d) => [d, accent])
) as Record<string, string>;

export function HondurasMap() {
  return (
    <div className="[&_svg]:!h-auto [&_svg]:!w-full [&_svg]:max-w-full">
      <Honduras
        type="select-multiple"
        size={560}
        mapColor="#16182a"
        strokeColor="rgba(170,210,245,0.28)"
        strokeWidth={0.8}
        hoverColor="rgba(196,30,138,0.45)"
        selectColor={accent}
        cityColors={cityColors}
        disableClick
        hints
        hintTextColor="#f9f9f9"
        hintBackgroundColor="#080808"
        hintPadding="6px 10px"
        hintBorderRadius={0}
      />
    </div>
  );
}
