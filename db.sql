DROP DATABASE IF EXISTS trgovina;
CREATE DATABASE trgovina;
USE trgovina;

CREATE TABLE klub (
	id INT AUTO_INCREMENT PRIMARY KEY,
    razina VARCHAR(50) NOT NULL,
    popust INT NOT NULL
);

CREATE TABLE lokacija (
	id INT AUTO_INCREMENT PRIMARY KEY,
    grad VARCHAR(50) NOT NULL
);

CREATE TABLE odjel (
	id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL
);

CREATE TABLE odjel_na_lokaciji (
	id INT AUTO_INCREMENT PRIMARY KEY,
    odjel_id INT NOT NULL,
    lokacija_id INT NOT NULL,
    FOREIGN KEY (odjel_id) REFERENCES odjel(id),
    FOREIGN KEY (lokacija_id) REFERENCES lokacija(id)
);

CREATE TABLE zaposlenik (
	id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    mjesto_rada INT NOT NULL, -- (odjel_na_lokaciji id)
    placa DECIMAL(10, 2) NOT NULL,
    spol CHAR(1) NOT NULL,
    CONSTRAINT zaposlenik_spol_provjera CHECK (spol = "M" OR spol = "Ž"),
    FOREIGN KEY (mjesto_rada) REFERENCES odjel_na_lokaciji(id)
);

CREATE TABLE kupac (
	id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    spol CHAR(1) NOT NULL,
    adresa VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    tip VARCHAR(50) NOT NULL,
    oib_firme CHAR(11),
    klub_id INT,
    FOREIGN KEY (klub_id) REFERENCES klub(id),
    CONSTRAINT kupac_spol_provjera CHECK (spol = "M" OR spol = "Ž"),
    CONSTRAINT tip_kupca_check CHECK (tip = 'privatni' OR tip = 'poslovni')
);

CREATE TABLE kategorija (
	id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(50),
    odjel_id INT,
    FOREIGN KEY (odjel_id) REFERENCES odjel(id)
);

CREATE TABLE proizvod (
	id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    nabavna_cijena DECIMAL(10, 2) NOT NULL,
    prodajna_cijena DECIMAL(10, 2) NOT NULL,
    kategorija_id INT,
    FOREIGN KEY (kategorija_id) REFERENCES kategorija(id),
    CONSTRAINT greska_ime_proizvoda UNIQUE (naziv)
);

CREATE TABLE predracun (
	id INT AUTO_INCREMENT PRIMARY KEY,
    kupac_id INT,
    zaposlenik_id INT NOT NULL,
    datum DATETIME NOT NULL,
    nacin_placanja VARCHAR(30) NOT NULL,
    FOREIGN KEY (kupac_id) REFERENCES kupac(id),
    FOREIGN KEY (zaposlenik_id) REFERENCES zaposlenik(id)
);

CREATE TABLE racun (
	id INT AUTO_INCREMENT PRIMARY KEY,
    kupac_id INT,
    zaposlenik_id INT NOT NULL,
    datum DATETIME NOT NULL DEFAULT NOW(),
    nacin_placanja VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT "izvrseno",
    FOREIGN KEY (kupac_id) REFERENCES kupac(id),
    FOREIGN KEY (zaposlenik_id) REFERENCES zaposlenik(id),
    CONSTRAINT provjera_nacina_placanja CHECK (nacin_placanja = "POS" OR nacin_placanja = "gotovina"),
    CONSTRAINT provjera_statusa_racuna CHECK (status = "izvrseno" OR status = "ponisteno")
);

CREATE TABLE nabava (
	id INT AUTO_INCREMENT PRIMARY KEY,
    lokacija_id INT,
    datum DATETIME,
    FOREIGN KEY (lokacija_id) REFERENCES lokacija(id)
);

CREATE TABLE narudzba (
	id INT AUTO_INCREMENT PRIMARY KEY,
    datum DATETIME DEFAULT NOW(),
    lokacija_id INT,
    kupac_id INT,
    status VARCHAR(50), -- status je navodno dozvoljena rijec za naziv atributa, iako je highlightana
    FOREIGN KEY (kupac_id) REFERENCES kupac(id),
    FOREIGN KEY (lokacija_id) REFERENCES lokacija(id),
    CONSTRAINT provjera_statusa_narudzbe CHECK (status = "na cekanju" OR status = "izvrseno")
);

