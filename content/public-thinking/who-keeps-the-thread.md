---
title: "Who Keeps the Thread?"
slug: "who-keeps-the-thread"
lang: "en"
sourceLanguage: "en"
translationKey: "gamescom-2026-who-keeps-the-thread"
date: 2026-09-04
format: "Field Note"
filterType: "field"
confidence: "Emerging Pattern"
motif: "thread"  # the Thread Keeper: one coral thread through three guardrail apertures to the human node; see src/lib/constellationMotifs.js
journal:         # homepage field journal notation (see src/_data/journalPages.js)
  headline: "THREAD"
  sketch: "thread"
  lines:
    - "who keeps it? a human."
    - "guardrails, review, trust."
    - "boundaries matter more."
summary: "A field note from gamescom 2026: three conversations about very different kinds of work, at Bettermode, Inworld, and in DevRel, keep returning to one constraint. AI can do more and more on its own, but someone still has to preserve the context that makes its actions coherent."
deck: "Three conversations at gamescom 2026 connect increasingly autonomous AI with a familiar human challenge: setting boundaries and knowing when to intervene."
topics:
  - "AI Autonomy"
  - "Developer Relations"
  - "Community Strategy"
authors:
  - "Carmelito Bauer"
pdf: null
related:
  - slug: "where-participation-actually-lives"
    title: "Where Participation Actually Lives"
  - slug: "rethinking-where-participation-happens"
    title: "Rethinking Where Participation Happens"
geometry:
  viewBox: "-70 10 420 430"
  shapes:
    - { type: rect, x: 40, y: 60, w: 150, h: 210, color: petrol, opacity: 0.08 }
    - { type: circle, cx: 270, cy: 320, r: 110, color: brass, opacity: 0.08 }
    - { type: line, x1: -40, y1: 380, x2: 330, y2: 40, color: ink, opacity: 0.25 }
openQuestion: "When AI can act on its own, who keeps the thread: who decides what should happen, what must not happen, and when trust has been earned?"
researchThread: "how autonomy and human judgment are organized as AI acts on its own"
---

