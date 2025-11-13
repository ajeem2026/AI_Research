# LOMN RAG Project: Key Insights & Implementation Priorities

## Executive Summary

This document synthesizes critical insights from Lunsford & Lunsford (2018) "The Letter of Medical Necessity as Genre: Who Creates It and Who Controls It" and translates them into actionable implementation priorities for your RAG system.

---

## Part 1: Critical Insights from the Paper

### The Core Problem
**Finding**: Providers and insurance representatives have fundamentally different understandings of what constitutes a valid Letter of Medical Necessity (LOMN).

**Why It Matters**: This isn't just a communication failure—it's a **genre comprehension gap**. They literally don't agree on what the document *is* or what it *should do*.

### Three Levels of Mismatch

#### 1. Medical Necessity Definition
- **Providers Think**: Medical necessity includes holistic patient wellbeing, quality of life improvements, preventing future complications
- **Insurers Think**: Medical necessity is strictly defined by policy criteria, evidence-based treatment standards, and minimum requirements for home MRADLs (Mobility-Related Activities of Daily Living)

**Your RAG System Must**: Make both definitions explicit and show how to bridge them

#### 2. Appropriate Content (Substance)

**APPROVED Content** (Include These):
- Diagnosis with ICD-10 codes
- Specific functional limitations (quantified when possible)
- Evidence-based clinical rationale
- Equipment specifications matching policy criteria
- Expected measurable outcomes
- Provider professional attestation
- Documentation of why less costly alternatives are insufficient

**PROBLEMATIC Content** (Flag or Avoid):
- Patient/parent preferences without medical justification
- Convenience arguments ("clutter-free home")
- Non-patient usage ("brother will also use it")
- Societal cost-effectiveness discussions
- Vague wellbeing statements without functional connection
- Extraneous narrative details (Disney World trip)
- Ethical arguments about "right to equipment"

**Your RAG System Must**: Filter retrieved examples by approval status and flag problematic content patterns

#### 3. Form/Language Issues (Syntactics)

**Formal Language Requirements**:
- Use medical terminology appropriately
- Avoid informal phrases: "seen better days," "stay put," "clutter"
- Use precise quantification: "ROM limited to 30 degrees" not "limited ROM"
- Employ proper transitivity: clearly identify agents of actions

**Common Grammar Errors to Avoid**:
- **Dangling modifiers**: "By stretching for prolonged period, ROM is proven to improve" 
  - Fix: "Studies show that 30-minute daily stretching sessions improve ROM"
- **Agent-less passive constructions**: "ROM is proven to improve"
  - Fix: "Clinical trials demonstrate ROM improvement"
- **Ambiguous pronoun references**: Ensure clear antecedents

**Your RAG System Must**: Implement language checks or post-processing to catch these patterns

---

## Part 2: The Genre Theory Framework (Simplified)

### What Is Genre Theory?
**Not** just document format/template
**Instead**: A shared understanding of:
- What problem the document solves (rhetorical situation)
- What actions the document enables (social action)
- What constraints shape the document (situational constraints)

### Why Providers "Fail" Genre Expectations

The paper reveals two explanations:

#### Explanation 1: Genuine Misunderstanding
Providers don't know what insurers expect because:
- No formal training in LOMN writing
- Insurance criteria are opaque or inaccessible
- Feedback on denials is minimal ("not medically necessary" without details)

**Your System's Response**: Education through examples—show approved LOMNs with similar conditions

#### Explanation 2: Deliberate Genre Negotiation
Providers *know* insurers want narrow medical necessity, but:
- They try to expand the definition through persuasive language
- They include holistic factors hoping to influence insurer understanding
- They're attempting to change the genre itself

**Your System's Response**: Transparency—show when generated content deviates from insurer expectations and why

---

## Part 3: Implementation Priorities

### Priority 1: Dual-Perspective Knowledge Base (Week 1)

**Structure your knowledge base to represent both perspectives**:

```
knowledge_base/
├── provider_perspective/
│   ├── approved_lomns/          # Successful examples
│   ├── clinical_guidelines/     # Evidence-based standards
│   └── patient_case_studies/    # Holistic view
│
├── insurer_perspective/
│   ├── insurance_policies/      # Medical necessity criteria
│   ├── coverage_guidelines/     # DME (Durable Medical Equipment) rules
│   └── denial_reasons/          # Common rejection patterns
│
└── bridges/
    ├── aligned_examples/        # LOMNs that satisfied both sides
    └── appeal_successes/        # Cases that won on appeal
```

**Retrieval Strategy**: Always retrieve from BOTH perspectives, then generate content that bridges them.

