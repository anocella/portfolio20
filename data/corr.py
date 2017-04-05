# -*- coding: utf-8 -*-

import sqlite3
from scipy.stats.stats import pearsonr

conn = sqlite3.connect('data.db')
c = conn.cursor()

data = c.execute('select gold, preferred, igcorp, hycorp, leveragedloan, emerging, realestate, mediumtreasury, longtreasury, tips, commodities, developedexus, largecap, midcap, smallcap from returns').fetchall()
corr = []
for x in range(len(data[0])):
    row = []
    for y in range(len(data[0])):
        row.append(pearsonr([ret[x] for ret in data], [ret[y] for ret in data])[0])
    corr.append(tuple(row))
        
print(corr)

c.close()
conn.close()