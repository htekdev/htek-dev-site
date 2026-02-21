# Fact Sheet: Top 5 Mistakes When Creating Custom Agents for GitHub Copilot

**Extracted:** February 16, 2026  
**Sources analyzed:** 35+  
**Target article:** "Top 5 Mistakes When Creating Custom Agents for GitHub Copilot" by Hector Flores (@htekdev)

---

## Theme: Mistake #1 — Over-engineering Agent Instructions

### Fact 1.1: GitHub Copilot Custom Agent Prompt Size Limit
- **Statement:** Custom agent prompts in GitHub Copilot can contain a maximum of 30,000 characters in the Markdown content below the YAML frontmatter.
- **Classification:** Hard Fact
- **Credibility:** Official documentation (peer-reviewed equivalent for product docs)
- **Source:** https://docs.github.com/en/copilot/reference/custom-agents-configuration — GitHub Docs, Official, 2026
- **Relationships:** Establishes the technical constraint; contradicts the misconception that "more detail is always better"
- **Notes:** This is a hard limit on the `.agent.md` file body, not including YAML frontmatter

### Fact 1.2: Claude Prompting Best Practice - Be Explicit
- **Statement:** Claude's official prompting guide states "Claude responds well to clear, explicit instructions. Being specific about your desired output can help enhance results."
- **Classification:** Expert Opinion
- **Credibility:** Official vendor documentation
- **Source:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices — Anthropic Claude Docs, 2025
- **Relationships:** Supports clarity over verbosity; balances Fact 1.3
- **Notes:** Distinction between "explicit" and "verbose" is critical

### Fact 1.3: Prompt Engineering Anti-Pattern - Verbosity
- **Statement:** Research on prompt engineering in 2025 indicates that "Eliminating unnecessary words and making your prompts more succinct can generate equally good, if not better, outcomes while being more cost-effective."
- **Classification:** Industry Trend
- **Credibility:** Industry analysis and practical testing
- **Source:** https://www.nikmalykhin.com/p/does-more-powerful-ai-mean-slower — Nik Malykhin, August 2025
- **Relationships:** Contradicts "more detail = better results" assumption
- **Notes:** Particularly relevant for token costs and context window optimization

### Fact 1.4: Context Rot in AI Systems
- **Statement:** Research shows a "general context rot effect in large language models (LLMs): as you feed in more tokens, the model's ability to accurately recall needed information diminishes."
- **Classification:** Expert Opinion (research-backed)
- **Credibility:** Industry research on LLM behavior
- **Source:** https://medium.com/ai-pace/context-engineering-mitigating-context-rot-in-ai-systems-21eb2c43dd18 — Ritvik Shyam (TCS Pace), November 2025
- **Relationships:** Supports limiting instruction length; technical explanation for why verbosity hurts
- **Notes:** "Context rot" occurs from poor quality AND quantity of context

### Fact 1.5: VS Code Custom Agent Instruction Structure
- **Statement:** VS Code custom agents use Markdown files with YAML frontmatter that "prepended to the user chat prompt" when the agent is selected.
- **Classification:** Hard Fact
- **Credibility:** Official documentation
- **Source:** https://code.visualstudio.com/docs/copilot/customization/custom-agents — VS Code Docs, February 2026
- **Relationships:** Explains how instructions are applied; informs optimal structure
- **Notes:** Instructions are prepended, not replaced, so context accumulates

### Fact 1.6: Prompt Compression Strategy
- **Statement:** Advanced prompt engineering in 2025 recommends "prompt compression" techniques where unnecessary words are eliminated while maintaining clarity, as "LLMs process input based on probabilistic calculations" making conciseness valuable.
- **Classification:** Expert Opinion
- **Credibility:** Industry best practices
- **Source:** https://gist.ly/youtube-summarizer/mastering-prompt-compression-the-lazy-and-technical-methods — Adam S., November 2024
- **Relationships:** Practical technique to avoid Mistake #1
- **Notes:** Compression doesn't mean removing clarity; it means removing redundancy

---

## Theme: Mistake #2 — Not Scoping Agent Responsibilities Properly

### Fact 2.1: GitHub Custom Agents Definition
- **Statement:** "Custom agents are specialized versions of Copilot coding agent that you can tailor to your unique workflows, coding conventions, and use cases. They act like tailored teammates that follow your standards, use the right tools, and implement team-specific practices."
- **Classification:** Hard Fact (product definition)
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents — GitHub Docs, Official
- **Relationships:** Defines the purpose; "specialized" implies focused scope
- **Notes:** Key phrase: "specialized versions" not "general-purpose replacements"

### Fact 2.2: Single Responsibility Principle for AI Agents
- **Statement:** Research on AI agent patterns published in December 2025 by EPAM states: "Single-responsibility agents follow the principle that each agent should have one clearly defined purpose. This makes agents easier to test, maintain, and reason about."
- **Classification:** Expert Opinion
- **Credibility:** Industry research from enterprise consulting firm
- **Source:** https://www.epam.com/insights/ai/blogs/single-responsibility-agents-and-multi-agent-workflows — EPAM, December 2025
- **Relationships:** Extends software engineering SRP to AI agents
- **Notes:** Published December 31, 2025 — very recent industry guidance

