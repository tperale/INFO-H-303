CREATE TABLE IF NOT EXISTS establishment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    latitude REAL NOT NULL
        CHECK(-90<=latitude AND latitude<=90),
    longitude REAL NOT NULL
        CHECK(-180<=longitude AND longitude<=180),

    name TEXT NOT NULL,

    adress_street TEXT NOT NULL,
    adress_town TEXT NOT NULL,
    adress_number INTEGER NOT NULL,

    phone_number VARCHAR(20) NOT NULL,

    website TEXT,

    UNIQUE(latitude, longitude)
);


CREATE TABLE IF NOT EXISTS restaurant (
    id INTEGER PRIMARY KEY NOT NULL,

    price INTEGER NOT NULL,

    seat_number INTEGER NOT NULL,

    takeaway BOOLEAN NOT NULL,

    delivery BOOLEAN NOT NULL,

    timetable INTEGER NOT NULL, 

    CONSTRAINT ESTABLISHEMENT_EXIST
        FOREIGN KEY (id) REFERENCES establishment(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    smoker_allowed BOOLEAN NOT NULL,

    snacks BOOLEAN NOT NULL,

    CONSTRAINT ESTABLISHEMENT_EXIST
        FOREIGN KEY (id) REFERENCES establishment(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hotel (
    id INTEGER NOT NULL,

    stars INTEGER NOT NULL
        CHECK(0<=stars AND stars<=5),

    room_number INTEGER NOT NULL,

    price INTEGER NOT NULL,

    CONSTRAINT ESTABLISHEMENT_EXIST
        FOREIGN KEY (id) REFERENCES establishment(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
    id INTEGER PRIMARY KEY NOT NULL,

    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,

    UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS comment (
    id INTEGER PRIMARY KEY NOT NULL,

    user_id INTEGER NOT NULL,

    timestamp DATE,

    establishment_id INTEGER NOT NULL,
    
    comment_text TEXT,
    
    CONSTRAINT ARTICLE_EXIST
        FOREIGN KEY (user_id) REFERENCES account (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT USER_EXIST
        FOREIGN KEY (establishment_id) REFERENCES establishment (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    UNIQUE(user_id, timestamp)
);

CREATE TABLE IF NOT EXISTS label (
    name TEXT NOT NULL,

    establishment_id INTEGER NOT NULL,

    CONSTRAINT ARTICLE_EXIST
        FOREIGN KEY (establishment_id) REFERENCES establishment (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    PRIMARY KEY (name, establishment_id)
);
