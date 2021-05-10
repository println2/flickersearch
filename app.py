from flask import Flask, jsonify
from flask_cors import CORS
import flickrapi
import json
from flask import request
from flask_sqlalchemy import SQLAlchemy
import os
project_dir = os.path.dirname(os.path.abspath(__file__))
database_file = "sqlite:///{}".format(os.path.join(project_dir, "database.db"))

# generally we save them in enviorment variables
api_key = u'd06692ce7b883f745ac5a9695d89a440'
api_secret = u'2336687eeb55e4f6'

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = database_file
CORS(app)
db = SQLAlchemy(app)

class LatLog(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True)
    lat = db.Column(db.String(10))
    log = db.Column(db.String(120))

    def __repr__(self):
        return '<name %r>' % self.name

    @property
    def serialize(self):
       """Return object data in easily serializable format"""
       return {
           'name': self.name,
           'lat': self.lat,
           'log'  : self.log
       }

class Favorites(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    photo_id = db.Column(db.String(80), unique=True)
    photo_server = db.Column(db.String(10))
    photo_secret = db.Column(db.String(120))

    @property
    def serialize(self):
       """Return object data in easily serializable format"""
       return {
           'photo_id': self.photo_id,
           'photo_server': self.photo_server,
           'photo_secret'  : self.photo_secret
       }
db.create_all()

@app.route("/photos")
def index():
    lat = request.args.get('lat')
    lon = request.args.get('log')
    page = request.args.get('page',1)
    flickr = flickrapi.FlickrAPI(api_key, api_secret)
    photos = flickr.photos.search(lat=lat,lon=lon, per_page=12,page=page,format='json')
    return json.loads(photos)

@app.route("/lat-log-create", methods = ['POST'])
def lat_long_create():
    request_data = request.get_json()
    lat = request_data.get('lat')
    log = request_data.get('log')
    name = request_data.get('name')
    check_data = LatLog.query.filter_by(name=name)
    if(len(check_data.all()) >= 1):
        return {"success":"Name already exist please enter different name"}
    else:
        latlog = LatLog(name = name,lat=lat,log=log)
        db.session.add(latlog)
        db.session.commit()
        return {"success":"success"}

@app.route("/lat-log", methods = ['GET'])
def lat_long():
    # import pdb;pdb.set_trace()
    return jsonify([i.serialize for i in LatLog.query.all()])

@app.route("/favorites", methods = ['GET','POST'])
def favorites():
    if request.method == 'POST':
        request_data = request.get_json()
        photo_id = request_data.get('photo_id')
        photo_server = request_data.get('photo_server')
        photo_secret = request_data.get('photo_secret')
        check_data = Favorites.query.filter_by(photo_id=photo_id)
        if(len(check_data.all()) >= 1):
            return {"success":"Photo with already added to favourites"}
        else:
            favorites = Favorites(photo_id=photo_id,photo_server=photo_server,photo_secret=photo_secret)
            db.session.add(favorites)
            db.session.commit()
            return {"success":"success"}
    elif request.method == 'GET':
        return jsonify([i.serialize for i in Favorites.query.all()])