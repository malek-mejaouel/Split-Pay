# Diagrammes

| Fichier | Contenu |
|---|---|
| `img/01_architecture_globale.png` / `.svg` | Architecture globale (vue d'ensemble, même style que le sujet du cours) |
| `img/02_cas_utilisation.png` | Acteurs et cas d'utilisation |
| `img/03_decoupage_microservices.png` | Contextes bornés et appels synchrones |
| `img/04_evenements_rabbitmq.png` | Événements publiés / consommés |
| `img/10_` à `17_classes_*.png` | Diagramme de classes de chaque service |
| `img/20_` à `24_seq_*.png` | Diagrammes de séquence (dépense, paiement, loyer, arrondi, fraude) |
| `img/30_deploiement_docker.png` | Déploiement Docker Compose |

Les sources sont dans `src/` : Mermaid (`.mmd`) pour les diagrammes UML et séquences, SVG (+ script Python) pour l'architecture globale.
Régénérer un diagramme Mermaid : `mmdc -i src/<fichier>.mmd -o img/<fichier>.png -s 2 -b white`
