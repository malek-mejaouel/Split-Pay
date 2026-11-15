package com.splitpay.savings.service;

import com.splitpay.savings.config.SavingsProperties;
import com.splitpay.savings.dto.GoalCreateRequest;
import com.splitpay.savings.dto.GoalResponse;
import com.splitpay.savings.dto.GoalUpdateRequest;
import com.splitpay.savings.dto.PageResponse;
import com.splitpay.savings.entity.GoalStatus;
import com.splitpay.savings.entity.SavingsAccount;
import com.splitpay.savings.entity.SavingsGoal;
import com.splitpay.savings.exception.BadRequestException;
import com.splitpay.savings.exception.ErrorCode;
import com.splitpay.savings.exception.GoalExceptions;
import com.splitpay.savings.mapper.SavingsGoalMapper;
import com.splitpay.savings.repository.SavingsGoalRepository;
import com.splitpay.savings.util.Money;
import com.splitpay.savings.util.SortSupport;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Objectifs d'epargne : CRUD et regles metier.
 * Toutes les operations sont limitees au compte de l'utilisateur connecte (sinon 404).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SavingsGoalService {

    /** Champs de tri autorises (liste blanche). */
    public static final Set<String> SORTABLE_FIELDS = Set.of("deadline", "targetAmount", "status");

    private final SavingsGoalRepository goalRepository;
    private final SavingsGoalMapper goalMapper;
    private final SavingsAccountService accountService;
    private final SavingsProperties properties;

    /* ===================== Commandes ===================== */

    @Transactional
    public GoalResponse createGoal(UUID userId, GoalCreateRequest request) {
        String name = trimAndValidateName(request.name());
        validateTargetAmount(request.targetAmount());

        SavingsAccount account = accountService.findOrCreateEntity(userId);
        int maxGoals = properties.getGoal().getMaxInProgressPerAccount();

        long inProgress = goalRepository.countByAccountIdAndStatus(account.getId(), GoalStatus.IN_PROGRESS);
        if (inProgress >= maxGoals) {
            throw GoalExceptions.limitReached(maxGoals);
        }
        if (goalRepository.existsByAccountIdAndNameIgnoreCase(account.getId(), name)) {
            throw GoalExceptions.nameDuplicate(name);
        }

        SavingsGoal goal = goalMapper.toEntity(request);
        goal.setAccountId(account.getId());
        goal.setName(name);
        goal.setTargetAmount(Money.normalize(request.targetAmount()));
        goal.setCurrentAmount(Money.ZERO);
        goal.setStatus(GoalStatus.IN_PROGRESS);

        SavingsGoal saved = goalRepository.save(goal);
        log.info("Objectif {} cree pour le compte {}", saved.getId(), account.getId());
        return goalMapper.toResponse(saved);
    }

    @Transactional
    public GoalResponse updateGoal(UUID userId, UUID goalId, GoalUpdateRequest request) {
        String name = trimAndValidateName(request.name());
        validateTargetAmount(request.targetAmount());

        SavingsGoal goal = loadOwnedGoal(userId, goalId);
        if (goal.getStatus() != GoalStatus.IN_PROGRESS) {
            throw GoalExceptions.notEditable(goalId);
        }
        if (request.targetAmount().compareTo(goal.getCurrentAmount()) < 0) {
            throw GoalExceptions.targetBelowCurrent();
        }
        if (goalRepository.existsByAccountIdAndNameIgnoreCaseAndIdNot(goal.getAccountId(), name, goalId)) {
            throw GoalExceptions.nameDuplicate(name);
        }

        goal.setName(name);
        goal.setTargetAmount(Money.normalize(request.targetAmount()));
        goal.setDeadline(request.deadline());

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    /** Suppression logique : passage du statut a CANCELLED. */
    @Transactional
    public void deleteGoal(UUID userId, UUID goalId) {
        SavingsGoal goal = loadOwnedGoal(userId, goalId);
        if (goal.getStatus() == GoalStatus.CANCELLED) {
            return;
        }
        goal.setStatus(GoalStatus.CANCELLED);
        goalRepository.save(goal);
        log.info("Objectif {} annule (suppression logique)", goalId);
    }

    /* ===================== Requetes ===================== */

    /**
     * Liste paginee des objectifs du compte connecte.
     * Sans filtre de statut, les objectifs CANCELLED sont exclus.
     */
    public PageResponse<GoalResponse> listGoals(UUID userId, GoalStatus status, int page, int size,
                                                String sort, String direction) {
        SavingsAccount account = accountService.findByUserId(userId).orElse(null);
        if (account == null) {
            return new PageResponse<>(List.of(), page, size, 0L, 0, true);
        }
        Pageable pageable = PageRequest.of(page, size, SortSupport.resolve(sort, direction, SORTABLE_FIELDS));
        Page<SavingsGoal> result = (status == null)
                ? goalRepository.findByAccountIdAndStatusNot(account.getId(), GoalStatus.CANCELLED, pageable)
                : goalRepository.findByAccountIdAndStatus(account.getId(), status, pageable);
        return PageResponse.of(result, goalMapper::toResponse);
    }

    public GoalResponse getGoal(UUID userId, UUID goalId) {
        return goalMapper.toResponse(loadOwnedGoal(userId, goalId));
    }

    /* ===================== Helpers ===================== */

    /**
     * Charge un objectif en verifiant qu'il appartient bien au compte de l'utilisateur :
     * un objectif d'un autre utilisateur est traite comme inexistant (404, jamais 403).
     */
    private SavingsGoal loadOwnedGoal(UUID userId, UUID goalId) {
        UUID accountId = accountService.findByUserId(userId)
                .map(SavingsAccount::getId)
                .orElseThrow(() -> GoalExceptions.notFound(goalId));
        return goalRepository.findByIdAndAccountId(goalId, accountId)
                .orElseThrow(() -> GoalExceptions.notFound(goalId));
    }

    /** Trim automatique puis revalidation metier du nom. */
    private String trimAndValidateName(String rawName) {
        String name = rawName == null ? null : rawName.trim();
        if (name == null || name.isEmpty()) {
            throw new BadRequestException(ErrorCode.VALIDATION_ERROR, "Le nom de l'objectif est obligatoire.");
        }
        return name;
    }

    /** Revalidation metier du montant cible. */
    private void validateTargetAmount(BigDecimal targetAmount) {
        if (!Money.isValidAmount(targetAmount)) {
            throw BadRequestException.invalidAmount(
                    "Le montant cible doit etre strictement positif et comporter au maximum 2 decimales.");
        }
    }
}
