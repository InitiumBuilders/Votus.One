import { createClient, type VercelKV } from "@vercel/kv";

const PREFIX = "votus:";

let _kv: VercelKV | null = null;

function getKV(): VercelKV {
  if (!_kv) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN must be set");
    _kv = createClient({ url: url.trim(), token: token.trim() });
  }
  return _kv;
}

const kv = new Proxy({} as VercelKV, {
  get(_target, prop) {
    const client = getKV();
    const val = client[prop as keyof VercelKV];
    if (typeof val === "function") return val.bind(client);
    return val;
  },
});

export const keys = {
  // Launch
  launchVotes: `${PREFIX}launch:total_days`,
  launchVoter: (id: string) => `${PREFIX}launch:voter:${id}`,
  launchVoterCount: `${PREFIX}launch:voter_count`,
  // Subscribers
  subscriberEmails: `${PREFIX}subscribers:emails`,
  subscriberCount: `${PREFIX}subscribers:count`,
  // Units
  unitsList: `${PREFIX}units:list`,
  unitsCount: `${PREFIX}units:count`,
  unit: (id: string) => `${PREFIX}units:${id}`,
  unitBySlug: (slug: string) => `${PREFIX}units:slug:${slug}`,
  unitViews: (id: string) => `${PREFIX}units:views:${id}`,
  unitMembers: (id: string) => `${PREFIX}units:members:${id}`,
  // Users / Auth
  userByEmail: (email: string) => `${PREFIX}users:email:${email.toLowerCase()}`,
  userById: (id: string) => `${PREFIX}users:id:${id}`,
  usersList: `${PREFIX}users:list`,
  session: (token: string) => `${PREFIX}sessions:${token}`,
  // Media
  media: (id: string) => `${PREFIX}media:${id}`,
  // Visitors
  visitorSet: `${PREFIX}visitors:all`,
  visitorLive: `${PREFIX}visitors:live`,
  visitorDaily: (date: string) => `${PREFIX}visitors:daily:${date}`,
  visitorTotal: `${PREFIX}visitors:total`,
  // Config
  launchDate: `${PREFIX}config:launch_date`,
  siteAnnouncement: `${PREFIX}config:announcement`,
};

export default kv;
