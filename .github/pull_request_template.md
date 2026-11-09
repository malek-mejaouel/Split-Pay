## Description
<!-- Que fait cette PR ? Quel microservice est concerné ? -->

## Type
- [ ] feat (nouvelle fonctionnalité)
- [ ] fix (correction)
- [ ] docs (documentation / diagrammes)
- [ ] chore (configuration, infra)

## Checklist
- [ ] Le service compile et démarre (`mvn spring-boot:run`)
- [ ] Les montants utilisent `BigDecimal` (jamais `double`)
- [ ] Les consommateurs d'événements sont idempotents (`eventId`)
- [ ] Le contrat d'API / les événements correspondent au `Documentation/Dossier_Technique.md`
- [ ] Relue par un autre membre (binômes : 1↔2, 3↔4, 5↔6)
