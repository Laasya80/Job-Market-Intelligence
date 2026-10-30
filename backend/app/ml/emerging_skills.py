import pandas as pd
import numpy as np
from typing import List, Dict, Any

class EmergingSkillsEngine:
    """Calculates smoothed growth rates, market share, and blended emerging scores for skills over time."""

    def __init__(self, growth_weight: float = 0.50, market_share_weight: float = 0.30, volume_weight: float = 0.20):
        self.growth_weight = growth_weight
        self.market_share_weight = market_share_weight
        self.volume_weight = volume_weight

    def calculate_emerging_skills(self, skill_monthly_df: pd.DataFrame, total_jobs: int) -> List[Dict[str, Any]]:
        """
        Input DataFrame columns: ['skill', 'category', 'month', 'count']
        Sorted by month ascending.
        """
        if skill_monthly_df.empty:
            return []

        # Get the two most recent distinct months
        all_months = sorted(skill_monthly_df['month'].unique())
        if len(all_months) < 2:
            # Single period fallback
            cur_month = all_months[0] if all_months else "2026-02"
            prev_month = cur_month
        else:
            cur_month = all_months[-1]
            prev_month = all_months[-2]

        cur_data = skill_monthly_df[skill_monthly_df['month'] == cur_month].set_index('skill')
        prev_data = skill_monthly_df[skill_monthly_df['month'] == prev_month].set_index('skill')
        all_skills = skill_monthly_df[['skill', 'category']].drop_duplicates()

        results = []
        raw_metrics = []

        for _, row in all_skills.iterrows():
            s_name = row['skill']
            cat = row['category']
            cur_count = int(cur_data.loc[s_name, 'count']) if s_name in cur_data.index else 0
            prev_count = int(prev_data.loc[s_name, 'count']) if s_name in prev_data.index else 0
            
            # Total count across all recorded months
            total_skill_count = int(skill_monthly_df[skill_monthly_df['skill'] == s_name]['count'].sum())

            # Growth rate formula with smoothing
            growth_rate = ((cur_count - prev_count) / max(prev_count, 1)) * 100.0
            # Market share
            market_share = (total_skill_count / max(total_jobs, 1)) * 100.0

            raw_metrics.append({
                "skill": s_name,
                "category": cat,
                "current_period_count": cur_count,
                "previous_period_count": prev_count,
                "total_mentions": total_skill_count,
                "raw_growth": growth_rate,
                "raw_market_share": market_share,
                "raw_volume": float(total_skill_count)
            })

        if not raw_metrics:
            return []

        df_calc = pd.DataFrame(raw_metrics)

        # Min-max normalize components for balanced composite scoring
        def min_max_scale(series: pd.Series) -> pd.Series:
            s_min, s_max = series.min(), series.max()
            if s_max == s_min:
                return pd.Series(0.5, index=series.index)
            return (series - s_min) / (s_max - s_min)

        # Clip extreme growth outliers before scaling
        df_calc['clipped_growth'] = df_calc['raw_growth'].clip(-100, 300)
        norm_growth = min_max_scale(df_calc['clipped_growth'])
        norm_share = min_max_scale(df_calc['raw_market_share'])
        norm_volume = min_max_scale(df_calc['raw_volume'])

        # Blended Emerging Score
        df_calc['emerging_score'] = (
            norm_growth * self.growth_weight +
            norm_share * self.market_share_weight +
            norm_volume * self.volume_weight
        ) * 100.0

        for _, item in df_calc.iterrows():
            growth_val = round(item['raw_growth'], 2)
            score_val = round(item['emerging_score'], 2)
            
            if growth_val >= 15.0:
                status = "Emerging"
            elif growth_val <= -10.0:
                status = "Declining"
            else:
                status = "Stable"

            results.append({
                "skill": item['skill'],
                "category": item['category'],
                "current_period_count": int(item['current_period_count']),
                "previous_period_count": int(item['previous_period_count']),
                "growth_rate": growth_val,
                "market_share": round(item['raw_market_share'], 2),
                "emerging_score": score_val,
                "status": status
            })

        # Sort descending by emerging score
        results.sort(key=lambda x: x['emerging_score'], reverse=True)
        return results

emerging_skills_engine = EmergingSkillsEngine()
