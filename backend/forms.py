from pydantic import BaseModel

class UserRegistration(BaseModel):
    login: str
    password: str

class UserLoginForm(BaseModel):
    login: str
    password: str

class PlaceForm(BaseModel):
    # user_id: int
    name: str
    latitude: float
    longitude: float
    

class ParkingForm(BaseModel):
    number_spaces: int
    latitude: float
    longitude: float


class BookingForm(BaseModel):
    parking_id: int
    numper_spaces: int
    start_date: str
    end_date: str

class NearestParkingForm(BaseModel):
    latitude: float
    longitude: float
    start_time: str
    end_time: str