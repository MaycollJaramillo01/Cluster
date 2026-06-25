import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { plans, whatsappLink } from '@/lib/site';

// Each tier: dark gradient panel behind the white logo + accent color for values
const tierMark = [
  {
    // Next — steel / charcoal
    logoBg: 'linear-gradient(150deg, #18181b 0%, #3f3f46 60%, #52525b 100%)',
    glow: 'radial-gradient(ellipse at 50% 110%, rgba(161,161,170,0.35) 0%, transparent 65%)',
    topBar: 'linear-gradient(90deg, #3f3f46, #a1a1aa, #d4d4d8, #a1a1aa, #3f3f46)',
    accent: '#71717a',
    colBg: 'transparent',
    colBgAlt: 'rgba(0,0,0,0.028)',
  },
  {
    // Advance — deep gold
    logoBg: 'linear-gradient(150deg, #3b1c0a 0%, #78350f 45%, #b45309 100%)',
    glow: 'radial-gradient(ellipse at 50% 110%, rgba(245,158,11,0.5) 0%, transparent 65%)',
    topBar: 'linear-gradient(90deg, #78350f, #d97706, #fde68a, #d97706, #78350f)',
    accent: '#b45309',
    colBg: 'rgba(245,158,11,0.035)',
    colBgAlt: 'rgba(245,158,11,0.065)',
  },
  {
    // Enterprise — cobalt blue
    logoBg: 'linear-gradient(150deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    glow: 'radial-gradient(ellipse at 50% 110%, rgba(59,130,246,0.4) 0%, transparent 65%)',
    topBar: 'linear-gradient(90deg, #1e3a8a, #3b82f6, #93c5fd, #3b82f6, #1e3a8a)',
    accent: '#2563eb',
    colBg: 'transparent',
    colBgAlt: 'rgba(0,0,0,0.028)',
  },
  {
    // Cluster — holographic violet
    logoBg: 'linear-gradient(150deg, #1e1b4b 0%, #4c1d95 40%, #7c3aed 75%, #a21caf 100%)',
    glow: 'radial-gradient(ellipse at 50% 110%, rgba(139,92,246,0.45) 0%, transparent 65%)',
    topBar: 'linear-gradient(90deg, #dc2626, #f97316, #eab308, #22c55e, #06b6d4, #8b5cf6, #ec4899)',
    accent: '#7c3aed',
    colBg: 'transparent',
    colBgAlt: 'rgba(0,0,0,0.028)',
  },
] as const;

type FVal = string | boolean;

const features: { label: string; values: FVal[] }[] = [
  { label: 'Redes sociales', values: ['2', '3', '4', '4'] },
  { label: 'Piezas de contenido', values: ['12/mes', '20/mes', '20/mes', '24/mes'] },
  { label: 'Stories mensuales', values: [false, '12', '16', '20'] },
  { label: 'Meta Ads', values: ['1 campaña', '3 campañas', '3 campañas', '5 campañas'] },
  { label: 'Google Ads', values: ['1 campaña', '1 campaña', '3 campañas', '3 campañas'] },
  { label: 'Perfil Google Business', values: [false, true, true, true] },
  { label: 'Actualización de website', values: [false, false, true, true] },
  { label: 'Asesoría de marketing', values: [false, true, true, true] },
  { label: 'SEO', values: [false, false, false, true] },
];

const BORDER = '1px solid rgba(0,0,0,0.1)';

