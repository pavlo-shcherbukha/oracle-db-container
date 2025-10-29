PROMPT ============================================
PROMPT 
PROMPT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
PROMPT      
PROMPT ===========================================



SPOOL _run.log

DROP TABLE CUSTDOC.CUST$DOCS$ATTACH PURGE;
DROP TABLE CUSTDOC.CUST$DOCS PURGE;
DROP TABLE CUSTDOC.CUST$D$DOCTYPE  PURGE;


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


PROMPT grant for Message Broker
@GRN.sql 

SPOOL OFF
--EXIT