### Fact 2.3: Multi-Agent vs Single-Agent Decision Framework
- **Statement:** Microsoft's Cloud Adoption Framework states: "Single‑agent systems consolidate all logic into a single agent. This approach simplifies implementation, reduces operational overhead, and offers a more predictable execution model" but "Multi‑agent systems divide responsibilities across multiple specialized agents. This enables modularity, clearer separation of concerns, and improved scalability."
- **Classification:** Expert Opinion
- **Credibility:** Official Microsoft guidance for enterprise
- **Source:** https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai-agents/single-agent-multiple-agents — Microsoft Learn, December 2025
- **Relationships:** Provides decision criteria; supports modular design
- **Notes:** Emphasizes trade-offs, not absolutes

### Fact 2.4: Agent Orchestration Pattern
- **Statement:** VS Code custom agents support a "Feature Builder" pattern where a coordinating agent uses the `agents` property to restrict which specialized subagents can be invoked, enabling "research-then-implement" workflows.
- **Classification:** Hard Fact (feature documentation)
- **Credibility:** Official documentation with examples
- **Source:** https://code.visualstudio.com/docs/copilot/customization/custom-agents — VS Code Docs, February 2026
- **Relationships:** Demonstrates proper multi-agent composition
- **Notes:** Example shows Researcher (read-only) + Implementer (edit) pattern

### Fact 2.5: Tool Scoping in Custom Agents
- **Statement:** GitHub custom agents support tool restriction via the `tools` property: "Disable all tools: Use an empty list (`tools: []`); Enable specific tools: Provide a list of specific tool names; Enable all available tools: Omit the `tools` property."
- **Classification:** Hard Fact
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/reference/custom-agents-configuration — GitHub Docs, 2026
- **Relationships:** Mechanism for enforcing agent scope; prevents scope creep
- **Notes:** Tools available: execute, read, edit, search, agent, web, todo, plus MCP servers

### Fact 2.6: Multi-Agent System Complexity Warning
- **Statement:** Industry analysis from January 2026 warns: "Every additional agent introduces message passing, state management, and new failure modes. Those costs compound non-linearly. This is why I push architects to start with the smallest viable control plane and justify every step away from it."
- **Classification:** Expert Opinion
- **Credibility:** Field experience from system architects
- **Source:** https://agentsarcade.com/blog/choosing-single-agent-vs-multi-agent-architectures — Majid Sheikh, January 2026
- **Relationships:** Cautions against over-composition; balances Fact 2.3
- **Notes:** Key insight: coordination costs are non-linear

### Fact 2.7: GitHub Best Practice - Well-Scoped Tasks
- **Statement:** GitHub's official best practices state: "GitHub Copilot provides better results when assigned clear, well-scoped tasks. An ideal task includes: Directions about which files need to be changed, Complete acceptance criteria, A clear description of the problem to be solved."
- **Classification:** Expert Opinion (vendor best practice)
- **Credibility:** Official GitHub guidance
- **Source:** https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results — GitHub Docs, 2025
- **Relationships:** Applies to both agents and tasks; reinforces scoping importance
- **Notes:** "Think of the issue you assign to Copilot as a prompt"

### Fact 2.8: Custom Agent Example - Testing Specialist
- **Statement:** GitHub's official custom agent examples include a "Testing Specialist" that "Focuses on test coverage, quality, and testing best practices without modifying production code" with explicit instruction: "Focus only on test files and avoid modifying production code unless specifically requested."
- **Classification:** Hard Fact (official example)
- **Credibility:** Official documentation example
- **Source:** https://docs.github.com/en/copilot/reference/custom-agents-configuration — GitHub Docs, 2026
- **Relationships:** Demonstrates narrow scope in practice
- **Notes:** Shows how to explicitly limit scope in instructions

---

## Theme: Mistake #3 — Ignoring Context Window Limits

### Fact 3.1: GPT-4o Context Window
- **Statement:** GPT-4o and GPT-4 Turbo both have a context window of 128,000 tokens.
- **Classification:** Hard Fact
- **Credibility:** Official model specifications
- **Source:** https://www.tokentally.co/blog/context-window-explained — Token Counter, April 2025
- **Relationships:** Sets the technical boundary for GitHub Copilot context
- **Notes:** This is input + output combined; 1 token ≈ 0.75 words in English

### Fact 3.2: Claude 3 Opus Context Window
- **Statement:** Claude 3 Opus, Claude Sonnet 3.7, and Claude Haiku 3.5 provide 200,000 token context windows.
- **Classification:** Hard Fact
- **Credibility:** Official model specifications
- **Source:** https://codingscape.com/blog/llms-with-largest-context-windows — Codingscape, September 2025
- **Relationships:** Alternative model option for larger contexts
- **Notes:** Anthropic models used by some GitHub Copilot features

