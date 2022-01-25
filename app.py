from flask import Flask, redirect, url_for, render_template, request
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin , AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_login import UserMixin, LoginManager, current_user, login_user, logout_user, login_required
from getpass import getpass
import hashlib
import os
import time
import random
import sys
from waitress import serve
import configparser

config = configparser.RawConfigParser()
config.read('.config')

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///db/drawingBoardData.db'
app.config['SECRET_KEY'] = config['app']['secret']
app.config['UPLOAD_FOLDER'] = 'static/art'
app.config['MAX_CONTENT_LENGTH'] = 1 * 1000 * 1000

db = SQLAlchemy(app)
login = LoginManager(app)

def sha512(str):
    h = hashlib.sha512(str.encode('utf-8'))
    return h.hexdigest()

@login.user_loader
def load_user(user_id):
    return User.query.get(user_id)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True)
    password = db.Column(db.String(20))

class Art(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    flag = db.Column(db.Boolean, default=False)
    verified = db.Column(db.Boolean, default=False)

class MyModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))

class MyAdminIndexView(AdminIndexView):
    @expose('/', methods=('GET', 'POST'))
    def index_view(self):
        deleteFile = request.form.get('delete')
        if deleteFile:
            image = Art.query.filter_by(flag = True, verified = False, name = deleteFile).first()
            db.session.delete(image)
            db.session.commit()
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], deleteFile))

        return self.render('admin/index.html')

    def render(self, template, **kwargs):
        images = Art.query.filter_by(flag = True, verified = False).all()
        kwargs['images'] = images
        return super(AdminIndexView, self).render('admin/index.html', **kwargs)

    def is_accessible(self):
        return current_user.is_authenticated
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))

admin = Admin(app, index_view=MyAdminIndexView())
admin.add_view(MyModelView(User, db.session))
admin.add_view(MyModelView(Art, db.session))

@app.route('/')
def index():
    images = Art.query.order_by(Art.name.desc()).all()
    path = app.config['UPLOAD_FOLDER']
    return render_template('index.html', images=images, path=path)

@app.route('/login', methods=['GET'])
def loginForm():
    if current_user.is_authenticated:
        return redirect(url_for('admin.index'))
    return render_template('login_form.html')

@app.route('/login', methods=['POST'])
def login():
    name = request.form['name'] or None
    password = request.form['password'] or None

    if name and password:
        password = sha512(password)
        admin = User.query.get(1)
        if name == admin.name and password == admin.password:
            login_user(admin)
            return redirect(url_for('admin.index'))
    
    alerts = []
    alerts.append(["error","login is invalid."])
    return render_template('login_form.html', alerts=alerts)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/save', methods=['POST'])
def save():
    file = request.files['file']
    filename = str(time.time()).replace(".", ''.join(chr(random.randrange(65,90)) for i in range(4))) + '.png'
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    img = Art(name=filename, flag=False, verified=False)
    db.session.add(img)
    db.session.commit()
    return "OK"

@app.route('/report', methods=['POST'])
def report():
    name = request.form['image']
    num_rows_updated = Art.query.filter_by(name = name).update(dict(flag=True))
    db.session.commit()
    return "OK"

if __name__ == '__main__':
    db.create_all()
    if User.query.count() < 1:
        uname = input('Enter admin name: ')
        upassword = getpass('Enter admin password: ')
        upassword = sha512(upassword)
        admin = User(name=uname, password=upassword)
        db.session.add(admin)
        db.session.commit()
    if len(sys.argv) >= 2 and sys.argv[1] == 'dev':
        app.run(debug=True)
    else:
        serve(app, host='0.0.0.0', port=config['app']['port'])