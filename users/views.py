from django.http import HttpResponse

def home(request):
    return HttpResponse("Users app is working!")
