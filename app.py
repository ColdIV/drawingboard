from django.shortcuts import render
from flask import Flask, redirect, url_for, render_template, request
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin , AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask_login import UserMixin, LoginManager, current_user, login_user, logout_user, login_required
from getpass import getpass
import hashlib
import json


app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///db/drawingBoardData.db'
app.config['SECRET_KEY'] = 'mysecret'

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

class MyModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))

class MyAdminIndexView(AdminIndexView):
    def is_accessible(self):
        return current_user.is_authenticated

admin = Admin(app, index_view=MyAdminIndexView())
admin.add_view(MyModelView(User, db.session))

@app.route('/')
def index():
    return render_template('index.html')

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
    
    vars = {}
    vars['error'] = "Error! Login is invalid."
    return render_template('login_form.html', vars=vars)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

if __name__ == '__main__':
    db.create_all()
    if User.query.count() < 1:
        uname = input('Enter admin name: ')
        upassword = getpass('Enter admin password: ')
        upassword = sha512(upassword)
        admin = User(name=uname, password=upassword)
        db.session.add(admin)
        db.session.commit()
    app.run(debug=True)