CREATE TABLE stavka (
	predracun_id INT DEFAULT NULL,
    racun_id INT DEFAULT NULL,
    nabava_id INT DEFAULT NULL,
    narudzba_id INT DEFAULT NULL,
    proizvod_id INT NOT NULL,
    kolicina INT NOT NULL,
    CONSTRAINT kolicina_provjera CHECK (kolicina > 0),
    FOREIGN KEY (predracun_id) REFERENCES predracun(id),
    FOREIGN KEY (racun_id) REFERENCES racun(id),
    FOREIGN KEY (nabava_id) REFERENCES nabava(id),
    FOREIGN KEY (narudzba_id) REFERENCES narudzba(id)
);

CREATE TABLE inventar (
	lokacija_id INT NOT NULL,
    proizvod_id INT NOT NULL,
    kolicina INT NOT NULL,
    FOREIGN KEY (lokacija_id) REFERENCES lokacija(id),
    FOREIGN KEY (proizvod_id) REFERENCES proizvod(id)
);

INSERT INTO klub(razina, popust) VALUES 
("Silver", 5),
("Gold", 10),
("Platinum", 15);

INSERT INTO lokacija(grad) VALUES 
("Pula"),
("Zagreb"),
("Split"),
("Zadar"),
("Rijeka"),
("Osijek");

INSERT INTO odjel(naziv) VALUES 
("Kućanski Uređaji"),
("Elektronika"),
("Vrt i sezona"),
("Široka potrošnja");

INSERT INTO odjel_na_lokaciji(odjel_id, lokacija_id) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(1, 2),
(2, 2),
(3, 2),
(4, 2),
(1, 3),
(2, 3),
(3, 3),
(4, 3),
(1, 4),
(2, 4),
(3, 4),
(4, 4),
(1, 5),
(2, 5),
(3, 5),
(4, 5),
(1, 6),
(2, 6),
(3, 6),
(4, 6);

INSERT INTO zaposlenik(ime, prezime, mjesto_rada, placa, spol) VALUES
("Zvonimir", "Krtić", 1, 1200, "M"),
("Viktor", "Lovreković", 1, 1200, "M"),
("Božo", "Prskalo", 2, 1100, "M"),
("Vanesa", "Marijanović", 2, 1100, "Ž"),
("Siniša", "Fabijanić", 3, 1050, "M"),
("Renata", "Pejaković", 3, 1050, "Ž"),
("Dora", "Nikić", 4, 1150, "Ž"),
("Gordana", "Josić", 4, 1150, "Ž"),
("Nika", "Jelinić", 5, 1250, "Ž"),
("Igor", "Žanić", 5, 1250, "M"),
("Dario", "Volarević", 6, 1300, "M"),
("Anica", "Ilić", 6, 1300, "Ž"),
("Božo", "Vrban", 7, 1100, "M"),
("Antonio", "Kuzmić", 7, 1100, "M"),
("Stela", "Tomšić", 8, 1050, "Ž"),
("Matej", "Vrdoljak", 8, 1050, "M"),
("Darko", "Jušić", 9, 1200, "M"),
("Marta", "Miloš", 9, 1200, "Ž"),
("Miroslav", "Stipanović", 10, 1250, "M"),
("Gorana", "Kutleša", 10, 1250, "Ž"),
("Zdenka", "Majnarić", 11, 1150, "Ž"),
("Goran", "Medved", 11, 1150, "M"),
("Zlatko", "Primorac", 12, 1000, "M"),
("Oliver", "Andrešić", 12, 1000, "M"),
("Irena", "Kadić", 13, 1150, "Ž"),
("Jan", "Buzov", 13, 1150, "M"),
("Saša", "Jagić", 14, 1200, "M"),
("Domagoj", "Parlov", 14, 1200, "M"),
("Sanja", "Franjić", 15, 1000, "Ž"),
("Đuro", "Vukas", 15, 1000, "M"),
("Filip", "Knežić", 16, 950, "M"),
("Zvonko", "Brgan", 16, 950, "M"),
("Boris", "Lekić", 17, 1200, "M"),
("Lara", "Žunić", 17, 1200, "Ž"),
("Ena", "Merlin", 18, 1100, "Ž"),
("Emanuel", "Šimunić", 18, 1100, "M"),
("Patricija", "Bistrović", 19, 1000, "Ž"),
("Krešimir", "Maričić", 19, 1000, "M"),
("Jadranka", "Krznarić", 20, 900, "Ž"),
("Gabrijel", "Stipić", 20, 900, "M"),
("Denis", "Radovanović", 21, 1300, "M"),
("Karolina", "Velić", 21, 1300, "Ž"),
("Klara", "Šimek", 22, 1150, "Ž"),
("Mario", "Vedrić", 22, 1150, "M"),
("Juraj", "Ivanković", 23, 1050, "M"),
("Katarina", "Pavlinić", 23, 1050, "Ž"),
("Josip", "Vincek", 24, 950, "M"),
("Mia", "Klaić", 24, 950, "Ž");

