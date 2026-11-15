# NILAM PESUM - Crop Rotation Recommendation Methodology

## 1. Grounded Agricultural References
Agronomic crop requirements, seasonal calendars, nutrient limits, and rotation compatibility rules are grounded directly in the research of:
- **Tamil Nadu Agricultural University (TNAU)**: Agritech Portal (https://agritech.tnau.ac.in/)
- **Indian Council of Agricultural Research (ICAR)**: Crop Institutes (IIRR, IIPR, IIMR, CICR) (https://icar.org.in/)

## 2. Multi-Factor Suitability Scoring Model
For any given candidate crop $C$ and farmland $F$, the suitability score $S(C, F) \in [0, 100]$ is computed as:

$$S(C, F) = (W_C \cdot S_{climate}) + (W_W \cdot S_{water}) + (W_S \cdot S_{soil}) + (W_R \cdot S_{rotation})$$

Where weights depend on the farmer's stated goal:
- **Save Water**: $W_W = 0.45, W_C = 0.20, W_S = 0.15, W_R = 0.20$
- **Improve Soil**: $W_S = 0.35, W_R = 0.25, W_C = 0.20, W_W = 0.20$
- **Reduce Risk**: $W_W = 0.35, W_C = 0.30, W_R = 0.20, W_S = 0.15$
- **Balanced**: $W_W = 0.30, W_C = 0.25, W_S = 0.25, W_R = 0.20$

### Dimension 1: Climate Suitability ($S_{climate}$)
Calculated by comparing observed NASA POWER temperatures ($T_{obs}$) against optimal agronomic bounds $[T_{min}, T_{max}]$:
- If $T_{min} \le T_{obs} \le T_{max}$, $S_{climate} = 95$.
- If $T_{obs} < T_{min}$, $S_{climate} = \max(40, 95 - 8(T_{min} - T_{obs}))$.
- If $T_{obs} > T_{max}$, $S_{climate} = \max(35, 95 - 10(T_{obs} - T_{max}))$.

### Dimension 2: Water Availability ($S_{water}$)
Compares crop seasonal water requirement ($WR_{mm}$) against the combination of historical rainfall and farm irrigation infrastructure (Canal: 1.0, Borewell: 0.85, Open Well: 0.70, Rainfed: 0.35). High-water crops (Paddy $>1100$ mm) are rejected or heavily penalized under rainfed or scarce conditions.

### Dimension 3: Soil Matching ($S_{soil}$)
Validates farmland soil texture (Alluvial, Red Loam, Black Cotton, Clay Loam) against crop root preferences. Legumes (Black Gram, Green Gram, Groundnut) receive soil health bonuses for atmospheric nitrogen fixation.

### Dimension 4: Crop Rotation Compatibility ($S_{rotation}$)
- Heavy feeders (Paddy, Maize) followed by pulses receive a compatibility score of $98/100$ for pest break and nitrogen restoration.
- Continuous monocropping of the same species receives an incompatibility penalty ($45/100$).

## 3. Generated Rotation Plans
The engine generates 3 to 5 distinct rotation alternatives:
1. **Water-Resilient Millet & Pulse Rotation**: (Finger Millet ➔ Black Gram ➔ Sesame)
2. **Soil Restoring Legume-Centric Cycle**: (Groundnut ➔ Green Gram ➔ Finger Millet)
3. **Cauvery Delta Traditional Paddy-Fallow Rotation**: (Samba Paddy ➔ Relay Fallow Black Gram)
4. **Climate-Resilient Dryland Plan**: (Pearl Millet ➔ Sorghum ➔ Black Gram)
5. **Diversified Commercial Strategy**: (Groundnut ➔ Cotton ➔ Sesame)

## 4. Scientific Limitations
- Suitability scores reflect agronomic and environmental favorability; they do not guarantee final grain harvest yield or market price returns.
- Soil moisture inputs are derived from satellite radiometry (NASA SMAP), not laboratory chemical analysis.

