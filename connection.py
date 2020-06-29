import getpass
import requests
import json
import pandas as pd

BASE = 'http://localhost:3000/'

REGISTER_LINK = BASE + 'auth/register'
LOGIN_LINK = BASE + 'auth/login'
PROFILE_LINK = BASE + 'account/profile'
SIGNOFF_LINK = BASE + 'account/signoff'
QUESTIONS_LINK = BASE + 'account/getquestions'
PROGRESS_UPDATED_LINK = BASE + 'account/progressUpdated'
UPDATE_PROGRESS_LINK = BASE + 'account/updateProgress'

def display_error_info(data) :
    # print(data)
    print("Error :",data.get('error',None))
    if 'message' in data :
        print("Message :",data.get('message',None))


def login(username , password) : 
    res = None
    go_again = False
    while True :
        if not username :
            username = input("Username : ")
        if not password or go_again :
            password = getpass.getpass("Password : ")
        data = {'username' : username , 'password' : password}
        # print(data)
        r = requests.post(LOGIN_LINK,data = data)
        temp_res = json.loads(r.content)
        err = temp_res.get('error',None)
        if err is None :
            res = temp_res
            print("Login Successful")
            break
        else :
            display_error_info(temp_res)
            if temp_res['type'] == 'validation' :
                go_again = (input("Try again(y/n) : ") == 'y')
                if not go_again :
                    break
            else :
                break
    return res    
                    
def logoff(session) :
    logged_off = session.post(SIGNOFF_LINK)
    error = None
    if not logged_off.ok :
        data = json.loads(logged_off.content)
        error = data.get('error',None)
    return error
    


def create_account() :
    bio_properties = ['username','password','email', 'first_name','last_name'] 
    while True :
        bio_data = { }
        for key in bio_properties :
            if 'password' in key :
                bio_data[key] = getpass.getpass(key + ": ")
            else :
                bio_data[key] = input(key + ": ")
        r = requests.post(REGISTER_LINK,data=bio_data)
        res = json.loads(r.content)
        err = res.get('error',None)
        if err is None :
            print("Account created successfully !")
            break
        else :
            display_error_info(res)
            if res['type'] == 'validation' :
                go_again = (input("Try again (y/n) : ") == 'y')
                if  not go_again :
                    break
            else :
                break
            
def get_user_information(session) :
    data = session.post(PROFILE_LINK)
    bio_data = json.loads(data.content)
    return bio_data
    
    
def get_performance_questions(session) :
    data = session.post(QUESTIONS_LINK)
    data = json.loads(data.content)
    # print(data)
    if data.get('err') :
        display_error_info(data) 
        return None
    df = pd.DataFrame(data['questions'])
    df.set_index('qid')
    # print(df.head())
    return list(df['question'])
    

def get_progress_updated_status(session) : 
    r = session.post(PROGRESS_UPDATED_LINK)
    data = json.loads(r.content)
    if data.get('err') :
        display_error_info(data)
        return None
    return data.get('progress_updated')
    
    