### Fact 3.3: GPT-5 Models Context Window
- **Statement:** OpenAI's GPT-5 models deliver 400,000 token context windows with a "notably large 128K output window," featuring "improved reasoning capabilities and enhanced long-context performance for agentic tasks."
- **Classification:** Hard Fact
- **Credibility:** Official model specifications
- **Source:** https://codingscape.com/blog/llms-with-largest-context-windows — Codingscape, September 2025
- **Relationships:** Future/current state for advanced Copilot features
- **Notes:** Emphasizes "agentic tasks" specifically benefit from larger windows

### Fact 3.4: Token Limit Failure Pattern
- **Statement:** A GitHub Community discussion from November 2025 reports users experiencing "token-limit failures" with Copilot Cloud Agent despite inputs being "far below the stated token limit," with one user stating they "had to start new chats and reinsert the full context, which is quite inefficient."
- **Classification:** Claim (user-reported issue)
- **Credibility:** Community discussion; not officially confirmed
- **Source:** https://github.com/orgs/community/discussions/180198 — GitHub Community, November 2025
- **Relationships:** Real-world manifestation of context issues; flags issue with context management
- **Notes:** Suggests effective limit may be lower than theoretical maximum

### Fact 3.5: Context Window Optimization Necessity
- **Statement:** Research on LLM context window optimization states: "LLM context window optimization isn't just about squeezing more tokens into a prompt—it's about strategically managing what information your model sees and when."
- **Classification:** Expert Opinion
- **Credibility:** Industry best practices
- **Source:** https://reintech.io/blog/llm-context-window-optimization-strategies-long-document-processing — Arthur C. Codex, December 2025
- **Relationships:** Strategy for working within limits; supports Fact 3.9
- **Notes:** Emphasizes strategic selection over brute-force inclusion

### Fact 3.6: Top Techniques for Context Management
- **Statement:** Industry guides identify six primary techniques for managing context length in LLMs: truncation, RAG (Retrieval-Augmented Generation), memory buffering, compression, summarization, and streaming.
- **Classification:** Industry Trend
- **Credibility:** Aggregated best practices
- **Source:** https://agenta.ai/blog/top-6-techniques-to-manage-context-length-in-llms — Agenta.ai, date unknown
- **Relationships:** Practical toolkit for avoiding Mistake #3
- **Notes:** Each technique has specific use cases

### Fact 3.7: Token-to-Character Ratio
- **Statement:** In English, each token averages about 4 characters or 0.75 words.
- **Classification:** Hard Fact (statistical)
- **Credibility:** Widely documented industry standard
- **Source:** https://unstructured.io/insights/choosing-the-right-llm-a-guide-to-context-window-sizes — Unstructured, January 2025
- **Relationships:** Conversion factor for estimating token usage from character count
- **Notes:** Useful for relating GitHub's 30,000 character limit to token consumption

### Fact 3.8: GitHub Copilot Chat Token Limit Issue
- **Statement:** Users report that GitHub Copilot Chat has an easily reached token limit that causes failures. One Microsoft Q&A discussion notes confusion over character limits: "The one on the LEFT is in PURPLE, and says 4,000 character limit."
- **Classification:** Claim (user-reported)
- **Credibility:** User community discussion
- **Source:** https://learn.microsoft.com/en-us/answers/questions/5321232/copilot-pro-prompt-character-limit — Microsoft Q&A, April 2024
- **Relationships:** User experience of context limits
- **Notes:** Suggests inconsistent or unclear limit communication

### Fact 3.9: Context Window as Working Memory
- **Statement:** Industry analysis describes context windows as "the amount of text (measured in tokens) that a language model can 'see' and consider at any given time. It represents the model's working memory—all the information it can access when generating a response."
- **Classification:** Hard Fact (technical definition)
- **Credibility:** Industry standard definition
- **Source:** https://www.tokentally.co/blog/context-window-explained — Token Counter, April 2025
- **Relationships:** Conceptual framework for understanding the constraint
- **Notes:** "Working memory" metaphor helps explain why exceeding limits causes failures

### Fact 3.10: GPT-5.1 Context Efficiency Improvements
- **Statement:** OpenAI's GPT-5.1 prompting guide states the model is "better calibrated to prompt difficulty, consuming far fewer tokens on easy inputs and more efficiently handling challenging ones," addressing token efficiency for agentic tasks.
- **Classification:** Hard Fact (vendor specification)
- **Credibility:** Official OpenAI documentation
- **Source:** https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-1_prompting_guide/ — OpenAI Developers, date unknown
- **Relationships:** Shows model evolution addressing context efficiency
- **Notes:** Relevant for understanding future improvements

---

## Theme: Mistake #4 — Skipping Real-World Testing

