-- Sélectionne la base de données trapchat
USE trapchat;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS Utilisateurs (
    utilisateur_id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Table des relations entre utilisateurs (suivis)
CREATE TABLE IF NOT EXISTS Follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    follower_id INT NOT NULL,
    UNIQUE KEY unique_follow (utilisateur_id, follower_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateurs(utilisateur_id) ON DELETE CASCADE,
    FOREIGN KEY (follower_id) REFERENCES Utilisateurs(utilisateur_id) ON DELETE CASCADE
);

-- Table des produits
CREATE TABLE IF NOT EXISTS Produits (
    produit_id INT AUTO_INCREMENT PRIMARY KEY,
    nom_produit VARCHAR(255) NOT NULL
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS Commandes (
    commande_id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    produit_id INT NOT NULL,
    date_achat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateurs(utilisateur_id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES Produits(produit_id) ON DELETE CASCADE
);

--INSERT POUR COHERENCE DES DONNEES

