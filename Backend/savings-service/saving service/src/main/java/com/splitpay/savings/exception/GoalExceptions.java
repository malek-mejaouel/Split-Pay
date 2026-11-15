package com.splitpay.savings.exception;

import java.util.UUID;

/**
 * Regles metier dediees aux objectifs d'epargne.
 */
public final class GoalExceptions {

    private GoalExceptions() {
    }

    /** L'objectif n'est plus modifiable (statut different de IN_PROGRESS). */
    public static ConflictException notEditable(UUID goalId) {
        return new ConflictException(ErrorCode.GOAL_NOT_EDITABLE,
                "L'objectif " + goalId + " n'est plus modifiable (statut different de IN_PROGRESS).");
    }

    /** Un objectif portant le meme nom existe deja pour ce compte. */
    public static ConflictException nameDuplicate(String name) {
        return new ConflictException(ErrorCode.GOAL_NAME_DUPLICATE,
                "Un objectif nomme '" + name + "' existe deja pour ce compte.");
    }

    /** Nombre maximum d'objectifs en cours atteint. */
    public static ConflictException limitReached(int max) {
        return new ConflictException(ErrorCode.GOAL_LIMIT_REACHED,
                "Le nombre maximum d'objectifs en cours (" + max + ") est atteint.");
    }

    /** Le montant cible ne peut pas etre inferieur au montant deja epargne. */
    public static BadRequestException targetBelowCurrent() {
        return new BadRequestException(ErrorCode.TARGET_BELOW_CURRENT,
                "Le montant cible ne peut pas etre inferieur au montant deja epargne (currentAmount).");
    }

    public static ResourceNotFoundException notFound(UUID goalId) {
        return new ResourceNotFoundException("Aucun objectif d'epargne trouve avec l'identifiant " + goalId + ".");
    }
}
