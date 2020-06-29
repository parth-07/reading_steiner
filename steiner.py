import numpy as np
import sys
from docopt import docopt
import connection
import sketch

program_doc = \
"""Reading Steiner 

Usage:
    steiner.py [<username>] [<password>]
    steiner.py [-u USERNAME | --username USERNAME] [-p PASSWORD | --password PASSWORD]
    steiner.py (-h | --help)

Options:
    -h --help                           Show this screen
    -u USERNAME --username USERNAME     Specify username 
    -p PASSWORD --password PASSWORD     Enter password , leave this password flag to enter password in secure way

"""
arguments = docopt(program_doc, version='Reading Steiner 1.0.0')

# print(type(arguments))
# print(arguments)

#Handing login / register
username = arguments['<username>'] or arguments['--username']
password = arguments['<password>'] or arguments['--password']
isNewUser = False

if not username :
    isNewUser = input("New user? (y/n) : ")
    isNewUser = (isNewUser == 'y')

if not isNewUser :
    data = connection.login(username,password)
    # print(data)    
    if data :
        sketch.init(data)
        # print(sketch.session.headers)
        # print(sketch.session.request.headers)
        sketch.welcome()
    else :
        print("Login failed")
else :
    connection.create_account()
    pass


