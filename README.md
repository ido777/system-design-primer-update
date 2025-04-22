# System Design Primer: Update Edition

Welcome to the **System Design Primer: Update Edition**. This project is an evolution of the original [System Design Primer](https://github.com/donnemartin/system-design-primer), tailored for the new era of 2025 & Generative AI. 

The content is served currently with the help of GitHub pages so to read the content about system design simply go to [system-design-primer-update/](https://ido777.github.io/system-design-primer-update/).


## Introduction
#### Why do we need this updated version?

The original System Design Primer was a great resource for learning about system design. 
However, it is not updated at all for at least 2 years. See [is this awesome repo no longer been updated?](https://github.com/donnemartin/system-design-primer/issues/840) that was opened at **Feb 2024** or [Indieflashblog link is dead](https://github.com/donnemartin/system-design-primer/issues/501) that was opened at **Jan 2021**   .
There are many PR and issues about **missing and broken url links and old content** that are still open. This creates a problem for learners who want to use this resource to learn or prepare for system design interviews.

As the time being this repo is still young and unknown, and people are not aware of it, so the community is still going to the original repo and open issues and PRs, however as said it is not actively maintained anymore. 
If you got here somehow and you think that updating and upgrading the old repo is a good idea _**please star this repo**_ so it will start to be noticed and people will help in this update and upgrade process.

#### In addition, the world of software development is evolving fast due to the advent of Generative AI.

Generative AI is changing the world and it is changing the way we design, develop, deploy and use software. Actually we are still in the early stages of this revolution and we are still trying to understand the full impact of this change.
Updating this repo as a collective effort can help to have a state of the art view on system design issues and share ideas on ways to learn and design systems in the Gen-AI era.

This is why we need to update the System Design Primer to be more relevant and useful. 

## The vision

Our vision is to provide down the road dynamic, AI-assisted solutions and tools for the system design process suited to the gen-ai era. Instead of knowledge base and links that were the main focus in pre gen-ai era of the original repo.

The interactive tools aimed to explore various architectural trade-offs, simulate system design interview and help with building and deploying system with gen-ai code and system  generators to gain more understanding, or even use it to start a real new system.

Given the facts:
-  that we are in the early stages of this revolution, and some of the new LLM are capable to design and teach system design, out of the box.
-  the gen ai tools are evolving faster then any human can track by his own and tools that can design code and deploy a full system from a prompt out of the box, are becoming more and more powerful.

We need to find a way down the road to make this repo "self-updating" using agentic-ai tools like deep research and reasoning to keep the content more relevant and useful for the gen ai era software designer and developer.


## The plan

We will start by updating the content and making it easier to maintain, then we will start to add and use gen-ai tools to make this repo more interactive and support personalized learning, Once it will become a tool in system design process we can think on ways to use gen-ai to help with keeping it up to date.

## Status

So far we have:

- **Migrated all open issues and PRs:** to the new repo, many PRs were merged and the older then 3 years were closed since they are not relevant anymore. Issues were migrated and closed as "not planned" only to preserve the full history and to enable users to reopen them if they want to.
- **Created a project board:** to explain the roadmap and track the issues and PRs of the update effort.
- **Refactored into a non monolithic structure:** The original content in english was refactored into small and concise modules. It will ease maintenance and contributions.
- **Reordered for interview preparation purpose:** Assuming that most readers come for this purpose, the content is reordered to be more friendly and easier to follow.
- **Serve with the help of GitHub pages:** To ease readability, navigation and maintainability the content is served with the help of GitHub pages.

Next steps:
- **Mermaid Diagrams:** Transitioning from static images to [Mermaid](https://mermaid-js.github.io/mermaid/#/) diagrams for system representations, facilitating easier modifications and better integration with generative tools.
- **Enhance and Automate Translations:** Internationalization is a major strength of the Primer, but many translations are incomplete or outdated relative to the English content. This phase will modernize the translation workflow with AI assistance and better community processes.
- **Add some fair use content from books:**
  e.g. 
   - *System Design Interview – An insider's guide* - Alex Xu
   - *Designing Distributed Systems: Patterns and Paradigms for Scalable, Reliable Systems Using Kubernetes 2nd Edition* - Brendan Burns
- **Use GenAI to improve the content:** ideas like adding external links summarizer tool, adding GenAI generated updated content to the repo, replace images with mermaid diagrams, adding CI/CD to fix spelling, grammar and create translations or at least translations draft to ease the maintenance.
- **Replace the old Anki cards with modern alternatives:** Regardless to fact that the Anki cardss were not updated with the content, Anki’s old SM‑2 scheduler feels obsolete now that modern platforms like Readwise Reader, RemNote, SuperMemo 19, Quizlet’s Learning Assistant and Duolingo’s adaptive drills use machine‑learning engines—e.g., the FSRS probabilistic scheduler, half‑life regression and deep‑knowledge‑tracing neural nets—that fine‑tune intervals in real time, generate richer, context‑aware prompts, and sync seamlessly across devices, giving learners measurably better retention with less repetitive effort.
- **Deployable Examples:** Ready-to-use implementations that can be deployed using Docker, allowing users to experiment with real-world scenarios in cloud environments.
- **Many more:** starting the journey towards **self improving interactive course and interview simulator**. with the help of gen-ai tools and the community we can make this repo a living document that every learner can use and contribute to - kind of self improving personalized course :-).

## Open questions

- **How to handle the translations of the content?** 
It seems that translations of the content in the original repo were never up to date for all languages.
There are 2 options:
-- Remove all translations and keep only English, guide the readers how to use google translate or other tools to translate the content on the fly.
-- Keep the translations and update them when needed in a better way. For example by using gen-ai to do the heavy lifting of the translations and keep the translations in dedicated branches (each one for a language + English to be able to track the last versions that was translated).

- **What learning platform (e.g. [remnote](https://www.remnote.com/)) to use to help memorizing the content (instead of the old Anki)?**
- **How to attract the community to move from the old repo to this update effort?**
- **How to make this repo a self improving personalized course?**


## Repository Structure 
To maintain clarity and focus, the repository structure will be changed to match the new content and the new vision gradually:

The original repo structure was:
- *README.md:* The main content of the repo as a monolithic file.
- *CONTRIBUTING.md:* The contributing guide of the repo.
- *LICENSE.txt:* The license of the repo.
- *TRANSLATIONS.md:* The translations guide for the repo.
- *README-xx-YY.md:* Specific translation of the main content.
- **images/**: images that were used to illustrate the original content.
- **resources/**: learning resources, used to guide the learning and practice the content (Anki Cards, etc.). 
- **solutions/**: Some solutions to the problems described in the content.


### New repo structure - WIP

- *README.md:* Provides an overview of the project, its motivations, and key features.
- *CONTRIBUTING.md:* The contributing guide of the repo.
- *LICENSE.md:* The license of the repo.
- *TRANSLATIONS.md:* The translations guide for the repo.
- *README-xx-YY.md:* Specific translation of the main content.
- **images/**: Contains images that were used to illustrate the original content.
- **resources/**: Contains the original resources from the original repo that were used to practice the content. 
- **solutions/**: Some solutions to the problems described in the content..
- **mermaid/**: mermaid diagrams for the content.
- **deployments/**: TBA - Includes Docker and k8s configurations and deployment scripts for hands-on experimentation with system implementations.

## Contributing

We welcome contributions that align with our mission to provide dynamic, interactive, and insightful system design resources. Whether it's enhancing existing tools, adding new AI-generated solutions, or improving documentation, your input is valued.

## How to contribute

- **Create awareness:** If you find the vision interesting, **please star this repo** and publish it in social media. 
- **Report issues:** If you find any issues or broken links, please report them in the [issues section](https://github.com/ido777/system-design-primer-update/issues).
- **Suggest improvements:** If you have ideas for improvements, please share them in the [discussions section](https://github.com/ido777/system-design-primer-update/discussions).
- **Submit PRs:** If you want to contribute code, please create a [pull request](https://github.com/ido777/system-design-primer-update/pulls).

## License and Attribution

This current content of project is based on the [System Design Primer](https://github.com/donnemartin/system-design-primer) by Donne Martin, licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](http://creativecommons.org/licenses/by/4.0/). 

All modifications and additions in [System Design Primer Update](https://github.com/ido777/system-design-primer-update) are made in the spirit of open collaboration and innovation and for now are licensed under the same license as the original content but this might change in the future.

