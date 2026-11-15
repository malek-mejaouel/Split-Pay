package com.splitpay.savings.mapper;

import com.splitpay.savings.dto.SavingsAccountResponse;
import com.splitpay.savings.entity.SavingsAccount;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SavingsAccountMapper {

    SavingsAccountResponse toResponse(SavingsAccount account);
}
