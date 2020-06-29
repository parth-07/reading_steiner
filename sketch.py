import requests 
import connection
import sys

session = None 

def init(token) :
    if isinstance(token,dict) :
        global session
        session = requests.session()
        session.headers.update(token)
    
def view_profile() :
    sensitive_info = ['userid','password','account_created']
    bio_data = connection.get_user_information(session)
    if not bio_data :
        return
    for key,value in bio_data.items() :
        if key not in sensitive_info :
            print(key,":",value)
        
def log_off() :
    error = connection.logoff(session)
    if error :
        print("Log off failed")
        print(error)
    else :
        print("Successfully logged off")
        sys.exit(1)


def update_divergence() : 
    progress_update_status = connection.get_progress_updated_status(session)
    if progress_update_status :
        print("Progress already updated for today")
        return
    questions = connection.get_performance_questions(session)
    if not questions :
        return
    answers = []
    for question in questions :
        ans = input(question + " : ")
        answers.append(ans)
    print(answers) 
    

profile_functions = {
    1 : view_profile,
    2 : update_divergence,
    3 : log_off,
}

def welcome() :
    if not session :
        print("Not logged in")
        return
    bio_data = connection.get_user_information(session)
    # print(bio_data)
    print("Welcome",bio_data['username'])
    print("divergence meter reading :",bio_data['divergence_number'])
    print("Worldline :",bio_data['worldline'])
    while True :
        print()
        print("What would you like to do ?")
        print("1. View Profile")
        print("2. Update divergence reading by today's performance")
        print("3. Log out")
        choice = input()
        profile_functions[int(choice)]() 
    

