# oracle-db-container

Це частина навчального  проекту, що описано за лінком [AZURE AZ-204 AZ BLOB STORAGE - навчальний проект](https://pavlo-shcherbukha.github.io/posts/2025-10-16/az-204-blob-strg-ua/), що реалізую компоненти з групи "OnPremise Datacenter", див. архітекуру: [pic-03 узагальнена архітектура для міграції з бази даних в хмарне azure Blob Storage](https://pavlo-shcherbukha.github.io/assets/img/posts/2025-10-16-az-blobstrg/doc/pic-03.png)

## Отримання образу ORACLE DB з офіційного сайту ORACLE

Отримати образ БД ORACLE  можна, настільки я знайшов, тільки з офіційного ORACLE docker registry.
На Docker HUB я не знайшов офіційних образів бази даних ORACLE.  А не офіційні були віком в 5-7 років, тобто, застарілі
Тому, перш ніж розмовляти про отримання БД потрібно завести собі обліковий запис на [ORACLE CLOUD](https://cloud.oracle.com). Коли зареєструєтся, то ORACLE  буде вимагати поставити додаток **Oracle Authentificator**  на мобільний пристрій для багатофакторної автентифікації.

Коли вже є обліковка в ORACLE CLOUD можна підключатися до oracle docker registry.
Для цього треба зайти на https://container-registry.oracle.com  [pic-01](#pic-01).

<kbd><img src="doc/pic-01.png" /></kbd>
<p style="text-align: center;"><a name="pic-01">pic-01</a></p>


В розділі Databases можна побачити занйомі бази дниах:
- **adb-free**	Oracle Autonomous Database Free;
- **express** Oracle Database Express Edition;
- **free**	Oracle Database Free.

<kbd><img src="doc/pic-02.png" /></kbd>
<p style="text-align: center;"><a name="pic-02">pic-02</a></p>


Але для доступу до  репозиторію, потрібно зайти в свій профіль і згенерувати  собі токен, що буде використовуватися як пароль при логіні в репозиторій і вже потім можна підключатися до репозиторію і отримувати image

Я буду для дослідів використовувати racle Database Express Edition - як найпростішу і найменшу.

- **Підключення до  репозиторію**


```bash
$ docker login container-registry.oracle.com
# побачмо зап в консолі і вводимо облікові дані? логін та токен, що згенерували в профілі
login: <your repo login>
password: <your repo  auth token>

```

І вже потім отримуємо образ бази даних локально. Образ досить об'ємний, тому простіше сперщу отримати його локально, а вже потім  створвати контейнер.

**Отримання образа бази даних**

```bash

# отримуємо
$ docker pull container-registry.oracle.com/database/express:latest

# перевіряємо , що отримали
$ docker image ls
REPOSITORY                                       TAG              IMAGE ID       CREATED         SIZE
container-registry.oracle.com/database/express   latest           8da8cedb7fbf   2 years ago     11.4GB
$ 
```




- **Запуск контейенра**

Щоб підготувати каталог, де будуть зберігатися дані бази даних пішов  по  рекомендаціях, але в спрощеному вигляді

```bash
$ sudo mkdir oracle 
$ cd oracle
$ sudo mkdir oradata 

$ sudo chmod -R 777 /opt/oracle
$ sudo chmod -R 777 /opt/oracle/oradata
```

```bash
# створюємо volume для збереження даних БД. Це дасть можливість уникнути проблем з вільним місцем в /var/lib.
docker volume create oracle_db_data

# запускаємо контейнер
docker run -d --name shodcldb 
 -p 1521:1521 -p 5500:5500 
 -v oracle_db_data:/opt/oracle/oradata 
 -e ORACLE_CHARACTERSET=AL32UTF8 
 container-registry.oracle.com/database/express

```

- **Перегляд логу роботи контейенра**

Перший запуск Oracle Express Edition всередині Docker-контейнера виконує налаштування, яке може зайняти час. Перегляньте логи, щоб переконатися, що база даних готова до використання:

```bash
docker logs -f shodcldb

```

Подальшу роботу з базою даних можна продовжувати, коли вдасться знайти  повідомлення, подібні до:

    DATABASE IS READY TO USE!

    Setup complete. Database ready to use.

Після появи цього повідомлення  можна підключатися до бази даних за портами 1521 (SQL*Net) та 5500 (Enterprise Manager PDB).


- **Зупинка  контейнера**

```bash
docker stop shodcldb 

```

- **Повторний запуск  контейнера**

```bash
docker start shodcldb 

```



## Налаштування бази даних, що запустилася в контейнері

Перш за все треба встановити пароль для SYS, SYSTEM. Для цього терба зайти в контрейнер та запустити вже наявний sh-скрипт

### **Встановлення паролів адміністратора**

```bash
# Узагальнена команда
# docker exec <oracle-db> ./setPassword.sh <your_password>

# команда у відповідності до імені запущеного контейнера

docker exec  shodcldb ./setPassword.sh <пароль адміністраторо>

# перевіряемо можливість підключення до бази даних з середини контейнера

docker exec -it shodcldb sqlplus system/<пароль адміністратора>@XE


```

### **Створення  локальних користувачів бази даних**

Тут, є відмінності, від звичного для розробників enterprise підходу. Ну, або ж, їх DBA  давно знають, але розроники відділені за звичай від  бази даних (як і користувачі ) тому їх не відчували. Тут більше я себе маю на увазі ніж загальну практику.

Коли ви підключитеся до ORACLE оцією командою 

```bash
docker exec -it shodcldb sqlplus system/<пароль адміністратора>@XE
```

і спробуєте створити користувача бази даних, на приклад оцим скриптом,


```sql
CREATE USER NODEREDAPP1 IDENTIFIED BY "<password>";
GRANT CONNECT            TO NODEREDAPP1;
GRANT ALTER SESSION      TO NODEREDAPP1;

```




то отримаєте помилку **ORA-65096: invalid common user or role**. Помилка  виникає тому, що ви намагаєтеся створити локального користувача (не загального) в CDB (Container Database) або в Root Container (CDB\$ROOT) замість того, щоб створити його у PDB (Pluggable Database). Починаючи з Oracle 12c, архітектура Multi-tenant (CDB/PDB) вимагає дотримання наступних правил:
1. Місце підключення (Підключіться до PDB)
Ви повинні бути підключені до Pluggable Database (PDB), а не до кореневого контейнера (CDB\$ROOT).
Якщо ви використовуєте **Oracle XE** або **Free**, то **PDB** зазвичай називається **XEPDB1** або **FREEPDB1**.
І перед створенням користувача чи виконання інших DDL скрптів треба підключитися (переконатися, що підключилися), до потрібної PDB. Якщо не переклчитися до PDB  то не побачите ні ваших об'єктів бази даних, ні створених вам користувачів. Теоретично, вимога перемкнутися на PDB звучить  зрозуміло, але виникає закономірне питання: "Як підключитися до бази даних звичайним корситувачем?".
Справа в тому, що  PDB виступає свого роду як **Service Name**  бази даних і в рядку підключення замість Service Name треба ставити PDB тому ось приклади: 


- приклад запуску sqlplus з підключенням до бази даних (для ORACLE XE).
```bash
sqlpus username/password@localhost:1521/XEPDB1

```

Або ж

```bash
sqlplus system/ваш_пароль@XE/XEPDB1

```

- приклад підключеня до бази даних з уже запущеного sqlplus (для ORACLE XE).

```sql
connect username/password@localhost:1521/XEPDB1
```

або ж

```bash

SQL> CONNECT system/password@XE
SQL> ALTER SESSION SET CONTAINER = XEPDB1;
SQL> SHOW CON_NAME;
-- XEPDB1

```

### Виконання DDL/SQL скриптів на базі даних

Якщо я запустив базу даних в контейнері то у мене немає ніякої мотивації розгортати клієнта oracle та налаштовувати TNS NAME. Один з методів робти, і досить комвортний, це скопіювати скрипти на контерйнер, а потім зайти в контейнер і запустити SQL і з ним скрипти на виконання.

Для приклау тут DDL скрипти знаходяться в каталоз **oracle-ddl** і скрпти розклажені по підкаталогах. Все запускається через единий **run.sql**

- копіювання скриптів на файлов систему контейенра

```bash
# Тут вказується повний шлях ло каталогу
docker cp -a /home/.../oracle-ddl/. shodcldb:/home/oracle/

```

- запуск скрптиів на виконання

```bash
docker exec -it shodcldb /bin/bash -c "sqlplus SYSTEM/1Qazxsw2@localhost:1521/XEPDB1 @/home/oracle/run.sql"

```

Хоча, хвилиночку!
Перед запском скриптів треба: 

1. створити власника схеми і наділити його правами:

```bash
docker exec -it shodcldb /bin/bash -c "sqlplus SYSTEM/1Qazxsw2@localhost:1521/XEPDB1 @/home/oracle/SCHEMA.SQL"

```

2. створити прикладних користувачів та надати їм правльні ролі:

```bash
docker exec -it shodcldb /bin/bash -c "sqlplus SYSTEM/1Qazxsw2@localhost:1521/XEPDB1 @/home/oracle/APPUSERS.sql"

```

Після виконання скрипта ви залишаєетеся в SQLPLUS і можна зробити SQL-запити до бази даних, а потім по **EXIT** вийти з контейнера та sqlplus. 


А просто, зайти в контейнер і подивитися лог вконання скриптів, або видалити їх , можна виконавши тражиційну команду:

```bash
docker exec -it shodcldb /bin/bash

```

## Підключення до бази даних за допомогою  Jupyter Notebook

- **Створення віртуального середовища**

```bash
python3 -m venv env

```

- **Активація віртуального середовища**

```bash
source env/bin/activate
```

- **Установка необхідних пакетів**

```bash

pip install -r requirements.txt
```

- **Запустити  Jupyter NoteBook**

```bash
jupyter notebook
```

- **Перелік та призначення написаних NoteBooks**

   - test-oradb.ipynb  перевірка підключення до бази даних
   - db-dictionary.ipynb  отримати словни прикланих таблиць
   - load-test_data.ipynb  підготувати та завантажити тестові дані в прикладні таблиці
   - check_migration.ipynb контроль за виконнаям додатку (контроль ща міграцією)

   Як виявилося, викорситання jupyter notebook  достойна заміна використанню всяких там дата експлорерів.


    
  ## Запск Node-Red додатку

  Node-Red  додатко має 2 кастомні вузли в каталозі: nodered-srvc/shazblob.
  тому, в першу чергу 
  - зайти в nodered-srvc/shazblob та вконати

  ```npm install
  ```

  - після цього піднятися на крок вгору: (зайти в nodered-srvc) і теж виконати

  ```
   npm install

   ```

   Після цьго можна запускати Node-Red  (з каталога nodered-srvc) командою 

   ```
    npm run dev
   ``` 

   І, перш ніж працювати, 
   - потрібно в вузлах , що проацюють з БД ORACLE  поминіти ****** на ваш пароль до БД
   - потрібно налаштувати конфігураційний вузол для роботи з azure blob storage

   
## Node-RED 

### Flow: read-upload-blobs - читає з бази даних записи з Blob  полями та завантажуєе дані з Blob  на azure Blob Storage

<kbd><img src="doc/pic-03.png" /></kbd>
<p style="text-align: center;"><a name="pic-03">pic-03</a></p>



### Flow: process-StorageQueue-Msg - process-StorageQueue-Msg Читає повідомлення із Azure Storage Queue  та записує елементи повідомлення в базу даних oracle (робить insert  в таблицю)

<kbd><img src="doc/pic-04.png" /></kbd>
<p style="text-align: center;"><a name="pic-04">pic-04</a></p>


### Взаємодія з БД ORACLE

Для взаємодії з БД ORACLE використовується офіційна бібліотека для Node.js  **node-oracledb**. Посилання на документацію: https://node-oracledb.readthedocs.io/ .
використовується вона в функціональних Node. тому треба розуміти таке:
- Кожна "Function Node"  сама створює і закриває підключення до БД. Це не дуже хороша практика, але для прототипу підійде.
- Кожна транзакція, відкрита в "Function Node"  в ній і повинна закінчитися commit  або rollback.
- Підключення бібліотеки для використання в "Function Node" виконується наступним чином

1. Виконуємо традиційну для Node.js  інсталяцію пакету через npm

```bash
 npm install oracledb
```

2. Підключити бібліотеку в файлі settings.js

```js
   /** The following property can be used to set predefined values in Global Context.
     * This allows extra node modules to be made available with in Function node.
     * For example, the following:
     *    functionGlobalContext: { os:require('os') }
     * will allow the `os` module to be accessed in a Function node using:
     *    global.get("os")
     */
    functionGlobalContext: {
        // os:require('os'),
        oracledb: require('oracledb'),
        stream: require('stream'),
        //util: require('util'),
    },

```
 
3. В "Function Node" робимо кроки, відповідно до прокоментованого коду

приклад взято  flow: read-upload-blobs,  findMigrRecords node.

```js
// Підключення бібіліотеки ORACLE
const oracledb = global.get('oracledb');

// Створення конфігурації підключення до бази даних 
const dbConfig = {
    user: "CUSTDOC",
    password: "******",
    connectString: "localhost:1521/XEPDB1" 
};

// Оформляємо Async функцію для  виконання SQL
async function executeQuery(msg) {
    // перевірка наявності бібіліотеки ORACLE
    if (!oracledb) {
        msg.payload = { error: "oracledb is not loaded." };
        return msg;
    }

    let connection;
    try {
        // Підключення до БД
        connection = await oracledb.getConnection(dbConfig);

        // Простий запит без параметрів
        let sql=`SELECT A.CUSTID, A.IDDOC FROM CUSTDOC.CUST$DOCS  A 
        WHERE NOT EXISTS( SELECT 1 FROM CUSTDOC.CUST$DOCS$URLS B WHERE  B.IDDOC=A.IDDOC) 
        AND ISACRUAL='Y'
        AND ROWNUM=1`

	// Виконання запиту
        const result = await connection.execute(
            sql
        );

        // Аналіз та використання отриманого набору даних
        if (result.rows.length === 0) {
            node.warn(`No recors found!!!`);
            return null;
        }
        const row = result.rows[0];
        
        msg.payload.custid = row[0];
        msg.payload.iddoc = row[1];
        
        if (msg.payload.start) {
            delete msg.payload.start;
        }
        return msg;
        
    } catch (err) {
        const errorMessage = util.inspect(err);
        node.error(`Oracle DB Error: ${errorMessage}`, msg);
        msg.payload = { error: errorMessage };
        return msg;
    } finally {
            // обов'язкового закриваємо підключення до БД
            if (connection) {
            try {
                await connection.close();
            } catch (err) {
                node.warn(`Error closing connection: ${err.message}`);
            }
        }
    }
}

// Повернення Promise для асинхронного виконання
return executeQuery(msg);
```

Як працює транзакція, можна подивитися в flow: process-StorageQueue-Msg,   StoreToDabaBase NODE

```js

// Function Node code
const oracledb = global.get('oracledb');

const dbConfig = {
    user: "CUSTDOC",
    password: "*******",
    connectString: "localhost:1521/XEPDB1" 
};

// Асинхронна обгортка для виконання запиту
async function executeQuery(msg) {
    if (!oracledb) {
        msg.payload = { error: "oracledb is not loaded." };
        return msg;
    }

    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = `INSERT INTO CUSTDOC.CUST$DOCS$URLS
                     (IDFL, IDDOC, FILE_NAME, CONTAINER_NAME, CONTENT_TYPE, FILE_SIZE, FILE_URL)
                     VALUES
                     (:idfl, :iddoc, :blobname, :container_name, :content_type, :blob_size, :blob_url )`; 
                     
        const binds = {
            idfl: msg.payload.queueMessageBody.customMetadata.fileid, 
            iddoc: msg.payload.queueMessageBody.customMetadata.documentid ,
            blobname: msg.payload.queueMessageBody.blobName, 
            container_name: msg.payload.queueMessageBody.containerName,  
            content_type: msg.payload.queueMessageBody.contentType, 
            blob_size: msg.payload.queueMessageBody.blobSize,
            blob_url: msg.payload.queueMessageBody.blobUrl
        };

        const result = await connection.execute(
            sql,
            binds
        );

        connection.commit();
        msg.payload.ok = true;
        msg.payload.text = 'Record migrated';
        return msg;

    } catch (err) {
        const errorMessage = util.inspect(err);
        node.error(`Oracle DB Error: ${errorMessage}`, msg);
        msg.payload = { error: errorMessage };
        return msg;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                node.warn(`Error closing connection: ${err.message}`);
            }
        }
    }
}

// Повернення Promise для асинхронного виконання
return executeQuery(msg);

```

