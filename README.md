# MineMath

**Emerald Math Adventure** — a kid-friendly, Minecraft-inspired math battle game in the browser.

Play online (free, no install): **[coolgithub1.github.io/MineMath](https://coolgithub1.github.io/MineMath/)**

Solve custom addition and subtraction equations, charge into voxel mobs, unlock swords and cosmetics, collect stickers, and celebrate with party effects. Progress is saved in your browser.

---

## How to play

1. Read the equation on the board.
2. Type the answer and press **Check**.
3. **Correct** → you charge the mob, deal damage, celebrate, and pick a reward.
4. **Wrong** → the mob fights back (unique counters per mob type) and you lose a heart.

Keep answering to build streaks, defeat tougher mobs, unlock gear, and collect stickers.

---

## Features

### Custom math questions

- Edit your own equation list with the **Questions** button.
- Add **addition** (`+`) or **subtraction** (`−`) problems.
- Remove equations you don’t want, or **Restore Starter List**.
- The game cycles through your list in order (starts with 19 starter additions).
- Your custom list is kept even if you Restart or start a New Game.

### Battle combat

- Side-by-side arena: **You** vs a Minecraft-style mob with heart bars.
- Charge into battle on every answer — melee slash or staff bolt.
- **5 player hearts**; lose one on a wrong answer (unless Shield blocks it).
- Mob hearts scale as you defeat more enemies and climb difficulty tiers.

### Weapons

Unlock gear by answering correctly, then equip it in the **Wardrobe**.

| Weapon | Style | Damage |
|--------|--------|--------|
| Wood Sword | Sword | 1 |
| Stone Sword | Sword | 1 |
| Iron Sword | Sword | 1 |
| Gold Sword | Sword | 1 |
| Diamond Sword | Sword | 2 |
| Battle Axe | Axe | 2 |
| Enchanted Blade | Sword (glow) | 3 |
| Netherite Sword | Sword | 3 |
| Trident | Trident | 3 |
| Blaze Staff | Staff (glow) | 4 |

Each weapon has its own look and particle effects. The **Blaze Staff** shoots a colored bolt instead of a melee swing.

### Cosmetics

Unlock and mix-and-match in the Wardrobe:

- **Hats:** Miner Helmet, Gold Crown, Pumpkin Head, Cool Shades, Wizard Hat
- **Capes:** Red Cape, Ender Cape, Emerald Cape (cape flap on correct answers)
- **Extras:** Adventure Pack, Shoulder Parrot (squawks!), Sparkly Boots

### Mobs & counters

| Mob | Notes |
|-----|--------|
| Zombie | Classic moan + hit |
| Creeper | Fuse, explode, then respawn |
| Skeleton | Bow + flying arrow |
| Spider | Standard attack |
| Enderman | Teleport in, hit, teleport out |
| Wither Skeleton | Tougher skeleton with arrow |
| Giant Zombie | Big tanky zombie |

Wrong answers trigger that mob’s special counter. New challengers get a **boss intro** banner.

### Rewards & wardrobe

- After each correct answer, pick a new **weapon** or **cosmetic**.
- Big **“Wow, you unlocked…”** celebration banner.
- **Wardrobe** to equip anything you’ve unlocked.
- **New Game** resets unlocks and progress (keeps your equation list).

### Streaks & power-ups

- Streak counter with glowing combo tiers.
- Every **5** in a row → victory dance (spin, robot, or high five).
- Every **10** in a row → tougher mob tier unlocks.
- ~28% chance after a correct answer to grab a bonus:
  - **Double Hit** — next hit deals 2× damage
  - **Shield Heart** — blocks the next heart loss

### Stickers (15 achievements)

Earn stickers for milestones like first win, hot streaks, defeating specific mobs, collecting gear, biomes, dances, and more. Browse them in the **Sticker Book**.

### Biomes

The world shifts as you defeat more mobs:

- **Plains** → **Snow** → **Nether**
- Background and ambient music change with each biome.

### Visual & audio spectacle

- Voxel-style canvas character and mobs with silly idle animations (dance, laugh, fight, bounce, wiggle).
- Weapon particle trails, slash arcs, and hit bursts unique per weapon.
- Party mode on correct answers: confetti, trumpets, balloons, rainbow flash, cheer SFX.
- Arena shake, hit/hurt flashes, typing sparkles, mob taunt speech bubbles.
- Procedural Web Audio (no sound files) — combat, celebration, biome drones, parrot squawk, and more.
- Mute toggle in the HUD.

### UI at a glance

- **HUD:** Correct count, Streak, power-up charges, sticker count
- **Buttons:** Sound, Questions, Stickers, Wardrobe, Restart
- **Overlays:** Reward picker, Wardrobe, Sticker Book, Edit Questions, power-up offers, boss intros, biome announces

---

## Play online

No domain or hosting bill needed — it’s on **GitHub Pages**:

👉 **https://coolgithub1.github.io/MineMath/**

Pushing to `main` rebuilds and updates the site automatically.

---

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL (usually `http://localhost:5173/`).

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build
```

### Tech

- Vanilla JavaScript (ES modules) + Vite
- Canvas 2D for characters, mobs, and weapon FX
- CSS animations + Google Fonts (Nunito, Press Start 2P)
- `localStorage` save (`minemath-save-v6`)
- Deployed with GitHub Actions → GitHub Pages

---

## Project layout

```
src/
  main.js           # App shell & wiring
  game/             # State, math, battle, audio, FX, stickers, stim
  screens/          # Play, questions editor, wardrobe, rewards
  render/           # Character, mob, weapon particles
```

---

Made for fun math practice with Minecraft vibes. Enjoy!
