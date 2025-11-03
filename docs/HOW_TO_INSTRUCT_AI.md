# How to Instruct an AI to Work Like Claude Code

## Executive Summary

This guide teaches you **exactly how to instruct ANY AI** (Claude, GPT-4, etc.) to use the sophisticated "vibe coding" methodology that Claude Code uses internally. Follow these patterns, and your AI will work systematically, intelligently, and deliver better results.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Step-by-Step Instruction Templates](#step-by-step-instruction-templates)
3. [Task Decomposition Framework](#task-decomposition-framework)
4. [Dependency Management Patterns](#dependency-management-patterns)
5. [Progress Tracking System](#progress-tracking-system)
6. [Error Recovery Strategies](#error-recovery-strategies)
7. [Real-World Examples](#real-world-examples)
8. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)

---

## Core Philosophy

### The 6 Pillars of Intelligent AI Work

```
1. DECOMPOSE FIRST
   "Break this down into clear, atomic steps before starting"

2. ANALYZE DEPENDENCIES
   "What must happen before what? Build a dependency graph"

3. EXECUTE IN PARALLEL
   "Run independent tasks simultaneously for speed"

4. RECOVER GRACEFULLY
   "Retry failures with exponential backoff, never give up early"

5. CACHE & REUSE
   "Don't regenerate what you've already built"

6. TRACK EVERYTHING
   "Update status in real-time, show progress constantly"
```

---

## Step-by-Step Instruction Templates

### Template 1: For Complex Multi-Step Tasks

```
📋 INSTRUCTION TO AI:

"I need you to [TASK DESCRIPTION].

Before you start coding, follow these steps:

1. DECOMPOSE THE TASK
   - Break this into 5-10 clear, atomic subtasks
   - List each subtask with a clear success criterion
   - Number them and create a checklist

2. ANALYZE DEPENDENCIES
   - For each subtask, identify:
     * What it depends on (prerequisites)
     * What depends on it (dependents)
   - Build a dependency graph
   - Flag any circular dependencies

3. CREATE EXECUTION PLAN
   - Group independent tasks that can run in parallel
   - Order dependent tasks sequentially
   - Estimate time for each subtask

4. EXECUTE WITH TRACKING
   - Mark each task as PENDING → IN_PROGRESS → COMPLETED
   - Update status immediately after each step
   - Log errors with full context

5. VALIDATE & ITERATE
   - Test each completed subtask
   - If errors occur, retry with exponential backoff:
     * Attempt 1: immediate
     * Attempt 2: wait 2s
     * Attempt 3: wait 4s
     * Attempt 4: wait 8s
   - Only give up after 3-4 retries

Show your work at each step. Start with step 1 now."
```

### Template 2: For Bug Fixes

```
📋 INSTRUCTION TO AI:

"There's a bug: [BUG DESCRIPTION]

Follow this systematic debugging process:

1. GATHER CONTEXT (Parallel)
   - Read the affected file(s)
   - Search for similar patterns in the codebase
   - Check recent git history for related changes
   - Run ALL these searches in parallel, not sequentially

2. REPRODUCE & DIAGNOSE
   - Identify the exact failure point
   - Determine root cause (not just symptoms)
   - List all affected areas

3. PLAN THE FIX
   - Break the fix into steps
   - Identify dependencies between fix steps
   - Estimate impact of each change

4. IMPLEMENT WITH VALIDATION
   - Make the smallest possible change first
   - Test after each change
   - If test fails, retry with refinements
   - Don't move to next step until current step passes

5. VERIFY COMPLETELY
   - Run full test suite
   - Check for regression in related areas
   - Document the fix

Mark each step as you complete it. Start with step 1 now."
```

### Template 3: For New Feature Development

```
📋 INSTRUCTION TO AI:

"Build a new feature: [FEATURE DESCRIPTION]

Use this workflow:

1. RESEARCH PHASE (Parallel Context Gathering)
   Simultaneously:
   - Search for existing similar features
   - Find related components/files
   - Check dependencies and libraries
   - Review design patterns used in codebase

2. DESIGN PHASE
   Create a clear plan:
   - Component architecture
   - Data flow diagram
   - File structure
   - Dependency tree

3. DECOMPOSITION PHASE
   Break into tasks with dependencies:
   ```
   [Task 1: Base component] → [Dependencies: none]
   [Task 2: State management] → [Dependencies: Task 1]
   [Task 3: API integration] → [Dependencies: Task 2]
   [Task 4: UI components] → [Dependencies: Task 1]
   [Task 5: Testing] → [Dependencies: Task 3, Task 4]
   ```

4. EXECUTION PHASE
   Execute tasks respecting dependencies:
   - Tasks with no dependencies run first
   - Tasks with met dependencies run next (in parallel if possible)
   - Track progress: X/Y tasks completed
   - Log failures and retry

5. VALIDATION PHASE
   - Test each component
   - Integration testing
   - Error handling verification
   - Performance check

Create the task breakdown now (step 3), then ask for approval before executing."
```

---

## Task Decomposition Framework

### The SMART Task Breakdown Method

Every task you give should be:
- **S**pecific: Exactly what needs to be done
- **M**easurable: Clear success/failure criteria
- **A**tomic: Can't be broken down further
- **R**elevant: Directly contributes to the goal
- **T**estable: Can verify if it's done correctly

### Example: Bad vs Good Decomposition

❌ **BAD** (Vague, large, unmeasurable):
```
"Build the user authentication system"
```

✅ **GOOD** (Specific, atomic, measurable):
```
Task 1: Create user schema with email and password hash fields
  - Success: Schema file exists with correct fields
  - Dependencies: None

Task 2: Implement password hashing function using bcrypt
  - Success: Function hashes password and verifies correctly
  - Dependencies: None

Task 3: Create user registration endpoint
  - Success: POST /api/register creates user and returns JWT
  - Dependencies: Task 1, Task 2

Task 4: Create login endpoint
  - Success: POST /api/login validates credentials and returns JWT
  - Dependencies: Task 1, Task 2

Task 5: Create authentication middleware
  - Success: Middleware validates JWT and attaches user to request
  - Dependencies: None

Task 6: Protect routes with authentication middleware
  - Success: Protected routes return 401 without valid JWT
  - Dependencies: Task 5
```

### Instruction Template for Task Decomposition

```
📋 INSTRUCTION TO AI:

"I need to [HIGH-LEVEL GOAL].

First, decompose this into tasks using the SMART framework. For each task:

1. Give it a clear ID (Task 1, Task 2, etc.)
2. Write ONE specific action (not multiple)
3. Define success criteria
4. List dependencies (other task IDs it needs)
5. Estimate time (quick/medium/long)

Format each task like this:
```
Task ID: <number>
Action: <specific verb + object>
Success: <measurable outcome>
Dependencies: <list of task IDs or "None">
Estimate: <quick|medium|long>
```

After creating the task list, show me the dependency graph as ASCII art, like:
```
Task 1 (no deps)
  ↓
Task 2 (depends on 1)
  ↓
Task 3 (depends on 2) → Task 4 (depends on 2)
  ↓                           ↓
  Task 5 (depends on 3 & 4)
```

Do NOT start executing yet. Just create the plan and show it to me."
```

---

## Dependency Management Patterns

### Pattern 1: Sequential Dependencies (A → B → C)

```
📋 INSTRUCTION TO AI:

"Execute these tasks in strict order. Do not start Task N+1 until Task N is COMPLETED:

Task 1: Create database schema
  Status: PENDING

Task 2: Seed database with initial data
  Depends on: Task 1
  Status: PENDING

Task 3: Create API endpoints using seeded data
  Depends on: Task 2
  Status: PENDING

Rules:
- Mark each task as IN_PROGRESS before starting
- Mark as COMPLETED immediately after finishing
- If a task fails, STOP and report the error
- Do not skip ahead

Execute Task 1 now."
```

### Pattern 2: Parallel Independence (A, B, C run simultaneously)

```
📋 INSTRUCTION TO AI:

"Execute these tasks in parallel. They are independent and can run simultaneously:

Task A: Search for all TypeScript files
Task B: Search for all CSS files
Task C: Search for all configuration files

Rules:
- Start ALL three tasks at once (use parallel tool calls)
- Do NOT wait for one to finish before starting the next
- Report results when ALL three complete

Execute all three tasks NOW in a single message."
```

### Pattern 3: Diamond Dependencies (A → B,C → D)

```
📋 INSTRUCTION TO AI:

"Execute these tasks respecting the dependency graph:

         Task 1 (Foundation)
              ↓
        ┌─────┴─────┐
        ↓           ↓
    Task 2      Task 3  (Parallel after Task 1)
        └─────┬─────┘
              ↓
         Task 4 (Requires both 2 & 3)

Task 1: Create base layout component
  Dependencies: None

Task 2: Create header component
  Dependencies: Task 1

Task 3: Create footer component
  Dependencies: Task 1

Task 4: Integrate header + footer into layout
  Dependencies: Task 2, Task 3

Execution plan:
- Execute Task 1 first
- When Task 1 completes, execute Task 2 and Task 3 IN PARALLEL
- When BOTH Task 2 AND Task 3 complete, execute Task 4

Do NOT execute Task 4 until both 2 and 3 are done.

Start with Task 1 now."
```

---

## Progress Tracking System

### The 3-State Model

Every task must be in exactly one of these states:

```
1. PENDING    - Not started yet (gray/white)
2. IN_PROGRESS - Currently working on it (blue/yellow)
3. COMPLETED   - Successfully finished (green)
4. FAILED      - Errored out after retries (red)
```

### Instruction Template for Progress Tracking

```
📋 INSTRUCTION TO AI:

"As you work, maintain a live task list. Update it after EVERY action:

TASK LIST:
[ ] Task 1: Create component structure
[ ] Task 2: Add state management
[ ] Task 3: Implement API calls
[ ] Task 4: Add error handling
[ ] Task 5: Write tests

RULES:
- [ ] means PENDING
- [~] means IN_PROGRESS
- [✓] means COMPLETED
- [✗] means FAILED

REQUIRED FORMAT:
Before starting a task:
  Update: [~] Task 1: Create component structure

After completing a task:
  Update: [✓] Task 1: Create component structure

If a task fails:
  Update: [✗] Task 1: Create component structure (Error: XYZ)

Never complete multiple tasks without updating the list between them.
Start now and show the updated list after each step."
```

---

## Error Recovery Strategies

### Strategy 1: Exponential Backoff Retry

```
📋 INSTRUCTION TO AI:

"When a task fails, use exponential backoff retry logic:

PSEUDOCODE:
```
for attempt in 1..4:
  try:
    execute_task()
    return success
  catch error:
    if attempt == 4:
      log error and give up
    else:
      wait (2 ^ attempt) seconds  // 2s, 4s, 8s
      log "Retry attempt {attempt}/4"
      continue
```

EXAMPLE:
Attempt 1: Try to install package
  → FAIL: Network timeout

Wait 2 seconds...

Attempt 2: Try to install package again
  → FAIL: Network timeout

Wait 4 seconds...

Attempt 3: Try to install package again
  → SUCCESS!

Log: "Task completed on attempt 3/4"

Apply this logic to [YOUR TASK]. Start now."
```

### Strategy 2: Fallback Strategies

```
📋 INSTRUCTION TO AI:

"For this task, use a fallback chain if the primary approach fails:

PRIMARY APPROACH:
- Try method A (fastest)

FALLBACK 1 (if A fails):
- Try method B (slower but more reliable)

FALLBACK 2 (if B fails):
- Try method C (slowest but always works)

EXAMPLE:
Task: Fetch data from API

Primary: fetch('/api/data')
  → FAIL: CORS error

Fallback 1: fetch('/api/data', { mode: 'cors' })
  → FAIL: Still CORS error

Fallback 2: Use a proxy server fetch('/proxy?url=/api/data')
  → SUCCESS

Log each attempt and which method succeeded.
Execute this fallback chain for [YOUR TASK]."
```

---

## Real-World Examples

### Example 1: Building a Full Stack Feature

```
📋 FULL INSTRUCTION TO AI:

"Build a user profile page with edit functionality.

STEP 1 - DECOMPOSE:
Create a task list with dependencies.

STEP 2 - PARALLEL CONTEXT GATHERING:
Simultaneously (in one message):
- Search for existing profile components
- Find user data schema
- Locate authentication state management
- Check API endpoints for user data

STEP 3 - EXECUTION PLAN:
Based on what you found, create tasks like:

Task 1: Create ProfilePage component skeleton
  Dependencies: None

Task 2: Create ProfileForm component
  Dependencies: None

Task 3: Integrate ProfileForm into ProfilePage
  Dependencies: Task 1, Task 2

Task 4: Add API call to fetch user data
  Dependencies: Task 1

Task 5: Add API call to update user data
  Dependencies: Task 2

Task 6: Add form validation
  Dependencies: Task 5

Task 7: Add error handling
  Dependencies: Task 5, Task 6

STEP 4 - EXECUTE:
Follow the dependency graph:
- Start Task 1 and Task 2 in parallel
- When both complete, start Task 3 and Task 4 in parallel
- Continue respecting dependencies
- Update task list after each completion

STEP 5 - VALIDATE:
- Test the full user flow
- Check error cases
- Verify validation works

BEGIN WITH STEP 1 - Create the task decomposition now."
```

### Example 2: Debugging a Production Issue

```
📋 FULL INSTRUCTION TO AI:

"Production bug: Users can't log in. HTTP 500 error.

PHASE 1 - RAPID CONTEXT GATHERING (Parallel):
Execute these simultaneously:
- Read the login API route file
- Search for recent changes to auth code (git log)
- Find error logs mentioning "login" or "500"
- Check database connection code

PHASE 2 - ROOT CAUSE ANALYSIS:
Based on context, identify:
1. Exact line where error occurs
2. What changed recently that could cause this
3. What conditions trigger the error

PHASE 3 - REPRODUCE:
- Identify minimum steps to reproduce
- Test locally if possible

PHASE 4 - FIX WITH VALIDATION:
For each potential fix:
1. Explain what you're changing and why
2. Make the change
3. Test if it resolves the issue
4. If not, revert and try next fix

PHASE 5 - PREVENT RECURRENCE:
- Add error handling
- Add logging
- Add tests to catch this in future

Start with PHASE 1 - gather context now."
```

---

## Common Pitfalls to Avoid

### Pitfall 1: Sequential When You Should Parallel

❌ **WRONG**:
```
"First, search for X.
Then, search for Y.
Then, search for Z."
```
This is 3x slower than necessary!

✅ **RIGHT**:
```
"Execute these three searches in parallel (single message):
- Search for X
- Search for Y
- Search for Z

Report all results when done."
```

### Pitfall 2: Starting Without a Plan

❌ **WRONG**:
```
"Build me a social media app."
```
AI will likely jump straight to coding and miss dependencies.

✅ **RIGHT**:
```
"Build me a social media app.

BEFORE writing any code:
1. Break this into phases (auth, posts, comments, etc.)
2. For each phase, create a task list
3. Build a dependency graph
4. Get my approval on the plan

THEN execute the plan step by step with status tracking."
```

### Pitfall 3: No Error Recovery

❌ **WRONG**:
```
"Try to install the package."
```
If it fails once, AI gives up.

✅ **RIGHT**:
```
"Try to install the package.

If it fails:
- Wait 2 seconds and retry
- If it fails again, wait 4 seconds and retry
- If it fails a third time, try using a different registry
- Only give up after 4 total attempts

Report which attempt succeeded."
```

### Pitfall 4: No Progress Visibility

❌ **WRONG**:
```
"Complete these 10 tasks."
```
You have no idea what's done until the end.

✅ **RIGHT**:
```
"Complete these 10 tasks.

Maintain a checklist and update it after EVERY task:
[ ] Task 1
[ ] Task 2
...
[ ] Task 10

Show the updated checklist after each completion."
```

---

## Advanced Techniques

### Technique 1: Caching Previous Work

```
📋 INSTRUCTION TO AI:

"As you complete tasks, maintain a cache of reusable components.

CACHE FORMAT:
{
  "Button": { path: "components/Button.tsx", hash: "abc123" },
  "Input": { path: "components/Input.tsx", hash: "def456" }
}

BEFORE creating a new component:
1. Check if a similar one exists in the cache
2. If yes, reuse it instead of creating new
3. If no, create it and add to cache

This saves time and ensures consistency."
```

### Technique 2: Intelligent Task Prioritization

```
📋 INSTRUCTION TO AI:

"When you have multiple independent tasks, prioritize like this:

PRIORITY 1 (Highest): Tasks that unblock the most other tasks
PRIORITY 2: Tasks that are fastest to complete
PRIORITY 3: Tasks that are slowest

EXAMPLE:
Task A: Create base component (3 other tasks depend on this) → Priority 1
Task B: Write documentation (no dependencies, quick) → Priority 2
Task C: Write tests (no dependencies, slow) → Priority 3

Execute in this order: A → B → C"
```

---

## How to Apply This to YOUR AI Tool

### For Claude (Anthropic)

```
# In your prompt to Claude:

"You are now operating in systematic execution mode.

For every task I give you, follow this process:

1. DECOMPOSE
   - Break into 5-10 atomic subtasks
   - Create a checklist

2. DEPENDENCY ANALYSIS
   - Build a dependency graph
   - Identify parallel vs sequential tasks

3. EXECUTION
   - Respect dependencies
   - Update checklist after each step
   - Use exponential backoff for retries

4. VALIDATION
   - Test each completed task
   - Report any issues

Begin each response by showing your task breakdown.
Update your checklist as you work.
Never complete multiple tasks without updating the list between them.

Understood?"
```

### For GPT-4 (OpenAI)

```
# In your system prompt or initial user message:

"You are an expert software engineer who works systematically.

MANDATORY WORKFLOW:
1. Before coding anything, create a task list
2. Number each task and mark dependencies
3. Execute tasks in dependency order
4. Mark each task as [ ], [~], [✓], or [✗]
5. Update task status after every action
6. Use retry logic for failures (3-4 attempts with exponential backoff)

PARALLEL EXECUTION:
- When tasks have no dependencies, execute them simultaneously
- Use multiple tool calls in a single message

ERROR HANDLING:
- Never give up after one failure
- Try alternative approaches
- Log detailed error context

Apply this workflow to all my requests unless I specifically say otherwise."
```

### For GitHub Copilot Chat

```
# In your chat message:

"@workspace I need you to work systematically.

Phase 1: Analysis
- Create a task breakdown
- Show dependencies

Phase 2: Execution
- Execute tasks respecting dependencies
- Show progress after each task

Phase 3: Validation
- Test the implementation
- Report any issues

Start with Phase 1 for this request: [YOUR REQUEST]"
```

---

## Summary Checklist

When instructing an AI, always include:

- [ ] **Task Decomposition** - Break it into 5-10 clear steps
- [ ] **Dependency Specification** - State what depends on what
- [ ] **Progress Tracking** - Require status updates after each step
- [ ] **Error Recovery** - Specify retry logic (exponential backoff)
- [ ] **Parallel Execution** - Identify independent tasks that can run simultaneously
- [ ] **Validation** - Define success criteria for each task
- [ ] **Timeout/Limits** - Specify when to give up (after X retries)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK AI INSTRUCTION TEMPLATE                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "I need you to [TASK].                                      │
│                                                             │
│ STEP 1: Decompose this into 5-10 atomic subtasks           │
│ STEP 2: Build a dependency graph                           │
│ STEP 3: Execute tasks respecting dependencies              │
│ STEP 4: Update task status after EVERY step:               │
│   [ ] = PENDING                                             │
│   [~] = IN_PROGRESS                                         │
│   [✓] = COMPLETED                                           │
│   [✗] = FAILED                                              │
│ STEP 5: If a task fails, retry with exponential backoff:   │
│   Attempt 1: immediate                                      │
│   Attempt 2: wait 2s                                        │
│   Attempt 3: wait 4s                                        │
│   Attempt 4: wait 8s, then give up                         │
│                                                             │
│ Start with STEP 1 now. Show your task breakdown."          │
└─────────────────────────────────────────────────────────────┘
```

---

## Further Reading

- `VIBE_CODING_EXPLAINED.md` - Deep dive into the orchestration engine
- `TaskOrchestrator.ts` - Reference implementation
- `app/page.tsx` - Real-world usage example

---

**Remember**: The key to making AI work intelligently is **explicit instruction**. Don't assume it will figure out dependencies, retries, or parallel execution on its own. **Tell it exactly what to do.**

Good luck building! 🚀
