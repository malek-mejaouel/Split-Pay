# wallet-service (MS2)

| | |
|---|---|
| **Responsable** | Membre 2 |
| **Port** | 8082 |
| **Base de données** | PostgreSQL `wallet_db` (dédiée à ce service) |
| **Nom Eureka** | `WALLET-SERVICE` |

## Responsabilités
Portefeuille : solde, recharge, paiements, transferts idempotents, gel.

## Interactions
- **Appel synchrone (OpenFeign)** : GET account-service `/api/users/{id}/kyc-status`
- **Événements publiés (RabbitMQ)** : `wallet.created`, `wallet.debited`, `wallet.credited`
- **Événements consommés (RabbitMQ)** : `user.registered`, `kyc.validated`, `fraud.alert-raised`

## Création du projet (Spring Initializr)
Java 21 · Maven · Spring Boot 3.x · Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, OpenFeign, Spring for RabbitMQ, Eureka Discovery Client, Config Client, Actuator, Resilience4j, OAuth2 Resource Server, springdoc-openapi, Lombok. 

## Règles à respecter
- Montants en `BigDecimal` (jamais `double`) ; `userId` toujours lu dans le JWT.
- Consommateurs d'événements **idempotents** (table / index sur `eventId`).

## Documentation détaillée
Contrat d'API, modèle de données et diagrammes : [`Documentation/Dossier_Technique.md`](../../Documentation/Dossier_Technique.md).
