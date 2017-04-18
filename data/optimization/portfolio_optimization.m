function [opt_wts, opt_return, opt_risk, opt_sharpe, p] = portfolio_optimization(RetSeries, freq, NumPorts)

[ExpReturn,ExpCovariance,~] = ewstats(RetSeries);

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

opt_wts = PortWts(:,I);
opt_return = PortReturn(I);
opt_risk = PortRisk(I);