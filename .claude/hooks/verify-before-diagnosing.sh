#!/bin/bash
# Hook: when user reports a bug/error, remind Claude to VERIFY before proposing a fix.
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""')

# Match common bug/error reporting patterns (French + English)
if echo "$PROMPT" | grep -qiE "erreur|error|bug|souci|marche pas|crash|fail|problème|problem|ne fonctionne|broken|cassé|planté|msg d.erreur"; then
  jq -n '{
    additionalContext: "RAPPEL DEBUGGING: Tu DOIS vérifier ton hypothèse avec des preuves concrètes (logs Supabase, queries SQL, list secrets, list edge functions, lecture du code source) AVANT de proposer une cause ou solution. Ne jamais dire \"c est probablement X\" sans avoir vérifié."
  }'
fi

exit 0
