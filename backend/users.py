
from pydantic import BaseModel
class Users(BaseModel):
    id: int
    first_name: str
    last_name: str
    user_name : str
    email : str
    phone : str
    password : str
