RADNIK(id, ime, prezime, onl_id, placa, pocetak_rada, )

LOKACIJA(id, ime, adresa)

ODJEL(id, ime)

ODJEL_NA_LOKACIJI(id, odjel_id, lokacija_id)

KUPAC(id, ime, prezime, adresa, mail, klub_id, vrsta (poslovni, privatni))

KLUB(id, razina, popust)

PROIZVOD(id, ime_proizvoda, sveukupna_kol (sakuplja koliko ima po svim trg i skladisitma, tj. mice se iz nje kad se kupi a kad se nabavi se dodaje))

PONUDA(id, proizvod_id, lokacija_id, kol_vani)

SKLADISTE(id, proizvod_id, lokacija_id, kol_u_skladistu)

NABAVA(id, radnik_id, lokacija_id, datum_narucenog, datum_dolaska)

STAVKA_NABAVE(id, nabava_id, proizvod_id)

PREDRACUN(id, kupac_id, datum_nastanka, vrsta (OBAVEZNO POSLOVNI), nacin_placanja, cijena, status)

RACUN(id, kupac_id, datum_nastanka, datum_izvrsenja, vrsta, nacin_placanja, cijena, status)

NARUDZBA(id, kupac_id, datum_nastanka, datum_izvrsenja, vrsta, nacin_placanja, cijena, status)

ODABRANA_STAVKA(id, proizvod_id, lokacija_id, vrsta, vrste_id)

