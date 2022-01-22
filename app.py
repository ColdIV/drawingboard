from flask import Flask, redirect, url_for, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin , AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask_login import UserMixin, LoginManager, current_user, login_user, logout_user

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///db/drawingBoardData.db'
app.config['SECRET_KEY'] = 'mysecret'

db = SQLAlchemy(app)
login = LoginManager(app)

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

@app.route('/login')
def login():
    user = User.query.get(1)
    if user != None:
        login_user(user)
        return ('Logged in!')
    else:
        return ('Error!')

@app.route('/logout')
def logout():
    logout_user()
    return ('Logged out!')


if __name__ == '__main__':
    db.create_all()
    if User.query.count() < 1:
        admin = User(name='admin', password='1234') # @TODO: hash password
        db.session.add(admin)
        db.session.commit()
    app.run(debug=True)