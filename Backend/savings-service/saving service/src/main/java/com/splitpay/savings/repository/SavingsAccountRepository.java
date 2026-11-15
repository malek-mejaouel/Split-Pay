package com.splitpay.savings.repository;

import com.splitpay.savings.entity.SavingsAccount;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavingsAccountRepository extends JpaRepository<SavingsAccount, UUID> {

    Optional<SavingsAccount> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
