# Analysis Workflow & Project Assumptions

## 1. Analysis Workflow

This project follows a structured data science workflow to analyze Brent Oil prices and detect regime changes.

### Step 1: Data Ingestion & Preprocessing
- **Source**: Historical Brent Oil Prices (1987-2022).
- **Cleaning**: 
    - Convert `Date` to datetime objects.
    - Handle missing values (interpolation/dropping).
    - Sort data chronologically.
- **Transformation**: Calculate **Log Returns** ($r_t = \ln(P_t) - \ln(P_{t-1})$) to stabilize variance and achieve stationarity.

### Step 2: Exploratory Data Analysis (EDA)
- **Visual Inspection**: Plot raw price time series to identify obvious trends and volatility clusters.
- **Stationarity Testing**: Perform **Augmented Dickey-Fuller (ADF)** test.
    - $H_0$: Series has a unit root (non-stationary).
    - $H_1$: Series is stationary.
    - *Result*: Prices are non-stationary; Log Returns are stationary.
- **Decomposition**: Analyze trend, seasonality, and residuals.

### Step 3: Bayesian Change Point Detection
- **Model**: Use **PyMC** to build a probabilistic model.
    - **Latent Variable**: Change point $\tau$ (Discrete Uniform prior).
    - **Parameters**: Mean $\mu_1, \mu_2$ and Std Dev $\sigma$ (Normal/HalfNormal priors).
- **Inference**: Use **NUTS (No-U-Turn Sampler)** MCMC algorithm to sample from the posterior distribution.
- **Validation**: Check MCMC convergence using $\hat{R}$ statistics and trace plots.

### Step 4: Event Correlation & Impact Analysis
- **Mapping**: align detected change points (posterior mean of $\tau$) with known geopolitical dates.
- **Quantification**: Calculate average price and volatility before and after each break to quantify the magnitude of the regime shift.

### Step 5: Dashboard Deployment
- **Backend**: Flask API serves processed data and change points.
- **Frontend**: React application visualizes the results interactively.

---

## 2. Assumptions & Limitations

### Stationarity
- **Assumption**: We assume log returns are stationary within each regime (between change points).
- **Limitation**: Volatility clustering (GARCH effects) might violate the constant $\sigma$ assumption in simpler models.

### Independence
- **Assumption**: Daily returns are independent and identically distributed (i.i.d) within regimes.
- **Limitation**: Financial time series often exhibit autocorrelation, which proper time-series specific priors or ARIMA errors would model better.

### Causality vs. Correlation
- **Assumption**: Co-occurrence of a change point and an event implies a relationship.
- **Limitation**: **Correlation does not equal causation.** A change point in 2020 near COVID-19 onset suggests an impact, but other confounding factors (OPEC+ wars) may contribute. We cannot definitively prove the event *caused* the price shift without counterfactual analysis.

---

## 3. Key Events Dataset (Sample)

| Date | Event | Type |
|------|-------|------|
| 1990-08-02 | Iraqi Invasion of Kuwait | Geopolitical |
| 2001-09-11 | 9/11 Attacks | Geopolitical |
| 2008-09-15 | Lehman Brothers Collapse | Economic |
| 2011-02-14 | Arab Spring | Geopolitical |
| 2014-11-27 | OPEC maintains production (Price crash) | Supply Shock |
| 2020-03-08 | Russia-Saudi Oil Price War | Supply Shock |
| 2020-04-20 | COVID-19 Demand Collapse | Demand Shock |
| 2022-02-24 | Russia-Ukraine War | Geopolitical |
