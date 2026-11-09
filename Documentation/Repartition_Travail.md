# Répartition du travail – équipe SplitPay (6 membres)

> Remplacer « Membre 1 … 6 » par les noms réels avant le dépôt sur Blackboard.

## 1. Principe
- **1 membre = 1 microservice CRUD** (conception, API, base, événements, écrans Angular correspondants).
- **1 microservice à technologie avancée** : `fraud-service`, piloté par le **Membre 5** avec le **Membre 6** (leurs microservices CRUD, `recurring` et `savings`, sont les plus légers).
- **1 microservice commun** (`notification-service`) construit par toute l'équipe : chacun écrit les *listeners* des événements qu'il publie.
- **1 tâche transverse par membre** pour éviter un point de blocage unique.

> **Si la charge de M5 / M6 paraît trop forte :** option de repli = fusionner `recurring-service` dans `expense-service` (les modèles récurrents deviennent une ressource d'Expense), M5 ne garde alors que fraud-service. À décider avant la fin du Sprint 1.

## 2. Tableau de répartition

| Membre | Microservice CRUD | Tâche transverse | Écrans Angular | Contribution à notification-service |
|---|---|---|---|---|
| **Membre 1** | MS1 account-service (utilisateurs, KYC, groupes) | **Keycloak** (realm `splitpay`, rôles `STUDENT` / `ADMIN`) + sécurité JWT de la Gateway | Connexion, profil, KYC, groupes | Entité `Notification` + listeners `user.registered`, `kyc.*`, `group.member-added` |
| **Membre 2** | MS2 wallet-service | **Docker Compose** (PostgreSQL ×8, MongoDB, Redis, RabbitMQ, Mailhog, Keycloak) | Portefeuille, recharge, historique | Canal **e-mail** (JavaMailSender + Mailhog) |
| **Membre 3** | MS3 expense-service (MongoDB) | **Eureka + Config Server** + dépôt `config-repo` | Création et liste des dépenses | Listener `debt.created` ; **présente** le service commun |
| **Membre 4** | MS4 settlement-service | **Squelette Angular** (layout, routing, guards, intercepteur JWT) | Dettes, paiement en un clic | Listeners `debt.settled`, `settlement.failed` |
| **Membre 5** | MS5 recurring-service | Bibliothèque Maven **`splitpay-events`** (enveloppe + config RabbitMQ) ; **pilote de MS7 fraud-service** (règles, Redis) | Récurrences, **espace admin : alertes en direct (SSE)** | Listeners `recurring.*`, `fraud.alert-raised` |
| **Membre 6** | MS6 savings-service | **Documentation, diagrammes, README, présentation** ; **co-développeur de MS7** (alertes, SSE, API admin) | Épargne, centre de notifications | Listener `goal.reached` + API de lecture des notifications |

## 3. Présentation orale (10–15 min, chacun parle)

| Partie | Durée | Intervenant |
|---|---|---|
| Idée, problématique, acteurs, cas d'utilisation | 1 min | Membre 6 |
| Fonctionnalités + améliorations de l'idée initiale | 1 min | Membre 4 |
| Architecture globale (Gateway, Eureka, Config, Keycloak, RabbitMQ, Docker) | 1 min 30 | Membre 3 |
| Découpage en microservices + choix des bases | 1 min | Membre 2 |
| MS1 account-service | 1 min | Membre 1 |
| MS2 wallet-service | 1 min | Membre 2 |
| MS3 expense-service | 1 min | Membre 3 |
| MS4 settlement-service (+ saga du paiement) | 1 min | Membre 4 |
| MS5 recurring-service | 1 min | Membre 5 |
| MS6 savings-service | 1 min | Membre 6 |
| **MS7 fraud-service (technologie avancée)** | 1 min | Membre 5 (principe) puis Membre 6 (alertes SSE) |
| Microservice commun (notification) | 30 s | Membre 3 |
| Dépôt Git, répartition, planning, risques | 1 min | Membre 1 |
| **Total** | ≈ 12 min | |

## 4. Organisation Git
- Un dépôt public ; l'enseignant est ajouté en collaborateur.
- Branches : `main` ← `develop` ← `feature/<service>-<sujet>` ; chaque membre commit dans le dossier de **son** service.
- Pull request obligatoire, relue en binôme : 1↔2, 3↔4, 5↔6.
- Commits : `feat(wallet): add idempotent transfer`, `fix(settlement): ...`, `docs: ...`.
- **GitHub Projects** (Kanban) : un ticket par fonctionnalité, étiquette par service.

## 5. Checklist avant la validation 1 (pour chaque membre)
- [ ] Projet Spring Boot créé dans `Backend/<service>/`, **compile et démarre**
- [ ] Dépendances : Web, JPA (ou MongoDB pour expense), PostgreSQL, Validation, OpenFeign, AMQP, Eureka Client, Config Client, Actuator, Resilience4j
- [ ] Quelques commits personnels sur `develop`
- [ ] Diagramme de classes de son service prêt (1 minute de parole)
- [ ] Sait citer : 1 appel REST sync, 1 événement publié, 1 événement consommé, et le comportement si le service appelé tombe
- [ ] Sait expliquer : contexte borné, base par service, rôle de la Gateway et d'Eureka, sync vs async

## 6. Questions probables du jury
1. Pourquoi Wallet et Settlement sont-ils deux services ? Que se passe-t-il si on les fusionne ?
2. Pourquoi Expense utilise-t-il MongoDB et Wallet PostgreSQL ?
3. Si `wallet-service` tombe pendant un remboursement, que devient la dette ? Comment éviter un double débit ?
4. Pourquoi ce lien est synchrone (settlement → wallet) et celui-là asynchrone (expense → settlement) ?
5. Qu'est-ce que l'idempotence et où est-elle appliquée ?
6. Pourquoi fraud-service n'est-il pas appelé en synchrone avant chaque paiement ?
7. Pourquoi Redis dans fraud-service, alors que chaque service a « sa » base ?
8. À quoi servent Eureka, le Config Server et la Gateway ? Comment le JWT circule-t-il ?
9. Comment `savings-service` évite-t-il de traiter deux fois le même paiement ?