### Fact 4.1: Anthropic Agent Evaluation Framework
- **Statement:** Anthropic's engineering team published in January 2026 that "Good evaluations help teams ship AI agents more confidently. Without them, it's easy to get stuck in reactive loops—catching issues only in production, where fixing one failure creates others."
- **Classification:** Expert Opinion
- **Credibility:** Tier-1 AI company engineering guidance
- **Source:** https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents — Anthropic Engineering, January 2026
- **Relationships:** Establishes why testing matters; defines the problem
- **Notes:** Published January 9, 2026 — cutting-edge guidance

### Fact 4.2: Agent Testing Complexity
- **Statement:** Anthropic states: "The capabilities that make agents useful—autonomy, intelligence, and flexibility—also make them harder to evaluate" because agents "operate over many turns: calling tools, modifying state, and adapting based on intermediate results."
- **Classification:** Expert Opinion
- **Credibility:** Technical analysis from leading AI company
- **Source:** https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents — Anthropic Engineering, January 2026
- **Relationships:** Explains WHY testing is challenging for agents vs traditional software
- **Notes:** Multi-turn behavior makes deterministic testing insufficient

### Fact 4.3: Behavioral Validation vs Execution Checks
- **Statement:** Industry analysis from November 2025 states: "Scripts built for deterministic code simply ask, 'Did this function run?'—never, 'Was it the right function to run right now?' AI agent outputs don't follow strict rules. The same prompt can trigger multiple valid—or disastrously invalid—responses."
- **Classification:** Expert Opinion
- **Credibility:** Industry thought leadership on AI testing
- **Source:** https://galileo.ai/learn/ai-observability/ai-agent-testing-behavioral-validation — Galileo AI, November 2025
- **Relationships:** Distinguishes agent testing from traditional QA
- **Notes:** "Behavioral validation" is the key term

### Fact 4.4: Pass^k Testing Methodology
- **Statement:** A practical guide to AI agent testing from October 2025 recommends "a diverse set of testing and evaluation methodologies with a pass^k mindset (rerun critical tests multiple times) to avoid false confidence" due to non-determinism.
- **Classification:** Expert Opinion
- **Credibility:** Industry best practice from production systems
- **Source:** https://cresta.com/blog/when-to-use-what-a-practical-guide-to-ai-agent-testing-and-evaluation — Cresta, October 2025
- **Relationships:** Practical technique addressing non-determinism
- **Notes:** "pass^k" = run k times, check for consistency

### Fact 4.5: Edge Case Testing for AI Agents
- **Statement:** Research on edge case testing states: "With the recent advances in artificial intelligence (AI) and its accompanying tooling, it is being increasingly applied to edge-case testing to help resolve these previously unseen risks. Although test automation improves baseline reliability, most test suites are constrained by predefined inputs and assumptions, leaving the system vulnerable in rare, unpredictable, or complex scenarios."
- **Classification:** Industry Trend
- **Credibility:** Testing industry analysis
- **Source:** https://testrigor.com/blog/what-are-edge-test-cases/ — testRigor (Shilpa Prabhudesai), November 2025
- **Relationships:** Importance of edge case coverage
- **Notes:** AI can help generate edge cases, but agents themselves need edge case testing

### Fact 4.6: Testing Practices in Open Source AI Agents
- **Statement:** An empirical study from September 2025 analyzing open-source AI agent frameworks found "limited understanding of how developers verify the internal correct" functioning of agents, revealing a gap in testing practices across the industry.
- **Classification:** Expert Opinion (research finding)
- **Credibility:** Academic research on industry practices
- **Source:** https://arxiv.org/html/2509.19185v2 — Mohammed Mehedi Hasan et al (Queen's University), September 2025
- **Relationships:** Documents widespread lack of testing discipline
- **Notes:** Suggests testing is a known gap industry-wide

### Fact 4.7: Prompt-Driven Testing Approach
- **Statement:** Hitachi Solutions UK describes a "prompt-driven testing approach designed to validate AI agents for accuracy, compliance, consistency, and user trust," emphasizing that "traditional testing methods are not enough for AI-driven systems."
- **Classification:** Expert Opinion
- **Credibility:** Enterprise consulting guidance
- **Source:** https://www.hitachi-solutions.co.uk/blog/2025/08/how-to-test-ai-agents-effectively-a-practical-guide-for-digital-solution/ — Hitachi Solutions, August 2025
- **Relationships:** Alternative testing methodology specific to AI agents
- **Notes:** Four validation criteria: accuracy, compliance, consistency, trust

### Fact 4.8: Evaluation Framework Requirements
- **Statement:** A comprehensive 2025-2026 guide to AI agent evaluations states: "Without a solid evaluation system, teams usually fall into the same reactive cycle: users complain → engineers reproduce the bug manually → a fix is shipped → something else quietly regresses → repeat."
- **Classification:** Industry Trend
- **Credibility:** Aggregated field experience
- **Source:** https://www.xugj520.cn/en/archives/ai-agent-evaluations-guide-2025.html — Efficient Coder, January 2026
- **Relationships:** Describes the failure mode when testing is skipped
- **Notes:** "Reactive cycle" is the anti-pattern to avoid

---

## Theme: Mistake #5 — Missing Error Handling and Graceful Degradation

