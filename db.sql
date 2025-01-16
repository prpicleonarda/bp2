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

CREATE TABLE radnik (
	id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    mjesto_rada INT NOT NULL, -- (odjel_na_lokaciji id)
    placa DECIMAL NOT NULL,
    FOREIGN KEY (mjesto_rada) REFERENCES odjel_na_lokaciji(id)
);

CREATE TABLE kupac (
	id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    adresa VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    tip VARCHAR(50) NOT NULL,
    oib_firme CHAR(11),
    klub_id INT,
    FOREIGN KEY (klub_id) REFERENCES klub(id),
    CONSTRAINT tip_kupca_check CHECK (tip = 'privatni' OR tip = 'poslovni')
);

CREATE TABLE proizvod (
	id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(100) NOT NULL,
    nabavna_cijena DECIMAL NOT NULL,
    prodajna_cijena DECIMAL NOT NULL
    -- potencijalno dodati sveukupno stanje atribut
);

CREATE TABLE predracun (
	id INT AUTO_INCREMENT PRIMARY KEY,
    kupac_id INT,
    datum DATETIME NOT NULL,
    cijena DECIMAL NOT NULL,
    FOREIGN KEY (kupac_id) REFERENCES kupac(id)
    -- nacin placanja atribut maybe? ne znam da li je potreban i sta mozemo sa njim
);

CREATE TABLE racun (
	id INT AUTO_INCREMENT PRIMARY KEY,
    kupac_id INT,
    datum DATETIME NOT NULL,
    cijena DECIMAL NOT NULL,
    FOREIGN KEY (kupac_id) REFERENCES kupac(id)
    -- nacin placanja maybe? ne znam da li je potreban i sta mozemo sa njim
);

CREATE TABLE nabava (
	id INT AUTO_INCREMENT PRIMARY KEY,
    lokacija_id INT,
    datum DATETIME,
    cijena DECIMAL NOT NULL,
    FOREIGN KEY (lokacija_id) REFERENCES lokacija(id)
);

CREATE TABLE racun_stavka (
	racun_id INT,
    proizvod_id INT,
    kolicina INT NOT NULL,
	FOREIGN KEY (racun_id) REFERENCES racun(id),
    FOREIGN KEY (proizvod_id) REFERENCES proizvod(id)
);

CREATE TABLE predracun_stavka (
	predracun_id INT,
    proizvod_id INT,
    kolicina INT NOT NULL,
    FOREIGN KEY (predracun_id) REFERENCES predracun(id),
    FOREIGN KEY (proizvod_id) REFERENCES proizvod(id)
);

CREATE TABLE nabava_stavka (
	nabava_id INT,
    proizvod_id INT,
    kolicina INT NOT NULL,
	FOREIGN KEY (nabava_id) REFERENCES nabava(id),
    FOREIGN KEY (proizvod_id) REFERENCES proizvod(id)
);

CREATE TABLE skladiste (
	lokacija_id INT NOT NULL,
    proizvod_id INT NOT NULL,
    kolicina INT NOT NULL,
    FOREIGN KEY (lokacija_id) REFERENCES lokacija(id),
    FOREIGN KEY (proizvod_id) REFERENCES proizvod(id)
);

CREATE TABLE ponuda (
	lokacija_id INT NOT NULL,
    proizvod_id INT NOT NULL,
    kolicina INT NOT NULL,
    FOREIGN KEY (lokacija_id) REFERENCES lokacija(id),
    FOREIGN KEY (proizvod_id) REFERENCES proizvod(id)
);

