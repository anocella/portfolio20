clear

% Input
numYears = 10;
NumPorts = 100;

filename = 'asset_returns.xlsx';
freq = 252;

[RetSeries,txt,~] = xlsread(filename);
dates = datenum(txt(2:end,1));
assets = txt(1,2:end);

if numYears*freq < length(dates)
    dates = dates(end-numYears*freq:end);
    RetSeries = RetSeries(end-numYears*freq:end,:);
end

[ExpReturn,ExpCovariance,NumEffObs] = ewstats(RetSeries);

ExpReturn = (ExpReturn+1).^freq - 1;
ExpCovariance = ExpCovariance * freq;


p = Portfolio;
p = setAssetMoments(p, ExpReturn, ExpCovariance);
p = setDefaultConstraints(p);

PortWts = estimateFrontier(p, NumPorts);
[PortRisk, PortReturn] = estimatePortMoments(p, PortWts);

plotFrontier(p, NumPorts);

% Calculate Sharpe ratio
sharpe = (PortReturn - ExpReturn(end))./PortRisk;
[opt_sharpe,I] = max(sharpe);

opt_wts = [assets',num2cell(PortWts(:,I))];
opt_return = PortReturn(I);
opt_risk = PortRisk(I);