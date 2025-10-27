# Guide de Démarrage - FasoDocs Admin

## 🚀 Démarrer l'Application

### Depuis le dossier Admin :
```bash
cd admin-app
npm start
```

### Depuis le dossier admin-app :
```bash
npm start
```

## ⏱️ Attendre le Démarrage

Après avoir exécuté `npm start`, attendez que vous voyiez :
```
Application bundle generation complete.
Local: http://localhost:4200/
```

## 🌐 Accéder à l'Application

1. Ouvrez votre navigateur
2. Allez à l'adresse : **http://localhost:4200**
3. Vous verrez la page de connexion

## 🔐 Se Connecter

- Entrez votre nom d'utilisateur admin
- Entrez votre mot de passe admin
- Cliquez sur "Se connecter"

## ⚙️ Prérequis Backend

Assurez-vous que votre backend est démarré :
- Backend sur : `http://localhost:8080`
- CORS configuré pour autoriser `http://localhost:4200`

## 🛑 Arrêter le Serveur

Dans le terminal où le serveur tourne, appuyez sur :
```
Ctrl + C
```

## 🔧 Résolution de Problèmes

### Port déjà utilisé ?
Changez le port :
```bash
ng serve --port 4201
```

### Erreur Zone.js ?
```bash
# Arrêtez tous les processus Node.js
taskkill /F /IM node.exe

# Supprimez le cache
Remove-Item -Recurse -Force .angular

# Redémarrez
npm start
```

## ✅ Tout est configuré et prêt !
