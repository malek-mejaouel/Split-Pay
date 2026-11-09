# account-service (MS1)

| | |
|---|---|
| **Responsable** | Membre 1 |
| **Port** | 8081 |
| **Base de données** | PostgreSQL `account_db` (dédiée à ce service) |
| **Nom Eureka** | `ACCOUNT-SERVICE` |

## Responsabilités
Utilisateurs (profil), vérification KYC, groupes de colocation et membres.

## Interactions
- **Appel synchrone (OpenFeign)** : GET wallet-service `/api/wallets/by-user/{id}`
- **Événements publiés (RabbitMQ)** : `user.registered`, `kyc.validated`, `kyc.rejected`, `group.member-added`
- **Événements consommés (RabbitMQ)** : `wallet.created`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. 

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
