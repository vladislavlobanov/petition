DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures(
     id SERIAL PRIMARY KEY, 
     first VARCHAR NOT NULL,
     last VARCHAR NOT NULL,
     signature VARCHAR NOT NULL,
     date VARCHAR NOT NULL,
     user_id INT NOT NULL REFERENCES users(id)
 );

 DROP TABLE IF EXISTS users;

 CREATE TABLE users(
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL,
     last VARCHAR NOT NULL,
     email VARCHAR UNIQUE NOT NULL,
     date VARCHAR NOT NULL,
     hashed_password VARCHAR NOT NULL
     
 ); 
