from rest_framework import status, permissions, viewsets, serializers as drf_serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .models import User
from .serializers import UserRegistrationSerializer, LoginSerializer, UserSerializer
from .permissions import IsAdmin


# -------------------------
# Utility Views
# -------------------------
class DebugAuthView(APIView):
    """Dev-only: return auth debug info so frontend can diagnose token/cookie issues."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        info = {
            'http_authorization': request.META.get('HTTP_AUTHORIZATION'),
            'cookies': {k: request.COOKIES.get(k) for k in ['access_token', 'csrftoken']},
            'user_is_authenticated': getattr(request.user, 'is_authenticated', False),
            'user_id': getattr(getattr(request, 'user', None), 'id', None),
        }
        # Try to authenticate via simplejwt directly
        try:
            jwt = JWTAuthentication()
            auth = jwt.authenticate(request)
            info['jwt_authenticate'] = bool(auth)
            if auth:
                user, token = auth
                info['jwt_user_id'] = user.id
        except Exception as e:
            info['jwt_error'] = str(e)

        return Response(info)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFTokenView(APIView):
    """Dev helper: ensure the CSRF cookie is set for the frontend."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"detail": "CSRF cookie set"})


# -------------------------
# JWT Helper
# -------------------------
def set_jwt_cookie(response, access_token, secure=False, samesite="Lax"):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path="/",
        max_age=6 * 60 * 60,  # 6 hours
    )
    return response


# -------------------------
# Authentication Views
# -------------------------
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Register a new user.
        Students get active status immediately.
        Organizers get pending status (need admin approval).
        """
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            
            # Use secure cookie storage
            resp = Response({
                'user': UserSerializer(user).data,
                'token_type': 'Bearer',
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
            
            # Set HTTP-only cookie for access token
            set_jwt_cookie(resp, access_token=access)
            return resp
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Login endpoint with enhanced error handling and secure cookies.
        """
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        # Use better error handling
        try:
            serializer.is_valid(raise_exception=True)
        except drf_serializers.ValidationError as exc:
            # Normalize error shape to {'detail': '...'} so frontend shows a clean message
            def extract_message(d):
                if isinstance(d, dict):
                    v = d.get('detail') if 'detail' in d else next(iter(d.values()), None)
                    return extract_message(v)
                if isinstance(d, (list, tuple)):
                    return extract_message(d[0]) if d else None
                return str(d)
            message = extract_message(exc.detail)
            return Response({'detail': message or 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        
        # Use secure cookie storage
        resp = Response({
            "user": UserSerializer(user).data,
            "token_type": "Bearer",
            "refresh": str(refresh),
        }, status=status.HTTP_200_OK)
        
        set_jwt_cookie(resp, access_token=access)
        return resp


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Enhanced logout with token blacklisting AND cookie removal.
        """
        try:
            # Token blacklisting logic
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            # Continue with logout even if blacklist fails
            pass
        
        # Cookie cleanup
        resp = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        resp.delete_cookie("access_token", path="/")
        return resp


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Get current user information.
        """
        return Response(UserSerializer(request.user).data)


# -------------------------
# ADMIN: Organizer Approval (Your Clean Implementation)
# -------------------------
class PendingOrganizersView(APIView):
    permission_classes = [IsAdmin]
    
    def get(self, request):
        """
        Get all pending organizers (Admin only).
        """
        pending_organizers = User.objects.filter(role='organizer', status='pending')
        serializer = UserSerializer(pending_organizers, many=True)
        return Response(serializer.data)


class ApproveOrganizerView(APIView):
    permission_classes = [IsAdmin]
    
    def post(self, request, user_id):
        """
        Approve a pending organizer (Admin only).
        """
        try:
            user = User.objects.get(id=user_id)
            
            if user.role != 'organizer':
                return Response(
                    {'detail': 'Only organizers can be approved.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if user.status == 'active':
                return Response(
                    {'detail': 'User is already active.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.status = 'active'
            user.is_active = True
            user.save()
            
            return Response({
                'detail': 'Organizer approved successfully.',
                'user': UserSerializer(user).data
            })
        
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class RejectOrganizerView(APIView):
    permission_classes = [IsAdmin]
    
    def post(self, request, user_id):
        """
        Reject a pending organizer (Admin only).
        """
        try:
            user = User.objects.get(id=user_id)
            
            if user.role != 'organizer':
                return Response(
                    {'detail': 'Only organizers can be rejected.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if user.status != 'pending':
                return Response(
                    {'detail': 'Only pending users can be rejected.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.status = 'rejected'
            user.is_active = False
            user.save()
            
            return Response({
                'detail': 'Organizer rejected successfully.',
                'user': UserSerializer(user).data
            })
        
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


# -------------------------
# User ViewSet (For CRUD Operations)
# -------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve_organizer(self, request, pk=None):
        """
        Alternative organizer approval via ViewSet action.
        Can be used alongside dedicated approval views.
        """
        user = self.get_object()
        if user.role == 'organizer' and user.status == 'pending':
            user.status = 'active'
            user.is_active = True
            user.save()
            return Response(
                {"message": f"Organizer {user.name} approved."},
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": "User is not a pending organizer."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def reject_organizer(self, request, pk=None):
        """
        Alternative organizer rejection via ViewSet action.
        Can be used alongside dedicated rejection views.
        """
        user = self.get_object()
        if user.role == 'organizer' and user.status == 'pending':
            user.status = 'rejected'
            user.is_active = False
            user.save()
            return Response(
                {"message": f"Organizer {user.name} rejected."},
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": "User is not a pending organizer."},
            status=status.HTTP_400_BAD_REQUEST
        )
