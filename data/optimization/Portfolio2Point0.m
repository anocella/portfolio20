clear 

% Input
filename = 'asset_returns.xlsx';
freq = 252;
NumPorts = 100;

years = [1:10];

results = get_optimized_portfolios(filename, years, freq, NumPorts);
xlswrite('portfolio_optimization_results.xlsx',results)
