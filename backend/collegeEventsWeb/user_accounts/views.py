from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserRegistrationSerializer, LoginSerializer, UserSerializer
from .permissions import IsAdmin


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
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
            
            return Response({
                'user': UserSerializer(user).data,
                'token_type': 'Bearer',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Login endpoint.
        Validates credentials and returns JWT tokens.
        Only active users can login.
        """
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token_type': 'Bearer',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Logout endpoint.
        Blacklists the refresh token.
        """
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get current user information.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


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
