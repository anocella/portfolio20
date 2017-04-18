# W209 Course Project
# Portfolio 2.0

import sqlite3
import dateutil.parser as dateparser
import io
import csv
import math
from flask import Flask, Response, abort, render_template, send_from_directory, session
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from scipy.stats.stats import pearsonr
import numpy as np
import pandas as pd
import StringIO

app = Flask(__name__, static_url_path='')
app.secret_key = 'very secret'
api = Api(app)
CORS(app)


class HelloWorld(Resource):
    def get(self):
        return {'hello': 'world'}


class NoData(Exception):
    pass


class CorrelationAPI(Resource):
    def get(self):

        dp = lambda x: dateparser.parse(x).strftime('%Y-%m-%d')

        parser = reqparse.RequestParser()
        parser.add_argument('startDate', type=str)
        parser.add_argument('endDate', type=str)
        args = parser.parse_args()

        conn = sqlite3.connect('data/data.db')
        c = conn.cursor()

        data = c.execute("""
                         SELECT gold, preferred, igcorp, hycorp, leveragedloan, emerging,
                         realestate, mediumtreasury, longtreasury, tips, commodities, developedexus,
                         largecap, midcap, smallcap
                         FROM returns
                         WHERE date BETWEEN ? AND ?
                         """, (dp(args.startDate), dp(args.endDate))).fetchall()
        print(dp(args.startDate))
        print(dp(args.endDate))
        if not data:
            abort(400)
        else:
            print(data[0])
        corr = []
        for x in range(len(data[0])):
            row = []
            for y in range(len(data[0])):
                row.append(pearsonr([ret[x] for ret in data], [ret[y] for ret in data])[0])
            corr.append(tuple(row))
        assetNames = ("Gold", "Pref Eq", "IG Corps", "HY Corps",
                      "Bank Loans", "Emerging Eq", "Real Estate", "Medium Treas",
                      "Long Treas", "TIPS", "Commodities", "Dev Int Eq",
                      "LargeCap Eq", "MidCap Eq", "SmallCap Eq")
        dest = io.BytesIO()
        writer = csv.writer(dest)
        writer.writerow(tuple(" ") + assetNames)
        for x in range(len(corr)):
            writer.writerow(tuple([assetNames[x]]) + corr[x])
        print('Correlation API return')
        return Response(dest.getvalue(), mimetype="text")


class ScatterplotAPI(Resource):
    def get(self):
        dp = lambda x: dateparser.parse(x).strftime('%Y-%m-%d')

        parser = reqparse.RequestParser()
        parser.add_argument('startDate', type=str)
        parser.add_argument('endDate', type=str)
        args = parser.parse_args()

        conn = sqlite3.connect('data/data.db')
        c = conn.cursor()

        data = c.execute("""
                 SELECT gold, preferred, igcorp, hycorp, leveragedloan, emerging,
                 realestate, mediumtreasury, longtreasury, tips, commodities, developedexus,
                 largecap, midcap, smallcap
                 FROM returns
                 WHERE date BETWEEN ? AND ?
                 """, (dp(args.startDate), dp(args.endDate))).fetchall()

        if not data:
            abort(400)
        else:
            print(data[0])
        sp = []
        for x in range(len(data[0])):
            row = []
            row.append(np.mean([ret[x] for ret in data]) * 260 * 100)
            row.append(np.std([ret[x] for ret in data]) * np.sqrt(260) * 100)
            sp.append(tuple(row))
        assetNames = ("Gold", "Pref Eq", "IG Corps", "HY Corps",
                      "Bank Loans", "Emerging Eq", "Real Estate", "Medium Treas",
                      "Long Treas", "TIPS", "Commodities", "Dev Int Eq",
                      "LargeCap Eq", "MidCap Eq", "SmallCap Eq")
        dest = io.BytesIO()
        writer = csv.writer(dest)
        writer.writerow(("asset", "mean", "std", "category"))
        for x in range(len(sp)):
            writer.writerow(tuple([assetNames[x]]) + sp[x] + tuple([self.getCategory(assetNames[x])]))
        print('Scatterplot API return')
        return Response(dest.getvalue(), mimetype="text")

    @staticmethod
    def getCategory(assetName):
        categories = dict()
        categories['Gold'] = 'Commodities'
        categories['Commodities'] = 'Commodities'
        categories['Pref Eq'] = 'Equity'
        categories['IG Corps'] = 'Corporate Debt'
        categories['HY Corps'] = 'Corporate Debt'
        categories['Bank Loans'] = 'Corporate Debt'
        categories['Emerging Eq'] = 'Equity'
        categories['Real Estate'] = 'Real Estate'
        categories['Medium Treas'] = 'Treasuries'
        categories['Long Treas'] = 'Treasuries'
        categories['TIPS'] = 'Treasuries'
        categories['Dev Int Eq'] = 'Equity'
        categories['LargeCap Eq'] = 'Equity'
        categories['MidCap Eq'] = 'Equity'
        categories['SmallCap Eq'] = 'Equity'
        return categories[assetName]


