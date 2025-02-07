// Création des utilisateurs avec des UUIDs
CREATE (u1:Utilisateur {id: apoc.create.uuid(), nom: "Alice Martin", email: "alice.martin@email.com"})
CREATE (u2:Utilisateur {id: apoc.create.uuid(), nom: "Bob Dupont", email: "bob.dupont@email.com"})
CREATE (u3:Utilisateur {id: apoc.create.uuid(), nom: "Charlie Durand", email: "charlie.durand@email.com"})
CREATE (u4:Utilisateur {id: apoc.create.uuid(), nom: "David Leroy", email: "david.leroy@email.com"})
CREATE (u5:Utilisateur {id: apoc.create.uuid(), nom: "Emma Moreau", email: "emma.moreau@email.com"})
CREATE (u6:Utilisateur {id: apoc.create.uuid(), nom: "François Leroy", email: "francois.leroy@email.com"})
CREATE (u7:Utilisateur {id: apoc.create.uuid(), nom: "Gabriel Joly", email: "gabriel.joly@email.com"})
CREATE (u8:Utilisateur {id: apoc.create.uuid(), nom: "Hélène Dupuis", email: "helene.dupuis@email.com"})
CREATE (u9:Utilisateur {id: apoc.create.uuid(), nom: "Isabelle Leblanc", email: "isabelle.leblanc@email.com"})
CREATE (u10:Utilisateur {id: apoc.create.uuid(), nom: "Julien Morin", email: "julien.morin@email.com"})
CREATE (u11:Utilisateur {id: apoc.create.uuid(), nom: "Karine Dufresne", email: "karine.dufresne@email.com"})
CREATE (u12:Utilisateur {id: apoc.create.uuid(), nom: "Louis Leclerc", email: "louis.leclerc@email.com"})

// Création des relations de suivi (Followers)
MATCH (u1:Utilisateur {email: "alice.martin@email.com"}), 
      (u2:Utilisateur {email: "bob.dupont@email.com"}),
      (u3:Utilisateur {email: "charlie.durand@email.com"}),
      (u4:Utilisateur {email: "david.leroy@email.com"}),
      (u5:Utilisateur {email: "emma.moreau@email.com"}),
      (u6:Utilisateur {email: "francois.leroy@email.com"}),
      (u7:Utilisateur {email: "gabriel.joly@email.com"}),
      (u8:Utilisateur {email: "helene.dupuis@email.com"})
CREATE (u1)-[:FOLLOWS]->(u2),
       (u2)-[:FOLLOWS]->(u1),
       (u3)-[:FOLLOWS]->(u1),
       (u3)-[:FOLLOWS]->(u2),
       (u4)-[:FOLLOWS]->(u3),
       (u5)-[:FOLLOWS]->(u4),
       (u6)-[:FOLLOWS]->(u5),
       (u7)-[:FOLLOWS]->(u6),
       (u8)-[:FOLLOWS]->(u7),
       (u7)-[:FOLLOWS]->(u8);

// Zone 2 : Hyper-connexion entre 4 utilisateurs
MATCH (u9:Utilisateur {email: "isabelle.leblanc@email.com"}), 
      (u10:Utilisateur {email: "julien.morin@email.com"}),
      (u11:Utilisateur {email: "karine.dufresne@email.com"}),
      (u12:Utilisateur {email: "louis.leclerc@email.com"})
CREATE (u12)-[:FOLLOWS]->(u9),
       (u10)-[:FOLLOWS]->(u12),
       (u9)-[:FOLLOWS]->(u10),
       (u11)-[:FOLLOWS]->(u12);

       // Création des produits
CREATE (p1:Produit {id: apoc.create.uuid(), nom: 'Ordinateur Portable'}),
       (p2:Produit {id: apoc.create.uuid(), nom: 'Smartphone'}),
       (p3:Produit {id: apoc.create.uuid(), nom: 'Casque Audio'}),
       (p4:Produit {id: apoc.create.uuid(), nom: 'Clavier Mécanique'}),
       (p5:Produit {id: apoc.create.uuid(), nom: 'Souris Gamer'});