INSERT INTO kupac(ime, prezime, spol, adresa, email, tip, oib_firme, klub_id) VALUES
("Krešimir", "Gavranić", "M", "Splitska 3", "kgavranic@gmail.com", "privatni", NULL, 1),
("Dražen", "Jakšić", "M", "Dubrovačka 12", "djaksic@gmail.com", "privatni", NULL, 1),
("Boris", "Bukovac", "M", "Zagrebačka 33", "bbukovac@gmail.com", "privatni", NULL, 1),
("Tomislav", "Ložančić", "M", "Splitska 19", "tlozancic@gmail.com", "poslovni", "13312150031", NULL),
("Davor", "Husnjak", "M", "Frankopanska 11", "dhusnjak@gmail.com", "privatni", NULL, 1),
("Franjo", "Drašković", "M", "Fišerova 25", "fdraskovic@gmail.com", "privatni", NULL, 1),
("Dominik", "Kumiša", "M", "Zadarska 32", "dkumisa@gmail.com", "privatni", NULL, 2),
("Marko", "Franić", "M", "Đorđićeva 43", "mfranic@gmail.com", "privatni", NULL, 3),
("Teo", "Hužjak", "M", "Jurišićeva 51", "thuzjak@gmail.com", "poslovni", "23773491461", NULL),
("Gabrijel", "Mikić", "M", "Gajeva 36", "gmikic@gmail.com", "poslovni", "25374421622", NULL),
("Patricija", "Turkalj", "Ž", "Zadarska 18", "pturkalj@gmail.com", "privatni", NULL, 1),
("Sanja", "Kunica", "Ž", "Mošćenička 62", "skunica@gmail.com", "privatni", NULL, 1),
("Đurđa", "Vujnović", "Ž", "Arsenalska 14", "dvujnovic@gmail.com", "privatni", NULL, 1),
("Irena", "Jurakić", "Ž", "Krajiška 20", "ijurakic@gmail.com", "privatni", NULL, 2),
("Dubravka", "Burišić", "Ž", "Martićeva 9", "dburisic@gmail.com", "privatni", NULL, 2),
("Karla", "Tomić", "Ž", "Margaretska 7", "ktomic@gmail.com", "privatni", NULL, 3),
("Veronika", "Ivanović", "Ž", "Petrinjska 23", "vivanovic@gmail.com", "privatni", NULL, 2),
("Izabela", "Tutić", "Ž", "Preradovićeva 40", "itutic@gmail.com", "privatni", NULL, 2),
("Snježana", "Bradić", "Ž", "Rovinjska 16", "sbradic@gmail.com", "privatni", NULL, 3),
("Suzana", "Vukojević", "Ž", "Praška 15", "svukojevic@gmail.com", "poslovni", "16881329745", NULL),
("Marijan", "Kostelac", "M", "Savska 63", "mkostelac@gmail.com", "poslovni", "13138867549", NULL),
("Dinko", "Sporčić", "M", "Šenoina 48", "dsporcic@gmail.com", "poslovni", "29997321284", NULL),
("Marin", "Stepić", "M", "Vlaška 31", "mstepic@gmail.com", "privatni", NULL, 1),
("Vedran", "Nekić", "M", "Varšavska 26", "vnekic@gmail.com", "privatni", NULL, 1),
("Gabrijela", "Blažić", "Ž", "Heinzela 29", "gblazic@gmail.com", "privatni", NULL, 1),
("Julija", "Hranilović", "Ž", "Klaića 10", "jhranilovic@gmail.com", "privatni", NULL, 1),
("Anja", "Bogdan", "Ž", "Dalmatinska 58", "abogdan@gmail.com", "privatni", NULL, 2),
("Lidija", "Brnetić", "Ž", "Bogovićeva 53", "lbrnetic@gmail.com", "privatni", NULL, 2),
("Jana", "Golubić", "Ž", "Fišerova 41", "jgolubic@gmail.com", "poslovni", "17133516194", NULL),
("Helena", "Gregurek", "Ž", "Ronjgova 33", "hgregurek@gmail.com", "privatni", NULL, 3);

