#!/usr/bin/python
# -*- coding: utf-8 -*-

import dateutil.parser
import sqlite3 as lite
import sys
import datetime
from bs4 import BeautifulSoup

DATA_PATH = "./db/datas/"

USER_DICT = dict()

con = lite.connect('./db/test.db')

def parse_date(date):
    foo = dateutil.parser.parse(date)
    print(foo)
    return foo

def new_user(username, db, date=None, admin=0):
    user = USER_DICT.get(username)
    if user:
        if date and date < user['date']:
            cmd = "UPDATE account SET creation_date='%s' WHERE username='%s'" % (date, username)
            print(cmd)
            db.execute(cmd)
            user['date'] = date
        else:
            pass
    else:
        if date:
            # Si l'utilisateur n'existe pas.
            cmd = "INSERT INTO account (username, email, password, admin, creation_date) VALUES ('%s','%s','default',%i,'%s')" % (username, username + "@gmail.com", admin, date)
            print(cmd)
            db.execute(cmd)
        else:
            cmd = "INSERT INTO account (username, email, password, admin) VALUES ('%s','%s','default',%i)" % (username, username + "@gmail.com", admin)
            print(cmd)
            db.execute(cmd)
            date = datetime.datetime.now()

        USER_DICT[username] = dict()
        USER_DICT[username]['date'] = date

    con.commit()


def parse_comments(comments, _id, db):
    for comment in comments:
        username = comment['nickname']
        timestamp = parse_date(comment['date'])

        new_user(username, db, timestamp)

        rating = comment['score']
        comment_text = comment.text

        db.execute("INSERT INTO comments (username, timestamp, establishment_id, rating, comment_text) VALUES (?,?,?,?,?)", (username, timestamp, _id, int(rating), comment_text))

    con.commit()

def parse_label(label, _id, db):
    for tag in label:
        name = tag['name']
        for user in tag.find_all('user'):
            new_user(user['nickname'], db)
            cmd = "INSERT INTO label(name,username,establishment_id) VALUES ('%s','%s',%i)" % (name, user['nickname'], _id)
            print(cmd)
            db.execute(cmd)


def parse_bar(s, conn):
    """
    Parse bar file.
    """
    for cafe in s.find_all("cafe"):
        created_by = cafe['nickname']
        creation_date = parse_date(cafe['creationdate'])

        db = con.cursor()
        new_user(created_by, db, creation_date, 1)
        db.close()

        obj = {}
        info = cafe.find('informations')
        name = info.find('name').text # Bar name.
        address_street = info.find('address').find('street').text
        address_number = info.find('address').find('num').text
        address_zip = info.find('address').find('zip').text
        address_town = info.find('address').find('city').text
        longitude = info.find('address').find('longitude').text
        latitude = info.find('address').find('latitude').text

        phone_number = info.find('tel').text
        website = info.find('website')
        if website:
            website = website.text

        cmd = "insert into establishment (latitude,longitude,name,address_street,address_town,address_number,address_zip,phone_number,website,creation_date,created_by)\
                values (%f,%f,'%s','%s','%s',%s,%i,'%s','%s','%s','%s')" % \
                (float(latitude), float(longitude), name, address_street, address_town, address_number, int(address_zip), phone_number, website, created_by, creation_date)
        print(cmd)

        db = con.cursor()
        db.execute("insert into establishment (latitude,longitude,name,address_street,address_town,address_number,address_zip,phone_number,website,creation_date,created_by)\
                values(?,?,?,?,?,?,?,?,?,?,?)",
                (float(latitude), float(longitude), name, address_street, address_town, address_number,
                    int(address_zip), phone_number, website, creation_date, created_by))
        con.commit()
        db.close()

        _id = db.lastrowid

        smokers = bool(info.find('smoking'))
        snacks = bool(info.find('snack'))

        cmd = "INSERT INTO bar (id,smokers,snacks) VALUES (%i,%i,%i)" % (_id,smokers, snacks)
        db = con.cursor()
        db.execute(cmd)
        con.commit()
        db.close()

        db = con.cursor()
        parse_comments(cafe.find_all('comment'), _id, db)
        db.close()

        db = con.cursor()
        parse_label(cafe.find_all('tag'), _id, db)
        db.close()

def parse_restaurant(s, conn):
    """
    Parse bar file.
    """
    for cafe in s.find_all("restaurant"):
        created_by = cafe['nickname']
        creation_date = parse_date(cafe['creationdate'])

        db = con.cursor()
        new_user(created_by, db, creation_date, 1)
        db.close()

        obj = {}
        info = cafe.find('informations')
        name = info.find('name').text # Bar name.
        address_street = info.find('address').find('street').text
        address_number = info.find('address').find('num').text
        address_zip = info.find('address').find('zip').text
        address_town = info.find('address').find('city').text
        longitude = info.find('address').find('longitude').text
        latitude = info.find('address').find('latitude').text

        phone_number = info.find('tel').text
        website = info.find('website')
        if website:
            website = website.text

        cmd = "insert into establishment (latitude,longitude,name,address_street,address_town,address_number,address_zip,phone_number,website,creation_date,created_by)\
                values (%f,%f,'%s','%s','%s',%s,%i,'%s','%s','%s','%s')" % \
                (float(latitude), float(longitude), name, address_street, address_town, address_number, int(address_zip), phone_number, website, created_by, creation_date)
        print(cmd)

        db = con.cursor()
        db.execute("insert into establishment (latitude,longitude,name,address_street,address_town,address_number,address_zip,phone_number,website,creation_date,created_by)\
                values(?,?,?,?,?,?,?,?,?,?,?)",
                (float(latitude), float(longitude), name, address_street, address_town, address_number,
                    int(address_zip), phone_number, website, creation_date, created_by))
        con.commit()
        db.close()

        _id = db.lastrowid

        takeaway = bool(info.find('takeaway'))
        delivery = bool(info.find('delivery'))
        price = int(info.find('pricerange').text)
        seat_number = int(info.find('banquet')['capacity'])

        cmd = "INSERT INTO restaurant (id,takeaway,delivery,price,seat_number) VALUES (%i,%i,%i,%i,%i)" % (_id,takeaway,delivery,price,seat_number)
        db = con.cursor()
        db.execute(cmd)
        con.commit()
        db.close()

        db = con.cursor()
        parse_comments(cafe.find_all('comment'), _id, db)
        db.close()

        db = con.cursor()
        parse_label(cafe.find_all('tag'), _id, db)
        db.close()




if __name__ == "__main__":
    parse_bar(BeautifulSoup(open(DATA_PATH + "Cafes.xml").read(), 'html.parser'), con)
    parse_restaurant(BeautifulSoup(open(DATA_PATH + "Restaurants.xml").read(), 'html.parser'), con)
