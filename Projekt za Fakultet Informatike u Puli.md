## Autori
Projekt su razvili studenti Fakulteta Informatike u Puli:
- **Leonarda Prpić**
- **Dominik Ćurić**
- **Filip Lukes**
- **Igor Tadić**
- **Renzo Ermacora**
- **Gabriel Pavić**

## Opis projekta
Ovaj projekt je razvijen za predmet Baze Podataka 2. Tema koju smo mi odabrali je lanac trgovina pod imenom "Dani nakon" te se sastoji od fizičkih trgovina i Internet trgovine. Tehnologije koje smo odlučili koristiti su MySQL za bazu podataka, Flask kao naš web framework te uz njega kombinaciju html-a, css-a i javascripta za izradu same web stranice. 
Što se same trgovine tiče, proizvoda ima svakakvih, od vrtne garniture, preko hrane i pića sve do jeftine kineske elektronike. Svi ti proizvodi se onda dijele na trgovine koje su na svojim lokacijama te svaka ima pripadajuće skladište. Internet trgovina kombinira njihove proizvode te ovisno o privilegijama korisnika(admin, user, zaposlenik, gost) može se kupovati i/ili upravljati samim lancem trgovina.

Napomena: može biti samo jedna poslovnica po gradu  te zaposlenik može raditi u samo jednoj poslovnici radi jednostavnosti.

# Dokumentacija baze podataka: `trgovina`

Ova baza podataka modelira poslovne procese unutar trgovine. Struktura baze omogućuje upravljanje kupcima, zaposlenicima, proizvodima, transakcijama, zalihama i drugim ključnim elementima poslovanja.

---

