# Backend

Un projet Maven par microservice, plus l'infrastructure Spring Cloud.

| Dossier | Rôle | Port |
|---|---|---|
| `api-gateway/` | Spring Cloud Gateway | 8080 |
| `eureka-server/` | Annuaire de services | 8761 |
| `config-server/` | Configuration centralisée | 8888 |
| `account-service/` | MS1 – utilisateurs, KYC, groupes | 8081 |
| `wallet-service/` | MS2 – portefeuille | 8082 |
| `expense-service/` | MS3 – dépenses (MongoDB) | 8083 |
| `settlement-service/` | MS4 – dettes et remboursement | 8084 |
| `recurring-service/` | MS5 – dépenses récurrentes | 8085 |
| `savings-service/` | MS6 – épargne par arrondi | 8086 |
| `fraud-service/` | MS7 – détection de fraude (technologie avancée) | 8087 |
| `notification-service/` | MS8 – commun | 8088 |
| `splitpay-events/` | Bibliothèque partagée des événements | – |