class PerformanceAPI(Resource):
    @staticmethod
    def get_weights(portName):
        # 60% stocks, 40% bonds
        stocks = .6
        bonds = .4

        # stocks
        smallcap = .1
        midcap = .3
        largecap = .6

        # bonds
        igcorp = .5
        longT = .25
        medT = .25
        all_weights = {
            u'my_port1': {
                u'Gold': .2,
                u'Preferred': .2,
                u'IGCorp': .1,
                u'HYCorp': .2,
                u'LevLoan': .05,
                u'Emerging': .15,
                u'RealEstate': 0,
                u'MedTreas': 0,
                u'LongTreas': 0,
                u'TIPS': 0,
                u'GSCI': 0,
                u'DevXUS': 0,
                u'LargeCap': 0,
                u'MidCap': 0,
                u'SmallCap': 0,
            },
            u'my_port2': {
                u'Gold': .05,
                u'Preferred': .05,
                u'IGCorp': .05,
                u'HYCorp': .05,
                u'LevLoan': .05,
                u'Emerging': .05,
                u'RealEstate': .05,
                u'MedTreas': .05,
                u'LongTreas': .05,
                u'TIPS': .15,
                u'GSCI': .05,
                u'DevXUS': .05,
                u'LargeCap': .1,
                u'MidCap': .05,
                u'SmallCap': .05,
            },
            u'cash': {
                u'Gold': .0,
                u'Preferred': .0,
                u'IGCorp': .0,
                u'HYCorp': .0,
                u'LevLoan': .0,
                u'Emerging': .0,
                u'RealEstate': .0,
                u'MedTreas': .0,
                u'LongTreas': .0,
                u'TIPS': .0,
                u'GSCI': .0,
                u'DevXUS': .0,
                u'LargeCap': .0,
                u'MidCap': .0,
                u'SmallCap': .0,
            },
            u'port6040': {
                u'Gold': .0,
                u'Preferred': .0,
                u'IGCorp': igcorp * bonds,
                u'HYCorp': .0,
                u'LevLoan': .0,
                u'Emerging': .0,
                u'RealEstate': .0,
                u'MedTreas': medT * bonds,
                u'LongTreas': longT * bonds,
                u'TIPS': .0,
                u'GSCI': .0,
                u'DevXUS': .0,
                u'LargeCap': largecap * stocks,
                u'MidCap': midcap * stocks,
                u'SmallCap': smallcap * stocks,
            },
            u'all_equity': {
                u'Gold': .0,
                u'Preferred': .0,
                u'IGCorp': .0,
                u'HYCorp': .0,
                u'LevLoan': .0,
                u'Emerging': .0,
                u'RealEstate': 0,
                u'MedTreas': 0,
                u'LongTreas': 0,
                u'TIPS': 0,
                u'GSCI': 0,
                u'DevXUS': 0,
                u'LargeCap': 0.5,
                u'MidCap': 0.3,
                u'SmallCap': 0.2,
            },
            u'gold': {
                u'Gold': 1.0,
                u'Preferred': .0,
                u'IGCorp': .0,
                u'HYCorp': .0,
                u'LevLoan': .0,
                u'Emerging': .0,
                u'RealEstate': .0,
                u'MedTreas': .0,
                u'LongTreas': .0,
                u'TIPS': .0,
                u'GSCI': .0,
                u'DevXUS': .0,
                u'LargeCap': .0,
                u'MidCap': .0,
                u'SmallCap': .0,
            },
        }
        return all_weights[portName]

    @staticmethod
    def add_libor(omega):
        omega.set_value(u'LIBOR', 1 - sum(omega))
        return omega

    @staticmethod
    def create_portfolio(asset_returns, omega, begin=None, end=None):
        portfolio_returns = asset_returns.dot(omega)
        if begin:
            portfolio_returns = portfolio_returns.loc[begin:]
        if end:
            portfolio_returns = portfolio_returns.loc[:end]
        return portfolio_returns

    @staticmethod
    def generate_portfolio_nav(portfolio_returns, begin_nav=100):
        return (portfolio_returns + 1).cumprod() * begin_nav

    @staticmethod
    def rolling_portfolio_vol(portfolio_returns, window=252):
        return portfolio_returns.rolling(window=window, center=False).std() * math.sqrt(252)
        # return pd.rolling_std(returns, window=window)*math.sqrt(252)

    @staticmethod
    def portfolio_drawdown(portfolio_returns):
        nav = (portfolio_returns + 1).cumprod()
        max_nav = nav.expanding(min_periods=1).max()
        bDate = nav.index[0]
        dd = pd.Series(1., index=[bDate])
        for date in nav.index[1:]:
            if nav.loc[date] < max_nav.loc[date]:
                loc = nav.index.get_loc(date)
                dd.set_value(date, dd.iloc[-1] * (portfolio_returns.iloc[loc] + 1))
            else:
                dd.set_value(date, 1.)
        return dd - 1.0

    @staticmethod
    def rolling_portfolio_sharpe_ratio(portfolio_returns, libor_returns, window=252):
        libor_returns = libor_returns[libor_returns.index.isin(portfolio_returns.index)]
        r = portfolio_returns.rolling(window=window, center=False).apply(lambda x: np.prod(1 + x) - 1)
        rf = libor_returns.rolling(window=window, center=False).apply(lambda x: np.prod(1 + x) - 1)
        sig = PerformanceAPI.rolling_portfolio_vol(portfolio_returns, window=window)
        return (r - rf) / sig

    @staticmethod
    def generate_performance_measures(asset_returns, weights, begin=None, end=None, begin_nav=100):
        omega = pd.Series(weights)
        omega = PerformanceAPI.add_libor(omega)
        port_rets = PerformanceAPI.create_portfolio(asset_returns, omega, begin=begin, end=end)
        port_vol = PerformanceAPI.rolling_portfolio_vol(port_rets)
        port_nav = PerformanceAPI.generate_portfolio_nav(port_rets, begin_nav)
        dd = PerformanceAPI.portfolio_drawdown(port_rets)
        sharpe = PerformanceAPI.rolling_portfolio_sharpe_ratio(port_rets, asset_returns['LIBOR'])
        return pd.concat([port_rets, port_vol, port_nav, dd, sharpe], axis=1).rename(
            columns={0: 'Return', 1: 'Volatility', 2: 'NAV', 3: 'Drawdown', 4: 'Sharpe'})

    @staticmethod
    def combine_portfolios(port1, port2):
        keys1 = port1.columns
        values1 = 'port1_' + keys1
        port1 = port1.rename(
            columns=dict(zip(keys1, values1)))

        keys2 = port2.columns
        values2 = 'port2_' + keys2
        port2 = port2.rename(
            columns=dict(zip(keys2, values2)))

        return pd.concat([port1, port2], axis=1)

    def get(self):
        print('Performance API')
        dp = lambda x: dateparser.parse(x).strftime('%Y-%m-%d')

        parser = reqparse.RequestParser()
        parser.add_argument('startDate', type=str)
        parser.add_argument('endDate', type=str)
        parser.add_argument('portName1', type=str)
        parser.add_argument('portName2', type=str)
        args = parser.parse_args()

        print('Start date: {}'.format(dp(args.startDate)))
        print('End date: {}'.format(dp(args.endDate)))
        print('Portfolio 1: {}'.format(args.portName1))
        print('Portfolio 2: {}'.format(args.portName2))

        cnx = sqlite3.connect('data/perf/portfolio_data.db')
        asset_returns = pd.read_sql_query('SELECT * FROM Returns', con=cnx, index_col='Date')

        # get your port from session object
        if args.portName1 == 'my_port' and session['my_port'] is not None:
            weights1 = session['my_port']
        else:
            weights1 = PerformanceAPI.get_weights(args.portName1)

        weights2 = PerformanceAPI.get_weights(args.portName2)

        port1 = PerformanceAPI.generate_performance_measures(asset_returns,
                                                             weights1,
                                                             begin=dp(args.startDate),
                                                             end=dp(args.endDate),
                                                             begin_nav=100)
        port2 = PerformanceAPI.generate_performance_measures(asset_returns,
                                                             weights2,
                                                             begin=dp(args.startDate),
                                                             end=dp(args.endDate),
                                                             begin_nav=100)
        df = PerformanceAPI.combine_portfolios(port1, port2)
        # print df.columns

        print('Performance API return')
        dest = io.BytesIO()
        df.to_csv(dest, encoding='utf-8')
        return Response(dest.getvalue(), mimetype="text")