// Création des utilisateurs (à partir des emails précédents)
MATCH (u1:Utilisateur {email: "alice.martin@email.com"}), 
      (u2:Utilisateur {email: "bob.dupont@email.com"}), 
      (u3:Utilisateur {email: "charlie.durand@email.com"}), 
      (u4:Utilisateur {email: "david.leroy@email.com"}), 
      (u5:Utilisateur {email: "emma.moreau@email.com"}), 
      (u6:Utilisateur {email: "francois.leroy@email.com"}), 
      (u7:Utilisateur {email: "gabriel.joly@email.com"}), 
      (u8:Utilisateur {email: "helene.dupuis@email.com"}), 
      (u9:Utilisateur {email: "isabelle.leblanc@email.com"}), 
      (u10:Utilisateur {email: "julien.morin@email.com"}), 
      (u11:Utilisateur {email: "karine.dufresne@email.com"}), 
      (u12:Utilisateur {email: "louis.leclerc@email.com"}),
      (p1:Produit {nom: 'Ordinateur Portable'}),
      (p2:Produit {nom: 'Smartphone'}),
      (p3:Produit {nom: 'Casque Audio'}),
      (p4:Produit {nom: 'Clavier Mécanique'}),
      (p5:Produit {nom: 'Souris Gamer'})
CREATE (u1)-[:A_COMMANDÉ]->(p1 {date_achat: '2024-02-01 10:00:00'}),
       (u2)-[:A_COMMANDÉ]->(p1 {date_achat: '2024-02-02 11:30:00'}),
       (u4)-[:A_COMMANDÉ]->(p1 {date_achat: '2024-02-03 14:45:00'}),
       (u8)-[:A_COMMANDÉ]->(p1 {date_achat: '2024-02-04 16:20:00'}),
       (u9)-[:A_COMMANDÉ]->(p1 {date_achat: '2024-02-05 18:00:00'}),
       (u10)-[:A_COMMANDÉ]->(p1 {date_achat: '2024-02-06 09:10:00'}),

       (u1)-[:A_COMMANDÉ]->(p2 {date_achat: '2024-02-07 10:15:00'}),
       (u6)-[:A_COMMANDÉ]->(p2 {date_achat: '2024-02-08 11:30:00'}),
       (u8)-[:A_COMMANDÉ]->(p2 {date_achat: '2024-02-09 14:45:00'}),
       (u9)-[:A_COMMANDÉ]->(p2 {date_achat: '2024-02-10 16:20:00'}),
       (u11)-[:A_COMMANDÉ]->(p2 {date_achat: '2024-02-11 18:00:00'}),

       (u1)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-12 10:00:00'}),
       (u3)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-13 11:30:00'}),
       (u4)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-14 14:45:00'}),
       (u5)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-15 16:20:00'}),
       (u6)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-16 18:00:00'}),
       (u7)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-17 09:10:00'}),
       (u8)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-18 10:15:00'}),
       (u10)-[:A_COMMANDÉ]->(p3 {date_achat: '2024-02-19 11:30:00'}),

       (u5)-[:A_COMMANDÉ]->(p4 {date_achat: '2024-02-20 14:45:00'}),
       (u9)-[:A_COMMANDÉ]->(p4 {date_achat: '2024-02-21 16:20:00'}),
       (u11)-[:A_COMMANDÉ]->(p4 {date_achat: '2024-02-22 18:00:00'}),
       (u12)-[:A_COMMANDÉ]->(p4 {date_achat: '2024-02-23 09:10:00'}),

       (u2)-[:A_COMMANDÉ]->(p5 {date_achat: '2024-02-24 10:00:00'}),
       (u4)-[:A_COMMANDÉ]->(p5 {date_achat: '2024-02-25 11:30:00'}),
       (u6)-[:A_COMMANDÉ]->(p5 {date_achat: '2024-02-26 14:45:00'}),
       (u8)-[:A_COMMANDÉ]->(p5 {date_achat: '2024-02-27 16:20:00'}),
       (u10)-[:A_COMMANDÉ]->(p5 {date_achat: '2024-02-28 18:00:00'});