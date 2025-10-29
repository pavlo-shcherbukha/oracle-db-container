CREATE TABLE CUSTDOC.CUST$ARTIST
( IDA           INTEGER NOT NULL,
  artist_en     VARCHAR2(64),
  artist_ua     VARCHAR2(64),
  photo_url     VARCHAR2(160),
  work_url      VARCHAR2(160),
  work_title_en VARCHAR2(160),
  work_title_ua VARCHAR2(160),
  IUSRNM        VARCHAR2(30),
  IDT           DATE,
  MUSRNM        VARCHAR2(30),
  MDT           DATE,
  CONSTRAINT CUST$ARTIST_PK         PRIMARY KEY (IDA)
) 
/


COMMENT ON TABLE CUSTDOC.CUST$ARTIST IS 'Famous Artists';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.IDA            IS 'Record IDentifier';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.artist_en      IS 'Artist Name in English';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.artist_ua      IS 'Artist Name in Ukrainian';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.photo_url      IS 'Artist Photo URL';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.work_url       IS 'Artist Work URL';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.work_title_en  IS 'Artist Work Title in English';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.work_title_ua  IS 'Artist Work Title in Ukrainian';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.IUSRNM         IS 'Who Inserted the record';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.IDT            IS 'Date and Time of Insertion';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.MUSRNM         IS 'Who Modified the record';
COMMENT ON COLUMN CUSTDOC.CUST$ARTIST.MDT            IS 'Date and Time of Modification';



