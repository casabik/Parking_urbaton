from fastapi import APIRouter, Body, Depends, Header
from models import User, Place, Parking, Booking, connection
from forms import UserRegistration, UserLoginForm, PlaceForm, ParkingForm, BookingForm, NearestParkingForm
import jwt
from datetime import datetime
import math
import uuid
from peewee import *

router = APIRouter()



SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"


@router.post("/login")
async def login(user_data: UserLoginForm):
    user = User.get(User.login == user_data.login)
    if not user or user_data.password != user.password:
        return {"message": "Invalid login or password"}
    token_content = {"user_id": user.user_id}
    jwt_token = jwt.encode(token_content, SECRET_KEY, algorithm=ALGORITHM)
    return {"token": jwt_token}



@router.post("/registration")
async def registration(user_data: UserRegistration):
    try:
        new_user = User.create(login=user_data.login, password=user_data.password)
        new_user.save()
        return {"message": "User registered successfully"}
    except IntegrityError:
        return {"message": "User with this login already exists"}


@router.post("/create_place")
async def create_place(place_data: PlaceForm, authorization: str = Header(None)):
    payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")
    if user_id is None:
        return {"message": "Invalid token"}
    new_place = Place.create(
        user_id=user_id,
        name=place_data.name,
        latitude=place_data.latitude,
        longitude=place_data.longitude
    )
    new_place.save()
    place_id = new_place.place_id
    user = User.get(User.user_id == user_id)
    if user.user_places == "" or user.user_places is None:
        user.user_places = str(place_id)
    else:
        user.user_places = user.user_places + "," + str(place_id) 
    user.save()
    return {"message": "Place created successfully"}

@router.post("/create_parking")
async def create_parking(place_data: ParkingForm):
    new_parking = Parking.create(
        number_spaces=place_data.number_spaces,
        latitude=place_data.latitude,
        longitude=place_data.longitude
    )
    new_parking.save()
    return {"message": "Parking created successfully"}

@router.get("/get_places")
async def create_parking(authorization: str = Header(None)):
    payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")
    places = User.get(User.user_id == user_id).user_places
    if places == "" or places is None:
        return {
            "message": "No places found",
            "places": []
        }
    else:
        array_places = []
        places = places.split(",")
        for place in places:
            place_info = Place.get(Place.place_id == place)
            temp_dict = {
                "name": place_info.name,
                "latitude": place_info.latitude,
                "longitude": place_info.longitude
            }
            array_places.append(temp_dict)        
        return {"places": array_places}

@router.post("/book_place")
async def book_place(book_data: BookingForm, authorization: str = Header(None)):
    payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")

    book_data.start_date = datetime.strptime(book_data.start_date, '%Y-%m-%d %H:%M:%S')
    book_data.end_date = datetime.strptime(book_data.end_date, '%Y-%m-%d %H:%M:%S')

    new_booking = Booking.create(
        parking_id=book_data.parking_id,
        numper_space=book_data.numper_spaces,
        user_id=user_id,
        start_date=book_data.start_date,
        end_date=book_data.end_date
    )
    new_booking.save()
    return {"message": "Booking created successfully"}


@router.get("/get_bookings")
async def get_bookings(authorization: str = Header(None)):
    payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")
    bookings = Booking.select().where(Booking.user_id == user_id and Booking.end_date > datetime.now())
    print(bookings)
    array_bookings = []
    for booking in bookings:
        parking = Parking.get(Parking.parking_id == booking.parking_id)
        latitude = parking.latitude
        longitude = parking.longitude
        temp_dict = {
            "latitude": latitude,
            "longitude": longitude,
            "numper_spaces": booking.numper_space,
            "start_date": booking.start_date.strftime('%Y-%m-%d %H:%M:%S'),
            "end_date": booking.end_date.strftime('%Y-%m-%d %H:%M:%S'),
        }
        array_bookings.append(temp_dict)
    return {"bookings": array_bookings}
    
def toRad(Value):
    return Value * math.pi / 180;

def calcCrow(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = toRad(lat2 - lat1)
    dLon = toRad(lon2 - lon1)
    lat1 = toRad(lat1)
    lat2 = toRad(lat2)

    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.sin(dLon / 2) * math.sin(dLon / 2) * math.cos(lat1) * math.cos(lat2);
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    d = R * c;
    return d;

@router.post("/get_nearest_parkings")
async def get_nearest_parkings(near_data: NearestParkingForm):
    near_data.start_time = datetime.strptime(near_data.start_time, '%Y-%m-%d %H:%M:%S')
    near_data.end_time = datetime.strptime(near_data.end_time, '%Y-%m-%d %H:%M:%S')
    busy_parkings = Booking.select().where(Booking.start_date > near_data.start_time or Booking.end_date < near_data.end_time)
    busy_parkings = [parking.parking_id for parking in busy_parkings]
    parkings = Parking.select().where(Parking.parking_id.not_in(busy_parkings))
    for parking in parkings:
        lenght = calcCrow(parking.latitude, parking.longitude, near_data.latitude, near_data.longitude)
        parking.lenght = lenght
    parkings = sorted(parkings, key=lambda x: x.lenght)
    if len(parkings) == 0:
        return {"message": "All parkings are busy"}
    else:
        array_parkings = []
        for parking in parkings:
            temp_dict = {
                "parking_id": parking.parking_id,
                "number_spaces": parking.number_spaces,
                "lenght": parking.lenght
            }
            array_parkings.append(temp_dict)
        return {"parkings": array_parkings}