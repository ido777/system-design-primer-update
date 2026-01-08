# Phase 1: Requirements & Problem Scope - Quick Reference

> **Remember**: Phase 1 is about **leading the conversation** and **uncovering hidden requirements**. Don't rush to design—ask questions first!

## 🎯 Your Goal in Phase 1

**Evaluate Communication and Clarification Skills**

The interviewer wants to see if you can:
- Ask the right questions
- Uncover hidden constraints
- Precisely frame the problem
- Lead the conversation (not just answer)

---

## 🧭 The ABC Framework - Your Memory Aid

Use this simple **ABC** mnemonic to remember what to do:

### **A**sk → **B**rief → **C**larify

---

## 📋 Step 1: **A**SK - Core Questions

Start with these three fundamental questions:

### **A**ctors, **B**usiness Scenarios, **C**ore Features

**Opening Question:**
> "What are the main **users, use cases, and main features** of the system?"

**Follow-up questions to dig deeper:**

#### Actors (Who?)
- Who are the main users?
- Are there different user types? (e.g., anonymous vs. authenticated)
- Are there other systems that interact with this? (third-party integrations, admin systems)

#### Business Scenarios (How?)
- How do users interact with the system?
- What are the main workflows?
- What are the primary use cases?
- What are the inputs and outputs?

#### Core Features (What?)
- What does the system do?
- What are the must-have features for MVP?
- What features can be deferred to later?

---

## 📋 Step 2: **B**RIEF - Summarize & Scope

After gathering initial information, **brief** the interviewer to confirm understanding:

### **A**ssumptions, **B**oundaries, **C**onstraints

**Restate what you heard:**
> "So those are our main **A**ssumptions, **B**oundaries (scope), and **C**onstraints? Did I explain the **MVP** correctly?"

**Then ask about:**

#### Assumptions
- What assumptions are we making?
- Are there any implicit requirements?

#### Boundaries (Scope)
- What's in scope for this interview?
- What's out of scope?
- Can we focus on the core flows first?

#### Constraints
- What are the technical constraints?
- What are the business constraints?
- Any time-to-market constraints?

---

## 📋 Step 3: **C**LARIFY - Non-Functional Requirements

Before moving to design, ask about **non-functional requirements**:

**Closing Question:**
> "Are there **any** important topics we need to discuss about the problem scope **before** we **continue**?"

### Key Areas to Cover:

#### 📊 Scale & Traffic
- How many users are there?
- How many requests per second do we expect?
- What is the expected read-to-write ratio?
- What is the peak traffic?
- How much data do we expect to handle?

#### ⚡ Performance
- What are the latency requirements?
- What are the throughput requirements?
- Are there any specific performance SLAs?

#### 🛡️ Reliability & Availability
- What is the availability requirement? (e.g., 99.9%, 99.99%)
- What are the reliability requirements?
- What happens if the system goes down?

#### 🔒 Security & Privacy
- What are the security requirements?
- Are there privacy concerns? (GDPR, data protection)
- What authentication/authorization is needed?
- Are there compliance requirements?

#### 🔧 Operational Aspects
- What are the maintenance requirements?
- Are there monitoring/observability needs?
- What about logging and analytics?
- Any deployment constraints?

#### 💰 Cost & Business
- Are there cost constraints?
- What's the business model?
- Any time-to-market requirements?

---

## 💡 Pro Tips for Phase 1

### ✅ DO:
- **Lead the conversation** - You're driving, not just responding
- **Ask open-ended questions** - "What are the main features?" not "Is it X or Y?"
- **Use "suggest" language** - "I suggest we focus on X first, then handle Y later"
- **Restate and confirm** - "So we need to handle 10M DAUs with ≤100ms P99 latency, correct?"
- **Ask "Anything else?"** - Multiple times to uncover hidden requirements
- **Negotiate scope** - It's okay to defer some features to focus on core flows

### ❌ DON'T:
- Jump straight to design without asking questions
- Assume requirements without clarifying
- Stay silent while thinking
- Ignore the interviewer's hints or objections
- Try to cover everything at once

---

## 📝 Example Brief Summary Template

After gathering requirements, summarize them like this:

```markdown
### Use Cases
- **User** [action] → [result]
- **User** [action] → [result]

### Background Tasks
- **Service** [automated task]
- **Service** [automated task]

### Non-Functional Requirements
- **Service** has [requirement] (e.g., high availability, low latency)

### Out of Scope (for now)
- [Feature/requirement to handle later]

### Other Considerations (for later phases)
- System Quality Attributes (Reliability, Scalability, Security, etc.)
- System Lifecycle (Deployment, Monitoring, Logging, CI/CD, etc.)
```

**Then ask:**
> "Does this look good? Did I miss anything? Anything else we should cover at this stage?"

---

## 🎯 Quick Checklist

Before moving to Phase 2 (High-Level Design), make sure you've covered:

- [ ] Main users and use cases identified
- [ ] Core features scoped (MVP defined)
- [ ] Scale/traffic requirements understood
- [ ] Performance requirements clarified
- [ ] Availability/reliability requirements known
- [ ] Security/privacy concerns addressed
- [ ] Scope boundaries agreed upon
- [ ] Assumptions documented
- [ ] Constraints identified
- [ ] Summary confirmed with interviewer

---

## 🔗 Related Resources

- [Full Study Guide - Phase 1 Details](../study_guide.md#phase-1-understand-the-problem--establish-design-scope)
- [Example Dialogues - Pastebin Solution](../../solutions/system_design/pastebin/README.md)
- [Example Dialogues - Mint Solution](../../solutions/system_design/mint/README.md)

---

## 💭 Remember

> **Phase 1 is not about designing—it's about understanding.**  
> Take your time. Ask questions. Lead the conversation.  
> A well-scoped problem makes Phase 2 (design) much easier!