### Fact 5.1: SHIELDA Framework for Exception Handling
- **Statement:** Research published in August 2025 introduces SHIELDA (Structured Handling of Exceptions in LLM-Driven Agentic Workflows), noting that "During execution, these workflows frequently encounter exceptions. Existing exception handling solutions often treat exceptions superficially, failing to trace execution-phase exceptions to their reasoning-phase root causes."
- **Classification:** Expert Opinion (academic research)
- **Credibility:** Peer-reviewed research (CSIRO)
- **Source:** https://arxiv.org/abs/2508.07935 — Jingwen Zhou et al (CSIRO's Data61), August 2025
- **Relationships:** Identifies systematic gap in agent error handling
- **Notes:** Arxiv preprint; proposes structured escalation pathways

### Fact 5.2: LLM API Failure Event - December 12, 2024
- **Statement:** On December 12, 2024, "OpenAI went dark for four hours. Claude 3.5 Sonnet and Gemini Flash 1.5 were basically unusable" revealing that systems built without graceful degradation "collapsed entirely" while those "built for degradation? Barely anyone noticed."
- **Classification:** Hard Fact (documented incident)
- **Credibility:** Industry incident report
- **Source:** https://medium.com/@mota_ai/building-ai-that-never-goes-down-the-graceful-degradation-playbook-d7428dc34ca3 — MOTA AI, December 2025
- **Relationships:** Real-world demonstration of why error handling matters
- **Notes:** Major multi-provider outage on December 12, 2024

### Fact 5.3: Production-Ready Resilience Pattern
- **Statement:** A multi-layer resilience pattern case study from January 2026 reports: "Last month, our multi-agent system processed 2.3 million requests. 847 of those triggered cascading failures that took down the entire pipeline. That was before we implemented the resilience pattern... After? Zero cascade failures. 99.97% uptime."
- **Classification:** Personal Experience (case study)
- **Credibility:** Real-world implementation data
- **Source:** https://www.linkedin.com/pulse/building-production-ready-ai-agents-multi-layer-pattern-afolabi-iubme — LinkedIn post, January 2026
- **Relationships:** Quantifiable benefit of error handling
- **Notes:** Specific numbers: 847 failures eliminated, 99.97% uptime achieved

### Fact 5.4: Circuit Breaker Pattern for Agents
- **Statement:** Industry guidance on production-grade AI agents identifies "circuit breakers, exponential backoff, and timeout protection" as essential resilience mechanisms to handle "rate limits, latency spikes, malformed responses, and random 500 errors" which "are part of the territory."
- **Classification:** Expert Opinion
- **Credibility:** Production engineering best practices
- **Source:** https://dev.to/akshaygupta1996/production-grade-ai-agents-architecture-patterns-that-actually-work-19h — Akshay Gupta (DEV.to), November 2025
- **Relationships:** Specific technical patterns for resilience
- **Notes:** Adapted from traditional distributed systems patterns

### Fact 5.5: LLM-Friendly Error Messages
- **Statement:** Research on MCP server design emphasizes "LLM-Friendly Error Handling" where error messages are structured for AI consumption: "In traditional software development, an error is a signal for a human developer... But when our code fails in an MCP context, the consumer is an LLM—not a human."
- **Classification:** Expert Opinion
- **Credibility:** Technical design guidance
- **Source:** https://medium.com/@kumaran.isk/llm-friendly-error-handling-designing-mcp-servers-for-ai-df427f6dfd2f — Kumaran Srinivasan, January 2026
- **Relationships:** Novel consideration specific to AI agents
- **Notes:** Error messages need to help the LLM recover, not just humans

### Fact 5.6: Error Handling in Tool Execution
- **Statement:** Educational content on LLM agent tool execution identifies key error handling strategies: "Input validation, timeout management, retry logic, graceful degradation, and error message formatting" as critical for reliable agent systems.
- **Classification:** Industry Trend
- **Credibility:** Educational best practices
- **Source:** https://apxml.com/courses/building-advanced-llm-agent-tools/chapter-1-llm-agent-tooling-foundations/tool-error-handling — ApX Machine Learning, date unknown
- **Relationships:** Checklist of error handling requirements
- **Notes:** Covers both prevention and recovery

### Fact 5.7: 10 Best Practices for Reliable AI Agents
- **Statement:** A comprehensive guide from November 2025 lists "error handling, monitoring, testing, and security strategies that significantly reduce production incidents and improve system reliability" as the foundation for production AI agents.
- **Classification:** Expert Opinion
- **Credibility:** Aggregated industry best practices
- **Source:** https://vatsalshah.in/blog/10-best-practices-reliable-ai-agents — Vatsal Shah, November 2025
- **Relationships:** Holistic view including error handling as one of 10 practices
- **Notes:** Error handling is one of multiple interconnected reliability practices

