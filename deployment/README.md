# CoinHub - Guide de Déploiement CI/CD

Ce dossier contient tous les fichiers nécessaires pour le déploiement automatisé de CoinHub avec GitHub Actions.

## 📁 Structure

```
deployment/
├── backend/
│   └── Dockerfile              # Dockerfile pour le backend
├── frontend/
│   └── Dockerfile              # Dockerfile pour le frontend
├── nginx/
│   └── conf/
│       └── default.conf        # Configuration Nginx
├── ci-cd.yml                   # Workflow GitHub Actions
├── docker-compose.prod.yml     # Configuration Docker Compose pour production
├── deploy.sh                   # Script de déploiement
└── README.md                   # Ce fichier
```

## 🚀 Configuration Initiale

### 1. Configuration GitHub Actions

Pour que le workflow fonctionne, vous devez copier le fichier `ci-cd.yml` dans `.github/workflows/`:

```bash
mkdir -p .github/workflows
cp deployment/ci-cd.yml .github/workflows/deploy.yml
```

### 2. Secrets GitHub

Ajoutez les secrets suivants dans votre repository GitHub (Settings > Secrets and variables > Actions):

| Secret | Description | Exemple |
|--------|-------------|---------|
| `SERVER_HOST` | Adresse IP ou nom de domaine de votre serveur | `123.45.67.89` ou `app.coinhub.com` |
| `SERVER_USER` | Nom d'utilisateur SSH | `ubuntu` ou `root` |
| `SERVER_SSH_KEY` | Clé privée SSH pour se connecter au serveur | Contenu de `~/.ssh/id_rsa` |
| `SERVER_PORT` | Port SSH (optionnel, par défaut 22) | `22` |

#### Générer une clé SSH

Si vous n'avez pas encore de clé SSH:

```bash
ssh-keygen -t ed25519 -C "github-actions@coinhub"
```

Copiez la clé publique sur votre serveur:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server_host
```

Copiez le contenu de la clé privée dans le secret `SERVER_SSH_KEY`:

```bash
cat ~/.ssh/id_ed25519
```

### 3. Préparation du Serveur

Sur votre serveur de production, installez Docker et Docker Compose:

```bash
# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installation Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
```

Créez la structure de dossiers:

```bash
mkdir -p ~/coinhub/deployment/backend
mkdir -p ~/coinhub/deployment/frontend
mkdir -p ~/coinhub/deployment/nginx/conf
mkdir -p ~/coinhub/deployment/nginx/ssl
```

### 4. Fichiers d'Environnement

Créez les fichiers `.env` sur le serveur:

**Backend** (`~/coinhub/deployment/backend/.env`):
```env
NODE_ENV=production
PORT=3001

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=coinhub
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com
```

**Frontend** (`~/coinhub/deployment/frontend/.env`):
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 5. Certificats SSL

Générez des certificats SSL auto-signés pour le développement (ou utilisez Let's Encrypt pour la production):

**Certificats auto-signés:**
```bash
cd ~/coinhub/deployment/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key \
  -out server.crt \
  -subj "/C=FR/ST=IDF/L=Paris/O=CoinHub/CN=localhost"
```

**Let's Encrypt (production):**
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

Puis liez les certificats:
```bash
ln -s /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/coinhub/deployment/nginx/ssl/server.crt
ln -s /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/coinhub/deployment/nginx/ssl/server.key
```

## 🔄 Workflow CI/CD

Le workflow GitHub Actions s'exécute automatiquement lors de:
- Push sur la branche `main` ou `develop`
- Pull Request vers `main` ou `develop`

### Étapes du Pipeline

1. **Test Backend**: Exécute les tests et le linter du backend
2. **Test Frontend**: Exécute les tests, le linter et le build du frontend
3. **Build and Push**: Construit les images Docker et les pousse vers GitHub Container Registry (seulement pour `main`)
4. **Deploy**: Déploie sur le serveur de production (seulement pour `main`)

## 📦 Utilisation des Images Docker

Les images sont publiées sur GitHub Container Registry:

```
ghcr.io/[votre-username]/coinhub/backend:latest
ghcr.io/[votre-username]/coinhub/frontend:latest
```

Pour utiliser les images du registry au lieu de builder localement, modifiez `docker-compose.prod.yml`:

```yaml
backend:
  image: ghcr.io/[votre-username]/coinhub/backend:latest
  # Commentez la section build:
  # build:
  #   context: ./backend
  #   dockerfile: Dockerfile
```

## 🛠️ Déploiement Manuel

Si vous souhaitez déployer manuellement:

```bash
# Sur le serveur
cd ~/coinhub/deployment
chmod +x deploy.sh
./deploy.sh
```

## 📊 Monitoring

### Voir les logs

```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Un service spécifique
docker-compose -f docker-compose.prod.yml logs -f backend
```

### État des conteneurs

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Redémarrer un service

```bash
docker-compose -f docker-compose.prod.yml restart backend
```

## 🔧 Maintenance

### Mise à jour

Le déploiement est automatique via GitHub Actions. Faites simplement un push sur `main`.

### Rollback

Pour revenir à une version précédente:

```bash
# Lister les images disponibles
docker images | grep coinhub

# Modifier docker-compose.prod.yml pour utiliser une version spécifique
docker-compose -f docker-compose.prod.yml up -d
```

### Nettoyage

```bash
# Supprimer les images non utilisées
docker image prune -a -f

# Supprimer les volumes non utilisés
docker volume prune -f
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

Vérifiez les logs:
```bash
docker-compose -f docker-compose.prod.yml logs
```

### Problèmes de connexion à la base de données

```bash
# Vérifier que PostgreSQL est prêt
docker exec coinhub-db-prod pg_isready -U postgres

# Accéder à la base de données
docker exec -it coinhub-db-prod psql -U postgres -d coinhub
```

### Problèmes de permissions

```bash
# Vérifier que l'utilisateur est dans le groupe docker
groups $USER

# Si nécessaire, se déconnecter et se reconnecter
```

## 📝 Notes

- Le workflow utilise GitHub Container Registry (gratuit pour les dépôts publics)
- Les images Docker sont mises en cache pour accélérer les builds
- Le déploiement inclut une vérification de santé des services
- Les migrations de base de données sont exécutées automatiquement

## 🔐 Sécurité

- Ne committez **jamais** les fichiers `.env` dans le repository
- Utilisez des mots de passe forts pour la base de données
- Configurez un firewall sur votre serveur
- Utilisez des certificats SSL valides en production
- Limitez l'accès SSH par clé uniquement

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
