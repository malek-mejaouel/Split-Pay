# savings-service (MS6)

| | |
|---|---|
| **Responsable** | Membre 6 |
| **Port** | 8086 |
| **Base de données** | PostgreSQL `savings_db` (dédiée à ce service) |
| **Nom Eureka** | `SAVINGS-SERVICE` |

## Responsabilités
Arrondi automatique, compte d'épargne, objectifs.

## Interactions
- **Appel synchrone (OpenFeign)** : POST wallet-service `/api/wallets/transfers` (type ROUNDUP)
- **Événements publiés (RabbitMQ)** : `roundup.saved`, `goal.reached`
- **Événements consommés (RabbitMQ)** : `wallet.debited`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. 

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
