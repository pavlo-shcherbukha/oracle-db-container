PROMPT ============================================
PROMPT 
PROMPT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
PROMPT      
PROMPT ===========================================



SPOOL _run.log

DROP TABLE CUSTDOC.CUST$DOCS$ATTACH PURGE;
DROP TABLE CUSTDOC.CUST$DOCS$URLS PURGE;
DROP TABLE CUSTDOC.CUST$DOCS PURGE;
DROP TABLE CUSTDOC.CUST$D$DOCTYPE  PURGE;
DROP TABLE CUSTDOC.CUST$CUST PURGE;
DROP TABLE CUSTDOC.CUST$ARTIST PURGE;

PROMPT CREATE SCHEMA
-- @@SCHEMA.SQL





PROMPT CREATE TABLES
@@TBL/tables.sql

-- PROMPT CREATE VIEW
-- @@VIW/VIEW.SQL




--PROMPT CREATE PROCEDURES
--@@PRC/proc.sql


--PROMPT Create Packages
--@@PKG/package.sql

PROMPT CREATE TRIGGERS
@@TRG/triggers.sql

PROMPT INSERTING
@@DATA/INSERT.SQL


PROMPT grants on database objects
@GRN.sql 

SPOOL OFF
--EXIT