class OptimizationAPI(Resource):
    @staticmethod
    def get_optimized_port(portName):
        # 60% stocks, 40% bonds
        stocks = .6
        bonds = .4

        # stocks
        smallcap = .1
        midcap = .3
        largecap = .6

        # bonds
        igcorp = .5
        longT = .25
        medT = .25
        all_weights = {
            u'10-years': {
                u'Gold': .2,
                u'Preferred': .2,
                u'IGCorp': .1,
                u'HYCorp': .2,
                u'LevLoan': .05,
                u'Emerging': .15,
                u'RealEstate': 0,
                u'MedTreas': 0,
                u'LongTreas': 0,
                u'TIPS': 0,
                u'GSCI': 0,
                u'DevXUS': 0,
                u'LargeCap': 0,
                u'MidCap': 0,
                u'SmallCap': 0,
            },
            u'5-years': {
                u'Gold': .05,
                u'Preferred': .05,
                u'IGCorp': .05,
                u'HYCorp': .05,
                u'LevLoan': .05,
                u'Emerging': .05,
                u'RealEstate': .05,
                u'MedTreas': .05,
                u'LongTreas': .05,
                u'TIPS': .15,
                u'GSCI': .05,
                u'DevXUS': .05,
                u'LargeCap': .1,
                u'MidCap': .05,
                u'SmallCap': .05,
            },
            u'3-years': {
                u'Gold': .0,
                u'Preferred': .0,
                u'IGCorp': igcorp * bonds,
                u'HYCorp': .0,
                u'LevLoan': .0,
                u'Emerging': .0,
                u'RealEstate': .0,
                u'MedTreas': medT * bonds,
                u'LongTreas': longT * bonds,
                u'TIPS': .0,
                u'GSCI': .0,
                u'DevXUS': .0,
                u'LargeCap': largecap * stocks,
                u'MidCap': midcap * stocks,
                u'SmallCap': smallcap * stocks,
            },
            u'1-year': {
                u'Gold': .0,
                u'Preferred': .0,
                u'IGCorp': igcorp * bonds,
                u'HYCorp': .0,
                u'LevLoan': .0,
                u'Emerging': .0,
                u'RealEstate': .0,
                u'MedTreas': medT * bonds,
                u'LongTreas': longT * bonds,
                u'TIPS': .0,
                u'GSCI': .0,
                u'DevXUS': .0,
                u'LargeCap': largecap * stocks,
                u'MidCap': midcap * stocks,
                u'SmallCap': smallcap * stocks,
            },
            u'cash': {
                u'Gold': .0,
                u'Preferred': .0,
                u'IGCorp': .0,
                u'HYCorp': .0,
                u'LevLoan': .0,
                u'Emerging': .0,
                u'RealEstate': .0,
                u'MedTreas': .0,
                u'LongTreas': .0,
                u'TIPS': .0,
                u'GSCI': .0,
                u'DevXUS': .0,
                u'LargeCap': .0,
                u'MidCap': .0,
                u'SmallCap': .0,
            },
        }
        return all_weights[portName]

    def get(self):

        parser = reqparse.RequestParser()
        parser.add_argument('ret', type=str)
        parser.add_argument('out', type=str)

        for i in range(1, 15):
            parser.add_argument('asset' + str(i), type=str)
            parser.add_argument('your_alloc' + str(i), type=str)
        args = parser.parse_args()

        if args.ret == '10-years':
            sd = '2007-03-31'
            ed = '2017-03-31'
        elif args.ret == '5-years':
            sd = '2012-03-31'
            ed = '2017-03-31'
        elif args.ret == '3-years':
            sd = '2014-03-31'
            ed = '2017-03-31'
        else:
            sd = '2016-03-31'
            ed = '2017-03-31'

        # re-construct your portfolio dict
        my_port = OptimizationAPI.get_optimized_port('cash')
        for i in range(1, 15):
            try:
                val = float(args['your_alloc' + str(i)])
            except ValueError:
                val = 0.0

            key = args['asset' + str(i)]
            if key == '':
                continue

            if key in my_port:
                my_port[key] += val / 100
            else:
                my_port[key] = val / 100

        # store portfolio to the session object
        session['my_port'] = my_port

        optimized_port = OptimizationAPI.get_optimized_port(args.ret)

        if args.out == 'comparison_tbl':
            cnx = sqlite3.connect('data/perf/portfolio_data.db')
            asset_returns = pd.read_sql_query('SELECT * FROM Returns', con=cnx, index_col='Date')

            port1 = PerformanceAPI.generate_performance_measures(asset_returns,
                                                                 optimized_port,
                                                                 begin=sd,
                                                                 end=ed,
                                                                 begin_nav=100)
            port2 = PerformanceAPI.generate_performance_measures(asset_returns,
                                                                 my_port,
                                                                 begin=sd,
                                                                 end=ed,
                                                                 begin_nav=100)
            print(port1['Return'].sum())
            print(port2['Return'].sum())
            dest = StringIO.StringIO()
            dest.write("Portfolio\tCumulative Return(%)\tMax. Volatility\tMax. Drawdown\tMax. Sharpe\n")
            dest.write("Optimized Portfolio\t"
                       + str(round(port1['Return'].sum() * 100, 4)) + "\t"
                       + str(round(port1['Volatility'].max(), 4)) + "\t"
                       + str(round(port1['Drawdown'].min(), 4)) + "\t"
                       + str(round(port1['Sharpe'].max(), 4)) + "\n")
            dest.write("My Portfolio\t"
                       + str(round(port2['Return'].sum() * 100, 4)) + "\t"
                       + str(round(port2['Volatility'].max(), 4)) + "\t"
                       + str(round(port2['Drawdown'].min(), 4)) + "\t"
                       + str(round(port2['Sharpe'].max(), 4)) + "\n")

            print dest.getvalue()
            return Response(dest.getvalue(), mimetype="text")

        else:
            dest = StringIO.StringIO()
            dest.write("asset\tallocation\n")
            for key, value in optimized_port.iteritems():
                dest.write(key + "\t" + "%.2f" % (value * 100) + "\n")

            print dest.getvalue()
            return Response(dest.getvalue(), mimetype="text")


api.add_resource(HelloWorld, '/hello')
api.add_resource(CorrelationAPI, '/corr')
api.add_resource(PerformanceAPI, '/perf')
api.add_resource(OptimizationAPI, '/opti')
api.add_resource(ScatterplotAPI, '/scatter')


@app.route('/')
@app.route('/index.html')
def index(name=None):
    return render_template('index.html', name=name)


@app.route('/correlation.html')
def correlation(name=None):
    return render_template('correlation.html', name=name)


@app.route('/performance.html')
def performance(name=None):
    return render_template('performance.html', name=name)


@app.route('/optimizer.html')
def optimizer(name=None):
    return render_template('optimizer.html', name=name)


@app.route('/contact.html')
def contact(name=None):
    return render_template('contact.html', name=name)


@app.route('/datepicker.html')
def datepicker(name=None):
    return render_template('datepicker.html', name=name)


@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)


@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('data', path)


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')