INSERT INTO kategorija(naziv, odjel_id) VALUES
("Bijela tehnika", 1),
("Hlađenje i grijanje", 1),
("Mali kućanski aparati", 1),
("Televizori i dodatci", 2),
("Mobiteli i pametni satovi", 2),
("Audio-video", 2),
("Vrtni namještaj", 3),
("Vrtlarstvo", 3),
("Vrtni alat i oprema", 3),
("Hrana", 4),
("Piće", 4),
("Slatkiši i grickalice", 4),
("Osobna higijena", 4),
("Sredstva za čiščenje i pranje", 4);

INSERT INTO proizvod(naziv, nabavna_cijena, prodajna_cijena, kategorija_id) VALUES
("Perilica rublja Končar", 180, 450, 1),
("Perilica rublja Candy", 150, 370, 1),
("Štednjak Gorenje", 165, 430, 1),
("Hladnjak Gorenje", 485, 1057, 1),
("Hladnjak Hisense", 200, 480, 1),
("Napa Beko", 85, 205, 1),
("Klima uređaj Vivax", 140, 392, 2),
("Klima uređaj Mitsubishi", 279.99, 709.99, 2),
("Peć na drva Alfa-plam", 110, 273, 2),
("Električna grijalica Iskra", 8, 18.5, 2),
("Uljni radijator Blitz", 40, 93, 2),
("Usisavač bez vrećice Rowenta", 57, 119, 3),
("Štapni usisavač Electrolux", 107, 219, 3),
("Električno glačalo Tefal", 63.9, 139.9, 3),
("Mikrovalna pećnica Hisense", 47.5, 109.9, 3),
("Blender Beko", 19, 45.99, 3),
("Preklopni toster Beko", 9, 29.99, 3),
("LED TV Telefunken", 103, 260, 4),
("LED TV Grundig", 107, 250, 4),
("LED TV Philips", 140, 340, 4),
("OLED TV LG", 400, 1099, 4),
("Digitalni prijemnik Denver", 11.5, 32.60, 4),
("Digitalni prijemnik Manta", 8, 24.40, 4),
("Soundbar Sony", 90, 316, 4),
("Samsung galaxy A25 5G", 152.5, 379.9, 5),
("Samsung galaxy S24", 299.9, 809.9, 5),
("Xiaomi Mi 13T", 195, 450, 5),
("Xiaomi Redmi Note 13 Pro", 130.9, 349.9, 5),
("Pametni sat Cubot C29", 16.9, 43.9, 5),
("Pametni sat Amazfit BIP 5", 37.9, 89.99, 5),
("Pametni sat Huawei Fit", 39.99, 109.99, 5),
("Prijenosni radio JBL Tuner2", 44.5, 124.99, 6),
("Bluetooth zvučnik LG XL9T", 168, 419.90, 6),
("In-ear slušalice Panasonic", 16.99, 49.99, 6),
("Nadzorna kamera Xiaomi C400", 21.7, 59.7, 6),
("Drvena stolica Wilma", 24.3, 69.99, 7),
("Drvena vrtna garnitura Xara", 289.9, 799.9, 7),
("Metalne stolice Bologna", 63.6, 169.8, 7),
("Metalna ležaljka Tori", 21.9, 59.99, 7),
("Suncobran Melon 3m", 19.99, 49.99, 7),
("Suncobran Starfish 2m", 6, 19.99, 7),
("Kanta za zalijevanje Blumax", 0.6, 2.29, 8),
("Plastenik Gardentec 4x3m", 240, 648, 8),
("Plastenik Gardentec 8x3m", 460, 1296, 8),
("Žardinjera Blumax", 14.99, 39.99, 8),
("PVC Tegla Blumax", 0.8, 3.99, 8),
("Vile čelične 4 roga", 4.3, 12.4, 9),
("Kosijer veliki", 10.7, 26.9, 9),
("Motika fočanska", 9.99, 26.9, 9),
("Motika slavonska", 6.9, 19.9, 9),
("Vrtne rukavice reciklirane", 0.4, 2.29, 9),
("Gumene čizme PVC", 4.99, 19.99, 9),
("Spaghetti Barilla 1kg", 0.59, 2.95, 10),
("Fusilli Barilla 1kg", 0.59, 2.95, 10),
("Umak napoletana Barilla 400g", 0.75, 3.25, 10),
("Rio Mare tuna u ulju 2x80g", 1.7, 4.99, 10),
("Milka čokoladni namaz 600g", 2.8, 6.99, 10),
("Hell energy 0.5l", 0.35, 1.42, 11),
("Jana vitamin limun 0.5l", 0.34, 1.4, 11),
("Jana ledeni čaj breskva 1.5l", 0.6, 1.92, 11),
("Jana voda 1.5l", 0.28, 1.1, 11),
("Jamnica gazirana 1.5l", 0.31, 1.1, 11),
("Jagermeister 0.7l", 5.25, 16.02, 11),
("Smirnoff red vodka 0.7l", 4.52, 13.02, 11),
("Bombay sapphire gin 0.7l", 7.22, 22.72, 11),
("Milka lješnjak 46g", 0.4, 1.19, 12),
("Milka oreo 37g", 0.3, 0.99, 12),
("Mentos cola 38g", 0.19, 0.79, 12),
("TUC krekeri paprika 100g", 0.36, 1.15, 12),
("Toblerone 35g", 0.34, 1.09, 12),
("Bobi flips 90g", 0.29, 0.95, 12),
("Nivea krema 150ml", 1.19, 3.8, 13),
("Violeta vlažne maramice", 0.39, 1.99, 13),
("Palmolive 2u1 šampon 350ml", 1.29, 3, 13),
("Sanytol dezinfekcijski gel za ruke 75ml", 1.4, 3.25, 13),
("Persil power kapsule 44kom", 6.39, 15.49, 14),
("Smac odmašćivač 650ml", 0.99, 3.32, 14),
("Cif cream lemon 500ml", 0.79, 2.59, 14),
("Somat sol 1.2kg", 0.6, 1.99, 14),
("Ornel omekšivač 2.4l", 2.35, 6.63, 14),
("Čarli classic deterdžent 450ml", 0.42, 1.45, 14);

