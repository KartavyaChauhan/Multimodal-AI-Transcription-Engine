/**
 * Prompts for the multi-phase transcription pipeline.
 * 
 * Phase 1: Description - Understand what the meeting/content is about
 * Phase 2: Transcription - Transcribe with context from Phase 1
 * Phase 3: Report - Generate summary and action items
 * 
 * These prompts are designed to capture not just words, but tone, intent,
 * and emotional context - inspired by linguistic anthropology approaches.
 */

// ===========================================
// PHASE 1: DESCRIPTION PROMPTS
// ===========================================

/**
 * Prompt for analyzing video screenshots.
 * Used to understand visual context: who's visible, what's on screen, etc.
 */
export const DESCRIPTION_PROMPT = (userInstructions?: string) => `
You are analyzing screenshots from a video recording to help with transcription.

Your goal is to provide context that will help identify speakers and understand the setting.

## Analyze and Describe:

### 1. Participants
- How many people are visible?
- Physical descriptions (hair color, clothing, glasses, etc.)
- Apparent roles (presenter, interviewer, panelist, host)
- Any visible name tags, lower thirds, or on-screen names
- Estimated age range and gender presentation

### 2. Setting & Format
- What type of content is this? (podcast, interview, presentation, meeting, webinar, lecture)
- Environment (studio, office, home, conference room, stage)
- Production quality (professional, casual, amateur)
- Any visible branding, logos, or show titles

### 3. Visual Content
- Screen shares, slides, or presentations visible
- Any text overlays or graphics
- Software or applications being demonstrated
- Documents or materials being referenced

### 4. Emotional/Social Dynamics
- Body language and engagement levels
- Apparent rapport between participants
- Formality level of the interaction
- Who appears to be leading/facilitating

### 5. Technical Details
- Video quality and lighting
- Camera angles (single camera, multi-cam, screen recording)
- Any visible equipment (microphones, monitors)

${userInstructions ? `
## User Instructions
${userInstructions}
` : ''}

## Output
Provide a concise but detailed description (2-4 paragraphs) that will help:
1. Identify who is speaking based on voice matching
2. Understand the context and topic
3. Maintain consistency in speaker naming

⚠️ Do NOT guess dates, times, or locations unless explicitly visible.
`;

/**
 * Prompt for analyzing audio sample.
 * Used to understand speakers, topic, and tone.
 */
export const AUDIO_DESCRIPTION_PROMPT = (userInstructions?: string) => `
You are analyzing an audio sample to prepare for full transcription.

Listen carefully and provide context that will help with speaker identification and understanding.

## Analyze and Describe:

### 1. Speakers
- How many distinct voices do you hear?
- For each speaker, describe:
  - Voice characteristics (pitch, pace, accent, speaking style)
  - Role in conversation (host, guest, interviewer, expert)
  - Any names mentioned or used to address them
  - Approximate speaking time/dominance

### 2. Content & Topic
- What is being discussed?
- Main themes or subjects covered
- Technical level (general audience, expert discussion, educational)
- Any specific terminology, jargon, or field-specific language

### 3. Format & Tone
- Type of content (interview, discussion, presentation, debate, casual chat)
- Formality level (professional, casual, academic)
- Overall mood (serious, humorous, tense, collaborative)
- Pacing (fast-moving, deliberate, natural conversation)

### 4. Audio Quality
- Recording quality (professional, moderate, poor)
- Background noise or environmental sounds
- Any audio issues (echo, distortion, volume variations)
- Music or sound effects

### 5. Key Moments
- Any particularly quotable or significant statements
- Emotional peaks (laughter, tension, excitement)
- Topic transitions or segment changes

${userInstructions ? `
## User Instructions
${userInstructions}
` : ''}

## Output
Provide a concise but detailed description (2-4 paragraphs) that will help:
1. Identify speakers consistently throughout transcription
2. Understand context for ambiguous statements
3. Capture the appropriate tone and nuance

⚠️ Do NOT guess dates or times unless explicitly stated in the audio.
`;

/**
 * Prompt for merging visual and audio descriptions.
 */
