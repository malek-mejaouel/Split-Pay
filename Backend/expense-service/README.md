# expense-service (MS3)

| | |
|---|---|
| **Responsable** | Membre 3 |
| **Port** | 8083 |
| **Base de données** | **MongoDB** `expense_db` (dédiée à ce service) |
| **Nom Eureka** | `EXPENSE-SERVICE` |

## Responsabilités
Dépenses partagées et parts de chacun (documents imbriqués).

## Interactions
- **Appel synchrone (OpenFeign)** : GET account-service `/api/groups/{id}/members`
- **Événements publiés (RabbitMQ)** : `expense.created`, `expense.cancelled`
- **Événements consommés (RabbitMQ)** : `debt.settled`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data MongoDB, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. Spring Data MongoDB à la place de JPA/PostgreSQL.

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
