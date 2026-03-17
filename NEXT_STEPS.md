# Next Steps — The Evolution of Votus.One

> *"Strategy is not a top-down plan; it emerges from relationship, adaptation,  
> and trust in the process of change."*  
> — adrienne maree brown

This document maps the highest-leverage moves for Votus.One.  
Not a roadmap — a living compass. These are the pressure points  
where a small push creates a large shift.

---

## Phase 1 — Foundation (Now → 30 Days)

The ground we stand on.

### 1. First 10 Votus Units

**Leverage: ★★★★★**

Everything begins here. Not features. Not code. People.

Find 10 teams in 10 neighborhoods who want to try something.  
A block club. A school board parent group. A mutual aid circle.  
A group of friends who care about the same park.

Each one that forms proves the thesis.  
Each one that sticks proves the model.

> *The large is a reflection of the small.*

**What this unlocks:**
- Real user feedback on unit creation flow
- Real meeting schedules to test the meeting feature
- Real community dynamics to design around
- Stories to tell. Stories are the product.

**Action:**
- [ ] August hosts 3 "Start a Vibe" sessions (Discord, in person, hybrid)
- [ ] Create a "First 10" badge for founding units
- [ ] Document every unit's first meeting in a blog or video

---

### 2. Invite + Join Flow for Units

**Leverage: ★★★★★**

Right now a unit has one founder. Democracy needs more voices.

**Build:**
- [ ] `/u/semble/join` — public join link for any unit
- [ ] Invite code system — founders generate private invite codes
- [ ] Member roles: Founder, Core Member, Supporter
- [ ] Member count updates when people join
- [ ] Email notification to founder when someone joins

**Why it's high-leverage:**  
One person can register a unit. The join flow turns one person into five.  
Five is enough. One hundred is powerful.

---

### 3. On-Site Voting (Pre-Chain)

**Leverage: ★★★★☆**

Before we go on-chain, we need voting that works today.

**Build:**
- [ ] `/u/semble/proposals` — create and vote on proposals
- [ ] Simple up/down votes with logged-in accounts
- [ ] Proposal lifecycle: Draft → Active → Decided → Archived
- [ ] Results visible publicly. Transparency from day one.
- [ ] "Everyone writes before anyone speaks" — proposal must include written rationale

**Design principle:**  
Make it feel like a decision, not a survey.  
The UI should carry the weight of what it means to cast a vote.

---

## Phase 2 — Momentum (30 → 90 Days)

The flywheel starts turning.

### 4. Votus Vibes — Team Identity

**Leverage: ★★★★★**

A Votus Unit is a structure. A **Vibe** is its soul.

**Build:**
- [ ] Unit profile customization: colors, banner, tagline
- [ ] "Our Story" — rich text section for the unit's origin story
- [ ] Photo gallery from meetings and events
- [ ] Milestone badges: First Vote, First Meeting, 10 Members, 50 Decisions

**Why it matters:**  
Identity creates belonging. Belonging creates commitment.  
Commitment creates the unit that shows up when it's hard.

---

### 5. Meeting Integration — Calendar + Notes

**Leverage: ★★★★☆**

Meetings are where democracy actually happens.  
Right now we store meeting info as text. That's a start.  
Next: make meetings first-class citizens.

**Build:**
- [ ] Meeting calendar with iCal export
- [ ] Meeting notes (markdown, collaborative)
- [ ] Attendance tracking (who showed up)
- [ ] Auto-generate "Meeting Summary" — decisions made, votes cast
- [ ] Discord integration: auto-post meeting reminder 1 hour before

**Flywheel it feeds:**  
Meetings → Decisions → Track Record → Trust → New Members → Meetings

---

### 6. Motus — The Recognition Layer

**Leverage: ★★★★★**

$Motus starts as gratitude. Not a token. A gesture.

**Build (pre-chain):**
- [ ] "Send Motus" button on member profiles
- [ ] Motus feed on unit page: "August sent Motus to Kristina — 'For always showing up'"
- [ ] Motus leaderboard (not competitive — celebratory)
- [ ] Motus is visible but cannot be bought or traded (pre-chain phase)

**Why it's high-leverage:**  
Recognition is the cheapest and most powerful fuel for community.  
People will move mountains for genuine acknowledgment.

> *"Send Motus when words are not enough."*

---

### 7. Discovery — City Pages + Unit Maps

**Leverage: ★★★★☆**

When someone asks "Is there a Votus Unit near me?" — the answer should be instant.

**Build:**
- [ ] `/city/chicago` — shows all units in Chicago
- [ ] Interactive map (Mapbox or Leaflet)
- [ ] "Units Near You" using browser geolocation
- [ ] City leaderboard: most active cities
- [ ] Unit density visualization: where is democracy growing?

---

## Phase 3 — Convergence (90 Days → 6 Months)

Systems start connecting.

### 8. On-Chain Voting via Dash Platform

**Leverage: ★★★★★**

The thesis becomes real.

