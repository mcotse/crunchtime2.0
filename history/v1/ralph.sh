#!/usr/bin/env bash
set -euo pipefail

# Crunch Time 2.0 — Ralph Loop Shell Script
# Runs Claude Code in a loop, one iteration per story, fresh context each time.
#
# Usage:
#   cd /Users/matthewtse/Developer/crunchtime2.0
#   bash history/v1/ralph.sh [--max-iterations N]
#
# Prerequisites:
#   - claude CLI installed and authenticated
#   - Working directory is the project root

MAX_ITERATIONS="${1:-20}"
PROMPT_FILE="history/v1/RALPH_PROMPT.md"
PRD_FILE="history/v1/prd.json"
PROGRESS_FILE="history/v1/progress.txt"
COMPLETION_PROMISE="BUGFIX COMPLETE"
BRANCH="ralph/bugfix-polish"
LOG_DIR="history/v1/logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Crunch Time 2.0 — Ralph Loop ===${NC}"
echo -e "Max iterations: ${MAX_ITERATIONS}"
echo -e "Prompt: ${PROMPT_FILE}"
echo -e "PRD: ${PRD_FILE}"
echo ""

# Verify files exist
if [[ ! -f "$PROMPT_FILE" ]]; then
  echo -e "${RED}Error: ${PROMPT_FILE} not found. Run from project root.${NC}"
  exit 1
fi

if [[ ! -f "$PRD_FILE" ]]; then
  echo -e "${RED}Error: ${PRD_FILE} not found.${NC}"
  exit 1
fi

# Create log directory
mkdir -p "$LOG_DIR"

# Create or switch to ralph branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    echo -e "${YELLOW}Switching to existing branch: ${BRANCH}${NC}"
    git checkout "$BRANCH"
  else
    echo -e "${YELLOW}Creating new branch: ${BRANCH}${NC}"
    git checkout -b "$BRANCH"
  fi
fi

# Count remaining stories
count_remaining() {
  grep -c '"passes": false' "$PRD_FILE" 2>/dev/null || echo "0"
}

REMAINING=$(count_remaining)
echo -e "${CYAN}Stories remaining: ${REMAINING}${NC}"
echo ""

if [[ "$REMAINING" -eq 0 ]]; then
  echo -e "${GREEN}All stories already pass! Nothing to do.${NC}"
  exit 0
fi

# Main loop
for ((i=1; i<=MAX_ITERATIONS; i++)); do
  REMAINING=$(count_remaining)

  if [[ "$REMAINING" -eq 0 ]]; then
    echo -e "${GREEN}=== All stories complete! ===${NC}"
    break
  fi

  TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
  LOG_FILE="${LOG_DIR}/iteration_${i}_${TIMESTAMP}.log"

  echo -e "${CYAN}=== Iteration ${i}/${MAX_ITERATIONS} — ${REMAINING} stories remaining ===${NC}"
  echo -e "Log: ${LOG_FILE}"
  echo ""

  # Run Claude with the prompt, capture output
  OUTPUT=$(claude --print \
    --dangerously-skip-permissions \
    --max-turns 30 \
    "$(cat "$PROMPT_FILE")" \
    2>&1) || true

  # Save full output to log
  echo "$OUTPUT" > "$LOG_FILE"

  # Check for completion promise
  if echo "$OUTPUT" | grep -q "$COMPLETION_PROMISE"; then
    echo -e "${GREEN}=== COMPLETION PROMISE RECEIVED ===${NC}"
    echo -e "${GREEN}All bugfixes complete!${NC}"
    echo ""
    echo -e "Final log: ${LOG_FILE}"
    echo -e "Progress: ${PROGRESS_FILE}"
    echo -e "PRD: ${PRD_FILE}"
    exit 0
  fi

  # Check if any story was completed this iteration
  NEW_REMAINING=$(count_remaining)
  if [[ "$NEW_REMAINING" -lt "$REMAINING" ]]; then
    COMPLETED=$((REMAINING - NEW_REMAINING))
    echo -e "${GREEN}Completed ${COMPLETED} story(ies) this iteration.${NC}"
  else
    echo -e "${YELLOW}No stories completed this iteration. Check log: ${LOG_FILE}${NC}"
  fi

  echo ""
  sleep 2
done

# If we get here, we hit max iterations
REMAINING=$(count_remaining)
if [[ "$REMAINING" -gt 0 ]]; then
  echo -e "${RED}=== Max iterations (${MAX_ITERATIONS}) reached ===${NC}"
  echo -e "${RED}${REMAINING} stories still remaining.${NC}"
  echo -e "Review logs in: ${LOG_DIR}/"
  exit 1
else
  echo -e "${GREEN}=== All stories complete! ===${NC}"
  exit 0
fi
