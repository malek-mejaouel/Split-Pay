package com.splitpay.savings.repository;

import com.splitpay.savings.entity.GoalStatus;
import com.splitpay.savings.entity.SavingsGoal;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {

    Optional<SavingsGoal> findByIdAndAccountId(UUID id, UUID accountId);

    Page<SavingsGoal> findByAccountId(UUID accountId, Pageable pageable);

    Page<SavingsGoal> findByAccountIdAndStatus(UUID accountId, GoalStatus status, Pageable pageable);

    Page<SavingsGoal> findByAccountIdAndStatusNot(UUID accountId, GoalStatus status, Pageable pageable);

    long countByAccountIdAndStatus(UUID accountId, GoalStatus status);

    boolean existsByAccountIdAndNameIgnoreCase(UUID accountId, String name);

    boolean existsByAccountIdAndNameIgnoreCaseAndIdNot(UUID accountId, String name, UUID id);
}