I went to gamescom looking for new forms of community engagement. I found them [and you can read about them here.](https://communitygeeks.ai/public-thinking/where-participation-actually-lives/) But I also found something I hadn’t been looking for. Across three conversations about very different kinds of work, the same constraint kept resurfacing: AI can do more and more on its own, but someone still has to preserve the context that makes its actions coherent.

<figure class="pt-figure">
  <a class="pt-figure-link" href="/assets/images/public-thinking/gamescom-2026-sonderzug.jpg" data-lightbox aria-label="Enlarge photo">
    <img src="/assets/images/public-thinking/gamescom-2026-sonderzug.jpg" alt="A paper sign in a train door window reading 'RE 1 / 6, zusätzlicher Zug zur GamesCom von / nach Köln', run on behalf of go.Rheinland and VRR, with the Düsseldorf Hbf station sign reflected in the glass." loading="lazy">
  </a>
  <figcaption>
    <span class="pt-figure-cap">Düsseldorf Hauptbahnhof, gamescom week: the extra RE 1/6 train laid on between Düsseldorf and Köln Messe/Deutz for the fair days, and busy accordingly.</span>
  </figcaption>
</figure>

Let’s call this a theory of AI autonomy.

## Autonomy creates a visibility problem

In the previous two pieces, I argued that Community is moving beyond any single container, role description, or team. As that happens, community platforms such as [Bettermode](https://bettermode.com/) are increasingly introducing AI features to help people make sense of a much wider field of activity.

Mo Malayeri, CEO of Bettermode, put the emerging challenge more precisely than I had. Commenting on an earlier piece of mine, he wrote: “Most of it moved into places nobody calls a community... reading all of that got easy. Acting in it without a human losing the thread is the hard part.”

That last phrase stayed with me: *without a human losing the thread.*

I asked what losing it actually means in practice. His answer was straightforward: policies and guardrails first, followed by human review until the system has earned trust. The person responsible still needs to see what is happening throughout that process. Otherwise, while the system gains autonomy, its human operator gradually loses the context needed to judge what it is doing.

## Surprise needs boundaries

Brian Cox, who designs AI game characters at Inworld, approached the same problem from almost the opposite direction. He wants AI characters to be unpredictable.

He told me about two robot companions, one a floating drone, the other humanoid, that were deliberately given sarcastic personalities. They made fun of the player and did not always cooperate. Players loved them. A perfectly compliant character, Brian explained, quickly becomes boring. A character that can surprise you feels more alive.

His answer to possible risks is not to make the AI less autonomous. It is to be much clearer about where that autonomy begins and ends. A human decides which topics the character can engage with and sets the safety rails. Inside them, Brian is happy to give the character genuine room to act, even to reverse the usual relationship and tell the player what to do. In his version of the experience, **the player can briefly become the side character rather than the hero.**

<figure class="pt-figure pt-figure-portrait">
  <a class="pt-figure-link" href="/assets/images/public-thinking/who-keeps-the-thread-boundaries.jpg" data-lightbox aria-label="Enlarge Figure 1">
    <img src="/assets/images/public-thinking/who-keeps-the-thread-boundaries.jpg" alt="Editorial illustration on a deep teal ground: a person, a floating drone and a humanoid robot drawn as wireframe constellations. One coral thread runs from a marker on the floor through the person to the drone and on to the robot, which is pointing the way; a low fence of connected points marks the edge of the space they share." loading="lazy">
  </a>
  <figcaption>
    <span class="pt-figure-num">Figure 1</span>
    <span class="pt-figure-cap">Brian Cox’s version of the experience: a human sets the edge of the space, and inside it the characters have genuine room to act, even to tell the player what to do.</span>
    <span class="pt-figure-source">Source: conversation with Brian Cox, Inworld: Communitygeeks Field Note, gamescom 2026.</span>
  </figcaption>
</figure>
<style>
  .pt-figure-portrait{max-width:560px !important;}
  .pt-figure-portrait img{min-width:0;}
</style>

The creative possibility comes from freedom. Making that freedom safe remains a human design decision.

## Autonomy includes the right to refuse

Mark Mandel, in a completely different context [from the first piece](https://communitygeeks.ai/public-thinking/where-participation-actually-lives/), was describing something else: not AI autonomy, but his own.

DevRel has an effectively endless list of things it could do. Everything is interesting; every request appears worth saying yes to. Mark described a familiar progression among people entering the role: yes to this, yes to that, yes to six new things this week, and then exhaustion. The work is not only doing things. **It is deciding which things deserve to be done.**

His preferred model comes from Site Reliability Engineering. Before an SRE team takes responsibility for running a service, the service has to meet a defined checklist. If it does not, responsibility stays with the team that built it. Mark applies the same logic to DevRel: make the intake criteria explicit, decide how work is distributed, and give people enough autonomy to decline a request.

That refusal is not necessarily a failure. It can be a signal. If nobody in DevRel wants to support something, perhaps the product is not ready, the priorities are wrong, or there are ten more valuable things competing for the same attention. Saying no helps the organization see what an indiscriminate yes would conceal.

## What actually connects them

Mo and Brian are talking about how much freedom to give a system. Mark is talking about how much freedom to give himself. Put together, the finding is even richer than merely “three people said AI needs guardrails.”

Mo’s human reviewer needs enough visibility to understand what the system is doing. Brian’s character needs enough freedom to be surprising, but not enough to damage the world it belongs to. Mark’s DevRel practitioner needs enough autonomy to refuse work, and enough context to know when refusal is the right choice.

Across all three conversations, capability and judgment do not move in opposite directions. As the field of possible action expands, deciding where its boundaries sit becomes more important.

AI makes it possible for more to happen without a person performing every step. But that does not remove the human question. It moves it: toward deciding what should happen, what must not happen, when trust has been earned, and when somebody needs to intervene.

Maybe that’s who keeps the thread.