INSERT INTO inventar VALUES
(1, 1, 10),
(1, 2, 10),
(1, 3, 10),
(1, 4, 10),
(1, 5, 10),
(1, 6, 10),
(1, 7, 10),
(1, 8, 10),
(1, 9, 10),
(1, 10, 10),
(1, 11, 10),
(1, 12, 10),
(1, 13, 10),
(1, 14, 10),
(1, 15, 10),
(1, 16, 10),
(1, 17, 10),
(1, 18, 10),
(1, 19, 10),
(1, 20, 10),
(1, 21, 10),
(1, 22, 10),
(1, 23, 10),
(1, 24, 10),
(1, 25, 25),
(1, 26, 25),
(1, 27, 25),
(1, 28, 25),
(1, 29, 25),
(1, 30, 25),
(1, 31, 25),
(1, 32, 15),
(1, 33, 15),
(1, 34, 15),
(1, 35, 15),
(1, 36, 12),
(1, 37, 3),
(1, 38, 12),
(1, 39, 12),
(1, 40, 12),
(1, 41, 12),
(1, 42, 20),
(1, 43, 2),
(1, 44, 2),
(1, 45, 20),
(1, 46, 20),
(1, 47, 15),
(1, 48, 15),
(1, 49, 15),
(1, 50, 15),
(1, 51, 15),
(1, 52, 15),
(1, 53, 100),
(1, 54, 100),
(1, 55, 100),
(1, 56, 100),
(1, 57, 100),
(1, 58, 100),
(1, 59, 100),
(1, 60, 100),
(1, 61, 100),
(1, 62, 100),
(1, 63, 100),
(1, 64, 100),
(1, 65, 100),
(1, 66, 100),
(1, 67, 100),
(1, 68, 100),
(1, 69, 100),
(1, 70, 100),
(1, 71, 100),
(1, 72, 50),
(1, 73, 50),
(1, 74, 50),
(1, 75, 50),
(1, 76, 30),
(1, 77, 30),
(1, 78, 30),
(1, 79, 30),
(1, 80, 30),
(1, 81, 30);