### Priority 2: Content Validation Layer (Week 2)

**Implement automated checks for problematic content**:

```python
class ContentValidator:
    def __init__(self):
        self.red_flags = {
            'convenience': ['convenient', 'easier', 'clutter', 'simpler'],
            'non_patient_use': ['family', 'sibling', 'brother', 'sister', 'spouse'],
            'preferences': ['prefer', 'want', 'like', 'wish'],
            'cost_argument': ['cost-effective', 'save money', 'societal cost'],
            'vague_wellbeing': ['wellbeing', 'happiness', 'comfort'] # without medical connection
        }
    
    def validate_lomn(self, lomn_text):
        warnings = []
        for category, keywords in self.red_flags.items():
            if any(keyword in lomn_text.lower() for keyword in keywords):
                warnings.append(f"⚠️  {category}: Review for appropriate medical justification")
        return warnings
```

### Priority 3: Social Transparency Features (Week 3-4)

**Operationalize Ehsan et al.'s social transparency**:

#### Feature A: Stakeholder Perspective Indicator
Show which viewpoints are represented:
```
STAKEHOLDER ANALYSIS:
✓ Provider Clinical Rationale: Present (3 instances)
✓ Insurance Policy Alignment: Present (2 criteria matched)  
✗ Patient-Centered Outcomes: Weak (only mentioned once)
⚠️  Consider adding: Patient functional goals, quality of life impacts
```

#### Feature B: Evidence Strength Meter
Rate the supporting evidence:
```
EVIDENCE STRENGTH: ⭐⭐⭐ (Moderate)
✓ Clinical guidelines cited: RESNA standards
✓ Approved example found: Similar case with CP
✗ Research citations: None (consider adding published studies)
```

#### Feature C: Genre Alignment Score
Compare to successful examples:
```
GENRE ALIGNMENT: 8.5/10
✓ Formal medical language: 95% match
✓ Required sections present: 6/6
⚠️  Length: Longer than typical approved letters (consider condensing)
✗ One informal phrase detected: "stay in place" → change to "maintain position"
```

#### Feature D: Reasoning Chain Visualization
Show the AI's decision process:
```
REASONING CHAIN:
1. Retrieved 5 relevant documents:
   - 2 approved LOMNs for CP patients
   - 1 insurance policy (power wheelchair criteria)
   - 2 clinical guidelines
   
2. Identified key insurance criteria:
   ✓ Mobility limitation impairs home MRADLs
   ✓ Cannot safely propel manual wheelchair
   ✓ Demonstrates safe operation ability
   
3. Matched patient case to criteria:
   ✓ Patient is non-ambulatory (criterion 1)
   ✓ Spasticity prevents manual propulsion (criterion 2)
   ✓ Cognitive ability intact (criterion 3)
   
4. Generated sections addressing each criterion with evidence from retrieved documents

5. Added provider attestation matching required language from policies
```

### Priority 4: Mechanistic Interpretability (Advanced - Month 2)

**Go beyond retrieval transparency to model internals**:

#### Feature A: Attention Visualization
Show which source documents influenced which sections:
```
SECTION: Clinical Rationale
Primary Source: [Approved LOMN #3] (87% attention weight)
Secondary Source: [RESNA Guidelines] (13% attention weight)
Key phrases extracted: "power positioning", "pressure relief", "prevent contractures"
```

#### Feature B: Concept Detection
Identify what the model "understood":
```
DETECTED CONCEPTS:
- Medical Necessity Type: Functional mobility limitation ✓
- Equipment Category: DME - Power wheelchair ✓
- Justification Strategy: Evidence-based + functional outcomes ✓
- Risk Factors: Pressure ulcers, contractures ✓
- Contraindications to Manual: Spasticity, ROM limitation ✓
```

#### Feature C: Counterfactual Analysis
Show what would change the output:
```
SENSITIVITY ANALYSIS:
If patient COULD propel manual wheelchair:
  → System would recommend Group 1 power or manual wheelchair
  → Medical necessity for Group 2 would NOT be supported
  
If insurance policy DIDN'T require home MRADL limitation:
  → Community mobility justification would be emphasized
  → Home environment assessment would be de-prioritized
```

---

## Part 4: Evaluation Framework

### How to Know If Your System Works

#### Metric 1: Genre Alignment
**Question**: Does the generated LOMN match the conventions of successful examples?
**Measure**: Similarity score to approved LOMNs vs. denied LOMNs
**Target**: >0.8 similarity to approved, <0.4 similarity to denied

#### Metric 2: Perspective Balance
**Question**: Does it address both provider and insurer viewpoints?
**Measure**: Presence of keywords from each stakeholder group
**Target**: ≥3 provider indicators AND ≥3 insurer indicators

