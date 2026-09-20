# CloudboyX Predict &bull; Quick Start Field Cheat Sheet

**Essential Formulas, Decision Matrix & Keyboard/UI Shortcuts**

---

## 1. Quick Decision Matrix

| Condition | Indicator | Recommended Action |
| :--- | :--- | :--- |
| **$P_{\text{calibrated}} > \text{Price} + 4¢$** | Positive Edge ($E \ge +4\%$) | **BUY YES** using Half-Kelly position sizing. |
| **$P_{\text{calibrated}} < \text{Price} - 4¢$** | Negative Edge ($E \le -4\%$) | **BUY NO** (or fade the consensus). |
| **$|\text{Edge}| < 2¢$** | Fairly Priced ($E \approx 0$) | **PASS** / No trade; spread and exchange fees eat edge. |
| **Range $\ge 5¢$ or Path $\ge 7¢$** | High 3-Check Volatility | **REDUCE SIZE** to Quarter-Kelly; use passive limit orders. |
| **3 Consecutive Up-Ticks ($↗ ↗ ↗$)** | Strong Buying Momentum | Verify catalyst before chasing; wait for brief consolidation tick. |
| **3 Consecutive Down-Ticks ($↘ ↘ ↘$)** | Heavy Fade Pressure | Re-evaluate thesis; monitor for orderbook bid depth replenishment. |

---

## 2. Core Mathematical Formulas

### Expected Value (EV) per Contract
$$\text{EV}_{\text{YES}} = P \times (1.00 - C) - (1 - P) \times C = P - C$$
*Example*: If Calibrated $P = 0.60$ and Contract Cost $C = \$0.48$:
$$\text{EV} = 0.60 - 0.48 = +\$0.12 \text{ per contract } (+25.0\% \text{ expected return})$$

### Kelly Criterion Optimal Wager Fraction
$$f^* = \frac{p \cdot b - (1 - p)}{b} \quad \text{where } b = \frac{1 - C}{C}$$
*Rule of Thumb*: For long-term capital preservation, always execute **Half-Kelly** ($0.5 \times f^*$).

### Maximum Potential Payout
$$\text{Max Payout} = \text{Contracts Count} \times \$1.00$$
$$\text{Net Profit on Win} = \text{Max Payout} - \text{Total Cost}$$

---

## 3. Visual UI Color Reference

| Color / Icon | Meaning in CloudboyX Predict |
| :--- | :--- |
| **Emerald Green ($↗$)** | Positive edge, contract price up-tick, profitable win trade, high confidence. |
| **Vibrant Rose ($↘$)** | Negative edge, contract price down-tick, loss trade, high risk warning. |
| **Indigo / Blue** | Calibrated model estimation, AI synthesis, active research pipeline. |
| **Amber ($!$)** | Moderate to high volatility advisory, orderbook spread alert, ambiguity risk. |
| **Stone Gray ($→$)** | Flat price check, neutral orderbook consolidation, baseline prior. |

---

## 4. Key Platform Features Checklist
- [x] **Universal Hamburger Menu**: Click top-left triple line button or logo to access all tools, drawers, and documents.
- [x] **Probability Model Studio**: Build custom linear, logistic, and AI regression models with feature weight sliders.
- [x] **Kalshi Contract Analyzer**: Live orderbook prices, multi-agent bull/bear debates, and resolution criteria.
- [x] **3-Check Volatility**: Real-time tick recorder with Green Up and Red Down directional arrows.
- [x] **Interactive Walkthrough Bot**: Click the floating assistant in the bottom right corner for immediate step-by-step guidance!
