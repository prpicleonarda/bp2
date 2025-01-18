from flask import Flask, jsonify
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'trgovina'
mysql = MySQL(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/data', methods=['GET'])
def get_data():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM klub ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
