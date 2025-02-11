# TrapChat

TrapChat est une application utilisant **Neo4j** et **MariaDB** pour gérer ses données. Ce guide vous aidera à installer et lancer l'application.

---

## 🚀 Installation de la base de données

### 1️⃣ Lancer Neo4j

```sh
cd dockers/neo4j
docker-compose up -d
```

### 2️⃣ Lancer MariaDB

```sh
cd ../mariadb
docker-compose up -d
```

### 3️⃣ Installer les dépendances

```sh
cd ../../
npm install
```

### 4️⃣ Vérifier que Neo4j est bien lancé

Neo4j peut prendre un peu de temps à démarrer. Vérifiez si l'interface est accessible en ouvrant :
[http://localhost:7474](http://localhost:7474)

### 5️⃣ Appliquer les migrations

Une fois Neo4j prêt, exécutez la migration :

```sh
node migrate.js
```

---

## 🖥️ Lancer le serveur

Si vous n'avez pas encore installé les dépendances, exécutez :

```sh
npm install
```

Ensuite, démarrez le serveur :

```sh
node ./back/server.js
```

---

## 💻 Lancer l'application

//TKT

---
