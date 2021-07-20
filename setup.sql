DROP TABLE IF EXISTS signatures;



 CREATE TABLE signatures(
     id SERIAL PRIMARY KEY, 
     signature VARCHAR NOT NULL,
     date VARCHAR NOT NULL,
     user_id INT NOT NULL REFERENCES users(id)
 );

DROP TABLE IF EXISTS users cascade;

 CREATE TABLE users(
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL,
     last VARCHAR NOT NULL,
     email VARCHAR UNIQUE NOT NULL,
     date VARCHAR NOT NULL,
     hashed_password VARCHAR NOT NULL
     
 ); 

DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL UNIQUE REFERENCES users (id),
    age       TEXT,
    city      TEXT,
    homepage  TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)