// Dark gradient panel with the white logo — CSS creates the tier color variant
function LogoPanel({ tier }: { tier: typeof tierMark[number] }) {
  return (
    <div style={{
      width: '100%',
      background: tier.logoBg,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '22px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* soft glow from below */}
      <div style={{ position: 'absolute', inset: 0, background: tier.glow }} />
      <Image
        src="/assets/logo-white.webp"
        alt="Cluster Media"
        width={200}
        height={200}
        style={{ position: 'relative', zIndex: 1, height: 60, width: 'auto' }}
      />
    </div>
  );
}

function CellVal({ val, tier }: { val: FVal; tier: typeof tierMark[number] }) {
  if (val === true) {
    return (
      <span style={{ display: 'flex', justifyContent: 'center' }}>
        <Icon name="check" size={15} strokeWidth={2.5} style={{ color: tier.accent }} />
      </span>
    );
  }
  if (val === false) {
    return (
      <span style={{ display: 'block', textAlign: 'center', color: 'rgba(0,0,0,0.18)', fontSize: 18, lineHeight: 1 }}>
        —
      </span>
    );
  }
  return (
    <span style={{
      display: 'block',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: tier.accent,
    }}>
      {val}
    </span>
  );
}

export function PricingPlans() {
  return (
    <div className="mt-14">
      <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mono-label text-accent">Planes mensuales</span>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase text-fg sm:text-5xl">
            Elige tu nivel
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          Sin contratos eternos. Advance es el punto más balanceado para marcas en crecimiento.
        </p>
      </Reveal>

      <Reveal>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {/* Label column */}
                <th style={{
                  border: BORDER,
                  background: 'transparent',
                  width: 200,
                  padding: '20px 24px',
                  textAlign: 'left',
                  verticalAlign: 'bottom',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.22em',
                    color: 'rgba(17,17,17,0.3)',
                    fontWeight: 500,
                  }}>
                    Característica
                  </span>
                </th>

                {plans.map((plan, i) => {
                  const tier = tierMark[i];
                  const isHL = !!plan.highlight;
                  return (
                    <th
                      key={plan.name}
                      style={{
                        border: BORDER,
                        background: tier.colBg,
                        position: 'relative',
                        padding: 0,
                        verticalAlign: 'top',
                      }}
                    >
                      {/* Gradient top bar */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: tier.topBar }} />

                      {/* Logo panel */}
                      <LogoPanel tier={tier} />

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16,
                        padding: '20px 16px 26px',
                      }}>
                        {plan.badge && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 8,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            padding: '4px 10px',
                            color: tier.accent,
                            background: `${tier.accent}14`,
                            border: `1px solid ${tier.accent}38`,
                          }}>
                            {plan.badge}
                          </span>
                        )}

                        {/* Plan name */}
                        <p style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 26,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#111111',
                          textAlign: 'center',
                          margin: 0,
                          letterSpacing: '0.04em',
                        }}>
                          {plan.name}
                        </p>

                        {/* Price */}
                        <div style={{ textAlign: 'center', lineHeight: 1 }}>
                          <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: tier.accent,
                            marginBottom: 8,
                          }}>
                            USD
                          </p>
                          <p style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 42,
                            fontWeight: 700,
                            lineHeight: 1,
                            color: '#111111',
                            margin: 0,
                          }}>
                            {plan.price.split(' ')[1]}
                          </p>
                          <p style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            color: 'rgba(17,17,17,0.38)',
                            marginTop: 8,
                          }}>
                            /mes
                          </p>
                        </div>

                        <Button
                          href={whatsappLink(plan.whatsapp)}
                          external
                          variant={isHL ? 'accent' : 'primary'}
                          size="sm"
                          className="w-full"
                        >
                          {plan.cta}
                        </Button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {features.map((row, ri) => {
                const isOdd = ri % 2 === 1;
                return (
                  <tr key={row.label}>
                    <td style={{
                      border: BORDER,
                      background: isOdd ? 'rgba(0,0,0,0.028)' : 'transparent',
                      padding: '13px 24px',
                      fontSize: 13,
                      color: 'rgba(17,17,17,0.58)',
                    }}>
                      {row.label}
                    </td>
                    {row.values.map((val, ci) => {
                      const tier = tierMark[ci];
                      return (
                        <td key={ci} style={{
                          border: BORDER,
                          background: isOdd ? tier.colBgAlt : tier.colBg,
                          padding: '13px 10px',
                          textAlign: 'center',
                        }}>
                          <CellVal val={val} tier={tier} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Bottom CTA row */}
              <tr>
                <td style={{ border: BORDER, background: 'transparent', padding: '20px 24px' }}>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'rgba(17,17,17,0.3)',
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    Sin contratos.<br />Cancela cuando quieras.
                  </p>
                </td>
                {plans.map((plan, i) => {
                  const isHL = !!plan.highlight;
                  return (
                    <td key={plan.name} style={{ border: BORDER, background: 'transparent', padding: '20px 16px', textAlign: 'center' }}>
                      <Button
                        href={whatsappLink(plan.whatsapp)}
                        external
                        variant={isHL ? 'accent' : 'secondary'}
                        size="sm"
                        className="w-full"
                      >
                        Elegir {plan.name}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
