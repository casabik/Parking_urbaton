from models import *
from peewee import *

with connection:
    connection.create_tables([User, Place, Parking, Booking])

print("Done")