INSERT INTO racun(kupac_id, zaposlenik_id, datum, nacin_placanja) VALUES
(NULL, 1, NOW(), "POS"),
(1, 2, NOW(), "POS"),
(4, 1, NOW(), "POS"),
(1, 5, NOW(), "gotovina");

INSERT INTO stavka(racun_id, proizvod_id, kolicina) VALUES
(1, 1, 1),
(1, 16, 1),
(1, 31, 2),
(1, 56, 3),
(2, 53, 3),
(2, 52, 2),
(2, 70, 2),
(3, 43, 1),
(3, 46, 2),
(3, 2, 1),
(4, 5, 1),
(4, 13, 1);

INSERT INTO narudzba(lokacija_id, kupac_id, status) VALUES
(1, 5, "na cekanju"),
(1, 10, "na cekanju");

INSERT INTO stavka(narudzba_id, proizvod_id, kolicina) VALUES
(1, 7, 2),
(1, 26, 2),
(1, 28, 2),
(1, 34, 1),
(2, 17, 1),
(2, 58, 3),
(2, 59, 1);

-- POGLEDI ZA STAVKE ODREĐENOG TIPA (korisno za dalje procedure)

CREATE OR REPLACE VIEW predracun_stavke AS
	SELECT predracun_id, proizvod_id, kolicina
		FROM stavka
        WHERE predracun_id IS NOT NULL;

CREATE OR REPLACE VIEW racun_stavke AS
	SELECT racun_id, proizvod_id, kolicina
		FROM stavka
        WHERE racun_id IS NOT NULL;

CREATE OR REPLACE VIEW nabava_stavke AS
	SELECT nabava_id, proizvod_id, kolicina 
		FROM stavka
        WHERE nabava_id IS NOT NULL;

CREATE OR REPLACE VIEW narudzba_stavke AS
	SELECT narudzba_id, proizvod_id, kolicina 
		FROM stavka
        WHERE narudzba_id IS NOT NULL;

-- POGLEDI ZA DETALJNIJI PREGLED RACUNA

CREATE OR REPLACE VIEW pregled_stavki_racuna AS
	SELECT racun_id, p.naziv, p.prodajna_cijena AS cijena , s.kolicina, (p.prodajna_cijena * kolicina) AS iznos, 
		IF(k.tip = "poslovni", 25, kb.popust) AS popust,
        IF(k.id IS NULL, p.prodajna_cijena * kolicina, ROUND(IF(k.tip = "poslovni", (prodajna_cijena * 3/4) * kolicina, (prodajna_cijena - prodajna_cijena * popust / 100) * kolicina), 2)) AS nakon_popusta
		FROM stavka AS s
		INNER JOIN racun AS r ON r.id = s.racun_id
		INNER JOIN proizvod AS p ON s.proizvod_id = p.id
        LEFT JOIN kupac AS k ON r.kupac_id = k.id
        LEFT JOIN klub AS kb ON k.klub_id = kb.id;

CREATE OR REPLACE VIEW pregled_racuna AS
	SELECT 	r.id AS racun_id,
			CONCAT(k.ime, " ", k.prezime) AS kupac,
			CONCAT(z.ime, " ", z.prezime) AS zaposlenik,
			datum, nacin_placanja,
            SUM(nakon_popusta) AS iznos
		FROM racun AS r
		LEFT JOIN kupac AS k ON r.kupac_id = k.id
		LEFT JOIN zaposlenik AS z ON r.zaposlenik_id = z.id
		LEFT JOIN pregled_stavki_racuna AS psr ON psr.racun_id = r.id
		GROUP BY r.id;

-- POGLED ZA KUPCE SA NAJVECIM BROJEM RACUNA

CREATE OR REPLACE VIEW najcesci_kupci AS
	SELECT CONCAT(ime, " ", prezime) AS kupac, COUNT(r.id) AS broj_racuna
		FROM racun AS r
		INNER JOIN kupac AS k ON r.kupac_id = k.id
        WHERE r.status = "izvrseno"
		GROUP BY kupac_id
        ORDER BY broj_racuna DESC;
     
