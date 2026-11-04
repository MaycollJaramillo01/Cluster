import { Resolver } from 'dns/promises';

function resolver() {
  const lookup = new Resolver();
  lookup.setServers(['1.1.1.1', '8.8.8.8']);
  return lookup;
}

export async function domainHasMail(domain: string) {
  try {
    const records = await resolver().resolveMx(domain);
    return records.some((record) => Boolean(record.exchange));
  } catch {
    return false;
  }
}

export async function domainHasAuth(domain: string) {
  const lookup = resolver();
  try {
    const txt = await lookup.resolveTxt(domain);
    if (txt.some((row) => row.join('').toLowerCase().includes('v=spf1'))) return true;
  } catch {
    // Sin SPF se revisa DMARC.
  }
  try {
    const dmarc = await lookup.resolveTxt(`_dmarc.${domain}`);
    return dmarc.some((row) => row.join('').toLowerCase().includes('v=dmarc1'));
  } catch {
    return false;
  }
}
