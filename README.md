# ☁️ AWS Paris Dashboard (eu-west-3)

Une interface web légère et réactive pour administrer vos ressources **Amazon EC2** et **VPC** spécifiquement sur la région de Paris. Ce projet utilise **Node.js** avec le SDK AWS v3 et une interface frontend moderne.

## 🚀 Fonctionnalités

### 🖥️ Gestion EC2
* **Listing en temps réel** : Visualisez vos instances, leur type, leur statut et l'AMI utilisée.
* **Déploiement rapide** : Lancez une instance `t3.micro` sous Ubuntu en un clic.
* **Cycle de vie** : Arrêtez, redémarrez ou supprimez (terminate) vos instances directement depuis l'interface.

### 🌐 Gestion Réseau (VPC)
* **Listing des VPC** : Affichez tous les réseaux existants dans la zone `eu-west-3`.
* **Création de VPC** : Créez de nouveaux réseaux avec des blocs CIDR personnalisés.
* **Gestion des Sous-réseaux** : Créez et associez des sous-réseaux à vos VPC.
* **Connectivité Internet** : Création et attachement automatique d'Internet Gateways (IGW).
* **Modification CIDR** : Ajoutez ou supprimez des blocs CIDR secondaires.

## 🛠️ Installation

1. **Cloner le projet** :
   ```bash
   git clone <url-du-repo>
   cd <nom-du-dossier>
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les identifiants** :
Créez un fichier .env à la racine du projet :
   ```bash
   AWS_ACCESS_KEY_ID=VOTRE_CLE_ACCESS
   AWS_SECRET_ACCESS_KEY=VOTRE_CLE_SECRETE
   AWS_REGION=eu-west-3
   ```

4. **Lancer l'application** :
   ```bash
   node app.js
   ```
   Accédez à l'interface sur http://localhost:3000.

## 📂 Structure du Projet

* `app.js` : Serveur **Express.js**. Il fait le pont entre ton navigateur et AWS. Il contient toutes les routes API sécurisées.
* `public/` : Dossier contenant les fichiers statiques servis par Node.js.
   * `index.html` : La carrosserie. Une interface épurée avec une barre latérale de navigation et des cartes par service.
   * `style.css` : Le design. Utilise les codes couleurs AWS (Orange/Squid Ink) pour une immersion totale.
   * `script.js` : Le cerveau. Gère les appels `fetch` asynchrones, la mise à jour dynamique des tableaux sans recharger la page, et la console de logs.
* `.env` : (Non inclus dans Git) Contient tes secrets AWS pour ne pas les exposer dans le code source.

## 🛠️ Stack Technique

* **Backend** : Node.js, Express.js
* **AWS SDK** : `@aws-sdk/client-ec2` (v3)
* **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
* **Configuration** : `dotenv`

## 📋 Prérequis & Permissions

L'utilisateur IAM lié aux clés d'accès doit posséder au moins les politiques suivantes pour une gestion complète :
* `AmazonEC2FullAccess`
* `AmazonVPCFullAccess`

## 💡 Astuces d'utilisation

1. **Console de Logs** : Regardez le bas de la page pour confirmer que vos actions ont bien été reçues par AWS.
2. **Suppression de VPC** : Si un VPC refuse de se supprimer, assurez-vous d'avoir d'abord supprimé les instances EC2 qu'il contient.
3. **Statut "Terminated"** : Les instances supprimées restent affichées environ 1 heure dans la liste avec le statut `terminated` avant d'être définitivement nettoyées par AWS.

---
*Ce projet a été conçu par Alexis pour simplifier l'administration Cloud au quotidien.*