export const MERGE_DESCRIPTION_PROMPT = (userInstructions?: string) => `
You have two analyses of the same recording:

1. **Visual Analysis** - Based on video screenshots
2. **Audio Analysis** - Based on an audio sample

## Your Task
Synthesize these into a unified description that will serve as context for transcription.

## Merge Strategy

### Speaker Mapping
- Match voices to visible people where possible
- Note: "The person in the blue shirt appears to be the deeper voice discussing AI"
- If names are visible AND mentioned in audio, confirm the match

### Context Enrichment
- Combine visual setting with audio topic for fuller picture
- Note any discrepancies (e.g., more voices than visible people = off-camera speakers)
- Identify the primary speaker/host vs. guests

### Transcription Guidance
- Provide clear guidance on how to identify each speaker
- Note any visual cues that indicate who is speaking (gestures, looking at camera)
- Describe the format to help with appropriate transcription style

${userInstructions ? `
## User Instructions
${userInstructions}
` : ''}

## Output Format
Provide a unified description (2-3 paragraphs) structured as:

1. **Overview**: What this content is and who's involved
2. **Speaker Guide**: How to identify each speaker (name + visual + voice description)
3. **Context Notes**: Key topics, tone, and any special considerations for transcription

This description will be provided to the transcription model to maintain consistency.
`;

// ===========================================
// PHASE 2: TRANSCRIPTION PROMPTS
// ===========================================

/**
 * Main transcription prompt with context from description phase.
 * Includes previous transcription for continuity across chunks.
 * 
 * Inspired by linguistic anthropology approach - captures not just words
 * but intent, tone, and emotional context.
 */
export const TRANSCRIPTION_PROMPT = (
  description: string,
  chunkNumber: number,
  totalChunks: number,
  previousTranscription: string,
  userInstructions?: string
) => `
You are an expert linguistic anthropologist and audio transcriber.
Your task is to transcribe audio chunk ${chunkNumber} of ${totalChunks} with extreme accuracy.

═══════════════════════════════════════════════════════════════════════════════
## 1. CONTEXT (THE "WHAT")
═══════════════════════════════════════════════════════════════════════════════

**Meeting/Content Description:**
${description || "General conversation - observe and describe what you hear."}

${previousTranscription ? `
**Continuity Context:**
This is a continuation of a previous segment. Here is the end of the previous transcription:

\`\`\`
${previousTranscription}
\`\`\`

⚠️ DO NOT re-transcribe the above. Continue from where it left off.
⚠️ MAINTAIN speaker name consistency with the previous context.
` : `
**Starting Point:**
This is the beginning of the recording or a new section. Establish speaker identities clearly.
`}

═══════════════════════════════════════════════════════════════════════════════
## 2. STYLE GUIDELINES (THE "HOW")
═══════════════════════════════════════════════════════════════════════════════

You must capture not just the *words*, but the *intent* and *tone* of the speakers.

### Emotions & Delivery
Mark emotional states and delivery style within the text using parentheses:
- **(laughing)** - "I don't think that's right (laughing)"
- **(sighs)** - "(sighs) We need to start over"
- **(excited)** - "This is amazing! (excited)"
- **(hesitant)** - "Well... (hesitant) I guess we could try"
- **(thoughtful)** - "(thoughtful pause) Let me think about that"
- **(frustrated)** - "Why isn't this working? (frustrated)"
- **(sarcastic)** - "Oh, that's just great (sarcastic)"

### Non-Verbal Cues
Include relevant sounds and events:
- **(long pause)** - A pause longer than 3 seconds
- **(crosstalk)** - Multiple people speaking at once
- **(interrupts)** - One speaker cuts off another
- **(background noise)** - Significant ambient sounds
- **(applause)** - Audience reaction
- **(silence)** - Extended quiet moment
- **(inaudible)** - Cannot make out the words

### Speech Patterns
Preserve natural speech:
- **Filler words**: Include "um", "uh", "you know", "like" when they occur
- **False starts**: "I was going to— actually, let me rephrase that"
- **Trailing off**: "So I thought maybe we could..."
- **Self-corrections**: "It was Tuesday— no, Wednesday"

═══════════════════════════════════════════════════════════════════════════════
## 3. SPEAKER IDENTIFICATION (THE "WHO")
═══════════════════════════════════════════════════════════════════════════════

### Identifying Speakers
- Use **names** when mentioned or identifiable from context
- If names are unknown, use consistent labels: "Speaker 1", "Speaker 2", etc.
- Match voice characteristics to any visual/context clues from the description
- Pay attention to how speakers address each other

