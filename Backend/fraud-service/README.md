# fraud-service (MS7 (technologie avancée))

| | |
|---|---|
| **Responsable** | Membre 5 (pilote) + Membre 6 |
| **Port** | 8087 |
| **Base de données** | PostgreSQL `fraud_db` + **Redis** (compteurs glissants) (dédiée à ce service) |
| **Nom Eureka** | `FRAUD-SERVICE` |

## Responsabilités
Détection de fraude en temps réel : règles pondérées, score de risque, alertes, flux **SSE** pour l'admin.

## Interactions
- **Appel synchrone (OpenFeign)** : GET account-service `/api/users/{id}`
- **Événements publiés (RabbitMQ)** : `fraud.alert-raised`
- **Événements consommés (RabbitMQ)** : `wallet.debited`, `wallet.credited`, `debt.settled`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. Dépendances en plus : Spring Data Redis, Spring Web (SseEmitter).

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
