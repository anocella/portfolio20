function results = get_optimized_portfolios(filename, years, freq, NumPorts)

[aRetSeries,txt,~] = xlsread(filename);
dates = datenum(txt(2:end,1));
assets = txt(1,2:end);

omgs = nan(length(years),length(assets));
returns = nan(length(years),1);
risks = nan(length(years),1);
sharpes = nan(length(years),1);

for idx = 1:length(years)
    numYears = years(idx);
    if numYears*freq < length(dates)
        RetSeries = aRetSeries(end-numYears*freq+1:end,:);
    end
    
    [opt_wts, opt_return, opt_risk, opt_sharpe, ~] = portfolio_optimization(RetSeries, freq, NumPorts);
    omgs(idx,:) = opt_wts';
    returns(idx) = opt_return;
    risks(idx) = opt_risk;
    sharpes(idx) = opt_sharpe;
end
results = [{'Years'},{'Portfolio Return'},{'Portfolio Risk'},{'Sharpe Ratio'},assets;...
    num2cell(years'),num2cell(returns),num2cell(risks),num2cell(sharpes),num2cell(omgs)];