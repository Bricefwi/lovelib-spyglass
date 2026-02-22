# Bases de données (PostgreSQL & MySQL)

Requêtes SQL en lecture seule sur des bases PostgreSQL et MySQL. Bloque automatiquement les opérations d'écriture (INSERT, UPDATE, DELETE, DROP).

## PostgreSQL

### Prérequis

```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### Commandes

```bash
# Requête simple
python3 scripts/postgres/query.py --query "SELECT * FROM users LIMIT 10"

# Explorer le schéma
python3 scripts/postgres/query.py --query "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"

# Requête avec export
python3 scripts/postgres/query.py --query "SELECT * FROM orders" --output results.csv
```

## MySQL

### Prérequis

```bash
export MYSQL_HOST="localhost"
export MYSQL_USER="root"
export MYSQL_PASSWORD="password"
export MYSQL_DATABASE="mydb"  # optionnel
```

### Commandes

```bash
# Requête simple
python3 scripts/mysql/query.py --query "SELECT * FROM products LIMIT 10"

# Explorer le schéma
python3 scripts/mysql/query.py --query "SHOW TABLES"

# Requête avec export
python3 scripts/mysql/query.py --query "SELECT * FROM sales" --output results.csv
```

## Sécurité

Les deux scripts bloquent automatiquement les opérations d'écriture :
- INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE
- Seules les requêtes SELECT et SHOW sont autorisées
