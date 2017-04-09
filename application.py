
#W209 Course Project
#Portfolio 2.0

from flask import Flask, send_from_directory, render_template, request

app = Flask(__name__, static_url_path='')

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
    app.run()