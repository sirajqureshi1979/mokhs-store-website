# MOKHS Aqua — 3D Showcase + Motion AI

Interactive 3D product site for the MOKHS Aqua automatic water pump, with **Motion AI**:
type a command such as `/vfx structural assembly` (or plain English / Roman Urdu) and the
3D pump performs a short cinematic shot list — then download it as a **9:16 Reel** or **16:9** video.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (optional: `GEMINI_MODEL`, default `gemini-2.5-flash`).
3. `npm run dev` → http://localhost:3000

Production: `npm run build` then `npm start` (Express serves `dist/` and the `/api/motion` endpoint).

## Motion AI — how it works
| Part | File |
|---|---|
| Prompt box (`/vfx` commands, 9:16 / 16:9, Video ×1, arrow button) | `src/components/MotionAIStudio.tsx` |
| Shot-list schema, safety filter, allowed caption facts, Gemini prompt | `src/motion/types.ts` |
| Built-in director (works with no API key / offline) | `src/motion/localDirector.ts` |
| Browser → server call with automatic fallback | `src/motion/client.ts` |
| Video recorder (adds background, MOKHS watermark, captions, letterbox) | `src/motion/recorder.ts` |
| Server endpoint `POST /api/motion` (Gemini key stays on the server) | `server.ts` |
| 3D playback: `playMotion()`, cinematic cameras (wide/close/low/top/orbit) | `src/three/PumpSceneEngine.ts` |

Shot actions: `reveal`, `assemble`, `explode`, `orbit`, `spin`, `drop`, `pour`, `closeup`.
Built-in commands: `/vfx structural assembly`, `/vfx exploded view`, `/vfx 3-bottle drop`,
`/vfx pour shot`, `/vfx 360 orbit`, `/vfx black edition`, `/vfx hero reveal`.

**Captions only use facts in `PRODUCT_FACTS` (src/motion/types.ts).** Add confirmed specs there
(e.g. battery size) so the AI can mention them; it is told never to invent specs or prices.

Static hosting (no server): the site still works — Motion AI automatically uses the built-in director.
Video download needs Chrome, Edge, Safari 18+ or Firefox (MP4 where supported, otherwise WebM).