## Sadržaj
1. [Opis tablica](#opis-tablica)
2. [Relacije između tablica](#relacije-između-tablica)
3. [Validacijska pravila i ograničenja](#validacijska-pravila-i-ogranicenja)

---

## Lista i opis tablica

### 1. `klub`
Tablica koja pohranjuje podatke o razinama članstva u klubu lojalnosti kupaca.
- **Atributi**:
  - `id` (INT, primarni ključ, AUTO_INCREMNET)
  - `razina` (VARCHAR(50), razina članstva)
  - `popust` (INT, postotak popusta)

---

### 2. `lokacija`
Tablica koja pohranjuje podatke o gradovima u kojima trgovina posluje.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `grad` (VARCHAR(50), naziv grada)

---

### 3. `odjel`
Tablica koja definira različite odjele unutar trgovine.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `naziv` (VARCHAR(100), naziv odjela)

---

### 4. `odjel_na_lokaciji`
Tablica koja povezuje odjele s njihovim lokacijama.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `odjel_id` (INT, strani ključ prema `odjel.id`)
  - `lokacija_id` (INT, strani ključ prema `lokacija.id`)

---

### 5. `zaposlenik`
Tablica za evidenciju zaposlenika.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `ime` (VARCHAR(50))
  - `prezime` (VARCHAR(50))
  - `mjesto_rada` (INT, strani ključ prema `odjel_na_lokaciji.id`)
  - `placa` (DECIMAL(10, 2))
  - `spol` (CHAR(1), moguće vrijednosti: "M" ili "Ž")

---

### 6. `kupac`
Tablica za pohranu podataka o kupcima.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `ime` (VARCHAR(50))
  - `prezime` (VARCHAR(50))
  - `spol` (CHAR(1), moguće vrijednosti: "M" ili "Ž")
  - `adresa` (VARCHAR(100))
  - `email` (VARCHAR(50))
  - `tip` (VARCHAR(50), privatni ili poslovni)
  - `oib_firme` (CHAR(11), opcionalno)
  - `klub_id` (INT, strani ključ prema `klub.id`)

---

### 7. `kategorija`
Tablica za klasifikaciju proizvoda.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `naziv` (VARCHAR(50))
  - `odjel_id` (INT, strani ključ prema `odjel.id`)

---

### 8. `proizvod`
Tablica za pohranu informacija o proizvodima.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `naziv` (VARCHAR(100), jedinstven)
  - `nabavna_cijena` (DECIMAL(10, 2))
  - `prodajna_cijena` (DECIMAL(10, 2))
  - `kategorija_id` (INT, strani ključ prema `kategorija.id`)
  - `popust_tip` (VARCHAR(30), opcionalno)

---

### 9. `predracun` i `racun`
Tablice za upravljanje predračunima i računima.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `kupac_id` (INT, strani ključ prema `kupac.id`)
  - `zaposlenik_id` (INT, strani ključ prema `zaposlenik.id`)
  - `datum` (DATETIME)
  - `nacin_placanja` (VARCHAR(30), npr. "POS" ili "gotovina")
  - `status` (samo u `racun`, moguće vrijednosti: "izvrseno" ili "ponisteno")

---

### 10. `nabava` i `narudzba`
Tablice za upravljanje nabavom i narudžbama. Nabava je po default-u "na čekanju" dok kad se krene izvršavati prelazi u narudžbu.
- **Atributi**:
  - `id` (INT, primarni ključ)
  - `lokacija_id` (INT, strani ključ prema `lokacija.id`)
  - `kupac_id` (INT, strani ključ prema `kupac.id`, samo u `narudzba`)
  - `datum` (DATETIME)
  - `status` (samo u `narudzba`, moguće vrijednosti: "na cekanju", "izvrseno", "ponisteno")

---

### 11. `stavka`
Tablica koja bilježi pojedinačne stavke računa, predračuna, nabave i narudžbi.
- **Atributi**:
  - Strani ključevi prema `predracun`, `racun`, `nabava`, `narudzba`
  - `proizvod_id` (INT, strani ključ prema `proizvod.id`)
  - `cijena`, `kolicina`, `ukupan_iznos`, `popust`, `nakon_popusta`

---

### 12. `inventar`
Tablica za praćenje zaliha proizvoda po lokacijama.
- **Atributi**:
  - `lokacija_id` (INT, strani ključ prema `lokacija.id`)
  - `proizvod_id` (INT, strani ključ prema `proizvod.id`)
  - `kolicina` (INT)

---

### 13. `evidencija`
Tablica za bilježenje operacija u sustavu.
- **Atributi**:
  - `opis` (VARCHAR(255))
  - `vrijeme` (DATETIME)

---

## Relacije između tablica
- **1:N**:
  - `kupac` → `racun`, `predracun`, `narudzba`
  - `zaposlenik` → `racun`, `predracun`
  - `odjel` → `kategorija`
  - `kategorija` → `proizvod`
- **M:N** (preko posrednih tablica):
  - `odjel` ↔ `lokacija` (kroz `odjel_na_lokaciji`)
  - `lokacija` ↔ `proizvod` (kroz `inventar`)
(! AI !  ovo+tablice, treba par stvari prepraviti i nadopuniti)
---

## Validacijska pravila i ograničenja
- **Provjere vrijednosti**:
  - `spol` atributi u tablicama `zaposlenik` i `kupac`.
  - `cijene` u tablici `proizvod`.
  - `status` atributi u `racun` i `narudzba`.
- **Jedinstvenost**:
  - Nazivi proizvoda (`proizvod.naziv`).
- **Vanjski ključevi**:
  - Veze između tablica osiguravaju konzistentnost podataka.
# Dokumentacija za SQL Skripte i Procedure

Ova dokumentacija opisuje SQL skripte i procedure korištene u sustavu za upravljanje podacima o proizvodima, računima, kupcima i zaposlenicima.

## Pogledi (Views)

### 1. **pregled_lokacija_sa_odjelima**
Pruža pogled koji sve odjeli postoje na određenim lokacijama.

- **Opis**: Spaja tablice `lokacija` i `odjel` kako bi prikazao na kojim lokacijama se nalaze koji odjeli te ih spaja po gradu(lokaciji).
- **Upotreba**: Prikaz podataka za analizu i izvješća o proizvodima.

---

### 2. **pregled_proizvoda**
Pruža pregled proizvoda i njihove pripadajuće odjele.

- **Opis**: Spaja tablice `proizvod`, `kategorija`, i `odjel` kako bi prikazao informacije o proizvodima zajedno s nazivom odjela.
- **Upotreba**: Prikaz podataka za analizu i izvješća o proizvodima.

---

### 3. **predracun_stavke i  racun_stavke**
Pogledi na stavke unutar predračuna i računa.

- **Opis**: Filtriraju tablicu `stavka` prema id-u unutar tablice `predračun` ili `račun`.
- **Upotreba**: Omogućuje analizu proizvoda unutar predračuna i računa.

---

### 4. **nabava_stavke i narudzba_stavke**
Pregledi za stavke unutar nabave i narudžbe.

- **Opis**: Filtriraju tablicu `stavka` prema id-u unutar tablice `nabava` ili `narudzba`.
- **Upotreba**: Omogućuje analizu proizvoda unutar nabave i narudžbe.

---

### 5. **pregled_racuna**
Pruža detaljan pregled računa koji prikazuje tko je izdao račun, koje proizvode je kupio, datum izdavanja te listu kupljenih proizvoda.

- **Opis**: Spaja račune s informacijama o kupcima, zaposlenicima i stavkama računa te računa ukupan iznos nakon popusta (ukoliko ga je bilo). Uz to koristi proceduru `racun_detalji` koja grupira i prikazuje detalje samog računa. Više o proceduri `racun_detalji` u odjeljku "Procedure".
- **Upotreba**: Koristi se za analizu prodaje i izvješća o računima.

---

### 6. **Pogled: najcesci_kupci**
Prikazuje kupce s najvećim brojem izvršenih računa.

- **Opis**: Grupira izvršene račune po kupcima i broji ih.
- **Upotreba**: Identifikacija najaktivnijih kupaca.

---

### 7. **Pogled: najbolji_kupci**
Prikazuje kupce s sveukupnim najvećim potrošenim iznosom.

- **Opis**: Grupira sveukupne izvršene račune kupaca, stvara sumu sveukupnog potrošenog iznosa te ih onda rangira.
- **Upotreba**: Analiza kupovne moći i lojalnosti kupaca.

---

### 8. **Pogled: najbolji_zaposlenik_racuni**
Prikazuje zaposlenike s najviše izdanih računa te ih sortira prema uspješnosti.

- **Opis**: Pogled grupira tablice zaposlenika i računa s statusom "izvrseno", zbraja koliko je koji zaposlenik izdao računa te onda prikazuje zaposlenike sortirane prema njihovoj uspješnosti.
- **Upotreba**: Praćenje učinka zaposlenika bazirano na izdanim računima.

---

### 9. **Pogled: najbolji_zaposlenik_zarada**
Prikazuje zaposlenike s najviše sveukupne generirane zarade te ih sortira prema uspješnosti.

- **Opis**: Pogled grupira tablice zaposlenika i računa s statusom "izvrseno", zbraja koliko je koji zaposlenik generirao zarade za poslovnicu te onda prikazuje zaposlenike sortirane prema njihovoj uspješnosti.
- **Upotreba**: Praćenje učinka zaposlenika bazirano na generiranom prometu.

---
### 10. **Pogled: najprodavaniji_proizvodi**
Prikazuje proizvode bazirano na sveukupnoj prodanoj količini.

- **Opis**: Pogled grupira tablice proizvoda i računa s statusom "izvrseno", zbraja koliko je bilo prodanih proizvoda te onda ih prikazuje sortirane prema njihovoj uspješnosti.
- **Upotreba**: Praćenje učinka zaposlenika.

---
### 9. **najprodavaniji_proizvodi** i **najbolja_zarada**
Prikazuje najprodavanije proizvode.

- **Opis**: Pogled grupira tablice zaposlenika i računa s statusom "izvrseno", zbraja koliko je koji zaposlenik izdao računa te onda prikazuje zaposlenike sortirane prema njihovoj uspješnosti.
- **Upotreba**: Praćenje učinka zaposlenika.

---

## Procedure

### 1. **racun_detalji**
Prikazuje detalje stavki za određeni račun.

- **Ulazni parametar**: `r_id` (ID računa).
- **Izlaz**: Popis stavki računa s informacijama o količini, cijeni i popustima.

---

### 2. **stvori_zapis**
Stvara zapis u tablici evidencije.

- **Ulazni parametar**: `poruka` (tekst zapisa).
- **Opis**: Koristi se za praćenje aktivnosti u sustavu.

---

### 3. **stvori_racun**
Kreira novi račun.

- **Ulazni parametri**:
  - `k_id`: ID kupca.
  - `z_id`: ID zaposlenika.
  - `nacin_placanja`: Način plaćanja.
- **Opis**: Automatski unosi račun i bilježi aktivnost.

---

### 4. **dodaj_stavke**
Dodaje stavke u određeni dokument.

- **Ulazni parametar**: `json_data` (JSON s podacima o stavkama).
- **Opis**: Iterira kroz JSON objekt i dodaje stavke u tablicu.

---

### 5. **ponisti_racun**
Poništava račun.

- **Ulazni parametar**: `r_id` (ID računa).
- **Opis**: Mijenja status računa u "poništeno" i bilježi aktivnost.

---

### 6. **dodaj_proizvod**
Dodaje novi proizvod.

- **Ulazni parametri**:
  - `naziv`: Naziv proizvoda.
  - `n_cijena`: Nabavna cijena.
  - `p_cijena`: Prodajna cijena.
  - `kategorija_id`: ID kategorije.
- **Opis**: Kreira zapis za novi proizvod i bilježi aktivnost.

---

### 7. **dodaj_kupca**
Dodaje novog kupca.

- **Ulazni parametri**: Informacije o kupcu (ime, prezime, spol, adresa, itd.).
- **Opis**: Automatski unosi kupca i bilježi aktivnost.

---

### 8. **procesiraj_narudzbu**
Procesira narudžbu i generira račun.

- **Ulazni parametar**: `n_id` (ID narudžbe).
- **Opis**:
  - Provjerava status narudžbe.
  - Generira račun i ažurira stavke.
  - Provjerava dostupnost proizvoda u inventaru.
  - Koristi transakcije za osiguranje konzistentnosti podataka.

---

-- ================================================
-- OKIDAČ: stavka_cijene
-- ================================================
DELIMITER //

CREATE TRIGGER stavka_cijene
BEFORE INSERT ON stavka
FOR EACH ROW
BEGIN
    DECLARE kl_id, ku_id INT;
    SET @popust_tip = (SELECT popust_tip FROM proizvod WHERE id = NEW.proizvod_id);
    SET NEW.proizvod_naziv = (SELECT naziv FROM proizvod WHERE id = NEW.proizvod_id);
    
    IF NEW.nabava_id IS NOT NULL THEN
        SET NEW.cijena = (SELECT nabavna_cijena FROM proizvod WHERE id = NEW.proizvod_id);
        SET NEW.ukupan_iznos = NEW.cijena * NEW.kolicina;
    ELSE
        SET NEW.cijena = (SELECT prodajna_cijena FROM proizvod WHERE id = NEW.proizvod_id);
        SET NEW.ukupan_iznos = NEW.cijena * NEW.kolicina;
        
        IF (NEW.predracun_id IS NOT NULL) THEN
            SET ku_id = (SELECT kupac_id FROM predracun WHERE id = NEW.predracun_id); 
        END IF;
        IF (NEW.racun_id IS NOT NULL) THEN
            SET ku_id = (SELECT kupac_id FROM racun WHERE id = NEW.racun_id); 
        END IF;
        IF (NEW.narudzba_id IS NOT NULL) THEN
            SET ku_id = (SELECT kupac_id FROM narudzba WHERE id = NEW.narudzba_id); 
        END IF;
    END IF;
    
    IF @popust_tip = "kolicina" AND NEW.kolicina >=3 THEN
        SET NEW.popust = 15;
    END IF;
    
    IF @popust_tip = "klub" THEN
        SET kl_id = (SELECT klub_id FROM kupac WHERE id = ku_id);
        
        SET NEW.popust = (SELECT popust FROM klub WHERE id = kl_id);
    END IF;
    
    IF (SELECT tip FROM kupac WHERE id = ku_id) = "poslovni" THEN
        SET NEW.popust = 25;
    END IF;
    
    SET NEW.nakon_popusta = IF(NEW.popust IS NULL, NEW.ukupan_iznos, NEW.ukupan_iznos * (1 - NEW.popust/100));
END //

DELIMITER ;

-- ================================================
-- UČITAVANJE PODATAKA
-- ================================================

-- Podaci za klubove
INSERT INTO klub(razina, popust) VALUES 
("Silver", 5),
("Gold", 10),
("Platinum", 15);

-- Podaci za lokacije
INSERT INTO lokacija(grad) VALUES 
("Pula"),
("Zagreb"),
("Split"),
("Zadar"),
("Rijeka"),
("Osijek");

-- Podaci za odjele
INSERT INTO odjel(naziv) VALUES 
("Kućanski Uređaji"),
("Elektronika"),
("Vrt i sezona"),
("Široka potrošnja");

-- Povezivanje odjela s lokacijama
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
(4, 3);

-- Podaci za zaposlenike
INSERT INTO zaposlenik(ime, prezime, mjesto_rada, placa, spol) VALUES
("Zvonimir", "Krtić", 1, 1200, "M"),
("Viktor", "Lovreković", 1, 1200, "M"),
("Lana", "Margetić", 2, 1300, "Ž"),
("Ines", "Pavić", 2, 1250, "Ž");

-- Podaci za kupce
INSERT INTO kupac(ime, prezime, spol, adresa, email, tip, oib_firme, klub_id) VALUES
("Krešimir", "Gavranić", "M", "Splitska 3", "kgavranic@gmail.com", "privatni", NULL, 1),
("Luka", "Horvat", "M", "Istarska 7", "lhorvat@gmail.com", "poslovni", "12345678901", NULL),
("Ana", "Perić", "Ž", "Dalmatinska 10", "aperic@gmail.com", "privatni", NULL, 2);

-- Podaci za kategorije proizvoda
INSERT INTO kategorija(naziv, odjel_id) VALUES
("Bijela tehnika", 1),
("Hlađenje i grijanje", 1),
("Audio i video", 2),
("Računala", 2);

-- Podaci za proizvode
INSERT INTO proizvod(naziv, nabavna_cijena, prodajna_cijena, kategorija_id, popust_tip) VALUES
("Perilica rublja Končar", 180, 450, 1, "kolicina"),
("Perilica rublja Candy", 150, 370, 1, NULL),
("Klima uređaj LG", 300, 700, 2, "klub"),
("TV Samsung", 400, 900, 3, NULL),
("Laptop HP", 500, 1200, 4, "klub");