### Fact 5.8: Fallback Strategy Pattern
- **Statement:** The graceful degradation playbook describes fallback strategies: "When LLM APIs fail, systems need fallback mechanisms like switching to cached responses, using simpler models, or providing manual override options to keep operations running."
- **Classification:** Expert Opinion
- **Credibility:** Industry design patterns
- **Source:** https://medium.com/@mota_ai/building-ai-that-never-goes-down-the-graceful-degradation-playbook-d7428dc34ca3 — MOTA AI, December 2025
- **Relationships:** Specific techniques for graceful degradation
- **Notes:** Emphasizes keeping system partially operational vs total failure

---

## Theme: General GitHub Copilot Agent Resources & Architecture

### Fact G.1: GitHub Copilot Extensions Architecture
- **Statement:** GitHub Copilot Extensions support two modes of extending capabilities: "Skillsets are lightweight and streamlined, designed for developers who need Copilot" integration vs "agents" which offer "different levels of control and complexity."
- **Classification:** Hard Fact (product architecture)
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/how-tos/build-copilot-extensions/setting-up-copilot-extensions — GitHub Docs, August 2025
- **Relationships:** Framework context for understanding custom agents
- **Notes:** Skillsets vs Agents is architectural decision point

### Fact G.2: Model Context Protocol (MCP) Integration
- **Statement:** "The Model Context Protocol (MCP) is an open standard that defines how applications share context with large language models (LLMs). MCP provides a standardized way to connect AI models to different data sources and tools."
- **Classification:** Hard Fact (protocol definition)
- **Credibility:** Official specification
- **Source:** https://docs.github.com/en/copilot/concepts/about-mcp — GitHub Docs, Official
- **Relationships:** Extension mechanism for custom agents
- **Notes:** MCP is open standard from Anthropic, adopted by GitHub

### Fact G.3: MCP Server Availability for Custom Agents
- **Statement:** GitHub custom agents can access "out-of-the-box" MCP servers including the GitHub MCP server (read-only tools scoped to source repository) and Playwright MCP server (localhost-only access by default).
- **Classification:** Hard Fact
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/reference/custom-agents-configuration — GitHub Docs, 2026
- **Relationships:** Available tooling for custom agents
- **Notes:** Repository admins can configure additional MCP servers

### Fact G.4: Custom Agent File Format
- **Statement:** Custom agents are defined as "Markdown files called agent profiles" using `.agent.md` extension with YAML frontmatter containing properties like `name`, `description`, `tools`, and `mcp-servers`, followed by the agent's behavior instructions in Markdown.
- **Classification:** Hard Fact
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents — GitHub Docs, Official
- **Relationships:** File format specification
- **Notes:** Simple Markdown + YAML, accessible to all developers

### Fact G.5: Custom Agent Deployment Locations
- **Statement:** Custom agents can be defined at three levels: "Organization or enterprise level: Create `/agents/CUSTOM-AGENT-NAME.md` in a `.github-private` repository; Repository level: Create `.github/agents/CUSTOM-AGENT-NAME.md` in your repository."
- **Classification:** Hard Fact
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents — GitHub Docs, Official
- **Relationships:** Deployment architecture
- **Notes:** Hierarchical override: repo > org > enterprise

### Fact G.6: Agent Mode Announcement
- **Statement:** GitHub announced agent mode in May 2025 as "a step toward building GitHub Copilot into a system that not only works with you, but works for you" where "Copilot's agent mode works to execute it on your behalf, automating processes and workflows."
- **Classification:** Hard Fact (product announcement)
- **Credibility:** Official GitHub blog
- **Source:** https://github.blog/ai-and-ml/github-copilot/agent-mode-101-all-about-github-copilots-powerful-mode/ — GitHub Blog (Alexandra Lietzke), May 2025
- **Relationships:** Context for when custom agents became available
- **Notes:** Agent mode is GA as of May 2025

### Fact G.7: Awesome Copilot Community Repository
- **Statement:** The community-maintained github/awesome-copilot repository contains "Community-contributed instructions, prompts, and configurations" with 21,262 stars, 2,428 forks, and 230 contributors as of February 2026.
- **Classification:** Hard Fact
- **Credibility:** GitHub repository statistics
- **Source:** https://github.com/github/awesome-copilot — GitHub Repository
- **Relationships:** Community resource for examples
- **Notes:** Very active community; useful for learning patterns

### Fact G.8: Custom Instructions vs Custom Agents
- **Statement:** GitHub documentation distinguishes: "While custom instructions help guide Copilot's general behavior across your repository, custom agents create entirely specialized agents with focused expertise and tailored tool configurations."
- **Classification:** Hard Fact (product distinction)
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results — GitHub Docs, 2025
- **Relationships:** Helps developers choose right tool
- **Notes:** Instructions = broad guidance; Agents = specialized personas

### Fact G.9: Handoff Pattern in VS Code
- **Statement:** VS Code custom agents support "handoffs to create guided workflows between agents. Transition seamlessly from one specialized agent to another with a single select" using the `handoffs` property in YAML frontmatter.
- **Classification:** Hard Fact (feature specification)
- **Credibility:** Official documentation
- **Source:** https://code.visualstudio.com/docs/copilot/customization/custom-agents — VS Code Docs, February 2026
- **Relationships:** Multi-agent orchestration pattern
- **Notes:** Example: Planning → Implementation → Review workflow

