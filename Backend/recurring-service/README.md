# recurring-service (MS5)

| | |
|---|---|
| **Responsable** | Membre 5 |
| **Port** | 8085 |
| **Base de données** | PostgreSQL `recurring_db` (dédiée à ce service) |
| **Nom Eureka** | `RECURRING-SERVICE` |

## Responsabilités
Modèles de dépenses récurrentes et exécutions planifiées (`@Scheduled`).

## Interactions
- **Appel synchrone (OpenFeign)** : POST expense-service `/api/expenses` (retry ×3)
- **Événements publiés (RabbitMQ)** : `recurring.triggered`, `recurring.failed`
- **Événements consommés (RabbitMQ)** : `expense.created`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. 

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
