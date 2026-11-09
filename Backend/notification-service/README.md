# notification-service (MS8 (commun))

| | |
|---|---|
| **Responsable** | Équipe (présenté par Membre 3) |
| **Port** | 8088 |
| **Base de données** | PostgreSQL `notification_db` (dédiée à ce service) |
| **Nom Eureka** | `NOTIFICATION-SERVICE` |

## Responsabilités
Notifications in-app et e-mail issues des événements métier.

## Interactions
- **Appel synchrone (OpenFeign)** : GET account-service `/api/users/{id}/contact`
- **Événements publiés (RabbitMQ)** : – (écriture en base)
- **Événements consommés (RabbitMQ)** : `user.registered`, `kyc.*`, `group.member-added`, `debt.created`, `debt.settled`, `settlement.failed`, `recurring.*`, `goal.reached`, `fraud.alert-raised`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. 

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