### Maintaining Consistency
- If previous context identifies "Speaker 1" as "Justin", continue using "Justin"
- If a speaker's name is revealed mid-conversation, you may note: "Speaker 1 (later identified as John)"
- Group similar voices together - don't create new speaker labels unnecessarily

${userInstructions ? `
═══════════════════════════════════════════════════════════════════════════════
## ADDITIONAL USER INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════════
${userInstructions}
` : ''}

═══════════════════════════════════════════════════════════════════════════════
## 4. OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

Return ONLY a valid JSON array with this exact structure:

\`\`\`json
[
  {
    "speaker": "Speaker Name",
    "start": "MM:SS",
    "end": "MM:SS",
    "text": "What they said (with emotional cues in parentheses)",
    "tone": "neutral"
  }
]
\`\`\`

### Field Definitions:
- **speaker**: Name or consistent identifier (e.g., "Fei-Fei", "Justin", "Speaker 1")
- **start**: When this utterance begins (MM:SS format, relative to chunk start)
- **end**: When this utterance ends (MM:SS format, optional but helpful)
- **text**: The transcribed words with emotional/tonal cues in parentheses
- **tone**: Overall tone: "neutral", "excited", "hesitant", "frustrated", "amused", "serious", "curious", "emphatic"

### Critical Rules:
1. Output MUST be valid JSON - no markdown, no explanations outside the array
2. Timestamps must be sequential and cover the full audio duration
3. Do NOT summarize - transcribe verbatim including filler words
4. Be consistent with speaker names throughout
5. Every entry must have at minimum: speaker, start, text
`;

/**
 * Simple transcription prompt for audio-only processing (no description phase).
 * Used as fallback or for quick processing.
 */
export const SIMPLE_TRANSCRIPTION_PROMPT = `
You are an expert transcription assistant specializing in capturing both words and emotional nuance.

Transcribe the audio with:
1. **Speaker Identification**: Label each speaker consistently
2. **Timestamps**: Mark when each utterance begins (MM:SS format)
3. **Verbatim Text**: Include filler words, false starts, trailing off
4. **Emotional Cues**: Note tone in parentheses: (laughing), (hesitant), (excited), etc.
5. **Non-Verbal Sounds**: Include (pause), (sighs), (crosstalk), (inaudible)

OUTPUT FORMAT (JSON array only):
[
  {
    "speaker": "Speaker 1",
    "start": "00:00",
    "text": "What they said (with emotional cues)"
  }
]

Do NOT summarize. Transcribe everything you hear.
`;

// ===========================================
// PHASE 3: REPORT PROMPTS
// ===========================================

/**
 * Report generation prompt.
 * Used when --report flag is passed to generate a meeting summary.
 */
export const REPORT_PROMPT = `
You are an expert meeting analyst. Analyze the following transcript and generate a comprehensive meeting report.

OUTPUT RULES:
1. Output MUST be valid JSON.
2. Structure:
{
  "title": "Brief meeting title based on content",
  "summary": "2-3 paragraph executive summary",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "decisions": ["Decision 1", "Decision 2", ...],
  "actionItems": [
    { "owner": "Person name", "task": "Task description", "deadline": "If mentioned" }
  ],
  "topics": ["Topic 1", "Topic 2", ...],
  "participants": ["Speaker 1", "Speaker 2", ...]
}
3. Be thorough but concise.
4. If no decisions or action items are found, use empty arrays.
5. Extract specific names, dates, and commitments when mentioned.
`;

/**
 * Report headings prompt for the Spreadfill technique.
 * First generates structure, then fills sections independently.
 */
export const REPORT_HEADINGS_PROMPT = (description: string, transcript: string, userInstructions?: string) => `
Meeting Description:
\`\`\`
${description}
\`\`\`

Transcript:
\`\`\`
${transcript}
\`\`\`

${userInstructions ? `USER INSTRUCTIONS: ${userInstructions}\n\n` : ''}

Based on this meeting content, generate appropriate section headings for a comprehensive meeting report.
Consider what sections would be most valuable given the specific content of this meeting.

Return a JSON object with this structure:
{
  "title": "Meeting title",
  "sections": [
    { "heading": "Section heading", "description": "What this section should contain" }
  ]
}
`;
