---
title: "Everyone Is Becoming an AI Systems Engineer"
slug: "everyone-is-becoming-an-ai-systems-engineer"
lang: "en"
sourceLanguage: "en"
translationKey: "ai-systems-engineer"
date: 2026-09-11
format: "Field Note"
filterType: "field"
confidence: "Observation"
motif: "horologium"
summary: "AI coding agents are collapsing the distance between ideas and execution. Carmelito Bauer asks which human skills become more valuable as building gets easier."
deck: "AI coding agents are lowering the barrier to building systems. The scarce capabilities are shifting toward judgment, problem framing and human oversight."
topics:
  - "AI Coding Agents"
  - "Systems Thinking"
  - "Human Judgment"
authors:
  - "Carmelito Bauer"
openQuestion: "What becomes more valuable when the distance between an idea and an executable system collapses?"
researchThread: "how AI coding agents change who can design and test working systems"
related:
  - slug: "what-remains-human-when-ai-takes-over"
    title: "What Remains for Humans When AI Takes Over the Rest"
  - slug: "who-keeps-the-thread"
    title: "Who Keeps the Thread?"
journal:
  headline: "SYSTEMS"
  sketch: "horologium"
  lines:
    - "ideas become executable."
    - "judgment defines the loop."
    - "humans choose what matters."
---

When I was around 13 years old I experimented with forum software such as Woltlab Burning Board. I created communities around the WWE, World of Warcraft and Lineage 2. Customizations needed to be implemented, and WBB actually had a very helpful community that guided you through each step when something went wrong. I was not formally learning how to code, but I was starting to understand how these systems work in general and where to look when something broke.

Even in my school days, technical people often met what I was building with little more than a grin or a shrug: “So basically, a CMS.” Many urged me to learn Python. I agree that, even today, that would be useful. But the experience was already teaching me something adjacent to coding: how to understand a system well enough to change it.

## Ideas and Execution Move Closer Together

My friend Edwin, an AI engineer and software developer at hurra.com, sees the gap between technical and nontechnical people shrinking. His observation captures something I have been noticing over the past few weeks: ideas and execution are moving closer together. As that distance shrinks, human judgment, critical thinking and the ability to decide what should be done become more valuable.

That shift became concrete recently, when a potential client asked us to find professional users in Europe, recruit them to test a technical product in their work, and identify potential customers or partners.

Much of the work formed a repeatable loop: discover candidates, research them, assess them against explicit criteria, find the right contact, prepare personalized outreach, remember what had happened and route uncertain decisions to a human.

I described that loop to an AI coding agent. We began with a deliberately tiny “shadow agent”: five companies, five professionals and no messages actually sent. Instead of inventing a lead score, we defined explicit qualification gates. The system had to preserve the evidence behind every judgment, flag uncertainty and keep consequential actions behind human approval. We also added random reviews of rejected candidates, because an automated system can look wonderfully accurate while silently discarding its best opportunities.

A few exchanges later, it existed.

My girlfriend had gone for her midday nap while this was still a raw idea. By the time she woke up, there was a private repository, a database, a frozen qualification policy, an executable runner, human-review history, safety limits, tests and reporting. We had gone from “could this work differently?” to the slightly surreal “holy shit, this thing is already running” in one afternoon.

The next step was not to ask engineering for an estimate. It was to run ten real candidates through the system and discover where our reasoning broke.

I did not write that software, nor could I have specified its technical implementation in advance. My contribution was different: understanding the problem, recognizing the decision loop, questioning whether the proposed structure matched the work, defining where human judgment mattered and insisting on auditability and safety. The distance between imagining a different way of working and testing it had collapsed to hours.

<figure class="pt-figure"><a class="pt-figure-link" href="/assets/images/public-thinking/ai-systems-builder.png" data-lightbox aria-label="Enlarge illustration"><img src="/assets/images/public-thinking/ai-systems-builder.png" width="1672" height="941" alt="A constellation figure shapes a network of nodes above an open notebook, turning an idea into an executable system." loading="lazy"></a><figcaption><span class="pt-figure-cap">An idea becomes a system in an afternoon.</span><span class="pt-figure-source">Communitygeeks editorial illustration, created with AI.</span></figcaption></figure>

## Building Is Not the Same as Engineering

The headline is deliberately exaggerated. Producing code does not confer architectural knowledge, security judgment or an instinct for maintainable systems. AI can help someone build a much larger bad system much faster.

But technical capability is becoming less tightly coupled to technical identity. A marketer can build an internal tool without first becoming an engineer. A community practitioner can connect fragmented information without becoming a data engineer.

My friend Moe, who runs community and digital client success at Fenergo, has been building interface widgets and custom CSS directly in Claude. As he put it: “I don’t need someone to code something for me.” His projects are smaller in scope than my recruiting system, but the shift is the same: he can enter the implementation loop directly.

That does not make engineering expertise less valuable. It changes where other people can enter the process.

## The Boundary Becomes More Permeable

At 13, I could make Burning Board do things it was not supposed to do because someone on a forum had written down the steps. When those steps failed, I learned to investigate what had gone wrong. Twenty years later, I have not crossed some clean boundary from nontechnical to technical. The boundary itself has become more permeable.

I can describe what a system should do, turn judgment into explicit rules, question how it works, test its behaviour and decide where human oversight belongs. AI can increasingly translate those decisions into something executable.

So no, everyone is not becoming an engineer. But far more people are gaining the ability to engineer systems. As execution becomes cheaper, the scarce capability moves elsewhere: understanding the problem, exercising judgment and deciding what is worth building in the first place.
