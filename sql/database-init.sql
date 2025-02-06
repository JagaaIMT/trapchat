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

-- Insérer des utilisateurs
INSERT INTO Utilisateurs (nom, email) VALUES
('Alice Martin', 'alice.martin@email.com'),
('Bob Dupont', 'bob.dupont@email.com'),
('Charlie Durand', 'charlie.durand@email.com'),
('David Leroy', 'david.leroy@email.com'),
('Emma Moreau', 'emma.moreau@email.com'),
('François Leroy', 'francois.leroy@email.com'),
('Gabriel Joly', 'gabriel.joly@email.com'),
('Hélène Dupuis', 'helene.dupuis@email.com'),
('Isabelle Leblanc', 'isabelle.leblanc@email.com'),
('Julien Morin', 'julien.morin@email.com'),
('Karine Dufresne', 'karine.dufresne@email.com'),
('Louis Leclerc', 'louis.leclerc@email.com'),

-- Insérer des relations de suivi (Followers)
-- Zone 1 : Relations entre A1, B2, C3, D4, E5
INSERT INTO Follows (utilisateur_id, follower_id) VALUES
(2, 1),
(1, 2),
(1, 3),
(2, 3),
(3, 4),
(4, 5),
(5, 6),
(6, 7),
(7, 8),
(8, 7);

-- Zone 2 : Hyper-connexion entre 4 utilisateurs
INSERT INTO Follows (utilisateur_id, follower_id) VALUES
(9, 12),
(12, 10),
(10, 9),
(12, 11);

-- Insérer des produits
INSERT INTO Produits (nom_produit) VALUES
('Ordinateur Portable'),
('Smartphone'),
('Casque Audio'),
('Clavier Mécanique'),
('Souris Gamer');

-- Insertion des commandes pour chaque produit

-- Produit 1 acheté par A, B, D, H, I, J
INSERT INTO Commandes (utilisateur_id, produit_id, date_achat) VALUES
(1, 1, '2024-02-01 10:00:00'),
(2, 1, '2024-02-02 11:30:00'),
(4, 1, '2024-02-03 14:45:00'),
(8, 1, '2024-02-04 16:20:00'),
(9, 1, '2024-02-05 18:00:00'),
(10, 1, '2024-02-06 09:10:00');

-- Produit 2 acheté par A, F, H, I, K
INSERT INTO Commandes (utilisateur_id, produit_id, date_achat) VALUES
(1, 2, '2024-02-07 10:15:00'),
(6, 2, '2024-02-08 11:30:00'),
(8, 2, '2024-02-09 14:45:00'),
(9, 2, '2024-02-10 16:20:00'),
(11, 2, '2024-02-11 18:00:00');

-- Produit 3 acheté par A, C, D, E, F, G, H, J
INSERT INTO Commandes (utilisateur_id, produit_id, date_achat) VALUES
(1, 3, '2024-02-12 10:00:00'),
(3, 3, '2024-02-13 11:30:00'),
(4, 3, '2024-02-14 14:45:00'),
(5, 3, '2024-02-15 16:20:00'),
(6, 3, '2024-02-16 18:00:00'),
(7, 3, '2024-02-17 09:10:00'),
(8, 3, '2024-02-18 10:15:00'),
(10, 3, '2024-02-19 11:30:00');

-- Produit 4 acheté par E, I, K, L
INSERT INTO Commandes (utilisateur_id, produit_id, date_achat) VALUES
(5, 4, '2024-02-20 14:45:00'),
(9, 4, '2024-02-21 16:20:00'),
(11, 4, '2024-02-22 18:00:00'),
(12, 4, '2024-02-23 09:10:00');

-- Produit 5 acheté de façon aléatoire (5 achats)
INSERT INTO Commandes (utilisateur_id, produit_id, date_achat) VALUES
(2, 5, '2024-02-24 10:00:00'),
(4, 5, '2024-02-25 11:30:00'),
(6, 5, '2024-02-26 14:45:00'),
(8, 5, '2024-02-27 16:20:00'),
(10, 5, '2024-02-28 18:00:00');
