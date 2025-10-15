"""
Distance calculation utilities using Haversine formula
for calculating distances between geographical coordinates
"""

import math
from typing import Optional

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees) using the Haversine formula

    Args:
        lat1: Latitude of point 1 (decimal degrees)
        lon1: Longitude of point 1 (decimal degrees)
        lat2: Latitude of point 2 (decimal degrees)
        lon2: Longitude of point 2 (decimal degrees)

    Returns:
        Distance in kilometers

    Example:
        >>> calculate_distance(1.3470, 103.6802, 1.3424, 103.6824)
        0.545  # ~0.5 km
    """
    # Radius of Earth in kilometers
    R = 6371.0

    # Convert decimal degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Calculate differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Distance in kilometers
    distance = R * c

    return round(distance, 2)


def calculate_walking_time(distance_km: float, walking_speed_kmh: float = 5.0) -> int:
    """
    Calculate estimated walking time based on distance

    Args:
        distance_km: Distance in kilometers
        walking_speed_kmh: Average walking speed in km/h (default: 5 km/h)

    Returns:
        Walking time in minutes (rounded up)

    Example:
        >>> calculate_walking_time(0.5)
        6  # minutes
    """
    if distance_km <= 0:
        return 0

    # Calculate time in hours, convert to minutes
    time_hours = distance_km / walking_speed_kmh
    time_minutes = time_hours * 60

    # Round up to nearest minute (always show at least 1 minute)
    return max(1, math.ceil(time_minutes))


def get_distance_and_time(
    user_lat: float,
    user_lon: float,
    stall_lat: Optional[float],
    stall_lon: Optional[float]
) -> tuple[Optional[float], Optional[int]]:
    """
    Calculate both distance and walking time between user and stall

    Args:
        user_lat: User's latitude
        user_lon: User's longitude
        stall_lat: Stall's latitude (can be None)
        stall_lon: Stall's longitude (can be None)

    Returns:
        Tuple of (distance_km, walking_time_minutes)
        Returns (None, None) if stall coordinates are not available

    Example:
        >>> get_distance_and_time(1.3470, 103.6802, 1.3424, 103.6824)
        (0.54, 6)
    """
    if stall_lat is None or stall_lon is None:
        return None, None

    distance = calculate_distance(user_lat, user_lon, stall_lat, stall_lon)
    walking_time = calculate_walking_time(distance)

    return distance, walking_time


def format_distance(distance_km: Optional[float]) -> str:
    """
    Format distance for display

    Args:
        distance_km: Distance in kilometers

    Returns:
        Formatted distance string

    Example:
        >>> format_distance(0.54)
        "0.5 km"
        >>> format_distance(1.23)
        "1.2 km"
        >>> format_distance(None)
        "N/A"
    """
    if distance_km is None:
        return "N/A"

    if distance_km < 1:
        # Show one decimal place for distances < 1 km
        return f"{distance_km:.1f} km"
    else:
        # Show one decimal place for larger distances
        return f"{distance_km:.1f} km"


def format_walking_time(minutes: Optional[int]) -> str:
    """
    Format walking time for display

    Args:
        minutes: Walking time in minutes

    Returns:
        Formatted time string

    Example:
        >>> format_walking_time(6)
        "~6 min walk"
        >>> format_walking_time(None)
        "N/A"
    """
    if minutes is None:
        return "N/A"

    return f"~{minutes} min walk"
