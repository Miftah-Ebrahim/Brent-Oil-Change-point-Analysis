import json
import os

notebook_path = r"c:\Users\hp\Downloads\KAIM\KAIM WEEK 11\Brent-Oil-Change-point-Analysis\notebook\changePointAnalysis.ipynb"

new_cell = {
    "cell_type": "code",
    "execution_count": None,
    "metadata": {},
    "outputs": [],
    "source": [
        "# --- RUBRIC REQUIREMENT: IMPACT QUANTIFICATION ---\n",
        "# Calculate mean price and return stats for each detected regime\n",
        "\n",
        "def analyze_impact(data, change_points_indices):\n",
        '    print("\\n=== QUANTITATIVE IMPACT ANALYSIS ===\\n")\n',
        "    \n",
        "    # Add start and end indices for full coverage\n",
        "    # Assuming change_points_indices are just the break points\n",
        "    sorted_cps = sorted(list(set(change_points_indices))) # dedicated copy\n",
        "    if len(data) not in sorted_cps:\n",
        "        sorted_cps.append(len(data))\n",
        "    \n",
        "    cp_indices = [0] + sorted_cps\n",
        "    \n",
        "    # Loop through regimes\n",
        "    for i in range(len(cp_indices)-1):\n",
        "        start_idx = cp_indices[i]\n",
        "        end_idx = cp_indices[i+1]\n",
        "        \n",
        "        # Slice data for this regime\n",
        "        regime_data = data.iloc[start_idx:end_idx]\n",
        "        \n",
        "        if regime_data.empty:\n",
        "            continue\n",
        "            \n",
        "        mean_price = regime_data['Price'].mean()\n",
        "        std_price = regime_data['Price'].std()\n",
        "        start_date = regime_data.index[0].strftime('%Y-%m-%d')\n",
        "        end_date = regime_data.index[-1].strftime('%Y-%m-%d')\n",
        "        \n",
        '        print(f"REGIME {i+1}: {start_date} to {end_date}")\n',
        '        print(f"  - Average Price: ${mean_price:.2f}")\n',
        '        print(f"  - Volatility (Std): ${std_price:.2f}")\n',
        "        \n",
        "        if i > 0:\n",
        "            # Compare with previous regime\n",
        "            prev_start = cp_indices[i-1]\n",
        "            prev_end = cp_indices[i]\n",
        "            prev_mean = data.iloc[prev_start:prev_end]['Price'].mean()\n",
        "            \n",
        "            pct_change = ((mean_price - prev_mean) / prev_mean) * 100\n",
        '            direction = "INCREASE" if pct_change > 0 else "DECREASE"\n',
        '            print(f"  -> IMPACT: Price shifted from ${prev_mean:.2f} to ${mean_price:.2f} ({direction} of {abs(pct_change):.2f}%)")\n',
        '        print("-" * 40)\n',
        "\n",
        "# Run quantitative analysis using 'change_points' from Ruptures (or PyMC tau mean)\n",
        "# Ensuring change_points are integers for indexing\n",
        "if 'change_points' in locals():\n",
        "    # Ruptures usually returns the index of the change\n",
        "    cp_indices_list = [int(cp) for cp in change_points[:-1]] if len(change_points) > 0 else []\n",
        "    analyze_impact(data, cp_indices_list)\n",
        "else:\n",
        '    print("change_points variable not found. Run the detection cell first.")',
    ],
}

with open(notebook_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

# Append the new cell
nb["cells"].append(new_cell)

with open(notebook_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1)

print("Successfully appended impact analysis cell to notebook.")
