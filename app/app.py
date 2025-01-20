from flask import Flask, jsonify, request  # Added request import
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

@app.route('/novi_racun', methods=['POST'])
def novi_racun():
    data = request.json
    k_id = data['kupac_id']
    z_id = data['zaposlenik_id']
    nacin_placanja = data['nacin_placanja']

    try:
        cur = mysql.connection.cursor()
        cur.callproc('stvori_racun', [k_id, z_id, nacin_placanja])
        cur.execute("SELECT LAST_INSERT_ID() as racun_id")
        racun_id = cur.fetchone()['racun_id']
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True, 'racun_id': racun_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/dodaj_stavke', methods=['POST'])
def dodaj_stavke():
    data = request.json
    r_id = data['racun_id']
    stavke = data['stavke']  # List of {"proizvod_id": ..., "kolicina": ...}

    try:
        cur = mysql.connection.cursor()
        for stavka in stavke:
            cur.execute(
                "INSERT INTO racun_stavka (racun_id, proizvod_id, kolicina) VALUES (%s, %s, %s)",
                (r_id, stavka['proizvod_id'], stavka['kolicina']),
            )
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
