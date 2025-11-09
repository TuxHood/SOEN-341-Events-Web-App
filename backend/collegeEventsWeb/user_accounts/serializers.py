from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("name", "email", "password", "role")
        extra_kwargs = {"role": {"required": False}}

    def create(self, validated_data):
        role = validated_data.get("role", "student")
        password = validated_data.pop("password")

        # Enforce RBAC rules:
        if role == "organizer":
            status = "pending"  # Organizers need approval
        else:
            role = "student"  # Default to student
            status = "active"  # Students are active immediately

        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=password,
            role=role,
            status=status,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        
        # Authenticate user
        user = authenticate(request=self.context.get("request"), username=email, password=password)
        
        if not user:
            # Manual authentication for custom USERNAME_FIELD=email
            try:
                u = User.objects.get(email=email)
                if not u.check_password(password):
                    raise serializers.ValidationError("Invalid email or password.")
                user = u
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")

        # Check if user is active
        if user.status != "active":
            raise serializers.ValidationError("Account is not active.")
        
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "status", "created_at", "updated_at")


# Keep backward compatibility
RegisterSerializer = UserRegistrationSerializer
