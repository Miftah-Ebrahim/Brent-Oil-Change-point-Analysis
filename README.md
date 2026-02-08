# Brent Oil Prices Change Point Analysis

> **10 Academy - Week 11 Challenge**: Advanced Time Series Analysis & Bayesian Statistical Modeling

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![PyMC](https://img.shields.io/badge/PyMC-5.0%2B-orange)](https://www.pymc.io/)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-green)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

## 📸 Dashboard Preview

![Dashboard Price Chart](/c:/Users/hp/Downloads/KAIM/KAIM%20WEEK%2011/Brent-Oil-Change-point-Analysis/dashboard_chart.png)
*Interactive price chart showing detected change points and historical events*

![Dashboard Events](/c:/Users/hp/Downloads/KAIM/KAIM%20WEEK%2011/Brent-Oil-Change-point-Analysis/dashboard_events.png)
*Event timeline overlay correlating geopolitical shocks with price movements*

## 📊 Executive Summary

This project analyzes **35+ years of Brent Oil prices** (1987-2022) to identify structural breaks and regime changes using **Bayesian Change Point Detection**. The analysis reveals key moments where political, economic, or supply-demand shocks fundamentally altered oil price dynamics.

### Key Achievements
- ✅ **Statistical Rigor**: Implemented Bayesian inference with PyMC for robust change point detection
- ✅ **Interactive Dashboard**: Flask + React application for real-time visualization  
- ✅ **Production-Ready**: Clean branching strategy, comprehensive documentation, automated workflows

---

## 🎯 Business Need

### Problem Statement
Oil markets are subject to sudden regime shifts caused by:
- 🌍 Geopolitical events (wars, embargoes, sanctions)
- 💰 Economic crises (2008 financial crash, COVID-19)
- 🛢️ Supply shocks (OPEC decisions, shale revolution)

**Challenge**: Traditional time series models assume stability and fail to adapt when the underlying data-generating process changes.

### Our Solution
Bayesian Change Point Detection **automatically identifies** when oil price behavior fundamentally shifts, enabling:
- Risk managers to update hedging strategies
- Traders to detect regime changes early
- Policy makers to understand historical precedents

---

## 🔬 Methodology

### 1. Exploratory Data Analysis (EDA)
**Notebook**: `notebook/EDA.ipynb`

- **Time Series Decomposition**: Trend, seasonality, and residuals
- **Stationarity Testing**: Augmented Dickey-Fuller (ADF) test  
- **Log Returns Analysis**: Stabilize variance for modeling
- **Historical Event Mapping**: Overlay geopolitical events on price chart

**Key Finding**: Raw prices are **non-stationary** (ADF p-value > 0.05), but log returns are stationary— validating the need for differencing.

### 2. Bayesian Change Point Detection
**Notebook**: `notebook/changePointAnalysis.ipynb`

#### Model Architecture
```python
with pm.Model() as model:
    # Priors for unknown change point locations
    tau = pm.DiscreteUniform("tau", lower=0, upper=len(data)-1)
    
    # Priors for mean before/after change point
    mu_1 = pm.Normal("mu_1", mu=0, sigma=1)
    mu_2 = pm.Normal("mu_2", mu=0, sigma=1)
    
    # Shared variance parameter
    sigma = pm.HalfNormal("sigma", sigma=1)
    
    # Likelihood: switch between regimes at tau
    mu = pm.math.switch(obs_idx < tau, mu_1, mu_2)
    likelihood = pm.Normal("likelihood", mu=mu, sigma=sigma, observed=log_returns)
    
    # Bayesian inference via MCMC
    trace = pm.sample(2000, tune=1000, return_inferencedata=True)
```

#### Algorithm: Markov Chain Monte Carlo (MCMC)
- **Sampler**: NUTS (No-U-Turn Sampler) for efficient posterior exploration
- **Convergence**: R-hat < 1.01 for all parameters
- **Posterior Analysis**: ArviZ for trace plots, posterior predictive checks

#### Alternative: Ruptures Library
Used **Pelt algorithm** (Pruned Exact Linear Time) for validation:
```python
import ruptures as rpt
algo = rpt.Pelt(model="rbf").fit(log_returns)
change_points = algo.predict(pen=10)
```

### 3. Interactive Dashboard
**Backend**: `backend/app.py` (Flask REST API)  
**Frontend**: `frontend/src/` (React + Chart.js)

#### Features:
- 📈 **Real-time price chart** with detected change points highlighted
- 🎯 **Event timeline overlay** showing historical oil market events
- 📊 **Statistical summary** (means, variances before/after breaks)
- 🔍 **Regime analysis** breakdown by detected period

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Statistical Modeling** | PyMC | 5.0+ | Bayesian inference engine |
| | ArviZ | 0.11+ | Posterior visualization |
| | Ruptures | 1.1+ | Alternative change point detection |
| **Data Processing** | pandas | 1.3+ | Time series manipulation |
| | NumPy | 1.21+ | Numerical computing |
| | statsmodels | 0.13+ | Statistical tests (ADF) |
| **Visualization** | matplotlib | 3.4+ | Static plots |
| | seaborn | 0.11+ | Statistical graphics |
| **Backend API** | Flask | 2.0+ | REST API framework |
| | Flask-CORS | 3.0+ | Cross-origin resource sharing |
| **Frontend** | React | 18 | UI framework |
| | Chart.js | 3.0+ | Interactive charts |

---

## 📦 Installation Guide

### Prerequisites
- Python 3.8+ with `pip`
- Node.js 14+ (for frontend)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/Miftah-Ebrahim/Brent-Oil-Change-point-Analysis.git
cd Brent-Oil-Change-point-Analysis
```

### Step 2: Set Up Virtual Environment
```bash
python -m venv venv
# Windows
venv\\Scripts\\activate
# macOS/Linux
source venv/bin/activate
```

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Expected packages**:
```
pandas>=1.3.0
numpy>=1.21.0
matplotlib>=3.4.0
seaborn>=0.11.0
statsmodels>=0.13.0
arch>=5.0.0
pymc>=5.0.0
arviz>=0.11.0
ruptures>=1.1.0
flask>=2.0.0
flask-cors>=3.0.0
```

### Step 4: Run Analysis Notebooks
```bash
jupyter notebook notebook/EDA.ipynb
jupyter notebook notebook/changePointAnalysis.ipynb
```

### Step 5: Launch Dashboard

**Backend**:
```bash
cd backend
python app.py
# Server runs on http://localhost:5000
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
npm start
# UI opens at http://localhost:3000
```

---

## 📂 Project Structure

```
Brent-Oil-Change-point-Analysis/
├── data/
│   ├── BrentOilPrices.csv          # Historical price data (1987-2022)
│   └── oil_market_key_events.csv   # Geopolitical events timeline
├── src/
│   ├── oil_price.py                # Plotting and ARIMA utilities
│   ├── preprocessing.py            # Data cleaning functions
│   └── stat.py                     # Statistical modeling (PyMC wrapper)
├── notebook/
│   ├── EDA.ipynb                   # Exploratory analysis
│   └── changePointAnalysis.ipynb   # Bayesian modeling
├── backend/
│   └── app.py                      # Flask REST API
├── frontend/
│   └── src/
│       └── dashboard.jsx           # React dashboard
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

---

## 🔍 Key Findings

### Detected Change Points
The Bayesian model identified **major regime shifts** corresponding to:

| Year | Event | Impact on Oil Prices |
|------|-------|---------------------|
| **1990** | Gulf War | Sharp spike to $40/barrel |
| **1998** | Asian Financial Crisis | Collapse to $10/barrel |
| **2008** | Global Financial Crisis | Peak at $147, crash to $40 |
| **2014** | Shale Oil Boom | Structural break as US production surged |
| **2020** | COVID-19 Pandemic | Historic negative prices |

### Statistical Validation
- **ADF Test on Log Returns**: p-value < 0.01 (stationary ✓)
- **R-hat Convergence**: All parameters < 1.01 (chain convergence ✓)
- **Posterior Predictive Check**: Model captures 95% of observed variance

---

## 🚀 Future Work

1. **Real-Time Monitoring**: Deploy model to detect regime shifts in live data
2. **Multivariate Extensions**: Include macroeconomic indicators (GDP, inflation)
3. **Hierarchical Models**: Account for correlation between different oil grades (WTI, Dubai)
4. **Forecasting**: Use detected regimes as inputs to GARCH models for volatility prediction

---

## 📜 License

This project is developed for educational purposes as part of **10 Academy's Week 11 Challenge**.

---

## 👤 Author

**Miftah Ebrahim**  
📧 Miftah6972@gmail.com  
🔗 [GitHub](https://github.com/Miftah-Ebrahim)

---

## 🙏 Acknowledgments

- **10 Academy** for providing the project framework
- **PyMC Development Team** for the Bayesian inference library
- **U.S. Energy Information Administration (EIA)** for historical oil price data

---

## 📚 References

1. Adams, R. P., & MacKay, D. J. (2007). *Bayesian Online Changepoint Detection*. arXiv:0710.3742
2. Salvatier, J., Wiecki, T. V., & Fonnesbeck, C. (2016). *Probabilistic programming in Python using PyMC3*. PeerJ Computer Science.
3. Truong, C., Oudre, L., & Vayatis, N. (2020). *Selective review of offline change point detection methods*. Signal Processing, 167, 107299.
