import sqlite3
import dateutil.parser as dateparser
import io
import csv
from flask import Flask, Response, abort, render_template, send_from_directory
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from scipy.stats.stats import pearsonr

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
        dest = io.StringIO()
        writer = csv.writer(dest, quoting=csv.QUOTE_NONNUMERIC)
        writer.writerow(tuple(" ") + assetNames)
        for x in range(len(corr)):
            writer.writerow(tuple([assetNames[x]]) + corr[x])
        return Response(dest.getvalue(), mimetype="text")
    
api.add_resource(HelloWorld, '/hello')
api.add_resource(CorrelationAPI, '/corr')

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
    app.run(debug=False)