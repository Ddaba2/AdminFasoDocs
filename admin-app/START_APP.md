# Instructions de Démarrage - FasoDocs Admin

## ✅ Problème Résolu

L'erreur `NG0908: In this configuration Angular requires Zone.js` a été résolue :

1. ✅ Zone.js installé (version 0.15.1)
2. ✅ Import ajouté dans `main.ts` : `import 'zone.js';`
3. ✅ Cache Angular nettoyé
4. ✅ node_modules contient zone.js

## 🚀 Démarrer l'Application

### Méthode 1 : Depuis le dossier Admin
```bash
cd admin-app
npm start
```

### Méthode 2 : Depuis le dossier admin-app
```bash
npm start
```

### Port par défaut
L'application sera accessible sur : **http://localhost:4200**

## ⚙️ Configuration Vérifiée

- ✅ Zone.js installé et configuré
- ✅ Angular 20.1.0
- ✅ Toutes les dépendances installées
- ✅ Cache nettoyé
- ✅ Build réussi

## 🔍 Vérification

Pour vérifier que l'application démarre correctement :

1. Attendez 10-15 secondes après `npm start`
2. Ouvrez votre navigateur
3. Accédez à http://localhost:4200
4. Vous devriez voir la page de connexion

## ⚠️ Si l'erreur persiste

1. Arrêtez tous les processus Node.js :
   ```bash
   taskkill /F /IM node.exe
   ```

2. Nettoyez le cache :
   ```bash
   Remove-Item -Recurse -Force .angular
   Remove-Item -Recurse -Force node_modules\.cache
   ```

3. Réinstallez les dépendances :
   ```bash
   npm install
   ```

4. Redémarrez :
   ```bash
   npm start
   ```

## 📝 Notes

- Le serveur de développement Angular démarre sur le port 4200 par défaut
- Les changements de fichiers déclenchent automatiquement un rechargement
- Ouvrez la console du navigateur (F12) pour voir les erreurs éventuelles