### Fact G.10: Custom Agent Inference Control
- **Statement:** The `infer` property (boolean) in agent profiles "Controls whether Copilot coding agent can automatically use this custom agent based on task context. When `false`, the agent must be manually selected. If unset, defaults to `true`."
- **Classification:** Hard Fact
- **Credibility:** Official documentation
- **Source:** https://docs.github.com/en/copilot/reference/custom-agents-configuration — GitHub Docs, 2026
- **Relationships:** Control mechanism for agent invocation
- **Notes:** Allows creating "internal use only" agents not auto-suggested

---

## Contradictions & Flags

| Facts | Issue | Recommendation |
|-------|-------|----------------|
| Fact 1.2 vs Fact 1.3 | "Be explicit" could be misinterpreted as "be verbose" | Clarify distinction: explicit = clear, not necessarily long |
| Fact 3.1-3.3 vs Fact 3.4 | Official token limits vs user-reported failures | Investigate effective vs theoretical limits; mention context accumulation |
| Fact 2.3 vs Fact 2.6 | Multi-agent benefits vs complexity costs | Present as trade-off requiring careful analysis, not absolute choice |
| Fact 4.6 | Research shows testing gap across industry | This validates that Mistake #4 is widespread, not just individual failing |

---

## Source Summary

| # | URL | Author/Org | Date | Type | Facts Extracted |
|---|-----|------------|------|------|-----------------|
| 1 | https://docs.github.com/en/copilot/reference/custom-agents-configuration | GitHub Docs | 2026 | Official Docs | 6 |
| 2 | https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents | GitHub Docs | 2026 | Official Docs | 4 |
| 3 | https://code.visualstudio.com/docs/copilot/customization/custom-agents | VS Code Docs | Feb 2026 | Official Docs | 3 |
| 4 | https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results | GitHub Docs | 2025 | Official Docs | 2 |
| 5 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices | Anthropic | 2025 | Official Docs | 1 |
| 6 | https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents | Anthropic Eng | Jan 2026 | Engineering Blog | 3 |
| 7 | https://arxiv.org/abs/2508.07935 | CSIRO Data61 | Aug 2025 | Research Paper | 1 |
| 8 | https://www.epam.com/insights/ai/blogs/single-responsibility-agents-and-multi-agent-workflows | EPAM | Dec 2025 | Industry Analysis | 1 |
| 9 | https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai-agents/single-agent-multiple-agents | Microsoft Learn | Dec 2025 | Framework Guide | 1 |
| 10 | https://agentsarcade.com/blog/choosing-single-agent-vs-multi-agent-architectures | Agents Arcade | Jan 2026 | Industry Analysis | 1 |
| 11 | https://codingscape.com/blog/llms-with-largest-context-windows | Codingscape | Sep 2025 | Technical Article | 2 |
| 12 | https://www.tokentally.co/blog/context-window-explained | Token Counter | Apr 2025 | Technical Guide | 2 |
| 13 | https://unstructured.io/insights/choosing-the-right-llm-a-guide-to-context-window-sizes | Unstructured | Jan 2025 | Technical Guide | 1 |
| 14 | https://agenta.ai/blog/top-6-techniques-to-manage-context-length-in-llms | Agenta.ai | Unknown | Technical Guide | 1 |
| 15 | https://reintech.io/blog/llm-context-window-optimization-strategies-long-document-processing | Reintech | Dec 2025 | Technical Article | 1 |
| 16 | https://github.com/orgs/community/discussions/180198 | GitHub Community | Nov 2025 | Community | 1 |
| 17 | https://learn.microsoft.com/en-us/answers/questions/5321232/copilot-pro-prompt-character-limit | Microsoft Q&A | Apr 2024 | Community | 1 |
| 18 | https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-1_prompting_guide/ | OpenAI Docs | Unknown | Official Docs | 1 |
| 19 | https://galileo.ai/learn/ai-observability/ai-agent-testing-behavioral-validation | Galileo AI | Nov 2025 | Technical Guide | 1 |
| 20 | https://cresta.com/blog/when-to-use-what-a-practical-guide-to-ai-agent-testing-and-evaluation | Cresta | Oct 2025 | Technical Guide | 1 |
| 21 | https://testrigor.com/blog/what-are-edge-test-cases/ | testRigor | Nov 2025 | Technical Article | 1 |
| 22 | https://arxiv.org/html/2509.19185v2 | Queen's U | Sep 2025 | Research Paper | 1 |
| 23 | https://www.hitachi-solutions.co.uk/blog/2025/08/how-to-test-ai-agents-effectively-a-practical-guide-for-digital-solution/ | Hitachi Solutions | Aug 2025 | Industry Guide | 1 |
| 24 | https://www.xugj520.cn/en/archives/ai-agent-evaluations-guide-2025.html | Efficient Coder | Jan 2026 | Technical Guide | 1 |
| 25 | https://medium.com/@mota_ai/building-ai-that-never-goes-down-the-graceful-degradation-playbook-d7428dc34ca3 | MOTA AI | Dec 2025 | Technical Article | 2 |
| 26 | https://www.linkedin.com/pulse/building-production-ready-ai-agents-multi-layer-pattern-afolabi-iubme | LinkedIn | Jan 2026 | Case Study | 1 |
| 27 | https://dev.to/akshaygupta1996/production-grade-ai-agents-architecture-patterns-that-actually-work-19h | DEV.to | Nov 2025 | Technical Article | 1 |
| 28 | https://medium.com/@kumaran.isk/llm-friendly-error-handling-designing-mcp-servers-for-ai-df427f6dfd2f | Medium | Jan 2026 | Technical Article | 1 |
| 29 | https://apxml.com/courses/building-advanced-llm-agent-tools/chapter-1-llm-agent-tooling-foundations/tool-error-handling | ApX ML | Unknown | Course Material | 1 |
| 30 | https://vatsalshah.in/blog/10-best-practices-reliable-ai-agents | Vatsal Shah | Nov 2025 | Technical Guide | 1 |
| 31 | https://github.blog/ai-and-ml/github-copilot/agent-mode-101-all-about-github-copilots-powerful-mode/ | GitHub Blog | May 2025 | Official Blog | 1 |
| 32 | https://github.com/github/awesome-copilot | GitHub Repo | Feb 2026 | Community Repo | 1 |
| 33 | https://medium.com/ai-pace/context-engineering-mitigating-context-rot-in-ai-systems-21eb2c43dd18 | TCS Pace | Nov 2025 | Technical Article | 1 |
| 34 | https://www.nikmalykhin.com/p/does-more-powerful-ai-mean-slower | Nik Malykhin | Aug 2025 | Technical Article | 1 |
| 35 | https://gist.ly/youtube-summarizer/mastering-prompt-compression-the-lazy-and-technical-methods | Gist.ly | Nov 2024 | Technical Guide | 1 |

