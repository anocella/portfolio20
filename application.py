
#W209 Course Project
#Portfolio 2.0

import sqlite3
import dateutil.parser as dateparser
import io
import csv
import math
from flask import Flask, Response, abort, render_template, send_from_directory
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from scipy.stats.stats import pearsonr
import numpy as np
import pandas as pd

app = Flask(__name__, static_url_path='')
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
                         WHERE date between ? and ?
                         """, (dp(args.startDate), dp(args.endDate))).fetchall()
        print(dp(args.startDate))
        print(dp(args.endDate))
        print(data)
        if not data:
            abort(400)
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


class PerformanceAPI(Resource):
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
    def create_6040_weights():
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

        weights = {
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
        }
        return weights

    @staticmethod
    def create_6040_portfolio(asset_returns, begin=None, end=None):

        weights = PerformanceAPI.create_6040_weights()
        omega = pd.Series(weights)
        omega = PerformanceAPI.add_libor(omega)

        return PerformanceAPI.create_portfolio(asset_returns, omega, begin, end)

    @staticmethod
    def generate_portfolio_nav(portfolio_returns, begin_nav=100):
        return (portfolio_returns + 1).cumprod() * begin_nav

    @staticmethod
    def rolling_portfolio_vol(portfolio_returns, window=252):
        return portfolio_returns.rolling(window=window, center=False).std() * math.sqrt(252)
        # return pd.rolling_std(returns, window=window)*math.sqrt(252)

    @staticmethod
    def portfolio_drawdown(portfolio_returns, begin_nav=100):
        nav = PerformanceAPI.generate_portfolio_nav(portfolio_returns, begin_nav)
        bDate = nav.index[0]
        dd = pd.Series(begin_nav, index=[bDate])
        for date in nav.index:
            if date <= bDate:
                pass
            if nav.loc[date] >= max(nav.loc[bDate:date]):
                dd.set_value(date, begin_nav)
            else:
                loc = nav.index.get_loc(date)
                dd.set_value(date, dd.iloc[-1] * nav.iloc[loc] / nav.iloc[loc - 1])
        return dd / 100.0 - 1.0

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
    def add_60_40(asset_returns, my_port, name=None):
        begin = my_port.index[0]
        end = my_port.index[-1]
        weights = PerformanceAPI.create_6040_weights()
        begin_nav = my_port['NAV'][0] / (1 + my_port['Return'][0])

        port6040 = PerformanceAPI.generate_performance_measures(asset_returns, weights, begin=begin, end=end,
                                                                begin_nav=begin_nav)

        keys = port6040.columns
        values = 'port6040_' + keys
        port6040 = port6040.rename(
            columns=dict(zip(keys, values)))

        if name:
            keys = my_port.columns
            values = name + '_' + keys
            my_port = my_port.rename(
                columns=dict(zip(keys, values)))

        return pd.concat([my_port, port6040], axis=1)

    def get(self):
        print('Performance API')
        dp = lambda x: dateparser.parse(x).strftime('%Y-%m-%d')

        parser = reqparse.RequestParser()
        parser.add_argument('startDate', type=str)
        parser.add_argument('endDate', type=str)
        parser.add_argument('portName', type=str)
        args = parser.parse_args()

        print(dp(args.startDate))
        print(dp(args.endDate))
        print(args.portName)

        cnx = sqlite3.connect('data/perf/portfolio_data.db')
        asset_returns = pd.read_sql_query('SELECT * FROM Returns', con=cnx, index_col='Date')
        weights = {
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
        }
        my_port = PerformanceAPI.generate_performance_measures(asset_returns,
                                                               weights,
                                                               begin=dp(args.startDate),
                                                               end=dp(args.endDate),
                                                               begin_nav=100)
        df = PerformanceAPI.add_60_40(asset_returns, my_port, args.portName)
        print
        df.columns

        # df = pd.read_sql_query("""SELECT My.Date AS Date, My.NAV AS MyNAV, My.Drawdown AS MyDD, My.Volatility AS MyVol, My.Sharpe AS MySR,
        #                          SF.NAV AS SFNAV, SF.Drawdown AS SFDD, SF.Volatility SFVol, SF.Sharpe AS SFSR
        #                          FROM MyPortfolio My JOIN Port6040 SF on My.Date = SF.Date
        #                          WHERE My.Date BETWEEN '{0}' AND '{1}'""".format(dp(args.startDate), dp(args.endDate)),
        #                       con=cnx, index_col='Date')

        print('Performance API return')
        dest = io.BytesIO()
        df.to_csv(dest, encoding='utf-8')

        return Response(dest.getvalue(), mimetype="text")


api.add_resource(HelloWorld, '/hello')
api.add_resource(CorrelationAPI, '/corr')
api.add_resource(PerformanceAPI, '/perf')

@app.route('/api/get_optimized_returns', methods=['GET'])
def get_optimized_returns():
    returns = open('data/data.tsv', 'r')
    str_buf = returns.read()
    returns.close()
    return str_buf

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


@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('assets', path)


@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('data', path)


if __name__ == '__main__':
    app.run(debug=False,host='0.0.0.0')



