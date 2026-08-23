// moonphase.js — lunar phase from pure date arithmetic (d37 §4): a known
// new-moon epoch plus the mean synodic month; no network. shadowPath builds
// the unlit-region path in moon-centred coordinates for the scene to clip
// against the disc.

const EPOCH = Date.UTC(2000, 0, 6, 18, 14, 0);
const SYNODIC = 29.530588853;

const NAMES = [
  'new',
  'waxing crescent',
  'first quarter',
  'waxing gibbous',
  'full',
  'waning gibbous',
  'last quarter',
  'waning crescent',
];

export function moonPhase(date) {
  const days = (date.getTime() - EPOCH) / 86400000;
  let age = (days % SYNODIC) / SYNODIC;
  if (age < 0) age += 1;
  const sector = Math.round(age * 8) % 8;
  const fraction = (1 - Math.cos(2 * Math.PI * age)) / 2;
  return { name: NAMES[sector], fraction, waxing: age < 0.5, age };
}

const fmt = (n) => String(Number(n.toFixed(2)));

export function shadowPath(age, r) {
  // near-new and near-full are degenerate: cover the disc, or draw nothing
  if (age <= 0.02 || age >= 0.98) {
    return `M 0,${-r} A ${fmt(r)},${fmt(r)} 0 1 0 0,${fmt(r)} A ${fmt(r)},${fmt(r)} 0 1 0 0,${-r} Z`;
  }
  if (Math.abs(age - 0.5) <= 0.02) return '';

  const rx = fmt(Math.abs(r * Math.cos(2 * Math.PI * age)));
  const waxing = age < 0.5;
  const crescent = waxing ? age < 0.25 : age > 0.75;
  // limb: the dark-side semicircle. terminator: the ellipse back up, bowed
  // toward the lit side when crescent (shadow swells) and into the shadow
  // when gibbous (shadow shrinks to a lune).
  const limbSweep = waxing ? 0 : 1;
  const termSweep = waxing === crescent ? 0 : 1;
  return (
    `M 0,${-r} ` +
    `A ${fmt(r)},${fmt(r)} 0 0 ${limbSweep} 0,${fmt(r)} ` +
    `A ${rx},${fmt(r)} 0 0 ${termSweep} 0,${-r} Z`
  );
}