#### Metric 3: Content Appropriateness
**Question**: Does it avoid problematic content patterns?
**Measure**: Number of validation warnings triggered
**Target**: 0 red flags, ≤2 yellow flags

#### Metric 4: Clinician Acceptance
**Question**: Would a real provider use/submit this?
**Measure**: Likert scale survey (1-5) on:
- Medical accuracy
- Completeness
- Professionalism
- Likelihood of approval
**Target**: Mean ≥4.0 on all dimensions

#### Metric 5: Transparency Utility
**Question**: Do the explanations help clinicians understand and trust the system?
**Measure**: Qualitative interviews asking:
- Can you explain why the system made these choices?
- Do you trust this LOMN? Why or why not?
- What would you change?
**Target**: >80% report understanding reasoning, >70% report appropriate trust

---

## Part 5: Research Contributions

### What Makes This Novel?

#### 1. Applied Genre Theory + AI
**Gap**: Genre theory is mostly used for analysis, not synthesis
**Your Contribution**: First computational system that uses genre theory to *generate* documents while making genre conventions explicit

#### 2. Dual-Perspective RAG
**Gap**: Most RAG systems retrieve from single knowledge source
**Your Contribution**: Explicitly modeling stakeholder perspective differences and bridging them

#### 3. Social Transparency in High-Stakes Contexts
**Gap**: Most XAI work focuses on technical transparency (features, weights)
**Your Contribution**: Operationalizing "social transparency" (stakeholder-aware explanations) in medical documentation

#### 4. Human-Centered Mechanistic Interpretability
**Gap**: MI research often focuses on model internals without considering user needs
**Your Contribution**: MI features designed around clinician workflows and decision-making needs

---

## Part 6: Talking Points for Different Audiences

### For Dr. Ehsan (Your Advisor)
**Frame**: "I'm using the Lunsford paper's genre theory insights to design a socially transparent RAG system. The key innovation is making explicit the different 'rhetorical situations' perceived by providers vs. insurers, then showing how the AI bridges them."

**Highlight**: Social transparency features, mechanistic interpretability, human-centered design

**Ask**: How to evaluate whether transparency features are actually useful? What XAI evaluation frameworks should I use?

### For the Lunsford Authors (Paper Researchers)
**Frame**: "Your paper revealed that LOMN failures stem from genre comprehension mismatches, not just information deficits. I'm building a system that makes genre expectations explicit through retrieval and explanation."

**Highlight**: Dual-perspective knowledge base, content validation, genre alignment metrics

**Ask**: Does this computational approach respect genre theory's insights? Would this facilitate the 'conversations about content and form' you recommended?

### For Clinicians (Potential Users)
**Frame**: "This system helps you write Letters of Medical Necessity by showing you what insurance companies expect, based on successful examples and their policy criteria."

**Highlight**: Time savings, higher approval rates, clear guidance on what to include/avoid

**Ask**: What's most frustrating about writing LOMNs now? What would make you trust an AI assistant for this task?

### For Technical Audiences (ML Researchers)
**Frame**: "This is a retrieval-augmented generation system with mechanistic interpretability features for high-stakes medical documentation."

**Highlight**: Architecture innovations, evaluation metrics, transparency mechanisms

**Ask**: What MI techniques would be most valuable? How to handle multi-stakeholder optimization?

---

## Part 7: Timeline & Milestones

### Week 1: Basic Prototype
- [ ] AWS Bedrock setup
- [ ] Knowledge base with 10-20 sample documents
- [ ] Basic RAG pipeline working
- [ ] Generate first LOMN

### Week 2: Content Intelligence
- [ ] Content validator implemented
- [ ] Dual-perspective retrieval working
- [ ] Genre alignment metrics calculated
- [ ] Test on 5 different patient cases

### Week 3: Transparency Layer
- [ ] Stakeholder perspective analyzer
- [ ] Evidence strength meter
- [ ] Reasoning chain visualization
- [ ] Generate transparency reports

### Week 4: Evaluation & Iteration
- [ ] Compute evaluation metrics
- [ ] Compare to human-written examples
- [ ] Identify failure modes
- [ ] Refine prompts and retrieval

### Week 5-6: User Study Prep
- [ ] Create demo interface
- [ ] Develop interview protocol
- [ ] Recruit clinician participants
- [ ] Prepare evaluation materials

### Week 7-8: User Studies
- [ ] Conduct clinician interviews
- [ ] Gather feedback on generated LOMNs
- [ ] Assess transparency feature utility
- [ ] Analyze qualitative data