---

## Key Statistics & Notable Findings

### Quantitative Data Points
- **30,000 characters**: Maximum prompt size for GitHub custom agents (Fact 1.1)
- **128,000 tokens**: Context window for GPT-4o/GPT-4 Turbo (Fact 3.1)
- **200,000 tokens**: Context window for Claude 3 Opus (Fact 3.2)
- **400,000 tokens**: Context window for GPT-5 models (Fact 3.3)
- **0.75 words/token**: Average English token-to-word ratio (Fact 3.7)
- **4 characters/token**: Average English token-to-character ratio (Fact 3.7)
- **99.97% uptime**: Achieved after implementing resilience patterns (Fact 5.3)
- **847 failures eliminated**: From implementing error handling (Fact 5.3)
- **21,262 stars**: GitHub awesome-copilot community repository (Fact G.7)

### Timeline of Key Developments
- **November 2024**: Anthropic releases Model Context Protocol (MCP)
- **December 12, 2024**: Major LLM API outage (OpenAI, Claude, Gemini) reveals importance of graceful degradation
- **May 2025**: GitHub announces agent mode for Copilot
- **August 2025**: SHIELDA framework for agent error handling published
- **January 2026**: Anthropic publishes comprehensive agent evaluation guide
- **February 2026**: VS Code adds extensive custom agent features including handoffs

### Emerging Patterns
1. **Shift from single to multi-agent**: Industry moving toward specialized, composed agents
2. **Testing gap**: Widespread lack of formal evaluation practices for AI agents
3. **Context optimization**: Focus shifting from "more context" to "right context"
4. **Error handling maturity**: Growing recognition that agents need resilience patterns
5. **Community knowledge sharing**: Rapid growth of shared agent patterns and examples

### Important Caveats
- Many sources are from late 2025/early 2026 - this is cutting-edge, evolving guidance
- Some user-reported issues (token limits, failures) not officially confirmed by vendors
- Testing methodologies for agents still emerging; no industry standard yet
- Multi-agent coordination costs "compound non-linearly" (Fact 2.6) - be cautious

---

## Research Quality Assessment

**Strongest Evidence Categories:**
1. Official documentation (GitHub, VS Code, Anthropic, OpenAI)
2. Academic research (CSIRO, Queen's University)
3. Real-world incident reports (December 12, 2024 outage)

**Weakest Evidence Categories:**
1. Community forum discussions (unverified claims)
2. Blog posts without cited sources
3. Generic "best practices" without empirical backing

**Missing Evidence:**
- Official GitHub statistics on agent success/failure rates
- Comparative studies of instruction length vs agent performance
- Quantitative analysis of optimal agent scope
- Industry-wide benchmarks for agent testing coverage

**Recommended Additional Research:**
- GitHub Universe 2025 talks on custom agents (if available)
- Anthropic's full research papers on agent evaluation
- OpenAI's internal guidelines for GPT-5 agentic applications
- Microsoft's AI agent case studies from enterprise deployments
