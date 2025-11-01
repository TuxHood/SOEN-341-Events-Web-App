import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

url = 'http://127.0.0.1:8000/api/users/login/'
payload = {"email":"123@gmail.com","password":"Moldovan2003"}
req = Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urlopen(req) as resp:
        body = resp.read().decode('utf-8')
        print('STATUS', resp.status)
        print('BODY', body)
except HTTPError as e:
    print('STATUS', e.code)
    print('BODY', e.read().decode('utf-8'))
except Exception as e:
    print('ERROR', e)
