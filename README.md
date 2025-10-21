```markdown
# InfinichainX — Landing + Starfield + Professional Simulator (IFX)

Repository structure (recommended):
- assets/
  - logo-hood.png        <-- hood logo (keep your file)
  - bg.jpg               <-- background image used beneath starfield
  - favicon.ico (optional)
- index.html
- styles.css
- starfield.js
- app.js
- README.md

Quick summary:
- UI language: English.
- Token names used: IFX (project token) and WLD (chain/native token).
- Sim features: simulated wallet connect, oracle (random-walk), AMM (constant-product) with slippage & fees, lending deposit with small bonus, tx history with simulated hashes, reputation system, and localStorage persistence for demo continuity.

How to use locally:
1. Place files and the `assets/` folder together in a project folder.
2. Open `index.html` with a modern browser (Chrome, Edge, Firefox).
3. Click "Connect (sim)" to simulate a wallet and test swaps/lending. State persists in localStorage.

Deploy to GitHub Pages:
Option A — main branch root:
1. git init
2. git add .
3. git commit -m "Initial IFX demo"
4. git branch -M main
5. git remote add origin https://github.com/<your-username>/<your-repo>.git
6. git push -u origin main
7. In GitHub -> Settings -> Pages: Source = main / root. Save and wait a few minutes.

Option B — docs folder:
1. Move files into `docs/` folder or set up your build to output there.
2. Push to main.
3. In GitHub -> Settings -> Pages: Source = main / /docs. Save.

Notes and recommendations:
- Verify `assets/bg.jpg` and `assets/logo-hood.png` file names are exact (case-sensitive).
- Optimize images (WebP/JPEG compression) before public launch.
- For real integration with Worldchain / Worldcoin:
  - Replace simulated wallet with the real SDK (WalletConnect / native Worldchain wallet).
  - Replace oracle simulation with an actual price feed (or mock aggregator in testnet).
  - Add security/audit checks and hide any admin/test controls behind dev flags.
- If you want, I can prepare a GitHub Actions workflow that deploys automatically to `gh-pages` branch.

```