**Build:**
- [ ] Dash Platform identity per unit (DPNS name)
- [ ] Votes stored as Dash Platform documents — permanent, verifiable
- [ ] $Votus tokens earned per decision (Dash Platform data contract)
- [ ] $Motus tokens sent peer-to-peer (Dash Platform transfer)
- [ ] Vote explorer: anyone can verify any decision ever made

**What this unlocks:**  
Trust that doesn't require trusting us.  
A record that outlasts any server.  
The foundation for real governance.

---

### 9. Semble Citizenship Integration

**Leverage: ★★★★☆**

Semble Citizens ($22/month) automatically get access to form Votus Units.  
The ecosystems feed each other.

**Build:**
- [ ] Semble Citizenship → automatic Votus account creation
- [ ] Citizenship badge on unit profiles
- [ ] Cross-pollination: Semble Sessions can spin up Votus Units
- [ ] Revenue flow: $22/month sustains the platform

**Flywheel:**
```
Semble Citizen joins
  → Forms a Votus Unit
  → Unit makes decisions
  → Decisions attract Semble-curious people
  → New Citizens join
  → More Units form
```

---

### 10. Delegation Protocol

**Leverage: ★★★★☆**

Trust someone to carry your voice — or carry it yourself.

**Build:**
- [ ] Delegate your vote to another member for specific topics
- [ ] Liquid delegation: change your delegate anytime
- [ ] Delegation chains visible (transparent trust graphs)
- [ ] "I delegated to X because..." — public rationale

**Why it matters:**  
Not everyone can attend every meeting.  
Delegation means your voice still counts when life gets in the way.  
But the key: you can always take it back.

---

## Phase 4 — Scale (6 Months → 1 Year)

From experiment to movement.

### 11. First Votus Campaign

**Leverage: ★★★★★**

A Votus Unit runs for local office. As a team.  
Not one candidate. A whole unit. VOTE US.

This is the moment the thesis becomes undeniable.

**Requirements before this:**
- [ ] 6+ months of documented decisions (on-chain)
- [ ] 10+ active members
- [ ] Public meeting history
- [ ] Community endorsement (Motus count)

---

### 12. Votus API — Let Others Build

**Leverage: ★★★★☆**

Open the data. Let civic tech builders plug into Votus.

**Build:**
- [ ] Public API: units, votes, proposals, members
- [ ] GraphQL + REST
- [ ] Webhook system: get notified when a vote happens
- [ ] SDKs: JavaScript, Python
- [ ] "Powered by Votus" embed widget for unit websites

---

### 13. AVARI Intelligence Layer

**Leverage: ★★★★★**

When a Votus Unit votes on neighborhood policy, AVARI models outcome scenarios.  
Not to tell them what to choose — to help them see.

**Build:**
- [ ] AI-generated proposal summaries (plain language)
- [ ] Outcome modeling: "If you vote yes, here are likely effects"
- [ ] Historical comparison: "Units that voted similarly saw..."
- [ ] Bias detection: flag proposals that may disproportionately affect specific groups

> *Emergent strategy + democratic coordination + AI intelligence.*

---

## The Leverage Map

Every phase feeds the next. Here's how they connect:

```
FOUNDATION                    MOMENTUM                      CONVERGENCE
───────────                   ─────────                     ────────────
10 Units form ──────────────→ Units customize identity ───→ On-chain voting
  ↓                             ↓                             ↓
Join flow works ────────────→ Meetings documented ─────────→ Semble Citizens
  ↓                             ↓                             ↓
Voting works (pre-chain) ───→ Motus recognition flows ────→ Delegation live
  ↓                             ↓                             ↓
Stories emerge ─────────────→ City pages + discovery ──────→ First campaign
                                                              ↓
                                                           API + AVARI
                                                              ↓
                                                           ///AllRise///
```

---

## Principles for Evolution

These aren't rules. They're weights in the compass.

1. **Ship the smallest useful thing.** Don't build voting infrastructure when people haven't formed their first unit yet.

2. **Let the community lead.** If units want something we haven't built, that's the signal.

3. **Transparency is not optional.** Every vote, every decision, every dollar. If it can be public, it should be.

4. **Move at the speed of trust.** Don't scale faster than relationships can handle.

5. **Measure what matters.** Not page views. Decisions made. Members who showed up twice.

6. **Poetry in the product.** This isn't a governance tool. It's a democratic experience. The copy, the animation, the sound — they all carry the weight of what this means.

7. **Small is good, small is all.** The large is a reflection of the small. Get the 5-person unit right. Everything else follows.

---

## How To Use This Document

If you're a **contributor**: pick the next unbuilt item. Open an issue. Describe your approach. Build it.

If you're a **founder**: start your unit first. Then tell us what you need.

If you're an **observer**: read the manifesto. If it moves you, start a unit. That's the highest-leverage contribution there is.

---

<div align="center">

*"I am small. I am strong. And I am always still learning."*  
— August James

**[Votus.One](https://Votus.One)** · **[Start A Unit](https://Votus.One/start)** · **[Discord](https://discord.gg/BDUDhayHeX)**

///AllRise///

</div>
