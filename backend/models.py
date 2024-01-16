from peewee import *
from config import host, port, user, password, db_name


# connection = PostgresqlDatabase(db_name,
#     user=user,
#     password=password,
#     host=host,
#     port=port)

connection = SqliteDatabase('database.db')

class BaseModel(Model):
    class Meta:
        database = connection

class User(BaseModel):
    user_id = AutoField()
    login = CharField(unique=True)
    password = CharField()
    user_places = TextField(null=True)

    class Meta:
        db_table = 'Users'
        order_by = ('user_id',)

class Place(BaseModel):
    place_id = AutoField()
    user_id = IntegerField()
    name = CharField()
    latitude = FloatField()
    longitude = FloatField()

    class Meta:
        db_table = 'Places'
        order_by = ('place_id',)

class Parking(BaseModel):
    parking_id = AutoField()
    number_spaces = IntegerField()
    latitude = FloatField()
    longitude = FloatField()

    class Meta:
        db_table = 'Parkings'
        order_by = ('parking_id',)

class Booking(BaseModel):
    parking_id = IntegerField()
    numper_space = IntegerField()
    user_id = IntegerField()
    start_date = DateTimeField()
    end_date = DateTimeField()

    class Meta:
        db_table = 'Bookings'
        order_by = ('end_date',)