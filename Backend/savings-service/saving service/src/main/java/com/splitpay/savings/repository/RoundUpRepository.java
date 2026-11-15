package com.splitpay.savings.repository;

import com.splitpay.savings.entity.RoundUp;
import com.splitpay.savings.entity.RoundUpStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoundUpRepository extends JpaRepository<RoundUp, UUID> {

    Page<RoundUp> findByAccountId(UUID accountId, Pageable pageable);

    Page<RoundUp> findByAccountIdAndStatus(UUID accountId, RoundUpStatus status, Pageable pageable);

    /** Idempotence : un evenement source ne peut produire qu'un seul arrondi. */
    boolean existsBySourceEventId(UUID sourceEventId);

    List<RoundUp> findByStatus(RoundUpStatus status);
}
