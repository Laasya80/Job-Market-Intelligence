# JMI — Machine Learning & Data Science Mathematical Methodology

## 1. Blended Emerging Skill Score Formula
To rank technologies by momentum while avoiding small-sample inflation:
$$\text{Emerging Score} = w_1 \cdot \widehat{G} + w_2 \cdot \widehat{S} + w_3 \cdot \widehat{V}$$
Where:
- $\widehat{G} = \text{MinMaxClipped}\left(\frac{C_t - C_{t-1}}{\max(C_{t-1}, 1)}\right)$ is the smoothed Period-over-Period Growth Rate ($w_1 = 0.50$).
- $\widehat{S} = \text{MinMax}\left(\frac{\text{Mentions}}{\text{Total Jobs}}\right)$ is the Market Penetration Share ($w_2 = 0.30$).
- $\widehat{V} = \text{MinMax}(\text{Total Mentions})$ is the Absolute Volume ($w_3 = 0.20$).

## 2. Skill Gap & Learning Roadmap Prioritization
For a candidate $C$ and target role requirements $R = \{ (s_i, w_i) \}$:
$$\text{Match Score} = \frac{\sum_{s_i \in \text{Matched}} w_i + 0.5 \sum_{s_j \in \text{Partial}} w_j}{\sum_{s_k \in R} w_k} \times 100$$

For each missing skill $s_m$, the curriculum priority is scored as:
$$\text{Priority}(s_m) = 0.50 \cdot \text{MarketDemand}(s_m) + 0.30 \cdot \text{GrowthRate}(s_m) + 0.20 \cdot \text{GapWeight}$$

## 3. Unsupervised Job Family Clustering (KMeans)
1. **Corpus Matrix**: We construct TF-IDF representations:
   $$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \log\left(\frac{1 + N}{1 + \text{DF}(t)}\right)$$
2. **KMeans Optimization**: Minimizes inertia over cluster centroids $\mu_k$:
   $$\arg\min_S \sum_{i=1}^{k} \sum_{x \in S_i} \|x - \mu_i\|^2$$
3. **Centroid Keyword Extraction**: Extract top terms per cluster via sorted centroid weight vectors $\mu_{k, j}$.

## 4. Time-Series Demand Anomaly Detection
Calculates rolling $Z$-score across consecutive monthly observation windows:
$$Z = \frac{x_t - \mu_{t-1}}{\sigma_{t-1}}$$
Anomalies are triggered when $Z \ge 1.8$, surfacing high-velocity market surges.
