# AI_Research

This repository hosts my ongoing and future research in Artificial Intelligence, with a focus on:

- **Mechanistic Interpretability (MI)**
- **Explainable AI (XAI) & Social Transparency**
- **Human–Computer Interaction (HCI)**
- **Domain-specific RAG systems (e.g., clinical documentation, scientific workflows)**

It serves as both a codebase and a living lab notebook for experiments, prototypes, and research artifacts.


## 🔍 Current Focus Areas

### 1. Socially Transparent RAG for Clinical Documentation
**Status:** In progress  
**Keywords:** RAG, social transparency, clinical NLP, Letters of Medical Necessity (LOMN), AWS Bedrock

This line of work extends Dr. Upol Ehsan’s **Social Transparency (ST)** framework into high-stakes medical documentation. The main goals are:

- Build a **dual-stakeholder RAG system** (provider ↔ insurer) for generating Letters of Medical Necessity.
- Make the model’s rhetorical and clinical reasoning **visible and contestable** to clinicians.
- Integrate **genre theory** and **content-appropriateness constraints** to avoid common failure modes in LOMNs.

Code lives in: `lomn-rag-demo/`


### 2. Mechanistic Interpretability Experiments
**Status:** Prototyping  
**Keywords:** circuits, feature attribution, concept activation, counterfactuals

Here I experiment with:

- Feature- and neuron-level attribution for small/medium language models
- Concept activation and probing
- Counterfactual edits and their impact on downstream behavior
- Using MI ideas to **support human reasoning**, not just to introspect models


### 3. Human–Centered XAI & Interaction Prototypes
**Status:** Ongoing  
**Keywords:** HCI, explanation UIs, social transparency, user studies

This includes small prototypes where explanations are:

- Framed as **tools for sense-making** rather than just “model guts”
- Tailored to different stakeholders (clinicians, researchers, policy people, etc.)
- Evaluated for **legibility, usefulness, and contestability** rather than raw fidelity

