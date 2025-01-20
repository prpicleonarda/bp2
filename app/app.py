from flask import Flask, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS  # Import Flask-CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes by default

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'trgovina'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = MySQL(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/klub', methods=['GET'])
def get_data():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM klub ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

@app.route('/lokacija', methods=['GET'])
def get_lokacija():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM lokacija ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

@app.route('/pregled_stavki_racuna', methods=['GET'])  
def get_stavke_racuna():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM pregled_stavki_racuna ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)	

@app.route('/pregled_racuna', methods=['GET'])
def get_racuni():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM pregled_racuna ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
