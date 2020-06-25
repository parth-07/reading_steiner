import getpass
import requests

def login(username , password) : 
    if not username :
        username = input("Username : ")
    if not password :
        password = getpass.getpass("Password : ")
    pass

def create_account() :
    bio_properties = ['username','password','email', 'first_name','last_name'] 
    bio_data = { }
    for key in bio_properties :
        bio_data[key] = input(key + ": ")
    r = requests.post()