
# Driveathome MVP bundle

This bundle keeps your front-end flow and adds a practical architecture that works with a MacBook next to the DJI RoboMaster S1.

## Important architecture
- **Frontend** lives on Vercel.
- **MacBook agent** runs locally next to the robot.
- The agent does four jobs:
  1. robot status
  2. sessions and promo codes
  3. screen capture video
  4. keyboard and mouse control into the DJI RoboMaster app

Because Vercel is static for this MVP, the site talks directly to the MacBook agent through a **public tunnel URL**.

## Folder overview
- root files: website for Vercel
- `agent/`: local MacBook server and robot bridge
- `promo/promo_codes.json`: one-time promo codes
- `promo/promo_codes.txt`: easy list of generated promo codes

## What you must do after upload
1. Deploy the root site to Vercel.
2. On the MacBook:
   - install Python 3.11+
   - open the DJI RoboMaster app
   - run the agent
   - create a Cloudflare Tunnel or ngrok tunnel to the agent port
3. Put the public tunnel URL into `config.js`
4. Redeploy the site

## MacBook permissions
You must grant the terminal or Python app:
- Screen Recording
- Accessibility
- Input Monitoring if macOS asks for it

## Current control mapping used
- W forward
- S back
- A strafe left
- D strafe right
- Q rotate body left
- E rotate body right
- mouse moves turret
- left mouse fire
- Shift faster
- Ctrl slower

## Notes
- Payment is still test mode by design. That is the correct order for this MVP.
- Feedback currently stores on the MacBook in JSONL.
- Support link is left empty for now.
