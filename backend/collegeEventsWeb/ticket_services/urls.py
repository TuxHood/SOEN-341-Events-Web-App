# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import TicketViewSet

# router = DefaultRouter()
# router.register(r'tickets', TicketViewSet)

# urlpatterns = [
#     path('', include(router.urls)),
# ]


# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import TicketViewSet

# router = DefaultRouter()
# router.register(r"api/tickets", TicketViewSet, basename="ticket")

# urlpatterns = [
#     path("", include(router.urls)),
# ]



# backend/collegeEventsWeb/ticket_services/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet

app_name = "ticket_services"

router = DefaultRouter()
# Final path becomes /api/tickets/ (clean, no extra 'tickets' segment)
router.register(r"", TicketViewSet, basename="ticket")

urlpatterns = [
    path("", include(router.urls)),
]