### Week 9-10: Paper Writing
- [ ] Results analysis
- [ ] Draft paper sections
- [ ] Create figures/visualizations
- [ ] Iterate with Dr. Ehsan

---

## Part 8: Common Pitfalls to Avoid

### Pitfall 1: Treating Genre as Template
**Wrong**: "I'll just create a fill-in-the-blank LOMN template"
**Right**: "I'll help writers understand the rhetorical situation and make strategic choices"

### Pitfall 2: Optimizing for Only One Stakeholder
**Wrong**: "Generate LOMNs that always satisfy insurance criteria"
**Right**: "Generate LOMNs that address insurance criteria while preserving clinical values"

### Pitfall 3: Black-Box Transparency
**Wrong**: "Here are the top-5 retrieved documents" (just listing sources)
**Right**: "Here's how each source influenced each section, and why these choices align with both clinical best practices and insurance expectations"

### Pitfall 4: Ignoring Genre Negotiation
**Wrong**: "Providers are just doing it wrong; my system will teach them the right way"
**Right**: "Providers are sometimes deliberately challenging narrow definitions; my system makes this choice explicit"

### Pitfall 5: Over-Automation
**Wrong**: "This will replace human judgment"
**Right**: "This will augment human expertise by making implicit genre conventions explicit"

---

## Part 9: Key Resources

### Must-Read Papers
1. **Your Foundation**: Lunsford & Lunsford (2018) - LOMN as Genre
2. **RAG Basics**: Lewis et al. (2020) - Retrieval-Augmented Generation
3. **Social Transparency**: Ehsan et al. - Various papers on explainable AI
4. **Genre Theory**: Miller (1984) - Genre as Social Action
5. **MI for LLMs**: Anthropic research on mechanistic interpretability

### Technical Resources
- AWS Bedrock docs (for implementation)
- LangChain tutorials (for RAG orchestration)
- Anthropic's interpretability research (for MI techniques)

### Domain Resources
- RESNA (Rehabilitation Engineering Society) guidelines
- CMS (Centers for Medicare & Medicaid Services) criteria
- Sample LOMNs (from medical equipment vendors)

---

## Part 10: Success Criteria

### You'll Know You're Succeeding When:

1. **Technical Success**
   - [ ] System generates grammatically correct, medically appropriate LOMNs
   - [ ] Retrieval brings relevant approved examples and policies
   - [ ] Transparency features show clear reasoning chains

2. **Research Success**
   - [ ] You can explain how your system addresses the Lunsford paper's insights
   - [ ] You have quantitative and qualitative evaluation results
   - [ ] You've identified novel contributions to HCI and XAI

3. **User Success**
   - [ ] Clinicians understand and trust the generated LOMNs
   - [ ] Transparency features are actually used (not ignored)
   - [ ] Feedback reveals genuine value-add over current practice

4. **Academic Success**
   - [ ] Dr. Ehsan is impressed with the social transparency implementation
   - [ ] Lunsford authors see value in computational approach to their theory
   - [ ] You have a clear path to publication (CHI, CSCW, JAMIA, etc.)

---

## Final Thoughts

This project sits at a fascinating intersection:
- **AI/ML**: RAG, mechanistic interpretability, prompt engineering
- **HCI**: Social transparency, human-centered XAI, high-stakes decision support
- **Medical Informatics**: Clinical documentation, insurance processes
- **Rhetoric**: Genre theory, professional communication

The Lunsford paper gives you a solid theoretical foundation. The RAG + XAI implementation gives you technical substance. The user studies will give you empirical validation.

Most importantly: You're not just building "another chatbot for healthcare." You're exploring how AI can make implicit social structures (like genre conventions) explicit and navigable—which is a genuinely novel contribution.

**Go build something amazing!** 🚀

---

## Quick Reference: Key Quotes from Lunsford Paper

### On Genre Mismatches
> "Our analysis suggests that writers and evaluators often have differing understandings of the letter of medical necessity genre."

### On Medical Necessity Ambiguity
> "The ambiguity of the term medical necessity created more problems than it solves, yet the term remains at the center of claims for coverage to this day."

### On Provider Perspective
> "Providers can't help but to include such information because they see it as highly pertinent to the claim and, moreover, they are attempting to use language to influence the insurance representatives' understandings of medical necessity."

### On Insurer Responses
> "Insurance representatives often appeal to formalized language of medical necessity to 'rule' these rhetorical appeals 'out of bounds.'"

### On Solutions Needed
> "We suggest that those writing letters of medical necessity should engage in conversations about the needed content and form, and that providers and evaluators foster dialogue about the genre's key features."

**Your RAG system is that conversation, made computational.** 💡
