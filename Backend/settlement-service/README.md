# settlement-service (MS4)

| | |
|---|---|
| **Responsable** | Membre 4 |
| **Port** | 8084 |
| **Base de données** | PostgreSQL `settlement_db` (dédiée à ce service) |
| **Nom Eureka** | `SETTLEMENT-SERVICE` |

## Responsabilités
Dettes et leur remboursement ; orchestre la saga de paiement (idempotence).

## Interactions
- **Appel synchrone (OpenFeign)** : POST wallet-service `/api/wallets/transfers`
- **Événements publiés (RabbitMQ)** : `debt.created`, `debt.settled`, `settlement.failed`
- **Événements consommés (RabbitMQ)** : `expense.created`, `expense.cancelled`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. 

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
