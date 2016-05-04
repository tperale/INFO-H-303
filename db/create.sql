PRAGMA foreign_keys = ON;
PRAGMA busy_timeout=30000; 

CREATE TABLE IF NOT EXISTS establishment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    latitude REAL 
        CHECK(-90<=latitude AND latitude<=90),
    longitude REAL 
        CHECK(-180<=longitude AND longitude<=180),

    name TEXT NOT NULL,

    address_street TEXT NOT NULL,
    address_town TEXT NOT NULL,
    address_number INTEGER NOT NULL,
    address_zip INTEGER NOT NULL,

    phone_number INTEGER(13) NOT NULL,

    website TEXT
        CHECK (website LIKE '%.%.%'),

    picture BLOB,

    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by TEXT,

    FOREIGN KEY (created_by) REFERENCES account (username)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    UNIQUE(latitude, longitude)
);


CREATE TABLE IF NOT EXISTS restaurant (
    id INTEGER PRIMARY KEY NOT NULL REFERENCES establishment(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    price INTEGER NOT NULL,

    seat_number INTEGER NOT NULL,

    takeaway BOOLEAN NOT NULL,

    delivery BOOLEAN NOT NULL,

    timetable INTEGER(7)
        CHECK(0<=timetable AND timetable<=9)
);

CREATE TABLE IF NOT EXISTS bar (
    id INTEGER PRIMARY KEY NOT NULL REFERENCES establishment(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    smokers BOOLEAN,

    snacks BOOLEAN
);

CREATE TABLE IF NOT EXISTS hotel (
    id INTEGER PRIMARY KEY NOT NULL REFERENCES establishment(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    stars INTEGER NOT NULL
        CHECK(0<=stars AND stars<=5),

    room_number INTEGER NOT NULL
        CHECK(0<room_number),

    price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
    username TEXT PRIMARY KEY NOT NULL,

    email TEXT NOT NULL
        CHECK (email LIKE '%@%.%'),

    password TEXT NOT NULL,

    admin BOOL DEFAULT 0,

    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT NOT NULL REFERENCES account (username)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    establishment_id INTEGER NOT NULL REFERENCES establishment (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    rating INTEGER NOT NULL
        CHECK(0<rating AND rating<=5),
    
    comment_text TEXT NOT NULL,

    picture_attached BLOB,
    
    UNIQUE(username, timestamp)
);

CREATE TABLE IF NOT EXISTS label (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    username TEXT NOT NULL REFERENCES account (username)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    establishment_id INTEGER NOT NULL REFERENCES establishment (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    UNIQUE (name, establishment_id, username)
);
