from flask import Flask, jsonify, request
from flask_mysqldb import MySQL
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'trgovina'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = MySQL(app)

# Dummy user data
users = {
    'admin': {'password': 'adminpass', 'role': 'admin'},
    'zaposlenik': {'password': 'zappass', 'role': 'zaposlenik'},
    'kupac': {'password': 'kupacpass', 'role': 'kupac'}
}

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/klub', methods=['GET'])
def get_klub():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM klub ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

@app.route('/lokacija', methods=['GET'])
def get_lokacija():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM pregled_lokacija_sa_odjelima ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

@app.route('/pregled_stavki_racuna', methods=['GET'])
def get_pregled_stavki_racuna():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM pregled_stavki_racuna ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

@app.route('/pregled_racuna', methods=['GET'])
def get_pregled_racuna():
    cur = mysql.connection.cursor()
    cur.execute(''' SELECT * FROM pregled_racuna ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data)

@app.route('/novi_racun', methods=['POST'])
def novi_racun():
    data = request.json
    k_id = data.get('kupac_id')
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
    stavke = data['stavke']

    # Add racun_id to each stavka
    for stavka in stavke:
        stavka['racun_id'] = r_id

    try:
        cur = mysql.connection.cursor()
        
        # Call the procedure with JSON data
        cur.callproc('dodaj_stavke', [json.dumps(stavke)])
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/izbrisi_racun', methods=['POST'])
def izbrisi_racun():
    racun_id = request.json['racun_id']
    try:
        cur = mysql.connection.cursor()
        cur.callproc('izbrisi_racun', [racun_id])
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/dodaj_proizvod', methods=['POST'])
def dodaj_proizvod():
    data = request.json
    naziv = data['naziv']
    n_cijena = data['nabavna_cijena']
    p_cijena = data['prodajna_cijena']
    kategorija_id = data['kategorija_id']

    try:
        cur = mysql.connection.cursor()
        cur.callproc('dodaj_proizvod', [naziv, n_cijena, p_cijena, kategorija_id])
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/dodaj_kupca', methods=['POST'])
def dodaj_kupca():
    data = request.json
    ime = data['ime']
    prezime = data['prezime']
    spol = data['spol']
    adresa = data['adresa']
    email = data['email']
    tip = data['tip']
    oib_firme = data.get('oib_firme')

    try:
        cur = mysql.connection.cursor()
        cur.callproc('dodaj_kupca', [ime, prezime, spol, adresa, email, tip, oib_firme])
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user_id = data['user_id']
    password = data['password']

    user = users.get(user_id)
    if user and user['password'] == password:
        return jsonify({'success': True, 'role': user['role']})
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'})

@app.route('/odjeli_kategorije_proizvodi', methods=['GET'])
def get_odjeli_kategorije_proizvodi():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM pregled_proizvoda')
        data = cur.fetchall()
        cur.close()

        odjeli_kategorije_map = {}
        proizvodi = []

        for row in data:
            odjel = row['odjel_naziv']
            kategorija = row['kategorija_naziv']
            if odjel not in odjeli_kategorije_map:
                odjeli_kategorije_map[odjel] = set()
            odjeli_kategorije_map[odjel].add(kategorija)

            proizvodi.append({
                'naziv': row['naziv'],
                'nabavna_cijena': row['nabavna_cijena'],
                'prodajna_cijena': row['prodajna_cijena'],
                'kategorija': kategorija,
                'odjel': odjel
            })

        odjeli_kategorije = [{'odjel': odjel, 'kategorije': list(kategorije)} for odjel, kategorije in odjeli_kategorije_map.items()]

        return jsonify({'odjeliKategorije': odjeli_kategorije, 'proizvodi': proizvodi})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/racun_detalji/<int:racun_id>', methods=['GET'])
def racun_detalji_full(racun_id):
    try:
        cur = mysql.connection.cursor()
        cur.callproc('racun_detalji', [racun_id])
        data = cur.fetchall()
        cur.close()
        return jsonify({'success': True, 'racun': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/ponisti_racun', methods=['POST'])
def ponisti_racun():
    data = request.json
    racun_id = data['racun_id']
    admin_password = data['admin_password']

    # Check if the admin password is correct
    if admin_password != users['admin']['password']:
        return jsonify({'success': False, 'error': 'Invalid admin password'})

    try:
        cur = mysql.connection.cursor()
        cur.callproc('ponisti_racun', [racun_id])
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/kupaci', methods=['GET'])
def get_kupci():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM kupac')  # Adjust the query as needed
        data = cur.fetchall()
        cur.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/najcesci_kupci', methods=['GET'])
def get_najcesci_kupci():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM najcesci_kupci')
        data = cur.fetchall()
        cur.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/najbolji_kupci', methods=['GET'])
def get_najbolji_kupci():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM najbolji_kupci')
        data = cur.fetchall()
        cur.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/najbolji_zaposlenik_racuni', methods=['GET'])
def get_najbolji_zaposlenik_racuni():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM najbolji_zaposlenik_racuni')
        data = cur.fetchall()
        cur.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/najbolji_zaposlenik_zarada', methods=['GET'])
def get_najbolji_zaposlenik_zarada():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM najbolji_zaposlenik_zarada')
        data = cur.fetchall()
        cur.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/dodaj_zaposlenika', methods=['POST'])
def dodaj_zaposlenika():
    data = request.json
    ime = data['ime']
    prezime = data['prezime']
    pozicija = data['pozicija']
    adresa = data['adresa']
    email = data['email']
    telefon = data['telefon']

    try:
        cur = mysql.connection.cursor()
        cur.callproc('dodaj_zaposlenika', (ime, prezime, pozicija, adresa, email, telefon))
        mysql.connection.commit()
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/zaposlenici', methods=['GET'])
def get_zaposlenici():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM zaposlenik')
        data = cur.fetchall()
        cur.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/evidencija', methods=['GET'])
def get_evidencija():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM evidencija')
        data = cur.fetchall()
        cur.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
