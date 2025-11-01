from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Count
from django.db.models.functions import TruncWeek
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
# from user_accounts.permissions import IsAdmin  # (uncomment later if needed)
from event_management.models import Event
from ticket_services.models import Ticket

@api_view(['GET'])
def global_analytics(request):
    try:
        total_events = Event.objects.count()
        total_tickets_issued = Ticket.objects.count()
        unique_attendees = Ticket.objects.values('owner').distinct().count()

        start = now() - timedelta(weeks=12)

        weekly = (
            Ticket.objects.filter(created_at__gte=start)
            .annotate(week=TruncWeek('created_at'))
            .values('week')
            .annotate(tickets_issued=Count('id'))
            .order_by('week')
        )

        by_week = {
            (row['week'].date().isoformat() if row['week'] else None): {
                'week_start': (row['week'].date().isoformat() if row['week'] else None),
                'tickets_issued': row['tickets_issued'],
                'check_ins': 0
            }
            for row in weekly
        }

        used_weekly = (
            Ticket.objects.filter(created_at__gte=start, is_used=True)
            .annotate(week=TruncWeek('created_at'))
            .values('week')
            .annotate(count=Count('id'))
            .order_by('week')
        )
        for row in used_weekly:
            key = row['week'].date().isoformat() if row['week'] else None
            by_week.setdefault(key, {'week_start': key, 'tickets_issued': 0, 'check_ins': 0})
            by_week[key]['check_ins'] = row['count']

        trends = list(by_week.values())

        return Response({
            'total_events': total_events,
            'total_tickets_issued': total_tickets_issued,
            'unique_attendees': unique_attendees,
            'trends_last_12_weeks': trends,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
