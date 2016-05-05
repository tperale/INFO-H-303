#!/usr/bin/python
# -*- coding: utf-8 -*-

import sqlite3 as lite
import sys
from bs4 import BeautifulSoup

DATA_PATH = "./db/datas/"

def parse_comments(comments, _id):
    for comment in comments:
        comm = {}
        comm['username'] = comment['nickname']
        comm['timestamp'] = comment['date']
        comm['establishment_id'] = _id
        comm['rating'] =  comment['score']
        comm['comment_text'] = comment.text

def parse_label(label, _id):
    for tag in label:
        name = tag['name']
        establishment_id = _id
        users = []
        for user in tag.find_all('user'):
            users.append(user['nickname'])


def parse_bar(s, db):
    """
    Parse bar file.
    """
    for cafe in s.find_all("Cafe"):
        obj = {}
        info = cafe.find('informations')
        obj['name'] = info.find('name').text
        obj['address_street'] = info.find('address').find('street').text
        obj['address_number'] = info.find('address').find('num').text
        obj['address_zip'] = info.find('address').find('zip').text
        obj['address_town'] = info.find('address').find('city').text
        obj['longitude'] = info.find('address').find('longitude').text
        obj['latitude'] = info.find('address').find('latitude').text

        obj['phone_number'] = info.find('tel').text
        obj['website'] = info.find('website').text

        _id = None

        obj['smoking'] = bool(info.find('smoking'))
        obj['snack'] = bool(info.find('snack'))

        parse_comments(cafe.find_all('comment'), _id)

        parse_label(cafe.find_all('tag'), _id)

        # db.execute("INSERT INTO establishment (latitude,longitude,name,address_street,address_town,address_number,address_zip,phone_number,website,creation_date,created_by)\
        #         VALUES (%s,%s,'%s','%s','%s',%s,%s,%s,'%s',%s,'%s')",
        #         latitude, longitude, name, address_street, address_town, address_number, address_zip, phone_number, website)




if __name__ == "__main__":
    con = lite.connect('test.db')

    parse_bar(BeautifulSoup(open(DATA_PATH + "Cafes.xml").read(), 'html.parser'), con)
