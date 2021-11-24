import os, sys, subprocess as sp
import urllib2, time

# Simultaneously run selenium webdriver, and gulp with a 60s timeout
# If they're not already there
# THE COMMAND LINE WILL DIE AFTER

gulp = False
webdriver = False

# Run gulp if not already there
try:
    # HEAD request
    urllib2.urlopen("http://localhost:5001").info()
except urllib2.URLError:
    gulp = sp.Popen(["gulp"], shell=True)

# Run Selenium if not already there
try:
    # HEAD request
    urllib2.urlopen("http://localhost:4444").info()
except urllib2.URLError:
    webdriver = sp.Popen(["webdriver-manager", "update"], shell=True)
    webdriver.wait()
    webdriver = sp.Popen(["webdriver-manager", "start"], shell=True)

time.sleep(60)

if webdriver:
    sp.Popen("TASKKILL /F /PID {pid} /T".format(pid=webdriver.pid))

if gulp:
    sp.Popen("TASKKILL /F /PID {pid} /T".format(pid=gulp.pid))