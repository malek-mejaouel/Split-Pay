# Frontend – Angular

Application Angular (SPA) qui n'appelle que l'**API Gateway** (`http://localhost:8080`).

## Initialisation
```bash
npm install -g @angular/cli
ng new splitpay-web --routing --style=scss   # à lancer dans Frontend/
cd splitpay-web
ng add @angular/material
npm install keycloak-js keycloak-angular rxjs
```

## Organisation proposée
```
src/app/
├── core/        # guards, intercepteur JWT, services de base (Membre 4)
├── shared/      # composants communs (montants, listes, dialogues)
├── features/
│   ├── account-groups/      # Membre 1 : connexion, profil, KYC, groupes
│   ├── wallet/              # Membre 2
│   ├── expenses/            # Membre 3
│   ├── debts/               # Membre 4 : paiement en un clic
│   ├── recurring/           # Membre 5
│   ├── savings-notifications/ # Membre 6
│   └── admin/               # Membres 1 + 5 : KYC, règles, alertes de fraude en direct (EventSource / SSE)
└── environments/
```
