import os, sys, subprocess as sp
import urllib2, time

def run_gulp_and_selenium():
    # 5 second loading buffer
    try:
        urllib2.urlopen("http://localhost:5001").info()
        urllib2.urlopen("http://localhost:4444").info()
        print("All dependencies (gulp and selenium) are already running ~")
        return
    except urllib2.URLError:
        print("Waiting for gulp and protractor to load...")
        print("Starting in ...")
        for i in range(10, 0, -1):
            print("               {}".format(str(i)))
            time.sleep(1)

    # Start ONLY if gulp and protractor are is already running
    # [script provided in 'test_reqs']
    try:
        # HEAD request
        urllib2.urlopen("http://localhost:5001").info()
    except urllib2.URLError:
        print("PLEASE RUN GULP IN PARRALLEL FIRST")
        sys.exit()
        
    try:
        # HEAD request
        urllib2.urlopen("http://localhost:4444").info()
    except urllib2.URLError:
        print("PLEASE RUN SELENIUM IN PARRALLEL FIRST")
        sys.exit()

def find_test_files():
    # Find Protractor config file and Mocha files
    directories = [f for f in os.listdir(".") 
                     if os.path.isdir(f)
                     and "test" in f]

    mocha_files = { os.path.join(path, f)
                    for dir in directories
                    for path, dirs, files in os.walk(dir)
                    for f in files
                    if f.endswith(".js") and f.startswith("mocha") }

    prtctr_files = { os.path.join(path, f)
                     for dir in directories
                     for path, dirs, files in os.walk(dir)
                     for f in files
                     if f == "protractor.config.js" }

    return [mocha_files, prtctr_files]

def run_test_files(mocha_files, prtctr_files):
    # Run 'em
    for test_file in sorted(mocha_files):
        cmd = ["mocha", os.path.abspath(test_file)]
        process = sp.Popen(cmd, shell=True)
        process.wait()

    for test_file in prtctr_files:
        cmd = ["protractor", os.path.abspath(test_file)]
        process = sp.Popen(cmd, shell=True)
        process.wait()

def main():
    run_gulp_and_selenium()
    run_test_files(*find_test_files())

if __name__ == '__main__':
    main()