-- POGLED ZA KUPCA SA NAJVISE POTROSENOG NOVCA

CREATE OR REPLACE VIEW najbolji_kupci AS
	SELECT kupac_id, kupac, SUM(iznos) AS ukupan_iznos
		FROM pregled_racuna AS pr
		INNER JOIN racun AS r ON pr.racun_id = r.id
		WHERE kupac_id IS NOT NULL AND r.status = "izvrseno"
		GROUP BY kupac_id, kupac
		ORDER BY ukupan_iznos DESC;
        
-- POGLED ZA ZAPOSLENIKA SA NAJVISE IZDANIH RACUNA

CREATE OR REPLACE VIEW najbolji_zaposlenik AS
	SELECT CONCAT(ime, " ", prezime) AS zaposlenik, spol, COUNT(r.id) AS broj_racuna
		FROM racun AS r
		INNER JOIN zaposlenik AS z ON r.zaposlenik_id = z.id
        WHERE r.status = "izvrseno"
		GROUP BY z.id
		ORDER BY broj_racuna DESC;
    
-- POGLED ZA NAJVISE PRODAVAN PROIZVOD

CREATE OR REPLACE VIEW najprodavaniji_proizvodi AS
	SELECT p.id, p.naziv, SUM(kolicina) AS kolicina
		FROM racun_stavke AS rs
		INNER JOIN proizvod AS p ON rs.proizvod_id = p.id
        INNER JOIN racun AS r ON r.id = rs.racun_id
        WHERE r.status = "izvrseno"
		GROUP BY proizvod_id
		ORDER BY kolicina DESC;
        
-- POGLED ZA PROIZVODE SA NAJVECIM PROFITOM

CREATE OR REPLACE VIEW najbolja_zarada AS
	SELECT p.id, p.naziv, SUM(nakon_popusta) AS zarada
		FROM pregled_stavki_racuna AS psr
		INNER JOIN proizvod AS p ON p.naziv = psr.naziv
        INNER JOIN racun AS r ON r.id = psr.racun_id
        WHERE r.status = "izvrseno"
		GROUP BY p.id
		ORDER BY zarada DESC;
        
-- PROCEDURA ZA STVARANJE RACUNA       
       
DELIMITER //

CREATE PROCEDURE stvori_racun(IN k_id INT, IN z_id INT, IN nacin_placanja VARCHAR(50), OUT r_id INT)
BEGIN
    INSERT INTO racun(kupac_id, zaposlenik_id, datum, nacin_placanja) VALUES 
    (k_id, z_id, NOW(), nacin_placanja);
    SET r_id = LAST_INSERT_ID();
END //

DELIMITER ;

-- PROCEDURA ZA POPUNJAVANJE RACUNA

DELIMITER //
CREATE PROCEDURE dodaj_stavke(IN json_data JSON)
BEGIN
	
    DECLARE pr_id, r_id, nab_id, nar_id, p_id, kol INT;
    DECLARE i INT DEFAULT 0;
    DECLARE total_rows INT;
    
    SET total_rows = JSON_LENGTH(json_data);
	
    WHILE i < total_rows DO
		SELECT NULL, NULL, NULL, NULL INTO pr_id, r_id, nab_id, nar_id;
		
		SET p_id = JSON_UNQUOTE(JSON_EXTRACT(json_data, CONCAT('$[', i, '].proizvod_id')));
		SET kol = JSON_UNQUOTE(JSON_EXTRACT(json_data, CONCAT('$[', i, '].kolicina')));

		IF JSON_EXTRACT(json_data, CONCAT('$[', i, '].predracun_id')) IS NOT NULL THEN
			SET pr_id = JSON_UNQUOTE(JSON_EXTRACT(json_data, CONCAT('$[', i, '].predracun_id')));
		END IF;

		IF JSON_EXTRACT(json_data, CONCAT('$[', i, '].racun_id')) IS NOT NULL THEN
			SET r_id = JSON_UNQUOTE(JSON_EXTRACT(json_data, CONCAT('$[', i, '].racun_id')));
		END IF;

		IF JSON_EXTRACT(json_data, CONCAT('$[', i, '].nabava_id')) IS NOT NULL THEN
			SET nab_id = JSON_UNQUOTE(JSON_EXTRACT(json_data, CONCAT('$[', i, '].nabava_id')));
		END IF;

		IF JSON_EXTRACT(json_data, CONCAT('$[', i, '].narudzba_id')) IS NOT NULL THEN
			SET nar_id = JSON_UNQUOTE(JSON_EXTRACT(json_data, CONCAT('$[', i, '].narudzba_id')));
		END IF;

		INSERT INTO stavka (predracun_id, racun_id, nabava_id, narudzba_id, proizvod_id, kolicina) 
		VALUES (pr_id, r_id, nab_id, nar_id, p_id, kol);    
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

