'use client';

import Honduras from '@react-map/honduras';

// Departamentos donde Ruta Local ya ejecutó producciones.
// (Santa Rosa → Copán · San Juan → Intibucá · San Marcos → Ocotepeque)
const activeDepts = ['Copán', 'Intibucá', 'Ocotepeque'];
const accent = '#02C39A';

const cityColors = Object.fromEntries(
  activeDepts.map((d) => [d, accent])
) as Record<string, string>;

export function HondurasMap() {
  return (
    <div className="[&_svg]:!h-auto [&_svg]:!w-full [&_svg]:max-w-full">
      <Honduras
        type="select-multiple"
        size={560}
        mapColor="#262626"
        strokeColor="rgba(249,249,249,0.22)"
        strokeWidth={0.8}
        hoverColor="rgba(2,195,154,0.55)"
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