-- PROCEDURA ZA BRISANJE RACUNA

DELIMITER //
CREATE PROCEDURE ponisti_racun(IN r_id INT)
BEGIN
	UPDATE racun SET status = "ponisteno" WHERE id = r_id;
END //
DELIMITER ;

-- PROCEDURA ZA DODAVANJE PROIZVODA       
       
DELIMITER //
CREATE PROCEDURE dodaj_proizvod(IN naziv VARCHAR(100), IN n_cijena DECIMAL(10, 2), IN p_cijena DECIMAL(10,2), kategorija_id INT)
BEGIN
    INSERT INTO proizvod VALUES (naziv, n_cijena, p_cijena, kategorija_id);
END //
DELIMITER ;

-- PROCEDURA ZA DODAVANJE KUPCA

DELIMITER //
CREATE PROCEDURE dodaj_kupca(
	IN ime VARCHAR(50), IN prezime VARCHAR(20), IN spol CHAR(1), adresa VARCHAR(100),
    IN email VARCHAR(50), IN tip VARCHAR(50), IN oib_firme CHAR(11))
BEGIN
    INSERT INTO kupac VALUES (ime, prezime, spol, adresa, email, tip, oib_firme);
END //
DELIMITER ;

-- PROCEDURA ZA PROCESIRANJE NARUDZBE

DELIMITER //
CREATE PROCEDURE procesiraj_narudzbu(IN n_id INT)
BEGIN
	DECLARE l_id, k_id, z_id, p_id, r_id, kol INT;
    DECLARE narudzba_error CONDITION FOR SQLSTATE '45000';
    DECLARE finished INT DEFAULT 0;
	DECLARE cur CURSOR FOR
		SELECT proizvod_id, kolicina FROM narudzba_stavke WHERE n_id = narudzba_id;
        
	DECLARE EXIT HANDLER FOR NOT FOUND SET finished = 1;
	
	IF((SELECT status FROM narudzba WHERE n_id = id) != "na cekanju") THEN 
		SIGNAL narudzba_error SET MESSAGE_TEXT = "Narudzba vec procesirana";
    END IF;
    
    SET l_id = (SELECT lokacija_id FROM narudzba WHERE id = n_id);
    SET k_id = (SELECT kupac_id FROM narudzba WHERE id = n_id);
    SET z_id = 1; -- ZA TESTIRANJE, UPDATAT FUNKCIONALNOST SA ULOGIRANIM ZAPOSLENIKOM POSLIJE
	
    START TRANSACTION;
		CALL stvori_racun(k_id, z_id, "POS", @r_id);
        UPDATE narudzba
			SET narudzba.status = "izvrseno"
			WHERE id = n_id;
		UPDATE stavka
			SET racun_id = @r_id
			WHERE narudzba_id = n_id;
            
		OPEN cur;
			procesiraj_stavke: LOOP
				FETCH cur INTO p_id, kol;
                
				IF finished = 1 THEN
					LEAVE procesiraj_stavke;
				END IF;
                
				IF (kol > (SELECT kolicina FROM inventar WHERE l_id = lokacija_id AND p_id = proizvod_id)) THEN
					ROLLBACK;
					SIGNAL narudzba_error SET MESSAGE_TEXT = "Nema dovoljno proizvoda na stanju";
                    
				END IF;
			END LOOP;
		CLOSE cur;
    COMMIT;
END //
DELIMITER ;

-- TESTIRANJE
-- pozvana dodaj_stavke procedura sa korektnom JSON sintaksom. (JSON ARRAY, iako ima samo jedan objekt)
CALL dodaj_stavke('[{"narudzba_id": 1, "proizvod_id": 70, "kolicina": 5}]');
SELECT * FROM narudzba_stavke;
